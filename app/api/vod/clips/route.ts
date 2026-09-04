import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseVideoUrl } from '@/lib/vod-utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables Supabase manquantes');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const VALID_GAMES = ['valorant', 'apex', 'aim'] as const;
const MAX_TITLE_LENGTH = 120;
const MAX_DESC_LENGTH = 500;

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

// GET /api/vod/clips?studentId=UUID
// Retourne tous les clips d'un élève (admin ou self uniquement)
export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const user = auth.user;

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');

  if (!studentId) {
    return NextResponse.json({ error: 'studentId manquant' }, { status: 400 });
  }

  // Vérification : admin ou l'élève lui-même
  const callerIsAdmin = await isAdmin(user.id);
  if (!callerIsAdmin && user.id !== studentId) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('vod_clips')
    .select('*')
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Erreur lecture clips:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ clips: data || [] });
}

// POST /api/vod/clips
// Élève soumet un nouveau clip
export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const user = auth.user;

  let body: { url?: string; title?: string; game?: string; description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 });
  }

  const { url, title, game, description } = body;

  if (!url || !title || !game) {
    return NextResponse.json({ error: 'url, title et game sont obligatoires' }, { status: 400 });
  }

  const titleTrimmed = String(title).trim();
  const descTrimmed = description ? String(description).trim() : null;
  const gameNormalized = String(game).trim().toLowerCase();

  if (titleTrimmed.length < 1 || titleTrimmed.length > MAX_TITLE_LENGTH) {
    return NextResponse.json({ error: `Le titre doit faire entre 1 et ${MAX_TITLE_LENGTH} caractères` }, { status: 400 });
  }

  if (!(VALID_GAMES as readonly string[]).includes(gameNormalized)) {
    return NextResponse.json({ error: 'Jeu invalide (valorant, apex, aim)' }, { status: 400 });
  }

  if (descTrimmed && descTrimmed.length > MAX_DESC_LENGTH) {
    return NextResponse.json({ error: `La description ne doit pas dépasser ${MAX_DESC_LENGTH} caractères` }, { status: 400 });
  }

  // Validation de l'URL vidéo
  const parsed = parseVideoUrl(url);
  if (!parsed) {
    return NextResponse.json(
      { error: 'URL non reconnue. Formats acceptés : YouTube, Twitch clips/VOD, Medal.tv' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('vod_clips')
    .insert([{
      student_id: user.id,
      url: parsed.originalUrl,
      title: titleTrimmed,
      game: gameNormalized,
      description: descTrimmed || null,
    }])
    .select()
    .single();

  if (error) {
    console.error('Erreur insertion clip:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ clip: data, success: true }, { status: 201 });
}

// DELETE /api/vod/clips?clipId=UUID
// Admin supprime un clip (et ses annotations en cascade via FK)
export async function DELETE(req: NextRequest) {
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

  const callerIsAdmin = await isAdmin(user.id);
  if (!callerIsAdmin) {
    return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
  }

  const { error } = await supabase
    .from('vod_clips')
    .delete()
    .eq('id', clipId);

  if (error) {
    console.error('Erreur suppression clip:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
