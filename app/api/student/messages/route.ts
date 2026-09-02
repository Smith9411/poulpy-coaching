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
    // Get student ID from auth header (this would need proper auth implementation)
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // For now, we'll use a simpler approach - pass studentId as query param
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'studentId manquant' }, { status: 400 });
    }

    const { data: messages, error } = await supabase
      .from('coaching_messages')
      .select('*')
      .eq('student_id', studentId)
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
