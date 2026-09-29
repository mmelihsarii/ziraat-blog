# Ziraat Notları

Ziraat mühendisi için hazırlanmış, public yayın sitesi ve güvenli yönetim panelinden oluşan kişisel CMS. Makaleler, kategoriler, yorumlar, ana sayfa hero alanı ve yazar profili kod açmadan yönetilebilir.

## Tamamlanan Ürün

- Sunucuda render edilen ana sayfa, makale arşivi, makale detayı ve Hakkımda sayfası
- Başlık, özet ve kategori araması; kategori filtreleme ve kademeli makale listeleme
- Taslak/yayın akışlı makale yönetimi, zengin metin, makale içi görsel ve YouTube ekleme
- SEO başlığı/açıklaması, etiketler, canonical URL, Open Graph, sitemap ve robots.txt
- Onay bekleyen yorum, 1-5 puan, admin onay/red/silme akışı
- Hero ve yazar profili yönetimi; Supabase Storage görsel yükleme
- Supabase Auth, yönetici rolü, route koruması, RLS ve kolon düzeyinde e-posta gizliliği
- Ayrı deploy edilen public/admin uygulamaları ve tek yenilemede güncel Supabase verisi
- Yerel, optimize edilmiş hero yedeği; dış servis kesintisinde bozulmayan temel görünüm

## Gereksinimler

- Node.js `20.9.0` veya üzeri
- npm
- Bir Supabase projesi

## Tek Seferlik Kurulum

1. Bağımlılıkları yükleyin:

```bash
npm install
```

2. Yeni Supabase projesinde **SQL Editor** bölümünü açın ve [`supabase-migration.sql`](./supabase-migration.sql) dosyasının tamamını çalıştırın. Mevcut kurulumlarda `supabase/migrations` içindeki dosyaları tarih sırasıyla çalıştırın. Şifre kurtarma altyapısını daha önce kurduysanız [`20260926090000_remove_password_recovery.sql`](./supabase/migrations/20260926090000_remove_password_recovery.sql) eski tablo ve fonksiyonu güvenle kaldırır.

3. Supabase **Authentication > Users** bölümünde yönetici e-posta/şifre kullanıcısını oluşturun. Yeni hesaplara güvenlik gereği otomatik yönetici yetkisi verilmez. Ardından [`supabase/admin-access.sql`](./supabase/admin-access.sql) içindeki e-posta adresini gerekiyorsa değiştirip SQL Editor'da çalıştırın. Son sorgunun çıktısında yalnız beklediğiniz hesapların yönetici olduğunu kontrol edin.

   Public kullanıcı kaydı kullanılmadığı için Supabase e-posta ile yeni kayıt özelliğini kapalı tutun.

4. `.env.local.example` dosyasını temel alarak `.env.local` içinde değerleri doldurun:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://PROJE.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUPABASE_ANON_KEY
```

5. Uygulamayı başlatın:

```bash
npm run dev
```

Ziyaretçi sitesi: `http://localhost:3000`

Yönetim paneli: `http://localhost:3001`

Yalnız bir tarafı çalıştırmak için `npm run dev:site` veya `npm run dev:admin` kullanılabilir.

## Kalite Komutları

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm audit
npm run test:e2e
npm run handoff:check

# Kod, test ve üretim derlemesi
npm run check

# Gerçek HTTPS adresi ve e-posta anahtarları girildikten sonra tam yayın kontrolü
npm run release:check
```

## Ana Rotalar

| Uygulama | Rota | Amaç |
| --- | --- | --- |
| Site | `/` | Ana sayfa |
| Site | `/makaleler` | Arama ve kategori filtreli makale arşivi |
| Site | `/makaleler/[slug]` | Kanonik makale detayı |
| Site | `/hakkimda` | Yazar profili ve iletişim |
| Admin | `/login` | Yönetici girişi |
| Admin | `/dashboard` | İçerik yönetimi ve istatistikler |

## Mimari

- `apps/site`: Yalnız ziyaretçi sayfaları ve public API uçlarını içeren bağımsız Next.js uygulaması
- `apps/admin`: Yalnız giriş, dashboard ve yönetim API uçlarını içeren bağımsız Next.js uygulaması
- `packages/core/src/services`: İki uygulamanın kullandığı Supabase veri ve Storage servisleri
- `packages/core/src/lib`: Doğrulama, güvenlik ve Supabase istemcileri
- `packages/core/src/types`: Uygulama ve veritabanı sözleşmeleri
- `supabase-migration.sql`: Sıfırdan kurulum için tam veritabanı, RLS, Storage, trigger ve seed yapısı
- `supabase/migrations`: Kurulu veritabanlarına sırayla uygulanacak artımlı güvenlik değişiklikleri
- `tests`: İçerik, yetki, bileşen ve tarayıcı duman testleri

Detaylı teknik kararlar ve tamamlanma ölçütleri [`PROJECT-BRIEF.md`](./PROJECT-BRIEF.md) içinde bulunur.

## Yayına Alma

İki ayrı hosting projesi oluşturun:

1. Ziyaretçi projesinin **Root Directory** değerini `apps/site` yapın. [`apps/site/.env.local.example`](./apps/site/.env.local.example) içindeki üç değeri hosting ortamına ekleyin.
2. Yönetim projesinin **Root Directory** değerini `apps/admin` yapın. [`apps/admin/.env.local.example`](./apps/admin/.env.local.example) içindeki değerleri ekleyin.
3. İki projede `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` birebir aynı Supabase projesine ait olmalıdır. Böylece makale, kategori, hero ve Hakkımda profili iki farklı domainde de bağlı kalır.
4. `NEXT_PUBLIC_SITE_URL` ziyaretçi domaini, `NEXT_PUBLIC_ADMIN_URL` admin domaini olmalıdır.

Ziyaretçi uygulaması ortak Supabase verisini eski yanıt önbelleğine almadan okur. Bu nedenle admin uygulaması farklı bir sağlayıcıda yayınlansa bile kayıtlar ek bir webhook veya domainler arası gizli anahtar gerektirmeden ilk sayfa yenilemesinde siteye yansır.

Supabase artımlı migration dosyasını çalıştırdıktan ve kök `.env.local` içine canlı değerleri koyduktan sonra `npm run release:check` komutu iki uygulamayı, testleri, tarayıcı akışlarını ve bağımlılıkları tek seferde doğrular.

Bu proje özel kullanım içindir.
