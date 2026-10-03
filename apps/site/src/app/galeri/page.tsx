/**
 * Dosyanın görevi: Yayımlanmış fotoğraf ve videoları site tasarımına bağlı galeri deneyiminde sunar.
 * Kullanıldığı yerler: /galeri public rotası.
 */
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GalleryExperience from '@/components/GalleryExperience';
import { getPublicGalleryItems, getPublicProfile } from '@/services/publicService';

export const metadata: Metadata = {
  title: 'Galeri',
  description: 'Tarım uygulamaları, saha çalışmaları ve doğadan fotoğraf ve videolar.',
};

/** Public galeri verisiyle profil bilgisini paralel yükleyip sayfa kabuğunu oluşturur. */
export default async function GalleryPage() {
  const [items, profile] = await Promise.all([getPublicGalleryItems(), getPublicProfile()]);
  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="bg-neutral-950 text-white pt-36 md:pt-40 pb-14 md:pb-20 px-4 md:px-12 border-b border-neutral-900">
          <div className="max-w-7xl mx-auto">
            <p className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-xs">Fotoğraf ve Video</p>
            <h1 className="mt-4 font-display font-black text-4xl md:text-6xl uppercase">Galeri</h1>
            <p className="mt-5 max-w-2xl text-base md:text-lg leading-8 text-neutral-300">Saha çalışmalarından, üretim süreçlerinden ve doğadan seçilmiş kayıtlar.</p>
          </div>
        </section>
        <GalleryExperience items={items} />
      </main>
      <Footer companyName="Ziraat Notları" profile={profile} />
    </div>
  );
}
