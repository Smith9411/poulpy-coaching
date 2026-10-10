import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables Supabase manquantes');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/notifications/student-summary
 *
 * Retourne pour un élève connecté :
 * - Les messages non lus du coach (coaching_messages)
 * - Les nouvelles annotations posées sur ses clips VOD dans les 7 derniers jours
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

    // ── 1. Messages non lus du coach ────────────────────────────────────────
    const { data: unreadMsgs } = await supabase
      .from('coaching_messages')
      .select('id, message, created_at, sender_id')
      .eq('student_id', userId)
      .neq('sender_id', userId)   // Messages reçus (pas envoyés par l'élève)
      .is('read_at', null)
      .order('created_at', { ascending: false })
      .limit(20);

    const unreadMsgCount = (unreadMsgs || []).length;
    const lastMsg = unreadMsgs?.[0] || null;

    // ── 2. Nouvelles annotations non lues sur les clips de l'élève ─────────
    let newAnnotationsCount = 0;
    let lastAnnotation: { clipTitle: string; content: string; createdAt: string } | null = null;

    try {
      // Récupère les clips de l'élève
      const { data: clips } = await supabase
        .from('vod_clips')
        .select('id, title')
        .eq('student_id', userId);

      if (clips && clips.length > 0) {
        const clipIds = clips.map((c: { id: string }) => c.id);
        const clipTitleMap = new Map(clips.map((c: { id: string; title: string }) => [c.id, c.title]));

        // Récupère les annotations non lues sur ces clips
        const { data: annotations } = await supabase
          .from('vod_annotations')
          .select('id, clip_id, content, created_at, read_at')
          .in('clip_id', clipIds)
          .is('read_at', null)
          .order('created_at', { ascending: false });

        newAnnotationsCount = (annotations || []).length;
        if (annotations?.[0]) {
          lastAnnotation = {
            clipTitle: clipTitleMap.get(annotations[0].clip_id) || 'ton clip',
            content: annotations[0].content,
            createdAt: annotations[0].created_at,
          };
        }
      }
    } catch {
      // Ignorer si les tables VOD n'existent pas
    }

    // ── 3. Alertes sur séances de coaching (déplacée ou annulée) ───────────
    let bookingAlerts: Array<{
      id: string;
      status: 'rescheduled' | 'cancelled';
      planName: string;
      bookingDate: string;
      bookingTime: string;
      adminNotes: string | null;
      updatedAt: string;
    }> = [];

    try {
      const userEmail = authData.user.email?.toLowerCase();
      let bQuery = supabase
        .from('coaching_bookings')
        .select('id, status, plan_name, booking_date, booking_time, admin_notes, updated_at')
        .in('status', ['rescheduled', 'cancelled'])
        .eq('read_by_student', false);

      if (userEmail) {
        bQuery = bQuery.or(`user_id.eq.${userId},student_email.eq.${userEmail}`);
      } else {
        bQuery = bQuery.eq('user_id', userId);
      }

      const { data: bData } = await bQuery.order('updated_at', { ascending: false });

      if (bData && bData.length > 0) {
        bookingAlerts = bData.map((b: { id: string; status: 'rescheduled' | 'cancelled'; plan_name: string; booking_date: string; booking_time: string; admin_notes: string | null; updated_at: string }) => ({
          id: b.id,
          status: b.status,
          planName: b.plan_name,
          bookingDate: b.booking_date,
          bookingTime: b.booking_time,
          adminNotes: b.admin_notes,
          updatedAt: b.updated_at,
        }));
      }
    } catch {
      // Ignorer si coaching_bookings n'existe pas encore
    }

    const totalCount = unreadMsgCount + newAnnotationsCount + bookingAlerts.length;

    return NextResponse.json({
      totalCount,
      unreadMsgCount,
      newAnnotationsCount,
      bookingAlertsCount: bookingAlerts.length,
      bookingAlerts,
      lastMsg: lastMsg ? {
        message: lastMsg.message,
        createdAt: lastMsg.created_at,
      } : null,
      lastAnnotation,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    console.error('Erreur student-summary:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/notifications/student-summary
 * Marque les notifications élève comme lues (soit tout, soit par id/type).
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '').trim();
    const { data: authData } = await supabase.auth.getUser(token);
    if (!authData?.user) return NextResponse.json({ error: 'Invalide' }, { status: 401 });

    const userId = authData.user.id;
    const userEmail = authData.user.email?.toLowerCase();
    const body = await req.json().catch(() => ({}));
    const { action, bookingId } = body;
    const now = new Date().toISOString();

    if (action === 'mark_all_read') {
      // 1. Marquer tous les messages reçus du coach comme lus
      await supabase
        .from('coaching_messages')
        .update({ read_at: now })
        .eq('student_id', userId)
        .neq('sender_id', userId)
        .is('read_at', null);

      // 2. Marquer toutes les alertes de réservation comme lues
      let bQuery = supabase
        .from('coaching_bookings')
        .update({ read_by_student: true, updated_at: now })
        .eq('read_by_student', false);

      if (userEmail) {
        bQuery = bQuery.or(`user_id.eq.${userId},student_email.eq.${userEmail}`);
      } else {
        bQuery = bQuery.eq('user_id', userId);
      }
      await bQuery;

      // 3. Marquer toutes les annotations VOD comme lues
      try {
        const { data: clips } = await supabase
          .from('vod_clips')
          .select('id')
          .eq('student_id', userId);

        if (clips && clips.length > 0) {
          const clipIds = clips.map((c: { id: string }) => c.id);
          await supabase
            .from('vod_annotations')
            .update({ read_at: now })
            .in('clip_id', clipIds)
            .is('read_at', null);
        }
      } catch {
        // Ignorer si les tables VOD n'existent pas
      }

      return NextResponse.json({ success: true, message: 'Toutes les notifications élève marquées comme lues' });
    }

    if (action === 'mark_messages') {
      await supabase
        .from('coaching_messages')
        .update({ read_at: now })
        .eq('student_id', userId)
        .neq('sender_id', userId)
        .is('read_at', null);
      return NextResponse.json({ success: true });
    }

    if (action === 'mark_annotations') {
      try {
        const { data: clips } = await supabase
          .from('vod_clips')
          .select('id')
          .eq('student_id', userId);

        if (clips && clips.length > 0) {
          const clipIds = clips.map((c: { id: string }) => c.id);
          await supabase
            .from('vod_annotations')
            .update({ read_at: now })
            .in('clip_id', clipIds)
            .is('read_at', null);
        }
      } catch {}
      return NextResponse.json({ success: true });
    }

    if (bookingId) {
      await supabase
        .from('coaching_bookings')
        .update({ read_by_student: true, updated_at: now })
        .eq('id', bookingId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erreur POST student-summary:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
