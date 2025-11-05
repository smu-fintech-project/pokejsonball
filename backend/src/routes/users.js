import express from "express";
import authMiddleware from "../middleware/auth.js";
import { getFirestore } from "../services/firebase.js";

const router = express.Router();

// Protected route: profile info
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const email = req.user?.email;

    const db = getFirestore();
    const snap = await db.collection('users').where('email', '==', email).limit(1).get();
    if (snap.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    const doc = snap.docs[0];
    const data = doc.data();

     return res.json({
      id: doc.id,                 
      email: data.email,
      name: data.name || '',
      username: data.name || '',
      avatar: data.avatar || null,
      userId: doc.id,
      joinDate: data.createdAt || '',
      cards: data.cards || [],   //returns owned cert numbers
      portfolio: data.cards || []  
    });
    
  } catch (e) {
    console.error('profile error', e);
    return res.status(500).json({ error: 'Failed to load profile' });
  }
});

// Fetch reviews for the authenticated user
router.get('/reviews', authMiddleware, async (req, res) => {
  try {
    const email = req.user?.email;
    if (!email) {
      return res.status(400).json({ error: 'Missing authenticated email' });
    }

    const db = getFirestore();
    const userSnap = await db.collection('users').where('email', '==', email).limit(1).get();
    if (userSnap.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userDoc = userSnap.docs[0];
    const reviewsSnap = await userDoc.ref
      .collection('reviews')
      .orderBy('createdAt', 'desc')
      .get();

    const reviews = reviewsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.json({
      userId: userDoc.id,
      email,
      reviews
    });
  } catch (error) {
    console.error('reviews fetch error', error);
    return res.status(500).json({ error: 'Failed to load reviews' });
  }
});

// Public review stats for a given userId
router.get('/:userId/reviews/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const db = getFirestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const reviewsSnap = await userRef.collection('reviews').get();
    let totalRating = 0;
    let count = 0;
    const roleCounts = { buyer: 0, seller: 0, other: 0 };

    reviewsSnap.forEach(doc => {
      const data = doc.data() || {};
      const rating = Number(data.rating);
      if (!Number.isNaN(rating)) {
        totalRating += rating;
        count += 1;
      }
      const role = (data.role || '').toLowerCase();
      if (role === 'buyer' || role === 'seller') {
        roleCounts[role] += 1;
      } else {
        roleCounts.other += 1;
      }
    });

    const averageRating = count ? totalRating / count : 0;

    return res.json({
      userId,
      email: userDoc.get('email') || null,
      name: userDoc.get('name') || null,
      reviewCount: count,
      averageRating: Number(averageRating.toFixed(2)),
      roleCounts
    });
  } catch (error) {
    console.error('review stats error', error);
    return res.status(500).json({ error: 'Failed to load review stats' });
  }
});

export default router;
