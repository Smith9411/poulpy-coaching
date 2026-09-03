import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

export async function GET() {
  try {
    const [{ data: authUsers, error: authErr }, { data: profiles, error: profErr }] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers(),
      supabaseAdmin.from('profiles').select('id, username, is_admin, created_at, favorite_game, valorant_rank, apex_rank, bio'),
    ]);

    if (authErr) throw authErr;

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
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId manquant' }, { status: 400 });
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
