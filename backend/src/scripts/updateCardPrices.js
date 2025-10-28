/**
 * Update Card Prices Script
 * 
 * This script fetches all cards from the database, queries the Pokemon TCG API
 * for pricing data, and updates each card with the average sell price from Cardmarket.
 */

import axios from 'axios';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { getAllCards, upsertCard } from '../services/firebaseDb.js';

// Load environment variables
dotenv.config();

// Set name to Set ID mapping
const SET_NAME_TO_ID = {
  'POKEMON PRE EN-PRISMATIC EVOLUTIONS': 'sv8pt5',
  'PRISMATIC EVOLUTIONS': 'sv8pt5',
  'POKEMON PRE EN-PRISMATIC EVOLUTIONS': 'sv8pt5',
  'POKEMON SVP EN-SV BLACK STAR PROMO': 'svp',
  'BLACK STAR PROMOS': 'svp',
  'BLACK STAR PROMO': 'svp',
  // Add more mappings as needed
};

/**
 * Create Pokemon TCG API client
 */
function createTCGClient() {
  const apiKey = process.env.POKEMON_TCG_API_KEY;
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // API key is optional but recommended for higher rate limits
  if (apiKey && apiKey.length > 10) {
    headers['X-Api-Key'] = apiKey;
  }

  return axios.create({
    baseURL: 'https://api.pokemontcg.io/v2',
    timeout: 300000,
    headers,
  });
}

/**
 * Normalize set name for mapping lookup
 */
function normalizeSetName(setName) {
  if (!setName) return null;
  return setName.toUpperCase().trim();
}

/**
 * Get set ID from set name
 */
function getSetIdFromName(setName) {
  const normalized = normalizeSetName(setName);
  if (!normalized) return null;
  
  // Try direct lookup
  if (SET_NAME_TO_ID[normalized]) {
    return SET_NAME_TO_ID[normalized];
  }
  
  // Try partial matches
  for (const [key, value] of Object.entries(SET_NAME_TO_ID)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  return null;
}

/**
 * Fetch card pricing data from Pokemon TCG API
 * Uses direct card ID lookup: /cards/{setId}-{cardNumber}
 */
async function fetchCardPrice(setId, cardNumber) {
  try {
    const client = createTCGClient();
    
    // Remove leading zeros from card number (e.g., "014" -> "14", "001" -> "1")
    const cleanNumber = String(cardNumber).trim().replace(/^0+/, '') || '0';
    
    // Construct card ID: setId-cardNumber (e.g., "sv8pt5-14" or "svp-123")
    const cardId = `${setId}-${cleanNumber}`;
    
    console.log(`Fetching card: ${cardId}`);
    
    const response = await client.get(`/cards/${cardId}`);

    const card = response.data?.data;
    
    if (!card) {
      console.warn(`No card found for ID: ${cardId}`);
      return null;
    }
    
    // Extract tcgplayer market price
    // Try different price types in priority order
    const prices = card.tcgplayer?.prices;
    let marketPrice = null;
    
    if (prices) {
      // Priority: holofoil > reverseHolofoil > normal > unlimitedHolofoil > 1stEditionHolofoil
      const priceTypes = ['holofoil', 'reverseHolofoil', 'normal', 'unlimitedHolofoil', '1stEditionHolofoil'];
      
      for (const type of priceTypes) {
        if (prices[type]?.market) {
          marketPrice = prices[type].market;
          console.log(`Found price (${type}): $${marketPrice}`);
          break;
        }
      }
    }
    
    if (marketPrice) {
      return marketPrice;
    } else {
      console.warn(`Card found but no market price available`);
      return null;
    }

  } catch (error) {
    if (error.response?.status === 404) {
      console.error(`Card not found (404)`);
    } else {
      console.error(`API error: ${error.response?.status || error.message}`);
    }
    return null;
  }
}

/**
 * Update a single card with pricing data
 */
async function updateCardPrice(card) {
  const { cert_number, set_name, card_number, card_name } = card;
  
  console.log(`\n📇 Processing: ${card_name || 'Unknown'} (Cert: ${cert_number})`);
  console.log(`   Set: ${set_name} | Number: ${card_number}`);
  
  // Validate required fields
  if (!set_name || !card_number) {
    console.warn(`  ⚠️  Missing set_name or card_number - skipping`);
    return {
      success: false,
      reason: 'missing_data',
    };
  }
  
  // Get set ID from mapping - REQUIRED for API call
  const setId = getSetIdFromName(set_name);
  if (!setId) {
    console.warn(`  ⚠️  No set ID mapping found for: ${set_name} - skipping`);
    return {
      success: false,
      reason: 'no_set_mapping',
    };
  }
  console.log(`   Set ID: ${setId}`);
  
  // Fetch price from API using setId and card_number
  const averageSellPrice = await fetchCardPrice(setId, card_number);
  
  // Update card in database
  try {
    const updatedCard = {
      ...card,
      average_sell_price: averageSellPrice,
      price_updated_at: new Date().toISOString(),
    };
    
    await upsertCard(updatedCard);
    
    console.log(`  💾 Updated in database`);
    
    return {
      success: true,
      price: averageSellPrice,
    };
  } catch (error) {
    console.error(`  ❌ Database update failed: ${error.message}`);
    return {
      success: false,
      reason: 'db_error',
      error: error.message,
    };
  }
}

/**
 * Calculate user's current portfolio value based on their listings
 */
async function calculateCurrentPortfolioValue(db, userId) {
  try {
    // Get all active listings for this user
    const listingsSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('listings')
      .where('status', '==', 'active')
      .get();

    if (listingsSnapshot.empty) {
      return 0;
    }

    let totalValue = 0;

    // For each listing, get the card's average_sell_price
    for (const listingDoc of listingsSnapshot.docs) {
      const listing = listingDoc.data();
      const certNumber = listing.cert_number;

      if (!certNumber) continue;

      // Find the card in the cards collection
      const cardsSnapshot = await db
        .collection('cards')
        .where('cert_number', '==', certNumber)
        .limit(1)
        .get();

      if (!cardsSnapshot.empty) {
        const card = cardsSnapshot.docs[0].data();
        const price = card.average_sell_price || 0;
        totalValue += price;
      }
    }

    return totalValue;
  } catch (error) {
    console.error(`Error calculating portfolio value for user ${userId}:`, error.message);
    return 0;
  }
}

/**
 * Create portfolio snapshots for all users (called after updating card prices)
 */
export async function createPortfolioSnapshots() {
  console.log('\n📸 Creating Portfolio Snapshots...');
  console.log('=' .repeat(60));
  
  try {
    // Get Firestore instance
    const db = admin.firestore();
    
    // Fetch all users
    const usersSnapshot = await db.collection('users').get();
    
    console.log(`\n👥 Processing ${usersSnapshot.docs.length} users...`);
    
    if (usersSnapshot.empty) {
      console.log('No users to process.');
      return;
    }
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    let snapshotsCreated = 0;
    let skipped = 0;
    
    // Process each user
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      // Calculate current portfolio value
      const totalValue = await calculateCurrentPortfolioValue(db, userId);
      
      if (totalValue === 0) {
        skipped++;
        continue;
      }
      
      // Create/update today's snapshot
      await db
        .collection('users')
        .doc(userId)
        .collection('portfolio_history')
        .doc(today)
        .set({
          time: today,
          value: parseFloat(totalValue.toFixed(2))
        });
      
      console.log(`  ✅ ${userData.email || userId}: $${totalValue.toFixed(2)}`);
      snapshotsCreated++;
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log(`📊 Snapshots created: ${snapshotsCreated}`);
    console.log(`⏭️  Skipped (no value): ${skipped}`);
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error creating portfolio snapshots:', error);
  }
}

/**
 * Main function - Update all cards
 */
export async function updateAllCardPrices() {
  console.log('🚀 Starting Card Price Update Script\n');
  console.log('=' .repeat(60));
  
  try {
    // Fetch all cards from database
    console.log('\n📚 Fetching all cards from database...');
    const cards = await getAllCards(1000); // Increase limit if needed
    
    console.log(`✅ Found ${cards.length} cards\n`);
    console.log('=' .repeat(60));
    
    if (cards.length === 0) {
      console.log('No cards to process. Exiting.');
      return;
    }
    
    // Statistics
    const stats = {
      total: cards.length,
      processed: 0,
      success: 0,
      failed: 0,
      noPriceFound: 0,
      missingData: 0,
      noSetMapping: 0,
    };
    
    // Process each card
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      
      // Progress indicator
      const progress = ((i + 1) / cards.length * 100).toFixed(1);
      console.log(`\n[${ i + 1}/${cards.length}] (${progress}%)`);
      
      const result = await updateCardPrice(card);
      
      stats.processed++;
      
      if (result.success) {
        if (result.price !== null) {
          stats.success++;
        } else {
          stats.noPriceFound++;
        }
      } else {
        if (result.reason === 'missing_data') {
          stats.missingData++;
        } else if (result.reason === 'no_set_mapping') {
          stats.noSetMapping++;
        } else {
          stats.failed++;
        }
      }
    }
    
    // Print summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Total cards:           ${stats.total}`);
    console.log(`Processed:             ${stats.processed}`);
    console.log(`✅ Success (w/ price): ${stats.success}`);
    console.log(`⚠️  Success (no price): ${stats.noPriceFound}`);
    console.log(`⚠️  Missing data:       ${stats.missingData}`);
    console.log(`⚠️  No set mapping:     ${stats.noSetMapping}`);
    console.log(`❌ Failed:             ${stats.failed}`);
    console.log('=' .repeat(60));
    console.log('\n✨ Card prices updated!\n');
    
    // Create portfolio snapshots after updating prices
    await createPortfolioSnapshots();
    
    console.log('\n✨ Script completed!\n');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

if (process.env.RUN_CLI === '1') {
  updateAllCardPrices()
    .then(() => {
      console.log('👋 Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Unhandled error:', error);
      process.exit(1);
    });
}

