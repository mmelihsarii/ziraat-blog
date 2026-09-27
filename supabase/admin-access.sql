-- Dosyanın görevi: admin@mail.com hesabına kimliği doğrulanmış biçimde yönetici yetkisi verir.
-- Kullanıldığı yerler: İlk kurulumda Supabase SQL Editor içinde postgres rolüyle bir kez çalıştırılır.
BEGIN;

DO $$
DECLARE
    target_user auth.users%ROWTYPE;
BEGIN
    SELECT * INTO target_user
    FROM auth.users
    WHERE lower(email) = lower('admin@mail.com')
    LIMIT 1;

    IF target_user.id IS NULL THEN
        RAISE EXCEPTION 'Authentication kullanıcısı bulunamadı: admin@mail.com';
    END IF;

    INSERT INTO public.profiles (id, name, email, is_admin)
    VALUES (
        target_user.id,
        COALESCE(NULLIF(target_user.raw_user_meta_data ->> 'name', ''), split_part(target_user.email, '@', 1)),
        target_user.email,
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        is_admin = true;
END $$;

COMMIT;

-- Çıktıda yalnız beklediğiniz hesapların yönetici olduğunu kontrol edin.
SELECT p.id, p.name, p.email, p.is_admin
FROM public.profiles AS p
WHERE p.is_admin = true
ORDER BY p.email;
