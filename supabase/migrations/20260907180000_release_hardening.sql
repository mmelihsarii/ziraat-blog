-- Dosyanın görevi: Supabase şemasını, veri erişim kurallarını ve güvenli geçiş adımlarını tanımlar.
-- Kullanıldığı yerler: Supabase SQL Editor veya migration komutuyla çalıştırılır.

-- Yayın öncesi erişim düzeltmesi. Supabase SQL Editor'da postgres rolüyle çalıştırılır.
-- Mevcut profil, makale, yorum ve admin yetkilerini silmez/değiştirmez.
BEGIN;

-- RLS içinden profiles tablosunu yeniden RLS ile okumamak için dar kapsamlı
-- SECURITY DEFINER kullanılır. Dışarıya yalnız yayımlanan profilin UUID'si çıkar.
CREATE OR REPLACE FUNCTION public.get_public_profile_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
    SELECT p.id
    FROM public.profiles AS p
    WHERE p.is_admin = true
    ORDER BY
        COALESCE(p.id::text = (
            SELECT s.data ->> 'profile_id'
            FROM public.site_content AS s WHERE s.key = 'about_profile'
        ), false) DESC,
        p.updated_at DESC,
        p.id ASC
    LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_profile_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_profile_id() TO anon, authenticated;

-- Hakkımda'da seçilen tek profil görünür. Seçim yoksa son güncellenen yönetici
-- kullanılır; publicService.getPublicProfile aynı sıralamayı uygular.
DROP POLICY IF EXISTS "profiles_anon_select" ON public.profiles;
CREATE POLICY "profiles_anon_select" ON public.profiles
    FOR SELECT TO anon
    USING (id = (SELECT public.get_public_profile_id()));

-- Yeni hesap yönetici olamaz. İlk yöneticiyi de işletmeci açıkça seçer.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, is_admin)
    VALUES (
        NEW.id,
        COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'name', ''), split_part(NEW.email, '@', 1)),
        NEW.email,
        false
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
COMMENT ON FUNCTION public.handle_new_user IS 'Yeni kimlik hesabına yönetici olmayan profil oluşturur.';
COMMENT ON FUNCTION public.get_public_profile_id IS 'Ziyaretçiye açılan tek Hakkımda profilinin kimliğini döndürür.';

COMMIT;
