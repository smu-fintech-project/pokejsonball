import express from 'express';
import axios from 'axios';
import { getDb, getCache, setCache } from '../db.js';

const router = express.Router();

// GET /api/cards - list cards (basic marketplace)
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT id, cert_number, card_name, set_name, psa_grade, release_year, pokemon_tcg_id, series, image_url, last_known_price FROM cards ORDER BY id LIMIT 200');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to list cards' });
  }
});

// GET /api/cards/:cert - details via PSA + PokemonTCG, with caching
router.get('/:cert', async (req, res) => {
  const cert = req.params.cert;
  try {
    const db = await getDb();
    const cacheKey = `card:${cert}`;
    const cached = await getCache(db, cacheKey, 300);
    if (cached) return res.json({ source: 'cache', ...cached });

    // PSA API
    // Docs: https://www.psacard.com/publicapi/documentation
    // You need PSA API key: set PSA_API_KEY in .env, header 'api_key'
    const psaClient = axios.create({
      baseURL: 'https://api.psacard.com/publicapi',
      headers: { 'api_key': process.env.PSA_API_KEY }
    });
    // Example endpoint (subject to PSA docs). Adjust to correct path.
    // Using certification endpoint by cert number
    const psaResp = await psaClient.get(`/certification/${encodeURIComponent(cert)}`);
    const psa = psaResp.data || {};

    const cardName = psa.CardName || psa.cardName || psa.card_name;
    const setName = psa.SetName || psa.setName || psa.set;
    const imageUrl = psa.ImageUrl || psa.imageUrl || psa.image_url;
    const series = psa.Series || 'Sword & Shield';

    // Pokemon TCG API
    // Docs: https://dev.pokemontcg.io/
    // set POKEMON_TCG_API_KEY in .env, header 'X-Api-Key'
    const tcgClient = axios.create({
      baseURL: 'https://api.pokemontcg.io/v2',
      headers: { 'X-Api-Key': process.env.POKEMON_TCG_API_KEY }
    });

    // Query by name + set if available; fallback to name only
    const q = [cardName ? `name:\"${cardName}\"` : null, setName ? `set.name:\"${setName}\"` : null].filter(Boolean).join(' ');
    const tcgResp = await tcgClient.get('/cards', { params: { q, pageSize: 1 } });
    const tcgCard = (tcgResp.data && tcgResp.data.data && tcgResp.data.data[0]) || null;

    const lastPrice = tcgCard?.tcgplayer?.prices?.holofoil?.market
      ?? tcgCard?.tcgplayer?.prices?.normal?.market
      ?? null;

    const payload = {
      cert_number: cert,
      psa: { cardName, setName, imageUrl, series, raw: psa },
      tcg: tcgCard,
      last_known_price: lastPrice,
      image_url: imageUrl || tcgCard?.images?.large || tcgCard?.images?.small || null,
    };

    await setCache(db, cacheKey, payload);

    // best-effort update base table for fast listing reads
    await db.run(
      `UPDATE cards SET card_name = COALESCE(?, card_name), set_name = COALESCE(?, set_name), image_url = COALESCE(?, image_url), last_known_price = COALESCE(?, last_known_price), updated_at = CURRENT_TIMESTAMP WHERE cert_number = ?`,
      cardName, setName, payload.image_url, payload.last_known_price, cert
    );

    res.json({ source: 'live', ...payload });
  } catch (e) {
    if (e.response?.status === 404) {
      return res.status(404).json({ error: 'Card not found for certification' });
    }
    console.error('Card fetch error', e?.response?.data || e.message);
    res.status(500).json({ error: 'Failed to fetch card data' });
  }
});

export default router;

