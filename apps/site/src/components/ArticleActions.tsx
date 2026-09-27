/**
 * Dosyanın görevi: Görüntülenme kaydı, gerçek paylaşım bağlantıları, kopyalama bildirimi ve yukarı dönüşü yönetir.
 * Kullanıldığı yerler: app/makale/[slug]/page.tsx
 */
'use client';

import { useEffect, useState } from 'react';
import { ChevronUp, Copy, Share2 } from 'lucide-react';
import { FaFacebook, FaTwitter } from 'react-icons/fa';

interface ArticleActionsProps {
  postId: string;
  title: string;
}

/** Görüntülenme kaydı, gerçek paylaşım bağlantıları, kopyalama bildirimi ve yukarı dönüşü yönetir. */
export default function ArticleActions({ postId, title }: ArticleActionsProps) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const key = `viewed:${postId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    void fetch(`/api/posts/${postId}/view`, { method: 'POST', keepalive: true });
  }, [postId]);

  /** Kısa kullanıcı bildirimini dört saniye gösterir. */
  const notify = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 4000);
  };

  /** Aktif makale URL'sini seçilen sosyal platformun paylaşım penceresinde açar. */
  const share = (platform: 'facebook' | 'twitter') => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    const shareUrl = platform === 'facebook'
      ? `https://www.facebook.com/sharer/sharer.php?u=${url}`
      : `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=720,height=560');
  };

  /** Makale bağlantısını panoya kopyalar ve sonucu kullanıcıya bildirir. */
  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    notify('Makale bağlantısı kopyalandı.');
  };

  return (
    <>
      {message && <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black/90 text-white px-5 py-3 rounded-lg shadow-2xl text-sm font-bold">{message}</div>}
      <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 md:right-10 z-40 bg-black hover:bg-neutral-800 text-white p-3 rounded-full shadow-2xl transition-all hover:scale-110 border border-neutral-800" aria-label="Sayfanın başına dön">
        <ChevronUp className="w-5 h-5" />
      </button>
      <div className="py-6 border-y border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2"><Share2 className="w-5 h-5 text-emerald-600" /><span className="font-display text-base font-bold text-neutral-900 uppercase tracking-wider">Paylaş</span></div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button type="button" onClick={copyLink} className="flex-1 sm:flex-none flex items-center justify-center gap-2 border-b-2 border-emerald-600 hover:bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-600"><Copy className="w-4 h-4" />Linki Kopyala</button>
          <button type="button" onClick={() => share('facebook')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 border-b-2 border-[#3B5998] hover:bg-[#3B5998]/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#3B5998]"><FaFacebook className="w-4 h-4" />Paylaş</button>
          <button type="button" onClick={() => share('twitter')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 border-b-2 border-[#00ACED] hover:bg-[#00ACED]/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#00ACED]"><FaTwitter className="w-4 h-4" />Tweet</button>
        </div>
      </div>
    </>
  );
}
