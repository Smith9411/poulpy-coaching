import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchNotionPage, cleanNotionId } from '@/lib/notion';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const dynamic = 'force-dynamic';

/**
 * GET /api/webhooks/notion
 * Affiche l'état du webhook et le dernier jeton de vérification reçu depuis Supabase
 */
export async function GET() {
  let tokenFromDb: string | null = null;
  try {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'notion_webhook_token')
      .maybeSingle();
    if (data?.value) {
      tokenFromDb = data.value;
    }
  } catch (e) {
    console.warn('Erreur lecture token DB:', e);
  }

  return NextResponse.json({
    status: 'ok',
    service: 'Poulpy Coaching Notion Webhook',
    jeton_de_verification:
      tokenFromDb ||
      "En attente du jeton... Cliquez sur 'Renvoyer le jeton' dans Notion, puis rafraîchissez cette page.",
  });
}

/**
 * POST /api/webhooks/notion
 * Reçoit les notifications d'événements de Notion en temps réel (mise à jour de date, statut, suppression/archivage).
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));

    // 1. Handshake de vérification initial de Notion (Capture et persistance du jeton)
    const token =
      rawBody.verification_token ||
      rawBody.verificationToken ||
      rawBody.token ||
      rawBody.secret ||
      rawBody.challenge;

    if (token) {
      console.info(`[Notion Webhook] Jeton de vérification reçu : ${token}`);

      try {
        await supabase
          .from('settings')
          .upsert(
            { key: 'notion_webhook_token', value: String(token) },
            { onConflict: 'key' }
          );
      } catch (dbErr) {
        console.warn('Erreur sauvegarde token dans DB:', dbErr);
      }

      return NextResponse.json({
        challenge: token,
        status: 'verified',
        verification_token: token,
      });
    }

    // 2. Extraction de l'ID de la page modifiée
    const pageId =
      rawBody.entity_id ||
      rawBody.data?.id ||
      rawBody.page_id ||
      rawBody.id ||
      rawBody.data?.page_id;

    if (!pageId) {
      // Événement générique ou ping
      return NextResponse.json({ success: true, message: 'Événement reçu sans ID de page' });
    }

    const cleanPageId = cleanNotionId(pageId) || pageId;
    const rawClean = pageId.replace(/-/g, '');

    console.info(`[Notion Webhook] Événement reçu pour la page Notion : ${pageId}`);

    // 3. Récupération des données fraîches depuis Notion
    const notionData = await fetchNotionPage(cleanPageId);
    if (!notionData) {
      return NextResponse.json({ success: false, message: 'Impossible de lire la page Notion' }, { status: 404 });
    }

    // 4. Recherche de la réservation correspondante dans Supabase
    const { data: bookings, error: findError } = await supabase
      .from('coaching_bookings')
      .select('*')
      .or(`notion_page_id.eq.${cleanPageId},notion_page_id.eq.${rawClean},notion_page_id.eq.${pageId}`)
      .limit(1);

    if (findError || !bookings || bookings.length === 0) {
      console.info(`[Notion Webhook] Aucune réservation liée au notion_page_id: ${pageId}`);
      return NextResponse.json({ success: true, message: 'Réservation non trouvée (peut-être une page hors-coaching)' });
    }

    const booking = bookings[0];
    const nowIso = new Date().toISOString();

    // ── SCÉNARIO A : LA PAGE A ÉTÉ ARCHIVÉE OU STATUT 'ANNULÉ' ─────────────
    if (notionData.isArchived || notionData.status === 'Annulé') {
      if (booking.status !== 'cancelled') {
        console.info(`[Notion Webhook] Annulation de la réservation #${booking.id}`);

        // Mettre à jour la réservation + déclencher notification élève (read_by_student = false)
        await supabase
          .from('coaching_bookings')
          .update({
            status: 'cancelled',
            read_by_student: false,
            updated_at: nowIso,
          })
          .eq('id', booking.id);

        // Libérer le créneau
        if (booking.slot_id) {
          await supabase
            .from('coaching_slots')
            .update({ is_booked: false, updated_at: nowIso })
            .eq('id', booking.slot_id);
        } else if (booking.booking_date && booking.booking_time) {
          await supabase
            .from('coaching_slots')
            .update({ is_booked: false, updated_at: nowIso })
            .eq('date', booking.booking_date)
            .eq('start_time', booking.booking_time);
        }
      }

      return NextResponse.json({ success: true, action: 'cancelled', bookingId: booking.id });
    }

    // ── SCÉNARIO B : LA DATE OU L'HEURE A ÉTÉ MODIFIÉE (REPORT) ─────────────
    const newDate = notionData.bookingDate;
    const newTime = notionData.bookingTime;

    const dateChanged = newDate && newDate !== booking.booking_date;
    const timeChanged = newTime && newTime !== booking.booking_time;

    if (dateChanged || timeChanged) {
      const finalDate = newDate || booking.booking_date;
      const finalTime = newTime || booking.booking_time;

      console.info(`[Notion Webhook] Déplacement de la réservation #${booking.id} vers le ${finalDate} à ${finalTime}`);

      // 1. Libérer l'ancien créneau
      if (booking.slot_id) {
        await supabase
          .from('coaching_slots')
          .update({ is_booked: false, updated_at: nowIso })
          .eq('id', booking.slot_id);
      } else if (booking.booking_date && booking.booking_time) {
        await supabase
          .from('coaching_slots')
          .update({ is_booked: false, updated_at: nowIso })
          .eq('date', booking.booking_date)
          .eq('start_time', booking.booking_time);
      }

      // 2. Trouver ou verrouiller le nouveau créneau
      let newSlotId: string | null = null;
      const { data: foundSlot } = await supabase
        .from('coaching_slots')
        .select('id')
        .eq('date', finalDate)
        .eq('start_time', finalTime)
        .maybeSingle();

      if (foundSlot) {
        newSlotId = foundSlot.id;
        await supabase
          .from('coaching_slots')
          .update({ is_booked: true, updated_at: nowIso })
          .eq('id', foundSlot.id);
      }

      // 3. Mettre à jour la réservation avec statut 'rescheduled' et read_by_student = false (Alerte élève)
      await supabase
        .from('coaching_bookings')
        .update({
          booking_date: finalDate,
          booking_time: finalTime,
          slot_id: newSlotId || booking.slot_id,
          status: 'rescheduled',
          read_by_student: false, // Déclenche la cloche rouge pour l'élève
          updated_at: nowIso,
        })
        .eq('id', booking.id);

      return NextResponse.json({
        success: true,
        action: 'rescheduled',
        bookingId: booking.id,
        newDate: finalDate,
        newTime: finalTime,
      });
    }

    // ── SCÉNARIO C : CHANGEMENT DE STATUT VERS 'TERMINÉ' ───────────────────
    if (notionData.status === 'Terminé' && booking.status !== 'completed') {
      console.info(`[Notion Webhook] Séance #${booking.id} marquée comme terminée`);

      await supabase
        .from('coaching_bookings')
        .update({
          status: 'completed',
          updated_at: nowIso,
        })
        .eq('id', booking.id);

      // Libérer le créneau
      if (booking.slot_id) {
        await supabase
          .from('coaching_slots')
          .update({ is_booked: false, updated_at: nowIso })
          .eq('id', booking.slot_id);
      }

      return NextResponse.json({ success: true, action: 'completed', bookingId: booking.id });
    }

    return NextResponse.json({ success: true, message: 'Aucun changement significatif détecté' });
  } catch (err: any) {
    console.error('[Notion Webhook Exception]:', err);
    return NextResponse.json({ error: 'Erreur interne traitement webhook' }, { status: 500 });
  }
}
