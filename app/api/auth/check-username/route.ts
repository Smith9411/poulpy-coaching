import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables Supabase manquantes');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const USERNAME_REGEX = /^[a-zA-Z0-9À-ÿ_.\- ]{2,20}$/;

// Vérifie si un pseudo est déjà utilisé dans profiles.
// Auth obligatoire (utilisateur connecté via Google qui choisit son pseudo) ;
// RLS bloquant la lecture des profils des autres, le check passe par service_role.
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const username = (req.nextUrl.searchParams.get('username') || '').trim();
    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json({ error: 'Pseudo invalide' }, { status: 400 });
    }

    // Échappe les jokers LIKE (_ % \) pour un match littéral, insensible à la casse
    const escaped = username.replace(/[\\%_]/g, '\\$&');
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', escaped)
      .maybeSingle();

    if (error) throw error;

    // Disponible si personne ne l'utilise, ou si c'est le pseudo du demandeur lui-même
    const available = !data || data.id === user.id;
    return NextResponse.json({ available });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    console.error('Erreur check-username:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
