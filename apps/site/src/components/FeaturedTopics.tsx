/**
 * Dosyanın görevi: Görseli bulunan öne çıkan ziraat konularını kategori arşivlerine bağlayan kartlarla listeler.
 * Kullanıldığı yerler: app/page.tsx
 */
import Image from 'next/image';
import Link from 'next/link';
import type { FeaturedTopic } from '@/types';

interface FeaturedTopicsProps {
  topics: FeaturedTopic[];
}

/** Görseli bulunan öne çıkan ziraat konularını kategori arşivlerine bağlayan kartlarla listeler. */
export default function FeaturedTopics({ topics }: FeaturedTopicsProps) {
  if (topics.length === 0) return null;
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-12 py-16">
      <div className="flex flex-col gap-3 mb-10 md:mb-12">
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-brand-dark tracking-wide uppercase">Öne Çıkan Konular</h2>
        <p className="text-brand-gray text-sm sm:text-base max-w-2xl leading-relaxed">Saha deneyimleri, bilimsel bilgiler ve pratik tarım rehberleri arasında ilginizi çeken konuyu seçin.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {topics.map((topic) => (
          <Link key={topic.id} href={topic.href} className="group relative h-64 md:h-[300px] rounded-sm overflow-hidden bg-brand-dark shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
            <Image src={topic.image} alt={topic.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw" />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center"><h3 className="font-display font-bold text-lg md:text-xl text-white tracking-wider uppercase drop-shadow-md">{topic.name}</h3></div>
          </Link>
        ))}
      </div>
    </section>
  );
}
