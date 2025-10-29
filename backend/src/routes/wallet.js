import express from 'express';
import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';

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

export default router;