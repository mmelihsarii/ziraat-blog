/**
 * Dosyanın görevi: Public veri isteğini kısa CDN önbelleği ve dış servis kesintilerine karşı zaman aşımıyla çalıştırır.
 * Kullanıldığı yerler: app/api/posts/[id]/view/route.ts, services/publicService.ts
 */
import 'server-only';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

type NextFetchInit = RequestInit & {
  next?: { revalidate?: number };
};

/** Public veri isteğini kısa CDN önbelleği ve dış servis kesintilerine karşı zaman aşımıyla çalıştırır. */
function fetchPublicContent(input: RequestInfo | URL, init?: RequestInit) {
  // Dış servis kesintisinde sayfa uzun süre beyaz ekranda kalmadan güvenli boş/yedek içeriğe geçer.
  const timeout = AbortSignal.timeout(2500);
  const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  return fetch(input, {
    ...init,
    signal,
    // İki ayrı deploy aynı veriyi kullanır; kısa CDN önbelleği değişiklikleri en geç 5 saniyede görünür kılar.
    next: { revalidate: 5 },
  } as NextFetchInit);
}

/** Public sorguları kimlik çerezi taşımadan, beş saniyelik Next.js önbelleğiyle çalıştırır. */
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: fetchPublicContent,
      },
    },
  );
}
