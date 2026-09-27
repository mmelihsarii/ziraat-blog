/**
 * Dosyanın görevi: Projenin derleme ve çalışma ayarlarını tanımlar.
 * Kullanıldığı yerler: Derleme aracı veya ilgili çalışma komutu tarafından yüklenir.
 */
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Birim/bileşen testleri canlı Supabase'e bağlanmadan çalışır.
export default defineConfig({
  resolve: { alias: [
    { find: '@/components/admin', replacement: fileURLToPath(new URL('./apps/admin/src/components/admin', import.meta.url)) },
    { find: '@/app', replacement: fileURLToPath(new URL('./apps/admin/src/app', import.meta.url)) },
    { find: '@/lib', replacement: fileURLToPath(new URL('./packages/core/src/lib', import.meta.url)) },
    { find: '@/services', replacement: fileURLToPath(new URL('./packages/core/src/services', import.meta.url)) },
    { find: '@/types', replacement: fileURLToPath(new URL('./packages/core/src/types', import.meta.url)) },
    { find: '@', replacement: fileURLToPath(new URL('./apps/admin/src', import.meta.url)) },
    { find: 'server-only', replacement: fileURLToPath(new URL('./tests/server-only.ts', import.meta.url)) },
  ] },
  test: { include: ['tests/**/*.test.{ts,tsx,mjs}'], testTimeout: 15000, hookTimeout: 30000 },
});
