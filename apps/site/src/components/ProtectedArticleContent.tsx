/**
 * Dosyanın görevi: Yayındaki makale HTML'ini seçime ve normal tarayıcı kopyalama olaylarına kapalı biçimde gösterir.
 * Kullanıldığı yerler: app/makale/[slug]/page.tsx
 */
'use client';

import { useEffect, useRef } from 'react';

interface ProtectedArticleContentProps {
  html: string;
}

/** Yayındaki makale HTML'ini seçime ve normal tarayıcı kopyalama olaylarına kapalı biçimde gösterir. */
export default function ProtectedArticleContent({ html }: ProtectedArticleContentProps) {
  const contentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    /** Seçim makale içindeyse kopyalama ve kesme olayını durdurur. */
    const preventCopyFromContent = (event: ClipboardEvent) => {
      const selection = window.getSelection();
      const content = contentRef.current;

      if (!selection?.rangeCount || !content) return;

      if (content.contains(selection.getRangeAt(0).commonAncestorContainer)) {
        event.preventDefault();
      }
    };

    document.addEventListener('copy', preventCopyFromContent, true);
    document.addEventListener('cut', preventCopyFromContent, true);

    return () => {
      document.removeEventListener('copy', preventCopyFromContent, true);
      document.removeEventListener('cut', preventCopyFromContent, true);
    };
  }, []);

  return (
    <article
      ref={contentRef}
      className="article-content"
      onCopy={(event) => event.preventDefault()}
      onCut={(event) => event.preventDefault()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
