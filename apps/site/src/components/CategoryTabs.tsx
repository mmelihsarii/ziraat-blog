/**
 * Dosyanın görevi: Makale listesini bütün içerikler veya seçilen kategori arasında filtreleyen sekmeleri gösterir.
 * Kullanıldığı yerler: components/ArchiveExperience.tsx, components/HomeExperience.tsx
 */
'use client';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

/** Makale listesini bütün içerikler veya seçilen kategori arasında filtreleyen sekmeleri gösterir. */
export default function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  if (categories.length === 0) return null;
  const tabs = ['ALL', ...categories];
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-12 pt-14" aria-label="Makale kategorileri">
      <div className="relative w-full border-b border-neutral-200 pb-1 overflow-x-auto scrollbar-none">
        <div className="flex gap-8 md:gap-10 min-w-max">
          {tabs.map((tab) => (
            <button key={tab} type="button" onClick={() => onCategoryChange(tab)} className={`font-display font-bold text-base md:text-lg pb-3 transition-all relative ${activeCategory === tab ? 'text-brand-dark after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[3px] after:bg-emerald-500' : 'text-brand-dark/40 hover:text-brand-dark/80'}`}>
              {tab === 'ALL' ? 'TÜMÜ' : tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
