# Duzeltmeler Sonrasi Manuel Tekrar Testi

Bu tur yalnizca son testte eksik bulunan akislar ve onlarla baglantili kritik davranislar icindir.

## Test Oncesi

1. Supabase SQL Editor'de guncel `supabase-migration.sql` dosyasinin tamamini bir kez calistirin. Dosya tekrar calistirilabilir yapidadir.
2. Ortam degiskenlerinden sonra gelistirme sunucusunu yeniden baslatin.

## POST-08 - Coklu Etiket

1. Yeni makalede etiket alanina `toprak, sulama, verimlilik` yazin.
2. Virgulden sonra onceki degerin ayri etikete donustugunu kontrol edin.
3. Ayni degerleri tek seferde yapistirarak tekrar deneyin.
4. `Enter` ile etiket ekleyin, `Backspace` ve carpi butonuyla etiketi silin.
5. Ayni etiketi farkli buyuk/kucuk harfle tekrar eklemeyi deneyin.
6. Kaydedip makale detayini acin.

Beklenen: Uc ayri etiket gorunur; kopya etiket olusmaz ve her etiket bagimsiz silinebilir.

## EDITOR-06 - Dinamik Okuma Suresi

1. Editor alanina tam 200 gercek kelime girin; arac cubugunun altindaki tahmini sureyi kontrol edin.
2. Bir kelime daha ekleyerek 201 kelimeye cikarin.
3. Iki surumu ayri ayri kaydedip public makale detayinda kontrol edin.

Beklenen: 200 kelime `1 dk`, 201 kelime `2 dk` olur. HTML etiketleri kelime sayilmaz. Mevcut kisa test makalelerinin hepsi 200 kelimenin altinda oldugu icin `1 dk` gostermeleri dogrudur.

## PROFILE-01 - Hakkimda ve Profil Butunlugu

1. `/dashboard/profile` ekraninda ad, meslek, biyografi, telefon, avatar ve sosyal baglantilari degistirin.
2. Kaydedip oturumsuz pencerede `/hakkimda` sayfasini acin.
3. Header ve footer ile tasarim dilinin bozulmadigini kontrol edin.
4. E-posta, telefon ve sosyal baglantilara tiklayin.

Beklenen: Hakkimda sayfasi sabit metin kullanmaz; yonetim panelindeki profilin guncel degerlerini ve yalnizca dolu iletisim alanlarini gosterir.

## HOME-01 - One Cikan Makale

1. Yayinlanmis bir makalede `Bu makaleyi one cikar` secenegini acin.
2. Ana sayfayi gizli pencerede yenileyin.
3. Secenegi tum makalelerde kapatip tekrar deneyin.

Beklenen: Orta banner once isaretli yayinlanmis makaleyi, hicbiri isaretli degilse en yeni yayinlanmis makaleyi gosterir.

## HERO-01 - Gorsel Kayit Guvenligi

1. Hero gorselini kaldirin fakat kaydetmeden sayfadan cikin.
2. Public ana sayfayi acin.
3. Hero gorselini kaldirma islemini bu kez kaydedin.

Beklenen: Kaydedilmeyen islem public gorseli bozmaz; eski dosya ancak basarili kayittan sonra Storage'dan silinir.
