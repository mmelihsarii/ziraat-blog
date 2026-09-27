/**
 * Dosyanın görevi: Hero metinlerini, bağlantısını ve Storage görselini doğrulayıp tek kayıt halinde kaydeden formu sunar.
 * Kullanıldığı yerler: app/dashboard/content/hero/page.tsx
 */
'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import Image from 'next/image';
import { z } from 'zod';
import { Loader2, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { HeroContent, CreateHeroInput } from '@/types';

const heroSchema = z.object({
  title: z.string().min(3, 'Başlık en az 3 karakter olmalıdır').max(200, 'Başlık en fazla 200 karakter olabilir'),
  subtitle: z.string().min(3, 'Alt başlık en az 3 karakter olmalıdır').max(500, 'Alt başlık en fazla 500 karakter olabilir'),
  image_url: z
    .string()
    .min(1, 'Hero görseli zorunludur')
    .refine(
      (value) => value.startsWith('/') || URL.canParse(value),
      'Geçerli bir görsel adresi gereklidir',
    ),
  button_text: z.string().min(2, 'Buton yazısı en az 2 karakter olmalıdır').max(50, 'Buton yazısı en fazla 50 karakter olabilir'),
  button_link: z.string().min(1, 'Buton linki zorunludur'),
  label: z.string().optional(),
});

type HeroFormData = z.infer<typeof heroSchema>;

interface HeroFormProps {
  initialData?: HeroContent | null;
  onSubmit: (data: CreateHeroInput) => Promise<void>;
  onImageUpload: (file: File) => Promise<string>;
  onImageDelete?: (url: string) => Promise<void>;
}

/** Hero metinlerini, bağlantısını ve Storage görselini doğrulayıp tek kayıt halinde kaydeden formu sunar. */
export default function HeroForm({ 
  initialData, 
  onSubmit, 
  onImageUpload,
  onImageDelete 
}: HeroFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<HeroFormData>({
    defaultValues: {
      title: initialData?.title || '',
      subtitle: initialData?.subtitle || '',
      image_url: initialData?.image_url || '',
      button_text: initialData?.button_text || '',
      button_link: initialData?.button_link || '',
      label: initialData?.label || '',
    },
  });

  const watchedImageUrl = useWatch({ control, name: 'image_url' });

  /** Seçilen görseli tür ve boyut kurallarından geçirip Storage'a yükler. */
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Sadece JPG, PNG ve WebP formatları desteklenmektedir');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Görsel boyutu maksimum 10MB olabilir');
      return;
    }

    try {
      setUploadingImage(true);
      const previousUnsavedImage = getValues('image_url');
      const url = await onImageUpload(file);
      if (onImageDelete && previousUnsavedImage && previousUnsavedImage !== initialData?.image_url) {
        await onImageDelete(previousUnsavedImage).catch(() => undefined);
      }
      setValue('image_url', url);
      setIsDirty(true);
      toast.success('Görsel başarıyla yüklendi');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Görsel yüklenirken bir hata oluştu');
    } finally {
      setUploadingImage(false);
    }
  };

  /** Kayitli gorseli kaydetme tamamlanana kadar korur; yalniz kaydedilmemis yuklemeyi hemen temizler. */
  const handleRemoveImage = async () => {
    const currentImage = getValues('image_url');
    if (!currentImage) return;

    try {
      if (onImageDelete && currentImage !== initialData?.image_url) {
        await onImageDelete(currentImage);
      }
      setValue('image_url', '');
      setIsDirty(true);
      toast.success('Görsel kaldırıldı');
    } catch (error) {
      console.error('Image delete error:', error);
      toast.error('Görsel kaldırılırken bir hata oluştu');
    }
  };

  /** Hero alanlarını Zod ile doğrulayıp üst bileşenin kayıt işlemine iletir. */
  const onSubmitForm = async (data: HeroFormData) => {
    try {
      setLoading(true);
      
      // Validation
      const validatedData = heroSchema.parse(data);
      
      const previousImage = initialData?.image_url;
      await onSubmit(validatedData);
      if (onImageDelete && previousImage && previousImage !== validatedData.image_url) {
        await onImageDelete(previousImage).catch(() => undefined);
      }
      setIsDirty(false);
      toast.success('Hero içeriği başarıyla güncellendi');
    } catch (error: unknown) {
      console.error('Form submit error:', error);
      
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        toast.error(firstError.message);
      } else {
        toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
      {/* Hero Başlık */}
      <div>
        <label className="block font-display font-bold text-sm text-brand-dark mb-2">
          Hero Başlık <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('title')}
          onChange={(e) => {
            register('title').onChange(e);
            setIsDirty(true);
          }}
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-sans text-base text-brand-dark placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          placeholder="Örn: Ziraat Mühendisliği Blog"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Hero Alt Başlık */}
      <div>
        <label className="block font-display font-bold text-sm text-brand-dark mb-2">
          Hero Alt Başlık <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('subtitle')}
          onChange={(e) => {
            register('subtitle').onChange(e);
            setIsDirty(true);
          }}
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-sans text-base text-brand-dark placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          placeholder="Örn: Tarım ve çevre üzerine kapsamlı içerikler"
        />
        {errors.subtitle && (
          <p className="mt-1 text-sm text-red-600">{errors.subtitle.message}</p>
        )}
      </div>

      {/* Hero Görseli */}
      <div>
        <label className="block font-display font-bold text-sm text-brand-dark mb-2">
          Hero Görseli <span className="text-red-500">*</span>
        </label>
        
{/* Görsel önizlemesi */}
        {watchedImageUrl && (
          <div className="relative mb-4 rounded-lg overflow-hidden border border-neutral-300">
            <div className="relative w-full h-64">
            <Image
              src={watchedImageUrl}
              alt="Hero preview"
              fill
              sizes="(max-width: 1024px) 100vw, 768px"
              className="object-cover"
            />
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              title="Görseli kaldır"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

{/* Görsel yükleme düğmesi */}
        <div className="relative">
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
            id="hero-image-upload"
            disabled={uploadingImage}
          />
          <label
            htmlFor="hero-image-upload"
            className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-neutral-300 rounded-lg font-display font-bold text-sm text-brand-dark hover:border-emerald-500 hover:bg-emerald-50 transition-colors cursor-pointer ${
              uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploadingImage ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Yükleniyor...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                {watchedImageUrl ? 'Görseli Değiştir' : 'Görsel Yükle'}
              </>
            )}
          </label>
        </div>

        <p className="mt-2 text-xs text-neutral-500">
          Maksimum dosya boyutu: 10MB | Desteklenen formatlar: JPG, PNG, WebP
        </p>

        {errors.image_url && (
          <p className="mt-1 text-sm text-red-600">{errors.image_url.message}</p>
        )}
      </div>

      {/* Buton Yazısı */}
      <div>
        <label className="block font-display font-bold text-sm text-brand-dark mb-2">
          Buton Yazısı <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('button_text')}
          onChange={(e) => {
            register('button_text').onChange(e);
            setIsDirty(true);
          }}
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-sans text-base text-brand-dark placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          placeholder="Örn: Yazıları Keşfet"
        />
        {errors.button_text && (
          <p className="mt-1 text-sm text-red-600">{errors.button_text.message}</p>
        )}
      </div>

      {/* Buton Linki */}
      <div>
        <label className="block font-display font-bold text-sm text-brand-dark mb-2">
          Buton Linki <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('button_link')}
          onChange={(e) => {
            register('button_link').onChange(e);
            setIsDirty(true);
          }}
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-sans text-base text-brand-dark placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          placeholder="Örn: /makaleler veya #posts"
        />
        <p className="mt-1 text-xs text-neutral-500">
          Dahili link için: /sayfa-adi | Anchor link için: #id
        </p>
        {errors.button_link && (
          <p className="mt-1 text-sm text-red-600">{errors.button_link.message}</p>
        )}
      </div>

      {/* Hero Label (Opsiyonel) */}
      <div>
        <label className="block font-display font-bold text-sm text-brand-dark mb-2">
          Hero Etiketi (Opsiyonel)
        </label>
        <input
          type="text"
          {...register('label')}
          onChange={(e) => {
            register('label').onChange(e);
            setIsDirty(true);
          }}
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-sans text-base text-brand-dark placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          placeholder="Örn: Ziraat Mühendisliği"
        />
        {errors.label && (
          <p className="mt-1 text-sm text-red-600">{errors.label.message}</p>
        )}
      </div>

{/* Kaydetme düğmesi */}
      <div className="flex items-center gap-4 pt-6 border-t border-neutral-200">
        <button
          type="submit"
          disabled={loading || uploadingImage || !isDirty}
          className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-display font-bold text-base rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            'Kaydet'
          )}
        </button>

        {!isDirty && (
          <p className="text-sm text-neutral-500">
            Değişiklik yapmadınız
          </p>
        )}
      </div>
    </form>
  );
}
