import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBookingReminderEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

let lastOpportunisticCheckAt = 0;

/**
 * Exécute la vérification des rappels de séances à venir (fenêtre large 15 min -> 180 min avant le début)
 * avec verrou anti-doublon strict ([reminder_2h_sent]).
 */
export async function runDueBookingReminders() {
  const now = new Date();

  // Obtenir la date actuelle au format YYYY-MM-DD en tenant compte du fuseau horaire de Paris
  const parisDateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const todayParis = parisDateFormatter.format(now); // "YYYY-MM-DD"

  // Calcul de demain pour couvrir les séances juste après minuit
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowParis = parisDateFormatter.format(tomorrow);

  // Récupérer les séances confirmées ET reportées pour aujourd'hui et demain
  const { data: bookings, error: dbError } = await supabase
    .from('coaching_bookings')
    .select('*')
    .in('booking_date', [todayParis, tomorrowParis])
    .in('status', ['confirmed', 'rescheduled']);

  if (dbError) {
    console.error('[Cron Reminders] Erreur récupération réservations:', dbError);
    throw new Error('Erreur base de données');
  }

  if (!bookings || bookings.length === 0) {
    return {
      message: 'Aucune séance à rappeler sur ce créneau.',
      processed: 0,
      sentCount: 0,
      sentBookingIds: [] as string[],
    };
  }

  const sentReminders: string[] = [];

  // Obtenir l'heure courante à Paris en minutes depuis minuit
  const parisTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const [currentH, currentM] = parisTimeFormatter.format(now).split(':').map(Number);
  const nowMinutes = currentH * 60 + currentM;

  for (const booking of bookings) {
    // Vérifier si le rappel a déjà été envoyé
    const alreadySent =
      Boolean(booking.reminder_sent) ||
      (typeof booking.admin_notes === 'string' && booking.admin_notes.includes('[reminder_2h_sent]'));

    if (alreadySent) {
      continue;
    }

    // Calculer les minutes du début de la séance
    const [bookH, bookM] = (booking.booking_time || '').split(':').map(Number);
    if (isNaN(bookH) || isNaN(bookM)) {
      continue;
    }

    let sessionMinutes = bookH * 60 + bookM;
    if (booking.booking_date === tomorrowParis) {
      sessionMinutes += 24 * 60; // Séance demain
    }

    const diffInMinutes = sessionMinutes - nowMinutes;

    // Fenêtre élargie : entre 15 min et 180 min (3h) avant le début de la séance.
    // Comme chaque réservation envoyée reçoit immédiatement le tag [reminder_2h_sent],
    // l'email n'est envoyé qu'une seule fois tout en absorbant d'éventuels retards du runner GitHub Actions.
    if (diffInMinutes >= 15 && diffInMinutes <= 180) {
      console.log(`[Cron Reminders] Envoi du rappel (H-${diffInMinutes}min) pour ${booking.student_email} (séance à ${booking.booking_time})`);

      // Poser le verrou en base AVANT ou immédiatement après l'envoi pour éviter toute course
      const updatedNotes = `${booking.admin_notes || ''} [reminder_2h_sent]`.trim();

      const res = await sendBookingReminderEmail({
        studentName: booking.student_name,
        studentEmail: booking.student_email,
        studentDiscord: booking.student_discord,
        planName: booking.plan_name,
        planPrice: booking.plan_price || '',
        planDuration: booking.plan_duration || '60 min',
        bookingDate: booking.booking_date,
        bookingTime: booking.booking_time,
        game: booking.game || 'Valorant',
        diffInMinutes,
      });

      if (res && !('error' in res)) {
        const { error: updateError } = await supabase
          .from('coaching_bookings')
          .update({
            reminder_sent: true,
            admin_notes: updatedNotes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', booking.id);

        if (updateError) {
          await supabase
            .from('coaching_bookings')
            .update({
              admin_notes: updatedNotes,
              updated_at: new Date().toISOString(),
            })
            .eq('id', booking.id);
        }

        sentReminders.push(booking.id);
      }
    }
  }

  return {
    success: true,
    processed: bookings.length,
    sentCount: sentReminders.length,
    sentBookingIds: sentReminders,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Déclencheur opportuniste non-bloquant (limité à 1 vérification toutes les 10 minutes par instance)
 */
export function triggerOpportunisticRemindersCheck() {
  const nowMs = Date.now();
  if (nowMs - lastOpportunisticCheckAt < 10 * 60 * 1000) {
    return;
  }
  lastOpportunisticCheckAt = nowMs;
  runDueBookingReminders().catch((err) =>
    console.warn('[Opportunistic Reminders Check Ignored]', err?.message || err)
  );
}

/**
 * GET /api/cron/reminders
 * Tâche Cron automatisée (exécutée toutes les 15 minutes).
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const urlSecret = req.nextUrl.searchParams.get('key');

    if (cronSecret) {
      const isAuthorized =
        authHeader === `Bearer ${cronSecret}` ||
        urlSecret === cronSecret;

      if (!isAuthorized) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
      }
    }

    const result = await runDueBookingReminders();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[Cron Reminders Error]', err);
    return NextResponse.json({ error: err.message || 'Erreur interne' }, { status: 500 });
  }
}
