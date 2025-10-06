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
  baseURL: 'https://api.psacard.com/publicapi/v1',
  timeout: 15000,
  maxRetries: 3,
  retryDelay: 1000, // Initial delay in ms
  cacheTTL: 3600, // Cache for 1 hour
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
      'Authorization': `Bearer ${apiKey}`,
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
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
  const cached = getCache(cacheKey, PSA_API_CONFIG.cacheTTL);
  
  if (cached) {
    console.log(` PSA cache hit for cert: ${certNumber}`);
    return { ...cached, source: 'cache' };
  }

  try {
    const client = createPSAClient();
    
    // Fetch full certificate metadata using GetByCertNumber
    const metadataResponse = await client.get(`/cert/GetByCertNumber/${certNumber}`);
    const metadata = metadataResponse.data;
    
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
    
    // Parse and expand the card name from Brand field
    const rawCardName = metadata.Brand || metadata.CardName || 'Unknown Card';
    const expandedCardName = expandAbbreviations(rawCardName);
    
    // Combine metadata with images
    const parsedData = {
      CertNumber: certNumber,
      CardName: expandedCardName,
      Brand: metadata.Brand,
      Category: metadata.Category,
      SetName: metadata.SetName,
      Year: metadata.Year,
      Grade: metadata.CardGrade || metadata.Grade,
      GradeDescription: metadata.GradeDescription,
      Variety: metadata.Variety,
      Qualifier: metadata.Qualifier,
      CardNumber: metadata.CardNumber,
      SpecNumber: metadata.SpecNumber,
      CertificationStatus: metadata.CertificationStatus,
      DateGraded: metadata.CertDate || metadata.DateGraded,
      PopulationHigher: metadata.PopulationHigher,
      PopulationSame: metadata.PopulationSame,
      TotalPopulation: metadata.TotalPopulation,
      CardFrontImageURL: imageData.CardFrontImageURL,
      CardBackImageURL: imageData.CardBackImageURL,
      raw: metadata,
    };

    // Cache successful response
    setCache(cacheKey, parsedData);
    
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

// Export configuration for testing/debugging
export const PSA_CONFIG = PSA_API_CONFIG;
