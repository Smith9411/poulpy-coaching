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
    const body = await req.json();
    const { studentId, adminId, message, messageType } = body;

    if (!studentId || !adminId || !message) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants (studentId, adminId, message)' },
        { status: 400 }
      );
    }

    // Verify admin is actually admin
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

    // Insert message
    const { data, error } = await supabase
      .from('coaching_messages')
      .insert([{
        student_id: studentId,
        admin_id: adminId,
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
