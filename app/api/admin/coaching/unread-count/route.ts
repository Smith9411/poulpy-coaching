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

    if (profile?.is_admin !== true) {
      return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
    }

    const { data: messages, error } = await supabase
      .from('coaching_messages')
      .select('student_id')
      .is('read_at', null)
      .neq('sender_id', user.id);

    if (error) throw error;

    const counts: Record<string, number> = {};
    (messages || []).forEach((m: { student_id: string }) => {
      counts[m.student_id] = (counts[m.student_id] || 0) + 1;
    });

    return NextResponse.json({ counts });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    console.error('Erreur unread-count admin:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}