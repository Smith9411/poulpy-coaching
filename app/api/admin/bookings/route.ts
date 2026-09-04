import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/bookings
 * Récupère toutes les réservations pour l'administrateur avec statistiques.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '').trim();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', authData.user.id)
      .single();

    if (profile?.is_admin !== true) {
      return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    let query = supabase
      .from('coaching_bookings')
      .select('*')
      .order('booking_date', { ascending: false })
      .order('booking_time', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error('Erreur récupération bookings admin:', error);
      return NextResponse.json({ bookings: [] });
    }

    // Calcul des statistiques
    const allBookings = bookings || [];
    const totalCount = allBookings.length;
    const confirmedCount = allBookings.filter((b: { status: string }) => b.status === 'confirmed' || b.status === 'rescheduled').length;
    const completedCount = allBookings.filter((b: { status: string }) => b.status === 'completed').length;
    const cancelledCount = allBookings.filter((b: { status: string }) => b.status === 'cancelled').length;
    const unreadCount = allBookings.filter((b: { read_by_admin: boolean }) => !b.read_by_admin).length;

    return NextResponse.json({
      bookings: allBookings,
      stats: {
        totalCount,
        confirmedCount,
        completedCount,
        cancelledCount,
        unreadCount,
      },
    });
  } catch (err: unknown) {
    console.error('Erreur GET /api/admin/bookings:', err);
    return NextResponse.json({ error: 'Erreur interne', bookings: [] }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/bookings
 * Actions d'administration :
 * - action 'cancel': Annule la réservation et libère automatiquement le créneau
 * - action 'reschedule': Déplace la réservation vers un nouveau créneau (libère l'ancien, bloque le nouveau)
 * - action 'complete': Marque la séance comme terminée
 * - action 'mark_read': Marque la réservation comme lue par l'admin
 */
export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '').trim();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', authData.user.id)
      .single();

    if (profile?.is_admin !== true) {
      return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
    }

    const body = await req.json();
    const { bookingId, action, newDate, newTime, newSlotId, adminNotes } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action requise' }, { status: 400 });
    }

    // Action globale : marquer toutes les réservations comme lues par l'admin
    if (action === 'mark_all_read') {
      await supabase
        .from('coaching_bookings')
        .update({ read_by_admin: true, updated_at: new Date().toISOString() })
        .eq('read_by_admin', false);

      return NextResponse.json({ success: true });
    }

    if (!bookingId) {
      return NextResponse.json({ error: 'ID de réservation requis' }, { status: 400 });
    }

    // Récupérer la réservation actuelle
    const { data: currentBooking, error: fetchErr } = await supabase
      .from('coaching_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchErr || !currentBooking) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }

    // ── 1. ACTION : ANNULER ────────────────────────────────────────────────
    if (action === 'cancel') {
      // 1. Mettre le statut à 'cancelled' et alerter l'élève (read_by_student = false)
      const { data: updated, error: updateErr } = await supabase
        .from('coaching_bookings')
        .update({
          status: 'cancelled',
          read_by_student: false,
          admin_notes: adminNotes || currentBooking.admin_notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      // 2. Libérer le créneau associé s'il existe
      if (currentBooking.slot_id) {
        await supabase
          .from('coaching_slots')
          .update({ is_booked: false, updated_at: new Date().toISOString() })
          .eq('id', currentBooking.slot_id);
      } else if (currentBooking.booking_date && currentBooking.booking_time) {
        await supabase
          .from('coaching_slots')
          .update({ is_booked: false, updated_at: new Date().toISOString() })
          .eq('date', currentBooking.booking_date)
          .eq('start_time', currentBooking.booking_time);
      }

      return NextResponse.json({ success: true, booking: updated });
    }

    // ── 2. ACTION : REPORTER ────────────────────────────────────────────────
    if (action === 'reschedule') {
      if (!newDate || !newTime) {
        return NextResponse.json({ error: 'Nouvelle date et heure requises pour reporter.' }, { status: 400 });
      }

      // 1. Libérer l'ancien créneau
      if (currentBooking.slot_id) {
        await supabase
          .from('coaching_slots')
          .update({ is_booked: false, updated_at: new Date().toISOString() })
          .eq('id', currentBooking.slot_id);
      } else if (currentBooking.booking_date && currentBooking.booking_time) {
        await supabase
          .from('coaching_slots')
          .update({ is_booked: false, updated_at: new Date().toISOString() })
          .eq('date', currentBooking.booking_date)
          .eq('start_time', currentBooking.booking_time);
      }

      // 2. Verrouiller le nouveau créneau s'il existe
      let targetSlotId = newSlotId;
      if (!targetSlotId) {
        const { data: foundSlot } = await supabase
          .from('coaching_slots')
          .select('id')
          .eq('date', newDate)
          .eq('start_time', newTime)
          .maybeSingle();
        if (foundSlot) targetSlotId = foundSlot.id;
      }

      if (targetSlotId) {
        await supabase
          .from('coaching_slots')
          .update({ is_booked: true, updated_at: new Date().toISOString() })
          .eq('id', targetSlotId);
      }

      // 3. Mettre à jour la réservation
      const { data: updated, error: updateErr } = await supabase
        .from('coaching_bookings')
        .update({
          booking_date: newDate,
          booking_time: newTime,
          slot_id: targetSlotId || null,
          status: 'rescheduled',
          read_by_student: false,
          admin_notes: adminNotes || currentBooking.admin_notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, booking: updated });
    }

    // ── 3. ACTION : TERMINER ────────────────────────────────────────────────
    if (action === 'complete') {
      const { data: updated, error: updateErr } = await supabase
        .from('coaching_bookings')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      // Libérer le créneau associé s'il existe une fois la séance terminée
      if (currentBooking.slot_id) {
        await supabase
          .from('coaching_slots')
          .update({ is_booked: false, updated_at: new Date().toISOString() })
          .eq('id', currentBooking.slot_id);
      } else if (currentBooking.booking_date && currentBooking.booking_time) {
        await supabase
          .from('coaching_slots')
          .update({ is_booked: false, updated_at: new Date().toISOString() })
          .eq('date', currentBooking.booking_date)
          .eq('start_time', currentBooking.booking_time);
      }

      return NextResponse.json({ success: true, booking: updated });
    }

    // ── 4. ACTION : MARQUER COMME LU ───────────────────────────────────────
    if (action === 'mark_read') {
      const { data: updated, error: updateErr } = await supabase
        .from('coaching_bookings')
        .update({
          read_by_admin: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, booking: updated });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (err: unknown) {
    console.error('Erreur PATCH /api/admin/bookings:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
