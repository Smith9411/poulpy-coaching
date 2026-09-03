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
    } catch (e) {
      return NextResponse.json({ error: 'Token invalide ou expiré, reconnectez-vous.' }, { status: 401 });
    }

    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide ou expiré, reconnectez-vous.' }, { status: 401 });
    }

    const { data: callerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Erreur récupération profile:', profileError);
      return NextResponse.json({ error: 'Erreur récupération du profil' }, { status: 500 });
    }

    if (!callerProfile || callerProfile.is_admin !== true) {
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

    const responseAt = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('reviews')
      .update({
        admin_response: responseTrimmed,
        admin_response_at: responseAt,
      })
      .eq('id', reviewId);

    if (updateError) {
      console.error('Erreur update Supabase:', updateError);

      if (
        updateError.message?.includes('column') ||
        updateError.message?.includes('schema cache') ||
        updateError.message?.includes('does not exist')
      ) {
        return NextResponse.json({
          error:
            "Les colonnes 'admin_response' et 'admin_response_at' doivent être ajoutées à la table 'reviews'. Exécutez le SQL fourni dans add-review-response-columns.sql via le SQL Editor de Supabase.",
        }, { status: 500 });
      }

      return NextResponse.json({
        error: `Erreur lors de la mise à jour : ${updateError.message}`,
      }, { status: 500 });
    }

    return NextResponse.json({
      response: responseTrimmed,
      response_at: responseAt,
      success: true,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    console.error('Erreur réponse admin catch:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}