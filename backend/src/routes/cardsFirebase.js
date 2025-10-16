/**
 * Cards API Routes - Firebase Version
 * Uses Firestore instead of SQLite
 */

import express from 'express';
import { getAllCards, getCardByCert, upsertCard, getCache, setCache, getMarketplaceCards } from '../services/firebaseDb.js';



const router = express.Router();

// GET /api/cards - list marketplace cards (excluding caller)
router.get('/', async (req, res) => {
  console.log('\n📚 Listing marketplace cards (aggregated from users) ...');


  try {
    // Try to detect caller email from auth middleware (if you later attach auth)
    // Allow override via ?excludeEmail= for testing
    const excludeEmail = req.query.excludeEmail || (req.user && req.user.email) || null;

    // Get simple marketplace entries: { cert_number, sellerId, sellerEmail }
    const entries = await getMarketplaceCards({ excludeEmail, limit: 200 });

    // Now optionally enrich entries with cached card payload (avoid heavy external calls)
    // We try to read the cached payload from api_cache (if you used setCache with 'card:cert')
    const enrichedPromises = entries.map(async (entry) => {
      try {
        const cacheKey = `card:${entry.cert_number}`;
        const cached = await getCache(cacheKey, 3600); // 1 hour TTL for listing
        if (cached) {
          return {
            cert_number: entry.cert_number,
            sellerName: entry.sellerEmail, 
            sellerEmail: entry.sellerEmail,
            sellerId: entry.sellerId,
            card_name: cached.card_name || cached.psa?.cardName || null,
            image_url: cached.image_url || (cached.images && cached.images.displayImage) || null,
            set_name: cached.set_name || cached.psa?.setName || null,
            listing_price: entry.listing_price ?? null,
            last_known_price: cached.last_known_price || null,
            average_sell_price: cached.average_sell_price || null,
            psa: cached.psa || null,
            source: 'cache'
          };
        }

        // If no cache, try to read a potential cards collection doc (if you previously stored card docs)
        const doc = await (await import('../services/firebase.js')).getFirestore()
                    .collection('cards')
                    .where('cert_number', '==', entry.cert_number)
                    .limit(1)
                    .get();

        if (!doc.empty) {
          const d = doc.docs[0].data();
          return {
            cert_number: entry.cert_number,
            sellerName: entry.sellerEmail, 
            sellerEmail: entry.sellerEmail,
            sellerId: entry.sellerId,
            card_name: d.card_name || null,
            image_url: d.image_url || null,
            set_name: d.set_name || null,
            listing_price: entry.listing_price ?? null,
            last_known_price: d.last_known_price || null,
            average_sell_price: d.average_sell_price || null,
            psa: {
              cardName: d.card_name,
              grade: d.psa_grade
            },
            source: 'db'
          };
        }

        // Minimal placeholder if no cache and no cards doc
        return {
          cert_number: entry.cert_number,
          sellerName: entry.sellerEmail, 
          sellerEmail: entry.sellerEmail,
          sellerId: entry.sellerId,
          card_name: null,
          image_url: null,
          set_name: null,
          listing_price: entry.listing_price ?? null,
          last_known_price: null,
          average_sell_price: null,
          psa: null,
          source: 'minimal'
        };
      } catch (e) {
        console.warn('Entry enrichment failed for', entry.cert_number, e.message || e);
        return { cert_number: entry.cert_number, sellerName: entry.sellerEmail,  sellerEmail: entry.sellerEmail, sellerId: entry.sellerId, source: 'error' };
      }
    });

    const enriched = await Promise.all(enrichedPromises);

    res.json(enriched);

  } catch (error) {
    console.error('❌ Marketplace list error:', error?.stack || error?.message || error);
    res.status(500).json({ error: 'Failed to list marketplace cards' });
  }
});


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
        .where('status', '==', 'active')
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

export default router;

