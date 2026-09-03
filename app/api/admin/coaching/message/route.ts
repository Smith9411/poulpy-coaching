import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables Supabase manquantes');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    const { studentId, adminId, message, messageType } = body;

    if (!studentId || !adminId || !message) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants (studentId, adminId, message)' },
        { status: 400 }
      );
    }

    if (adminId !== user.id) {
      return NextResponse.json(
        { error: 'adminId doit correspondre à l\'utilisateur authentifié' },
        { status: 403 }
      );
    }

    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', adminId)
      .single();

    if (adminError || !adminProfile?.is_admin) {
      return NextResponse.json(
        { error: 'Seuls les administrateurs peuvent envoyer des messages' },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from('coaching_messages')
      .insert([{
        student_id: studentId,
        admin_id: adminId,
        sender_id: adminId,
        message: message.trim(),
        message_type: messageType || 'progression',
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
