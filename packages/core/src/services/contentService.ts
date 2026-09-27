/**
 * Dosyanın görevi: JSON alanının yönetim formunun beklediği hero yapısında olup olmadığını denetler.
 * Kullanıldığı yerler: app/dashboard/content/hero/page.tsx
 */
'use client';

import { supabase } from '@/lib/supabase/client';
import type { CreateHeroInput, HeroContent, SiteContent } from '@/types';
import type { Json } from '@/types/supabase';

/** JSON alanının yönetim formunun beklediği hero yapısında olup olmadığını denetler. */
function isHeroContent(value: unknown): value is HeroContent {
  if (!value || Array.isArray(value) || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return ['title', 'subtitle', 'image_url', 'button_text', 'button_link'].every(
    (key) => typeof record[key] === 'string',
  );
}

/** Hero kaydını yönetim önizlemesi için getirir. */
export async function getHeroContent(): Promise<HeroContent | null> {
  const { data, error } = await supabase
    .from('site_content')
    .select('data')
    .eq('key', 'hero')
    .maybeSingle();
  if (error) throw error;
  return data && isHeroContent(data.data) ? data.data : null;
}

/** Tek kayıt kuralını koruyarak hero içeriğini oluşturur veya günceller. */
export async function upsertHeroContent(input: CreateHeroInput): Promise<SiteContent> {
  const { data, error } = await supabase
    .from('site_content')
    .upsert(
      { key: 'hero', type: 'hero', data: input as unknown as Json },
      { onConflict: 'key' },
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Hero görselini genel Storage alanına benzersiz adla yükler. */
export async function uploadHeroImage(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'webp';
  const filePath = `hero/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from('general').upload(filePath, file, {
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from('general').getPublicUrl(filePath).data.publicUrl;
}

/** Yalnızca general bucket içindeki hero görselini siler. */
export async function deleteHeroImage(url: string): Promise<void> {
  const marker = '/storage/v1/object/public/general/';
  const pathname = new URL(url).pathname;
  if (!pathname.includes(marker)) return;
  const filePath = decodeURIComponent(pathname.split(marker)[1]);
  const { error } = await supabase.storage.from('general').remove([filePath]);
  if (error) throw error;
}
