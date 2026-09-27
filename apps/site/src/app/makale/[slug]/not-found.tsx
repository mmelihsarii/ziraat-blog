/**
 * Dosyanın görevi: Bulunamayan veya yayından kaldırılan makaleler için anlaşılır geri dönüş ekranı gösterir.
 * Kullanıldığı yerler: app/makaleler/[slug]/not-found.tsx
 */
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/** Bulunamayan veya yayından kaldırılan makaleler için anlaşılır geri dönüş ekranı gösterir. */
export default function ArticleNotFound() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 text-center">
        <div className="space-y-5"><p className="text-emerald-400 font-bold uppercase tracking-widest">404</p><h1 className="font-display text-4xl font-black uppercase">Makale Bulunamadı</h1><p className="text-neutral-400 max-w-lg">Aradığınız içerik yayından kaldırılmış veya adresi değişmiş olabilir.</p><Link href="/makaleler" className="inline-flex bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded text-sm font-bold uppercase">Makalelere Dön</Link></div>
      </main>
      <Footer companyName="Ziraat Notları" />
    </div>
  );
}
