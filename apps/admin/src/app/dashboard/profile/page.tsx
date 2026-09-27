/**
 * Dosyanın görevi: Hakkımda sayfası ve public footer'da görünen yönetici profilini düzenleme ekranını sunar.
 * Kullanıldığı yerler: Next.js dosya tabanlı rota sistemi tarafından doğrudan yüklenir.
 */
'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUpload from '@/components/admin/ImageUpload';
import { deleteImage } from '@/services/adminService';
import { getCurrentProfile, updateCurrentProfile } from '@/services/profileService';
import { profileSchema, type ProfileFormData } from '@/lib/validations';
import { getErrorMessage } from '@/lib/errors';

/** Hakkımda sayfası ve public footer'da görünen yönetici profilini düzenleme ekranını sunar. */
export default function ProfileManagementPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [savedAvatar, setSavedAvatar] = useState('');
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '', avatar_url: '', profession: '', bio: '', phone: '',
      facebook: '', instagram: '', twitter: '', linkedin: '',
    },
  });

  useEffect(() => {
    let active = true;
    getCurrentProfile()
      .then((profile) => {
        if (!active) return;
        const values = {
          name: profile.name,
          avatar_url: profile.avatar_url || '',
          profession: profile.profession || '',
          bio: profile.bio || '',
          phone: profile.phone || '',
          facebook: profile.facebook || '',
          instagram: profile.instagram || '',
          twitter: profile.twitter || '',
          linkedin: profile.linkedin || '',
        };
        reset(values);
        setEmail(profile.email);
        setSavedAvatar(values.avatar_url);
      })
      .catch((error: unknown) => {
        console.error('Profile load failed:', error);
        toast.error('Profil bilgileri yüklenemedi');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [reset]);

  /** Doğrulanmış profil alanlarını kaydeder ve değiştirilen eski Storage görselini temizler. */
  const onSubmit = async (values: ProfileFormData) => {
    try {
      setSubmitting(true);
      const profile = await updateCurrentProfile(values);
      if (savedAvatar && savedAvatar !== profile.avatar_url) {
        await deleteImage(savedAvatar, 'profiles').catch(() => undefined);
      }
      setSavedAvatar(profile.avatar_url || '');
      reset(values);
      toast.success('Profil başarıyla güncellendi');
    } catch (error: unknown) {
      console.error('Profile update failed:', error);
      toast.error(getErrorMessage(error) || 'Profil güncellenemedi');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-emerald-100 rounded-lg"><UserRound className="w-6 h-6 text-emerald-600" /></div>
          <div><h1 className="font-display font-black text-3xl uppercase text-brand-dark">Hakkımda Profili</h1><p className="text-sm text-brand-gray mt-1">Buradaki tüm bilgiler Hakkımda sayfası ve site alt bilgisinde görünür.</p></div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg border border-neutral-200 py-24 flex justify-center"><Loader2 className="w-8 h-8 text-emerald-600 animate-spin" /></div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit, (invalid) => {
            toast.error(Object.values(invalid).find((field) => field.message)?.message || 'Lütfen profil alanlarını kontrol edin.');
          })} className="grid lg:grid-cols-[300px_1fr] gap-6 items-start">
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <Controller name="avatar_url" control={control} render={({ field }) => <ImageUpload value={field.value} onChange={field.onChange} bucket="profiles" label="Profil Fotoğrafı" />} />
              {errors.avatar_url && <p className="mt-2 text-sm text-red-600">{errors.avatar_url.message}</p>}
            </div>

            <div className="bg-white rounded-lg border border-neutral-200 p-6 md:p-8 space-y-6">
              <div className="grid sm:grid-cols-2 gap-5">
                <label className="space-y-2"><span className="block text-sm font-bold">İsim *</span><input {...register('name')} className={inputClass} />{errors.name && <span className="text-sm text-red-600">{errors.name.message}</span>}</label>
                <label className="space-y-2"><span className="block text-sm font-bold">Meslek</span><input {...register('profession')} className={inputClass} placeholder="Ziraat Mühendisi" />{errors.profession && <span className="text-sm text-red-600">{errors.profession.message}</span>}</label>
              </div>
              <label className="space-y-2 block"><span className="block text-sm font-bold">Hakkımda Metni</span><textarea {...register('bio')} rows={7} className={`${inputClass} resize-y`} placeholder="Hakkımda sayfasında yayımlanacak tanıtım metni" />{errors.bio && <span className="text-sm text-red-600">{errors.bio.message}</span>}</label>
              <div className="grid sm:grid-cols-2 gap-5">
                <label className="space-y-2"><span className="block text-sm font-bold">E-posta</span><input value={email} disabled className={`${inputClass} bg-neutral-50 text-neutral-500`} /></label>
                <label className="space-y-2"><span className="block text-sm font-bold">Telefon</span><input {...register('phone')} className={inputClass} placeholder="+90 ..." />{errors.phone && <span className="text-sm text-red-600">{errors.phone.message}</span>}</label>
              </div>
              <div className="pt-5 border-t border-neutral-200">
                <h2 className="font-display font-bold text-lg uppercase mb-4">Sosyal Bağlantılar</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  {(['instagram', 'facebook', 'twitter', 'linkedin'] as const).map((platform) => (
                    <label key={platform} className="space-y-2"><span className="block text-sm font-bold capitalize">{platform}</span><input type="url" {...register(platform)} className={inputClass} placeholder="https://" />{errors[platform] && <span className="text-sm text-red-600">{errors[platform]?.message}</span>}</label>
                  ))}
                </div>
              </div>
              <div className="pt-5 border-t border-neutral-200 flex justify-end">
                <button type="submit" disabled={submitting || !isDirty} className="inline-flex items-center gap-2 px-7 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white font-bold rounded-lg">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Kaydet
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
