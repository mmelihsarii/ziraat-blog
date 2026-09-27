/**
 * Dosyanın görevi: Bilinmeyen hata değerinden kullanıcıya/loga uygun güvenli mesaj çıkarır.
 * Kullanıldığı yerler: app/dashboard/categories/new/page.tsx, app/dashboard/categories/page.tsx, app/dashboard/categories/[id]/edit/page.tsx, app/dashboard/content/hero/page.tsx, app/dashboard/posts/new/page.tsx, app/dashboard/posts/[id]/edit/page.tsx ve 1 dosya daha
 */
/** Bilinmeyen hata değerinden kullanıcıya/loga uygun güvenli mesaj çıkarır. */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Bilinmeyen hata';
}

/** Supabase benzeri hata nesnelerindeki kod alanını tip güvenli biçimde okur. */
export function getErrorCode(error: unknown): string {
  if (!error || typeof error !== 'object' || !('code' in error)) return '';
  return String(error.code);
}
