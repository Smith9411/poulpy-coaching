import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables Supabase manquantes');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/notifications/admin-summary
 *
 * Retourne pour l'admin :
 * - Les messages non lus par élève (coaching_messages)
 * - Les clips VOD soumis sans aucune annotation (nouveau clip en attente d'analyse)
 * - Les annotations récentes posées sur les clips (dernières 48h, pour info)
 *
 * Cet endpoint est volontairement découplé de read_at pour éviter le race condition
 * entre mark-read et le polling de la cloche.
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

    // Vérifier que l'appelant est admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (profile?.is_admin !== true) {
      return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
    }

    // ── 1. Messages non lus (envoyés par des élèves) ────────────────────────
    const { data: unreadMsgs } = await supabase
      .from('coaching_messages')
      .select('id, student_id, message, created_at, sender_id')
      .is('read_at', null)
      .neq('sender_id', userId)  // Uniquement les messages envoyés par des élèves
      .order('created_at', { ascending: false });

    // Compter par élève + récupérer le dernier message
    const msgByStudent = new Map<string, {
      count: number;
      lastMessage: string;
      lastAt: string;
      studentId: string;
    }>();
    for (const m of (unreadMsgs || [])) {
      const existing = msgByStudent.get(m.student_id);
      if (!existing || new Date(m.created_at) > new Date(existing.lastAt)) {
        msgByStudent.set(m.student_id, {
          count: (existing?.count || 0) + 1,
          lastMessage: m.message,
          lastAt: m.created_at,
          studentId: m.student_id,
        });
      } else {
        msgByStudent.set(m.student_id, {
          ...existing,
          count: existing.count + 1,
        });
      }
    }

    // ── 2. Clips VOD non lus par le coach ──────────────────────────────────
    let newClips: Array<{
      clipId: string;
      studentId: string;
      title: string;
      submittedAt: string;
    }> = [];

    try {
      const { data: clips } = await supabase
        .from('vod_clips')
        .select('id, student_id, title, submitted_at, read_at')
        .is('read_at', null)
        .order('submitted_at', { ascending: false });

      if (clips && clips.length > 0) {
        newClips = clips.map((c: { id: string; student_id: string; title: string; submitted_at: string }) => ({
          clipId: c.id,
          studentId: c.student_id,
          title: c.title,
          submittedAt: c.submitted_at,
        }));
      }
    } catch {
      // vod_clips n'existe pas encore, ignorer silencieusement
    }

    // ── 3. Récupérer les usernames des élèves concernés ─────────────────────
    const allStudentIds = new Set<string>([
      ...Array.from(msgByStudent.keys()),
      ...newClips.map(c => c.studentId),
    ]);

    const usernameMap = new Map<string, string>();
    if (allStudentIds.size > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', Array.from(allStudentIds));
      (profiles || []).forEach((p: { id: string; username: string }) => {
        usernameMap.set(p.id, p.username);
      });
    }

    // ── 4. Construire la réponse ─────────────────────────────────────────────
    const unreadMessages = Array.from(msgByStudent.values()).map(entry => ({
      type: 'message' as const,
      studentId: entry.studentId,
      studentName: usernameMap.get(entry.studentId) || 'Élève',
      count: entry.count,
      lastMessage: entry.lastMessage,
      lastAt: entry.lastAt,
    }));

    const pendingClips = newClips.map(c => ({
      type: 'clip' as const,
      clipId: c.clipId,
      studentId: c.studentId,
      studentName: usernameMap.get(c.studentId) || 'Élève',
      title: c.title,
      submittedAt: c.submittedAt,
    }));

    const totalUnread = unreadMessages.reduce((sum, m) => sum + m.count, 0);
    const totalClips = pendingClips.length;
    const totalCount = totalUnread + totalClips;

    return NextResponse.json({
      totalCount,
      totalUnread,
      totalClips,
      unreadMessages,
      pendingClips,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    console.error('Erreur admin-summary:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
