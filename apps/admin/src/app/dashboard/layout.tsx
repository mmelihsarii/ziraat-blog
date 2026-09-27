/**
 * Dosyanın görevi: Dashboard altındaki tüm ekranları doğrulanmış Supabase oturumuyla sınırlar.
 * Kullanıldığı yerler: Next.js dosya tabanlı rota sistemi tarafından doğrudan yüklenir.
 */
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** Dashboard altındaki tüm ekranları doğrulanmış Supabase oturumuyla sınırlar. */
export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect('/login');
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', data.claims.sub)
    .maybeSingle();
  if (!profile?.is_admin) redirect('/access-denied');
  return children;
}
