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
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) };
  }

  const token = authHeader.replace('Bearer ', '').trim();

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return { error: NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 }) };
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
    const { searchParams } = new URL(req.url);
    const userIdFilter = searchParams.get('userId');

    let authUserPromise: Promise<{ data: { users: unknown[] } | null; error: unknown }>;
    if (userIdFilter) {
      authUserPromise = supabaseAdmin.auth.admin.getUserById(userIdFilter)
        .then(({ data, error }) => ({
          data: data?.user ? { users: [data.user] } : { users: [] },
          error,
        }))
        .catch((err) => ({ data: { users: [] }, error: err }));
    } else {
      authUserPromise = supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
        .then(({ data, error }) => ({ data, error }))
        .catch((err) => ({ data: { users: [] }, error: err }));
    }

    const profilesQuery = userIdFilter
      ? supabaseAdmin
          .from('profiles')
          .select('id, username, is_admin, created_at, favorite_game, valorant_rank, apex_rank, bio')
          .eq('id', userIdFilter)
      : supabaseAdmin
          .from('profiles')
          .select('id, username, is_admin, created_at, favorite_game, valorant_rank, apex_rank, bio');

    const [authRes, profRes] = await Promise.all([
      authUserPromise,
      profilesQuery,
    ]);

    const authUsersList = (authRes?.data?.users || []) as Array<{
      id: string;
      email?: string;
      created_at?: string;
      user_metadata?: { username?: string; avatar_url?: string };
    }>;

    interface ProfileRow {
      id: string;
      username?: string | null;
      is_admin?: boolean | null;
      created_at?: string | null;
      favorite_game?: string | null;
      valorant_rank?: string | null;
      apex_rank?: string | null;
      bio?: string | null;
    }

    const profilesList = (profRes?.data || []) as ProfileRow[];
    const profilesMap = new Map<string, ProfileRow>(profilesList.map(p => [p.id, p]));

    // S'assurer que tous les profils Supabase sont inclus même s'ils ne sont pas dans auth.users
    const allUserIds = new Set([
      ...authUsersList.map(u => u.id),
      ...profilesList.map(p => p.id),
    ]);

    const authMap = new Map(authUsersList.map(u => [u.id, u]));

    const users = Array.from(allUserIds).map((id) => {
      const u = authMap.get(id);
      const p = profilesMap.get(id);
      const meta = u?.user_metadata || {};
      const username = p?.username || meta.username || u?.email?.split('@')[0] || 'Joueur';
      const avatarUrl = meta.avatar_url || null;
      const bio = (p?.bio && typeof p.bio === 'string') ? p.bio : null;

      return {
        id,
        username,
        email: u?.email || '—',
        isAdmin: p?.is_admin === true,
        createdAt: u?.created_at || p?.created_at || new Date().toISOString(),
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
    console.error('Erreur GET /api/admin/users:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const { userId, username, isAdmin } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId manquant' }, { status: 400 });
    }

    const updates: { username?: string; is_admin?: boolean } = {};

    if (username !== undefined) {
      const trimmed = String(username).trim();
      if (!trimmed || trimmed.length > 30) {
        return NextResponse.json({ error: 'Le pseudo doit faire entre 1 et 30 caractères' }, { status: 400 });
      }
      updates.username = trimmed;
    }

    if (isAdmin !== undefined) {
      if (userId === auth.user!.id && isAdmin === false) {
        return NextResponse.json({ error: 'Tu ne peux pas retirer tes propres droits administrateur' }, { status: 400 });
      }
      updates.is_admin = Boolean(isAdmin);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Aucune modification fournie' }, { status: 400 });
    }

    // 1. Mettre à jour profiles avec service role
    const { error: profError } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (profError) {
      console.error('Erreur update profiles:', profError);
      return NextResponse.json({ error: profError.message }, { status: 500 });
    }

    // 2. Si le username est modifié, mettre à jour également user_metadata dans auth
    if (updates.username) {
      const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(userId);
      const existingMeta = targetUser?.user?.user_metadata || {};
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { ...existingMeta, username: updates.username },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, updates });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
    console.error('Erreur PATCH /api/admin/users:', err);
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
    console.error('Erreur DELETE /api/admin/users:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
