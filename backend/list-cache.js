/**
 * List all cache entries
 */

import { getFirestore } from './src/services/firebase.js';

console.log('📋 Listing all cache entries...\n');

const db = getFirestore();
const snapshot = await db.collection('api_cache').get();

console.log(`Total cache entries: ${snapshot.size}\n`);

if (snapshot.size > 0) {
  snapshot.docs.forEach((doc, index) => {
    const data = doc.data();
    const age = data.updated_at ? 
      Math.floor((Date.now() - new Date(data.updated_at).getTime()) / 1000) : 'unknown';
    
    console.log(`${index + 1}. Key: ${doc.id}`);
    console.log(`   Age: ${age}s`);
    console.log(`   Payload (first 100 chars): ${data.payload ? data.payload.substring(0, 100) : 'empty'}...`);
    console.log('');
  });
} else {
  console.log('No cache entries found');
}

process.exit(0);

