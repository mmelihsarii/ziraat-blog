/**
 * Dosyanın görevi: Silinen veya taşınan rotalardan kalan Next.js tip önbelleklerini kalite kontrolü öncesinde temizler.
 * Kullanıldığı yerler: package.json içindeki typecheck komutu.
 */
import { rmSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';

const projectRoot = resolve('.');
const applicationRoots = [
  resolve(projectRoot, 'apps/site'),
  resolve(projectRoot, 'apps/admin'),
];

for (const applicationRoot of applicationRoots) {
  const cacheDirectory = resolve(applicationRoot, '.next');
  if (dirname(cacheDirectory) !== applicationRoot || basename(cacheDirectory) !== '.next') {
    throw new Error('Beklenmeyen Next.js önbellek yolu.');
  }
  rmSync(cacheDirectory, { recursive: true, force: true });
}
