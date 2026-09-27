/**
 * Dosyanın görevi: Canlı yayından önce gerekli ortam değerlerinin eksiksiz ve üretime uygun olduğunu denetler.
 * Kullanıldığı yerler: package.json içindeki release:check komutu.
 */
import { existsSync, readFileSync } from 'node:fs';

const requiredVariables = [
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_ADMIN_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

/** .env.local içindeki basit KEY=VALUE satırlarını gizli değerleri yazdırmadan okur. */
function readLocalEnvironment() {
  if (!existsSync('.env.local')) return {};
  return Object.fromEntries(
    readFileSync('.env.local', 'utf8')
      .split(/\r?\n/)
      .map((line) => line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/))
      .filter(Boolean)
      .map((match) => [match[1], match[2].trim().replace(/^["']|["']$/g, '')]),
  );
}

/** Eksik, örnek bırakılmış veya canlı ortam için güvensiz değerleri toplar. */
function collectProblems(environment) {
  const problems = [];
  for (const name of requiredVariables) {
    const value = environment[name]?.trim();
    if (!value || /your-|PROJE|SUPABASE_|dogrulanmis/i.test(value)) {
      problems.push(`${name} eksik veya örnek değer içeriyor.`);
    }
  }

  for (const name of ['NEXT_PUBLIC_SITE_URL', 'NEXT_PUBLIC_ADMIN_URL']) {
    const configuredUrl = environment[name];
    if (!configuredUrl) continue;
    try {
      const url = new URL(configuredUrl);
      if (url.protocol !== 'https:' || ['localhost', '127.0.0.1'].includes(url.hostname)) {
        problems.push(`${name} canlı HTTPS alan adı olmalıdır.`);
      }
    } catch {
      problems.push(`${name} geçerli bir URL değil.`);
    }
  }
  return problems;
}

const environment = { ...readLocalEnvironment(), ...process.env };
const problems = collectProblems(environment);
if (problems.length) {
  console.error('Yayın kontrolü tamamlanamadı:');
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}
console.log('Canlı ortam değişkenleri yayına uygun.');
