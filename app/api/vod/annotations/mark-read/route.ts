import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables Supabase manquantes');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

// POST /api/vod/annotations/mark-read
// Marque les annotations sur les clips de l'élève connecté comme lues
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const user = auth.user;

    // 1. Récupérer tous les clip_id de l'élève
    const { data: clips, error: clipsError } = await supabase
      .from('vod_clips')
      .select('id')
      .eq('student_id', user.id);

    if (clipsError) {
      console.error('Erreur récupération clips student:', clipsError);
      return NextResponse.json({ error: clipsError.message }, { status: 500 });
    }

    if (!clips || clips.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    const clipIds = clips.map(c => c.id);

    // 2. Marquer les annotations non lues comme lues
    const { error: updateError } = await supabase
      .from('vod_annotations')
      .update({ read_at: new Date().toISOString() })
      .in('clip_id', clipIds)
      .is('read_at', null);

    if (updateError) {
      console.error('Erreur mark-read annotations:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    console.error('Erreur mark-read annotations catch:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
