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
    const { studentId, message, messageType, attachmentUrl, attachmentType } = body;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!studentId || typeof studentId !== 'string' || !uuidRegex.test(studentId)) {
      return NextResponse.json({ error: 'studentId invalide ou manquant' }, { status: 400 });
    }

    let finalMessage = String(message || '').trim();

    if (!finalMessage && !attachmentUrl) {
      return NextResponse.json(
        { error: 'Veuillez écrire un message ou joindre un média / une note vocale' },
        { status: 400 }
      );
    }

    if (!finalMessage && attachmentUrl) {
      if (attachmentType === 'audio') finalMessage = '🎙️ Note vocale';
      else if (attachmentType === 'video') finalMessage = '🎬 Extrait vidéo';
      else finalMessage = '📷 Photo / Capture';
    }

    if (finalMessage.length > 2000) {
      return NextResponse.json({ error: 'Le message doit faire moins de 2000 caractères' }, { status: 400 });
    }

    const allowedTypes = new Set(['progression', 'feedback', 'tip', 'student']);
    if (messageType && !allowedTypes.has(messageType)) {
      return NextResponse.json({ error: 'messageType invalide' }, { status: 400 });
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
        { error: 'Un admin ne peut pas se messager lui-même en tant qu\'élève' },
        { status: 400 }
      );
    }

    const insertData: Record<string, unknown> = {
      student_id: studentId,
      sender_id: user.id,
      admin_id: isAdmin ? user.id : null,
      message: finalMessage,
      message_type: isAdmin ? (messageType || 'progression') : 'student',
    };

    if (attachmentUrl) {
      insertData.attachment_url = attachmentUrl;
      insertData.attachment_type = attachmentType || 'image';
    }

    const { data, error } = await supabase
      .from('coaching_messages')
      .insert([insertData])
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