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
    console.log('Début API response admin');
    
    const authHeader = req.headers.get('authorization');
    console.log('Auth header:', authHeader ? 'Présent' : 'Absent');
    
    if (!authHeader) {
      console.log('Erreur: Non authentifié');
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token extrait, longueur:', token.length);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    console.log('Auth result:', authError ? 'Erreur' : 'Succès', 'User:', user ? user.id : 'null');
    
    if (authError || !user) {
      console.log('Erreur: Token invalide', authError);
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { data: callerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    console.log('Profile result:', profileError ? 'Erreur' : 'Succès', 'is_admin:', callerProfile?.is_admin);

    if (profileError) {
      console.log('Erreur récupération profile:', profileError);
      return NextResponse.json({ error: 'Erreur récupération profile' }, { status: 500 });
    }

    if (callerProfile?.is_admin !== true) {
      console.log('Erreur: Pas admin');
      return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
    }

    const body = await req.json();
    const { reviewId, response } = body;
    console.log('Body reçu:', { reviewId, responseLength: response?.length });

    if (!reviewId || !response) {
      console.log('Erreur: Champs manquants');
      return NextResponse.json(
        { error: 'Champs obligatoires manquants (reviewId, response)' },
        { status: 400 }
      );
    }

    const responseTrimmed = String(response).trim();
    if (responseTrimmed.length < 1 || responseTrimmed.length > 1000) {
      console.log('Erreur: Longueur réponse invalide');
      return NextResponse.json(
        { error: 'La réponse doit faire entre 1 et 1000 caractères' },
        { status: 400 }
      );
    }

    console.log('Tentative update review:', reviewId);
    
    // D'abord vérifier si la review existe
    const { data: existingReview, error: checkError } = await supabase
      .from('reviews')
      .select('id')
      .eq('id', reviewId)
      .single();
    
    if (checkError || !existingReview) {
      console.log('Erreur: Review non trouvée', checkError);
      return NextResponse.json({ error: 'Avis non trouvé' }, { status: 404 });
    }
    
    console.log('Review trouvée, tentative update...');
    const { data, error } = await supabase
      .from('reviews')
      .update({
        admin_response: responseTrimmed,
        admin_response_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase update:', error);
      // Vérifier si l'erreur est liée aux colonnes manquantes
      if (error.message.includes('column') || error.message.includes('does not exist')) {
        return NextResponse.json({ 
          error: 'Les colonnes admin_response doivent être ajoutées à la table reviews. Voir README.md pour les instructions SQL.' 
        }, { status: 500 });
      }
      throw error;
    }

    console.log('Update réussi:', data);
    return NextResponse.json({ 
      response: data.admin_response, 
      response_at: data.admin_response_at,
      success: true 
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    console.error('Erreur réponse admin catch:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
