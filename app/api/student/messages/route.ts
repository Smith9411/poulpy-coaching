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
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Extract the token (format: "Bearer <token>")
    const token = authHeader.replace('Bearer ', '');

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Get messages for this user
    const { data: messages, error } = await supabase
      .from('coaching_messages')
      .select('*')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Mark messages as read
    const unreadMessages = messages?.filter((m: any) => !m.read_at) || [];
    if (unreadMessages.length > 0) {
      await supabase
        .from('coaching_messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadMessages.map((m: any) => m.id));
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    console.error('Erreur récupération messages étudiant:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
