# Proje ve Teslim Briefi

## Ürün Hedefi

Ziraat mühendisi, geliştirici desteğine ihtiyaç duymadan makale yayınlayabilmeli, içeriği kategorilere ayırabilmeli, görsel/video kullanabilmeli, yorumları yönetebilmeli ve kendi vitrin/profil bilgisini güncelleyebilmelidir. Ziyaretçi ise hızlı, mobil uyumlu ve arama motorlarınca anlaşılabilir bir yayın deneyimi yaşamalıdır.

## Başlangıç Analizi

İlk durumda aynı kavram için birden fazla eski veri modeli ve servis bulunuyor; public veriler tarayıcıda çekiliyor; yönetim koruması yalnız istemciye bırakılıyor; bazı butonlar gerçek işlev yerine örnek sayaç gösteriyor; yorum e-postası public sorguya açık kalabiliyor; zengin HTML doğrudan render ediliyor; build, tip ve lint kontrolleri geçmiyordu. Eski kurulum belgeleri de artık bulunmayan dosya ve rotaları tarif ediyordu.

Bu kopukluklar tek veri modeli, ayrılmış Supabase istemcileri, sunucu veri akışı ve tek migration dosyası etrafında giderildi. Kullanılmayan hook, component, test sayfası ve eski servisler kaldırıldı.

## Nihai Akış

```text
Supabase PostgreSQL + Auth + Storage
                 |
       server/public services
                 |
       Next.js Server Components
                 |
  public site + küçük client etkileşimleri

Admin formu -> doğrulama -> RLS kontrollü service -> Supabase
Public site -> aynı Supabase verisi -> tek yenilemede güncel içerik
```

## Modül Sınırları

- Public servis yalnız yayınlanmış makaleleri ve onaylanmış yorumları döndürür.
- Admin servisleri yalnız client yönetim ekranlarından çağrılır; RLS gerçek yetki sınırıdır.
- `proxy.ts` hızlı route kontrolü yapar, dashboard server layout aynı yetkiyi ikinci kez doğrular.
- HTML yalnız sanitize allowlist işleminden sonra render edilir.
- Yorum e-postası public tipe, sorguya ve anon kolon yetkisine dahil değildir.
- Görüntülenme artışı yarış durumuna açık client hesabı yerine atomik SQL fonksiyonudur.

## Performans Kararları

- Public sorgular sunucuda paralel çalışır ve yönetim değişikliklerini ilk yenilemede göstermek için eski yanıt önbelleğine alınmaz.
- İçerik değişiklikleri ayrı deploy edilen ziyaretçi sitesinin bir sonraki isteğinde doğrudan Supabase'ten okunur.
- Public sayfalara Supabase tarayıcı paketi ve admin state'i taşınmaz.
- Next Image, AVIF/WebP, doğru `sizes`, lazy loading ve öncelikli hero/kapak stratejisi kullanılır.
- Hero yedeği 1672x941 WebP ve yaklaşık 160 KB boyutundadır.
- React Compiler etkin; rich text editörü yalnız admin formunda dinamik yüklenir.

## Güvenlik Kararları

- Yönetim yetkisi `profiles.is_admin` ile açıkça tanımlıdır; sıradan authenticated hesap admin değildir.
- İlk Auth kullanıcısı migration/trigger tarafından ilk yönetici olarak atanır.
- Auth çerezleri `@supabase/ssr` ile server/proxy katmanında yenilenir.
- RLS tüm tablolar ve Storage bucketları için rol bazlıdır.
- Moderasyon fonksiyonları hem EXECUTE izni hem fonksiyon içi admin kontrolü kullanır.

## Tamamlanma Ölçütleri

- Public: ana sayfa, arşiv, arama, kategori, detay, paylaşım, yorum, puan, profil, fotoğraf/video galerisi
- Admin: giriş/çıkış, dashboard, makale, kategori, yorum, hero, profil ve galeri yönetimi
- İçerik: rich text, görsel, YouTube, SEO alanları, etiketler, taslak/yayın
- Teknik: tip kontrolü, lint, production build, dependency audit, desktop/mobile tarayıcı kontrolü
- Operasyon: tek migration, örnek env, güncel README, dış servis olmadığında yerel hero yedeği

## Bilinçli Sonraki Aşamalar

Mevcut ürünün çalışmasına engel olmayan sonraki ölçek adımları: yüzlerce makaleden sonra veritabanı tabanlı sayfalama/tam metin arama, yoğun anonim trafikte CAPTCHA ve harici rate limit, doğrulamalı newsletter gönderim sağlayıcısı ve gelişmiş ziyaret analitiği.
