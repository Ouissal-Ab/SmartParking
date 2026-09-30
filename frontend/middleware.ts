import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function buildLoginRedirect(req: NextRequest): NextResponse {
  const url = new URL('/login', req.url);
  const original = req.nextUrl.pathname + (req.nextUrl.search || '');
  if (original !== '/login' && original !== '/') {
    url.searchParams.set('redirect', original);
  }
  return NextResponse.redirect(url);
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const role = req.cookies.get('role')?.value;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (!token) return buildLoginRedirect(req);
    if (role !== 'ADMIN') return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/reserve') ||
    pathname.startsWith('/reservations') ||
    pathname.startsWith('/payment') ||
    pathname.startsWith('/confirmation')
  ) {
    if (!token) return buildLoginRedirect(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard',
    '/reserve/:path*',
    '/reservations',
    '/payment',
    '/confirmation',
  ],
};
