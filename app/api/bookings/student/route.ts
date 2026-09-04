import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const dynamic = 'force-dynamic';

/**
 * GET /api/bookings/student
 * Récupère les réservations actives d'un élève connecté.
 * Les réservations annulées (status = 'cancelled') sont intentionnellement omises
 * afin de disparaître immédiatement de son profil comme demandé.
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

    const userId = authData.user.id;
    const userEmail = authData.user.email?.toLowerCase();

    // Recherche des réservations par user_id ou par email
    let query = supabase
      .from('coaching_bookings')
      .select('*')
      .neq('status', 'cancelled') // Disparaît si annulé
      .order('booking_date', { ascending: true })
      .order('booking_time', { ascending: true });

    if (userEmail) {
      query = query.or(`user_id.eq.${userId},student_email.eq.${userEmail}`);
    } else {
      query = query.eq('user_id', userId);
    }

    const { data: bookings, error } = await query;

    // Alertes non lues pour l'élève (annulations récentes ou reports)
    let alerts: Array<{
      id: string;
      status: 'rescheduled' | 'cancelled';
      plan_name: string;
      booking_date: string;
      booking_time: string;
      admin_notes: string | null;
      updated_at: string;
    }> = [];

    try {
      let alertQuery = supabase
        .from('coaching_bookings')
        .select('id, status, plan_name, booking_date, booking_time, admin_notes, updated_at')
        .in('status', ['rescheduled', 'cancelled'])
        .eq('read_by_student', false);

      if (userEmail) {
        alertQuery = alertQuery.or(`user_id.eq.${userId},student_email.eq.${userEmail}`);
      } else {
        alertQuery = alertQuery.eq('user_id', userId);
      }

      const { data: alertData } = await alertQuery.order('updated_at', { ascending: false });
      if (alertData) alerts = alertData;
    } catch {
      // Ignorer si la colonne n'existe pas encore
    }

    if (error) {
      console.error('Erreur lecture réservations élève:', error);
      return NextResponse.json({ bookings: [], alerts });
    }

    return NextResponse.json({ bookings: bookings || [], alerts });
  } catch (err: unknown) {
    console.error('Erreur GET /api/bookings/student:', err);
    return NextResponse.json({ error: 'Erreur interne', bookings: [], alerts: [] }, { status: 500 });
  }
}
