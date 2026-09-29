/**
 * Dosyanın görevi: Sabit sayfalarla yayınlanmış makaleleri tek, güncel arama motoru haritasında birleştirir.
 * Kullanıldığı yerler: Next.js dosya tabanlı rota sistemi tarafından doğrudan yüklenir.
 */
import type { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/services/publicService';

// Yeni yayınlanan makaleleri eski sitemap önbelleğine takılmadan listele.
export const dynamic = 'force-dynamic';

/** Sabit sayfalarla yayınlanmış makaleleri tek, güncel arama motoru haritasında birleştirir. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const posts = await getPublishedPosts();
  const staticPages: MetadataRoute.Sitemap = [
    { url: origin, changeFrequency: 'weekly', priority: 1 },
    { url: `${origin}/makaleler`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${origin}/hakkimda`, changeFrequency: 'monthly', priority: 0.6 },
  ];
  return [
    ...staticPages,
    ...posts.map((post) => ({
      url: `${origin}/makaleler/${post.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
