/**
 * Firebase Database Service
 */

import { getFirestore } from './firebase.js';

// Collections
const COLLECTIONS = {
  CARDS: 'cards',
  USERS: 'users',
  CACHE: 'api_cache',
};

/**
 * Get all cards
 */
export async function getAllCards(limit = 200) {
  const db = getFirestore();
  const snapshot = await db.collection(COLLECTIONS.CARDS)
    .limit(limit)
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Get marketplace cards aggregated from user documents.
 * Each user doc may have a `cards` array of cert numbers.
 * Returns array of { cert_number, sellerId, sellerEmail } (up to `limit`).
 * Excludes any entries where sellerEmail === excludeEmail.
 */
export async function getMarketplaceCards({ excludeEmail = null, limit = 200 } = {}) {
  const db = getFirestore();

  // Build a cache key to avoid scanning users on every request (short TTL)
  const cacheKey = `marketplace:exclude:${excludeEmail || 'none'}:limit:${limit}`;
  try {
    const cached = await getCache(cacheKey, 30); // 30 seconds cache
    if (cached) {
      console.log(`Marketplace cache hit (exclude=${excludeEmail}) -> ${cached.length} items`);
      return cached;
    }
  } catch (e) {
    // cache read failure should not block listing
    console.warn('Marketplace cache read failed:', e.message || e);
  }

  // Query all users that have cards array - simple approach: get all users
  const usersSnapshot = await db.collection('users').get();

  const entries = [];

  usersSnapshot.forEach(doc => {
    const u = doc.data();
    if (!u || !Array.isArray(u.cards) || u.cards.length === 0) return;
    const email = u.email || null;
    if (excludeEmail && email === excludeEmail) return; // skip own cards

    // For each cert in user's cards, push an entry
    u.cards.forEach(cert => {
      if (!cert) return;
      entries.push({
        cert_number: String(cert),
        sellerId: doc.id,
        sellerEmail: email,
      });
    });
  });

  // Optionally limit items (keep first N)
  const limited = entries.slice(0, limit);

  // Store in cache for short TTL
  try {
    await setCache(cacheKey, limited);
  } catch (e) {
    console.warn('Marketplace cache write failed:', e.message || e);
  }

  console.log(`Marketplace assembled: ${limited.length} cards (exclude=${excludeEmail})`);
  return limited;
}


/**
 * Get card by cert number
 */
export async function getCardByCert(certNumber) {
  const db = getFirestore();
  const snapshot = await db.collection(COLLECTIONS.CARDS)
    .where('cert_number', '==', certNumber)
    .limit(1)
    .get();
  
  if (snapshot.empty) {
    return null;
  }
  
  return {
    id: snapshot.docs[0].id,
    ...snapshot.docs[0].data()
  };
}

/**
 * Create or update card
 */
export async function upsertCard(cardData) {
  const db = getFirestore();
  const { cert_number } = cardData;
  
  // Check if card exists
  const existing = await getCardByCert(cert_number);
  
  if (existing) {
    // Update existing
    await db.collection(COLLECTIONS.CARDS)
      .doc(existing.id)
      .update({
        ...cardData,
        updated_at: new Date().toISOString(),
      });
    return { id: existing.id, ...cardData };
  } else {
    // Create new
    const docRef = await db.collection(COLLECTIONS.CARDS).add({
      ...cardData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return { id: docRef.id, ...cardData };
  }
}

/**
 * Delete card
 */
export async function deleteCard(certNumber) {
  const db = getFirestore();
  const card = await getCardByCert(certNumber);
  
  if (card) {
    await db.collection(COLLECTIONS.CARDS).doc(card.id).delete();
    return true;
  }
  
  return false;
}

/**
 * Cache operations
 */
export async function getCache(key, maxAgeSeconds = 300) {
  const db = getFirestore();
  const doc = await db.collection(COLLECTIONS.CACHE).doc(key).get();
  
  if (!doc.exists) {
    console.log(`Cache miss: ${key}`);
    return null;
  }
  
  const data = doc.data();
  const age = (Date.now() - new Date(data.updated_at).getTime()) / 1000;
  
  if (age > maxAgeSeconds) {
    console.log(`Cache expired: ${key} (age: ${age.toFixed(0)}s)`);
    return null;
  }
  
  console.log(`Cache hit: ${key} (age: ${age.toFixed(0)}s)`);
  return JSON.parse(data.payload);
}

export async function setCache(key, payload) {
  const db = getFirestore();
  const json = JSON.stringify(payload);
  
  await db.collection(COLLECTIONS.CACHE).doc(key).set({
    payload: json,
    updated_at: new Date().toISOString(),
  });
  
  console.log(`Cache stored: ${key}`);
}

/**
 * Clear all data (for testing)
 */
export async function clearAllData() {
  const db = getFirestore();
  
  // Delete all cards
  const cardsSnapshot = await db.collection(COLLECTIONS.CARDS).get();
  const batch = db.batch();
  cardsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  
  console.log('🗑️ All data cleared from Firebase');
}

export { COLLECTIONS };

