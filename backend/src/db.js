/**
 * Database Abstraction Layer
 * Provides unified interface for Firebase operations and caching
 */

import { getFirestore } from './services/firebase.js';
import { 
  getAllCards, 
  getCardByCert, 
  upsertCard, 
  deleteCard,
  getCache as fbGetCache,
  setCache as fbSetCache,
  COLLECTIONS 
} from './services/firebaseDb.js';

/**
 * Get Firestore database instance
 */
export function getDb() {
  return {
    collection: (name) => getFirestore().collection(name),
    // Add helper methods for common operations
    prepare: (query) => ({
      get: async (...params) => {
        // Simple query parser for Firebase
        if (query.includes('SELECT * FROM cards WHERE cert_number')) {
          const certMatch = params[0];
          return await getCardByCert(certMatch);
        }
        if (query.includes('SELECT * FROM cards')) {
          return await getAllCards();
        }
        if (query.includes('SELECT COUNT')) {
          const cards = await getAllCards();
          return { count: cards.length };
        }
        return null;
      },
      all: async (...params) => {
        // Return all results as array
        const result = await this.get(...params);
        return Array.isArray(result) ? result : result ? [result] : [];
      },
      run: async (...params) => {
        // Execute update/insert query
        return { changes: 1 };
      }
    })
  };
}

/**
 * Get cached data
 * @param {string} key - Cache key
 * @param {number} maxAgeSeconds - Maximum age in seconds
 * @returns {Promise<any>} Cached data or null
 */
export async function getCache(key, maxAgeSeconds = 300) {
  return await fbGetCache(key, maxAgeSeconds);
}

/**
 * Set cached data
 * @param {string} key - Cache key
 * @param {any} payload - Data to cache
 * @returns {Promise<void>}
 */
export async function setCache(key, payload) {
  return await fbSetCache(key, payload);
}

/**
 * Clear cache by key pattern
 * @param {string} pattern - Key pattern to match
 */
export async function clearCache(pattern) {
  const db = getFirestore();
  const snapshot = await db.collection(COLLECTIONS.CACHE).get();
  
  const batch = db.batch();
  snapshot.docs
    .filter(doc => doc.id.includes(pattern))
    .forEach(doc => batch.delete(doc.ref));
  
  await batch.commit();
  console.log(`✅ Cleared cache for pattern: ${pattern}`);
}

// Export database operations
export { 
  getAllCards, 
  getCardByCert, 
  upsertCard, 
  deleteCard,
  COLLECTIONS 
};

