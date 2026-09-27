/**
 * Dosyanın görevi: Makale metni, görseli, kategorisi ve yayın ayarlarını tek akışta oluşturan yönetim ekranını sunar.
 * Kullanıldığı yerler: Next.js dosya tabanlı rota sistemi tarafından doğrudan yüklenir.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUpload from '@/components/admin/ImageUpload';
import TagInput from '@/components/admin/TagInput';
import { postSchema, type PostFormData } from '@/lib/validations';
import { createPost, getCategories, generateSlug, calculateReadingTime } from '@/services/adminService';
import type { Category } from '@/types';
import { getErrorCode, getErrorMessage } from '@/lib/errors';
import toast from 'react-hot-toast';

// Editör tarayıcı API’lerini kullandığı için istemcide dinamik yüklenir.
const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-96 bg-neutral-100 rounded-lg animate-pulse" />,
});

/** Makale metni, görseli, kategorisi ve yayın ayarlarını tek akışta oluşturan yönetim ekranını sunar. */
export default function NewPostPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      cover_image: '',
      category_id: '',
      status: 'draft' as const,
      featured: false,
      seo_title: '',
      seo_description: '',
      tags: [],
    },
  });

  const titleValue = useWatch({ control, name: 'title' });
  const statusValue = useWatch({ control, name: 'status' });
  const categoryIdValue = useWatch({ control, name: 'category_id' });

  useEffect(() => {
    let active = true;
    getCategories()
      .then((data) => {
        if (active) setCategories(data);
      })
      .catch((error: unknown) => {
        console.error('Error loading categories:', error);
        toast.error('Kategoriler yüklenirken bir hata oluştu');
      })
      .finally(() => {
        if (active) setLoadingCategories(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (autoSlug && titleValue) {
      const generatedSlug = generateSlug(titleValue);
      setValue('slug', generatedSlug);
    }
  }, [titleValue, autoSlug, setValue]);

  /** Doğrulanmış makaleyi hesaplanan okuma süresiyle taslak veya yayın olarak kaydeder. */
  const onSubmit = async (data: PostFormData) => {
    // Kategori kontrolü
    if (!data.category_id) {
      toast.error('Lütfen bir kategori seçin');
      return;
    }

    try {
      setSubmitting(true);
      
      const readingTime = calculateReadingTime(data.content);

      await createPost({
        title: data.title,
        slug: data.slug || undefined,
        excerpt: data.excerpt,
        content: data.content,
        cover_image: data.cover_image,
        status: data.status,
        category_id: data.category_id,
        reading_time: readingTime,
        featured: data.featured,
        seo_title: data.seo_title || undefined,
        seo_description: data.seo_description || undefined,
        tags: data.tags || undefined,
      });

      toast.success(`Makale başarıyla ${data.status === 'published' ? 'yayınlandı' : 'taslak olarak kaydedildi'}`);
      router.push('/dashboard/posts');
    } catch (error: unknown) {
      console.error('Error creating post:', error);
      if (getErrorMessage(error).includes('duplicate') || getErrorCode(error) === '23505') {
        toast.error('Bu slug zaten kullanılıyor. Lütfen farklı bir slug deneyin.');
      } else {
        toast.error(`Hata: ${getErrorMessage(error)}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
{/* Başlık alanı */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/posts"
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          title="Geri"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="font-display font-black text-3xl uppercase tracking-wider text-brand-dark">
            Yeni Makale
          </h1>
          <p className="font-sans text-sm text-brand-gray mt-1">
            Yeni bir blog makalesi oluşturun
          </p>
        </div>
      </div>

      {loadingCategories ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="font-sans text-sm text-brand-gray">Yükleniyor...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <h2 className="font-display font-bold text-xl text-brand-dark mb-2">
            Önce Kategori Oluşturun
          </h2>
          <p className="font-sans text-sm text-brand-gray mb-6">
            Makale oluşturmadan önce en az bir kategori oluşturmalısınız
          </p>
          <Link
            href="/dashboard/categories/new"
            className="inline-flex items-center gap-2 font-display font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg uppercase tracking-wider transition-colors"
          >
            Kategori Oluştur
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
{/* Temel makale alanları */}
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <h2 className="font-display font-bold text-xl uppercase tracking-wider text-brand-dark mb-6 pb-4 border-b border-neutral-200">
              Temel Bilgiler
            </h2>

            <div className="space-y-6">
{/* Başlık */}
              <div className="space-y-2">
                <label htmlFor="title" className="block font-display font-bold text-sm text-brand-dark">
                  Başlık <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  {...register('title')}
                  className={`w-full px-4 py-3 border rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow ${
                    errors.title ? 'border-red-500' : 'border-neutral-300'
                  }`}
                  placeholder="Makalenizin başlığını girin"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm font-sans">{errors.title.message}</p>
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
                  placeholder="makale-slug"
                />
                {errors.slug && (
                  <p className="text-red-500 text-sm font-sans">{errors.slug.message}</p>
                )}
              </div>

{/* Makale özeti */}
              <div className="space-y-2">
                <label htmlFor="excerpt" className="block font-display font-bold text-sm text-brand-dark">
                  Özet <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="excerpt"
                  {...register('excerpt')}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow resize-none ${
                    errors.excerpt ? 'border-red-500' : 'border-neutral-300'
                  }`}
                  placeholder="Makalenizin kısa özetini yazın"
                />
                {errors.excerpt && (
                  <p className="text-red-500 text-sm font-sans">{errors.excerpt.message}</p>
                )}
              </div>

{/* Kategori */}
              <div className="space-y-2">
                <label htmlFor="category_id" className="block font-display font-bold text-sm text-brand-dark">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  id="category_id"
                  {...register('category_id')}
                  className={`w-full px-4 py-3 border rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow ${
                    errors.category_id ? 'border-red-500' : 'border-neutral-300'
                  }`}
                >
                  <option value="">Kategori seçin</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="text-red-500 text-sm font-sans">{errors.category_id.message}</p>
                )}
                {!categoryIdValue && statusValue === 'published' && (
                  <p className="text-yellow-600 text-sm font-sans">
                    ⚠️ Makaleyi yayınlamadan önce kategori seçmelisiniz
                  </p>
                )}
              </div>

{/* Kapak görseli */}
              <Controller
                name="cover_image"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    label="Kapak Görseli"
                    required
                  />
                )}
              />
              {errors.cover_image && (
                <p className="text-red-500 text-sm font-sans">{errors.cover_image.message}</p>
              )}
            </div>
          </div>

{/* Makale içerik düzenleyicisi */}
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <h2 className="font-display font-bold text-xl uppercase tracking-wider text-brand-dark mb-6 pb-4 border-b border-neutral-200">
              İçerik
            </h2>

            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  label="Makale İçeriği"
                  required
                  error={errors.content?.message}
                />
              )}
            />
          </div>

{/* Arama motoru alanları */}
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <h2 className="font-display font-bold text-xl uppercase tracking-wider text-brand-dark mb-6 pb-4 border-b border-neutral-200">
              SEO Ayarları
            </h2>

            <div className="space-y-6">
{/* Arama motoru başlığı */}
              <div className="space-y-2">
                <label htmlFor="seo_title" className="block font-display font-bold text-sm text-brand-dark">
                  SEO Başlığı
                </label>
                <input
                  id="seo_title"
                  type="text"
                  {...register('seo_title')}
                  className={`w-full px-4 py-3 border rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow ${
                    errors.seo_title ? 'border-red-500' : 'border-neutral-300'
                  }`}
                  placeholder="Arama motorları için başlık (opsiyonel)"
                />
                {errors.seo_title && (
                  <p className="text-red-500 text-sm font-sans">{errors.seo_title.message}</p>
                )}
                <p className="text-xs text-brand-gray font-sans">
                  Önerilen: 50-60 karakter
                </p>
              </div>

{/* Arama motoru açıklaması */}
              <div className="space-y-2">
                <label htmlFor="seo_description" className="block font-display font-bold text-sm text-brand-dark">
                  SEO Açıklaması
                </label>
                <textarea
                  id="seo_description"
                  {...register('seo_description')}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow resize-none ${
                    errors.seo_description ? 'border-red-500' : 'border-neutral-300'
                  }`}
                  placeholder="Arama motorları için açıklama (opsiyonel)"
                />
                {errors.seo_description && (
                  <p className="text-red-500 text-sm font-sans">{errors.seo_description.message}</p>
                )}
                <p className="text-xs text-brand-gray font-sans">
                  Önerilen: 150-160 karakter
                </p>
              </div>

              <Controller
                name="tags"
                control={control}
                render={({ field }) => <TagInput value={field.value} onChange={field.onChange} error={errors.tags?.message} />}
              />
            </div>
          </div>

{/* Yayın ayarları */}
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <h2 className="font-display font-bold text-xl uppercase tracking-wider text-brand-dark mb-6 pb-4 border-b border-neutral-200">
              Ayarlar
            </h2>

            <div className="space-y-6">
{/* Yayın durumu */}
              <div className="space-y-2">
                <label className="block font-display font-bold text-sm text-brand-dark">
                  Durum <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="draft"
                      {...register('status')}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-sans text-sm text-brand-dark">Taslak</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="published"
                      {...register('status')}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-sans text-sm text-brand-dark">Yayınla</span>
                  </label>
                </div>
                {errors.status && (
                  <p className="text-red-500 text-sm font-sans">{errors.status.message}</p>
                )}
              </div>

{/* Öne çıkarma seçimi */}
              <div className="flex items-center gap-2">
                <input
                  id="featured"
                  type="checkbox"
                  {...register('featured')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded"
                />
                <label htmlFor="featured" className="font-sans text-sm text-brand-dark cursor-pointer">
                  Bu makaleyi öne çıkar
                </label>
              </div>
            </div>
          </div>

{/* İşlem düğmeleri */}
          <div className="flex items-center justify-end gap-3 bg-white rounded-xl shadow-sm p-6">
            <Link
              href="/dashboard/posts"
              className="font-display font-bold text-sm text-brand-dark hover:text-neutral-600 px-6 py-3 rounded-lg transition-colors"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={submitting || !categoryIdValue}
              className="flex items-center gap-2 font-display font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {statusValue === 'published' ? 'Yayınla' : 'Taslak Olarak Kaydet'}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
