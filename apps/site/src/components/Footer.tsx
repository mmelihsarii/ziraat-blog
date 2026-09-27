/**
 * Dosyanın görevi: Public sayfaları site adı, sosyal bağlantılar ve yukarı dönüş kontrolüyle tamamlar.
 * Kullanıldığı yerler: app/hakkimda/page.tsx, app/makale/[slug]/not-found.tsx, app/makale/[slug]/page.tsx, app/page.tsx, components/ArchiveExperience.tsx
 */
'use client';

import { ArrowUp, Mail, Phone } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';
import type { Profile } from '@/types';

interface FooterSocial {
  platform: 'facebook' | 'twitter' | 'instagram' | 'youtube' | 'linkedin';
  count?: string;
  url?: string;
}

interface FooterProps {
  companyName?: string;
  year?: number;
  socialStats?: FooterSocial[];
  profile?: Profile | null;
}

/** Public sayfaları site adı, sosyal bağlantılar ve yukarı dönüş kontrolüyle tamamlar. */
export default function Footer({ 
  companyName = 'Trazler',
  year = new Date().getFullYear(),
  socialStats = [],
  profile = null,
}: FooterProps) {
  /** Sayfayı erişilebilir yumuşak kaydırmayla başlangıca taşır. */
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** Sosyal platform adını mevcut marka ikonuna dönüştürür. */
  const getIcon = (platform: string) => {
    const iconClass = "w-3.5 h-3.5";
    switch (platform) {
      case 'facebook':
        return <FaFacebook className={iconClass} />;
      case 'twitter':
        return <FaTwitter className={iconClass} />;
      case 'instagram':
        return <FaInstagram className={iconClass} />;
      case 'youtube':
        return <FaYoutube className={iconClass} />;
      case 'linkedin':
        return <FaLinkedin className={iconClass} />;
      default:
        return null;
    }
  };

  const profileSocials: FooterSocial[] = profile
    ? ([
        { platform: 'facebook', url: profile.facebook || undefined },
        { platform: 'twitter', url: profile.twitter || undefined },
        { platform: 'instagram', url: profile.instagram || undefined },
        { platform: 'linkedin', url: profile.linkedin || undefined },
      ] satisfies FooterSocial[]).filter((item) => Boolean(item.url))
    : [];
  const socialLinks = socialStats.length > 0 ? socialStats : profileSocials;

  return (
    <footer className="relative bg-neutral-950 text-white py-12 md:py-16 px-4 md:px-12 border-t border-neutral-900 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        
{/* Site adı ve iletişim bilgileri */}
        <div className="flex flex-col gap-2 text-center md:text-left select-none">
          <p className="font-display text-sm md:text-base text-neutral-400 uppercase tracking-widest font-bold">
            <span className="text-white">{companyName}</span>
          </p>
          <p className="text-[11px] font-sans text-neutral-600 uppercase tracking-widest">
            © {year} {companyName}. Tüm hakları saklıdır.
          </p>
          {profile && (profile.email || profile.phone) && (
            <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 pt-2 text-xs text-neutral-400">
              {profile.email && <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-1.5 hover:text-white"><Mail className="w-3.5 h-3.5" />{profile.email}</a>}
              {profile.phone && <a href={`tel:${profile.phone}`} className="inline-flex items-center gap-1.5 hover:text-white"><Phone className="w-3.5 h-3.5" />{profile.phone}</a>}
            </div>
          )}
        </div>

{/* Sosyal bağlantılar ve varsa sayaçlar */}
        {socialLinks.length > 0 && (
          <div className="flex items-center flex-wrap justify-center gap-6 md:gap-8">
            {socialLinks.map((stat) => (
              <a
                key={stat.platform}
                href={stat.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 group"
              >
                <span className="p-2 rounded-full bg-neutral-900 group-hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition-colors">
                  {getIcon(stat.platform)}
                </span>
                {stat.count && <span className="font-roboto font-bold text-xs tracking-wider text-neutral-300">{stat.count}</span>}
              </a>
            ))}
          </div>
        )}

      </div>

{/* Sayfa başına dönüş düğmesi */}
      <button
        onClick={scrollToTop}
        className="absolute bottom-6 right-6 md:bottom-8 md:right-8 p-3 bg-neutral-900 hover:bg-emerald-600 text-white rounded-sm border border-neutral-800 shadow-md transition-all duration-300 hover:-translate-y-1 group active:scale-95 cursor-pointer"
        aria-label="Sayfanın başına dön"
      >
        <ArrowUp className="w-4 h-4 md:w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>
    </footer>
  );
}
