/**
 * Dosyanın görevi: Oturum çerezlerini yeniler ve dashboard için hızlı erişim kontrolü uygular.
 * Kullanıldığı yerler: proxy.ts
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

/** Oturum çerezlerini yeniler ve dashboard için hızlı erişim kontrolü uygular. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims) && !error;
  let isAdmin = false;
  if (isAuthenticated && data?.claims.sub) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', data.claims.sub)
      .maybeSingle();
    isAdmin = profile?.is_admin === true;
  }
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/dashboard') && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith('/dashboard') && !isAdmin) {
    return NextResponse.redirect(new URL('/access-denied', request.url));
  }

  if (pathname === '/login' && isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}
