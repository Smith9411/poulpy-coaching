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

async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return { error: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) };
  }

  const token = authHeader.replace('Bearer ', '');

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return { error: NextResponse.json({ error: 'Token invalide' }, { status: 401 }) };
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (profile?.is_admin !== true) {
    return { error: NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 }) };
  }

  return { user };
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const [{ data: authUsers, error: authErr }, { data: profiles, error: profErr }] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers(),
      supabaseAdmin.from('profiles').select('id, username, is_admin, created_at, favorite_game, valorant_rank, apex_rank, bio'),
    ]);

    if (authErr) throw authErr;
    if (profErr) throw profErr;

    const profilesMap = new Map((profiles || []).map((p) => [p.id, p]));

    const users = (authUsers.users || []).map((u) => {
      const p = profilesMap.get(u.id);
      const meta = u.user_metadata || {};
      const username = p?.username || meta.username || u.email?.split('@')[0] || 'Joueur';
      const avatarUrl = meta.avatar_url || null;
      const bio = (p?.bio && typeof p.bio === 'string') ? p.bio : null;

      return {
        id: u.id,
        username,
        email: u.email || '—',
        isAdmin: p?.is_admin === true,
        createdAt: u.created_at || p?.created_at || '',
        avatarUrl,
        initial: username.charAt(0).toUpperCase(),
        favoriteGame: p?.favorite_game || null,
        valorantRank: p?.valorant_rank || null,
        apexRank: p?.apex_rank || null,
        bio,
      };
    });

    return NextResponse.json({ users });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la récupération';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId manquant' }, { status: 400 });
    }

    if (userId === auth.user!.id) {
      return NextResponse.json({ error: 'Impossible de supprimer ton propre compte' }, { status: 400 });
    }

    await Promise.all([
      supabaseAdmin.from('profiles').delete().eq('id', userId),
      supabaseAdmin.auth.admin.deleteUser(userId),
    ]);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la suppression';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
