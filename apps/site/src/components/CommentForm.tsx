/**
 * Dosyanın görevi: Ziyaretçi yorumunu doğrular, bekleyen durumunda kaydeder ve gönderim sonucunu gösterir.
 * Kullanıldığı yerler: app/makale/[slug]/page.tsx
 */
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star, Send, Loader2 } from 'lucide-react';
import { commentSchema, type CommentFormData } from '@/lib/validations';
import { createComment } from '@/services/supabaseService';

interface CommentFormProps {
  postId: string;
  onSuccess?: () => void;
}

/** Ziyaretçi yorumunu doğrular, bekleyen durumunda kaydeder ve gönderim sonucunu gösterir. */
export default function CommentForm({ postId, onSuccess }: CommentFormProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      rating: 5,
    },
  });

  /** Doğrulanmış yorum verisini Supabase'e iletir ve formu ilk durumuna döndürür. */
  const onSubmit = async (data: CommentFormData) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setSuccessMessage(null);

      await createComment({
        post_id: postId,
        author_name: data.author_name,
        author_email: data.author_email,
        content: data.content,
        rating: data.rating,
      });

      setSuccessMessage('Yorumunuz başarıyla alındı! Onaylandıktan sonra yayınlanacaktır.');
      reset();
      setRating(5);
      setValue('rating', 5);
      
// Başarılı gönderimi üst bileşene bildirir.
      onSuccess?.();

// Başarı mesajını beş saniye sonra kaldırır.
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error) {
      console.error('Yorum gönderme hatası:', error);
      alert('Yorum gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Tıklanan yıldızı form puanı ve görsel seçim olarak eşitler. */
  const handleRatingClick = (value: number) => {
    setRating(value);
    setValue('rating', value, { shouldValidate: true });
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 shadow-sm">
      <h3 className="font-display font-bold text-2xl text-neutral-900 uppercase tracking-wider mb-6">
        Yorum Yap
      </h3>

      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-emerald-800 text-sm font-medium">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Ad Soyad */}
        <div>
          <label htmlFor="author_name" className="block font-display font-bold text-sm text-neutral-700 uppercase tracking-wider mb-2">
            Ad Soyad <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="author_name"
            {...register('author_name')}
            className={`w-full px-4 py-3 border ${
              errors.author_name ? 'border-red-500' : 'border-neutral-300'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
            placeholder="Adınızı ve soyadınızı girin"
            disabled={isSubmitting}
          />
          {errors.author_name && (
            <p className="mt-1 text-sm text-red-500">{errors.author_name.message}</p>
          )}
        </div>

        {/* E-posta */}
        <div>
          <label htmlFor="author_email" className="block font-display font-bold text-sm text-neutral-700 uppercase tracking-wider mb-2">
            E-posta <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="author_email"
            {...register('author_email')}
            className={`w-full px-4 py-3 border ${
              errors.author_email ? 'border-red-500' : 'border-neutral-300'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
            placeholder="E-posta adresinizi girin"
            disabled={isSubmitting}
          />
          {errors.author_email && (
            <p className="mt-1 text-sm text-red-500">{errors.author_email.message}</p>
          )}
        </div>

        {/* Puan */}
        <div>
          <label className="block font-display font-bold text-sm text-neutral-700 uppercase tracking-wider mb-3">
            Puan <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleRatingClick(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                disabled={isSubmitting}
                className="transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    value <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-neutral-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 font-sans text-sm text-neutral-600">
              {rating} / 5
            </span>
          </div>
          {errors.rating && (
            <p className="mt-1 text-sm text-red-500">{errors.rating.message}</p>
          )}
        </div>

        {/* Yorum */}
        <div>
          <label htmlFor="content" className="block font-display font-bold text-sm text-neutral-700 uppercase tracking-wider mb-2">
            Yorumunuz <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            {...register('content')}
            rows={6}
            className={`w-full px-4 py-3 border ${
              errors.content ? 'border-red-500' : 'border-neutral-300'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none`}
            placeholder="Düşüncelerinizi paylaşın... (En az 10 karakter)"
            disabled={isSubmitting}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>
          )}
          <p className="mt-1 text-xs text-neutral-500">
            En az 10, en fazla 2000 karakter
          </p>
        </div>

        {/* Gönder Butonu */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-400 text-white font-display font-bold px-8 py-3 rounded-lg transition-all uppercase tracking-wider text-sm shadow-md hover:shadow-lg disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Gönderiliyor...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Yorum Gönder</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
