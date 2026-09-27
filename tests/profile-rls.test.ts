/**
 * Dosyanın görevi: Supabase'in sağladığı kimlik/Storage iskeletini yerel test veritabanında kurar.
 * Kullanıldığı yerler: Derleme aracı veya ilgili çalışma komutu tarafından yüklenir.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';

// Gerçek PostgreSQL yürütücüsünde, yalnız bellekte çalışır; uzak veriye dokunmaz.
const db = new PGlite();
const first = '00000000-0000-4000-8000-000000000001';
const second = '00000000-0000-4000-8000-000000000002';
const reader = '00000000-0000-4000-8000-000000000003';
const migration = readFileSync('supabase/migrations/20260907180000_release_hardening.sql', 'utf8');
const cleanupMigration = readFileSync('supabase/migrations/20260926090000_remove_password_recovery.sql', 'utf8');

/** Supabase'in sağladığı kimlik/Storage iskeletini yerel test veritabanında kurar. */
beforeAll(async () => {
  await db.exec(`
    CREATE ROLE anon;
    CREATE ROLE authenticated;
    CREATE SCHEMA auth;
    CREATE SCHEMA storage;
    CREATE TABLE auth.users (id uuid PRIMARY KEY, email text, raw_user_meta_data jsonb, created_at timestamptz DEFAULT now());
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
      $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    CREATE FUNCTION public.uuid_generate_v4() RETURNS uuid LANGUAGE sql AS $$ SELECT gen_random_uuid() $$;
    CREATE TABLE storage.buckets (id text PRIMARY KEY, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    CREATE TABLE storage.objects (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bucket_id text, name text);
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    GRANT USAGE ON SCHEMA public, auth, storage TO anon, authenticated;
  `);
  // PGlite'ta bu iki uzantı yerine yerleşik gen_random_uuid kullanılır.
  const baseline = readFileSync('supabase-migration.sql', 'utf8')
    .replace(/^CREATE EXTENSION IF NOT EXISTS "(uuid-ossp|pgcrypto)";\r?$/gm, '');
  await db.exec(baseline);
  await db.exec(migration);
  await db.exec(cleanupMigration);
  await db.exec(`
    INSERT INTO auth.users (id,email) VALUES
      ('${first}', 'first@test.invalid'), ('${second}', 'second@test.invalid'), ('${reader}', 'reader@test.invalid');
  `);
});
afterAll(async () => { await db.close(); });

/** Anonim rolü yalnız bu sorgu boyunca açar; hata olsa da test rolünü geri alır. */
async function anonymousProfiles() {
  await db.exec('SET ROLE anon');
  try { return (await db.query<{ id: string }>('SELECT id, email, phone FROM public.profiles')).rows; }
  finally { await db.exec('RESET ROLE'); }
}

describe('Profil ve yayın RLS kuralları', () => {
  it('İlk kayıt dahil hiçbir yeni hesaba otomatik admin vermez', async () => {
    const result = await db.query<{ count: number }>('SELECT count(*)::int AS count FROM profiles WHERE is_admin');
    expect(result.rows[0].count).toBe(0);
    expect(await anonymousProfiles()).toEqual([]);
  });
  it('Seçilen yönetici dışında kalan profilleri gizler', async () => {
    await db.exec(`UPDATE profiles SET is_admin = true WHERE id IN ('${first}', '${second}');
      INSERT INTO site_content (key,type,data) VALUES ('about_profile','about','{"profile_id":"${first}"}');`);
    expect((await anonymousProfiles()).map(p => p.id)).toEqual([first]);
  });
  it('Hakkımda seçimi değişince erişilen profil de değişir', async () => {
    await db.exec(`UPDATE site_content SET data = '{"profile_id":"${second}"}' WHERE key='about_profile';`);
    expect((await anonymousProfiles()).map(p => p.id)).toEqual([second]);
  });
  it('Bozuk seçimde tek bir yöneticiye düşer, normal kullanıcıyı yayımlamaz', async () => {
    await db.exec(`UPDATE site_content SET data = '{"profile_id":"bozuk-uuid"}' WHERE key='about_profile';`);
    const profiles = await anonymousProfiles();
    expect(profiles).toHaveLength(1);
    expect([first, second]).toContain(profiles[0].id);
  });
  it('Normal hesap kendi admin yetkisini yükseltemez', async () => {
    await db.exec(`SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub', '${reader}', false);`);
    try {
      const result = await db.query('UPDATE profiles SET is_admin = true RETURNING id');
      expect(result.rows).toEqual([]);
    } finally { await db.exec('RESET ROLE'); }
  });
  it('Taslakları ve yorum e-postalarını anonim okuyucudan korur', async () => {
    await db.exec(`INSERT INTO posts(title,slug,excerpt,content,cover_image,status) VALUES
      ('Taslak makale','taslak-makale','Yeterince uzun özet','<p>Toprak</p>','/a.jpg','draft'),
      ('Yayın makalesi','yayin-makalesi','Yeterince uzun özet','<p>Toprak</p>','/a.jpg','published');`);
    await db.exec('SET ROLE anon');
    try {
      expect((await db.query('SELECT id FROM posts')).rows).toHaveLength(1);
      await expect(db.query('SELECT author_email FROM comments')).rejects.toThrow(/permission denied/);
      await expect(db.query("INSERT INTO profiles(id,name,email,is_admin) VALUES(gen_random_uuid(),'x','x@x.com',true)")).rejects.toThrow();
    } finally { await db.exec('RESET ROLE'); }
  });
  it('Kaldırılan şifre kurtarma tablo ve fonksiyonunu barındırmaz', async () => {
    const table = await db.query<{ relation: string | null }>(
      "SELECT to_regclass('public.password_reset_attempts')::text AS relation",
    );
    const fn = await db.query<{ count: number }>(
      "SELECT count(*)::int AS count FROM pg_proc WHERE proname = 'consume_password_reset_attempt'",
    );
    expect(table.rows[0].relation).toBeNull();
    expect(fn.rows[0].count).toBe(0);
  });
  it('Artımlı SQL tekrar çalıştırılabilir ve mevcut adminleri korur', async () => {
    await db.exec(migration);
    await db.exec(cleanupMigration);
    expect((await db.query('SELECT id FROM profiles WHERE is_admin')).rows).toHaveLength(2);
  });
});
