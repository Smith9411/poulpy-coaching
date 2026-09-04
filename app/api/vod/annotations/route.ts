import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ANNOTATION_CATEGORIES } from '@/lib/vod-utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables Supabase manquantes');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const VALID_CATEGORIES = ANNOTATION_CATEGORIES.map(c => c.value);
const MAX_CONTENT_LENGTH = 1000;

async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Non authentifié', status: 401 } as const;
  }
  const token = authHeader.replace('Bearer ', '').trim();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return { error: 'Token invalide ou expiré', status: 401 } as const;
  }
  return { user: data.user } as const;
}

async function isAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();
  return data?.is_admin === true;
}

// GET /api/vod/annotations?clipId=UUID
// Retourne les annotations d'un clip (admin ou propriétaire du clip)
export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const user = auth.user;

  const { searchParams } = new URL(req.url);
  const clipId = searchParams.get('clipId');

  if (!clipId) {
    return NextResponse.json({ error: 'clipId manquant' }, { status: 400 });
  }

  // Vérifier que l'utilisateur a accès à ce clip (admin ou propriétaire)
  const callerIsAdmin = await isAdmin(user.id);
  if (!callerIsAdmin) {
    const { data: clip } = await supabase
      .from('vod_clips')
      .select('student_id')
      .eq('id', clipId)
      .single();
    if (!clip || clip.student_id !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
  }

  const { data, error } = await supabase
    .from('vod_annotations')
    .select('*')
    .eq('clip_id', clipId)
    .order('timestamp_sec', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('Erreur lecture annotations:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ annotations: data || [] });
}

// POST /api/vod/annotations
// Admin crée une annotation sur un clip
export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const user = auth.user;

  const callerIsAdmin = await isAdmin(user.id);
  if (!callerIsAdmin) {
    return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
  }

  let body: {
    clipId?: string;
    content?: string;
    category?: string;
    timestampSec?: number | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 });
  }

  const { clipId, content, category, timestampSec } = body;

  if (!clipId || !content || !category) {
    return NextResponse.json({ error: 'clipId, content et category sont obligatoires' }, { status: 400 });
  }

  const contentTrimmed = String(content).trim();
  const categoryNormalized = String(category).trim();

  if (contentTrimmed.length < 1 || contentTrimmed.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json(
      { error: `Le commentaire doit faire entre 1 et ${MAX_CONTENT_LENGTH} caractères` },
      { status: 400 }
    );
  }

  if (!VALID_CATEGORIES.includes(categoryNormalized as typeof VALID_CATEGORIES[number])) {
    return NextResponse.json({ error: 'Catégorie invalide' }, { status: 400 });
  }

  // Validation du timestamp (optionnel, doit être >= 0 si fourni)
  let tsec: number | null = null;
  if (timestampSec !== null && timestampSec !== undefined) {
    const n = Number(timestampSec);
    if (isNaN(n) || n < 0) {
      return NextResponse.json({ error: 'Le timestamp doit être un nombre positif en secondes' }, { status: 400 });
    }
    tsec = Math.floor(n);
  }

  // Vérifier que le clip existe
  const { data: clip } = await supabase
    .from('vod_clips')
    .select('id')
    .eq('id', clipId)
    .single();

  if (!clip) {
    return NextResponse.json({ error: 'Clip introuvable' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('vod_annotations')
    .insert([{
      clip_id: clipId,
      admin_id: user.id,
      content: contentTrimmed,
      category: categoryNormalized,
      timestamp_sec: tsec,
    }])
    .select()
    .single();

  if (error) {
    console.error('Erreur insertion annotation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ annotation: data, success: true }, { status: 201 });
}

// DELETE /api/vod/annotations?annotationId=UUID
// Admin supprime une annotation
export async function DELETE(req: NextRequest) {
  const auth = await getAuthUser(req);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const user = auth.user;

  const callerIsAdmin = await isAdmin(user.id);
  if (!callerIsAdmin) {
    return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const annotationId = searchParams.get('annotationId');

  if (!annotationId) {
    return NextResponse.json({ error: 'annotationId manquant' }, { status: 400 });
  }

  const { error } = await supabase
    .from('vod_annotations')
    .delete()
    .eq('id', annotationId);

  if (error) {
    console.error('Erreur suppression annotation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
