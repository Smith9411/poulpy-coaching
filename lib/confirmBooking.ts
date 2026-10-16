import { stripe } from './stripe';
import { createClient } from '@supabase/supabase-js';
import { createNotionBooking } from './notion';
import { sendBookingConfirmationEmail } from './email';
import { runDueBookingReminders } from '@/app/api/cron/reminders/route';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Confirme et enregistre définitivement une réservation Stripe
 * SEULEMENT après confirmation du paiement (payment_status === 'paid').
 * - Idempotente : ne crée jamais de doublon si appelée plusieurs fois.
 * - Enregistre dans coaching_bookings (status: 'confirmed')
 * - Bloque le créneau dans coaching_slots (is_booked: true)
 * - Synchronise dans Notion Calendar
 * - Active in_coaching sur le profil
 * - Déclenche automatiquement le webhook Discord Supabase
 */
export async function confirmStripeBooking(sessionId: string) {
  if (!sessionId) {
    return { error: 'Identifiant de session Stripe manquant.' };
  }

  try {
    // 1. Récupération et vérification de la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      return { error: 'Session Stripe introuvable.' };
    }

    if (session.payment_status !== 'paid') {
      return {
        error: 'Le paiement n\'a pas encore été validé.',
        payment_status: session.payment_status,
      };
    }

    // 2. Vérification d'idempotence (évite les doublons webhook vs retour client)
    const { data: existingBooking } = await supabase
      .from('coaching_bookings')
      .select('*')
      .ilike('admin_notes', `%stripe_session:${sessionId}%`)
      .maybeSingle();

    if (existingBooking) {
      return { success: true, booking: existingBooking, alreadyProcessed: true };
    }

    const meta = session.metadata || {};
    const {
      userId,
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
    } = meta;

    if (!bookingDate || !bookingTime || !studentName) {
      return { error: 'Métadonnées de réservation manquantes dans la session Stripe.' };
    }

    const amountStr = session.amount_total
      ? `${(session.amount_total / 100).toFixed(0)} €`
      : (planPrice || '0 €');

    // 3. Insertion officielle dans coaching_bookings
    const { data: newBooking, error: bookingErr } = await supabase
      .from('coaching_bookings')
      .insert({
        user_id: userId || null,
        slot_id: slotId || null,
        plan_id: planId || 'pro',
        plan_name: planName || 'Coaching Pro',
        plan_price: amountStr,
        plan_duration: planDuration || '60 min',
        booking_date: bookingDate,
        booking_time: bookingTime,
        student_name: studentName.trim(),
        student_email: studentEmail.trim().toLowerCase(),
        student_discord: studentDiscord.trim(),
        game: game || 'Valorant',
        notes: notes?.trim() || null,
        status: 'confirmed',
        admin_notes: `Paiement Stripe validé (${amountStr}) [stripe_session:${sessionId}]`,
        read_by_admin: false,
      })
      .select()
      .single();

    if (bookingErr || !newBooking) {
      console.error('Erreur insertion réservation confirmée Stripe:', bookingErr);
      return { error: 'Erreur lors de l\'enregistrement de la réservation.' };
    }

    // 4. Verrouillage du créneau (is_booked = true)
    if (slotId) {
      await supabase
        .from('coaching_slots')
        .update({ is_booked: true, updated_at: new Date().toISOString() })
        .eq('id', slotId);
    } else {
      try {
        await supabase
          .from('coaching_slots')
          .insert({
            date: bookingDate,
            start_time: bookingTime,
            is_active: true,
            is_booked: true,
            created_by: userId || null,
          });
      } catch (slotErr) {
        console.warn('Création auto slot ignorée:', slotErr);
      }
    }

    // 5. Synchronisation automatique Notion Calendar
    try {
      const notionPageId = await createNotionBooking({
        bookingId: newBooking.id,
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim().toLowerCase(),
        studentDiscord: studentDiscord.trim(),
        game: game || 'Valorant',
        planName: planName || 'Coaching Pro',
        planDuration: planDuration || '60 min',
        bookingDate,
        bookingTime,
        notes: notes || undefined,
      });

      if (notionPageId) {
        await supabase
          .from('coaching_bookings')
          .update({ notion_page_id: notionPageId })
          .eq('id', newBooking.id);
      }
    } catch (notionErr) {
      console.error('[Notion Sync Error après Stripe]', notionErr);
    }

    // 6. Attribution du statut in_coaching = true sur le profil élève
    try {
      if (userId) {
        await supabase
          .from('profiles')
          .update({ in_coaching: true })
          .eq('id', userId);
      }
    } catch (e) {
      console.error('Erreur mise à jour profil in_coaching:', e);
    }

    // 7. Envoi de l'email officiel de confirmation avec Google Calendar
    try {
      await sendBookingConfirmationEmail({
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim().toLowerCase(),
        studentDiscord: studentDiscord.trim(),
        planName: planName || 'Coaching E-sport',
        planPrice: planPrice || '10 €',
        planDuration: planDuration || '60 min',
        bookingDate,
        bookingTime,
        game: game || 'Valorant',
      });
    } catch (emailErr) {
      console.error('[Email Dispatch Error après Stripe]', emailErr);
    }

    // 8. Programmer immédiatement le rappel H-2h si la séance a lieu aujourd'hui ou demain
    runDueBookingReminders().catch((e) => console.warn('[Stripe Confirm Reminder Trigger]', e));

    return { success: true, booking: newBooking };
  } catch (err: unknown) {
    console.error('Erreur confirmStripeBooking:', err);
    return { error: 'Erreur interne lors de la confirmation du paiement.' };
  }
}
