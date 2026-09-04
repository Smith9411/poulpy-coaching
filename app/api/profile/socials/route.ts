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

// Format handles and urls
function cleanHandle(val?: string | null): string | null {
  if (!val) return null;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId');

    let userId = targetUserId;

    if (!userId) {
      const authHeader = req.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
      }
      const token = authHeader.replace('Bearer ', '').trim();
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !user) {
        return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
      }
      userId = user.id;
    }

    // 1. Try reading from profiles
    let discord: string | null = null;
    let twitch: string | null = null;
    let youtube: string | null = null;
    let tiktok: string | null = null;

    const { data: profile, error: profError } = await supabaseAdmin
      .from('profiles')
      .select('discord, twitch, youtube, tiktok')
      .eq('id', userId)
      .maybeSingle();

    if (!profError && profile) {
      discord = profile.discord || null;
      twitch = profile.twitch || null;
      youtube = profile.youtube || null;
      tiktok = profile.tiktok || null;
    }

    // 2. Fallback to auth metadata if profile columns are empty
    if (!discord && !twitch && !youtube && !tiktok) {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
      const meta = authUser?.user?.user_metadata || {};
      discord = meta.discord || null;
      twitch = meta.twitch || null;
      youtube = meta.youtube || null;
      tiktok = meta.tiktok || null;
    }

    return NextResponse.json({
      socials: { discord, twitch, youtube, tiktok },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur récupération réseaux';
    return NextResponse.json({ error: message }, { status: 500 });
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
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }

    const body = await req.json();
    const discord = cleanHandle(body.discord);
    const twitch = cleanHandle(body.twitch);
    const youtube = cleanHandle(body.youtube);
    const tiktok = cleanHandle(body.tiktok);

    // 1. Always update in user_metadata (guaranteed to succeed immediately)
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        discord,
        twitch,
        youtube,
        tiktok,
      },
    });

    // 2. Also try updating profiles table
    try {
      await supabaseAdmin
        .from('profiles')
        .update({
          discord,
          twitch,
          youtube,
          tiktok,
        })
        .eq('id', user.id);
    } catch (dbErr) {
      console.warn('[Socials] Profiles table update warning:', dbErr);
    }

    return NextResponse.json({
      success: true,
      socials: { discord, twitch, youtube, tiktok },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur sauvegarde réseaux';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
