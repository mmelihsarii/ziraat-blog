/**
 * Dosyanın görevi: Yayındaki makaleleri arama, kategori ve kademeli görünürlük kurallarıyla kart gridinde gösterir.
 * Kullanıldığı yerler: components/ArchiveExperience.tsx, components/HomeExperience.tsx
 */
'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Camera, Clock, Eye } from 'lucide-react';
import type { Post } from '@/types';

interface BlogGridProps {
  posts: Post[];
  searchQuery?: string;
  activeCategory?: string;
}

/** Yayındaki makaleleri arama, kategori ve kademeli görünürlük kurallarıyla kart gridinde gösterir. */
export default function BlogGrid({ posts, searchQuery = '', activeCategory = 'ALL' }: BlogGridProps) {
  const [visibleCount, setVisibleCount] = useState(6);
  const filteredPosts = useMemo(() => {
    const normalizedQuery = searchQuery.toLocaleLowerCase('tr-TR').trim();
    return posts.filter((post) => {
      const categoryMatches = activeCategory === 'ALL' || post.categories.some((category) => category.toLocaleUpperCase('tr-TR') === activeCategory.toLocaleUpperCase('tr-TR'));
      const searchMatches = !normalizedQuery || `${post.title} ${post.excerpt} ${post.categories.join(' ')}`.toLocaleLowerCase('tr-TR').includes(normalizedQuery);
      return categoryMatches && searchMatches;
    });
  }, [activeCategory, posts, searchQuery]);

  return (
    <section id="posts" className="max-w-7xl mx-auto px-4 md:px-12 py-16 scroll-mt-12">
      {filteredPosts.length === 0 ? (
        <div className="text-center py-20 bg-neutral-50 rounded-lg border border-dashed border-neutral-200">
          <p className="text-brand-gray text-lg">Bu ölçütlere uygun yayınlanmış makale bulunamadı.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
            {filteredPosts.slice(0, visibleCount).map((post) => (
              <article key={post.id} className="group flex flex-col bg-white rounded-sm overflow-hidden border border-neutral-100 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-300">
                <Link href={`/makaleler/${post.slug}`} className="relative h-64 w-full overflow-hidden bg-neutral-200 block">
                  {post.image && <Image src={post.image} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-1.5 flex-wrap">
                    {post.categories.map((category) => <span key={category} className="bg-white/20 backdrop-blur-md border border-white/20 text-white font-display font-bold text-xs px-3 py-1.5 rounded-sm uppercase tracking-wider">{category}</span>)}
                  </div>
                  <span className="absolute top-4 right-4 w-9 h-9 bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center"><Camera className="w-5 h-5 text-white" /></span>
                </Link>
                <div className="flex flex-col flex-grow p-6 md:p-8 justify-between gap-6">
                  <div className="space-y-4">
                    <Link href={`/makaleler/${post.slug}`}><h2 className="font-display font-bold text-2xl lg:text-[26px] text-brand-dark leading-snug group-hover:text-emerald-600 transition-colors">{post.title}</h2></Link>
                    <div className="flex items-center flex-wrap gap-3 text-xs text-brand-gray">
                      <strong className="text-brand-dark">{post.author.name}</strong><span>|</span><span>{post.date}</span>
                    </div>
                    <p className="text-brand-gray text-[15px] leading-relaxed line-clamp-3">{post.excerpt}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-neutral-100 pt-5 gap-3">
                    <Link href={`/makaleler/${post.slug}`} className="font-display font-bold text-base text-brand-dark hover:text-emerald-600 border-b-2 border-brand-dark hover:border-emerald-600 transition-colors">Makaleyi Oku</Link>
                    <div className="flex items-center gap-3 text-brand-gray text-xs">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{post.readingTime} dk</span>
                      <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{post.views}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {visibleCount < filteredPosts.length && (
            <div className="flex justify-center mt-16"><button type="button" onClick={() => setVisibleCount((count) => count + 6)} className="font-display font-bold text-lg text-brand-dark/70 hover:text-brand-dark px-10 py-3.5 border border-brand-dark/30 hover:border-brand-dark rounded-sm uppercase tracking-widest">Daha Fazla Göster</button></div>
          )}
        </>
      )}
    </section>
  );
}
