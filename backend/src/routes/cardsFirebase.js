/**
     * Cards API Routes - Firebase Version
     * Uses Firestore instead of SQLite
     */
    
    import express from 'express';
    // --- UPDATED IMPORT ---
    // Added 'clearCache' to the import list
    import { 
      getCardByCert, 
      upsertCard, 
      getCache, 
      setCache, 
      clearCache, 
      getMarketplaceCards, 
      getAllUsers, 
      getAllCards, 
      getImageSignedUrl
    } from '../services/firebaseDb.js';
    
    
    
    const router = express.Router();
    
    // GET /api/cards - (No changes needed here)
    router.get('/', async (req, res) => {
      console.log('\n📚 Listing cards (users → listings → cards)…');
    
      try {
        // 1) Check cache first
        const cacheKey = 'marketplace:all-listed';
        const cached = await getCache(cacheKey, 60); // Cache for 60 seconds
        if (cached) {
          console.log(`[cards] returning ${cached.length} cached listed cards`);
          return res.json(cached);
        }
    
        // 2) Load all users and all cards once (Original slow logic)
        const [users, cards] = await Promise.all([
          getAllUsers(500),   
          getAllCards(5000)
        ]);
    
        // 2) Build a quick lookup: cert_number -> full card doc
        const cardByCert = new Map();
        for (const c of cards) {
          // cert_number lives inside the card doc payload
          const cert = String(c.cert_number || '');
          if (!cert) continue;
          cardByCert.set(cert, c);
        }
    
        // 3) For each user, fetch their 'listings' with status === 'listed'
        const { getFirestore } = await import('../services/firebase.js');
        const db = getFirestore();
    
        const perUserPromises = users.map(async (u) => {
          const userId = u.id;
          if (!userId) return [];
          const snap = await db
            .collection('users')
            .doc(userId)
            .collection('listings')
            .where('status', '==', 'listed')
            .get();
    
          const out = [];
          snap.forEach(doc => {
            const l = doc.data();
            if (!l) return;
    
            const cert = String(l.cert_number || '');
            if (!cert) return;
    
            const card = cardByCert.get(cert) || {}; // full card doc if exists
    
            // 4) Merge listing info + full card fields
            out.push({
              // listing fields (marketplace needs these)
              cert_number: cert,
              sellerId: l.sellerId || userId,
              sellerName: l.sellerName || userId,
              sellerEmail: l.sellerEmail || u.email || null,
              listing_price: typeof l.listing_price === 'number' ? l.listing_price : null,
              status: l.status || 'display',
              description: l.description || '', 
               delivery: l.delivery || 'meetup',
              
              
    
              // full card fields (so we can build more features later)
              card_name: card.card_name ?? null,
              card_number: card.card_number ?? null,
              category: card.category ?? null,
              cert_date: card.cert_date ?? null,
              created_at: card.created_at ?? null,
              grade_description: card.grade_description ?? null,
              image_back_url: card.image_back_url ?? null,
              image_url: card.image_url ?? null,
              label_type: card.label_type ?? null,
              last_sale_date: card.last_sale_date ?? null,
              last_sale_listing_url: card.last_sale_listing_url ?? null,
              last_sale_market: card.last_sale_market ?? null,
              last_sale_price: card.last_sale_price ?? null,
              last_sale_source: card.last_sale_source ?? null,
              psa_grade: card.psa_grade ?? null,
              psa_pop_higher: card.psa_pop_higher ?? null,
              psa_population: card.psa_population ?? null,
              release_year: card.release_year ?? null,
              reverse_barcode: card.reverse_barcode ?? null,
              set_name: card.set_name ?? null,
              updated_at: card.updated_at ?? null,
              variety: card.variety ?? null,
              variety_pedigree: card.variety_pedigree ?? null,
              year: card.year ?? null,
              
    
              // optional convenience sub-object (unchanged UI can still read .psa?.grade)
              psa: {
                cardName: card.card_name ?? null,
                setName: card.set_name ?? null,
                grade: card.psa_grade ?? null,
                imageUrl: card.image_url ?? null
              },
    
              // keep one more helpful field if you’ve cached averages onto cards:
              average_sell_price: card.average_sell_price ?? null,
    
              source: 'joined'
            });
          });
    
          return out;
        });
    
        // 5) Flatten
        const allListed = (await Promise.all(perUserPromises)).flat();
        const only = (req.query.only || '').toLowerCase();
        const result = only === 'listed' ? allListed : allListed;
    // 3) Save the final result to the cache
        await setCache(cacheKey, result);
    
        console.log(`[cards] returning ${result.length} listed cards (from live query)`);
        return res.json(result);
      } catch (error) {
        console.error('❌ Marketplace list error:', error?.stack || error?.message || error);
        return res.status(500).json({ error: 'Failed to list marketplace cards' });
      }
    });
    
    
    // GET /api/cards/ownedCards?email=<userEmail> - (No changes needed here)
    router.get('/ownedCards', async (req, res) => {
      try {
        const email = (req.query.email || '').trim()
        if (!email) {
          return res.status(400).json({ error: 'email query param is required' })
        }
    
        // 1) Find the current user by email
        const users = await getAllUsers()
        const me = users.find(u => (u.email || u.userEmail) === email)
        if (!me) {
          // no such user in users collection -> return empty set
          return res.json([])
        }
    
        // 2) Read this user's listings (ownership lives here)
        const { getFirestore } = await import('../services/firebase.js')
        const db = getFirestore()
        const listingsSnap = await db
          .collection('users')
          .doc(me.id)
          .collection('listings')
          .get()
    
        const listings = []
        listingsSnap.forEach(d => {
          const l = d.data()
          if (!l) return
          listings.push({
            cert_number: String(l.cert_number),
            sellerId: l.sellerId || me.id,
            sellerEmail: l.sellerEmail || email,
            sellerName: l.sellerName || me.name || me.id,
            listing_price: typeof l.listing_price === 'number' ? l.listing_price : null,
            status: l.status || 'display'
          })
        })
    
        if (!listings.length) {
          return res.json([])
        }
        // 3) Join with cards for display fields (return full card fields)
      const cards = await getAllCards(1000) // unchanged
      const byCert = new Map(cards.map(c => [String(c.cert_number), c]))
    
      const owned = listings.map(l => {
      const c = byCert.get(l.cert_number) || {}
    
      // Build psa object from either c.psa or c.psa_grade
      const psaObj = c.psa || (typeof c.psa_grade !== 'undefined' ? { grade: c.psa_grade } : null)
    
      return {
        // --- Listing (ownership) fields ---
        cert_number: l.cert_number,
        sellerEmail: l.sellerEmail,
        sellerName: l.sellerName,
        sellerId: l.sellerId,
        listing_price: l.listing_price,
        status: l.status,
    
        // --- Full card fields (pass-through; default to null if missing) ---
        card_name: c.card_name ?? null,
        card_number: c.card_number ?? null,
        category: c.category ?? null,
        cert_date: c.cert_date ?? null,
        // cert_number already included from listing
        created_at: c.created_at ?? null,
        grade_description: c.grade_description ?? null,
        image_back_url: c.image_back_url ?? null,
        image_url: c.image_url ?? null,
        label_type: c.label_type ?? null,
        last_sale_date: c.last_sale_date ?? null,
        last_sale_listing_url: c.last_sale_listing_url ?? null,
        last_sale_market: c.last_sale_market ?? null,
        last_sale_price: c.last_sale_price ?? null,
        last_sale_source: c.last_sale_source ?? null,
        psa_grade: c.psa_grade ?? null,
        psa_pop_higher: c.psa_pop_higher ?? null,
        psa_population: c.psa_population ?? null,
        release_year: c.release_year ?? null,
        reverse_barcode: c.reverse_barcode ?? null,
        set_name: c.set_name ?? null,
        updated_at: c.updated_at ?? null,
        variety: c.variety ?? null,
        variety_pedigree: c.variety_pedigree ?? null,
        year: c.year ?? null,
    
        // Keep helpful extras if you had them elsewhere
        last_known_price: c.last_known_price ?? null,
        average_sell_price: c.average_sell_price ?? null,
        // Normalized psa object for UI convenience
        psa: psaObj
      }
    })
        
    return res.json(owned)
      } catch (error) {
        console.error('ownedCards error:', error?.message || error)
        return res.status(500).json({ error: 'Failed to load owned cards' })
      }
    })
    
    // GET /api/cards/:cert - (No changes needed here)
    router.get('/:cert', async (req, res) => {
      const cert = req.params.cert;
      console.log(`\n🔍 Fetching card details for cert: ${cert}`);
      
      try {
        // Check cache first
        const cacheKey = `card:${cert}`;
        const cached = await getCache(cacheKey, 3600);
        
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
    
          // Use simpler query without status filter to avoid index requirement
          // Then filter in JavaScript
          const listingSnap = await db
            .collectionGroup('listings')
            .where('cert_number', '==', cert)
            .limit(5) // Get a few in case some are inactive
            .where('status', '==', 'listed')
            .limit(1)
            .get();
    
          if (!listingSnap.empty) {
            // Find the first active listing
            const activeListing = listingSnap.docs.find(doc => {
              const data = doc.data();
              return data.status === 'active' || !data.status; // treat missing status as active
            });
            
            if (activeListing) {
              const listing = activeListing.data();
              payload.sellerEmail = listing.sellerEmail || null;
              
              payload.sellerId = listing.sellerId || null;
              console.log(`   ✅ Found seller: ${listing.sellerEmail} (${listing.sellerId})`);
            } else {
              // No active listing found
              payload.sellerEmail = null;
              payload.sellerId = null;
              console.log(`   ⚠️  No active listing found for cert ${cert}`);
            }
          } else {
            payload.sellerEmail = null;
            payload.sellerId = null;
            console.log(`   ⚠️  No listings found for cert ${cert}`);
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
    
        // --- ADDED ---
        // This is also a 'write', so we should clear this card's cache.
        try {
          await clearCache(`card:${cert}`);
          // Note: This update might also affect 'ownedCards' or 'marketplace',
          // but without the sellerEmail, we can't safely clear those.
          // Clearing the card's main cache is the most important part.
        } catch (cacheError) {
          console.warn(`[cards] Failed to clear cache for PUT ${cert}:`, cacheError.message);
        }
        // --- END ADDED ---
        
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

  try {
      const cardKey = `card:${cert}`;
      const marketplaceKey = 'marketplace:all-listed';

      await Promise.all([
        // The ownedCards cache is gone, so we don't clear it
        clearCache(cardKey),         
        clearCache(marketplaceKey)   
      ]);
      
      console.log(`[Cache] Cleared caches for LIST: ${cardKey}, ${marketplaceKey}`);
    } catch (cacheError) {
      console.warn(`[cards] Failed to clear caches for ${sellerEmail}:`, cacheError.message);
    }

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


  try {
        const clearPromises = [
          clearCache(`card:${cert}`),
          clearCache('marketplace:all-listed')
        ];
        
        await Promise.all(clearPromises);
        console.log(`[cards] Cleared caches for undo: ${sellerEmail}, ${cert}`);
  
      } catch (cacheError) {
        console.warn(`[cards] Failed to clear caches for undo:`, cacheError.message);
      }

      return res.json({ ok: true });
    } catch (e) {
      console.error('Failed to undo listing', cert, e.message || e);
      return res.status(500).json({ error: 'Failed to undo listing' });
    }
});

// ========== GET /api/cards/images/avatar/:filename - Serve avatar images ==========
router.get('/images/avatar/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    // Get signed URL from Firebase Storage (folder, filename as separate params)
    const signedUrl = await getImageSignedUrl('avatar', filename);
    
    if (!signedUrl) {
      return res.status(404).json({ error: 'Avatar not found' });
    }

    // Redirect to the signed URL
    res.redirect(signedUrl);
  } catch (error) {
    console.error('❌ Error serving avatar:', error);
    res.status(500).json({ error: 'Failed to load avatar' });
  }
});
    
    export default router;