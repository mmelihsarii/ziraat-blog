/**
 * Dosyanın görevi: Yüklenecek görselin Storage tür ve boyut sınırlarına uyup uymadığını açıklar.
 * Kullanıldığı yerler: app/dashboard/categories/new/page.tsx, app/dashboard/categories/[id]/edit/page.tsx, app/dashboard/posts/new/page.tsx, app/dashboard/posts/[id]/edit/page.tsx, app/dashboard/profile/page.tsx, components/admin/ImageUpload.tsx ve 3 dosya daha
 */
import { z } from 'zod';

// Kategori formunun doğrulama kuralları
export const categorySchema = z.object({
  name: z
    .string()
    .min(2, 'Kategori adı en az 2 karakter olmalıdır')
    .max(100, 'Kategori adı en fazla 100 karakter olabilir')
    .trim(),
  slug: z
    .string()
    .min(2, 'Slug en az 2 karakter olmalıdır')
    .max(100, 'Slug en fazla 100 karakter olabilir')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug sadece küçük harf, rakam ve tire içerebilir')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(500, 'Açıklama en fazla 500 karakter olabilir')
    .optional()
    .or(z.literal('')),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// Makale formunun doğrulama kuralları
export const postSchema = z.object({
  title: z
    .string()
    .min(5, 'Başlık en az 5 karakter olmalıdır')
    .max(200, 'Başlık en fazla 200 karakter olabilir')
    .trim(),
  slug: z
    .string()
    .min(2, 'Slug en az 2 karakter olmalıdır')
    .max(200, 'Slug en fazla 200 karakter olabilir')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug sadece küçük harf, rakam ve tire içerebilir')
    .optional()
    .or(z.literal('')),
  excerpt: z
    .string()
    .min(10, 'Özet en az 10 karakter olmalıdır')
    .max(500, 'Özet en fazla 500 karakter olabilir')
    .trim(),
  content: z
    .string()
    .min(1, 'İçerik zorunludur')
    .max(50000, 'İçerik en fazla 50,000 karakter olabilir')
    .trim(),
  cover_image: z
    .string()
    .url('Geçerli bir URL giriniz')
    .min(1, 'Kapak görseli zorunludur'),
  category_id: z
    .string()
    .uuid('Geçerli bir kategori seçiniz')
    .min(1, 'Kategori seçimi zorunludur'),
  status: z.enum(['draft', 'published'], {
    message: 'Durum seçimi zorunludur',
  }),
  featured: z.boolean().optional().default(false),
  seo_title: z
    .string()
    .max(60, 'SEO başlığı en fazla 60 karakter olabilir')
    .optional()
    .or(z.literal('')),
  seo_description: z
    .string()
    .max(160, 'SEO açıklaması en fazla 160 karakter olabilir')
    .optional()
    .or(z.literal('')),
  tags: z
    .array(z.string().trim().min(1).max(40, 'Bir etiket en fazla 40 karakter olabilir'))
    .max(20, 'En fazla 20 etiket ekleyebilirsiniz')
    .optional(),
});

export type PostFormData = z.infer<typeof postSchema>;

// Görsel sınırları: profil deposu 5 MB, makale ve genel depo 10 MB.
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/** Yüklenecek görselin Storage tür ve boyut sınırlarına uyup uymadığını açıklar. */
export function validateImageFile(file: File, bucket: 'posts' | 'profiles' | 'general' = 'posts'): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'Sadece JPG, JPEG, PNG ve WEBP formatları desteklenmektedir';
  }
  
  const maxSize = bucket === 'profiles' ? 5 * 1024 * 1024 : MAX_FILE_SIZE;
  if (file.size > maxSize) {
    return `Dosya boyutu en fazla ${maxSize / 1024 / 1024}MB olabilir`;
  }
  
  return null;
}

// Yorum formunun doğrulama kuralları
export const commentSchema = z.object({
  author_name: z
    .string()
    .min(2, 'İsim en az 2 karakter olmalıdır')
    .max(100, 'İsim en fazla 100 karakter olabilir')
    .trim(),
  author_email: z
    .string()
    .email('Geçerli bir e-posta adresi giriniz')
    .trim(),
  content: z
    .string()
    .min(10, 'Yorum en az 10 karakter olmalıdır')
    .max(2000, 'Yorum en fazla 2000 karakter olabilir')
    .trim(),
  rating: z
    .number()
    .min(1, 'Puan en az 1 olmalıdır')
    .max(5, 'Puan en fazla 5 olabilir')
    .int('Puan tam sayı olmalıdır'),
});

export type CommentFormData = z.infer<typeof commentSchema>;

const optionalUrl = z.string().url('Geçerli bir bağlantı giriniz').optional().or(z.literal(''));

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'İsim en az 2 karakter olmalıdır').max(100, 'İsim en fazla 100 karakter olabilir'),
  avatar_url: optionalUrl,
  profession: z.string().trim().max(150, 'Meslek en fazla 150 karakter olabilir').optional().or(z.literal('')),
  bio: z.string().trim().max(4000, 'Biyografi en fazla 4000 karakter olabilir').optional().or(z.literal('')),
  phone: z.string().trim().max(30, 'Telefon en fazla 30 karakter olabilir').optional().or(z.literal('')),
  facebook: optionalUrl,
  instagram: optionalUrl,
  twitter: optionalUrl,
  linkedin: optionalUrl,
});

export type ProfileFormData = z.infer<typeof profileSchema>;
