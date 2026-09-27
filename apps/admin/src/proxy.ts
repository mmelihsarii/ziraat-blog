/**
 * Dosyanın görevi: Next.js 16 ağ sınırında yalnızca oturum gerektiren rotaları işler.
 * Kullanıldığı yerler: Derleme aracı veya ilgili çalışma komutu tarafından yüklenir.
 */
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

/** Next.js 16 ağ sınırında yalnızca oturum gerektiren rotaları işler. */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
