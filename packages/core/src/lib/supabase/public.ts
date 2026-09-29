/**
 * Dosyanın görevi: Public veri isteğini güncel kayıt ve dış servis kesintilerine karşı zaman aşımıyla çalıştırır.
 * Kullanıldığı yerler: app/api/posts/[id]/view/route.ts, services/publicService.ts
 */
import 'server-only';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

/** Public veri isteğini önbelleğe takılmadan ve dış servis kesintilerine karşı zaman aşımıyla çalıştırır. */
function fetchPublicContent(input: RequestInfo | URL, init?: RequestInit) {
  // Dış servis kesintisinde sayfa uzun süre beyaz ekranda kalmadan güvenli boş/yedek içeriğe geçer.
  const timeout = AbortSignal.timeout(2500);
  const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  return fetch(input, {
    ...init,
    signal,
    // Admin ve site ayrı deploy edildiği için eski-yanıtlı yeniden doğrulama kullanma; tek yenilemede güncel kaydı getir.
    cache: 'no-store',
  });
}

/** Public sorguları kimlik çerezi ve eski veri önbelleği taşımadan çalıştırır. */
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
