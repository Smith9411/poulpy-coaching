import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const dynamic = 'force-dynamic';

/**
 * GET /api/bookings/slots
 * Récupère les créneaux :
 * - Mode public (visiteur/élève) : uniquement créneaux futurs avec is_active=true et is_booked=false
 * - Mode admin (?admin=true avec Bearer token admin) : tous les créneaux configurés (actifs, inactifs, réservés)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdminMode = searchParams.get('admin') === 'true';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Date du jour au format 'YYYY-MM-DD'
    const today = new Date().toISOString().split('T')[0];
    const defaultStart = startDateParam || today;

    // Date limite : +28 jours par défaut
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 28);
    const defaultEnd = endDateParam || maxDate.toISOString().split('T')[0];

    if (isAdminMode) {
      // Vérification des droits administrateur
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

      // Requête admin : tous les créneaux sur la plage
      const { data: slots, error } = await supabase
        .from('coaching_slots')
        .select('*')
        .gte('date', defaultStart)
        .lte('date', defaultEnd)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        // Table pas encore créée dans Supabase
        return NextResponse.json({ slots: [], warning: 'Table non initialisée' });
      }

      // Récupérer uniquement les réservations actives (confirmées ou reportées) pour afficher le nom de l'élève
      const { data: bookings } = await supabase
        .from('coaching_bookings')
        .select('id, slot_id, booking_date, booking_time, student_name, student_discord, plan_name, status')
        .gte('booking_date', defaultStart)
        .lte('booking_date', defaultEnd)
        .in('status', ['confirmed', 'rescheduled']);

      // Synchronisation : si un créneau était marqué is_booked dans coaching_slots mais qu'il n'a plus
      // de réservation active (séance terminée ou annulée), on le libère automatiquement
      const activeSlotKeys = new Set(
        (bookings || []).map((b: { booking_date: string; booking_time: string }) => `${b.booking_date}_${b.booking_time}`)
      );

      const sanitizedSlots = (slots || []).map((s: { id: string; date: string; start_time: string; is_booked: boolean }) => {
        const hasActiveBooking = activeSlotKeys.has(`${s.date}_${s.start_time}`);
        if (s.is_booked && !hasActiveBooking) {
          // Correction asynchrone en base
          Promise.resolve(supabase.from('coaching_slots').update({ is_booked: false }).eq('id', s.id)).catch(() => {});
          return { ...s, is_booked: false };
        }
        return s;
      });

      return NextResponse.json({
        slots: sanitizedSlots,
        bookings: bookings || [],
      });
    }

    // Requête publique (Élève/Visiteur)
    const { data: slots, error } = await supabase
      .from('coaching_slots')
      .select('id, date, start_time, is_active, is_booked')
      .gte('date', today)
      .lte('date', defaultEnd)
      .eq('is_active', true)
      .eq('is_booked', false)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      return NextResponse.json({ slots: [] });
    }

    return NextResponse.json({ slots: slots || [] });
  } catch (err: unknown) {
    console.error('Erreur GET /api/bookings/slots:', err);
    return NextResponse.json({ error: 'Erreur interne', slots: [] }, { status: 500 });
  }
}

/**
 * POST /api/bookings/slots
 * Enregistre ou met à jour en masse les disponibilités configurées par l'administrateur.
 * Body: {
 *   slots: Array<{ date: string; start_time: string; is_active: boolean }>
 * }
 */
export async function POST(req: NextRequest) {
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
    const slotsToUpsert = body.slots;

    if (!Array.isArray(slotsToUpsert) || slotsToUpsert.length === 0) {
      return NextResponse.json({ error: 'Aucun créneau fourni' }, { status: 400 });
    }

    // On prépare les données à insérer/mettre à jour
    const formattedSlots = slotsToUpsert.map((s: { date: string; start_time: string; is_active: boolean }) => ({
      date: s.date,
      start_time: s.start_time,
      is_active: Boolean(s.is_active),
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('coaching_slots')
      .upsert(formattedSlots, { onConflict: 'date,start_time' })
      .select();

    if (error) {
      console.error('Erreur upsert coaching_slots:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: data?.length || 0 });
  } catch (err: unknown) {
    console.error('Erreur POST /api/bookings/slots:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
