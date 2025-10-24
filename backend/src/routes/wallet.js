import express from 'express';
import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import { stripeService } from '../services/stripeService.js';


const router = express.Router(); 

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

// Apply authentication to the route Get Wallet
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
    const { amount } = req.body; 
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




// Check Stripe Connect account status
router.get('/stripe-account-status', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const db = admin.firestore();
    
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND'
      });
    }
    
    const userData = userDoc.data();
    const stripeAccountId = userData.stripeConnectAccountId;
    
    // If no account exists yet
    if (!stripeAccountId) {
      return res.json({
        success: true,
        isOnboarded: false,
        account: null
      });
    }
    
    // Check account status with Stripe
    const account = await stripeService.getConnectAccount(stripeAccountId);
    
    console.log('Account status:', {
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted
    });

    const isOnboarded = account.charges_enabled && account.payouts_enabled;
    
    res.json({
      success: true,
      isOnboarded,
      account: {
        id: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted
      }
    });
    
  } catch (error) {
    console.error('Error checking account status:', error);
    res.status(500).json({
      success: false,
      error: 'ACCOUNT_STATUS_ERROR',
      message: error.message
    });
  }
});

// Create Stripe Connect account and onboarding link
router.post('/create-connect-account', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND'
      });
    }
    
    const userData = userDoc.data();
    let stripeAccountId = userData.stripeConnectAccountId;
    
    // Create new Connect account if user doesn't have one
    if (!stripeAccountId) {
      const account = await stripeService.createConnectAccount(userData.email);
      stripeAccountId = account.id;
      
      // Save to Firestore
      await userRef.update({
        stripeConnectAccountId: stripeAccountId,
        stripeAccountCreatedAt: new Date().toISOString(),
      });
    }
    
    // Create account link for onboarding
    const accountLink = await stripeService.createAccountLink(
      stripeAccountId,
      `${process.env.FRONTEND_URL}/wallet`, // refresh_url
      `${process.env.FRONTEND_URL}/stripe-return` // return_url
    );
    
    res.json({
      success: true,
      url: accountLink.url
    });
    
  } catch (error) {
    console.error('Error creating connect account:', error);
    res.status(500).json({
      success: false,
      error: 'ACCOUNT_CREATION_ERROR',
      message: error.message
    });
  }
});

// Cash out endpoint
router.post('/cash-out', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body; // Amount in JSB
    const userId = req.userId;
    const db = admin.firestore();
    
    // Validate amount
    if (!amount || amount < 10) {
      return res.status(400).json({
        success: false,
        error: 'BELOW_MINIMUM',
        message: 'Minimum withdrawal is 10 JSB'
      });
    }
    
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND'
      });
    }
    
    const userData = userDoc.data();
    
    // Check if user has connected account
    if (!userData.stripeConnectAccountId) {
      return res.status(400).json({
        success: false,
        error: 'NO_STRIPE_ACCOUNT',
        message: 'Please complete verification first'
      });
    }
    
    // Verify account is ready
    const account = await stripeService.getConnectAccount(userData.stripeConnectAccountId);
    if (!account.charges_enabled || !account.payouts_enabled) {
      return res.status(400).json({
        success: false,
        error: 'ACCOUNT_NOT_READY',
        message: 'Your account is not ready for withdrawals yet'
      });
    }
    
    // Check wallet balance
    const currentBalance = userData.wallet?.balance || 0;
    if (currentBalance < amount) {
      return res.status(400).json({
        success: false,
        error: 'INSUFFICIENT_BALANCE',
        message: 'Insufficient JSB balance'
      });
    }
    
    // Conversion rate 1 JSB = 1 SGD
    const cashAmount = amount;
    
    // Create Stripe transfer
    const transfer = await stripeService.createTransfer(
      cashAmount,
      userData.stripeConnectAccountId,
      {
        userId,
        jsbAmount: amount,
        type: 'cash_out'
      }
    );
    
    // Update database in transaction
    await db.runTransaction(async (transaction) => {
      const freshUserDoc = await transaction.get(userRef);
      const freshBalance = freshUserDoc.data().wallet?.balance || 0;
      
      if (freshBalance < amount) {
        throw new Error('Insufficient balance');
      }
      
      const newBalance = freshBalance - amount;
      
      // Update wallet balance
      transaction.update(userRef, {
        'wallet.balance': newBalance
      });
      
      // Create transaction record
      const txRef = userRef.collection('transactions').doc();
      transaction.set(txRef, {
        type: 'withdrawal',
        amount: amount,
        cashValue: cashAmount,
        transferId: transfer.id,
        description: `Cash out ${amount} JSB`,
        timestamp: new Date().toISOString(),
        balanceAfter: newBalance,
        status: 'pending'
      });
    });
    
    res.json({
      success: true,
      transfer: {
        id: transfer.id,
        amount: amount,
        cashValue: cashAmount,
        status: 'pending'
      },
      message: 'Withdrawal initiated. Funds will arrive in 2-7 business days.'
    });
    
  } catch (error) {
    console.error('Cash-out error:', error);
    res.status(500).json({
      success: false,
      error: 'CASHOUT_FAILED',
      message: error.message
    });
  }
});





export default router;