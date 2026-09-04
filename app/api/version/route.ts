import { NextResponse } from 'next/server';

// Version identifier généré à chaque build :
// - Sur Vercel : commit SHA (VERCEL_GIT_COMMIT_SHA)
// - Sinon : timestamp injecté dans next.config.ts (NEXT_PUBLIC_BUILD_TIME)
// → change à chaque déploiement → détection fiable des mises à jour côté client
const BUILD_VERSION =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
  process.env.NEXT_PUBLIC_BUILD_TIME ||
  'local-dev';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      version: BUILD_VERSION,
      updatedAt: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
