/**
 * Dosyanın görevi: Tarayıcıdaki oturum ve RLS kapsamlı Supabase işlemleri için tek istemci üretir.
 * Kullanıldığı yerler: app/access-denied/page.tsx, app/dashboard/page.tsx, app/login/page.tsx, components/admin/AdminLayout.tsx ve yönetim servisleri
 */
'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

/** Tarayıcıdaki oturum ve RLS kapsamlı Supabase işlemleri için tek istemci üretir. */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export const supabase = createClient();
