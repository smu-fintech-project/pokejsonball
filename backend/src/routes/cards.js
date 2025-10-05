import express from 'express';
import axios from 'axios';
import { getDb, getCache, setCache } from '../db.js';

const router = express.Router();

// GET /api/cards - list cards (basic marketplace)
router.get('/', async (req, res) => {
  console.log('\n📋 Listing all cards...');
  try {
    const db = getDb();
    const rows = db.prepare(
      'SELECT id, cert_number, card_name, set_name, psa_grade, release_year, pokemon_tcg_id, series, image_url, last_known_price FROM cards ORDER BY id LIMIT 200'
    ).all();
    console.log(`✅ Found ${rows.length} cards`);
    res.json(rows);
  } catch (e) {
    console.error('❌ List cards error:', {
      message: e.message,
      stack: e.stack
    });
    res.status(500).json({ error: 'Failed to list cards' });
  }
});

// GET /api/cards/:cert - details via PSA + PokemonTCG, with caching
router.get('/:cert', async (req, res) => {
  const cert = req.params.cert;
  console.log(`\n🔍 Fetching card details for cert: ${cert}`);
  
  try {
    const db = getDb();
    const cacheKey = `card:${cert}`;
    const cached = getCache(cacheKey, 300);
    
    if (cached) {
      console.log(`✅ Returning cached data for cert: ${cert}`);
      return res.json({ source: 'cache', ...cached });
    }

    // Check if card exists in database
    console.log(`📊 Checking database for cert: ${cert}`);
    const dbCard = db.prepare('SELECT * FROM cards WHERE cert_number = ?').get(cert);
    
    if (!dbCard) {
      console.warn(`⚠️  Card not found in database: ${cert}`);
      return res.status(404).json({ error: 'Card not found in database' });
    }
    
    console.log(`✅ Found card in database: ${dbCard.card_name}`);

    // PSA API
    // Note: PSA public API documentation is limited/unavailable
    // The API may require special access or different authentication
    // For now, we'll try common endpoint patterns and fall back to database values
    let psa = {};
    let cardName = dbCard.card_name;
    let setName = dbCard.set_name;
    let imageUrl = dbCard.image_url;
    let series = dbCard.series;

    if (process.env.PSA_API_KEY && process.env.PSA_API_KEY.length > 10) {
      try {
        console.log(`📡 Fetching PSA images for cert: ${cert}`);
        
        // Correct PSA API endpoint for images
        const psaEndpoint = `https://api.psacard.com/publicapi/cert/GetImagesByCertNumber/${cert}`;
        
        const psaResp = await axios.get(psaEndpoint, {
          headers: { 
            'Authorization': `Bearer ${process.env.PSA_API_KEY}`,
            'Accept': 'application/json',
          },
          timeout: 10000
        });
        
        console.log(`✅ PSA API success, received ${Array.isArray(psaResp.data) ? psaResp.data.length : 1} images`);
        
        // PSA returns array of images: [{ ImageURL: "...", IsFrontImage: true/false }]
        if (Array.isArray(psaResp.data) && psaResp.data.length > 0) {
          psa = psaResp.data;
          
          // Find front and back images
          const frontImage = psaResp.data.find(img => img.IsFrontImage === true);
          const backImage = psaResp.data.find(img => img.IsFrontImage === false);
          
          imageUrl = frontImage?.ImageURL || psaResp.data[0]?.ImageURL || imageUrl;
          
          console.log(`✅ Front image: ${frontImage?.ImageURL ? 'Found' : 'Missing'}`);
          console.log(`✅ Back image: ${backImage?.ImageURL ? 'Found' : 'Missing'}`);
        }
      } catch (psaError) {
        console.warn('⚠️  PSA API unavailable, using database values:', psaError.response?.status || psaError.message);
      }
    } else {
      console.log('ℹ️  No valid PSA API key configured, using database values');
    }

    // Pokemon TCG API
    // Docs: https://dev.pokemontcg.io/
    // Free API key available at: https://dev.pokemontcg.io/
    let tcgCard = null;
    let lastPrice = dbCard.last_known_price;

    if (process.env.POKEMON_TCG_API_KEY && process.env.POKEMON_TCG_API_KEY.length > 10) {
      try {
        // Remove " Holo" suffix for better matching
        const cleanName = cardName.replace(/ Holo$/i, '').trim();
        
        // Try multiple query strategies
        const queries = [
          `name:"${cleanName}"`,  // Exact name match
          `name:${cleanName}*`,   // Prefix match
          cleanName,              // Fuzzy match
        ];
        
        let tcgResp = null;
        for (const q of queries) {
          try {
            tcgResp = await axios.get('https://api.pokemontcg.io/v2/cards', {
              params: { q, pageSize: 1, orderBy: '-set.releaseDate' },
              headers: { 'X-Api-Key': process.env.POKEMON_TCG_API_KEY },
              timeout: 8000
            });
            
            if (tcgResp.data?.data?.length > 0) {
              console.log(`✅ Pokemon TCG API success with query: ${q}`);
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
        tcgCard = tcgResp?.data?.data?.[0] || null;

        if (tcgCard) {
          // Extract price from various possible locations
          const prices = tcgCard?.tcgplayer?.prices;
          lastPrice = prices?.holofoil?.market
            ?? prices?.reverseHolofoil?.market
            ?? prices?.normal?.market
            ?? prices?.['1stEditionHolofoil']?.market
            ?? lastPrice;
          
          // Use TCG image if PSA didn't provide one
          if (!imageUrl) {
            imageUrl = tcgCard?.images?.large || tcgCard?.images?.small;
          }
        }
      } catch (tcgError) {
        console.warn('⚠️  Pokemon TCG API unavailable, using database values:', tcgError.response?.status || tcgError.message);
      }
    } else {
      console.log('ℹ️  No valid Pokemon TCG API key configured, using database values');
    }

    const payload = {
      cert_number: cert,
      psa: { cardName, setName, imageUrl, series, raw: psa },
      tcg: tcgCard,
      last_known_price: lastPrice,
      image_url: imageUrl,
    };

    setCache(cacheKey, payload);

    // Best-effort update base table for fast listing reads
    try {
      db.prepare(`
        UPDATE cards 
        SET card_name = COALESCE(?, card_name), 
            set_name = COALESCE(?, set_name), 
            image_url = COALESCE(?, image_url), 
            last_known_price = COALESCE(?, last_known_price), 
            updated_at = CURRENT_TIMESTAMP 
        WHERE cert_number = ?
      `).run(cardName, setName, imageUrl, lastPrice, cert);
    } catch (updateError) {
      console.warn('Failed to update card in database:', updateError.message);
    }

    res.json({ source: 'live', ...payload });
  } catch (e) {
    if (e.response?.status === 404) {
      return res.status(404).json({ error: 'Card not found for certification' });
    }
    console.error('Card fetch error:', e?.response?.data || e.message);
    res.status(500).json({ error: 'Failed to fetch card data' });
  }
});

export default router;