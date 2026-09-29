/**
 * Dosyanın görevi: Oturumdaki yoneticinin kaydettigi profili Hakkimda'ya baglar ve eski profil onbellegini bitirir.
 * Kullanıldığı yerler: Next.js dosya tabanlı rota sistemi tarafından doğrudan yüklenir.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** Oturumdaki yoneticinin kaydettigi profili Hakkimda'ya baglar ve eski profil onbellegini bitirir. */
export async function POST() {
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) {
    return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', auth.user.id)
    .maybeSingle();
  if (profileError) {
    return NextResponse.json({ error: 'Profil okunamadi.' }, { status: 500 });
  }
  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Yonetici yetkisi gerekli.' }, { status: 403 });
  }

  const { error } = await supabase.from('site_content').upsert({
    key: 'about_profile',
    type: 'about',
    data: { profile_id: auth.user.id },
  }, { onConflict: 'key' });
  if (error) {
    console.error('About profile could not be published:', error.message);
    return NextResponse.json({ error: 'Profil yayinlanamadi.' }, { status: 500 });
  }

  // Ziyaretçi uygulaması bir sonraki sayfa isteğinde aynı Supabase kaydını doğrudan okur.
  return NextResponse.json({ published: true });
}
