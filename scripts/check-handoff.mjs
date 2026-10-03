/**
 * Dosyanın görevi: Kaynak dosyalarının bakım notlarını ve gizli dosya paylaşımını teslim öncesinde denetler.
 * Kullanıldığı yerler: package.json içindeki handoff:check komutu.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';

/** Bir klasördeki bütün dosyaları alt klasörleriyle birlikte listeler. */
function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

const sourceFiles = ['apps/site/src', 'apps/admin/src', 'packages/core/src']
  .flatMap(walk)
  .filter((file) => ['.ts', '.tsx', '.css'].includes(extname(file)));
const undocumented = sourceFiles.filter(
  (file) => !readFileSync(file, 'utf8').includes('Dosyanın görevi:'),
);
if (undocumented.length) {
  console.error('Türkçe dosya görevi eksik kaynaklar:');
  for (const file of undocumented) console.error(`- ${relative('.', file)}`);
  process.exitCode = 1;
}

const allowedEnvironmentExamples = new Set([
  '.env.local.example',
  'apps/site/.env.local.example',
  'apps/admin/.env.local.example',
]);
const trackedEnvironmentFiles = execFileSync('git', ['ls-files', '**/.env*', '.env*'], { encoding: 'utf8' })
  .split(/\r?\n/)
  .filter((file) => file && !allowedEnvironmentExamples.has(file.replaceAll('\\', '/')));
if (trackedEnvironmentFiles.length) {
  console.error('Git tarafından izlenmemesi gereken ortam dosyaları:', trackedEnvironmentFiles.join(', '));
  process.exitCode = 1;
}

if (!existsSync('supabase/migrations/20260907180000_release_hardening.sql')) {
  console.error('Yayın güvenliği migration dosyası bulunamadı.');
  process.exitCode = 1;
}

if (!existsSync('supabase/migrations/20261003090000_gallery.sql')) {
  console.error('Galeri migration dosyası bulunamadı.');
  process.exitCode = 1;
}

if (!process.exitCode) {
  console.log(`${sourceFiles.length} kaynak dosyasının bakım notları ve teslim güvenliği doğrulandı.`);
}
