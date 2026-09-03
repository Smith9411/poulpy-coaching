import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables Supabase manquantes');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
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

    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (callerProfile?.is_admin !== true) {
      return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
    }

    const body = await req.json();
    const { reviewId, response } = body;

    if (!reviewId || !response) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants (reviewId, response)' },
        { status: 400 }
      );
    }

    const responseTrimmed = String(response).trim();
    if (responseTrimmed.length < 1 || responseTrimmed.length > 1000) {
      return NextResponse.json(
        { error: 'La réponse doit faire entre 1 et 1000 caractères' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('reviews')
      .update({
        admin_response: responseTrimmed,
        admin_response_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      response: data.admin_response, 
      response_at: data.admin_response_at,
      success: true 
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    console.error('Erreur réponse admin:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
