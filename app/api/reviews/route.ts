import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables Supabase manquantes');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ReviewItem {
  id: string;
  name: string;
  game: string;
  rank: string;
  text: string;
  rating: number;
  user_id?: string;
  created_at: string;
  admin_response?: string;
  admin_response_at?: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    let orderByColumn: string = 'created_at';
    let ascending: boolean = false;

    switch (sortBy) {
      case 'name':
        orderByColumn = 'name';
        ascending = sortOrder === 'asc';
        break;
      case 'rating':
        orderByColumn = 'rating';
        ascending = sortOrder === 'asc';
        break;
      case 'date':
      default:
        orderByColumn = 'created_at';
        ascending = sortOrder === 'asc';
        break;
    }

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .order(orderByColumn, { ascending });

    if (error) throw error;

    return NextResponse.json({ reviews: reviews || [] });
  } catch (error) {
    console.error('Erreur récupération avis:', error);
    return NextResponse.json({ reviews: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, game, rank, text, rating, userId } = body;

    if (!name || !text || !game) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants (nom, jeu, avis)' },
        { status: 400 }
      );
    }

    const nameTrimmed = String(name).trim();
    const textTrimmed = String(text).trim();
    const gameTrimmed = String(game).trim();
    const rankTrimmed = String(rank || 'Membre Poulpy').trim();

    if (nameTrimmed.length < 1 || nameTrimmed.length > 60) {
      return NextResponse.json({ error: 'Le nom doit faire entre 1 et 60 caractères' }, { status: 400 });
    }
    if (textTrimmed.length < 1 || textTrimmed.length > 2000) {
      return NextResponse.json({ error: "L'avis doit faire entre 1 et 2000 caractères" }, { status: 400 });
    }
    if (!['valorant', 'apex', 'aim'].includes(gameTrimmed.toLowerCase())) {
      return NextResponse.json({ error: 'Jeu invalide' }, { status: 400 });
    }
    if (rankTrimmed.length > 60) {
      return NextResponse.json({ error: 'Le rang ne doit pas dépasser 60 caractères' }, { status: 400 });
    }

    const newReview: ReviewItem = {
      id: `review-${Date.now()}`,
      name: nameTrimmed,
      game: gameTrimmed,
      rank: rankTrimmed,
      text: textTrimmed,
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      user_id: typeof userId === 'string' && userId.length > 0 ? userId : undefined,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('reviews')
      .insert([newReview])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ review: data, success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    console.error('Erreur création avis:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id manquant' }, { status: 400 });
    }

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    console.error('Erreur suppression avis:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
