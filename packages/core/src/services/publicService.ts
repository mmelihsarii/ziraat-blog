/**
 * Dosyanın görevi: JSON verisinin ziyaretçi tarafında gösterilebilir bir hero kaydı olup olmadığını kontrol eder.
 * Kullanıldığı yerler: app/hakkimda/page.tsx, app/makale/[slug]/page.tsx, app/makaleler/page.tsx, app/page.tsx, app/sitemap.ts
 */
import 'server-only';

import { createPublicClient } from '@/lib/supabase/public';
import type { Database } from '@/types/supabase';
import type { AdminPost, Category, HeroContent, Post, Profile, PublicComment } from '@/types';

type PostRow = Database['public']['Tables']['posts']['Row'];
type PublicPostRow = PostRow & { category: Pick<Category, 'id' | 'name' | 'slug'> | null };

export const DEFAULT_HERO: HeroContent = {
  title: 'Tarımı Bilimle Anlamak',
  subtitle: 'Ziraat, doğa ve sürdürülebilir üretim üzerine saha notları ve rehberler',
  image_url: '/images/ziraat-hero-fallback.webp',
  button_text: 'Makaleleri Keşfet',
  button_link: '#posts',
  label: 'Ziraat Mühendisliği',
};

const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** JSON verisinin ziyaretçi tarafında gösterilebilir bir hero kaydı olup olmadığını kontrol eder. */
function isHeroContent(value: unknown): value is HeroContent {
  if (!value || Array.isArray(value) || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return ['title', 'subtitle', 'image_url', 'button_text', 'button_link'].every(
    (key) => typeof record[key] === 'string',
  );
}

/** Veritabanı satırını kart bileşenlerinin küçük ve güvenli veri modeline dönüştürür. */
function toPostCard(post: PublicPostRow): Post {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    image: post.cover_image,
    date: dateFormatter.format(new Date(post.published_at || post.created_at)),
    author: { name: 'Ziraat Mühendisi' },
    views: post.views,
    readingTime: post.reading_time,
    featured: post.featured,
    type: 'photo',
    categories: post.category ? [post.category.name] : [],
  };
}

/** Ana sayfa ve arşiv için yalnızca yayınlanmış makalelerin gerekli alanlarını getirir. */
export async function getPublishedPosts(): Promise<Post[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('posts')
    .select(
      'id, title, slug, excerpt, cover_image, published_at, created_at, views, reading_time, featured, category:categories(id, name, slug)',
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) {
    console.warn('Published posts could not be loaded:', error.message);
    return [];
  }
  return (data as unknown as PublicPostRow[]).map(toPostCard);
}

/** Public filtreler ve navigasyon için kategori listesini getirir. */
export async function getPublishedCategories(): Promise<Category[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) {
    console.warn('Categories could not be loaded:', error.message);
    return [];
  }
  return data;
}

/** Yönetilebilir hero kaydını getirir; erişilemezse tasarımın boş kalmaması için varsayılanı döndürür. */
export async function getHeroContent(): Promise<HeroContent> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('site_content')
    .select('data')
    .eq('key', 'hero')
    .maybeSingle();
  if (error) console.warn('Hero content could not be loaded:', error.message);
  return data && isHeroContent(data.data) ? data.data : DEFAULT_HERO;
}

/** Slug ile yalnızca yayınlanmış tek makaleyi ve kategorisini getirir. */
export async function getPublishedPostBySlug(slug: string): Promise<AdminPost | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (error) {
    console.warn('Post could not be loaded:', error.message);
    return null;
  }
  if (!data) return null;
  const post = data as unknown as PublicPostRow;
  return {
    ...post,
    category: post.category ? { ...post.category, description: null, created_at: '' } : null,
    seo_title: post.seo_title ?? null,
    seo_description: post.seo_description ?? null,
    tags: post.tags ?? [],
  };
}

/** Makalenin yalnızca onaylanmış yorumlarını e-posta adresi olmadan getirir. */
export async function getApprovedCommentsByPostId(postId: string): Promise<PublicComment[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('comments')
    .select('id, author_name, content, rating, created_at')
    .eq('post_id', postId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('Comments could not be loaded:', error.message);
    return [];
  }
  return data.map((comment) => ({
    id: comment.id,
    name: comment.author_name,
    content: comment.content,
    rating: comment.rating,
    timestamp: dateFormatter.format(new Date(comment.created_at)),
  }));
}

/** Kaydedilerek Hakkımda'ya bağlanan profili; ilk kurulumda en son düzenlenen yöneticiyi getirir. */
export async function getPublicProfile(): Promise<Profile | null> {
  const supabase = createPublicClient();
  const { data: selection, error: selectionError } = await supabase
    .from('site_content')
    .select('data')
    .eq('key', 'about_profile')
    .maybeSingle();
  if (selectionError) {
    console.warn('About profile selection could not be loaded:', selectionError.message);
    return null;
  }

  const settings = selection?.data;
  const profileId = settings && typeof settings === 'object' && !Array.isArray(settings)
    ? settings.profile_id
    : null;
  if (typeof profileId === 'string') {
    const { data: selected, error: selectedError } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, bio, profession, email, phone, facebook, instagram, twitter, linkedin')
      .eq('id', profileId)
      .eq('is_admin', true)
      .maybeSingle();
    if (selectedError) {
      console.warn('Selected profile could not be loaded:', selectedError.message);
      return null;
    }
    if (selected) return selected;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, bio, profession, email, phone, facebook, instagram, twitter, linkedin')
    .eq('is_admin', true)
    .order('updated_at', { ascending: false })
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.warn('Profile could not be loaded:', error.message);
    return null;
  }
  return data;
}
