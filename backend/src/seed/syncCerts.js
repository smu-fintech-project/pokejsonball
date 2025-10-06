/**
 * PSA Cert Sync Script
 * 
 * Fetches latest PSA metadata, images, and sales data
 * Stores in BOTH api_cache AND cards collection
 */

import dotenv from 'dotenv';
import { getCert } from '../services/psaService.js';
import { upsertCard } from '../db.js';
import CERT_NUMBERS from '../config/certs.js';

dotenv.config();

/**
 * Sync all PSA certs from the config
 */
async function syncAllCerts() {
  console.log('\n🔄 Starting PSA Cert Sync...\n');
  
  try {
    console.log(`📋 Syncing ${CERT_NUMBERS.length} certs from config\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each cert
    for (let i = 0; i < CERT_NUMBERS.length; i++) {
      const certNumber = CERT_NUMBERS[i];
      
      console.log(`\n[${i + 1}/${CERT_NUMBERS.length}] Processing cert: ${certNumber}`);
      
      try {
        // Fetch PSA cert data (automatically caches in api_cache)
        const certData = await getCert(certNumber);
        
        // Prepare card data for cards collection
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
        
        // Remove undefined values to avoid Firestore errors
        Object.keys(cardData).forEach(key => {
          if (cardData[key] === undefined) {
            delete cardData[key];
          }
        });
        
        // Update in cards collection
        await upsertCard(cardData);
        
        console.log(`  ✅ Updated: ${certData.item_title} (Grade: ${certData.grade})`);
        if (certData.last_sale?.price) {
          console.log(`  💰 Last sale: $${certData.last_sale.price} (${certData.last_sale.source})`);
        }
        
        successCount++;
        
        // Small delay to respect rate limits
        if (i < CERT_NUMBERS.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 250));
        }
        
      } catch (error) {
        console.error(`  ❌ Error syncing cert ${certNumber}:`, error.message);
        errorCount++;
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Sync Complete');
    console.log('='.repeat(60));
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📋 Total: ${CERT_NUMBERS.length}`);
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  }
}

/**
 * Sync specific certs by cert numbers
 */
async function syncSpecificCerts(certNumbers) {
  console.log(`\n🔄 Syncing ${certNumbers.length} specific certs...\n`);
  
  try {
    for (let i = 0; i < certNumbers.length; i++) {
      const certNumber = certNumbers[i];
      console.log(`\n[${i + 1}/${certNumbers.length}] Processing cert: ${certNumber}`);
      
      try {
        // Fetch PSA cert data (automatically caches in api_cache)
        const certData = await getCert(certNumber);
        
        // Prepare card data for cards collection
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
        
        // Remove undefined values
        Object.keys(cardData).forEach(key => {
          if (cardData[key] === undefined) {
            delete cardData[key];
          }
        });
        
        // Update in cards collection
        await upsertCard(cardData);
        
        console.log(`  ✅ Updated: ${certData.item_title} (Grade: ${certData.grade})`);
        
        if (i < certNumbers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 250));
        }
      } catch (error) {
        console.error(`  ❌ Error:`, error.message);
      }
    }
    
    console.log('\n✅ Sync complete!\n');
    
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  }
}

// CLI execution
const args = process.argv.slice(2);

if (args.length > 0) {
  // Sync specific certs
  const certNumbers = args[0].split(',').map(c => c.trim());
  syncSpecificCerts(certNumbers)
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
} else {
  // Sync all certs
  syncAllCerts()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

