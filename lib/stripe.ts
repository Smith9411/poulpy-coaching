import Stripe from 'stripe';

const rawKey = process.env.STRIPE_SECRET_KEY?.trim();

// Clé de secours pour ne pas faire planter l'analyse statique de Next.js pendant le build Vercel
export const stripe = new Stripe(rawKey || 'sk_test_placeholder_for_build_only', {
  apiVersion: '2025-01-27.acacia' as any,
});

export const isStripeConfigured = Boolean(
  rawKey && rawKey.startsWith('sk_') && !rawKey.includes('placeholder')
);

