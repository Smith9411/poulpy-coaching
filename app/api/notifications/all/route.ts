import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables Supabase manquantes');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.is_admin === true;

    let query = supabase
      .from('coaching_messages')
      .select('id, message, created_at, sender_id, student_id, read_at')
      .neq('sender_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!isAdmin) {
      query = query.eq('student_id', user.id);
    }

    const { data: messages, error } = await query;
    if (error) throw error;

    const senderIds = Array.from(new Set((messages || []).map((m: { sender_id: string }) => m.sender_id)));
    const senderMap = new Map<string, string>();

    if (senderIds.length > 0) {
      const { data: senders } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', senderIds);
      senders?.forEach((s) => senderMap.set(s.id, s.username));
    }

    const items = (messages || []).map((m: {
      id: string;
      message: string;
      created_at: string;
      sender_id: string;
      student_id: string;
      read_at: string | null;
    }) => ({
      id: m.id,
      message: m.message,
      created_at: m.created_at,
      sender_id: m.sender_id,
      student_id: m.student_id,
      sender_name: senderMap.get(m.sender_id) || (isAdmin ? 'Élève' : 'Coach'),
      is_mine: m.sender_id === user.id,
      is_unread: !m.read_at,
    }));

    return NextResponse.json({ items });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    console.error('Erreur notifs all:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}