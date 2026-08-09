import Stripe from 'stripe';

let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY não configurada.');
    client = new Stripe(key, { apiVersion: '2025-02-24.acacia' });
  }
  return client;
}
