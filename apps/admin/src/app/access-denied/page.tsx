/**
 * Dosyanın görevi: Yönetici olmayan oturumlara güvenli çıkış ve public siteye dönüş seçeneklerini sunar.
 * Kullanıldığı yerler: Next.js dosya tabanlı rota sistemi tarafından doğrudan yüklenir.
 */
'use client';

import { useRouter } from 'next/navigation';
import { ShieldX } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

/** Yönetici olmayan oturumlara güvenli çıkış ve public siteye dönüş seçeneklerini sunar. */
export default function AccessDeniedPage() {
  const router = useRouter();
  const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  /** Aktif yetkisiz oturumu kapatıp giriş ekranına geçer. */
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-neutral-50 px-4 flex items-center justify-center">
      <section className="w-full max-w-lg bg-white border border-neutral-200 rounded-lg shadow-sm p-8 md:p-12 text-center">
        <ShieldX className="w-12 h-12 text-red-500 mx-auto" />
        <h1 className="mt-6 font-display font-black text-3xl uppercase text-brand-dark">Erişim Yetkiniz Yok</h1>
        <p className="mt-3 text-brand-gray">Bu hesap yönetim paneline erişmek için yetkilendirilmemiş.</p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <button type="button" onClick={handleSignOut} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg">Başka Hesapla Giriş</button>
          <a href={publicSiteUrl} className="px-6 py-3 border border-neutral-300 hover:bg-neutral-50 text-brand-dark font-bold rounded-lg">Ana Sayfa</a>
        </div>
      </section>
    </main>
  );
}
