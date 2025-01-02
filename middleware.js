import { NextResponse } from 'next/server';

// Add routes that don't require authentication
const publicRoutes = ['/login', '/register'];

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Allow access to public routes when not authenticated
  if (publicRoutes.includes(pathname)) {
    // If user is already authenticated, redirect to lawyers page
    if (token) {
      return NextResponse.redirect(new URL('/lawyers', request.url));
    }
    return NextResponse.next();
  }

  // Redirect to login if no token is present for protected routes
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
