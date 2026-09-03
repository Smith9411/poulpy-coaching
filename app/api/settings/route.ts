import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables Supabase manquantes');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ALLOWED_KEYS = [
  'site_name',
  'description',
  'contact_email',
  'discord_url',
  'youtube_url',
  'twitch_url',
] as const;

type AllowedKey = (typeof ALLOWED_KEYS)[number];

const URL_FIELDS: AllowedKey[] = ['discord_url', 'youtube_url', 'twitch_url'];

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const { data: settings, error } = await supabase
      .from('settings')
      .select('key, value');

    if (error) {
      if (error.message?.includes('does not exist') || error.message?.includes('schema cache')) {
        return NextResponse.json(
          {
            settings: {},
            warning: "La table 'settings' n'existe pas encore dans Supabase. Exécutez create-settings-table.sql dans le SQL Editor.",
          },
          { status: 200 }
        );
      }
      throw error;
    }

    const settingsObj: Record<string, string> = {};
    if (settings) {
      settings.forEach((setting: { key: string; value: string }) => {
        settingsObj[setting.key] = setting.value;
      });
    }

    return NextResponse.json({ settings: settingsObj });
  } catch (error) {
    console.error('Erreur récupération settings:', error);
    return NextResponse.json(
      { settings: {}, error: 'Erreur lors de la récupération des paramètres.' },
      { status: 200 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    let user;
    let authError;
    try {
      const result = await supabase.auth.getUser(token);
      user = result.data.user;
      authError = result.error;
    } catch {
      return NextResponse.json({ error: 'Token invalide ou expiré.' }, { status: 401 });
    }

    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide ou expiré.' }, { status: 401 });
    }

    const { data: callerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !callerProfile || callerProfile.is_admin !== true) {
      return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
    }

    const body = await req.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Settings invalides' }, { status: 400 });
    }

    // Filtrer uniquement les clés autorisées et valider les URLs
    const sanitized: Array<{ key: AllowedKey; value: string }> = [];

    for (const [key, raw] of Object.entries(settings)) {
      if (!ALLOWED_KEYS.includes(key as AllowedKey)) continue;

      const value = String(raw ?? '').trim();
      if (URL_FIELDS.includes(key as AllowedKey) && value && !isValidUrl(value)) {
        return NextResponse.json(
          { error: `URL invalide pour le champ "${key}". Utilisez http:// ou https://` },
          { status: 400 }
        );
      }

      sanitized.push({ key: key as AllowedKey, value });
    }

    if (sanitized.length === 0) {
      return NextResponse.json({ error: 'Aucun champ à mettre à jour.' }, { status: 400 });
    }

    // Upsert chaque entrée. Service_role bypass RLS donc pas de problème de policy.
    const results = await Promise.all(
      sanitized.map(({ key, value }) =>
        supabase
          .from('settings')
          .upsert(
            { key, value, updated_at: new Date().toISOString() },
            { onConflict: 'key' }
          )
          .then(({ error }) => ({ key, error }))
      )
    );

    const errors = results.filter((r) => r.error);
    if (errors.length > 0) {
      console.error('Erreurs upsert settings:', errors);

      const tableMissing = errors.some((e) =>
        e.error?.message?.includes('does not exist') ||
        e.error?.message?.includes('schema cache')
      );

      if (tableMissing) {
        return NextResponse.json(
          {
            error:
              "La table 'settings' n'existe pas dans Supabase. Exécutez create-settings-table.sql dans le SQL Editor pour la créer, puis réessayez.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          error: `Erreur lors de la sauvegarde : ${errors[0].error?.message ?? 'inconnue'}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: sanitized.length,
      keys: sanitized.map((s) => s.key),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    console.error('Erreur mise à jour settings:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}