/**
 * PSA Card Public API Service
 * Documentation: https://www.psacard.com/publicapi/documentation
 * 
 * This service provides a modular interface to the PSA Card API with:
 * - Exponential backoff retry logic
 * - Response caching
 * - Graceful fallbacks
 * - Comprehensive error handling
 */

import axios from 'axios';
import { getCache, setCache } from '../db.js';

// PSA API Configuration
const PSA_API_CONFIG = {
  baseURL: 'https://api.psacard.com/publicapi',
  timeout: 15000,
  maxRetries: 3,
  retryDelay: 1000, // Initial delay in ms
  cacheTTL: 1800, // Cache for 30 minutes
};

// Placeholder image for fallback
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x560/1a1a2e/eaeaea?text=PSA+Card';

/**
 * Sleep utility for retry delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 */
const getBackoffDelay = (attempt, baseDelay = PSA_API_CONFIG.retryDelay) => {
  return baseDelay * Math.pow(2, attempt);
};

/**
 * Create PSA API client with authorization
 */
const createPSAClient = () => {
  const apiKey = process.env.PSA_API_KEY;
  
  if (!apiKey || apiKey.length < 10) {
    throw new Error('PSA_API_KEY not configured or invalid');
  }

  return axios.create({
    baseURL: PSA_API_CONFIG.baseURL,
    timeout: PSA_API_CONFIG.timeout,
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
  });
};

/**
 * Expand common Pokemon card abbreviations
 */
function expandAbbreviations(text) {
  if (!text) return text;
  
  const abbreviations = {
    'F/A': 'Full Art',
    'FA': 'Full Art',
    'RR': 'Rainbow Rare',
    'SR': 'Secret Rare',
    'HR': 'Hyper Rare',
    'UR': 'Ultra Rare',
    'GX': 'GX',
    'V': 'V',
    'VMAX': 'VMAX',
    'VSTAR': 'VSTAR',
    'EX': 'EX',
    'LV.X': 'LV.X',
    '1st Ed': '1st Edition',
    '1st Edition': '1st Edition',
  };
  
  let expanded = text;
  for (const [abbr, full] of Object.entries(abbreviations)) {
    // Match abbreviation as whole word or with delimiters
    const regex = new RegExp(`\\b${abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    expanded = expanded.replace(regex, full);
  }
  
  return expanded;
}

/**
 * Fetch PSA certificate metadata with retry logic
 * Uses GetByCertNumber endpoint for full certificate details
 * 
 * @param {string} certNumber - PSA certification number
 * @param {number} attempt - Current retry attempt (internal use)
 * @returns {Promise<Object>} PSA certificate data
 * 
 * Response Structure (from GetByCertNumber):
 * {
 *   "CertNumber": "12345678",
 *   "CardNumber": "25",
 *   "Brand": "Pikachu VMAX F/A", // This is the actual card name!
 *   "Category": "Pokemon",
 *   "SetName": "Base Set",
 *   "Year": "1999",
 *   "CardGrade": "10", // This is the grade!
 *   "Variety": "Holo",
 *   "Qualifier": null,
 *   "SpecNumber": null,
 *   "CertDate": "2023-01-15",
 *   ...
 * }
 * 
 * Error Codes:
 * - 400: Bad Request (invalid cert number format)
 * - 401: Unauthorized (invalid API key)
 * - 404: Certificate not found
 * - 429: Rate limit exceeded
 * - 500: PSA server error
 */
async function fetchPSACertificate(certNumber, attempt = 0) {
  // Check cache first
  const cacheKey = `psa:cert:${certNumber}`;
  const cached = await getCache(cacheKey, PSA_API_CONFIG.cacheTTL);
  
  if (cached) {
    console.log(` PSA cache hit for cert: ${certNumber}`);
    return { ...cached, source: 'cache' };
  }

  try {
    const client = createPSAClient();
    
    // Fetch full certificate metadata using GetByCertNumber
    const metadataResponse = await client.get(`/cert/GetByCertNumber/${certNumber}`);
    const rawData = metadataResponse.data;
    
    // Extract PSACert object from response
    const metadata = rawData.PSACert || rawData;
    
    console.log(` PSA API metadata response:`, JSON.stringify(metadata).substring(0, 300));
    
    // Fetch images separately using GetImagesByCertNumber
    let imageData = {
      CardFrontImageURL: null,
      CardBackImageURL: null,
    };
    
    try {
      const imageResponse = await client.get(`/cert/GetImagesByCertNumber/${certNumber}`);
      const images = imageResponse.data;
      
      if (Array.isArray(images)) {
        console.log(` PSA returned ${images.length} images`);
        const frontImage = images.find(img => img.IsFrontImage === true);
        const backImage = images.find(img => img.IsFrontImage === false);
        
        imageData.CardFrontImageURL = frontImage?.ImageURL || null;
        imageData.CardBackImageURL = backImage?.ImageURL || null;
      }
    } catch (imageError) {
      console.warn(`  Failed to fetch images for cert ${certNumber}, using metadata only`);
    }
    
    // Parse and expand the card name from Subject or Brand field
    const rawCardName = metadata.Subject || metadata.Brand || metadata.CardName || 'Unknown Card';
    const expandedCardName = expandAbbreviations(rawCardName);
    
    // Combine metadata with images
    const parsedData = {
      CertNumber: certNumber,
      CardName: expandedCardName,
      Brand: metadata.Brand,
      Subject: metadata.Subject,
      Category: metadata.Category,
      SetName: metadata.SetName,
      Year: metadata.Year,
      Grade: metadata.CardGrade || metadata.Grade,
      GradeDescription: metadata.GradeDescription,
      Variety: metadata.Variety,
      Qualifier: metadata.Qualifier,
      CardNumber: metadata.CardNumber,
      SpecNumber: metadata.SpecNumber,
      LabelType: metadata.LabelType,
      ReverseBarcode: metadata.ReverseBarCode,
      CertificationStatus: metadata.CertificationStatus,
      DateGraded: metadata.CertDate || metadata.DateGraded,
      PopulationHigher: metadata.PopulationHigher,
      PopulationSame: metadata.TotalPopulationWithQualifier,
      TotalPopulation: metadata.TotalPopulation,
      CardFrontImageURL: imageData.CardFrontImageURL,
      CardBackImageURL: imageData.CardBackImageURL,
      raw: metadata,
    };

    // Cache successful response
    await setCache(cacheKey, parsedData);
    
    console.log(` PSA API success for cert: ${certNumber} - ${expandedCardName} (Grade: ${parsedData.Grade})`);
    return { ...parsedData, source: 'live' };

  } catch (error) {
    // Handle specific error cases
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      switch (status) {
        case 404:
          console.warn(`  PSA cert not found: ${certNumber}`);
          throw {
            code: 'CERT_NOT_FOUND',
            message: `PSA certificate ${certNumber} not found`,
            status: 404,
          };

        case 429:
          // Rate limit - retry with exponential backoff
          if (attempt < PSA_API_CONFIG.maxRetries) {
            const delay = getBackoffDelay(attempt);
            console.warn(`  PSA rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${PSA_API_CONFIG.maxRetries})`);
            await sleep(delay);
            return fetchPSACertificate(certNumber, attempt + 1);
          }
          
          console.error(` PSA rate limit exceeded after ${PSA_API_CONFIG.maxRetries} retries`);
          throw {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'PSA API rate limit exceeded. Please try again later.',
            status: 429,
          };

        case 401:
        case 403:
          console.error(' PSA API authentication failed');
          throw {
            code: 'AUTH_FAILED',
            message: 'PSA API authentication failed. Check API key.',
            status: status,
          };

        case 500:
        case 502:
        case 503:
          // Server error - retry
          if (attempt < PSA_API_CONFIG.maxRetries) {
            const delay = getBackoffDelay(attempt);
            console.warn(`  PSA server error, retrying in ${delay}ms (attempt ${attempt + 1}/${PSA_API_CONFIG.maxRetries})`);
            await sleep(delay);
            return fetchPSACertificate(certNumber, attempt + 1);
          }
          
          throw {
            code: 'SERVER_ERROR',
            message: 'PSA API server error. Please try again later.',
            status: status,
          };

        default:
          throw {
            code: 'API_ERROR',
            message: errorData?.message || 'PSA API request failed',
            status: status,
          };
      }
    }

    // Network or timeout error - retry
    if (attempt < PSA_API_CONFIG.maxRetries && !error.code?.startsWith('CERT_')) {
      const delay = getBackoffDelay(attempt);
      console.warn(`  PSA network error, retrying in ${delay}ms (attempt ${attempt + 1}/${PSA_API_CONFIG.maxRetries})`);
      await sleep(delay);
      return fetchPSACertificate(certNumber, attempt + 1);
    }

    // Final failure
    throw {
      code: 'NETWORK_ERROR',
      message: error.message || 'Failed to connect to PSA API',
      status: 0,
    };
  }
}

/**
 * Get PSA card details with expanded abbreviations
 * 
 * @param {string} certNumber - PSA certification number
 * @returns {Promise<Object>} Card details with images and expanded names
 */
export async function getPSACardDetails(certNumber) {
  try {
    const psaData = await fetchPSACertificate(certNumber);
    
    return {
      success: true,
      source: psaData.source,
      certNumber: psaData.CertNumber,
      cardName: psaData.CardName, // Already expanded with abbreviations
      setName: psaData.SetName,
      year: psaData.Year,
      brand: psaData.Brand, // Original brand field
      category: psaData.Category,
      grade: psaData.Grade, // CardGrade from API
      gradeDescription: psaData.GradeDescription,
      variety: psaData.Variety,
      cardNumber: psaData.CardNumber,
      images: {
        front: psaData.CardFrontImageURL || PLACEHOLDER_IMAGE,
        back: psaData.CardBackImageURL || PLACEHOLDER_IMAGE,
        labelFront: psaData.LabelFrontImageURL,
        labelBack: psaData.LabelBackImageURL,
      },
      certification: {
        status: psaData.CertificationStatus,
        dateGraded: psaData.DateGraded,
      },
      population: {
        higher: psaData.PopulationHigher,
        same: psaData.PopulationSame,
        total: psaData.TotalPopulation,
      },
      raw: psaData,
    };

  } catch (error) {
    console.error(` PSA API error for cert ${certNumber}:`, error.message || error);
    
    // Throw error instead of returning fallback - let caller handle it
    throw {
      success: false,
      error: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'Failed to fetch PSA data',
      certNumber,
    };
  }
}

/**
 * Batch fetch multiple PSA certificates
 * 
 * @param {string[]} certNumbers - Array of PSA certification numbers
 * @returns {Promise<Object[]>} Array of card details
 */
export async function batchGetPSACards(certNumbers) {
  const results = await Promise.allSettled(
    certNumbers.map(cert => getPSACardDetails(cert))
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        success: false,
        certNumber: certNumbers[index],
        error: 'BATCH_FETCH_FAILED',
        message: result.reason?.message || 'Failed to fetch card',
        images: { front: PLACEHOLDER_IMAGE, back: PLACEHOLDER_IMAGE },
      };
    }
  });
}

/**
 * Clear PSA cache for a specific cert or all certs
 * 
 * @param {string|null} certNumber - Specific cert to clear, or null for all
 */
export function clearPSACache(certNumber = null) {
  // Implementation depends on your cache system
  // This is a placeholder for cache invalidation
  console.log(`  Clearing PSA cache for: ${certNumber || 'all'}`);
}

/**
 * Health check for PSA API
 * 
 * @returns {Promise<Object>} API health status
 */
export async function checkPSAAPIHealth() {
  try {
    const client = createPSAClient();
    const response = await client.get('/health', { timeout: 5000 });
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      response: response.data,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    };
  }
}

/**
 * Get normalized cert data for Cert Gallery API
 * Maps PSA API response to our cert gallery schema
 * 
 * @param {string} certNumber - PSA certification number
 * @returns {Promise<Object>} Normalized cert object
 */
export async function getCert(certNumber) {
  try {
    const psaData = await fetchPSACertificate(certNumber);
    
    // Get images
    const images = await getImages(certNumber, psaData);
    
    // Get last sale data
    const lastSale = await getLastSale(certNumber, psaData);
    
    // Normalize to cert gallery schema
    return {
      cert_number: psaData.CertNumber,
      item_title: psaData.CardName || psaData.Brand || 'Unknown Card',
      grade: psaData.Grade?.toString() || null,
      label_type: psaData.LabelType || null,
      reverse_cert_barcode: psaData.ReverseBarcode || false,
      year: psaData.Year?.toString() || null,
      brand_title: psaData.Brand || null,
      subject: psaData.Subject || psaData.CardName || null,
      card_number: psaData.CardNumber || psaData.SpecNumber || null,
      category: psaData.Category || null,
      variety_pedigree: psaData.Variety || psaData.Qualifier || null,
      psa_population: psaData.TotalPopulation || psaData.PopulationSame || null,
      psa_pop_higher: psaData.PopulationHigher || null,
      psa_estimate: null, // PSA doesn't provide estimates via API
      images,
      last_sale: lastSale,
    };
  } catch (error) {
    console.error(`❌ getCert error for ${certNumber}:`, error.message);
    throw error;
  }
}

/**
 * Get CloudFront image URLs for a cert
 * 
 * @param {string} certNumber - PSA certification number
 * @param {Object} psaData - Pre-fetched PSA data (optional)
 * @returns {Promise<Object>} Image URLs { left?, right? }
 */
export async function getImages(certNumber, psaData = null) {
  try {
    if (!psaData) {
      psaData = await fetchPSACertificate(certNumber);
    }
    
    const images = {};
    
    if (psaData.CardFrontImageURL) {
      images.left = psaData.CardFrontImageURL;
    }
    
    if (psaData.CardBackImageURL) {
      images.right = psaData.CardBackImageURL;
    }
    
    return images;
  } catch (error) {
    console.warn(`⚠️ Failed to get images for cert ${certNumber}:`, error.message);
    return {};
  }
}

/**
 * Get last sale information
 * Tries PSA sales endpoint, falls back to Pokemon TCG API pricing
 * 
 * @param {string} certNumber - PSA certification number
 * @param {Object} psaData - Pre-fetched PSA data (optional)
 * @returns {Promise<Object>} Last sale object
 */
export async function getLastSale(certNumber, psaData = null) {
  try {
    if (!psaData) {
      psaData = await fetchPSACertificate(certNumber);
    }
    
    // Try to get PSA sales data (if endpoint available)
    // Note: PSA Public API v1 doesn't provide sales/auction data
    // This would require PSA's private/premium API access
    
    // For now, we'll attempt to use Pokemon TCG API as fallback
    const { searchPokemonCard, extractMarketPrice } = await import('./pokemonTCGService.js');
    
    if (psaData.CardName && psaData.CardName !== 'Unknown Card') {
      const tcgData = await searchPokemonCard({
        name: psaData.CardName,
        setName: psaData.SetName,
        year: psaData.Year,
        variety: psaData.Variety,
      });
      
      if (tcgData) {
        const priceInfo = extractMarketPrice(tcgData, psaData.Variety?.toLowerCase());
        
        if (priceInfo && priceInfo.price) {
          return {
            price: priceInfo.price,
            currency: '$',
            date: priceInfo.lastUpdated || new Date().toISOString().split('T')[0],
            market: priceInfo.priceType || 'TCGplayer',
            listing_url: priceInfo.tcgplayerUrl || undefined,
            source: 'TCG_API_FALLBACK'
          };
        }
      }
    }
    
    // No sale data available
    return {
      source: 'TCG_API_FALLBACK'
    };
    
  } catch (error) {
    console.warn(`⚠️ Failed to get last sale for cert ${certNumber}:`, error.message);
    return {
      source: 'TCG_API_FALLBACK'
    };
  }
}

/**
 * Batch fetch certs with rate limiting
 * 
 * @param {string[]} certNumbers - Array of cert numbers (max 50)
 * @returns {Promise<Object[]>} Array of normalized cert objects
 */
export async function batchGetCerts(certNumbers) {
  const maxBatch = 50;
  const limitedCerts = certNumbers.slice(0, maxBatch);
  
  console.log(`📦 Batch fetching ${limitedCerts.length} certs with rate limiting...`);
  
  const results = [];
  const errors = [];
  
  // Process certs with short delay to respect rate limits
  for (let i = 0; i < limitedCerts.length; i++) {
    const cert = limitedCerts[i];
    
    try {
      const certData = await getCert(cert);
      results.push(certData);
      
      // Add small delay between requests (200ms)
      if (i < limitedCerts.length - 1) {
        await sleep(200);
      }
    } catch (error) {
      console.error(`❌ Failed to fetch cert ${cert}:`, error.message);
      errors.push({
        cert_number: cert,
        error: error.code || 'FETCH_FAILED',
        message: error.message || 'Failed to fetch cert data'
      });
      
      // Return partial data with null fields
      results.push({
        cert_number: cert,
        item_title: null,
        grade: null,
        label_type: null,
        reverse_cert_barcode: null,
        year: null,
        brand_title: null,
        subject: null,
        card_number: null,
        category: null,
        variety_pedigree: null,
        psa_population: null,
        psa_pop_higher: null,
        psa_estimate: null,
        images: {},
        last_sale: { source: 'TCG_API_FALLBACK' },
        error: error.message
      });
    }
  }
  
  return {
    results,
    errors: errors.length > 0 ? errors : undefined
  };
}

// Export configuration for testing/debugging
export const PSA_CONFIG = PSA_API_CONFIG;
