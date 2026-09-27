/**
 * Dosyanın görevi: Makale arşivinin URL'den gelen ilk filtrelerini ve sonraki kullanıcı etkileşimlerini yönetir.
 * Kullanıldığı yerler: app/makaleler/page.tsx
 */
'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import CategoryTabs from '@/components/CategoryTabs';
import BlogGrid from '@/components/BlogGrid';
import Footer from '@/components/Footer';
import type { Post, Profile } from '@/types';

interface ArchiveExperienceProps {
  posts: Post[];
  categories: string[];
  initialCategory?: string;
  initialQuery?: string;
  profile?: Profile | null;
}

/** Makale arşivinin URL'den gelen ilk filtrelerini ve sonraki kullanıcı etkileşimlerini yönetir. */
export default function ArchiveExperience({ posts, categories, initialCategory = 'ALL', initialQuery = '', profile = null }: ArchiveExperienceProps) {
  const validInitialCategory = categories.includes(initialCategory) ? initialCategory : 'ALL';
  const [activeCategory, setActiveCategory] = useState(validInitialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header onSearch={setSearchQuery} activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
      <section className="min-h-[360px] bg-neutral-950 text-white flex items-end">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-12 pb-16 pt-36">
          <p className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-xs">Bilgi Arşivi</p>
          <h1 className="mt-4 font-display font-black text-4xl md:text-6xl uppercase">Makaleler</h1>
          <p className="mt-4 text-neutral-300 max-w-2xl">Tarım, bitki sağlığı, sulama, doğa ve saha deneyimleri üzerine yayınlanmış bütün içerikler.</p>
        </div>
      </section>
      <main>
        <CategoryTabs categories={categories} activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        {searchQuery && <p className="max-w-7xl mx-auto px-4 md:px-12 mt-8 text-brand-gray">Arama sonucu: <strong className="text-brand-dark">&quot;{searchQuery}&quot;</strong></p>}
        <BlogGrid posts={posts} searchQuery={searchQuery} activeCategory={activeCategory} />
      </main>
      <Footer companyName="Ziraat Notları" profile={profile} />
    </div>
  );
}
