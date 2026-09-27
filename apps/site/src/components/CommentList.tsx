/**
 * Dosyanın görevi: Onaylanmış yorumları puan ve tarih bilgisiyle listeler; boş durumda yönlendirici mesaj gösterir.
 * Kullanıldığı yerler: app/makale/[slug]/page.tsx
 */
'use client';

import { Star, MessageSquare } from 'lucide-react';
import type { PublicComment } from '@/types';

interface CommentListProps {
  comments: PublicComment[];
}

/** Onaylanmış yorumları puan ve tarih bilgisiyle listeler; boş durumda yönlendirici mesaj gösterir. */
export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-12 text-center">
        <MessageSquare className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
        <h3 className="font-display font-bold text-xl text-neutral-700 mb-2">
          Henüz yorum yok
        </h3>
        <p className="text-neutral-500">
          İlk yorumu yapan siz olun!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-display font-bold text-2xl text-neutral-900 uppercase tracking-wider mb-6">
        Yorumlar ({comments.length})
      </h3>

      <div className="space-y-6">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
{/* Yorum başlığı */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
{/* Yazar simgesi */}
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-display font-bold text-lg uppercase">
                  {comment.name.charAt(0)}
                </div>

{/* Yazar bilgisi */}
                <div>
                  <h4 className="font-display font-bold text-base text-neutral-900">
                    {comment.name}
                  </h4>
                  <p className="text-xs text-neutral-500">{comment.timestamp}</p>
                </div>
              </div>

{/* Puan */}
              {comment.rating && (
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-sm text-yellow-700">{comment.rating}/5</span>
                </div>
              )}
            </div>

{/* Yorum metni */}
            <div className="pl-15">
              <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
