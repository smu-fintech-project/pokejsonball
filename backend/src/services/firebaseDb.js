/**
 * Firebase Database Service
 */

import { getFirestore } from './firebase.js';
import admin from 'firebase-admin'

// Collections
const COLLECTIONS = {
  CARDS: 'cards',
  USERS: 'users',
  CACHE: 'api_cache',
  THOUGHTS: 'thoughts',
  COMMUNITIES: 'communities',
};


// //Return a signed, time-limited URL for a file in Firebase Storage.
// @param {string} folder e.g. "avatar"
// @param {string} filename e.g. "pikachu.png"
// @param {number} expiresSeconds default 3600 (1h)

export async function getImageSignedUrl(folder, filename, expiresSeconds = 3600) {
  if (!folder || !filename) throw new Error('FOLDER_OR_FILENAME_MISSING');
  const bucketName = process.env.VITE_FIREBASE_STORAGE_BUCKET; // e.g. pokejsonball-aa3f2.appspot.com
  const bucket = bucketName ? admin.storage().bucket(bucketName) : admin.storage().bucket();
  const file = bucket.file(`${folder}/${filename}`);

  const [exists] = await file.exists();
  if (!exists) throw new Error('IMAGE_NOT_FOUND');

  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + expiresSeconds * 1000,
  });
  return url;
}


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

export async function getAllUsers(limit = 200) {
  const db = getFirestore();
  const snapshot = await db.collection(COLLECTIONS.USERS)
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

/**
 * Get marketplace cards aggregated from user documents.
 * Each user doc may have a `cards` array of cert numbers.
 * Returns array of { cert_number, sellerId, sellerEmail } (up to `limit`).
 * Excludes any entries where sellerEmail === excludeEmail.
 */
// services/firebaseDb.js
export async function getMarketplaceCards({limit = 200 } = {}) {
  const db = getFirestore();
  // cache (still useful — keeps the heavy read out of hot path)
  const cacheKey = `marketplace:limit:${limit}:status:listed`;
  try {
    const cached = await getCache(cacheKey, 30);
    if (cached) return cached;  
  } catch {}

  const entriesMap = new Map();

  try {
    // Primary path: (may require collection-group index/rules)
    const listingsSnap = await db.collectionGroup('listings')
      .where('status', '==', 'listed')        // only listed in one go
      .get();

    listingsSnap.forEach(doc => {
      const l = doc.data();
      if (!l) return;
      const certNumber = String(l.cert_number || '');
      if (!certNumber) return;
      if (excludeEmail && l.sellerEmail === excludeEmail) return; // keeps old behavior if you pass it

      if (!entriesMap.has(certNumber)) {
        entriesMap.set(certNumber, {
          cert_number: certNumber,
          sellerId: l.sellerId,
          sellerEmail: l.sellerEmail || null,
          listing_price: typeof l.listing_price === 'number' ? l.listing_price : null,
          status: 'listed',
        });
      }
    });
  } catch (e) {
    // Fallback path: enumerate users → their listings (no collection-group index required)
    console.warn('[marketplace] collectionGroup failed, falling back:', e.message || e);

    const usersSnap = await db.collection('users').get();
    for (const u of usersSnap.docs) {
      const ls = await u.ref.collection('listings')
        .where('status', '==', 'listed')
        .get();

      ls.forEach(d => {
        const l = d.data();
        if (!l) return;
        const certNumber = String(l.cert_number || '');
        if (!certNumber) return;
        if (excludeEmail && l.sellerEmail === excludeEmail) return;

        if (!entriesMap.has(certNumber)) {
          entriesMap.set(certNumber, {
            cert_number: certNumber,
            sellerId: l.sellerId,
            sellerEmail: l.sellerEmail || null,
            listing_price: typeof l.listing_price === 'number' ? l.listing_price : null,
            status: 'listed',
          });
        }
      });
    }
  }

  const entries = Array.from(entriesMap.values()).slice(0, limit);

  try { await setCache(cacheKey, entries); } catch {}

  return entries;
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

// Create a new thought
export async function createThought({ authorId, authorName, authorEmail, title, body, imageUrl, communityId = null, authorAvatar = null }) {
  const db = getFirestore();
  const now = new Date().toISOString();
  const payload = {
    authorId, authorName, authorEmail,
    title, body, imageUrl: imageUrl || null,
    communityId: communityId || null,
    authorAvatar: authorAvatar || null,
    createdAt: now, updatedAt: now,
    upvotes: 0, downvotes: 0, commentsCount: 0,
  };
  const ref = await db.collection(COLLECTIONS.THOUGHTS).add(payload);
  return { id: ref.id, ...payload };
}

// List thoughts (paged, newest first)
  export async function listThoughts({ limit = 20, cursor = null, communityId }) {
  const db = getFirestore();
    let query = db.collection(COLLECTIONS.THOUGHTS).orderBy('createdAt', 'desc').limit(limit);
  if (communityId) {
    // Firestore needs an index for where+orderBy. If missing, console will print a link to create it.
    query = db.collection(COLLECTIONS.THOUGHTS)
      .where('communityId', '==', communityId)
      .orderBy('createdAt', 'desc')
      .limit(limit);
  }
  if (cursor) {
    const cursorDoc = await db.collection(COLLECTIONS.THOUGHTS).doc(cursor).get();
    if (cursorDoc.exists) query = query.startAfter(cursorDoc);
  }

  const snap = await query.get();
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const nextCursor = snap.docs.length ? snap.docs[snap.docs.length - 1].id : null;
  return { items, nextCursor };
}

// Get one thought
export async function getThought(thoughtId) {
  const db = getFirestore();
  const doc = await db.collection(COLLECTIONS.THOUGHTS).doc(thoughtId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

// Add comment
export async function addComment(thoughtId, { authorId, authorName, authorEmail, body, authorAvatar = null }) {
  const db = getFirestore();
  const now = new Date().toISOString();

  const commentRef = await db
    .collection(COLLECTIONS.THOUGHTS)
    .doc(thoughtId)
    .collection('comments')
    .add({
      authorId, authorName, authorEmail,
      body,
      authorAvatar: authorAvatar || null,
      createdAt: now,
      upvotes: 0,
      downvotes: 0,
    });

  // increment counter
  await db.collection(COLLECTIONS.THOUGHTS).doc(thoughtId)
    .update({ commentsCount: admin.firestore.FieldValue.increment(1) }).catch(()=>{});

  const newDoc = await commentRef.get();
  return { id: newDoc.id, ...newDoc.data() };
}

// List comments (paged, oldest first for readability)
export async function listComments(thoughtId, { limit = 20, cursor = null }) {
  const db = getFirestore();
  let query = db.collection(COLLECTIONS.THOUGHTS).doc(thoughtId)
    .collection('comments').orderBy('createdAt', 'asc').limit(limit);

  if (cursor) {
    const cDoc = await db.collection(COLLECTIONS.THOUGHTS).doc(thoughtId)
      .collection('comments').doc(cursor).get();
    if (cDoc.exists) query = query.startAfter(cDoc);
  }

  const snap = await query.get();
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const nextCursor = snap.docs.length ? snap.docs[snap.docs.length - 1].id : null;
  return { items, nextCursor };
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

function toCacheDocId(key) {
  // Firestore document IDs cannot contain forward slashes
  return String(key).replace(/\//g, '__');
}

export async function getCache(key, maxAgeSeconds = 300) {
  const db = getFirestore();
  const docId = toCacheDocId(key);
  const doc = await db.collection(COLLECTIONS.CACHE).doc(docId).get();
  
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

  const docId = toCacheDocId(key);

  await db.collection(COLLECTIONS.CACHE).doc(docId).set({
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


export async function createCommunity({ name, description, imageUrl, creatorId }) {
  const db = getFirestore();
  const now = new Date().toISOString();
  const payload = {
    name,
    description: description || '',
    imageUrl: imageUrl || null,
    createdAt: now,
    createdBy: creatorId || null,
  };
  const ref = await db.collection(COLLECTIONS.COMMUNITIES).add(payload);
  return { id: ref.id, ...payload };
}

export async function listCommunities(uid) {
  const db = getFirestore();
  const snap = await db.collection(COLLECTIONS.COMMUNITIES)
    .orderBy('createdAt', 'desc')
    .limit(200)
    .get();
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  if (!uid) return items;

  // join favourites
  const favSnap = await db.collection(COLLECTIONS.USERS)
    .doc(String(uid))
    .collection('community_favourites')
    .get();
  const favSet = new Set(favSnap.docs.filter(x => x.data()?.favourited).map(x => x.id));
  return items.map(x => ({ ...x, favourited: favSet.has(x.id) }));
}

export async function setUserFavouriteCommunity(uid, communityId, favourited) {
  const db = getFirestore();
  const ref = db.collection(COLLECTIONS.USERS)
    .doc(String(uid))
    .collection('community_favourites')
    .doc(String(communityId));
  if (favourited) {
    await ref.set({ favourited: true, updatedAt: new Date().toISOString() }, { merge: true });
  } else {
    await ref.set({ favourited: false, updatedAt: new Date().toISOString() }, { merge: true });
  }
}




export { COLLECTIONS };
