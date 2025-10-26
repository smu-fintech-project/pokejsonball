import express from 'express';
import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';

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
    req.user = decoded;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'INVALID_TOKEN',
      message: 'Invalid or expired token'
    });
  }
}

// POST /api/transactions/buy-now - Direct purchase at listing price
router.post('/buy-now', authenticateToken, async (req, res) => {
  const db = admin.firestore();
  const buyerId = req.userId;
  const { cert_number, card_name, seller_id, price } = req.body;

  try {
    // Validation
    if (!cert_number || !seller_id || !price) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Prevent buying your own card
    if (buyerId === seller_id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot buy your own card'
      });
    }

    const amount = Number(price);

    // Execute transaction
    await db.runTransaction(async (transaction) => {
      // Get buyer and seller docs
      const buyerRef = db.collection('users').doc(buyerId);
      const sellerRef = db.collection('users').doc(seller_id);
      
      const buyerDoc = await transaction.get(buyerRef);
      const sellerDoc = await transaction.get(sellerRef);

      if (!buyerDoc.exists || !sellerDoc.exists) {
        throw new Error('Buyer or seller not found');
      }

      const buyerData = buyerDoc.data();
      const sellerData = sellerDoc.data();

      const buyerBalance = buyerData.wallet?.balance || 0;
      const sellerBalance = sellerData.wallet?.balance || 0;

      // Check buyer has sufficient funds
      if (buyerBalance < amount) {
        throw new Error(`INSUFFICIENT_FUNDS: You have JSB ${buyerBalance.toFixed(2)}, but need JSB ${amount.toFixed(2)}`);
      }

      // Calculate new balances
      const newBuyerBalance = buyerBalance - amount;
      const newSellerBalance = sellerBalance + amount;

      console.log(`💰 Buy Now Transaction: Buyer ${buyerBalance} - ${amount} = ${newBuyerBalance}`);
      console.log(`💰 Buy Now Transaction: Seller ${sellerBalance} + ${amount} = ${newSellerBalance}`);

      // Update wallets
      transaction.update(buyerRef, {
        'wallet.balance': newBuyerBalance
      });

      transaction.update(sellerRef, {
        'wallet.balance': newSellerBalance
      });

      // Transfer card ownership
      const buyerCards = buyerData.cards || [];
      const sellerCards = sellerData.cards || [];

      transaction.update(buyerRef, {
        cards: [...buyerCards, cert_number]
      });

      transaction.update(sellerRef, {
        cards: sellerCards.filter(c => c !== cert_number)
      });

      // Update listing status to sold
      const listingRef = sellerRef.collection('listings').doc(cert_number);
      transaction.update(listingRef, {
        status: 'sold',
        sold_to: buyerId,
        sold_at: new Date().toISOString(),
        sold_price: amount
      });

      // Create buyer transaction record
      const buyerTxRef = buyerRef.collection('transactions').doc();
      transaction.set(buyerTxRef, {
        type: 'purchase',
        amount: amount,
        balanceAfter: newBuyerBalance,
        description: `Purchased ${card_name} from ${sellerData.name}`,
        cert_number: cert_number,
        timestamp: new Date().toISOString(),
        status: 'completed'
      });

      // Create seller transaction record
      const sellerTxRef = sellerRef.collection('transactions').doc();
      transaction.set(sellerTxRef, {
        type: 'sale',
        amount: amount,
        balanceAfter: newSellerBalance,
        description: `Sold ${card_name} to ${buyerData.name}`,
        cert_number: cert_number,
        timestamp: new Date().toISOString(),
        status: 'completed'
      });
    });

    console.log(`✅ Buy Now completed: ${req.user.username} bought ${card_name} for JSB ${amount}`);

    res.json({
      success: true,
      message: 'Purchase completed successfully'
    });

  } catch (error) {
    console.error('❌ Buy now error:', error);
    
    if (error.message.startsWith('INSUFFICIENT_FUNDS')) {
      return res.status(400).json({
        success: false,
        error: 'INSUFFICIENT_FUNDS',
        message: error.message.replace('INSUFFICIENT_FUNDS: ', '')
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete purchase'
    });
  }
});

export default router;