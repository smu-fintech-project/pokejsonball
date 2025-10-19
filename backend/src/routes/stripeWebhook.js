import express from 'express';
import Stripe from 'stripe';
import admin from 'firebase-admin';
import 'dotenv/config'; 

const router = express.Router();
console.log('Stripe Key:', process.env.STRIPE_SECRET_KEY);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);



router.post('/', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { userId, jsbAmount } = paymentIntent.metadata;

    if (userId && jsbAmount) {
      await creditUserWallet(userId, parseInt(jsbAmount), paymentIntent.id);
    }
  }

  res.json({received: true});
});

// Helper to credit JSB to user
async function creditUserWallet(userId, jsbAmount, paymentIntentId) {
  const db = admin.firestore();
  const userRef = db.collection('users').doc(userId);

  try {
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const currentBalance = userDoc.data().wallet?.balance || 0;

      // Update balance
      transaction.update(userRef, {
        'wallet.balance': currentBalance + jsbAmount
      });

      // Create transaction record
      const txRef = userRef.collection('transactions').doc();
      transaction.set(txRef, {
        type: 'deposit',
        amount: jsbAmount,
        paymentIntentId,
        description: `Purchased ${jsbAmount} JSB`,
        timestamp: new Date().toISOString(),
        balanceAfter: currentBalance + jsbAmount
      });
    });

    console.log(`Credited ${jsbAmount} JSB to user ${userId}`);
  } catch (error) {
    console.error('Error crediting wallet:', error);
  }
}

export default router;
