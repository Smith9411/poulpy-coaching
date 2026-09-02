import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables Supabase manquantes');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

    // Bind the client to the user's JWT so RLS sees auth.role() = 'authenticated'
    // and auth.uid() = this user, allowing the row-level policy to match.
    const userClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: messages, error } = await userClient
      .from('coaching_messages')
      .select('*')
      .eq('student_id', user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const unreadMessages = messages?.filter((m: { read_at: string | null }) => !m.read_at) || [];
    if (unreadMessages.length > 0) {
      await userClient
        .from('coaching_messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadMessages.map((m: { id: string }) => m.id));
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    console.error('Erreur récupération messages étudiant:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}