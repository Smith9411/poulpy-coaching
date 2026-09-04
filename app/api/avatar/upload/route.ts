import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Variables Supabase manquantes : SUPABASE_SERVICE_ROLE_KEY requis');
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const MAX_SIZE = 2 * 1024 * 1024;

const MAGIC_BYTES: Record<string, number[]> = {
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/gif': [0x47, 0x49, 0x46, 0x38],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
};

function verifyMagicBytes(buffer: Buffer, claimedType: string): boolean {
  const sig = MAGIC_BYTES[claimedType];
  if (!sig) return false;
  return sig.every((byte, i) => buffer[i] === byte);
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const claimedUserId = formData.get('userId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });
    }

    if (claimedUserId && claimedUserId !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé (PNG, JPG, WEBP, GIF uniquement)' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "L'image ne doit pas dépasser 2 Mo" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!verifyMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { error: 'Le contenu du fichier ne correspond pas au type déclaré. Upload refusé.' },
        { status: 400 }
      );
    }
    const safeExt = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'png';
    const fileName = `${user.id}-${Date.now()}.${safeExt}`;

    const { data: list } = await supabaseAdmin.storage.from('avatars').list('', { limit: 100, search: user.id });
    if (list && list.length > 0) {
      const oldFiles = list.filter((f) => f.name.startsWith(`${user.id}-`)).map((f) => f.name);
      if (oldFiles.length > 0) {
        await supabaseAdmin.storage.from('avatars').remove(oldFiles);
      }
    }

    const { error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
