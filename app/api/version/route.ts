import { NextResponse } from 'next/server';

// Version identifier: Vercel commit SHA or deploy timestamp generated when this build starts
const BUILD_VERSION =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
  process.env.NEXT_BUILD_ID ||
  '2026-09-04-v4';

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
