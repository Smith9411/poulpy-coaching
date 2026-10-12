import { NextRequest, NextResponse } from 'next/server';
import { confirmStripeBooking } from '@/lib/confirmBooking';

export const dynamic = 'force-dynamic';

/**
 * POST /api/bookings/confirm?session_id=...
 * ou GET /api/bookings/confirm?session_id=...
 * Valide le paiement Stripe et crée la réservation de coaching.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID requis' }, { status: 400 });
  }

  const result = await confirmStripeBooking(sessionId);
  if (result.error) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let sessionId = searchParams.get('session_id');

  if (!sessionId) {
    try {
      const body = await req.json();
      sessionId = body.sessionId || body.session_id;
    } catch {
      // Ignorer si pas de body JSON
    }
  }

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID requis' }, { status: 400 });
  }

  const result = await confirmStripeBooking(sessionId);
  if (result.error) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
