/**
 * Card Integration Service
 * 
 * Combines PSA and Pokemon TCG APIs to provide complete card information:
 * - PSA certification details and graded card images
 * - Current market pricing from Pokemon TCG API
 * - Fallback mechanisms for missing data
 */

import { getPSACardDetails } from './psaService.js';
import { searchPokemonCard, extractMarketPrice, getCardImages } from './pokemonTCGService.js';
import { getCache, setCache } from '../db.js';

/**
 * Get complete card information from both PSA and Pokemon TCG APIs
 * 
 * @param {string} certNumber - PSA certification number
 * @param {Object} dbCard - Database card record (optional, for fallback)
 * @returns {Promise<Object>} Complete card information
 */
export async function getCompleteCardInfo(certNumber, dbCard = null) {
  const cacheKey = `integrated:${certNumber}`;
  const cached = getCache(cacheKey, 300); // Cache for 5 minutes
  
  if (cached) {
    console.log(`✅ Integrated cache hit for cert: ${certNumber}`);
    return { ...cached, source: 'cache' };
  }

  // Step 1: Fetch PSA certification details
  console.log(`📡 Fetching PSA data for cert: ${certNumber}`);
  const psaData = await getPSACardDetails(certNumber);
  
  // Step 2: Use PSA data to search Pokemon TCG API for pricing
  let tcgData = null;
  let priceInfo = null;
  let tcgImages = null;

  if (psaData.cardName && psaData.cardName !== 'Unknown Card') {
    console.log(`📡 Fetching Pokemon TCG data for: ${psaData.cardName}`);
    
    tcgData = await searchPokemonCard({
      name: psaData.cardName,
      setName: psaData.setName,
      year: psaData.year,
      variety: psaData.variety,
    });

    if (tcgData) {
      priceInfo = extractMarketPrice(tcgData, psaData.variety?.toLowerCase());
      tcgImages = getCardImages(tcgData);
    }
  }

  // Step 3: Merge data with intelligent fallbacks
  const result = {
    // Certification info
    certNumber: psaData.certNumber,
    certificationStatus: psaData.certification.status,
    dateGraded: psaData.certification.dateGraded,
    
    // Card identity
    cardName: psaData.cardName,
    setName: psaData.setName,
    year: psaData.year,
    brand: psaData.brand,
    variety: psaData.variety,
    
    // Grading info
    grade: psaData.grade,
    gradeDescription: psaData.gradeDescription,
    
    // Population data (PSA exclusive)
    population: psaData.population,
    
    // Images (prefer PSA graded images, fallback to TCG raw images)
    images: {
      // PSA graded card images (front/back of the graded slab)
      gradedFront: psaData.images.front,
      gradedBack: psaData.images.back,
      labelFront: psaData.images.labelFront,
      labelBack: psaData.images.labelBack,
      
      // Raw card images from Pokemon TCG (before grading)
      rawCardSmall: tcgImages?.small || null,
      rawCardLarge: tcgImages?.large || null,
      
      // Best available image for display
      displayImage: psaData.images.front !== 'https://via.placeholder.com/400x560/1a1a2e/eaeaea?text=PSA+Card'
        ? psaData.images.front
        : (tcgImages?.large || psaData.images.front),
    },
    
    // Market pricing (from Pokemon TCG API)
    pricing: priceInfo ? {
      currentMarketPrice: priceInfo.price,
      currency: priceInfo.currency,
      priceType: priceInfo.priceType,
      priceRange: priceInfo.priceRange,
      lastUpdated: priceInfo.lastUpdated,
      tcgplayerUrl: priceInfo.tcgplayerUrl,
      
      // Note: PSA graded cards typically sell for premium over raw card prices
      // This is the raw card price - graded price will be higher
      note: psaData.grade >= 9 
        ? 'PSA graded cards typically command a premium over raw card prices'
        : 'Price shown is for raw card; graded price may vary',
    } : {
      currentMarketPrice: dbCard?.last_known_price || null,
      currency: 'USD',
      priceType: 'database',
      note: 'Live pricing unavailable',
    },
    
    // Additional Pokemon TCG data
    tcgData: tcgData ? {
      id: tcgData.id,
      number: tcgData.number,
      rarity: tcgData.rarity,
      artist: tcgData.artist,
      hp: tcgData.hp,
      types: tcgData.types,
      set: tcgData.set,
    } : null,
    
    // API status
    apiStatus: {
      psaSuccess: psaData.success,
      tcgSuccess: tcgData !== null,
      psaSource: psaData.source,
      tcgSource: tcgData?.source,
    },
    
    // Metadata
    fetchedAt: new Date().toISOString(),
  };

  // Cache the integrated result
  setCache(cacheKey, result);
  
  console.log(`✅ Complete card info assembled for cert: ${certNumber}`);
  return { ...result, source: 'live' };
}

/**
 * Batch fetch complete card information for multiple certs
 * 
 * @param {string[]} certNumbers - Array of PSA certification numbers
 * @returns {Promise<Object[]>} Array of complete card information
 */
export async function batchGetCompleteCardInfo(certNumbers) {
  console.log(`📦 Batch fetching ${certNumbers.length} cards`);
  
  const results = await Promise.allSettled(
    certNumbers.map(cert => getCompleteCardInfo(cert))
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        certNumber: certNumbers[index],
        error: 'BATCH_FETCH_FAILED',
        message: result.reason?.message || 'Failed to fetch complete card info',
      };
    }
  });
}

/**
 * Get price comparison between raw and graded card
 * 
 * @param {string} certNumber - PSA certification number
 * @returns {Promise<Object>} Price comparison data
 */
export async function getPriceComparison(certNumber) {
  const cardInfo = await getCompleteCardInfo(certNumber);
  
  if (!cardInfo.pricing.currentMarketPrice || !cardInfo.grade) {
    return {
      available: false,
      message: 'Insufficient data for price comparison',
    };
  }

  // Estimate graded card premium based on grade
  // These are rough multipliers - actual premiums vary by card
  const gradePremiums = {
    10: 3.0,  // PSA 10 typically 3x raw price
    9: 2.0,   // PSA 9 typically 2x raw price
    8: 1.5,   // PSA 8 typically 1.5x raw price
    7: 1.2,   // PSA 7 typically 1.2x raw price
  };

  const premium = gradePremiums[cardInfo.grade] || 1.0;
  const rawPrice = cardInfo.pricing.currentMarketPrice;
  const estimatedGradedPrice = rawPrice * premium;

  return {
    available: true,
    rawCardPrice: rawPrice,
    estimatedGradedPrice: estimatedGradedPrice,
    premiumMultiplier: premium,
    grade: cardInfo.grade,
    currency: cardInfo.pricing.currency,
    note: 'Graded prices are estimates based on typical market premiums',
    lastUpdated: cardInfo.pricing.lastUpdated,
  };
}

/**
 * Search for similar cards (same name, different grades)
 * 
 * @param {string} cardName - Card name to search
 * @returns {Promise<Object[]>} Array of similar cards
 */
export async function findSimilarCards(cardName) {
  // This would query your database for cards with the same name
  // but different PSA grades to show price comparison
  // Implementation depends on your database structure
  
  console.log(`🔍 Searching for similar cards: ${cardName}`);
  
  // Placeholder - implement based on your needs
  return [];
}

export default {
  getCompleteCardInfo,
  batchGetCompleteCardInfo,
  getPriceComparison,
  findSimilarCards,
};
