/**
 * Seed Portfolio History Script
 * 
 * This script backfills 100 days of historical portfolio data for all users.
 * It creates fake historical data points using a random walk algorithm.
 */

import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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
      .where('status', 'in', ['display', 'listed'])
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
 * Generate historical data using random walk algorithm
 */
function generateHistoricalData(currentValue, days = 100) {
  const historicalData = [];
  
  // Start with a baseline (70% of current value)
  const baselineValue = currentValue * 0.7;
  
  for (let i = days - 1; i >= 0; i--) {
    // Generate timestamp for this day
    const date = new Date();
    date.setDate(date.getDate() - i);
    const timestamp = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    let value;
    if (i === days - 1) {
      // First point: use baseline
      value = baselineValue;
    } else {
      // Subsequent points: random walk (±3% change)
      const previousValue = historicalData[historicalData.length - 1].value;
      const randomFactor = 1 + (Math.random() - 0.5) * 0.06; // -3% to +3%
      value = previousValue * randomFactor;
    }
    
    historicalData.push({
      time: timestamp,
      value: parseFloat(value.toFixed(2))
    });
  }
  
  // Add today's real value as the last point
  const today = new Date().toISOString().split('T')[0];
  historicalData.push({
    time: today,
    value: parseFloat(currentValue.toFixed(2))
  });
  
  return historicalData;
}

/**
 * Backfill portfolio history for all users
 */
async function backfillPortfolioHistory() {
  console.log('🚀 Starting Portfolio History Backfill Script\n');
  console.log('=' .repeat(60));
  
  try {
    // Get Firestore instance
    const db = admin.firestore();
    
    // Fetch all users
    console.log('\n👥 Fetching all users from database...');
    const usersSnapshot = await db.collection('users').get();
    
    console.log(`✅ Found ${usersSnapshot.docs.length} users\n`);
    console.log('=' .repeat(60));
    
    if (usersSnapshot.empty) {
      console.log('No users to process. Exiting.');
      return;
    }
    
    // Statistics
    const stats = {
      total: usersSnapshot.docs.length,
      processed: 0,
      success: 0,
      skipped: 0,
      failed: 0,
    };
    
    // Process each user
    for (let i = 0; i < usersSnapshot.docs.length; i++) {
      const userDoc = usersSnapshot.docs[i];
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      console.log(`\n[${i + 1}/${usersSnapshot.docs.length}] Processing user: ${userData.email || userId}`);
      
      // Calculate current portfolio value
      const currentValue = await calculateCurrentPortfolioValue(db, userId);
      
      console.log(`  Current portfolio value: $${currentValue.toFixed(2)}`);
      
      // Skip users with zero value
      if (currentValue === 0) {
        console.log(`  ⏭️  Skipping (no portfolio value)`);
        stats.skipped++;
        stats.processed++;
        continue;
      }
      
      // Generate historical data
      console.log(`  📊 Generating 100 days of historical data...`);
      const historicalData = generateHistoricalData(currentValue, 100);
      
      // Batch write to Firestore
      console.log(`  💾 Writing ${historicalData.length} data points to Firestore...`);
      
      try {
        // Write in batches of 500 (Firestore limit)
        const batchSize = 500;
        for (let j = 0; j < historicalData.length; j += batchSize) {
          const batch = db.batch();
          const chunk = historicalData.slice(j, j + batchSize);
          
          for (const dataPoint of chunk) {
            const docRef = db
              .collection('users')
              .doc(userId)
              .collection('portfolio_history')
              .doc(dataPoint.time); // Use date as document ID
            
            batch.set(docRef, dataPoint);
          }
          
          await batch.commit();
        }
        
        console.log(`  ✅ Successfully wrote portfolio history`);
        stats.success++;
      } catch (error) {
        console.error(`  ❌ Failed to write data: ${error.message}`);
        stats.failed++;
      }
      
      stats.processed++;
    }
    
    // Print summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Total users:       ${stats.total}`);
    console.log(`Processed:         ${stats.processed}`);
    console.log(`✅ Success:        ${stats.success}`);
    console.log(`⏭️  Skipped:        ${stats.skipped}`);
    console.log(`❌ Failed:         ${stats.failed}`);
    console.log('=' .repeat(60));
    console.log('\n✨ Script completed!\n');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      })
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    process.exit(1);
  }
}

// Run the script
backfillPortfolioHistory()
  .then(() => {
    console.log('👋 Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });

