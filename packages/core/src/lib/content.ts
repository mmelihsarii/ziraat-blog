/**
 * Dosyanın görevi: Rich text HTML'ini okuma suresi hesabinda kullanilabilecek duz metne indirger.
 * Kullanıldığı yerler: components/admin/RichTextEditor.tsx, services/adminService.ts, tests/content-security.test.ts
 */
const WORDS_PER_MINUTE = 200;

/** Rich text HTML'ini okuma suresi hesabinda kullanilabilecek duz metne indirger. */
export function richTextToPlainText(content: string): string {
  return content
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(?:nbsp|amp|quot|apos|#39|lt|gt);/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Turkce dahil Unicode metindeki okunabilir kelimeleri sayar. */
export function countWords(content: string): number {
  const text = richTextToPlainText(content);
  if (!text) return 0;

  if (typeof Intl.Segmenter === 'function') {
    const segments = new Intl.Segmenter('tr', { granularity: 'word' }).segment(text);
    return Array.from(segments).filter((segment) => segment.isWordLike).length;
  }

  return text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

/** Icerigi dakikada 200 kelime kabul ederek yukari yuvarlanmis okuma suresine donusturur. */
export function calculateReadingTime(content: string): number {
  const wordCount = countWords(content);
  return wordCount === 0 ? 0 : Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}
