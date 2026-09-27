/**
 * Dosyanın görevi: Public sayfalardaki marka, ana navigasyon, mobil menü ve makale aramasını sağlar.
 * Kullanıldığı yerler: app/hakkimda/page.tsx, app/makale/[slug]/not-found.tsx, app/makale/[slug]/page.tsx, components/ArchiveExperience.tsx, components/HomeExperience.tsx
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Search, X } from 'lucide-react';

interface HeaderProps {
  onSearch?: (query: string) => void;
  activeCategory?: string;
  setActiveCategory?: (category: string) => void;
}

/** Public sayfalardaki marka, ana navigasyon, mobil menü ve makale aramasını sağlar. */
export default function Header({ onSearch, activeCategory = 'ALL', setActiveCategory }: HeaderProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  /** Aramayı ana sayfa filtresine veya makale arşivi rotasına yönlendirir. */
  const submitSearch = () => {
    const query = searchQuery.trim();
    if (!query) return;
    if (onSearch) onSearch(query);
    else router.push(`/makaleler?q=${encodeURIComponent(query)}`);
  };

  /** Enter ile gönderilen arama formunun sayfayı yenilemesini engeller. */
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    submitSearch();
  };

  const navLinks = [
    { href: '/', label: 'Ana Sayfa' },
    { href: '/makaleler', label: 'Makaleler' },
    { href: '/hakkimda', label: 'Hakkımda' },
  ];

  return (
    <header className="absolute top-0 left-0 w-full z-50 bg-transparent text-white px-4 md:px-12 py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <Link href="/" className="flex items-baseline select-none" onClick={() => setActiveCategory?.('ALL')}>
          <span className="font-sans italic font-light text-lg md:text-xl tracking-tight text-white/90">Ziraat</span>
          <span className="font-display font-black text-2xl md:text-3xl ml-1 tracking-tight text-white">Notları</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className="font-display text-sm font-bold tracking-widest text-white/75 hover:text-white transition-colors uppercase">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="search"
              aria-label="Makalelerde ara"
              placeholder="Ara..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className={`h-9 bg-black/40 text-white placeholder-white/60 text-sm rounded-full px-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all duration-300 ${isSearchExpanded ? 'w-40 md:w-56 opacity-100' : 'w-0 px-0 opacity-0 pointer-events-none'}`}
            />
            <button
              type="button"
              onClick={() => {
                if (isSearchExpanded && searchQuery.trim()) submitSearch();
                else setIsSearchExpanded((current) => !current);
              }}
              className="p-2 text-white hover:text-emerald-400 transition-colors"
              aria-label="Aramayı aç veya gönder"
            >
              <Search className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </form>
          <button type="button" className="lg:hidden p-2 text-white hover:text-emerald-400" onClick={() => setIsMobileMenuOpen((current) => !current)} aria-label="Menüyü aç veya kapat">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <nav className="lg:hidden absolute top-full left-0 w-full bg-neutral-950/95 backdrop-blur-md border-b border-white/10 px-6 py-6 flex flex-col gap-2">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="py-3 font-display text-base font-bold tracking-widest text-white/80 hover:text-emerald-400 uppercase">
              {item.label}
            </Link>
          ))}
          {activeCategory !== 'ALL' && <span className="pt-2 text-xs text-emerald-400 uppercase">Aktif kategori: {activeCategory}</span>}
        </nav>
      )}
    </header>
  );
}
