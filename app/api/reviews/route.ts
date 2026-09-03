import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables Supabase manquantes');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const EDIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const VALID_GAMES = ['valorant', 'apex', 'aim'];
const MAX_TEXT_LENGTH = 2000;
const MAX_NAME_LENGTH = 60;
const MAX_RANK_LENGTH = 60;

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
  updated_at?: string;
}

async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Non authentifié', status: 401 } as const;
  }
  const token = authHeader.replace('Bearer ', '').trim();
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return { error: 'Token invalide ou expiré', status: 401 } as const;
    }
    return { user: data.user } as const;
  } catch {
    return { error: 'Token invalide ou expiré', status: 401 } as const;
  }
}

async function getCallerIsAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();
  return data?.is_admin === true;
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
    const gameTrimmed = String(game).trim().toLowerCase();
    const rankTrimmed = String(rank || 'Membre Poulpy').trim();

    if (nameTrimmed.length < 1 || nameTrimmed.length > MAX_NAME_LENGTH) {
      return NextResponse.json({ error: `Le nom doit faire entre 1 et ${MAX_NAME_LENGTH} caractères` }, { status: 400 });
    }
    if (textTrimmed.length < 1 || textTrimmed.length > MAX_TEXT_LENGTH) {
      return NextResponse.json({ error: `L'avis doit faire entre 1 et ${MAX_TEXT_LENGTH} caractères` }, { status: 400 });
    }
    if (!VALID_GAMES.includes(gameTrimmed)) {
      return NextResponse.json({ error: 'Jeu invalide' }, { status: 400 });
    }
    if (rankTrimmed.length > MAX_RANK_LENGTH) {
      return NextResponse.json({ error: `Le rang ne doit pas dépasser ${MAX_RANK_LENGTH} caractères` }, { status: 400 });
    }

    const newReview: ReviewItem = {
      id: `review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const user = auth.user;

    const body = await req.json();
    const { id, text, rating, rank, game } = body;

    if (!id) {
      return NextResponse.json({ error: 'id manquant' }, { status: 400 });
    }

    // Charger l'avis existant
    const { data: existing, error: fetchError } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Avis introuvable' }, { status: 404 });
    }

    // Vérifier les permissions : propriétaire OU admin
    const isOwner = existing.user_id === user.id;
    const isAdmin = await getCallerIsAdmin(user.id);

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission de modifier cet avis." },
        { status: 403 }
      );
    }

    // Fenêtre d'édition de 5 min pour le propriétaire (admin peut toujours éditer)
    if (isOwner && !isAdmin) {
      const createdAt = new Date(existing.created_at).getTime();
      const now = Date.now();
      if (now - createdAt > EDIT_WINDOW_MS) {
        const minutesLeft = 0;
        return NextResponse.json(
          {
            error: `La fenêtre d'édition de 5 minutes est dépassée.${isAdmin ? '' : ' Un admin peut encore le modifier.'}`,
          },
          { status: 403 }
        );
      }
    }

    // Construire l'objet de mise à jour avec validation
    const updates: Partial<ReviewItem> = {};

    if (typeof text === 'string') {
      const trimmed = text.trim();
      if (trimmed.length < 1 || trimmed.length > MAX_TEXT_LENGTH) {
        return NextResponse.json(
          { error: `L'avis doit faire entre 1 et ${MAX_TEXT_LENGTH} caractères` },
          { status: 400 }
        );
      }
      updates.text = trimmed;
    }

    if (rating !== undefined) {
      const r = Number(rating);
      if (isNaN(r) || r < 1 || r > 5) {
        return NextResponse.json({ error: 'La note doit être entre 1 et 5' }, { status: 400 });
      }
      updates.rating = r;
    }

    if (typeof rank === 'string') {
      const trimmed = rank.trim();
      if (trimmed.length > MAX_RANK_LENGTH) {
        return NextResponse.json(
          { error: `Le rang ne doit pas dépasser ${MAX_RANK_LENGTH} caractères` },
          { status: 400 }
        );
      }
      updates.rank = trimmed || 'Membre Poulpy';
    }

    if (typeof game === 'string') {
      const normalized = game.trim().toLowerCase();
      if (!VALID_GAMES.includes(normalized)) {
        return NextResponse.json({ error: 'Jeu invalide' }, { status: 400 });
      }
      updates.game = normalized;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Aucun champ à modifier' }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ review: data, success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    console.error('Erreur modification avis:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const user = auth.user;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id manquant' }, { status: 400 });
    }

    // Charger l'avis pour vérifier le propriétaire
    const { data: existing, error: fetchError } = await supabase
      .from('reviews')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Avis introuvable' }, { status: 404 });
    }

    const isOwner = existing.user_id === user.id;
    const isAdmin = await getCallerIsAdmin(user.id);

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission de supprimer cet avis." },
        { status: 403 }
      );
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