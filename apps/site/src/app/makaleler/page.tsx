/**
 * Dosyanın görevi: Yayınlanmış tüm makaleleri URL destekli arama ve kategori filtresiyle sunar.
 * Kullanıldığı yerler: Next.js dosya tabanlı rota sistemi tarafından doğrudan yüklenir.
 */
import type { Metadata } from 'next';
import ArchiveExperience from '@/components/ArchiveExperience';
import { getPublishedCategories, getPublishedPosts, getPublicProfile } from '@/services/publicService';

export const metadata: Metadata = {
  title: 'Makaleler',
  description: 'Tarım, ziraat mühendisliği, doğa ve saha deneyimleri üzerine yayınlanan bütün makaleler.',
};

interface ArchivePageProps {
  searchParams: Promise<{ q?: string | string[]; kategori?: string | string[] }>;
}

/** Yayınlanmış tüm makaleleri URL destekli arama ve kategori filtresiyle sunar. */
export default async function ArticlesPage({ searchParams }: ArchivePageProps) {
  const [posts, categories, profile, params] = await Promise.all([
    getPublishedPosts(),
    getPublishedCategories(),
    getPublicProfile(),
    searchParams,
  ]);
  const query = Array.isArray(params.q) ? params.q[0] : params.q;
  const category = Array.isArray(params.kategori) ? params.kategori[0] : params.kategori;
  return <ArchiveExperience posts={posts} categories={categories.map(({ name }) => name)} initialQuery={query || ''} initialCategory={category || 'ALL'} profile={profile} />;
}
