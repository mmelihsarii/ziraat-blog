/**
 * Dosyanın görevi: Ana sayfadaki arama ve kategori durumunu tek yerde yönetirken sunucu renderlı bölümleri yerleştirir.
 * Kullanıldığı yerler: app/page.tsx
 */
'use client';

import { useState, type ReactNode } from 'react';
import Header from '@/components/Header';
import BlogGrid from '@/components/BlogGrid';
import CategoryTabs from '@/components/CategoryTabs';
import type { Post } from '@/types';

interface HomeExperienceProps {
  posts: Post[];
  categories: string[];
  hero: ReactNode;
  middle: ReactNode;
  topics: ReactNode;
  footer: ReactNode;
}

/** Ana sayfadaki arama ve kategori durumunu tek yerde yönetirken sunucu renderlı bölümleri yerleştirir. */
export default function HomeExperience({ posts, categories, hero, middle, topics, footer }: HomeExperienceProps) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-white text-brand-dark font-sans selection:bg-emerald-100 selection:text-emerald-900 antialiased">
      <Header
        onSearch={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
      {hero}
      <main className="relative bg-white">
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        {searchQuery && (
          <div className="max-w-7xl mx-auto px-4 md:px-12 -mb-6 flex items-center justify-between gap-4">
            <p className="text-sm md:text-base text-brand-gray">
              Arama sonucu: <strong className="text-brand-dark">&quot;{searchQuery}&quot;</strong>
            </p>
            <button type="button" onClick={() => setSearchQuery('')} className="text-sm font-bold text-emerald-600 hover:underline">
              Aramayı Temizle
            </button>
          </div>
        )}
        <BlogGrid posts={posts} searchQuery={searchQuery} activeCategory={activeCategory} />
        {middle}
        {topics}
      </main>
      {footer}
    </div>
  );
}
