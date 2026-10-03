/**
 * Dosyanın görevi: Galeri dosyalarını tür/boyut açısından doğrular, görselleri WebP'ye küçültür ve videodan kapak üretir.
 * Kullanıldığı yerler: services/galleryService.ts, app/dashboard/gallery/page.tsx ve galeri testleri.
 */
'use client';

export const GALLERY_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const GALLERY_VIDEO_TYPES = ['video/mp4', 'video/webm'] as const;
export const MAX_GALLERY_IMAGE_INPUT_BYTES = 15 * 1024 * 1024;
export const MAX_GALLERY_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_IMAGE_EDGE = 2560;
const MAX_POSTER_EDGE = 1440;
const WEBP_QUALITY = 0.84;

export interface PreparedGalleryFile {
  file: File;
  width: number;
  height: number;
  durationSeconds: number | null;
  poster: File | null;
}

/** Dosyanın tarayıcı ve Storage tarafından desteklenen galeri sınırlarında olduğunu açıklar. */
export function validateGalleryFile(file: Pick<File, 'type' | 'size'>): string | null {
  if (GALLERY_IMAGE_TYPES.includes(file.type as (typeof GALLERY_IMAGE_TYPES)[number])) {
    return file.size > MAX_GALLERY_IMAGE_INPUT_BYTES
      ? 'Görsel en fazla 15 MB olabilir.'
      : null;
  }
  if (GALLERY_VIDEO_TYPES.includes(file.type as (typeof GALLERY_VIDEO_TYPES)[number])) {
    return file.size > MAX_GALLERY_VIDEO_BYTES
      ? 'Video en fazla 50 MB olabilir.'
      : null;
  }
  return 'Yalnızca JPG, PNG, WebP, MP4 ve WebM dosyaları desteklenir.';
}

/** Canvas çıktısını kalite kontrollü WebP dosyasına dönüştürür. */
function canvasToWebp(canvas: HTMLCanvasElement, filename: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Görsel optimize edilemedi.'));
        return;
      }
      resolve(new File([blob], filename, { type: 'image/webp', lastModified: Date.now() }));
    }, 'image/webp', WEBP_QUALITY);
  });
}

/** Yüksek çözünürlüklü görseli en-boy oranını koruyarak WebP'ye dönüştürür. */
async function optimizeImage(file: File): Promise<PreparedGalleryFile> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) throw new Error('Görsel işleme alanı oluşturulamadı.');
    context.drawImage(bitmap, 0, 0, width, height);
    const stem = file.name.replace(/\.[^.]+$/, '') || 'galeri-gorseli';
    const optimized = await canvasToWebp(canvas, `${stem}.webp`);
    return { file: optimized, width, height, durationSeconds: null, poster: null };
  } finally {
    bitmap.close();
  }
}

/** Yerel videonun metadata bilgisini okur ve ilk bölümünden hafif bir WebP kapak karesi çıkarır. */
async function prepareVideo(file: File): Promise<PreparedGalleryFile> {
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.muted = true;
  video.playsInline = true;
  video.src = objectUrl;

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('Video bilgileri okunamadı.'));
      video.load();
    });

    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const targetTime = duration > 0.4 ? Math.min(0.4, duration / 4) : 0;
    if (targetTime > 0) {
      await new Promise<void>((resolve, reject) => {
        video.onseeked = () => resolve();
        video.onerror = () => reject(new Error('Video kapağı oluşturulamadı.'));
        video.currentTime = targetTime;
      });
    }

    const sourceWidth = video.videoWidth || 1280;
    const sourceHeight = video.videoHeight || 720;
    const scale = Math.min(1, MAX_POSTER_EDGE / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Video kapağı işleme alanı oluşturulamadı.');
    context.drawImage(video, 0, 0, width, height);
    const stem = file.name.replace(/\.[^.]+$/, '') || 'galeri-videosu';
    const poster = await canvasToWebp(canvas, `${stem}-kapak.webp`);
    return {
      file,
      width: sourceWidth,
      height: sourceHeight,
      durationSeconds: duration,
      poster,
    };
  } finally {
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
}

/** Dosyayı medya türüne göre public galeride kullanılacak hale getirir. */
export async function prepareGalleryFile(file: File): Promise<PreparedGalleryFile> {
  const validationError = validateGalleryFile(file);
  if (validationError) throw new Error(validationError);
  return file.type.startsWith('image/') ? optimizeImage(file) : prepareVideo(file);
}

/** Bayt değerini yönetim ekranında okunabilir kısa etikete çevirir. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
