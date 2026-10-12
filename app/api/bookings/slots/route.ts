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

      // Récupérer les créneaux gratuits configurés (depuis la table settings)
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
        console.warn('Impossible de charger free_trial_slots:', err);
      }

      return NextResponse.json({
        slots: sanitizedSlots,
        freeSlots: freeSlots || {},
        bookings: bookings || [],
      });
    }

    // Requête publique (Élève/Visiteur) : créneaux payants + créneaux gratuits configurés
    const { data: slots, error } = await supabase
      .from('coaching_slots')
      .select('id, date, start_time, is_active, is_booked')
      .gte('date', today)
      .lte('date', defaultEnd)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

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
      console.warn('Impossible de charger free_trial_slots (public):', err);
    }

    if (error) {
      return NextResponse.json({ slots: [], freeSlots: freeSlots || {} });
    }

    return NextResponse.json({
      slots: slots || [],
      freeSlots: freeSlots || {},
    });
  } catch (err: unknown) {
    console.error('Erreur GET /api/bookings/slots:', err);
    return NextResponse.json({ error: 'Erreur interne', slots: [], freeSlots: {} }, { status: 500 });
  }
}

/**
 * POST /api/bookings/slots
 * Enregistre ou met à jour en masse les disponibilités configurées par l'administrateur :
 * - slots : créneaux payants (dans coaching_slots)
 * - freeSlots : créneaux gratuits (dans settings -> free_trial_slots)
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
    const freeSlotsToSave = body.freeSlots;

    let savedPaidCount = 0;

    // 1. Sauvegarde des créneaux payants (coaching_slots)
    if (Array.isArray(slotsToUpsert) && slotsToUpsert.length > 0) {
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
      savedPaidCount = data?.length || 0;
    }

    // 2. Sauvegarde des créneaux gratuits (table settings -> free_trial_slots)
    if (freeSlotsToSave && typeof freeSlotsToSave === 'object') {
      const { error: freeError } = await supabase
        .from('settings')
        .upsert({
          key: 'free_trial_slots',
          value: JSON.stringify(freeSlotsToSave),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });

      if (freeError) {
        console.error('Erreur sauvegarde free_trial_slots:', freeError);
        return NextResponse.json({ error: freeError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, count: savedPaidCount });
  } catch (err: unknown) {
    console.error('Erreur POST /api/bookings/slots:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
