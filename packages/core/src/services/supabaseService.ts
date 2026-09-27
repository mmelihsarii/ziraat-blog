/**
 * Dosyanın görevi: Ziyaretçi yorumunu her zaman onay bekliyor durumunda oluşturur.
 * Kullanıldığı yerler: app/dashboard/comments/page.tsx, app/dashboard/page.tsx, components/CommentForm.tsx
 */
'use client';

import { supabase } from '@/lib/supabase/client';
import type { AdminComment, CommentStats, CreateCommentInput } from '@/types';

type CommentWithPost = Omit<AdminComment, 'post'> & { post: AdminComment['post'] };

/** Ziyaretçi yorumunu her zaman onay bekliyor durumunda oluşturur. */
export async function createComment(input: CreateCommentInput): Promise<void> {
  const { error } = await supabase.from('comments').insert({
    post_id: input.post_id,
    author_name: input.author_name.trim(),
    author_email: input.author_email.trim().toLowerCase(),
    content: input.content.trim(),
    rating: input.rating,
    status: 'pending',
    approved_at: null,
  });
  if (error) throw error;
}

/** Yönetim ekranı için yorumları makale bilgisi ve isteğe bağlı filtrelerle getirir. */
export async function getAllComments(filters?: {
  status?: 'pending' | 'approved' | 'rejected';
  postId?: string;
  searchQuery?: string;
}): Promise<AdminComment[]> {
  let query = supabase
    .from('comments')
    .select('*, post:posts(id, title, slug)')
    .order('created_at', { ascending: false });
  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.postId) query = query.eq('post_id', filters.postId);
  if (filters?.searchQuery) {
    const safeQuery = filters.searchQuery.replace(/[,%()]/g, ' ').trim();
    if (safeQuery) {
      query = query.or(
        `author_name.ilike.%${safeQuery}%,author_email.ilike.%${safeQuery}%,content.ilike.%${safeQuery}%`,
      );
    }
  }
  const { data, error } = await query;
  if (error) throw error;
  return data as unknown as CommentWithPost[];
}

/** Yorumu yayınlar ve onay zamanını veritabanı fonksiyonuyla kaydeder. */
export async function approveComment(commentId: string): Promise<void> {
  const { error } = await supabase.rpc('approve_comment', { comment_uuid: commentId });
  if (error) throw error;
}

/** Yorumu reddeder ve varsa önceki onay zamanını temizler. */
export async function rejectComment(commentId: string): Promise<void> {
  const { error } = await supabase.rpc('reject_comment', { comment_uuid: commentId });
  if (error) throw error;
}

/** Seçilen yorumu kalıcı olarak siler. */
export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  if (error) throw error;
}

/** Dashboard kartları için yorum durumlarının sayılarını hesaplar. */
export async function getCommentStats(): Promise<CommentStats> {
  const { data, error } = await supabase.from('comments').select('status');
  if (error) throw error;
  return {
    total: data.length,
    pending: data.filter(({ status }) => status === 'pending').length,
    approved: data.filter(({ status }) => status === 'approved').length,
    rejected: data.filter(({ status }) => status === 'rejected').length,
  };
}
