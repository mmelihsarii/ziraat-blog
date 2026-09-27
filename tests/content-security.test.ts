/**
 * Dosyanın görevi: Okuma süresi, HTML temizleme ve görsel sınırlarının güvenli davranışını doğrular.
 * Kullanıldığı yerler: Vitest kalite kontrolü.
 */
import { describe, expect, it } from 'vitest';
import { calculateReadingTime, countWords } from '@/lib/content';
import { sanitizeRichText } from '@/lib/sanitize';
import { validateImageFile } from '@/lib/validations';

describe('İçerik ve güvenlik sınırları', () => {
  it('200/201 kelime sınırını ve boş HTML içeriğini doğru hesaplar', () => {
    expect(calculateReadingTime('<p>' + 'toprak '.repeat(200) + '</p>')).toBe(1);
    expect(calculateReadingTime('<p>' + 'toprak '.repeat(201) + '</p>')).toBe(2);
    expect(calculateReadingTime('<p><br></p>')).toBe(0);
    expect(countWords('<p>İğde, çöğür ve sulama.</p>')).toBe(4);
  });
  it('Makale HTML içindeki çalıştırılabilir içerikleri temizler', () => {
    const html = sanitizeRichText('<p>Toprak <strong>sağlığı</strong></p><script>alert(1)</script><img src="https://example.com/a.jpg" onerror="alert(1)"><a href="javascript:alert(1)">x</a><iframe src="https://evil.example"></iframe>');
    expect(html).toContain('<strong>sağlığı</strong>');
    expect(html).not.toMatch(/script|onerror|javascript:|evil\.example/);
    expect(html).toContain('loading="lazy"');
  });
  it('Güvenilir video gömmesini korur', () => {
    expect(sanitizeRichText('<iframe src="https://www.youtube-nocookie.com/embed/abc"></iframe>')).toContain('/embed/abc');
  });
  it('Profil için 5 MB, makale için 10 MB sınırını uygular', () => {
    const file = { type: 'image/png', size: 6 * 1024 * 1024 } as File;
    expect(validateImageFile(file, 'profiles')).toContain('5MB');
    expect(validateImageFile(file, 'posts')).toBeNull();
    expect(validateImageFile({ type: 'image/svg+xml', size: 100 } as File)).not.toBeNull();
  });
});
