import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBookingReminderEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/cron/reminders
 * Tâche Cron automatisée Vercel (exécutée toutes les 15 minutes).
 * Détecte les séances confirmées débutant dans environ 2 heures (~90 à 150 minutes)
 * et envoie l'email de rappel anti-no-show.
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Sécurité Vercel Cron (si CRON_SECRET est défini dans .env)
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

    // 2. Définition de la fenêtre temporelle actuelle
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

    // 3. Récupérer les séances confirmées pour aujourd'hui et demain
    const { data: bookings, error: dbError } = await supabase
      .from('coaching_bookings')
      .select('*')
      .in('booking_date', [todayParis, tomorrowParis])
      .eq('status', 'confirmed');

    if (dbError) {
      console.error('[Cron Reminders] Erreur récupération réservations:', dbError);
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({
        message: 'Aucune séance à rappeler sur ce créneau.',
        processed: 0,
        sent: 0,
      });
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

      // Fenêtre cible : la séance commence dans environ 2 heures (entre 75 min et 135 min)
      // Cela garantit qu'avec un cron toutes les 15 minutes, le rappel est envoyé exactement une fois
      if (diffInMinutes >= 75 && diffInMinutes <= 135) {
        console.log(`[Cron Reminders] Envoi du rappel H-2 pour ${booking.student_email} (séance à ${booking.booking_time})`);

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
        });

        if (res && !('error' in res)) {
          // Marquer la réservation pour ne plus jamais renvoyer de rappel
          const updatedNotes = `${booking.admin_notes || ''} [reminder_2h_sent]`.trim();
          
          // Mise à jour avec fallback souple (si la colonne reminder_sent n'est pas encore créée)
          const { error: updateError } = await supabase
            .from('coaching_bookings')
            .update({
              reminder_sent: true,
              admin_notes: updatedNotes,
              updated_at: new Date().toISOString(),
            })
            .eq('id', booking.id);

          if (updateError) {
            // Si la colonne reminder_sent n'existe pas encore dans la table, mettre à jour admin_notes uniquement
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

    return NextResponse.json({
      success: true,
      processed: bookings.length,
      sentCount: sentReminders.length,
      sentBookingIds: sentReminders,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[Cron Reminders Error]', err);
    return NextResponse.json({ error: err.message || 'Erreur interne' }, { status: 500 });
  }
}
