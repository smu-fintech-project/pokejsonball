import express from 'express';
import Stripe from 'stripe';
import admin from 'firebase-admin';
import 'dotenv/config'; 

const router = express.Router();
console.log('Stripe Key:', process.env.STRIPE_SECRET_KEY);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);



// ONE webhook handler with ALL event types
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

  try {
    // Handle payment success
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const { userId, jsbAmount } = paymentIntent.metadata;

      if (userId && jsbAmount) {
        await creditUserWallet(userId, parseInt(jsbAmount), paymentIntent.id);
      }
    }
    
    // Handle transfer created
    if (event.type === 'transfer.created') {
      const transfer = event.data.object;
      await handleTransferCreated(transfer);
    }
    
    // Handle account updated
    if (event.type === 'account.updated') {
      const account = event.data.object;
      await handleAccountUpdated(account);
    }

    res.json({received: true});
    
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({error: 'Webhook handler failed'});
  }
});

// Helper to credit JSB to user
async function creditUserWallet(userId, jsbAmount, paymentIntentId) {
  const db = admin.firestore();
  const userRef = db.collection('users').doc(userId);

  try {
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const currentBalance = userDoc.data().wallet?.balance || 0;

      transaction.update(userRef, {
        'wallet.balance': currentBalance + jsbAmount
      });

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

// Handle transfer created
async function handleTransferCreated(transfer) {
  const db = admin.firestore();
  const { userId } = transfer.metadata;
  
  if (!userId) return;
  
  try {
    const txSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('transactions')
      .where('transferId', '==', transfer.id)
      .limit(1)
      .get();
    
    if (!txSnapshot.empty) {
      const txDoc = txSnapshot.docs[0];
      await txDoc.ref.update({
        status: 'completed'
      });
      console.log(`Transfer ${transfer.id} completed for user ${userId}`);
    }
  } catch (error) {
    console.error('Error handling transfer:', error);
  }
}

// Handle account updates
async function handleAccountUpdated(account) {
  const db = admin.firestore();
  
  try {
    const usersSnapshot = await db
      .collection('users')
      .where('stripeConnectAccountId', '==', account.id)
      .limit(1)
      .get();
    
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      await userDoc.ref.update({
        stripeAccountStatus: {
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          details_submitted: account.details_submitted
        }
      });
      console.log(`Updated account status for ${account.id}`);
    }
  } catch (error) {
    console.error('Error updating account status:', error);
  }
}

export default router;
