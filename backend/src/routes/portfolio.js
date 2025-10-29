/**
 * Portfolio Routes
 * Handles portfolio history and analytics
 */

import express from 'express';
import admin from 'firebase-admin';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/portfolio/history
 * Get user's portfolio history (time series data)
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    console.log(`\n📊 Fetching portfolio history for user: ${userId}`);
    
    // Get Firestore instance
    const db = admin.firestore();
    
    // Fetch all portfolio history documents for this user
    const historySnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('portfolio_history')
      .orderBy('time', 'asc')
      .get();
    
    if (historySnapshot.empty) {
      console.log('  ⚠️  No portfolio history found');
      return res.json([]);
    }
    
    // Map documents to array
    const historyData = historySnapshot.docs.map(doc => doc.data());
    
    console.log(`  ✅ Found ${historyData.length} data points`);
    
    res.json(historyData);
    
  } catch (error) {
    console.error('❌ Error fetching portfolio history:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch portfolio history'
    });
  }
});

/**
 * GET /api/portfolio/stats
 * Get portfolio statistics (optional endpoint for future use)
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    console.log(`\n📈 Fetching portfolio stats for user: ${userId}`);
    
    const db = admin.firestore();
    
    // Get latest portfolio value
    const historySnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('portfolio_history')
      .orderBy('time', 'desc')
      .limit(1)
      .get();
    
    let currentValue = 0;
    let previousValue = 0;
    let changePercent = 0;
    
    if (!historySnapshot.empty) {
      currentValue = historySnapshot.docs[0].data().value || 0;
      
      // Get value from 24 hours ago
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const yesterdayDoc = await db
        .collection('users')
        .doc(userId)
        .collection('portfolio_history')
        .doc(yesterdayStr)
        .get();
      
      if (yesterdayDoc.exists) {
        previousValue = yesterdayDoc.data().value || 0;
        if (previousValue > 0) {
          changePercent = ((currentValue - previousValue) / previousValue) * 100;
        }
      }
    }
    
    res.json({
      currentValue,
      previousValue,
      changePercent: parseFloat(changePercent.toFixed(2))
    });
    
  } catch (error) {
    console.error('❌ Error fetching portfolio stats:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch portfolio stats'
    });
  }
});

export default router;

