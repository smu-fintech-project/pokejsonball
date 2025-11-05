/**
 * seedAndSync.js
 * 
 * 1️⃣ Seeds 5 demo users with 2 certs each
 * 2️⃣ Syncs PSA cert data for all certs in users
 */

import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcrypt';
import { getFirestore } from '../services/firebase.js';
import { getCert, getPSACardDetails } from '../services/psaService.js';
import { upsertCard } from '../db.js';

async function seedUsers() {
  const db = getFirestore();

  // Hardcoded listing prices per cert for demo. Keys MUST be strings.
  const PRICES_BY_CERT = {
    '114363745': 120.0,
    '116676192': 95.0,
    '106930395': 210.0,
    '116676191': 88.0,
    '118761371': 350.0,
    '113699124': 140.0,
    '118630975': 260.0,
    '113699123': 115.0,
    '111144117': 99.0,
    '120432127': 175.0,
    '128414325': 225.0,
    '112196225': 80.0,
    '122817911': 300.0,
    '116230496': 110.0,
    '116496112': 130.0,
    '113550042': 145.0,
    '112593899': 160.0,
    '111515802': 190.0,
    '110761155': 105.0,
  };

  const certs = [
    '114363745', '116676192', '106930395', '116676191',
    '118761371', '113699124', '118630975', '113699123',
    '111144117', '120432127', '128414325', '112196225',
    '122817911', '116230496', '116496112', '113550042',
    '112593899', '111515802', '110761155'
  ];

  const users = [
    { email: 'alice@gmail.com', name: 'Alice' },
    { email: 'bob@gmail.com', name: 'Bob' },
    { email: 'carol@gmail.com', name: 'Carol' },
    { email: 'dave@gmail.com', name: 'Dave' },
    { email: 'eve@gmail.com', name: 'Eve' },
  ];

  const passwordPlain = 'password123';
  const hashed = await bcrypt.hash(passwordPlain, 10);

  const createdUsers = [];

  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    const numUsers = users.length;
    const numCerts = certs.length;
    const certsPerUser = Math.ceil(numCerts / numUsers); // 19 certs / 5 users = 4 (rounded up)

    const startIdx = i * certsPerUser;
    const endIdx = startIdx + certsPerUser;

    // Slice the certs array to get this user's chunk (will be 3 or 4 cards)
    const userCerts = certs.slice(startIdx, endIdx);

    const existing = await db.collection('users').where('email', '==', u.email).get();
    if (!existing.empty) {
      console.log(`Deleting existing user docs for ${u.email}`);
      const batch = db.batch();
      existing.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }

    const userDoc = {
      email: u.email,
      name: u.name,
      password: hashed,
      createdAt: new Date().toISOString(),
      cards: userCerts,
      wallet: {
        balance: 100,
        currency: 'JSB'
      }
    

      

    };




    const ref = await db.collection('users').add(userDoc);
    console.log(`Created user ${u.email} (id=${ref.id}) with certs: ${JSON.stringify(userCerts)}`);
    createdUsers.push({ id: ref.id, email: u.email, name: u.name });

    // Reset and seed listings subcollection for this user
    const listingsCol = ref.collection('listings');
    const existingListings = await listingsCol.get();
    if (!existingListings.empty) {
      const batch = db.batch();
      existingListings.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }

// Loop through ALL assigned certs (e.g., 3 or 4 cards)
for (let j = 0; j < userCerts.length; j++) {
  const cert = userCerts[j];

  // FIRST 2 cards are 'listed' (for landing page)
  // OTHERS are 'display' (not on landing page)
  const listingStatus = (j < 2) ? 'listed' : 'display';

  const price = PRICES_BY_CERT[String(cert)] ?? 0;

  await listingsCol.doc(String(cert)).set({
    cert_number: String(cert),
    listing_price: price,
    sellerEmail: u.email,
    sellerName: u.name,
    sellerId: ref.id,
    status: listingStatus, // <-- This now sets the correct status
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

const listedCount = userCerts.length < 2 ? userCerts.length : 2;
const displayCount = userCerts.length - listedCount;
console.log(` Seeded ${userCerts.length} total listings for ${u.email} (${listedCount} 'listed', ${displayCount} 'display')`);

await createInitialTransactions(db, ref.id, u.name);
}

  await seedSampleReviews(db, createdUsers);

  console.log('✅ Seed users complete');
}

// User Listing Harcoded
async function createUserCards(db, userId, certNumbers, userName) {
  const cardsRef = db.collection('users').doc(userId).collection('cards');

  for (const certNumber of certNumbers) {
    const cardDoc = {
      cert_number: certNumber,
      PSA_price: 0,
      last_sold_price: 0
    };

    await cardsRef.add(cardDoc);
  }

  console.log(`Created ${certNumbers.length} cards for ${userName}`);
}
// Hardcoded transaction History
async function createInitialTransactions(db, userId, userName) {
  const transactionsRef = db.collection('users').doc(userId).collection('transactions');

  // Transaction 1: Initial deposit
  const tx1 = {
    type: 'deposit',
    amount: 100,
    balanceAfter: 100,
    description: 'Welcome bonus - Initial JSB credits',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    status: 'completed'
  };


  await transactionsRef.add(tx1);
  await transactionsRef.add(tx2);

  console.log(`  💳 Created 2 transactions for ${userName}`);
}

async function seedSampleReviews(db, users) {
  if (!users.length) {
    console.log('Skipping review seeding — no users created');
    return;
  }

  console.log('\n📝 Seeding sample reviews...');

  const byEmail = new Map(users.map(user => [user.email, user]));

  const SAMPLE_REVIEWS = [
    {
      revieweeEmail: 'alice@gmail.com',
      entries: [
        {
          reviewerEmail: 'bob@gmail.com',
          rating: 4.9,
          role: 'buyer',
          comment: 'Alice shipped quickly and the card was flawless.',
          daysAgo: 2
        },
        {
          reviewerEmail: 'carol@gmail.com',
          rating: 4.8,
          role: 'seller',
          comment: 'Smooth deal with Alice—she confirmed receipt right away.',
          daysAgo: 10
        }
      ]
    },
    {
      revieweeEmail: 'bob@gmail.com',
      entries: [
        {
          reviewerEmail: 'alice@gmail.com',
          rating: 4.6,
          role: 'seller',
          comment: 'Bob negotiated politely and released funds on time.',
          daysAgo: 5
        },
        {
          reviewerEmail: 'dave@gmail.com',
          rating: 4.9,
          role: 'buyer',
          comment: 'Card arrived double-sleeved with a top loader—perfect!',
          daysAgo: 12
        }
      ]
    },
    {
      revieweeEmail: 'carol@gmail.com',
      entries: [
        {
          reviewerEmail: 'eve@gmail.com',
          rating: 5.0,
          role: 'buyer',
          comment: 'Carol added tracking immediately and included a bonus token.',
          daysAgo: 1
        },
        {
          reviewerEmail: 'alice@gmail.com',
          rating: 4.7,
          role: 'seller',
          comment: 'Very responsive during our trade—would work with Carol again.',
          daysAgo: 8
        }
      ]
    },
    {
      revieweeEmail: 'dave@gmail.com',
      entries: [
        {
          reviewerEmail: 'carol@gmail.com',
          rating: 4.5,
          role: 'buyer',
          comment: 'Dave kept me updated throughout shipping and was appreciative.',
          daysAgo: 4
        },
        {
          reviewerEmail: 'bob@gmail.com',
          rating: 4.8,
          role: 'seller',
          comment: 'Listing was honest and payment cleared immediately.',
          daysAgo: 11
        }
      ]
    },
    {
      revieweeEmail: 'eve@gmail.com',
      entries: [
        {
          reviewerEmail: 'dave@gmail.com',
          rating: 5.0,
          role: 'buyer',
          comment: 'Eve packaged the slabs like a pro—arrived mint.',
          daysAgo: 3
        },
        {
          reviewerEmail: 'alice@gmail.com',
          rating: 4.9,
          role: 'seller',
          comment: 'Friendly swap with Eve—confirmations were lightning fast.',
          daysAgo: 6
        }
      ]
    }
  ];

  for (const block of SAMPLE_REVIEWS) {
    const reviewee = byEmail.get(block.revieweeEmail);
    if (!reviewee) {
      console.warn(`  ⚠️ Skipping reviews for ${block.revieweeEmail} — user not found`);
      continue;
    }

    const reviewsRef = db.collection('users').doc(reviewee.id).collection('reviews');

    // Remove existing reviews for idempotency
    const existing = await reviewsRef.get();
    if (!existing.empty) {
      const batch = db.batch();
      existing.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }

    for (const entry of block.entries) {
      const reviewer = byEmail.get(entry.reviewerEmail);
      const createdAt = entry.createdAt
        ? entry.createdAt
        : new Date(Date.now() - (entry.daysAgo ?? 0) * 24 * 60 * 60 * 1000).toISOString();

      const reviewDoc = {
        reviewerEmail: entry.reviewerEmail,
        reviewerName: reviewer?.name || entry.reviewerEmail,
        reviewerId: reviewer?.id || null,
        role: entry.role,
        rating: entry.rating,
        comment: entry.comment,
        createdAt
      };

      await reviewsRef.add(reviewDoc);
    }

    console.log(`  ⭐ Seeded ${block.entries.length} reviews for ${reviewee.email}`);
  }

  console.log('✅ Sample reviews seeded');
}


async function syncCerts(certNumbers) {
  console.log(`\n🔄 Syncing ${certNumbers.length} certs...\n`);

  for (let i = 0; i < certNumbers.length; i++) {
    const certNumber = certNumbers[i];

    try {
      const certData = await getCert(certNumber);
      let psaDetails = null;
      try {
        psaDetails = await getPSACardDetails(certNumber);
      } catch (e) {
        console.warn('PSA details fetch failed for', certNumber, e.message || e);
      }

      const cardData = {
        cert_number: certNumber,
        card_name: certData.item_title,
        card_number: certData.card_number || psaDetails?.cardNumber || null,
        set_name: certData.brand_title || 'Unknown',
        psa_grade: certData.grade ? parseInt(certData.grade.replace(/[^\d]/g, '')) : null,
        release_year: certData.year ? parseInt(certData.year) : null,
        // PSA-specific fields for frontend modal
        year: psaDetails?.year || certData.year || null,
        grade_description: psaDetails?.gradeDescription || null,
        variety: psaDetails?.variety || certData.variety_pedigree || null,
        cert_date: psaDetails?.certification?.dateGraded || null,
        category: certData.category || null,
        psa_population: certData.psa_population?.toString() || null,
        psa_pop_higher: certData.psa_pop_higher?.toString() || null,
        label_type: certData.label_type || null,
        reverse_barcode: certData.reverse_cert_barcode ? 1 : 0,
        variety_pedigree: certData.variety_pedigree || null,
        last_sale_price: certData.last_sale?.price || null,
        last_sale_date: certData.last_sale?.date || null,
        last_sale_market: certData.last_sale?.market || null,
        last_sale_listing_url: certData.last_sale?.listing_url || null,
        last_sale_source: certData.last_sale?.source || 'TCG_API_FALLBACK',
        image_url: certData.images?.left || null,
        image_back_url: certData.images?.right || null,
      };

      Object.keys(cardData).forEach(key => {
        if (cardData[key] === undefined) delete cardData[key];
      });

      await upsertCard(cardData);

      console.log(`  ✅ Synced cert ${certNumber}: ${certData.item_title} (Grade: ${certData.grade})`);

      if (i < certNumbers.length - 1) await new Promise(r => setTimeout(r, 250));
    } catch (err) {
      console.error(`  ❌ Error syncing cert ${certNumber}:`, err.message);
    }
  }

  console.log('\n✅ All certs synced!\n');
}

async function main() {
  // 1️⃣ Seed users
  await seedUsers();

  // 2️⃣ Collect all certs from listings collectionGroup
  const db = getFirestore();
  const listingsSnap = await db.collectionGroup('listings').get();
  const certsToSync = new Set();
  listingsSnap.forEach(doc => {
    const l = doc.data();
    if (l?.cert_number) certsToSync.add(String(l.cert_number));
  });

  // 3️⃣ Sync certs
  await syncCerts([...certsToSync]);

  console.log('🎉 Seed and Sync Complete!');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
