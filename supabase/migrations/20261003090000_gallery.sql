-- Dosyanın görevi: Güvenli fotoğraf/video galerisi için medya alanlarını, RLS kurallarını ve Storage kovasını ekler.
-- Kullanıldığı yerler: Mevcut Supabase projesinde SQL Editor veya migration komutuyla bir kez çalıştırılır.

BEGIN;

ALTER TABLE public.media ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS poster_url TEXT;
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS width INTEGER;
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS height INTEGER;
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS duration_seconds NUMERIC(10, 2);
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.media DROP CONSTRAINT IF EXISTS media_bucket_valid;
ALTER TABLE public.media ADD CONSTRAINT media_bucket_valid
    CHECK (bucket IN ('posts', 'profiles', 'general', 'gallery'));
ALTER TABLE public.media DROP CONSTRAINT IF EXISTS media_description_length;
ALTER TABLE public.media ADD CONSTRAINT media_description_length
    CHECK (description IS NULL OR char_length(description) <= 600);
ALTER TABLE public.media DROP CONSTRAINT IF EXISTS media_dimensions_positive;
ALTER TABLE public.media ADD CONSTRAINT media_dimensions_positive
    CHECK ((width IS NULL OR width > 0) AND (height IS NULL OR height > 0));
ALTER TABLE public.media DROP CONSTRAINT IF EXISTS media_duration_positive;
ALTER TABLE public.media ADD CONSTRAINT media_duration_positive
    CHECK (duration_seconds IS NULL OR duration_seconds >= 0);
ALTER TABLE public.media DROP CONSTRAINT IF EXISTS media_sort_order_positive;
ALTER TABLE public.media ADD CONSTRAINT media_sort_order_positive CHECK (sort_order >= 0);

CREATE INDEX IF NOT EXISTS idx_media_gallery_public
    ON public.media(sort_order DESC, created_at DESC)
    WHERE published = true AND bucket = 'gallery';

DROP TRIGGER IF EXISTS trigger_media_updated_at ON public.media;
CREATE TRIGGER trigger_media_updated_at
    BEFORE UPDATE ON public.media
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "media_anon_select" ON public.media;
CREATE POLICY "media_anon_select" ON public.media
    FOR SELECT TO anon
    USING (published = true AND bucket = 'gallery');

DROP POLICY IF EXISTS "media_admin_all" ON public.media;
CREATE POLICY "media_admin_all" ON public.media
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'gallery',
    'gallery',
    true,
    52428800,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "gallery_anon_select" ON storage.objects;
CREATE POLICY "gallery_anon_select" ON storage.objects
    FOR SELECT TO anon USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "gallery_admin_insert" ON storage.objects;
CREATE POLICY "gallery_admin_insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'gallery' AND public.is_admin());

DROP POLICY IF EXISTS "gallery_admin_update" ON storage.objects;
CREATE POLICY "gallery_admin_update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'gallery' AND public.is_admin())
    WITH CHECK (bucket_id = 'gallery' AND public.is_admin());

DROP POLICY IF EXISTS "gallery_admin_delete" ON storage.objects;
CREATE POLICY "gallery_admin_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'gallery' AND public.is_admin());

GRANT SELECT ON public.media TO anon;
GRANT ALL ON public.media TO authenticated;

COMMIT;
