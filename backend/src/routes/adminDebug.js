// src/routes/adminDebug.js
import { Router } from 'express';
import admin from 'firebase-admin';

const router = Router();

// Optional: add a simple secret guard via ?key=...
router.get('/firebase-info', async (req, res) => {
  try {
    const db = admin.firestore();
    const usersSnap = await db.collection('users').limit(3).get();
    const cardsSnap = await db.collection('cards').limit(3).get();

    return res.json({
      projectId: admin.app().options?.credential?.projectId || process.env.FIREBASE_PROJECT_ID,
      sampleUsers: usersSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      sampleCards: cardsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      counts_hint: 'This endpoint only returns samples for safety.'
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
