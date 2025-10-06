/**
 * Clear API Cache
 */

import { getFirestore } from './src/services/firebase.js';

console.log('🗑️  Clearing API cache...\n');

const db = getFirestore();
const snapshot = await db.collection('api_cache').get();

console.log(`Found ${snapshot.size} cache entries`);

if (snapshot.size > 0) {
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    console.log(`  - Deleting: ${doc.id}`);
    batch.delete(doc.ref);
  });
  await batch.commit();
  console.log('\n✅ Cache cleared successfully!');
} else {
  console.log('✅ Cache is already empty');
}

process.exit(0);

