import dotenv from 'dotenv';
import { getDb } from '../db.js';

dotenv.config();

function generateSeedCards(count = 150) {
  const cards = [];
  for (let i = 1; i <= count; i++) {
    const cert = `EEV-${100000 + i}`; // placeholder PSA cert-like format
    const names = ['Eevee','Vaporeon','Jolteon','Flareon','Espeon','Umbreon','Leafeon','Glaceon','Sylveon'];
    const name = names[i % names.length];
    const year = 2021;
    const grade = 7 + (i % 4); // 7-10
    const tcgId = `swsh${i}`;
    cards.push({
      cert_number: cert,
      card_name: `${name} Holo`,
      set_name: 'Eeveelution',
      psa_grade: grade,
      release_year: year,
      pokemon_tcg_id: tcgId,
      series: 'Sword & Shield',
      image_url: null,
      last_known_price: null,
    });
  }
  return cards;
}

async function seed() {
  const db = await getDb();
  const cards = generateSeedCards(150);
  await db.exec('BEGIN');
  try {
    for (const c of cards) {
      await db.run(
        `INSERT OR IGNORE INTO cards (cert_number, card_name, set_name, psa_grade, release_year, pokemon_tcg_id, series, image_url, last_known_price)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        c.cert_number, c.card_name, c.set_name, c.psa_grade, c.release_year, c.pokemon_tcg_id, c.series, c.image_url, c.last_known_price
      );
    }
    await db.exec('COMMIT');
    console.log(`Seeded ${cards.length} Eeveelution cards`);
  } catch (e) {
    await db.exec('ROLLBACK');
    console.error('Seed failed', e);
    process.exitCode = 1;
  }
}

seed();

