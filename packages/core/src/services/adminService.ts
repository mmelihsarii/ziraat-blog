/**
 * Dosyanın görevi: Etiketleri bosluk, tekrar ve baslangic # isaretlerinden arindirir.
 * Kullanıldığı yerler: app/dashboard/categories/new/page.tsx, app/dashboard/categories/page.tsx, app/dashboard/categories/[id]/edit/page.tsx, app/dashboard/posts/new/page.tsx, app/dashboard/posts/page.tsx, app/dashboard/posts/[id]/edit/page.tsx ve 3 dosya daha
 */
'use client';

import { supabase } from '@/lib/supabase/client';
import { calculateReadingTime } from '@/lib/content';
import type { Database } from '@/types/supabase';
import type {
  AdminPost,
  Category,
  CreateCategoryInput,
  CreatePostInput,
  UpdateCategoryInput,
  UpdatePostInput,
} from '@/types';

type PostRow = Database['public']['Tables']['posts']['Row'];
type PostInsert = Database['public']['Tables']['posts']['Insert'];
type PostUpdate = Database['public']['Tables']['posts']['Update'];
type PostWithCategory = PostRow & { category: Category | null };

/** Etiketleri bosluk, tekrar ve baslangic # isaretlerinden arindirir. */
function normalizeTags(tags: string[] = []): string[] {
  const unique = new Map<string, string>();
  for (const rawTag of tags) {
    const tag = rawTag.trim().replace(/^#+/, '');
    if (tag) unique.set(tag.toLocaleLowerCase('tr-TR'), tag);
  }
  return Array.from(unique.values());
}

/** Supabase post satırını yönetim ekranlarının kullandığı kararlı modele dönüştürür. */
function toAdminPost(row: PostWithCategory): AdminPost {
  return {
    ...row,
    category: row.category,
    seo_title: row.seo_title ?? null,
    seo_description: row.seo_description ?? null,
    tags: row.tags ?? [],
  };
}

/** Tüm kategorileri yönetim listeleri ve seçim alanları için alfabetik getirir. */
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return data;
}

/** Tek kategoriyi düzenleme formunu doldurmak için kimliğiyle getirir. */
export async function getCategoryById(id: string): Promise<Category | null> {
  const { data, error } = await supabase.from('categories').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

/** Yeni kategoriyi doğrulanmış alanlarla oluşturur. */
export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: input.name.trim(),
      slug: input.slug || generateSlug(input.name),
      description: input.description?.trim() || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Var olan kategorinin yalnızca gönderilen alanlarını günceller. */
export async function updateCategory(input: UpdateCategoryInput): Promise<Category> {
  const updates: Database['public']['Tables']['categories']['Update'] = {};
  if (input.name !== undefined) updates.name = input.name.trim();
  if (input.slug !== undefined) updates.slug = input.slug || generateSlug(input.name || 'kategori');
  if (input.description !== undefined) updates.description = input.description.trim() || null;

  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', input.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Bağlı makalesi olmayan kategoriyi siler; içerik kaybını engeller. */
export async function deleteCategory(id: string): Promise<void> {
  if (await checkCategoryHasPosts(id)) {
    throw new Error('Bu kategoriye bağlı makaleler var. Önce makalelerin kategorisini değiştirin.');
  }
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

/** Kategori silinmeden önce ona bağlı en az bir makale olup olmadığını kontrol eder. */
export async function checkCategoryHasPosts(categoryId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', categoryId);
  if (error) throw error;
  return (count ?? 0) > 0;
}

/** Makaleleri isteğe bağlı durum ve kategori filtreleriyle yönetim tablosuna getirir. */
export async function getPosts(filters?: {
  status?: 'draft' | 'published';
  category_id?: string;
}): Promise<AdminPost[]> {
  let query = supabase
    .from('posts')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.category_id) query = query.eq('category_id', filters.category_id);

  const { data, error } = await query;
  if (error) throw error;
  return (data as unknown as PostWithCategory[]).map(toAdminPost);
}

/** Tek makaleyi düzenleme formunu doldurmak için kimliğiyle getirir. */
export async function getPostById(id: string): Promise<AdminPost | null> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, category:categories(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? toAdminPost(data as unknown as PostWithCategory) : null;
}

/** Yeni makaleyi yayın/taslak durumuyla birlikte oluşturur. */
export async function createPost(input: CreatePostInput): Promise<AdminPost> {
  const payload: PostInsert = {
    title: input.title.trim(),
    slug: input.slug || generateSlug(input.title),
    excerpt: input.excerpt.trim(),
    content: input.content,
    cover_image: input.cover_image,
    status: input.status,
    category_id: input.category_id,
    reading_time: input.reading_time ?? calculateReadingTime(input.content),
    featured: input.featured ?? false,
    seo_title: input.seo_title?.trim() || null,
    seo_description: input.seo_description?.trim() || null,
    tags: normalizeTags(input.tags),
    published_at: input.status === 'published' ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from('posts')
    .insert(payload)
    .select('*, category:categories(*)')
    .single();
  if (error) throw error;
  return toAdminPost(data as unknown as PostWithCategory);
}

/** Makalenin değiştirilen alanlarını veri tabanı sözleşmesine uygun biçimde günceller. */
export async function updatePost(input: UpdatePostInput): Promise<AdminPost> {
  const updates: PostUpdate = {};
  if (input.title !== undefined) updates.title = input.title.trim();
  if (input.slug !== undefined) updates.slug = input.slug || generateSlug(input.title || 'makale');
  if (input.excerpt !== undefined) updates.excerpt = input.excerpt.trim();
  if (input.content !== undefined) {
    updates.content = input.content;
    updates.reading_time = input.reading_time ?? calculateReadingTime(input.content);
  }
  if (input.cover_image !== undefined) updates.cover_image = input.cover_image;
  if (input.category_id !== undefined) updates.category_id = input.category_id;
  if (input.status !== undefined) {
    updates.status = input.status;
    updates.published_at = input.status === 'published' ? new Date().toISOString() : null;
  }
  if (input.featured !== undefined) updates.featured = input.featured;
  if (input.seo_title !== undefined) updates.seo_title = input.seo_title.trim() || null;
  if (input.seo_description !== undefined) updates.seo_description = input.seo_description.trim() || null;
  if (input.tags !== undefined) updates.tags = normalizeTags(input.tags);

  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', input.id)
    .select('*, category:categories(*)')
    .single();
  if (error) throw error;
  return toAdminPost(data as unknown as PostWithCategory);
}

/** Makaleyi ve veritabanı ilişkisi sayesinde ona bağlı yorumları siler. */
export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
}

/** Seçilen görseli benzersiz ve uzun süre önbelleklenebilir bir adla Storage'a yükler. */
export async function uploadImage(
  file: File,
  bucket: 'posts' | 'profiles' | 'general' = 'posts',
): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'webp';
  const month = new Date().toISOString().slice(0, 7);
  const filePath = `${month}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;
}

/** Bu projeye ait Storage URL'sindeki görseli güvenli yol çözümlemesiyle siler. */
export async function deleteImage(
  url: string,
  bucket: 'posts' | 'profiles' | 'general' = 'posts',
): Promise<void> {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const pathname = new URL(url).pathname;
  if (!pathname.includes(marker)) return;
  const filePath = decodeURIComponent(pathname.split(marker)[1]);
  const { error } = await supabase.storage.from(bucket).remove([filePath]);
  if (error) throw error;
}

/** HTML içeriğini metne çevirip dakikada 200 kelime üzerinden okuma süresi hesaplar. */
export { calculateReadingTime };

/** Türkçe karakterleri URL uyumlu karşılıklarına dönüştürerek kararlı slug üretir. */
export function generateSlug(text: string): string {
  const replacements: Record<string, string> = {
    ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u',
    Ç: 'c', Ğ: 'g', İ: 'i', I: 'i', Ö: 'o', Ş: 's', Ü: 'u',
  };
  return text
    .split('')
    .map((character) => replacements[character] ?? character)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
