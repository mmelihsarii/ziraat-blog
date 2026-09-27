# Ziraat Notlari Manuel Test Briefi

Bu belge, uygulamayi yayinlamadan once admin ve ziyaretci tarafinda uygulanacak manuel kabul testlerini kapsar. Testleri asagidaki sirayla yapmak, olusturulan verilerin sonraki senaryolarda tekrar kullanilmasini saglar.

## 1. Test Kurulumu

### Ortamlar

- Admin oturumu: Normal Chrome/Edge penceresi, `http://localhost:3001/login`
- Ziyaretci oturumu: Gizli pencere, `http://localhost:3000`
- Mobil kontrol: Tarayici gelistirici aracinda 390x844 ve 360x800
- Masaustu kontrol: 1440x900 ve 1920x1080
- Mumkunse son turu gercek bir Android veya iPhone cihazda yapin.

### Test verileri

- Kategori: `QA Sulama`
- Kategori slug: `qa-sulama`
- Makale basligi: `QA Damla Sulama Rehberi`
- Makale slug: `qa-damla-sulama-rehberi`
- Yorumcu: `QA Ziyaretci`
- Yorum e-postasi: `qa-ziyaretci@example.com`
- Gecerli gorsel: JPG veya WebP, 1 MB'dan kucuk
- Hatali gorsel: PDF veya SVG
- Buyuk gorsel: 10 MB'dan buyuk JPG/PNG

Her testte sonucu `Gecti`, `Kaldi` veya `Engellendi` olarak kaydedin. P0 basarisizligi yayin oncesi engeldir.

## 2. P0 Hizli Kabul Turu   P0 > Geçti

| ID | Nerede | Ne yapilmali | Beklenen sonuc | 
| --- | --- | --- | --- |
| P0-01 | `/` | Ana sayfayi gizli pencerede acin. | Hero, header, makale alani ve footer hatasiz gorunur; kirik gorsel veya bos beyaz ekran yoktur. | geçti	
| P0-02 | `/login` | `admin@mail.com` ve dogru sifreyle giris yapin. | `/dashboard` acilir ve sol menude admin e-postasi gorunur. |  geçti
| P0-03 | `/dashboard/categories/new` | `QA Sulama` kategorisini olusturun. | Basari bildirimi gelir ve kategori listede gorunur. | geçti
| P0-04 | `/dashboard/posts/new` | QA makalesini once `Taslak` olarak kaydedin. | Makale admin listesinde `Taslak` etiketiyle gorunur. | geçti
| P0-05 | Gizli pencere `/` ve `/makaleler` | Taslak basligini arayin; dogrudan slug adresini de acin. | Taslak listelenmez, dogrudan adres 404 verir. | geçti
| P0-06 | Makale duzenleme | Durumu `Yayinla` yapip kaydedin. | Makale admin listesinde `Yayinda` olur. | geçti
| P0-07 | Gizli pencere `/` | Sayfayi yenileyin ve QA makalesini acin. | Makale beklemeden listelenir; baslik, gorsel, kategori ve icerik dogrudur. | geçti
| P0-08 | Makale detayi | Gecerli bir yorum ve puan gonderin. | Basari mesaji gelir; yorum public listede hemen gorunmez. | geçti
| P0-09 | `/dashboard/comments` | QA yorumunu onaylayin. | Durum `Onaylandi` olur; gizli pencerede yenileyince yorum gorunur. | geçti
| P0-10 | Admin menusu | Cikis yapin, sonra `/dashboard` adresini acin. | Oturum kapanir ve korumali rota `/login` sayfasina yonlenir. | geçti

## 3. Kimlik ve Yetki Testleri

Uygulama içi şifre kurtarma ve e-posta gönderme akışı ürün kapsamında değildir; login ekranında şifre unutma bağlantısı bulunmaz.

| ID | Oncelik | Nerede / Islem | Beklenen sonuc |
| --- | --- | --- | --- |
| AUTH-01 | P0 | Gizli pencerede dogrudan `/dashboard`, `/dashboard/posts/new` ve `/dashboard/profile` acin. | Her rota `/login` sayfasina yonlenir; admin icerigi bir an bile gorunmez. | geçti
| AUTH-02 | P0 | Yanlis sifreyle giris deneyin. | Dashboard acilmaz, anlasilir hata mesaji gorunur, buton tekrar kullanilabilir olur. | geçti
| AUTH-03 | P0 | Dogru admin hesabi ile giris yapin. | `/dashboard` acilir; sayfa yenilenince oturum devam eder. | geçti
| AUTH-04 | P1 | Supabase'te gecici `is_admin=false` kullanici olusturup giris deneyin. | Kullanici dashboard'a giremez; yetkisiz oturum sonlandirilir veya `/access-denied` gorunur. | geçti
| AUTH-05 | P1 | Admin oturumuyla `/login` adresini acin. | Sistem tekrar `/dashboard` sayfasina yonlendirir. | geçti
| AUTH-06 | P0 | Sol menuden `Cikis Yap` butonuna basin. | Oturum kapanir; geri tusu veya dogrudan URL ile dashboard acilmaz. | geçti

## 4. Dashboard ve Navigasyon

| ID | Oncelik | Islem | Beklenen sonuc |
| --- | --- | --- | --- |
| DASH-01 | P0 | Dashboard kartlarindaki toplam makale, taslak, yayin, kategori, yorum ve goruntulenme sayilarini listelerle karsilastirin. | Butun sayilar gercek verilerle aynidir. | geçti
| DASH-02 | P1 | `Yayinlanan`, `Taslak`, `Kategoriler` ve yorum kartlarina tiklayin. | Dogru yonetim sayfasi acilir; rota bozulmaz. | geçti
| DASH-03 | P1 | Hizli islemlerden yeni makale, kategori ve yorum ekranlarini acin. | Her buton dogru ekrana gider. | geçti
| DASH-04 | P1 | 390 px mobil genislikte menuyu acip tum bolumlere gecin. | Yan menu acilir/kapanir, overlay calisir, icerik menunun altinda kalmaz. | geçti
| DASH-05 | P2 | Browser refresh ve geri/ileri tuslarini farkli admin ekranlarinda deneyin. | Oturum ve aktif menu durumu tutarli kalir. | geçti

## 5. Kategori Yonetimi

| ID | Oncelik | Islem | Beklenen sonuc |
| --- | --- | --- | --- |
| CAT-01 | P0 | `QA Sulama` adini yazin. | Otomatik slug `qa-sulama` olur; Turkce karakterli isimlerde `c, g, i, o, s, u` donusumu dogrudur. | geçti
| CAT-02 | P1 | Otomatik modu kapatip `QA_Sulama!` yazin. | Kucuk harf/rakam/tire kurali nedeniyle form kaydolmaz ve alan hatasi gorunur. | geçti
| CAT-03 | P1 | 1 karakter ad ve 501 karakter aciklama deneyin. | Minimum ad ve maksimum aciklama hatalari gorunur. | geçti
| CAT-04 | P0 | Ayni slug ile ikinci kategori olusturun. | Kayit engellenir ve slug'in kullanildigi soylenir. | geçti
| CAT-05 | P0 | Kategori adini, slug'ini ve aciklamasini duzenleyin. | Liste ve public kategori sekmesi guncel degerleri gosterir. | geçti
| CAT-06 | P0 | Makale bagli kategoriyi silmeyi deneyin. | Silme engellenir; once makalelerin kategorisini degistirme mesaji gelir. | geçti
| CAT-07 | P1 | Bos ve hicbir makaleye bagli olmayan gecici kategoriyi silin; modalda once `Iptal`, sonra `Sil` deneyin. | Iptal veriyi korur; onayli silme kategoriyi kaldirir. | geçti

## 6. Makale Olusturma ve Duzenleme

### Temel form

| ID | Oncelik | Islem | Beklenen sonuc |
| --- | --- | --- | --- |
| POST-01 | P0 | Formu bos gonderin. | Baslik, ozet, kategori, kapak ve icerik alanlari icin hata gorunur; kayit olusmaz. |  geçti, direkt oluşturulamıyor
| POST-02 | P1 | 4 karakter baslik, 9 karakter ozet, 201 karakter baslik deneyin. | Tanımlanan sinirlar alan bazinda gosterilir. | geçti
| POST-03 | P1 | Basliga `Çiftçi İçin Ölçüm Rehberi` yazin. | Otomatik slug `ciftci-icin-olcum-rehberi` olur. | geçti
| POST-04 | P1 | Slug'i manuel moda alip buyuk harf, bosluk veya alt cizgi girin. | Kayit engellenir; yalniz kucuk harf, rakam ve tire mesaji gorunur. | geçti
| POST-05 | P0 | Ayni slug ile ikinci makale olusturun. | Ikinci kayit engellenir ve kullanilan slug mesaji gorunur. | geçti
| POST-06 | P0 | Kategori secmeden kaydetmeyi deneyin. | Kaydet butonu pasif veya form hatali olur; kategorisiz makale olusmaz. | geçti
| POST-07 | P1 | SEO basliginda 61, SEO aciklamasinda 161 karakter deneyin. | Form maksimum 60/160 karakter hatasi verir. | geçti
| POST-08 | P1 | `toprak, sulama, verimlilik` etiketlerini girin. | Kayit sonrasi detay sayfasinda uc ayri etiket gorunur. | etiket gözüküyor fakat yazarken virgül konulamıyor

### Gorsel ve editor

| ID | Oncelik | Islem | Beklenen sonuc |
| --- | --- | --- | --- |
| MEDIA-01 | P0 | Gecerli JPG/WebP kapak yukleyin. | Ilerleme, basari bildirimi ve onizleme gorunur; kayit sonrasi public kapak acilir. | geçti
| MEDIA-02 | P1 | PDF/SVG secin. | Yukleme baslamaz ve desteklenen format hatasi gorunur. | geçti
| MEDIA-03 | P1 | 10 MB'dan buyuk gorsel secin. | Yukleme reddedilir ve maksimum boyut mesaji gorunur. | geçti
| EDITOR-01 | P0 | Kalin, italik, ustu cizili, kod, liste, numarali liste, alinti ve ayirici ekleyin. | Kayit sonrasi public makalede bicimler korunur ve tasma yapmaz. | geçti
| EDITOR-02 | P1 | Secili metne `https://example.com` baglantisi ekleyin. | Link calisir; yeni hedefte guvenli `noopener/noreferrer` davranisi vardir. | geçti
| EDITOR-03 | P0 | Editor icine bir gorsel yukleyin. | Gorsel imlec konumunda belirir ve public detayda responsive gorunur. | geçti
| EDITOR-04 | P1 | Gecerli YouTube URL'si ekleyin. | Video bloga gomulur, oynar ve mobilde yatay tasma yapmaz. | geçti
| EDITOR-05 | P1 | Geri al/ileri al butonlarini ve `Ctrl+Z`/`Ctrl+Y` kisayollarini deneyin. | Editor icerigi beklenen sirayla geri/ileri gelir. | geçti
| EDITOR-06 | P1 | Yaklasik 200 ve 201 kelimelik iki icerik kaydedin. | Okuma suresi sirasiyla yaklasik 1 ve 2 dakika olur. |kaldı, kelime karakter sayısı ne kadar fazla olursa olsun 1dk sabit. dinamik yapı eksik.

### Yayin yasam dongusu

| ID | Oncelik | Islem | Beklenen sonuc |
| --- | --- | --- | --- |
| FLOW-01 | P0 | QA makalesini `Taslak` kaydedin. | Admin listesinde vardir; public ana sayfa, arsiv, arama, sitemap ve dogrudan slug'da yoktur. | geçti
| FLOW-02 | P0 | Taslagi `Yayinla` durumuna getirin. | Public sayfalarda gorunur, `published_at` doludur ve detay acilir. | geçti
| FLOW-03 | P0 | Yayindaki baslik, ozet, kategori ve kapagi degistirin. | Ana sayfa, arsiv ve detay yenilemeden sonra guncel veriyi gosterir; eski deger kalmaz. | geçti
| FLOW-04 | P0 | Yayindaki makaleyi tekrar taslaga alin. | Public listelerden kalkar, dogrudan URL 404 verir, `published_at` bosalir. | geçti
| FLOW-05 | P0 | Tekrar yayinlayin. | Yeni yayin tarihi atanir ve makale yeniden gorunur. | geçti
| FLOW-06 | P0 | Makale silme modalinda once iptal, sonra onay yapin. | Iptal kaydi korur; onay makaleyi ve bagli yorumlari kaldirir. | geçti
| FLOW-07 | P1 | Durum ve kategori filtrelerini tek tek ve birlikte deneyin. | Liste yalniz secilen kosullara uyan makaleleri gosterir; bos durum metni dogrudur. | geçti

## 7. Ziyaretci Deneyimi

### Ana sayfa ve arsiv

| ID | Oncelik | Islem | Beklenen sonuc |
| --- | --- | --- | --- |
| PUB-01 | P0 | Header'daki Ana Sayfa, Makaleler ve Hakkimda baglantilarini deneyin. | Dogru sayfalar acilir; mobil menude secimden sonra menu kapanir. | geçti
| PUB-02 | P0 | Aramayi baslik, ozet ve kategori kelimesiyle ayri ayri deneyin. | Buyuk/kucuk harf ve Turkce karakter farkindan etkilenmeden dogru kartlar gelir. | Geçti
| PUB-03 | P1 | Sonuc vermeyen bir arama yapin ve ana sayfada `Aramayi Temizle`ye basin. | Bos durum metni gorunur; temizleme tum yayinlari geri getirir. | geçti
| PUB-04 | P0 | Kategori sekmelerini ve `TUMU` secenegini deneyin. | Yalniz ilgili kategori kartlari gorunur; yatay mobil sekmeler kaydirilabilir. | geçti
| PUB-05 | P1 | En az 7 yayin varken `Daha Fazla Goster`e basin. | Ilk 6 karttan sonra 6'lik ek grup gelir; sayfa ziplama yapmaz. | geçti
| PUB-06 | P1 | One cikan konu kartina tiklayin. | `/makaleler?kategori=...` acilir ve ilgili kategori secili gelir. | geçti
| PUB-07 | P0 | Hero ve orta banner butonlarini deneyin. | Hero tanimli dahili/anchor hedefe, banner ilgili makaleye gider. | geçti
| PUB-08 | P1 | Footer e-posta, telefon ve sosyal baglantilarini deneyin. | `mailto:`/`tel:` dogrudur; sosyal baglantilar yeni sekmede acilir. | geçti
| PUB-09 | P1 | Header, makale ve footer yukari cik butonlarini uzun sayfada deneyin. | Kaydirma akici ve hedef dogrudur. | geçti

### Makale detayi

| ID | Oncelik | Islem | Beklenen sonuc |
| --- | --- | --- | --- |
| DETAIL-01 | P0 | Karttan makale detayina girin. | Kapak, baslik, ozet, kategori, tarih, okuma suresi, goruntulenme, icerik ve etiketler dogrudur. | geçti
| DETAIL-02 | P1 | Breadcrumb ana sayfa ve kategori baglantilarina basin. | Ana sayfa ve filtreli arsiv acilir. | geçti
| DETAIL-03 | P1 | `Linki Kopyala`ya basin ve panoya yapistirin. | Tam aktif makale URL'si kopyalanir ve bildirim gorunur. | geçti
| DETAIL-04 | P1 | Facebook ve Twitter paylasimlarini deneyin. | Dogru URL ve baslikla yeni paylasim penceresi acilir. |
| DETAIL-05 | P0 | Bilinmeyen slug ve taslak slug acin. | Uygun 404 ekrani gorunur; admin/taslak veri sizmaz. | geçti
| DETAIL-06 | P1 | Eski `/makale/slug` adresini acin. | Kalici olarak `/makaleler/slug` adresine yonlenir. | geçti
| DETAIL-07 | P1 | Ayni makaleyi ayni sekmede iki kez yenileyin, sonra yeni gizli sekmede acin. | Ayni oturum sekmesinde tek goruntulenme yazilir; yeni oturumda yeniden artar. UI sayaci 5 dakikalik cache nedeniyle gecikebilir, veritabanini ayrica kontrol edin. | geçti

## 8. Yorum ve Moderasyon

| ID | Oncelik | Islem | Beklenen sonuc |
| --- | --- | --- | --- |
| COM-01 | P1 | Isim 1 karakter, gecersiz e-posta ve yorum 9 karakter olacak sekilde gonderin. | Alan bazli dogrulama mesajlari gelir; kayit olusmaz. | geçti
| COM-02 | P1 | 1-5 arasindaki her yildiza tiklayin. | Secim ve `x / 5` metni ayni puani gosterir. | geçti
| COM-03 | P0 | Gecerli yorum gonderin. | Form temizlenir, basari mesaji gelir, yorum `pending` olur ve public listede gorunmez. | geçti
| COM-04 | P0 | Admin yorum aramasinda isim, e-posta, icerik ve makale basligini ayri ayri arayin. | Her sorgu dogru yorumu bulur; public tarafta e-posta hic gorunmez. | geçti
| COM-05 | P0 | Bekleyen yorumu onaylayin. | Sayaçlar guncellenir, onay zamani gorunur ve public detayda yorum belirir. | geçti
| COM-06 | P0 | Onayli yorumu reddedin. | Yorum public detaydan kalkar, admin tarafinda `Reddedildi` olur. | geçti
| COM-07 | P1 | Reddedilmis yorumu tekrar onaylayin. | Yorum yeniden public olur ve onay zamani yenilenir. | geçti
| COM-08 | P0 | Silme modalinda iptal ve onayi deneyin. | Iptal veriyi korur; onay yorumu ve sayacini kalici olarak azaltir. | geçti
| COM-09 | P1 | `Tumu`, `Bekleyen`, `Onaylanan`, `Reddedilen` filtrelerini aramayla birlikte kullanin. | Filtre ve arama birlikte dogru sonuc verir. | geçti

## 9. Hero ve Profil  (hakkımda sayfası profil olarak gösterilecek ve alttaki profile kısmına göre olacak)

| ID | Oncelik | Islem | Beklenen sonuc |
| --- | --- | --- | --- |
| HERO-01 | P0 | Baslik, alt baslik, buton yazisi, `#posts` linki ve etiketi degistirip kaydedin. | Kaydet butonu yalniz degisiklikten sonra aktif olur; ana sayfa hemen yeni degerleri gosterir. | geçti
| HERO-02 | P1 | Minimumdan kisa ve maksimumdan uzun metinler deneyin. | Alan sinirlari kaydi engeller ve acik mesaj verir. | geçti
| HERO-03 | P0 | Yeni JPG/WebP hero gorseli yukleyip kaydedin. | Onizleme ve ana sayfa ayni yeni gorseli gosterir; mobil/masaustunda dogru kirpilir. | geçti
| HERO-04 | P1 | Hero linkini `/makaleler`, `#posts` ve gecerli harici HTTPS URL ile ayri ayri deneyin. | Dahili hedef ayni sekmede, harici hedef guvenli yeni sekmede acilir. | geçti
| PROFILE-01 | P0 | Isim, meslek, biyografi, telefon ve profil fotografini guncelleyin. | `/hakkimda` ve footer yenileme sonrasi ayni bilgileri gosterir. | geçti
| PROFILE-02 | P1 | Gecersiz sosyal URL ve 1 karakter isim girin. | Form kaydolmaz; ilgili alan hatasi gorunur. | geçti
| PROFILE-03 | P1 | Instagram, Facebook, Twitter ve LinkedIn URL'lerini kaydedip footer'da tiklayin. | Yalniz dolu platformlar gorunur ve yeni sekmede dogru adrese gider. | geçti
| PROFILE-04 | P1 | Profil fotografini degistirin. | Yeni fotograf public sayfada gorunur; eski dosya `profiles` bucket'indan temizlenir. | geçti
| PROFILE-05 | P1 | Opsiyonel alanlari temizleyip kaydedin. | Bos degerler public sayfada bos blok veya kirik link olusturmaz. | geçti

## 10. SEO, Guvenlik ve Veri Gizliligi

| ID | Oncelik | Kontrol | Beklenen sonuc |
| --- | --- | --- | --- |
| SEO-01 | P0 | Makale detayinda sayfa kaynagi/Elements ile `title`, description, canonical ve Open Graph alanlarini inceleyin. | SEO formundaki degerler, canonical `/makaleler/slug` ve kapak gorseli dogrudur. |
| SEO-02 | P1 | `/sitemap.xml` acin. | Sabit public sayfalar ve yalniz yayinlanmis makaleler vardir; taslaklar yoktur. |
| SEO-03 | P1 | `/robots.txt` acin. | Dashboard ve login rotalari engellidir; sitemap adresi dogrudur. |
| SEC-01 | P0 | Gizli pencerede Supabase REST veya uygulama uzerinden taslak makale ve bekleyen yorum okumayi deneyin. | RLS istegi engeller veya bos sonuc doner. |
| SEC-02 | P0 | Gecici non-admin authenticated hesapla post/kategori/site_content yazma ve Storage yukleme deneyin. | Islem RLS tarafindan reddedilir. |
| SEC-03 | P0 | Public yorum gorunumunu ve Network yanitini inceleyin. | `author_email` public HTML veya sorgu yanitinda bulunmaz. |
| SEC-04 | P1 | Test ortaminda makale HTML'ine `<script>alert(1)</script>` ve `javascript:` link ekleyin. | Script calismaz, tehlikeli protokol render edilmez; normal HTML korunur. |
| SEC-05 | P1 | Oturum cookie'sini silip acik dashboard sekmesini yenileyin. | Admin verisi yuklenmez ve login sayfasina donulur. |

## 11. Mobil, Erisilebilirlik ve Hata Durumlari

| ID | Oncelik | Kontrol | Beklenen sonuc |
| --- | --- | --- | --- |
| UI-01 | P0 | Tum public ve admin sayfalarini 360 px genislikte gezin. | Yatay sayfa kaymasi, ust uste binen metin, kesilen buton veya erisilemeyen islem yoktur. | geçti
| UI-02 | P1 | 200% browser zoom ile login, admin formlari, makale detayi ve yorum ekranini kullanin. | Metin ve kontroller tasmaz; temel islemler tamamlanabilir. |geçti
| UI-03 | P1 | Yalniz klavye ile header, formlar, editor toolbar, modallar ve menude gezin. | Fokus sirasi mantikli, fokus gorunur ve Enter/Space islemleri calisir. | geçti
| UI-04 | P1 | Gorseller yuklenirken sayfayi gozlemleyin. | Buyuk layout kaymasi olmaz; gorseller oranini korur. | geçti
| ERR-01 | P1 | Network'u `Offline` yapip yorum, kaydetme ve gorsel yukleme deneyin. | Hata mesaji gorunur; yukleme durumu sonsuza kadar kalmaz; tekrar deneme mumkundur. |geçti
| ERR-02 | P1 | Kaydet/yorum/onay butonuna hizla birden cok tiklayin. | Tek kayit/tek islem olusur; islem sirasinda buton pasiftir. | geçti
| ERR-03 | P2 | Supabase'e gecici erisim sorunu varken public ana sayfayi acin. | Uygulama tamamen cokmez; hero yerel yedegi ve guvenli bos durumlar gorunur. |geçti

## 12. Performans Kabul Turu
 GEÇTİ
Production build ile (`npm run build` ve `npm start`) Chrome Lighthouse mobil testi yapin.

- Ana sayfa, arsiv ve bir makale detayini ayri ayri test edin.
- Hedef: Performance 85+, Accessibility 90+, Best Practices 90+, SEO 90+.
- LCP icin 2.5 saniye, CLS icin 0.1, INP icin 200 ms altini pratik kabul hedefi olarak kullanin.
- Network panelinde 404/500, tekrar tekrar yuklenen ayni gorsel, cok buyuk kapak dosyasi ve gereksiz admin istegi bulunmamalidir.
- Ilk yuklemede hero/kapak gorselinin WebP/AVIF varyanti ve dogru responsive boyutu geldigini kontrol edin.
- Public sayfalarda console error, hydration warning veya React key uyarisi olmamalidir.

## 13. Supabase Dogrulama Sorgulari

Kritik UI adimlarindan sonra SQL Editor'de asagidaki salt-okunur sorgularla durumu kontrol edebilirsiniz:

```sql
SELECT title, slug, status, published_at, reading_time, views, featured, tags
FROM public.posts
WHERE slug = 'qa-damla-sulama-rehberi';

SELECT author_name, author_email, status, rating, approved_at
FROM public.comments
WHERE author_email = 'qa-ziyaretci@example.com'
ORDER BY created_at DESC;

SELECT name, email, is_admin, profession, phone, avatar_url
FROM public.profiles
WHERE lower(email) = lower('admin@mail.com');

SELECT key, type, data, updated_at
FROM public.site_content
WHERE key = 'hero';
```

## 14. Duzeltmeler Sonrasi Ozel Tekrar Testleri

Asagidaki noktalar son duzeltmelerden sonra ozellikle tekrar kontrol edilmelidir:

1. `Bu makaleyi one cikar` alanini bir yayinlanmis makalede isaretleyin. Ana sayfadaki orta banner isaretli makaleyi gostermelidir; isaretli makale yoksa en yeni yayin geri donus olarak kullanilmalidir.
2. Hero gorselini kaldirip formu kaydetmeden sayfadan cikin. Public hero eski gorseli gostermeye devam etmelidir. Islemi kaydederek tekrarladiginizda eski dosya ancak kayit basarili olduktan sonra silinmelidir.
3. Makale kapagi veya editor gorseli yukleyip formu iptal etmek Storage'da sahipsiz dosya birakabilir. Test sonunda `posts` bucket'ini kontrol edin.
4. Goruntulenme veritabaninda hemen artar; public UI 5 dakikalik cache nedeniyle eski sayiyi gecici olarak gosterebilir.

## 15. Test Sonu Temizlik ve Yayin Karari

1. QA yorumunu kalici olarak silin.
2. QA makalesini silin ve public URL'nin 404 verdigini kontrol edin.
3. Artik makale bagli olmayan QA kategorisini silin.
4. Gecici non-admin Auth kullanicisini silin.
5. `posts`, `profiles` ve `general` Storage bucket'larinda testten kalan sahipsiz dosyalari temizleyin.
6. Hero ve profil alanlarini gercek yayin degerlerine geri getirin.
7. Son kez `npm run check` calistirin.

Yayin karari: Butun P0 testleri gecmeli; P1 hatalari icin etki ve gecici cozum yazilmali; P2 bulgulari sonraki surume planlanabilir.
