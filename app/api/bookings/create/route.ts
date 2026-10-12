import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createNotionBooking } from '@/lib/notion';
import { stripe, isStripeConfigured } from '@/lib/stripe';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const dynamic = 'force-dynamic';

/**
 * POST /api/bookings/create
 * Crée une réservation de coaching pour un élève (sans paiement immédiat).
 * - Vérifie et verrouille le créneau (is_booked = true).
 * - Associe le user_id si l'élève est connecté (ou par recherche de son email).
 * - Enregistre dans coaching_bookings avec read_by_admin = false.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      slotId,
      bookingDate,
      bookingTime,
      planId,
      planName,
      planPrice,
      planDuration,
      studentName,
      studentEmail,
      studentDiscord,
      game,
      notes,
    } = body;

    // Validations obligatoires
    if (!bookingDate || !bookingTime) {
      return NextResponse.json({ error: 'Date et heure du créneau requises.' }, { status: 400 });
    }
    if (!studentName?.trim() || !studentEmail?.trim() || !studentDiscord?.trim()) {
      return NextResponse.json({ error: 'Nom, email et pseudo Discord obligatoires.' }, { status: 400 });
    }
    if (!planId || !planName) {
      return NextResponse.json({ error: 'Formule de coaching requise.' }, { status: 400 });
    }

    // 1. Détection et vérification obligatoire de l'utilisateur connecté
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Vous devez être connecté avec votre compte pour réserver une session de coaching.' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const { data: authData, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !authData?.user) {
      return NextResponse.json(
        { error: 'Session invalide ou expirée. Veuillez vous reconnecter.' },
        { status: 401 }
      );
    }

    const userId = authData.user.id;

    // 2. Vérification et réservation du créneau
    let targetSlotId = slotId;
    const isFreeTrial = planId === 'session';

    if (isFreeTrial) {
      // Séance d'essai gratuite : validation contre le planning gratuit
      let freeSlots: Record<string, boolean> = {};
      try {
        const { data: freeSetting } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'free_trial_slots')
          .maybeSingle();
        if (freeSetting?.value) {
          freeSlots = JSON.parse(freeSetting.value);
        }
      } catch (err) {
        console.warn('Erreur lecture free_trial_slots lors de la réservation:', err);
      }

      const slotKey = `${bookingDate}_${bookingTime}`;
      if (!freeSlots[slotKey]) {
        return NextResponse.json(
          { error: 'Désolé, ce créneau n\'est plus disponible pour les sessions d\'essai gratuites.' },
          { status: 409 }
        );
      }

      // Vérifier si le créneau est déjà réservé par un autre élève
      const { data: foundSlot } = await supabase
        .from('coaching_slots')
        .select('id, is_booked')
        .eq('date', bookingDate)
        .eq('start_time', bookingTime)
        .maybeSingle();

      if (foundSlot?.is_booked) {
        return NextResponse.json(
          { error: 'Désolé, ce créneau vient d\'être réservé par un autre élève.' },
          { status: 409 }
        );
      }

      targetSlotId = foundSlot?.id || null;
    } else {
      // Séance payante : validation dans coaching_slots (is_active && !is_booked)
      if (!targetSlotId) {
        const { data: foundSlot } = await supabase
          .from('coaching_slots')
          .select('id, is_active, is_booked')
          .eq('date', bookingDate)
          .eq('start_time', bookingTime)
          .maybeSingle();

        if (foundSlot) {
          targetSlotId = foundSlot.id;
          if (!foundSlot.is_active || foundSlot.is_booked) {
            return NextResponse.json(
              { error: 'Désolé, ce créneau vient d\'être réservé ou n\'est plus disponible.' },
              { status: 409 }
            );
          }
        }
      } else {
        const { data: slotRecord } = await supabase
          .from('coaching_slots')
          .select('id, is_active, is_booked')
          .eq('id', targetSlotId)
          .single();

        if (!slotRecord || !slotRecord.is_active || slotRecord.is_booked) {
          return NextResponse.json(
            { error: 'Ce créneau n\'est plus disponible. Merci d\'en choisir un autre.' },
            { status: 409 }
          );
        }
      }
    }

    // 3. Calcul du montant de la formule
    let amountInCents = 0;
    const priceStr = String(planPrice || '');
    if (!isFreeTrial) {
      if (planId === 'pro') {
        amountInCents = priceStr.includes('50') ? 5000 : 1000;
      } else if (planId === 'performance') {
        amountInCents = priceStr.includes('60') ? 6000 : 2000;
      }
    }

    // 4. SI FORMULE PAYANTE : Créer la session Stripe SANS créer la réservation ni notifier Discord/Notion
    if (amountInCents > 0 && isStripeConfigured) {
      try {
        const origin = req.headers.get('origin') || 'https://poulpy-coaching.vercel.app';
        const session = await stripe.checkout.sessions.create({
          ui_mode: 'embedded_page',
          customer_email: studentEmail.trim().toLowerCase(),
          line_items: [
            {
              price_data: {
                currency: 'eur',
                unit_amount: amountInCents,
                product_data: {
                  name: `Poulpy Coaching — ${planName}`,
                  description: `Session e-sport sur ${game || 'Valorant / Apex'} (${planDuration || 'Coaching'})`,
                },
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          metadata: {
            userId: userId || '',
            slotId: targetSlotId || '',
            bookingDate,
            bookingTime,
            planId,
            planName,
            planPrice: planPrice || '',
            planDuration: planDuration || '60 min',
            studentName: studentName.trim(),
            studentEmail: studentEmail.trim().toLowerCase(),
            studentDiscord: studentDiscord.trim(),
            game: game || 'Valorant',
            notes: notes?.trim() || '',
          },
          return_url: `${origin}/?booking_success=true&session_id={CHECKOUT_SESSION_ID}`,
        });

        return NextResponse.json({
          success: true,
          requiresPayment: true,
          clientSecret: session.client_secret,
          checkoutUrl: session.url,
        });
      } catch (stripeErr) {
        console.error('Erreur création session Stripe Checkout:', stripeErr);
        return NextResponse.json({ error: 'Impossible d\'initialiser le paiement Stripe.' }, { status: 500 });
      }
    }

    // 5. SI SÉANCE D'ESSAI GRATUITE (0 €) : Création immédiate de la réservation
    const { data: newBooking, error: bookingError } = await supabase
      .from('coaching_bookings')
      .insert({
        user_id: userId,
        slot_id: targetSlotId || null,
        plan_id: planId,
        plan_name: planName,
        plan_price: '0 € (Gratuit)',
        plan_duration: planDuration || '45 min - 1h',
        booking_date: bookingDate,
        booking_time: bookingTime,
        student_name: studentName.trim(),
        student_email: studentEmail.trim().toLowerCase(),
        student_discord: studentDiscord.trim(),
        game: game || 'Valorant',
        notes: notes?.trim() || null,
        status: 'confirmed',
        read_by_admin: false,
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Erreur création réservation gratuite:', bookingError);
      return NextResponse.json({ error: 'Impossible d\'enregistrer la réservation.' }, { status: 500 });
    }

    // Verrouillage du créneau pour séance d'essai
    if (targetSlotId) {
      await supabase
        .from('coaching_slots')
        .update({ is_booked: true, updated_at: new Date().toISOString() })
        .eq('id', targetSlotId);
    }

    // Synchronisation Notion Calendar
    try {
      const notionPageId = await createNotionBooking({
        bookingId: newBooking.id,
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim().toLowerCase(),
        studentDiscord: studentDiscord.trim(),
        game: game || 'Valorant',
        planName,
        planDuration,
        bookingDate,
        bookingTime,
        notes,
      });

      if (notionPageId) {
        await supabase
          .from('coaching_bookings')
          .update({ notion_page_id: notionPageId })
          .eq('id', newBooking.id);
      }
    } catch (notionErr) {
      console.error('[Notion Sync Error]', notionErr);
    }

    // Activer in_coaching sur le profil
    try {
      if (userId) {
        await supabase
          .from('profiles')
          .update({ in_coaching: true })
          .eq('id', userId);
      }
    } catch (e) {
      console.error('Erreur mise à jour in_coaching profil:', e);
    }

    return NextResponse.json({
      success: true,
      booking: newBooking,
      requiresPayment: false,
    });
  } catch (err: unknown) {
    console.error('Erreur POST /api/bookings/create:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}
