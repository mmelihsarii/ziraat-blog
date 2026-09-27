/**
 * Dosyanın görevi: Editörden gelen HTML'i makale görünümünde izin verilen güvenli etiket ve özniteliklerle sınırlar.
 * Kullanıldığı yerler: app/makale/[slug]/page.tsx, tests/content-security.test.ts
 */
import 'server-only';

import sanitizeHtml from 'sanitize-html';

/** Editörden gelen HTML'i makale görünümünde izin verilen güvenli etiket ve özniteliklerle sınırlar. */
export function sanitizeRichText(content: string): string {
  return sanitizeHtml(content, {
    allowedTags: [
      'p', 'br', 'h1', 'h2', 'h3', 'h4', 'strong', 'em', 's', 'blockquote',
      'ul', 'ol', 'li', 'a', 'img', 'hr', 'pre', 'code', 'figure', 'figcaption', 'iframe',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      iframe: ['src', 'title', 'width', 'height', 'allow', 'allowfullscreen'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'],
    transformTags: {
      a: (_tagName, attributes) => ({
        tagName: 'a',
        attribs: { ...attributes, rel: 'noopener noreferrer' },
      }),
      img: (_tagName, attributes) => ({
        tagName: 'img',
        attribs: { ...attributes, loading: 'lazy' },
      }),
    },
  });
}
