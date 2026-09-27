-- Dosyanın görevi: Kullanımdan kaldırılan uygulama içi şifre sıfırlama altyapısını veritabanından temizler.
-- Kullanıldığı yerler: Mevcut Supabase kurulumlarında SQL Editor veya migration komutuyla bir kez çalıştırılır.

BEGIN;

DROP FUNCTION IF EXISTS public.consume_password_reset_attempt(TEXT, INTEGER, INTEGER);
DROP TABLE IF EXISTS public.password_reset_attempts;

COMMIT;
