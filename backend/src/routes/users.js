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

export default router;
