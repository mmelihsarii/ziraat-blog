/**
 * Dosyanın görevi: Uygulama ile Supabase arasındaki TypeScript veri sözleşmelerini tanımlar.
 * Kullanıldığı yerler: app/dashboard/categories/page.tsx, app/dashboard/comments/page.tsx, app/dashboard/content/hero/page.tsx, app/dashboard/posts/new/page.tsx, app/dashboard/posts/page.tsx, app/dashboard/posts/[id]/edit/page.tsx ve 13 dosya daha
 */
import type { CommentStatus, Json, PostStatus } from './supabase';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  date: string;
  author: { name: string };
  views: number;
  readingTime: number;
  featured: boolean;
  type: 'photo';
  categories: string[];
}

export interface AdminPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  status: PostStatus;
  category_id: string | null;
  category: Category | null;
  reading_time: number;
  views: number;
  featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  tags: string[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePostInput {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  cover_image: string;
  status: PostStatus;
  category_id: string;
  reading_time?: number;
  featured?: boolean;
  seo_title?: string;
  seo_description?: string;
  tags?: string[];
}

export interface UpdatePostInput extends Partial<CreatePostInput> {
  id: string;
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
}

export interface PublicComment {
  id: string;
  name: string;
  content: string;
  timestamp: string;
  rating: number | null;
}

export interface AdminComment {
  id: string;
  post_id: string;
  post: Pick<AdminPost, 'id' | 'title' | 'slug'> | null;
  author_name: string;
  author_email: string;
  content: string;
  rating: number | null;
  status: CommentStatus;
  approved_at: string | null;
  created_at: string;
}

export interface CreateCommentInput {
  post_id: string;
  author_name: string;
  author_email: string;
  content: string;
  rating: number;
}

export interface CommentStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface SiteContent {
  id: string;
  key: string;
  type: 'hero' | 'banner' | 'footer' | 'about' | 'contact' | 'settings';
  data: Json;
  updated_at: string;
  created_at: string;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  image_url: string;
  button_text: string;
  button_link: string;
  label?: string;
}

export type CreateHeroInput = HeroContent;
export type UpdateHeroInput = Partial<CreateHeroInput>;

export interface FeaturedTopic {
  id: string;
  name: string;
  image: string;
  href: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  profession: string | null;
  email: string;
  phone: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  linkedin: string | null;
}

export interface UpdateProfileInput {
  name: string;
  avatar_url?: string;
  bio?: string;
  profession?: string;
  phone?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
}
