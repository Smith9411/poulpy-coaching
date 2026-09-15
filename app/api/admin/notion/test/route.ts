import { NextRequest, NextResponse } from 'next/server';
import { testNotionConnection } from '@/lib/notion';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/notion/test
 * Diagnostique la connexion avec Notion et renvoie l'état détaillé.
 */
export async function GET(req: NextRequest) {
  try {
    const result = await testNotionConnection();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: `Erreur interne : ${err.message || err}` },
      { status: 500 }
    );
  }
}
