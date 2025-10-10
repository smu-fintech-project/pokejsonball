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
import { getCert } from '../services/psaService.js';
import { upsertCard } from '../db.js';

async function seedUsers() {
  const db = getFirestore();

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

  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    const userCerts = [];
    const idx = i * 2;
    if (certs[idx]) userCerts.push(certs[idx]);
    if (certs[idx + 1]) userCerts.push(certs[idx + 1]);

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
    };

    const ref = await db.collection('users').add(userDoc);
    console.log(`Created user ${u.email} (id=${ref.id}) with certs: ${JSON.stringify(userCerts)}`);
  }

  console.log('✅ Seed users complete');
}

async function syncCerts(certNumbers) {
  console.log(`\n🔄 Syncing ${certNumbers.length} certs...\n`);

  for (let i = 0; i < certNumbers.length; i++) {
    const certNumber = certNumbers[i];

    try {
      const certData = await getCert(certNumber);

      const cardData = {
        cert_number: certNumber,
        card_name: certData.item_title,
        set_name: certData.brand_title || 'Unknown',
        psa_grade: certData.grade ? parseInt(certData.grade.replace(/[^\d]/g, '')) : null,
        release_year: certData.year ? parseInt(certData.year) : null,
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

  // 2️⃣ Collect all certs from users
  const db = getFirestore();
  const snap = await db.collection('users').get();
  const certsToSync = new Set();
  snap.forEach(doc => {
    const data = doc.data();
    if (Array.isArray(data.cards)) data.cards.forEach(c => certsToSync.add(c));
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
