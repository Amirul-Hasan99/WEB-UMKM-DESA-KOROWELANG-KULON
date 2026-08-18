import { NextRequest, NextResponse } from 'next/server';

// Protected paths that require authentication
const PROTECTED_PATHS = ['/admin', '/superadmin'];
const SUPERADMIN_ONLY_PATHS = ['/superadmin'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if the path requires protection
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  if (!isProtected) {
    return NextResponse.next();
  }

  // Read the auth token from cookie (set by login flow)
  const token = req.cookies.get('umkm_token')?.value;
  const userStr = req.cookies.get('umkm_user')?.value;

  // No token — redirect to login
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role for superadmin-only paths
  if (SUPERADMIN_ONLY_PATHS.some((path) => pathname.startsWith(path))) {
    try {
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user || user.role !== 'superadmin') {
        // Regular admin tried to access superadmin area
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
    } catch {
      // If we can't parse the user cookie, redirect to login
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Protect admin and superadmin routes
  // Exclude static files, API routes, and Next.js internals
  matcher: [
    '/admin/:path*',
    '/superadmin/:path*',
  ],
};
