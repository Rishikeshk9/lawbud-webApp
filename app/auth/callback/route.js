import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { session },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session) {
      // Set the access token in a cookie
      cookies().set('access_token', session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      // Redirect to home page after successful authentication
      return NextResponse.redirect(new URL('/', requestUrl.origin), {
        status: 302,
      });
    }
  }

  // If there's an error, redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin), {
    status: 302,
  });
}
