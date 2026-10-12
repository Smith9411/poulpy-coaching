import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { confirmStripeBooking } from '@/lib/confirmBooking';

export const dynamic = 'force-dynamic';

/**
 * POST /api/webhooks/stripe
 * Écoute les événements Stripe (ex: checkout.session.completed).
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } catch (err: any) {
        console.error('Erreur signature webhook Stripe:', err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
      }
    } else {
      // Si pas encore de webhookSecret configuré dans Vercel, parser le body JSON
      try {
        event = JSON.parse(rawBody);
      } catch (e) {
        return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 });
      }
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      if (session?.id) {
        await confirmStripeBooking(session.id);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Erreur traitement webhook Stripe:', err);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
