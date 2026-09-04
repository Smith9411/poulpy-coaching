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

async function isAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();
  return data?.is_admin === true;
}

// POST /api/vod/clips/mark-read
// Body: { studentId?: string, clipId?: string }
// Marque les clips comme lus par l'admin
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const user = auth.user;

    const callerIsAdmin = await isAdmin(user.id);
    if (!callerIsAdmin) {
      return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
    }

    let body: { studentId?: string; clipId?: string } = {};
    try {
      body = await req.json();
    } catch {
      // body empty is ok if clipId in params
    }

    const { studentId, clipId } = body;

    let query = supabase
      .from('vod_clips')
      .update({ read_at: new Date().toISOString() })
      .is('read_at', null);

    if (clipId) {
      query = query.eq('id', clipId);
    } else if (studentId) {
      query = query.eq('student_id', studentId);
    }

    const { error } = await query;
    if (error) {
      console.error('Erreur mark-read clips:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    console.error('Erreur mark-read clips catch:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
