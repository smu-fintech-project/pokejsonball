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

// POST /api/offers - Create new offer
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = admin.firestore();
    const {
      cert_number,
      card_name,
      seller_id,
      offer_amount,
      message,
      listing_price
    } = req.body;

    const buyer_email = req.user.email;
    const buyer_name = req.user.username;
    const buyer_id = req.userId;

    // Validation
    if (!cert_number || !seller_id || !offer_amount) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields' 
      });
    }

    // Check buyer has sufficient funds
    const buyerDoc = await db.collection('users').doc(buyer_id).get();
    if (!buyerDoc.exists) {
      return res.status(404).json({ 
        success: false,
        error: 'Buyer not found' 
      });
    }

    const buyerData = buyerDoc.data();
    const buyerBalance = buyerData.wallet?.balance || 0;

    if (buyerBalance < Number(offer_amount)) {
      return res.status(400).json({
        success: false,
        error: 'INSUFFICIENT_FUNDS',
        message: `Insufficient funds. You have JSB ${buyerBalance.toFixed(2)}, but need JSB ${Number(offer_amount).toFixed(2)}`
      });
    }

    // Create offer document
    const offerRef = await db.collection('offers').add({
      cert_number,
      card_name,
      seller_id,
      buyer_id,
      buyer_email,
      buyer_name,
      offer_amount: Number(offer_amount),
      listing_price: Number(listing_price),
      message: message || '',
      status: 'pending', // pending, accepted, rejected, expired
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    console.log(`✅ Offer created: ${offerRef.id} - ${buyer_name} offered JSB ${offer_amount} for cert ${cert_number}`);

    res.json({
      success: true,
      offerId: offerRef.id,
      message: 'Offer sent successfully'
    });

  } catch (error) {
    console.error('❌ Create offer error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create offer' 
    });
  }
});

// GET /api/offers/received - Get offers received by current user
router.get('/received', authenticateToken, async (req, res) => {
  try {
    const db = admin.firestore();
    const userId = req.userId;

    // Get offers where user is the seller
    const offersSnap = await db.collection('offers')
      .where('seller_id', '==', userId)
      .where('status', '==', 'pending')
      .orderBy('created_at', 'desc')
      .get();

    const offers = offersSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, offers });

  } catch (error) {
    console.error('❌ Get received offers error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch offers' 
    });
  }
});

// GET /api/offers/sent - Get offers sent by current user
router.get('/sent', authenticateToken, async (req, res) => {
  try {
    const db = admin.firestore();
    const userId = req.userId;

    const offersSnap = await db.collection('offers')
      .where('buyer_id', '==', userId)
      .orderBy('created_at', 'desc')
      .limit(20)
      .get();

    const offers = offersSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, offers });

  } catch (error) {
    console.error('❌ Get sent offers error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch offers' 
    });
  }
});

// PUT /api/offers/:id/accept - Accept an offer (executes transaction)
router.put('/:id/accept', authenticateToken, async (req, res) => {
  const db = admin.firestore();
  const offerId = req.params.id;
  const sellerId = req.userId;

  try {
    // Get offer
    const offerDoc = await db.collection('offers').doc(offerId).get();
    if (!offerDoc.exists) {
      return res.status(404).json({ 
        success: false,
        error: 'Offer not found' 
      });
    }

    const offer = offerDoc.data();

    // Verify user is the seller
    if (offer.seller_id !== sellerId) {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized' 
      });
    }

    // Check if offer is still pending
    if (offer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Offer is no longer pending'
      });
    }

    // Execute transaction using Firestore transaction
    await db.runTransaction(async (transaction) => {
      // Get buyer and seller docs
      const buyerRef = db.collection('users').doc(offer.buyer_id);
      const sellerRef = db.collection('users').doc(sellerId);
      
      const buyerDoc = await transaction.get(buyerRef);
      const sellerDoc = await transaction.get(sellerRef);

      if (!buyerDoc.exists || !sellerDoc.exists) {
        throw new Error('Buyer or seller not found');
      }

      const buyerData = buyerDoc.data();
      const sellerData = sellerDoc.data();

      const buyerBalance = buyerData.wallet?.balance || 0;
      const sellerBalance = sellerData.wallet?.balance || 0;
      const amount = Number(offer.offer_amount);

      // Check buyer still has funds
      if (buyerBalance < amount) {
        throw new Error('Buyer has insufficient funds');
      }

      // Calculate new balances
      const newBuyerBalance = buyerBalance - amount;
      const newSellerBalance = sellerBalance + amount;

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
        cards: [...buyerCards, offer.cert_number]
      });

      transaction.update(sellerRef, {
        cards: sellerCards.filter(c => c !== offer.cert_number)
      });

      // Update listing status to sold
      const listingRef = sellerRef.collection('listings').doc(offer.cert_number);
      transaction.update(listingRef, {
        status: 'sold',
        sold_to: offer.buyer_id,
        sold_at: new Date().toISOString(),
        sold_price: amount
      });

      // Create buyer transaction record
      const buyerTxRef = buyerRef.collection('transactions').doc();
      transaction.set(buyerTxRef, {
        type: 'purchase',
        amount: amount,
        balanceAfter: newBuyerBalance,
        description: `Purchased ${offer.card_name} from ${sellerData.name}`,
        cert_number: offer.cert_number,
        timestamp: new Date().toISOString(),
        status: 'completed'
      });

      // Create seller transaction record
      const sellerTxRef = sellerRef.collection('transactions').doc();
      transaction.set(sellerTxRef, {
        type: 'sale',
        amount: amount,
        balanceAfter: newSellerBalance,
        description: `Sold ${offer.card_name} to ${offer.buyer_name}`,
        cert_number: offer.cert_number,
        timestamp: new Date().toISOString(),
        status: 'completed'
      });

      // Update offer status
      transaction.update(db.collection('offers').doc(offerId), {
        status: 'accepted',
        accepted_at: new Date().toISOString()
      });
    });

    console.log(`✅ Transaction completed: ${offer.buyer_name} bought ${offer.card_name} for JSB ${offer.offer_amount}`);

    res.json({ 
      success: true, 
      message: 'Offer accepted and transaction completed' 
    });

  } catch (error) {
    console.error('❌ Accept offer error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to accept offer' 
    });
  }
});

// PUT /api/offers/:id/reject - Reject an offer
router.put('/:id/reject', authenticateToken, async (req, res) => {
  try {
    const db = admin.firestore();
    const offerId = req.params.id;
    const sellerId = req.userId;

    // Get offer to verify ownership
    const offerDoc = await db.collection('offers').doc(offerId).get();
    if (!offerDoc.exists) {
      return res.status(404).json({ 
        success: false,
        error: 'Offer not found' 
      });
    }

    const offer = offerDoc.data();
    if (offer.seller_id !== sellerId) {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized' 
      });
    }

    await db.collection('offers').doc(offerId).update({
      status: 'rejected',
      rejected_at: new Date().toISOString()
    });

    res.json({ success: true, message: 'Offer rejected' });

  } catch (error) {
    console.error('❌ Reject offer error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to reject offer' 
    });
  }
});

export default router;