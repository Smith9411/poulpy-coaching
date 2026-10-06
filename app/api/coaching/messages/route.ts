import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables Supabase manquantes');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestedStudentId = searchParams.get('studentId') || user.id;

    // Vérifier les permissions : soit l'utilisateur est le propriétaire de la session, soit il est admin
    if (requestedStudentId !== user.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (profile?.is_admin !== true) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
      }
    }

    const { data: messages, error } = await supabase
      .from('coaching_messages')
      .select('*')
      .eq('student_id', requestedStudentId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Marquer comme lus les messages reçus de l'autre expéditeur
    const unreadFromOthers = (messages || []).filter(
      (m: { read_at: string | null; sender_id: string }) => !m.read_at && m.sender_id !== user.id
    );

    if (unreadFromOthers.length > 0) {
      await supabase
        .from('coaching_messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadFromOthers.map((m: { id: string }) => m.id));
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    console.error('Erreur GET /api/coaching/messages:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
