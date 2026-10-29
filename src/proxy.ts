import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * Route guard. Signed-out users only reach /login, /reset-password, /offline and
 * static assets; signed-in users on /onboarding complete setup before anything else.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next({ request });

  const client = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data } = await client.auth.getUser();
  const user = data?.user ?? null;

  let onboarded = false;
  if (user) {
    // Read the flag directly; RLS lets owners see their own profile row.
    const { data: profile } = await client
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .maybeSingle();
    onboarded = profile?.onboarding_completed === true;
  }

  const isPublic = pathname === '/login' || pathname === '/reset-password' || pathname === '/offline';

  if (!user) {
    if (isPublic) return response;
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (!onboarded && pathname !== '/onboarding') {
    const url = request.nextUrl.clone();
    url.pathname = '/onboarding';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (onboarded && (pathname === '/login' || pathname === '/onboarding')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Protected screens only: skip api, static files, images and the manifest.
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|offline|reset-password|.*\\.\\w+$).*)',
  ],
};
