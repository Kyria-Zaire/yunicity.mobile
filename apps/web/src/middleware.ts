import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/verification-pending',
  '/privacy',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes publiques + assets — toujours accessibles
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Routes d'upload KYC → accessibles meme en pending (profils pros)
  if (pathname.startsWith('/kyc-upload')) {
    return NextResponse.next();
  }

  // Verifier la session via cookie Better Auth
  const sessionCookie = request.cookies.get('yunicity.session_token');
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Toutes les autres routes (app) → accessible si session existe
  // La verification fine se fait cote API (requireVerified sur chaque endpoint)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
