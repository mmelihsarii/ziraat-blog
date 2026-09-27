/**
 * Dosyanın görevi: Aktif yöneticiye ait public profil alanlarını düzenleme formu için getirir.
 * Kullanıldığı yerler: app/dashboard/profile/page.tsx
 */
'use client';

import { supabase } from '@/lib/supabase/client';
import type { Profile, UpdateProfileInput } from '@/types';

const PROFILE_FIELDS = 'id, name, email, avatar_url, bio, profession, phone, facebook, instagram, twitter, linkedin';

/** Aktif yöneticiye ait public profil alanlarını düzenleme formu için getirir. */
export async function getCurrentProfile(): Promise<Profile> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user?.email) throw authError || new Error('Aktif kullanıcı bulunamadı');

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .eq('id', authData.user.id)
    .maybeSingle();
  if (error) throw error;
  if (data) {
    if (data.email !== authData.user.email) {
      const { data: synchronized, error: syncError } = await supabase
        .from('profiles')
        .update({ email: authData.user.email })
        .eq('id', authData.user.id)
        .select(PROFILE_FIELDS)
        .single();
      if (syncError) throw syncError;
      return synchronized;
    }
    return data;
  }

  const fallbackName = authData.user.user_metadata.name || authData.user.email.split('@')[0];
  const { data: created, error: createError } = await supabase
    .from('profiles')
    .insert({ id: authData.user.id, name: fallbackName, email: authData.user.email })
    .select(PROFILE_FIELDS)
    .single();
  if (createError) throw createError;
  return created;
}

/** Profili kaydeder, aynı kimliği Hakkımda'ya bağlar ve güncel içeriğin yayınlanmasını bekler. */
export async function updateCurrentProfile(input: UpdateProfileInput): Promise<Profile> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user?.email) throw authError || new Error('Aktif kullanıcı bulunamadı');

  /** Boş bırakılan opsiyonel form alanlarını veritabanında null olarak saklar. */
  const nullable = (value?: string) => value?.trim() || null;
  const { data, error } = await supabase
    .from('profiles')
    .update({
      name: input.name.trim(),
      avatar_url: nullable(input.avatar_url),
      bio: nullable(input.bio),
      profession: nullable(input.profession),
      phone: nullable(input.phone),
      facebook: nullable(input.facebook),
      instagram: nullable(input.instagram),
      twitter: nullable(input.twitter),
      linkedin: nullable(input.linkedin),
    })
    .eq('id', authData.user.id)
    .select(PROFILE_FIELDS)
    .single();
  if (error) throw error;
  const response = await fetch('/api/profile/publish', { method: 'POST' }).catch(() => null);
  if (!response?.ok) {
    throw new Error('Profil kaydedildi ancak Hakkımda sayfasına yansıtılamadı. Lütfen Kaydet düğmesine tekrar basın.');
  }
  return data;
}
