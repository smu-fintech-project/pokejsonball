/**
 * Cards API Routes - Firebase Version
 * Uses Firestore instead of SQLite
 */

import express from 'express';
import { getAllCards, getCardByCert, upsertCard, getCache, setCache } from '../services/firebaseDb.js';

const router = express.Router();

// GET /api/cards - list cards
router.get('/', async (req, res) => {
  console.log('\n📚 Listing all cards from Firebase...');
  
  try {
    const cards = await getAllCards(200);
    console.log(`✅ Found ${cards.length} cards`);
    res.json(cards);
  } catch (error) {
    console.error('❌ List cards error:', error.message);
    res.status(500).json({ error: 'Failed to list cards' });
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

    // Cache the result
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

