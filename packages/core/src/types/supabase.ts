/**
 * Dosyanın görevi: Uygulama ile Supabase arasındaki TypeScript veri sözleşmelerini tanımlar.
 * Kullanıldığı yerler: lib/supabase/admin.ts, lib/supabase/client.ts, lib/supabase/proxy.ts, lib/supabase/public.ts, lib/supabase/server.ts, services/adminService.ts ve 3 dosya daha
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PostStatus = 'draft' | 'published';
export type CommentStatus = 'pending' | 'approved' | 'rejected';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar_url: string | null;
          bio: string | null;
          profession: string | null;
          phone: string | null;
          is_admin: boolean;
          facebook: string | null;
          instagram: string | null;
          twitter: string | null;
          linkedin: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          avatar_url?: string | null;
          bio?: string | null;
          profession?: string | null;
          phone?: string | null;
          is_admin?: boolean;
          facebook?: string | null;
          instagram?: string | null;
          twitter?: string | null;
          linkedin?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          avatar_url?: string | null;
          bio?: string | null;
          profession?: string | null;
          phone?: string | null;
          is_admin?: boolean;
          facebook?: string | null;
          instagram?: string | null;
          twitter?: string | null;
          linkedin?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string;
          content: string;
          cover_image: string;
          status: PostStatus;
          category_id: string | null;
          reading_time: number;
          views: number;
          featured: boolean;
          seo_title: string | null;
          seo_description: string | null;
          tags: string[];
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug?: string;
          excerpt: string;
          content: string;
          cover_image: string;
          status?: PostStatus;
          category_id?: string | null;
          reading_time?: number;
          views?: number;
          featured?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          tags?: string[];
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string;
          content?: string;
          cover_image?: string;
          status?: PostStatus;
          category_id?: string | null;
          reading_time?: number;
          views?: number;
          featured?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          tags?: string[];
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'posts_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_name: string;
          author_email: string;
          content: string;
          rating: number | null;
          status: CommentStatus;
          approved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_name: string;
          author_email: string;
          content: string;
          rating?: number | null;
          status?: CommentStatus;
          approved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_name?: string;
          author_email?: string;
          content?: string;
          rating?: number | null;
          status?: CommentStatus;
          approved_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
        ];
      };
      media: {
        Row: {
          id: string;
          filename: string;
          url: string;
          bucket: string;
          mime_type: string;
          size: number;
          alt: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          filename: string;
          url: string;
          bucket: string;
          mime_type: string;
          size: number;
          alt?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          filename?: string;
          url?: string;
          bucket?: string;
          mime_type?: string;
          size?: number;
          alt?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          verified?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      site_content: {
        Row: {
          id: string;
          key: string;
          type: 'hero' | 'banner' | 'footer' | 'about' | 'contact' | 'settings';
          data: Json;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          type: 'hero' | 'banner' | 'footer' | 'about' | 'contact' | 'settings';
          data?: Json;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          type?: 'hero' | 'banner' | 'footer' | 'about' | 'contact' | 'settings';
          data?: Json;
          updated_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      published_posts: { Row: Record<string, Json | undefined>; Relationships: [] };
      pending_comments: { Row: Record<string, Json | undefined>; Relationships: [] };
      dashboard_stats: { Row: Record<string, Json | undefined>; Relationships: [] };
    };
    Functions: {
      increment_post_views: { Args: { post_uuid: string }; Returns: undefined };
      approve_comment: { Args: { comment_uuid: string }; Returns: undefined };
      reject_comment: { Args: { comment_uuid: string }; Returns: undefined };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
    };
    Enums: {
      post_status: PostStatus;
      comment_status: CommentStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
