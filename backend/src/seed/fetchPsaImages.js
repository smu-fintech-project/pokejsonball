// Script to fetch PSA images for all cards and update the database
import dotenv from 'dotenv';
import axios from 'axios';
import { getDb } from '../db.js';

dotenv.config();

const PSA_API_BASE = 'https://api.psacard.com/publicapi';
const PSA_TOKEN = process.env.PSA_API_KEY;

async function fetchPsaImage(certNumber) {
  if (!PSA_TOKEN || PSA_TOKEN.length < 10) {
    console.error('❌ PSA_API_KEY not configured in .env');
    return null;
  }

  try {
    console.log(`📡 Fetching PSA images for cert: ${certNumber}`);
    
    const url = `${PSA_API_BASE}/cert/GetImagesByCertNumber/${certNumber}`;
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${PSA_TOKEN}`,
        'Accept': 'application/json',
      },
      timeout: 10000
    });

    if (Array.isArray(response.data) && response.data.length > 0) {
      // Find front image
      const frontImage = response.data.find(img => img.IsFrontImage === true);
      const imageUrl = frontImage?.ImageURL || response.data[0]?.ImageURL;
      
      if (imageUrl) {
        console.log(`✅ Found image for cert ${certNumber}: ${imageUrl.substring(0, 60)}...`);
        return imageUrl;
      }
    }
    
    console.warn(`⚠️  No images found for cert ${certNumber}`);
    return null;
    
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn(`⚠️  Cert ${certNumber} not found in PSA API`);
    } else if (error.response?.status === 429) {
      console.warn(`⏰ Rate limit hit for cert ${certNumber}, waiting 2s...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return fetchPsaImage(certNumber); // Retry once
    } else {
      console.error(`❌ Error fetching cert ${certNumber}:`, error.message);
    }
    return null;
  }
}

async function updateAllImages() {
  console.log('\n🖼️  Starting PSA Image Fetch...\n');
  
  const db = getDb();
  const cards = db.prepare('SELECT cert_number, card_name FROM cards ORDER BY id').all();
  
  console.log(`📊 Found ${cards.length} cards to process\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    console.log(`\n[${i + 1}/${cards.length}] Processing: ${card.card_name} (${card.cert_number})`);
    
    const imageUrl = await fetchPsaImage(card.cert_number);
    
    if (imageUrl) {
      // Update database
      db.prepare('UPDATE cards SET image_url = ? WHERE cert_number = ?')
        .run(imageUrl, card.cert_number);
      successCount++;
      console.log(`💾 Updated database with image URL`);
    } else {
      failCount++;
    }
    
    // Rate limiting: wait 500ms between requests
    if (i < cards.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ PSA Image Fetch Complete!');
  console.log(`📊 Success: ${successCount} / ${cards.length}`);
  console.log(`❌ Failed: ${failCount} / ${cards.length}`);
  console.log('='.repeat(60) + '\n');
}

updateAllImages().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
