/**
 * Dosyanın görevi: Server Component ve Route Handler işlemlerini istek çerezlerindeki oturumla çalıştırır.
 * Kullanıldığı yerler: app/api/profile/publish/route.ts ve app/dashboard/layout.tsx
 */
import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

/** Server Component ve Route Handler işlemlerini istek çerezlerindeki oturumla çalıştırır. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Sunucu bileşenleri çerez yazamadığı için oturum yenilemesini proxy üstlenir.
          }
        },
      },
    },
  );
}
