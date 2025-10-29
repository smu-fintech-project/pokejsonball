import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export const stripeService = {
  // For JSB purchases (Stripe Payments)
  async createPaymentIntent(amount, userId, jsbAmount) {
    return await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'sgd',
      metadata: {
        userId,
        jsbAmount,
        type: 'jsb_purchase'
      },
      automatic_payment_methods: {
        enabled: true
      }
    });
  },

  // For cash-outs (Stripe Connect)
   async createConnectAccount(email) {
    return await stripe.accounts.create({
      type: 'express',
      country: 'SG',
      email: email,
      capabilities: {
        transfers: { requested: true }
      },
      business_type: 'individual'
    });
  },

  async getConnectAccount(accountId) {
    return await stripe.accounts.retrieve(accountId);
  },

  async createAccountLink(accountId, refreshUrl, returnUrl) {
    return await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
      collect: 'eventually_due'
    });
  },

  async createTransfer(cashAmount, destinationAccountId, metadata) {
    return await stripe.transfers.create({
      amount: Math.round(cashAmount * 100),
      currency: 'sgd',
      destination: destinationAccountId,
      description: 'JSB Cash Out',
      metadata: metadata
    });
  }
};
