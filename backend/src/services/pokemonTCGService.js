/**
 * Pokemon TCG API Service
 * Documentation: https://dev.pokemontcg.io/
 * 
 * This service provides integration with the Pokemon TCG API for:
 * - Card lookup by name/set
 * - Current market pricing data
 * - Card images and metadata
 * - Set information
 */

import axios from 'axios';
import { getCache, setCache } from '../db.js';

// Pokemon TCG API Configuration
const TCG_API_CONFIG = {
  baseURL: 'https://api.pokemontcg.io/v2',
  timeout: 10000,
  cacheTTL: 1800, // Cache for 30 minutes (prices change frequently)
};

/**
 * Create Pokemon TCG API client
 */
const createTCGClient = () => {
  const apiKey = process.env.POKEMON_TCG_API_KEY;
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // API key is optional but recommended for higher rate limits
  if (apiKey && apiKey.length > 10) {
    headers['X-Api-Key'] = apiKey;
  }

  return axios.create({
    baseURL: TCG_API_CONFIG.baseURL,
    timeout: TCG_API_CONFIG.timeout,
    headers,
  });
};

/**
 * Search for Pokemon card by name and optional filters
 * 
 * @param {Object} params - Search parameters
 * @param {string} params.name - Card name (required)
 * @param {string} params.setName - Set name (optional)
 * @param {string} params.year - Release year (optional)
 * @param {string} params.variety - Card variety like "Holo" (optional)
 * @returns {Promise<Object|null>} Card data or null if not found
 * 
 * Response Structure:
 * {
 *   "id": "base1-4",
 *   "name": "Charizard",
 *   "supertype": "Pokémon",
 *   "subtypes": ["Stage 2"],
 *   "hp": "120",
 *   "types": ["Fire"],
 *   "rarity": "Rare Holo",
 *   "set": {
 *     "id": "base1",
 *     "name": "Base",
 *     "series": "Base",
 *     "printedTotal": 102,
 *     "total": 102,
 *     "releaseDate": "1999/01/09",
 *     "images": { ... }
 *   },
 *   "number": "4",
 *   "artist": "Mitsuhiro Arita",
 *   "images": {
 *     "small": "https://...",
 *     "large": "https://..."
 *   },
 *   "tcgplayer": {
 *     "url": "https://...",
 *     "updatedAt": "2024/01/15",
 *     "prices": {
 *       "holofoil": {
 *         "low": 350.00,
 *         "mid": 450.00,
 *         "high": 550.00,
 *         "market": 425.00,
 *         "directLow": null
 *       },
 *       "reverseHolofoil": { ... },
 *       "normal": { ... }
 *     }
 *   },
 *   "cardmarket": { ... }
 * }
 */
export async function searchPokemonCard({ name, setName, year, variety }) {
  // Build cache key
  const cacheKey = `tcg:search:${name}:${setName || ''}:${year || ''}:${variety || ''}`;
  const cached = getCache(cacheKey, TCG_API_CONFIG.cacheTTL);
  
  if (cached) {
    console.log(` Pokemon TCG cache hit for: ${name}`);
    return { ...cached, source: 'cache' };
  }

  try {
    const client = createTCGClient();
    
    // Clean card name (remove " Holo" suffix for better matching)
    const cleanName = name.replace(/ Holo$/i, '').trim();
    
    // Build query string using Pokemon TCG API query syntax
    const queryParts = [`name:"${cleanName}"`];
    
    if (setName) {
      queryParts.push(`set.name:"${setName}"`);
    }
    
    if (year) {
      queryParts.push(`set.releaseDate:${year}*`);
    }
    
    const query = queryParts.join(' ');
    
    console.log(` Pokemon TCG API query: ${query}`);
    
    const response = await client.get('/cards', {
      params: {
        q: query,
        pageSize: 5, // Get top 5 results for better matching
        orderBy: '-set.releaseDate', // Prefer newer cards
      },
    });

    const cards = response.data?.data || [];
    
    if (cards.length === 0) {
      console.warn(`  No Pokemon TCG results for: ${name}`);
      return null;
    }

    // Find best match based on variety (Holo, Reverse Holo, etc.)
    let bestMatch = cards[0];
    
    if (variety) {
      const varietyMatch = cards.find(card => 
        card.rarity?.toLowerCase().includes(variety.toLowerCase())
      );
      if (varietyMatch) {
        bestMatch = varietyMatch;
      }
    }

    // Cache the result
    setCache(cacheKey, bestMatch);
    
    console.log(` Pokemon TCG API success: ${bestMatch.name} (${bestMatch.set.name})`);
    return { ...bestMatch, source: 'live' };

  } catch (error) {
    console.error(` Pokemon TCG API error for ${name}:`, error.response?.status || error.message);
    
    // Try fuzzy search as fallback
    if (!error.response || error.response.status >= 500) {
      try {
        return await fuzzySearchPokemonCard(name);
      } catch (fallbackError) {
        console.error(' Fuzzy search also failed');
      }
    }
    
    return null;
  }
}

/**
 * Fuzzy search for Pokemon card (fallback)
 */
async function fuzzySearchPokemonCard(name) {
  const client = createTCGClient();
  const cleanName = name.replace(/ Holo$/i, '').trim();
  
  // Try progressively looser queries
  const queries = [
    `name:${cleanName}*`,  // Prefix match
    cleanName,             // Full text search
  ];
  
  for (const q of queries) {
    try {
      const response = await client.get('/cards', {
        params: { q, pageSize: 1 },
      });
      
      const cards = response.data?.data || [];
      if (cards.length > 0) {
        console.log(` Pokemon TCG fuzzy match: ${cards[0].name}`);
        return cards[0];
      }
    } catch (e) {
      continue;
    }
  }
  
  return null;
}

/**
 * Extract market price from Pokemon TCG card data
 * 
 * @param {Object} card - Pokemon TCG card object
 * @param {string} preferredType - Preferred price type: 'holofoil', 'normal', etc.
 * @returns {Object} Price information
 */
export function extractMarketPrice(card, preferredType = 'holofoil') {
  if (!card || !card.tcgplayer?.prices) {
    return {
      price: null,
      currency: 'USD',
      priceType: null,
      lastUpdated: null,
    };
  }

  const prices = card.tcgplayer.prices;
  
  // Priority order for price types
  const priceTypes = [
    preferredType,
    'holofoil',
    'reverseHolofoil',
    '1stEditionHolofoil',
    'unlimitedHolofoil',
    'normal',
  ];

  for (const type of priceTypes) {
    if (prices[type]?.market) {
      return {
        price: prices[type].market,
        currency: 'USD',
        priceType: type,
        priceRange: {
          low: prices[type].low,
          mid: prices[type].mid,
          high: prices[type].high,
        },
        lastUpdated: card.tcgplayer.updatedAt,
        tcgplayerUrl: card.tcgplayer.url,
      };
    }
  }

  return {
    price: null,
    currency: 'USD',
    priceType: null,
    lastUpdated: card.tcgplayer.updatedAt,
  };
}

/**
 * Get card image URLs
 * 
 * @param {Object} card - Pokemon TCG card object
 * @returns {Object} Image URLs
 */
export function getCardImages(card) {
  if (!card || !card.images) {
    return {
      small: null,
      large: null,
    };
  }

  return {
    small: card.images.small,
    large: card.images.large,
  };
}

/**
 * Health check for Pokemon TCG API
 */
export async function checkTCGAPIHealth() {
  try {
    const client = createTCGClient();
    const response = await client.get('/cards', {
      params: { pageSize: 1 },
      timeout: 5000,
    });
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      rateLimit: {
        remaining: response.headers['x-ratelimit-remaining'],
        limit: response.headers['x-ratelimit-limit'],
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    };
  }
}

// Export configuration
export const TCG_CONFIG = TCG_API_CONFIG;
