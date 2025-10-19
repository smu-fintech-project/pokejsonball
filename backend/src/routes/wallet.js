import express from 'express';
import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import { stripeService } from '../services/stripeService.js';


const router = express.Router(); // ← Capital R

// Authentication middleware
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'AUTH_REQUIRED',
      message: 'No token provided'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // ← This sets req.userId
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'INVALID_TOKEN',
      message: 'Invalid or expired token'
    });
  }
}

// Apply authentication to the route
router.get("/", authenticateToken, async (req, res) => {
  try {
    const db = admin.firestore();
    const userId = req.userId; 
    
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User account not found'
      });
    }

    const userData = userDoc.data();
    const wallet = userData.wallet || { balance: 0, currency: 'JSB' };
    
    // Get transactions snapshot
    const txSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('transactions')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();
    
    // ← Map snapshot to array
    const transactions = txSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({
      success: true,
      wallet,
      transactionCount: transactions.length,
      transactions
    });

  } catch (error) {
    console.error("Wallet fetch error:", error);
    
    // ← Return error response
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch wallet data'
    });
  }
});

// POST /api/wallet/purchase-jsb
router.post('/purchase-jsb', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body; // USD or SGD amount
    const userId = req.userId;

    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    // Conversion rate: $1 = 100 JSB
    const JSB_RATE = 1;
    const jsbAmount = amount * JSB_RATE;

    // Create Stripe Payment Intent
    const paymentIntent = await stripeService.createPaymentIntent(
      amount,
      userId,
      jsbAmount
    );

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      jsbAmount
    });
  } catch (error) {
    console.error("Payment intent error:", error);
    res.status(500).json({
      success: false,
      error: 'PAYMENT_FAILED',
      message: error.message
    });
  }
});


// POST /api/wallet/cashout
router.post('/cashout', authenticateToken, async (req, res) => {
  try {
    const { jsbAmount } = req.body;
    const userId = req.userId;
    const db = admin.firestore();

    const MIN_WITHDRAWAL = 500;
    if (jsbAmount < MIN_WITHDRAWAL) {
      return res.status(400).json({
        success: false,
        error: 'BELOW_MINIMUM',
        message: `Minimum withdrawal is ${MIN_WITHDRAWAL} JSB`
      });
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data();

    if (!userData.stripeConnectedAccountId) {
      return res.status(400).json({
        success: false,
        error: 'NO_BANK_ACCOUNT',
        message: 'Please connect your bank account first'
      });
    }

    const currentBalance = userData.wallet?.balance || 0;
    if (currentBalance < jsbAmount) {
      return res.status(400).json({
        success: false,
        error: 'INSUFFICIENT_BALANCE',
        message: 'Insufficient JSB balance'
      });
    }

    const cashAmount = jsbAmount / 100;

    const transfer = await stripeService.createTransfer(
      cashAmount,
      userData.stripeConnectedAccountId,
      {
        userId,
        jsbAmount,
        type: 'jsb_cashout'
      }
    );

    await db.runTransaction(async (transaction) => {
      const freshUserDoc = await transaction.get(userRef);
      const freshBalance = freshUserDoc.data().wallet?.balance || 0;

      if (freshBalance < jsbAmount) {
        throw new Error('Insufficient balance');
      }

      transaction.update(userRef, {
        'wallet.balance': freshBalance - jsbAmount
      });

      const txRef = userRef.collection('transactions').doc();
      transaction.set(txRef, {
        type: 'withdrawal',
        amount: jsbAmount,
        cashValue: cashAmount,
        transferId: transfer.id,
        description: `Cash out ${jsbAmount} JSB`,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        balanceAfter: freshBalance - jsbAmount
      });
    });

    res.json({
      success: true,
      transferId: transfer.id,
      message: 'Withdrawal initiated. Funds will arrive in 2-7 business days.'
    });
  } catch (error) {
    console.error("Cashout error:", error);
    res.status(500).json({
      success: false,
      error: 'CASHOUT_FAILED',
      message: error.message
    });
  }
});




export default router;