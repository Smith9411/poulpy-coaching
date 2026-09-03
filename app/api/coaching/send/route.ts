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

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { studentId, message, messageType } = body;

    if (!studentId || !message?.trim()) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants (studentId, message)' },
        { status: 400 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 403 });
    }

    const isAdmin = profile.is_admin === true;
    const isSelf = user.id === studentId;

    if (!isAdmin && !isSelf) {
      return NextResponse.json(
        { error: 'Tu ne peux écrire que dans ton propre thread' },
        { status: 403 }
      );
    }

    if (isSelf && isAdmin) {
      return NextResponse.json(
        { error: 'Un admin ne peut pas se message lui-même en tant qu\'élève' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('coaching_messages')
      .insert([{
        student_id: studentId,
        sender_id: user.id,
        admin_id: isAdmin ? user.id : null,
        message: message.trim(),
        message_type: isAdmin ? (messageType || 'progression') : 'student',
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: data, success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    console.error('Erreur envoi message coaching:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}