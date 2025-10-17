/**
 * Cards API Routes - Firebase Version
 * Uses Firestore instead of SQLite
 */

import express from 'express';
import { getCardByCert, upsertCard, getCache, setCache, getMarketplaceCards, getAllUsers} from '../services/firebaseDb.js';



const router = express.Router();

// GET /api/cards - list marketplace cards 
router.get('/', async (req, res) => {
  console.log('\n📚 Listing marketplace cards (aggregated from users) ...');
  try {
    console.log('[cards] calling getMarketplaceCards...');
    const entries = await getMarketplaceCards({ limit: 200 });
    console.log('[cards] got entries:', entries.length);

    const enriched = await Promise.all(
      entries.map(async (entry) => {
        try {
          const cacheKey = `card:${entry.cert_number}`;
          const cached = await getCache(cacheKey, 3600); // 1h TTL

          if (cached) {
            return {
              cert_number: entry.cert_number,
              sellerName: entry.sellerEmail,
              sellerEmail: entry.sellerEmail,
              sellerId: entry.sellerId,
              card_name: cached.card_name || cached.psa?.cardName || null,
              image_url: cached.image_url || cached.images?.displayImage || null,
              set_name: cached.set_name || cached.psa?.setName || null,
              listing_price: entry.listing_price ?? null,
              status: entry.status || 'display',
              last_known_price: cached.last_known_price || null,
              average_sell_price: cached.average_sell_price || null,
              psa: cached.psa || null,
              source: 'cache',
            };
          }

          // Fallback when no cached metadata — still return the listing row
          return {
            cert_number: entry.cert_number,
            sellerName: entry.sellerEmail,
            sellerEmail: entry.sellerEmail,
            sellerId: entry.sellerId,
            card_name: null,
            image_url: null,
            set_name: null,
            listing_price: entry.listing_price ?? null,
            status: entry.status || 'display',
            last_known_price: null,
            average_sell_price: null,
            psa: null,
            source: 'listing',
          };
        } catch (e) {
          console.warn('Entry enrichment failed for', entry.cert_number, e.message || e);
          return {
            cert_number: entry.cert_number,
            sellerName: entry.sellerEmail,
            sellerEmail: entry.sellerEmail,
            sellerId: entry.sellerId,
            listing_price: entry.listing_price ?? null,
            status: entry.status || 'display',
            last_known_price: null,
            average_sell_price: null,
            psa: null,
            source: 'error',
          };
        }
      })
    );

    const only = (req.query.only || '').toLowerCase();
    return res.json(only === 'listed' ? enriched.filter(x => x.status === 'listed') : enriched);
  } catch (error) {
    console.error('❌ Marketplace list error:', error?.stack || error?.message || error);
    return res.status(500).json({ error: 'Failed to list marketplace cards' });
  }
});

// GET /api/cards/ownedCards - get users own cards
router.get('/ownedCards', async (req, res) => {
  try {
    const users = await getAllUsers();
    
  } catch (error) {
    console.log(error);
  }
})


// GET /api/cards/:cert - get card details with caching
router.get('/:cert', async (req, res) => {
  const cert = req.params.cert;
  console.log(`\n🔍 Fetching card details for cert: ${cert}`);
  
  try {
    // Check cache first
    const cacheKey = `card:${cert}`;
    const cached = await getCache(cacheKey, 300);
    
    if (cached) {
      console.log(`✅ Returning cached data for cert: ${cert}`);
      return res.json({ source: 'cache', ...cached });
    }

    // Get card from Firebase
    console.log(`📱 Checking Firebase for cert: ${cert}`);
    const card = await getCardByCert(cert);
    
    if (!card) {
      console.warn(`⚠️  Card not found in Firebase: ${cert}`);
      return res.status(404).json({ error: 'Card not found in database' });
    }
    
    console.log(`✅ Found card in Firebase: ${card.card_name}`);

        // Prepare response
    const payload = {
      cert_number: cert,
      ...card,
      psa: {
        cardName: card.card_name,
        setName: card.set_name,
        grade: card.psa_grade,
        imageUrl: card.image_url,
        series: card.series,
      },
      image_url: card.image_url,
      last_known_price: card.last_known_price,
    };

    // Discover seller via listings subcollection (preferred)
    try {
      const { getFirestore } = await import('../services/firebase.js');
      const db = getFirestore();

      const listingSnap = await db
        .collectionGroup('listings')
        .where('cert_number', '==', cert)
        .where('status', '==', 'listed')
        .limit(1)
        .get();

      if (!listingSnap.empty) {
        const listing = listingSnap.docs[0].data();
        payload.sellerEmail = listing.sellerEmail || null;
        payload.sellerId = listing.sellerId || null;
      } else {
        payload.sellerEmail = null;
        payload.sellerId = null;
      }
    } catch (e) {
      console.warn('Failed to find seller for cert', cert, e.message || e);
      // keep payload as-is if lookup fails
      payload.sellerEmail = payload.sellerEmail || null;
      payload.sellerId = payload.sellerId || null;
    }

    // Cache the result (with seller info attached)
    await setCache(cacheKey, payload);

    res.json({ source: 'live', ...payload });

    
  } catch (error) {
    console.error('❌ Card fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch card data' });
  }
});

// PUT /api/cards/:cert - update card
router.put('/:cert', async (req, res) => {
  const cert = req.params.cert;
  console.log(`\n✏️  Updating card: ${cert}`);
  
  try {
    const updatedCard = await upsertCard({
      cert_number: cert,
      ...req.body,
    });
    
    console.log(`✅ Card updated: ${cert}`);
    res.json(updatedCard);
  } catch (error) {
    console.error('❌ Update error:', error.message);
    res.status(500).json({ error: 'Failed to update card' });
  }
});


// POST /api/cards/:cert/list  -> directed from Profile.vue once user click submit and update status as "listed"
router.post('/:cert/list', async (req, res) => {
  const cert = String(req.params.cert);
  const { sellerEmail, sellerId, price, description = '', delivery = 'meetup' } = req.body || {};

  if (!sellerEmail || !sellerId || !price) {
    return res.status(400).json({ error: 'sellerEmail, sellerId, and price are required' });
  }

  try {
    const { getFirestore } = await import('../services/firebase.js');
    const db = getFirestore();

    // write to users/{sellerId}/listings/{cert}
    const ref = db.collection('users').doc(sellerId).collection('listings').doc(cert);
    await ref.set({
      cert_number: cert,
      sellerEmail,
      sellerId,
      listing_price: Number(price),
      description,
      delivery,
      status: 'listed',
      updated_at: new Date().toISOString(),
    }, { merge: true });

    // (optional) warm cache: card:cert already handled by GET/:cert
    return res.json({ ok: true });
  } catch (e) {
    console.error('Failed to list card', cert, e.message || e);
    return res.status(500).json({ error: 'Failed to list card' });
  }
});


// POST /api/cards/:cert/undo -> mark listing as "display"
router.post('/:cert/undo', async (req, res) => {
    const cert = String(req.params.cert);
    const { sellerEmail, sellerId } = req.body || {};
    if (!sellerId) {
    return res.status(400).json({ error: 'sellerId is required' });
    }

    try {
    const { getFirestore } = await import('../services/firebase.js');
    const db = getFirestore();

    const ref = db.collection('users').doc(sellerId).collection('listings').doc(cert);
    const snap = await ref.get();
    if (!snap.exists) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    // (optional) soft ownership check
    const l = snap.data();
    if (sellerEmail && l?.sellerEmail && l.sellerEmail !== sellerEmail) {
      return res.status(403).json({ error: 'Not owner of listing' });
    }

    await ref.set({
      status: 'display',
      updated_at: new Date().toISOString(),
    }, { merge: true });

    return res.json({ ok: true });
  } catch (e) {
    console.error('Failed to undo listing', cert, e.message || e);
    return res.status(500).json({ error: 'Failed to undo listing' });
  }
});

export default router;

