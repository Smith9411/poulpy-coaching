import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  // Redirection automatique de tout trafic provenant de l'ancien vercel.app
  // (y compris le lien /avis actuellement référencé sur Google) directement vers la page d'accueil officielle
  if (host.includes('poulpy-coaching.vercel.app')) {
    return NextResponse.redirect(new URL('https://www.poulpy-coaching.fr', request.url), 308);
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
