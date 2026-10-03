/**
 * Dosyanın görevi: Fotoğraf/video galerisini filtreler ve medyayı özel lightbox içinde açar.
 * Kullanıldığı yerler: app/galeri/page.tsx
 */
'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Images, Play, X } from 'lucide-react';
import CustomVideoPlayer from '@/components/CustomVideoPlayer';
import type { GalleryItem, GalleryMediaType } from '@/types';

interface GalleryExperienceProps {
  items: GalleryItem[];
}

type GalleryFilter = 'all' | GalleryMediaType;

/** Public galeri filtrelerini, seçimi ve klavye destekli medya penceresini yönetir. */
export default function GalleryExperience({ items }: GalleryExperienceProps) {
  const [filter, setFilter] = useState<GalleryFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const filteredItems = useMemo(
    () => filter === 'all' ? items : items.filter((item) => item.media_type === filter),
    [filter, items],
  );
  const selectedIndex = filteredItems.findIndex((item) => item.id === selectedId);
  const selected = selectedIndex >= 0 ? filteredItems[selectedIndex] : null;

  /** Açık medya penceresinde yön tuşları ve Escape davranışını sağlar. */
  useEffect(() => {
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedId(null);
      if (event.key === 'ArrowLeft' && filteredItems.length > 1) {
        setSelectedId(filteredItems[(selectedIndex - 1 + filteredItems.length) % filteredItems.length].id);
      }
      if (event.key === 'ArrowRight' && filteredItems.length > 1) {
        setSelectedId(filteredItems[(selectedIndex + 1) % filteredItems.length].id);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [filteredItems, selected, selectedIndex]);

  const filters: Array<{ value: GalleryFilter; label: string }> = [
    { value: 'all', label: 'Tümü' },
    { value: 'image', label: 'Fotoğraflar' },
    { value: 'video', label: 'Videolar' },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-12 py-12 md:py-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Sahadan Görüntüler</p>
          <h2 className="mt-3 font-display font-black text-3xl md:text-4xl uppercase text-brand-dark">Galeri</h2>
        </div>
        <div className="inline-flex self-start sm:self-auto border border-neutral-200 p-1 rounded-sm bg-neutral-50" role="group" aria-label="Galeri filtresi">
          {filters.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setFilter(option.value);
                setSelectedId(null);
              }}
              className={`px-3 md:px-4 py-2 text-xs font-bold uppercase transition-colors ${filter === option.value ? 'bg-neutral-950 text-white' : 'text-brand-gray hover:text-brand-dark'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="border-y border-neutral-200 py-20 text-center">
          <Images className="w-10 h-10 mx-auto text-neutral-300" />
          <p className="mt-4 font-display font-bold text-lg text-brand-dark">Henüz yayınlanmış medya yok</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8">
          {filteredItems.map((item, index) => (
            <article key={item.id} className="group min-w-0">
              <button
                type="button"
                onClick={() => setSelectedId(item.id)}
                className="relative block w-full aspect-[4/3] overflow-hidden bg-neutral-950 text-left"
                aria-label={`${item.media_type === 'video' ? 'Videoyu' : 'Fotoğrafı'} aç: ${item.description || item.filename}`}
              >
                {item.media_type === 'image' ? (
                  <Image
                    src={item.url}
                    alt={item.alt || item.description || 'Galeri fotoğrafı'}
                    fill
                    priority={index < 3}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    quality={82}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                  />
                ) : item.poster_url ? (
                  <Image src={item.poster_url} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" quality={80} className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.025]" />
                ) : (
                  <div className="absolute inset-0 bg-neutral-900" />
                )}
                {item.media_type === 'video' && (
                  <span className="absolute inset-0 m-auto w-14 h-14 flex items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg">
                    <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
                  </span>
                )}
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/75 text-white text-[10px] font-bold uppercase tracking-wider">
                  {item.media_type === 'video' ? 'Video' : 'Fotoğraf'}
                </span>
              </button>
              {item.description && <p className="mt-3 text-sm leading-6 text-brand-gray line-clamp-3">{item.description}</p>}
            </article>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[100] bg-neutral-950/98 text-white flex flex-col" role="dialog" aria-modal="true" aria-label="Galeri medya görüntüleyici">
          <div className="h-16 shrink-0 px-3 md:px-6 flex items-center justify-between border-b border-white/10">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">{selectedIndex + 1} / {filteredItems.length}</span>
            <button type="button" onClick={() => setSelectedId(null)} className="w-11 h-11 flex items-center justify-center hover:bg-white/10" aria-label="Galeriyi kapat" title="Kapat">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="relative flex-1 min-h-0 flex items-center justify-center px-4 md:px-20 py-4">
            {filteredItems.length > 1 && (
              <>
                <button type="button" onClick={() => setSelectedId(filteredItems[(selectedIndex - 1 + filteredItems.length) % filteredItems.length].id)} className="absolute left-2 md:left-6 z-10 w-11 h-11 flex items-center justify-center bg-black/70 hover:bg-emerald-600 border border-white/15" aria-label="Önceki medya" title="Önceki">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button type="button" onClick={() => setSelectedId(filteredItems[(selectedIndex + 1) % filteredItems.length].id)} className="absolute right-2 md:right-6 z-10 w-11 h-11 flex items-center justify-center bg-black/70 hover:bg-emerald-600 border border-white/15" aria-label="Sonraki medya" title="Sonraki">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            <div className="relative w-full h-full max-w-6xl flex items-center justify-center">
              {selected.media_type === 'image' ? (
                <Image src={selected.url} alt={selected.alt || selected.description || 'Galeri fotoğrafı'} fill sizes="100vw" quality={88} className="object-contain" priority />
              ) : (
                <div className="w-full max-w-5xl">
                  <CustomVideoPlayer src={selected.url} poster={selected.poster_url} label={selected.description || selected.filename} />
                </div>
              )}
            </div>
          </div>
          {selected.description && <div className="shrink-0 border-t border-white/10 px-5 md:px-12 py-4 md:py-5"><p className="max-w-4xl mx-auto text-sm md:text-base leading-7 text-white/75">{selected.description}</p></div>}
        </div>
      )}
    </section>
  );
}
