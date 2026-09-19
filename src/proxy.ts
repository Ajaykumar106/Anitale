import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

const protectedRoutes = [
  '/profile',
  '/settings',
  '/watchlist',
  '/history',
  '/continue-watching',
  '/collections',
  '/notifications',
];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !isLoggedIn) {
    const redirectUrl = new URL('/login', nextUrl.origin);
    redirectUrl.searchParams.set('callbackUrl', nextUrl.href);
    return NextResponse.redirect(redirectUrl);
  }

  // Allow next-auth to handle its own routes
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
