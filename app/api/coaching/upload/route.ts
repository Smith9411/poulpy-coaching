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

const BUCKET_NAME = 'coaching-attachments';

// Types autorisés
const ALLOWED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const ALLOWED_AUDIO_TYPES = new Set([
  'audio/webm',
  'audio/ogg',
  'audio/mp4',
  'audio/mpeg',
  'audio/wav',
  'audio/x-m4a',
  'audio/aac',
]);

const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15 Mo
const MAX_VIDEO_SIZE = 35 * 1024 * 1024; // 35 Mo
const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10 Mo

async function ensureBucketExists() {
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = (buckets || []).some(b => b.name === BUCKET_NAME);
    if (!exists) {
      await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 40 * 1024 * 1024,
      });
    }
  } catch (err) {
    console.warn('Erreur vérification bucket coaching-attachments:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });
    }

    const mimeType = file.type.toLowerCase();
    let mediaType: 'image' | 'video' | 'audio' | null = null;
    let maxSize = MAX_IMAGE_SIZE;

    if (ALLOWED_IMAGE_TYPES.has(mimeType)) {
      mediaType = 'image';
      maxSize = MAX_IMAGE_SIZE;
    } else if (ALLOWED_VIDEO_TYPES.has(mimeType)) {
      mediaType = 'video';
      maxSize = MAX_VIDEO_SIZE;
    } else if (ALLOWED_AUDIO_TYPES.has(mimeType) || mimeType.startsWith('audio/')) {
      mediaType = 'audio';
      maxSize = MAX_AUDIO_SIZE;
    } else {
      return NextResponse.json(
        { error: 'Format de fichier non supporté. Formats acceptés : Images (PNG, JPG, WEBP, GIF), Vidéos (MP4, WEBM), Audios' },
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      const mb = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json(
        { error: `Fichier trop lourd. Taille maximale autorisée pour ce type : ${mb} Mo` },
        { status: 400 }
      );
    }

    await ensureBucketExists();

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const safeExt = (file.name.split('.').pop() || (mediaType === 'audio' ? 'webm' : mediaType === 'video' ? 'mp4' : 'png'))
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 5) || 'bin';

    const fileName = `${mediaType}s/${user.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type || (mediaType === 'audio' ? 'audio/webm' : 'application/octet-stream'),
        upsert: false,
      });

    if (uploadError) {
      console.error('Erreur Supabase Storage upload:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: urlData.publicUrl,
      mediaType,
      fileName: file.name,
      size: file.size,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur upload média';
    console.error('Erreur POST /api/coaching/upload:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
