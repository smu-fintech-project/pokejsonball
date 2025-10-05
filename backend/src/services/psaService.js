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
 * Fetch PSA certificate details with retry logic
 * 
 * @param {string} certNumber - PSA certification number
 * @param {number} attempt - Current retry attempt (internal use)
 * @returns {Promise<Object>} PSA certificate data
 * 
 * Response Structure (per PSA API docs):
 * {
 *   "CertNumber": "12345678",
 *   "CardNumber": "25",
 *   "CardName": "Pikachu",
 *   "SetName": "Base Set",
 *   "Year": "1999",
 *   "Brand": "Pokemon",
 *   "Grade": "10",
 *   "GradeDescription": "GEM MT",
 *   "Variety": "Holo",
 *   "Qualifier": null,
 *   "SpecNumber": null,
 *   "CardFrontImageURL": "https://...",
 *   "CardBackImageURL": "https://...",
 *   "LabelFrontImageURL": "https://...",
 *   "LabelBackImageURL": "https://...",
 *   "CertificationStatus": "Certified",
 *   "DateGraded": "2023-01-15",
 *   "PopulationHigher": 0,
 *   "PopulationSame": 150,
 *   "TotalPopulation": 1500
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
    
    // PSA API endpoint for certificate images
    // Correct endpoint: /cert/GetImagesByCertNumber/{certNumber}
    const response = await client.get(`/cert/GetImagesByCertNumber/${certNumber}`);
    
    const data = response.data;
    
    console.log(` PSA API raw response:`, JSON.stringify(data).substring(0, 200));
    
    // PSA returns an array of image objects
    // Format: [{ ImageURL: "https://...", IsFrontImage: true/false }, ...]
    let parsedData = {
      CertNumber: certNumber,
      images: [],
      CardFrontImageURL: null,
      CardBackImageURL: null,
    };
    
    if (Array.isArray(data)) {
      console.log(` PSA returned ${data.length} images`);
      
      parsedData.images = data;
      
      // Extract front and back images
      const frontImage = data.find(img => img.IsFrontImage === true);
      const backImage = data.find(img => img.IsFrontImage === false);
      
      parsedData.CardFrontImageURL = frontImage?.ImageURL || null;
      parsedData.CardBackImageURL = backImage?.ImageURL || null;
      
      console.log(` Front image: ${parsedData.CardFrontImageURL ? 'Found' : 'Missing'}`);
      console.log(` Back image: ${parsedData.CardBackImageURL ? 'Found' : 'Missing'}`);
    } else if (data && typeof data === 'object') {
      // Handle other possible response formats
      parsedData = { ...data, CertNumber: certNumber };
    } else {
      throw new Error('Invalid PSA API response structure');
    }

    // Cache successful response
    setCache(cacheKey, parsedData);
    
    console.log(` PSA API success for cert: ${certNumber}`);
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
 * Get PSA card details with fallback to placeholder
 * 
 * @param {string} certNumber - PSA certification number
 * @returns {Promise<Object>} Card details with images or fallback
 */
export async function getPSACardDetails(certNumber) {
  try {
    const psaData = await fetchPSACertificate(certNumber);
    
    return {
      success: true,
      source: psaData.source,
      certNumber: psaData.CertNumber,
      cardName: psaData.CardName,
      setName: psaData.SetName,
      year: psaData.Year,
      brand: psaData.Brand,
      grade: psaData.Grade,
      gradeDescription: psaData.GradeDescription,
      variety: psaData.Variety,
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
    
    // Return fallback data
    return {
      success: false,
      error: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'Failed to fetch PSA data',
      certNumber,
      cardName: 'Unknown Card',
      setName: 'Unknown Set',
      year: null,
      brand: 'Pokemon',
      grade: null,
      gradeDescription: 'N/A',
      variety: null,
      images: {
        front: PLACEHOLDER_IMAGE,
        back: PLACEHOLDER_IMAGE,
        labelFront: null,
        labelBack: null,
      },
      certification: {
        status: 'Unknown',
        dateGraded: null,
      },
      population: {
        higher: null,
        same: null,
        total: null,
      },
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
