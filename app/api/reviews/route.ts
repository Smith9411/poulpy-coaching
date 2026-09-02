import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface ReviewItem {
  id: string;
  name: string;
  game: string;
  rank: string;
  text: string;
  rating: number;
  userId?: string;
  createdAt: string;
}

const reviewsFilePath = path.join(process.cwd(), 'data', 'reviews.json');

function getReviews(): ReviewItem[] {
  try {
    if (!fs.existsSync(reviewsFilePath)) {
      return [];
    }
    const raw = fs.readFileSync(reviewsFilePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveReviews(reviews: ReviewItem[]) {
  const dir = path.dirname(reviewsFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(reviewsFilePath, JSON.stringify(reviews, null, 2), 'utf8');
}

export async function GET() {
  const reviews = getReviews();
  return NextResponse.json({ reviews });
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

    const reviews = getReviews();
    const newReview: ReviewItem = {
      id: `review-${Date.now()}`,
      name: name.trim(),
      game: game.trim(),
      rank: (rank || 'Membre Poulpy').trim(),
      text: text.trim(),
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      userId: userId || undefined,
      createdAt: new Date().toISOString(),
    };

    reviews.unshift(newReview);
    saveReviews(reviews);

    return NextResponse.json({ review: newReview, success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id manquant' }, { status: 400 });
    }

    const reviews = getReviews();
    const filtered = reviews.filter((r) => r.id !== id);
    saveReviews(filtered);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
