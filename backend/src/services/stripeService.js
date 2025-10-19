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
  async createConnectedAccount(email) {
    return await stripe.accounts.create({
      type: 'express',
      email,
      capabilities: {
        transfers: { requested: true }
      }
    });
  },

  async createAccountLink(accountId) {
    return await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.FRONTEND_URL}/wallet/reauth`,
      return_url: `${process.env.FRONTEND_URL}/wallet`,
      type: 'account_onboarding'
    });
  },

  async createTransfer(amount, destinationAccountId, metadata) {
    return await stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency: 'sgd',
      destination: destinationAccountId,
      metadata
    });
  }
};
