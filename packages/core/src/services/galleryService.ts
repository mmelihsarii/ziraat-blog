/**
 * Dosyanın görevi: Yönetici galeri kayıtlarını, optimize Storage yüklemelerini ve sıralama işlemlerini yönetir.
 * Kullanıldığı yerler: app/dashboard/gallery/page.tsx
 */
'use client';

import { supabase } from '@/lib/supabase/client';
import { prepareGalleryFile } from '@/lib/gallery-media';
import type { Database } from '@/types/supabase';
import type { GalleryItem, UpdateGalleryItemInput } from '@/types';

type MediaRow = Database['public']['Tables']['media']['Row'];
type MediaInsert = Database['public']['Tables']['media']['Insert'];

/** Veritabanı medya satırına arayüzün doğrudan kullanacağı tür bilgisini ekler. */
function toGalleryItem(row: MediaRow): GalleryItem {
  return {
    ...row,
    media_type: row.mime_type.startsWith('video/') ? 'video' : 'image',
  };
}

/** Storage URL'sinden yalnız gallery kovasına ait güvenli nesne yolunu çıkarır. */
function getGalleryStoragePath(url: string): string | null {
  const marker = '/storage/v1/object/public/gallery/';
  try {
    const pathname = new URL(url).pathname;
    if (!pathname.includes(marker)) return null;
    return decodeURIComponent(pathname.split(marker)[1]);
  } catch {
    return null;
  }
}

/** Dosyayı tahmin edilemez ad ve uzun tarayıcı önbelleğiyle gallery kovasına yükler. */
async function uploadGalleryObject(file: File, folder: 'media' | 'posters'): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase() || (file.type === 'image/webp' ? 'webp' : 'bin');
  const month = new Date().toISOString().slice(0, 7);
  const path = `${folder}/${month}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from('gallery').upload(path, file, {
    cacheControl: '31536000',
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from('gallery').getPublicUrl(path).data.publicUrl;
}

/** Yönetici için taslaklar dahil tüm galeri kayıtlarını yayın sırasıyla getirir. */
export async function getGalleryItems(): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('bucket', 'gallery')
    .order('sort_order', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(toGalleryItem);
}

/** Dosyayı hazırlar, Storage'a yükler ve yayın kaydını tek galeri öğesi olarak oluşturur. */
export async function createGalleryItem(
  sourceFile: File,
  description: string,
  published: boolean,
): Promise<GalleryItem> {
  const prepared = await prepareGalleryFile(sourceFile);
  let mediaUrl: string | null = null;
  let posterUrl: string | null = null;

  try {
    mediaUrl = await uploadGalleryObject(prepared.file, 'media');
    if (prepared.poster) posterUrl = await uploadGalleryObject(prepared.poster, 'posters');

    const { data: top } = await supabase
      .from('media')
      .select('sort_order')
      .eq('bucket', 'gallery')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const cleanDescription = description.trim();
    const payload: MediaInsert = {
      filename: sourceFile.name,
      url: mediaUrl,
      bucket: 'gallery',
      mime_type: prepared.file.type,
      size: prepared.file.size,
      alt: cleanDescription || null,
      description: cleanDescription || null,
      poster_url: posterUrl,
      width: prepared.width,
      height: prepared.height,
      duration_seconds: prepared.durationSeconds,
      published,
      sort_order: (top?.sort_order ?? 0) + 1,
    };
    const { data, error } = await supabase.from('media').insert(payload).select().single();
    if (error) throw error;
    return toGalleryItem(data);
  } catch (error) {
    const paths = [mediaUrl, posterUrl]
      .filter((url): url is string => Boolean(url))
      .map(getGalleryStoragePath)
      .filter((path): path is string => Boolean(path));
    if (paths.length > 0) await supabase.storage.from('gallery').remove(paths).catch(() => undefined);
    throw error;
  }
}

/** Açıklama ile yayın durumunu birlikte günceller. */
export async function updateGalleryItem(input: UpdateGalleryItemInput): Promise<GalleryItem> {
  const description = input.description.trim();
  const { data, error } = await supabase
    .from('media')
    .update({
      description: description || null,
      alt: description || null,
      published: input.published,
    })
    .eq('id', input.id)
    .eq('bucket', 'gallery')
    .select()
    .single();
  if (error) throw error;
  return toGalleryItem(data);
}

/** İki galeri öğesinin sıra değerini değiştirir. */
export async function swapGalleryItems(first: GalleryItem, second: GalleryItem): Promise<void> {
  const [firstResult, secondResult] = await Promise.all([
    supabase.from('media').update({ sort_order: second.sort_order }).eq('id', first.id),
    supabase.from('media').update({ sort_order: first.sort_order }).eq('id', second.id),
  ]);
  if (firstResult.error) throw firstResult.error;
  if (secondResult.error) throw secondResult.error;
}

/** Galeri kaydını ve ona bağlı ana dosya/kapak nesnelerini siler. */
export async function deleteGalleryItem(item: GalleryItem): Promise<void> {
  const paths = [item.url, item.poster_url]
    .filter((url): url is string => Boolean(url))
    .map(getGalleryStoragePath)
    .filter((path): path is string => Boolean(path));
  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage.from('gallery').remove(paths);
    if (storageError) throw storageError;
  }
  const { error } = await supabase.from('media').delete().eq('id', item.id).eq('bucket', 'gallery');
  if (error) throw error;
}
