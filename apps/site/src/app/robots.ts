/**
 * Dosyanın görevi: Arama motorlarına public sayfaları açar, yönetim ve kimlik rotalarını kapatır.
 * Kullanıldığı yerler: Next.js dosya tabanlı rota sistemi tarafından doğrudan yüklenir.
 */
import type { MetadataRoute } from 'next';

/** Arama motorlarına public sayfaları açar, yönetim ve kimlik rotalarını kapatır. */
export default function robots(): MetadataRoute.Robots {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/login'],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
