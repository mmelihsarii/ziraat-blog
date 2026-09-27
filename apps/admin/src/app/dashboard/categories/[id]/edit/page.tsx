/**
 * Dosyanın görevi: Mevcut kategoriyi yükleyip ad, slug ve açıklama alanlarını güncelleyen yönetim ekranını sunar.
 * Kullanıldığı yerler: Next.js dosya tabanlı rota sistemi tarafından doğrudan yüklenir.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { categorySchema, type CategoryFormData } from '@/lib/validations';
import { getCategoryById, updateCategory, generateSlug } from '@/services/adminService';
import { getErrorCode, getErrorMessage } from '@/lib/errors';
import toast from 'react-hot-toast';

/** Mevcut kategoriyi yükleyip ad, slug ve açıklama alanlarını güncelleyen yönetim ekranını sunar. */
export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [autoSlug, setAutoSlug] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  const nameValue = useWatch({ control, name: 'name' });

  useEffect(() => {
    /** URL kimliğindeki kategoriyi form alanlarına yükler. */
    const loadCategory = async () => {
      try {
        const category = await getCategoryById(categoryId);
        if (category) {
          setValue('name', category.name);
          setValue('slug', category.slug);
          setValue('description', category.description || '');
        } else {
          toast.error('Kategori bulunamadı');
          router.push('/dashboard/categories');
        }
      } catch (error) {
        console.error('Error loading category:', error);
        toast.error('Kategori yüklenirken bir hata oluştu');
        router.push('/dashboard/categories');
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      loadCategory();
    }
  }, [categoryId, router, setValue]);

  useEffect(() => {
    if (autoSlug && nameValue) {
      const generatedSlug = generateSlug(nameValue);
      setValue('slug', generatedSlug);
    }
  }, [nameValue, autoSlug, setValue]);

  /** Düzenlenen kategori alanlarını kaydedip kategori listesine döner. */
  const onSubmit = async (data: CategoryFormData) => {
    try {
      setSubmitting(true);
      await updateCategory({
        id: categoryId,
        name: data.name,
        slug: data.slug || undefined,
        description: data.description || undefined,
      });
      toast.success('Kategori başarıyla güncellendi');
      router.push('/dashboard/categories');
    } catch (error: unknown) {
      console.error('Error updating category:', error);
      if (getErrorMessage(error).includes('duplicate') || getErrorCode(error) === '23505') {
        toast.error('Bu slug zaten kullanılıyor. Lütfen farklı bir slug deneyin.');
      } else {
        toast.error('Kategori güncellenirken bir hata oluştu');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="font-sans text-sm text-brand-gray">Kategori yükleniyor...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Başlık alanı */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/categories"
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          title="Geri"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="font-display font-black text-3xl uppercase tracking-wider text-brand-dark">
            Kategori Düzenle
          </h1>
          <p className="font-sans text-sm text-brand-gray mt-1">
            Kategori bilgilerini güncelleyin
          </p>
        </div>
      </div>

      {/* Kategori formu */}
      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Kategori adı */}
          <div className="space-y-2">
            <label htmlFor="name" className="block font-display font-bold text-sm text-brand-dark">
              Kategori Adı <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className={`w-full px-4 py-3 border rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow ${
                errors.name ? 'border-red-500' : 'border-neutral-300'
              }`}
              placeholder="Örn: Teknoloji"
            />
            {errors.name && (
              <p className="text-red-500 text-sm font-sans">{errors.name.message}</p>
            )}
          </div>

          {/* URL kısa adı */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="slug" className="block font-display font-bold text-sm text-brand-dark">
                Slug <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setAutoSlug(!autoSlug)}
                className={`text-xs font-sans px-3 py-1 rounded transition-colors ${
                  autoSlug
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {autoSlug ? 'Otomatik' : 'Manuel'}
              </button>
            </div>
            <input
              id="slug"
              type="text"
              {...register('slug')}
              disabled={autoSlug}
              className={`w-full px-4 py-3 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow ${
                errors.slug ? 'border-red-500' : 'border-neutral-300'
              } ${autoSlug ? 'bg-neutral-50 cursor-not-allowed' : ''}`}
              placeholder="teknoloji"
            />
            {errors.slug && (
              <p className="text-red-500 text-sm font-sans">{errors.slug.message}</p>
            )}
            <p className="text-xs text-brand-gray font-sans">
              Slug URL&apos;de kullanılacak. Sadece küçük harf, rakam ve tire kullanın.
            </p>
          </div>

          {/* Kategori açıklaması */}
          <div className="space-y-2">
            <label htmlFor="description" className="block font-display font-bold text-sm text-brand-dark">
              Açıklama
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow resize-none ${
                errors.description ? 'border-red-500' : 'border-neutral-300'
              }`}
              placeholder="Kategori hakkında kısa bir açıklama (opsiyonel)"
            />
            {errors.description && (
              <p className="text-red-500 text-sm font-sans">{errors.description.message}</p>
            )}
          </div>

          {/* İşlem düğmeleri */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <Link
              href="/dashboard/categories"
              className="font-display font-bold text-sm text-brand-dark hover:text-neutral-600 px-6 py-3 rounded-lg transition-colors"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 font-display font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Güncelleniyor...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Güncelle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
