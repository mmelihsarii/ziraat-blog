/**
 * Dosyanın görevi: Galeri yüklemelerinin tür, boyut ve boyut etiketi kurallarını doğrular.
 * Kullanıldığı yerler: Vitest kalite kontrolü.
 */
// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  formatFileSize,
  MAX_GALLERY_IMAGE_INPUT_BYTES,
  MAX_GALLERY_VIDEO_BYTES,
  validateGalleryFile,
} from '@/lib/gallery-media';

describe('Galeri medya doğrulaması', () => {
  it('Desteklenen görsel ve video türlerini kabul eder', () => {
    expect(validateGalleryFile({ type: 'image/jpeg', size: 1024 })).toBeNull();
    expect(validateGalleryFile({ type: 'video/mp4', size: 1024 })).toBeNull();
  });
  it('Desteklenmeyen dosyaları ve sınırı aşan medyayı reddeder', () => {
    expect(validateGalleryFile({ type: 'image/gif', size: 1024 })).toMatch(/Yalnızca/);
    expect(validateGalleryFile({ type: 'image/png', size: MAX_GALLERY_IMAGE_INPUT_BYTES + 1 })).toMatch(/15 MB/);
    expect(validateGalleryFile({ type: 'video/webm', size: MAX_GALLERY_VIDEO_BYTES + 1 })).toMatch(/50 MB/);
  });
  it('Dosya boyutunu kısa ve okunabilir gösterir', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});
