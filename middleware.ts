import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  // Redirection automatique et permanente de vercel.app vers le domaine officiel www.poulpy-coaching.fr
  // Transfère 100% de la réputation SEO de Google vers le nouveau domaine
  if (host.includes('poulpy-coaching.vercel.app')) {
    const url = request.nextUrl.clone();
    url.host = 'www.poulpy-coaching.fr';
    url.protocol = 'https';
    url.port = '';
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Intercepte toutes les requêtes de pages sauf les assets statiques et l'API
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|json)).*)',
  ],
};
