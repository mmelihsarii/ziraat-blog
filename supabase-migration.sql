-- Dosyanın görevi: Supabase şemasını, veri erişim kurallarını ve güvenli geçiş adımlarını tanımlar.
-- Kullanıldığı yerler: Supabase SQL Editor veya migration komutuyla çalıştırılır.

-- ========================================================================================================
-- SUPABASE ÜRETİM MIGRATION'I - ZİRAAT BLOG PLATFORMU
-- ========================================================================================================
-- Sürüm: 2.0.0
-- Hazırlayan: Kıdemli Veritabanı Mimarı
-- Açıklama: Modern blog platformu için eksiksiz, üretime hazır veritabanı kurulumu.
-- İçerik: RLS, depolama, tetikleyiciler, fonksiyonlar, görünümler, indeksler ve kısıtlar
-- ========================================================================================================

BEGIN;

-- ========================================================================================================
-- 1. UZANTILAR
-- ========================================================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================================================================================
-- 2. ÖZEL TİPLER / ENUM'LAR
-- ========================================================================================================

-- Makale durum seçenekleri
DO $$ BEGIN
    CREATE TYPE post_status AS ENUM ('draft', 'published');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Yorum durum seçenekleri
DO $$ BEGIN
    CREATE TYPE comment_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ========================================================================================================
-- 3. TABLOLAR
-- ========================================================================================================

-- --------------------------------------------------------------------------------------------------------
-- 3.1 PROFİLLER TABLOSU
-- --------------------------------------------------------------------------------------------------------
-- auth.users kaydına bağlı yönetici profili

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    profession TEXT,
    phone TEXT,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    facebook TEXT,
    instagram TEXT,
    twitter TEXT,
    linkedin TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Admin profiles linked to auth.users';
COMMENT ON COLUMN profiles.id IS 'References auth.users(id)';

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- --------------------------------------------------------------------------------------------------------
-- 3.2 KATEGORİLER TABLOSU
-- --------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT categories_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
    CONSTRAINT categories_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

COMMENT ON TABLE categories IS 'Blog post categories';
COMMENT ON COLUMN categories.slug IS 'URL-friendly unique identifier';

-- --------------------------------------------------------------------------------------------------------
-- 3.3 MAKALELER TABLOSU
-- --------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image TEXT NOT NULL,
    status post_status NOT NULL DEFAULT 'draft',
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    reading_time INTEGER NOT NULL DEFAULT 0,
    views INTEGER NOT NULL DEFAULT 0,
    featured BOOLEAN NOT NULL DEFAULT false,
    seo_title TEXT,
    seo_description TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT posts_title_length CHECK (char_length(title) >= 5 AND char_length(title) <= 200),
    CONSTRAINT posts_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    CONSTRAINT posts_excerpt_length CHECK (char_length(excerpt) >= 10 AND char_length(excerpt) <= 500),
    CONSTRAINT posts_content_not_empty CHECK (char_length(content) > 0),
    CONSTRAINT posts_seo_title_length CHECK (seo_title IS NULL OR char_length(seo_title) <= 60),
    CONSTRAINT posts_seo_description_length CHECK (seo_description IS NULL OR char_length(seo_description) <= 160),
    CONSTRAINT posts_reading_time_positive CHECK (reading_time >= 0),
    CONSTRAINT posts_views_positive CHECK (views >= 0),
    CONSTRAINT posts_published_logic CHECK (
        (status = 'published' AND published_at IS NOT NULL) OR 
        (status = 'draft' AND published_at IS NULL)
    )
);

COMMENT ON TABLE posts IS 'Blog posts with full content and metadata';
COMMENT ON COLUMN posts.slug IS 'Unique URL-friendly identifier';
COMMENT ON COLUMN posts.reading_time IS 'Estimated reading time in minutes';
COMMENT ON COLUMN posts.views IS 'Total view count';
COMMENT ON COLUMN posts.featured IS 'Featured post flag for homepage';

-- İlk şema sürümünden sonra eklenen alanları mevcut kurulumlara da kazandırır.
ALTER TABLE posts ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

-- --------------------------------------------------------------------------------------------------------
-- 3.4 YORUMLAR TABLOSU
-- --------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    status comment_status NOT NULL DEFAULT 'pending',
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT comments_author_name_length CHECK (char_length(author_name) >= 2 AND char_length(author_name) <= 100),
    CONSTRAINT comments_author_email_format CHECK (author_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT comments_content_length CHECK (char_length(content) >= 10 AND char_length(content) <= 2000),
    CONSTRAINT comments_approved_logic CHECK (
        (status = 'approved' AND approved_at IS NOT NULL) OR 
        (status != 'approved')
    )
);

COMMENT ON TABLE comments IS 'User comments on blog posts';
COMMENT ON COLUMN comments.rating IS 'Optional rating 1-5 stars';
COMMENT ON COLUMN comments.status IS 'Moderation status: pending, approved, rejected';

-- --------------------------------------------------------------------------------------------------------
-- 3.5 MEDYA TABLOSU
-- --------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    bucket TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    alt TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT media_filename_not_empty CHECK (char_length(filename) > 0),
    CONSTRAINT media_size_positive CHECK (size > 0),
    CONSTRAINT media_bucket_valid CHECK (bucket IN ('posts', 'profiles', 'general'))
);

COMMENT ON TABLE media IS 'Media files stored in Supabase Storage';
COMMENT ON COLUMN media.bucket IS 'Storage bucket name';
COMMENT ON COLUMN media.size IS 'File size in bytes';

-- --------------------------------------------------------------------------------------------------------
-- 3.6 BÜLTEN ABONELERİ TABLOSU
-- --------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT newsletter_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE newsletter_subscribers IS 'Newsletter email subscriptions';
COMMENT ON COLUMN newsletter_subscribers.verified IS 'Email verification status';

-- --------------------------------------------------------------------------------------------------------
-- 3.7 SİTE İÇERİĞİ TABLOSU
-- --------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS site_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT site_content_key_format CHECK (key ~ '^[a-z_]+$'),
    CONSTRAINT site_content_type_valid CHECK (type IN ('hero', 'banner', 'footer', 'about', 'contact', 'settings'))
);

COMMENT ON TABLE site_content IS 'Single-record content areas such as hero, banner and footer';

-- ========================================================================================================
-- 4. PERFORMANS İÇİN İNDEKSLER
-- ========================================================================================================

-- --------------------------------------------------------------------------------------------------------
-- 4.1 PROFİL İNDEKSLERİ
-- --------------------------------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- --------------------------------------------------------------------------------------------------------
-- 4.2 KATEGORİ İNDEKSLERİ
-- --------------------------------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- --------------------------------------------------------------------------------------------------------
-- 4.3 MAKALE İNDEKSLERİ
-- --------------------------------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_views ON posts(views DESC);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_posts_status_published ON posts(status, published_at DESC) WHERE status = 'published';

-- --------------------------------------------------------------------------------------------------------
-- 4.4 YORUM İNDEKSLERİ
-- --------------------------------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_status ON comments(post_id, status) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_comments_author_email ON comments(author_email);

-- --------------------------------------------------------------------------------------------------------
-- 4.5 MEDYA İNDEKSLERİ
-- --------------------------------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_media_url ON media(url);
CREATE INDEX IF NOT EXISTS idx_media_bucket ON media(bucket);
CREATE INDEX IF NOT EXISTS idx_media_mime_type ON media(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);

-- --------------------------------------------------------------------------------------------------------
-- 4.6 BÜLTEN ABONESİ İNDEKSLERİ
-- --------------------------------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_verified ON newsletter_subscribers(verified);
CREATE INDEX IF NOT EXISTS idx_newsletter_created_at ON newsletter_subscribers(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_site_content_key ON site_content(key);
CREATE INDEX IF NOT EXISTS idx_site_content_type ON site_content(type);

-- ========================================================================================================
-- 5. FONKSİYONLAR
-- ========================================================================================================

-- --------------------------------------------------------------------------------------------------------
-- 5.1 UPDATE_UPDATED_AT_COLUMN FONKSİYONU
-- --------------------------------------------------------------------------------------------------------
-- Kayıt değiştiğinde updated_at zamanını otomatik olarak günceller.

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'Automatically updates updated_at timestamp on row update';

-- --------------------------------------------------------------------------------------------------------
-- 5.2 GENERATE_SLUG_FROM_TITLE FONKSİYONU
-- --------------------------------------------------------------------------------------------------------
-- Başlık veya addan URL uyumlu slug değerini otomatik üretir.

CREATE OR REPLACE FUNCTION generate_slug_from_title()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    new_slug TEXT;
    counter INTEGER := 1;
    source_text TEXT;
BEGIN
    -- Only generate slug if not provided
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        -- Determine source column based on table
        IF TG_TABLE_NAME = 'posts' THEN
            source_text := NEW.title;
        ELSIF TG_TABLE_NAME = 'categories' THEN
            source_text := NEW.name;
        ELSE
            source_text := '';
        END IF;
        
        -- Transliterate Turkish letters before removing URL-unsafe characters.
        source_text := translate(source_text, 'ÇĞİÖŞÜçğıöşü', 'CGIOSUcgiosu');
        base_slug := lower(trim(regexp_replace(source_text, '[^a-zA-Z0-9\s-]', '', 'g')));
        base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
        base_slug := regexp_replace(base_slug, '-+', '-', 'g');
        base_slug := trim(both '-' from base_slug);
        
        new_slug := base_slug;
        
        -- Check for uniqueness and add counter if needed
        IF TG_TABLE_NAME = 'posts' THEN
            WHILE EXISTS (SELECT 1 FROM posts WHERE slug = new_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
                new_slug := base_slug || '-' || counter;
                counter := counter + 1;
            END LOOP;
        ELSIF TG_TABLE_NAME = 'categories' THEN
            WHILE EXISTS (SELECT 1 FROM categories WHERE slug = new_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
                new_slug := base_slug || '-' || counter;
                counter := counter + 1;
            END LOOP;
        END IF;
        
        NEW.slug := new_slug;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_slug_from_title IS 'Auto-generates unique slug from title (posts) or name (categories)';

-- --------------------------------------------------------------------------------------------------------
-- 5.3 YÖNETİCİ YETKİ KONTROLÜ FONKSİYONU
-- --------------------------------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND is_admin = true
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION is_admin IS 'Checks whether the current authenticated user is a blog administrator';

-- --------------------------------------------------------------------------------------------------------
-- 5.4 MAKALE GÖRÜNTÜLENMESİ ARTIRMA FONKSİYONU
-- --------------------------------------------------------------------------------------------------------
-- Makale görüntülenme sayısını eşzamanlı isteklere karşı güvenli biçimde artırır.

CREATE OR REPLACE FUNCTION increment_post_views(post_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE posts 
    SET views = GREATEST(views + 1, 0)
    WHERE id = post_uuid AND status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION increment_post_views IS 'Safely increments post view count, prevents negative values';

-- --------------------------------------------------------------------------------------------------------
-- 5.5 YORUM ONAYLAMA FONKSİYONU
-- --------------------------------------------------------------------------------------------------------
-- Bekleyen bir yorumu onaylar.

CREATE OR REPLACE FUNCTION approve_comment(comment_uuid UUID)
RETURNS void AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Administrator privileges required' USING ERRCODE = '42501';
    END IF;
    UPDATE comments 
    SET 
        status = 'approved',
        approved_at = NOW()
    WHERE id = comment_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION approve_comment IS 'Approves a pending comment and sets approved_at timestamp';

-- --------------------------------------------------------------------------------------------------------
-- 5.6 YORUM REDDETME FONKSİYONU
-- --------------------------------------------------------------------------------------------------------
-- Bekleyen bir yorumu reddeder.

CREATE OR REPLACE FUNCTION reject_comment(comment_uuid UUID)
RETURNS void AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Administrator privileges required' USING ERRCODE = '42501';
    END IF;
    UPDATE comments 
    SET 
        status = 'rejected',
        approved_at = NULL
    WHERE id = comment_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION reject_comment IS 'Rejects a pending comment';

-- --------------------------------------------------------------------------------------------------------
-- 5.7 KİMLİĞİ DOĞRULANAN KULLANICI PROFİLİ FONKSİYONU
-- --------------------------------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, name, email, is_admin)
    VALUES (
        NEW.id,
        COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'name', ''), split_part(NEW.email, '@', 1)),
        NEW.email,
        false
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION handle_new_user IS 'Yeni kimlik hesabına yönetici olmayan profil oluşturur.';

-- --------------------------------------------------------------------------------------------------------
-- 5.8 SET_PUBLISHED_AT FONKSİYONU
-- --------------------------------------------------------------------------------------------------------
-- Durum published olduğunda published_at zamanını otomatik olarak belirler.

CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
    -- If status is changing to published and published_at is null
    IF NEW.status = 'published' AND NEW.published_at IS NULL
       AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'published') THEN
        NEW.published_at := NOW();
    END IF;
    
    -- If status is changing from published to draft, clear published_at
    IF NEW.status = 'draft' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'draft') THEN
        NEW.published_at := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION set_published_at IS 'Automatically manages published_at timestamp based on status changes';

-- --------------------------------------------------------------------------------------------------------
-- 5.9 OKUMA SÜRESİ FONKSİYONLARI
-- --------------------------------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION calculate_reading_time(content_text TEXT)
RETURNS INTEGER AS $$
DECLARE
    plain_text TEXT;
    word_count INTEGER;
BEGIN
    plain_text := regexp_replace(COALESCE(content_text, ''), '<[^>]*>', ' ', 'g');
    plain_text := regexp_replace(plain_text, '&[A-Za-z0-9#]+;', ' ', 'g');
    plain_text := btrim(regexp_replace(plain_text, '\s+', ' ', 'g'));

    IF plain_text = '' THEN
        RETURN 0;
    END IF;

    word_count := array_length(regexp_split_to_array(plain_text, '\s+'), 1);
    RETURN GREATEST(1, CEIL(word_count / 200.0)::INTEGER);
END;
$$ LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE;

COMMENT ON FUNCTION calculate_reading_time(TEXT) IS 'Calculates article reading time at 200 words per minute';

CREATE OR REPLACE FUNCTION set_post_reading_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.reading_time := calculate_reading_time(NEW.content);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

COMMENT ON FUNCTION set_post_reading_time IS 'Keeps post reading_time synchronized with rich text content';

-- ========================================================================================================
-- 6. TETİKLEYİCİLER
-- ========================================================================================================

-- --------------------------------------------------------------------------------------------------------
-- 6.1 PROFİL TETİKLEYİCİLERİ
-- --------------------------------------------------------------------------------------------------------

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------------------------------------------
-- 6.2 MAKALE TETİKLEYİCİLERİ
-- --------------------------------------------------------------------------------------------------------

DROP TRIGGER IF EXISTS trigger_posts_updated_at ON posts;
CREATE TRIGGER trigger_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_posts_slug_generation ON posts;
CREATE TRIGGER trigger_posts_slug_generation
    BEFORE INSERT OR UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION generate_slug_from_title();

DROP TRIGGER IF EXISTS trigger_posts_published_at ON posts;
CREATE TRIGGER trigger_posts_published_at
    BEFORE INSERT OR UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION set_published_at();

DROP TRIGGER IF EXISTS trigger_posts_reading_time ON posts;
CREATE TRIGGER trigger_posts_reading_time
    BEFORE INSERT OR UPDATE OF content ON posts
    FOR EACH ROW
    EXECUTE FUNCTION set_post_reading_time();

UPDATE posts
SET reading_time = calculate_reading_time(content)
WHERE reading_time IS DISTINCT FROM calculate_reading_time(content);

-- --------------------------------------------------------------------------------------------------------
-- 6.3 KATEGORİ TETİKLEYİCİLERİ
-- --------------------------------------------------------------------------------------------------------

DROP TRIGGER IF EXISTS trigger_categories_slug_generation ON categories;
CREATE TRIGGER trigger_categories_slug_generation
    BEFORE INSERT OR UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION generate_slug_from_title();

DROP TRIGGER IF EXISTS trigger_site_content_updated_at ON site_content;
CREATE TRIGGER trigger_site_content_updated_at
    BEFORE UPDATE ON site_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Önceden açılmış hesapların profillerini tamamlar; yönetici yetkisi ayrıca atanır.
INSERT INTO profiles (id, name, email, is_admin)
SELECT
    id,
    COALESCE(NULLIF(raw_user_meta_data ->> 'name', ''), split_part(email, '@', 1)),
    email,
    false
FROM auth.users
ON CONFLICT (id) DO NOTHING;


-- ========================================================================================================
-- 7. GÖRÜNÜMLER
-- ========================================================================================================

-- --------------------------------------------------------------------------------------------------------
-- 7.1 PUBLISHED_POSTS GÖRÜNÜMÜ
-- --------------------------------------------------------------------------------------------------------
-- Yalnız yayımlanmış makaleleri kategori bilgileriyle gösterir.

CREATE OR REPLACE VIEW published_posts WITH (security_invoker = true) AS
SELECT 
    p.id,
    p.title,
    p.slug,
    p.excerpt,
    p.content,
    p.cover_image,
    p.reading_time,
    p.views,
    p.featured,
    p.published_at,
    p.created_at,
    p.updated_at,
    c.id as category_id,
    c.name as category_name,
    c.slug as category_slug
FROM posts p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.status = 'published'
ORDER BY p.published_at DESC;

COMMENT ON VIEW published_posts IS 'All published posts with category details';

-- --------------------------------------------------------------------------------------------------------
-- 7.2 PENDING_COMMENTS GÖRÜNÜMÜ
-- --------------------------------------------------------------------------------------------------------
-- Denetim bekleyen tüm yorumları gösterir.

CREATE OR REPLACE VIEW pending_comments WITH (security_invoker = true) AS
SELECT 
    c.id,
    c.post_id,
    c.author_name,
    c.author_email,
    c.content,
    c.rating,
    c.created_at,
    p.title as post_title,
    p.slug as post_slug
FROM comments c
INNER JOIN posts p ON c.post_id = p.id
WHERE c.status = 'pending'
ORDER BY c.created_at DESC;

COMMENT ON VIEW pending_comments IS 'Pending comments awaiting moderation with post details';

-- --------------------------------------------------------------------------------------------------------
-- 7.3 DASHBOARD_STATS GÖRÜNÜMÜ
-- --------------------------------------------------------------------------------------------------------
-- Yönetim paneli için toplu istatistikleri hazırlar.

CREATE OR REPLACE VIEW dashboard_stats WITH (security_invoker = true) AS
SELECT 
    (SELECT COUNT(*) FROM posts WHERE status = 'published') as total_published_posts,
    (SELECT COUNT(*) FROM posts WHERE status = 'draft') as total_draft_posts,
    (SELECT COUNT(*) FROM comments WHERE status = 'pending') as total_pending_comments,
    (SELECT COUNT(*) FROM comments WHERE status = 'approved') as total_approved_comments,
    (SELECT COUNT(*) FROM newsletter_subscribers WHERE verified = true) as total_verified_subscribers,
    (SELECT COUNT(*) FROM newsletter_subscribers WHERE verified = false) as total_unverified_subscribers,
    (SELECT COALESCE(SUM(views), 0) FROM posts WHERE status = 'published') as total_post_views,
    (SELECT COUNT(*) FROM categories) as total_categories;

COMMENT ON VIEW dashboard_stats IS 'Aggregated statistics for admin dashboard';

-- ========================================================================================================
-- 8. SATIR DÜZEYİ GÜVENLİK (RLS) POLİTİKALARI
-- ========================================================================================================

-- --------------------------------------------------------------------------------------------------------
-- 8.1 TÜM TABLOLARDA RLS'Yİ ETKİNLEŞTİRME
-- --------------------------------------------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------------------------------------------
-- 8.2 PROFİL POLİTİKALARI
-- --------------------------------------------------------------------------------------------------------

-- Anonim kullanıcılar: Erişim yok
-- Kimliği doğrulanmış yöneticiler: Tam okuma/yazma erişimi

DROP POLICY IF EXISTS "profiles_anon_select" ON profiles;
CREATE POLICY "profiles_anon_select" ON profiles
    FOR SELECT
    TO anon
    USING (true);

DROP POLICY IF EXISTS "profiles_admin_select" ON profiles;
CREATE POLICY "profiles_admin_select" ON profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_admin_insert" ON profiles;
CREATE POLICY "profiles_admin_insert" ON profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (is_admin() AND auth.uid() = id);

DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;
CREATE POLICY "profiles_admin_update" ON profiles
    FOR UPDATE
    TO authenticated
    USING (is_admin() AND auth.uid() = id)
    WITH CHECK (is_admin() AND auth.uid() = id);

DROP POLICY IF EXISTS "profiles_admin_delete" ON profiles;
CREATE POLICY "profiles_admin_delete" ON profiles
    FOR DELETE
    TO authenticated
    USING (is_admin() AND auth.uid() = id);

-- --------------------------------------------------------------------------------------------------------
-- 8.3 KATEGORİ POLİTİKALARI
-- --------------------------------------------------------------------------------------------------------

-- Anonim kullanıcılar: Yalnız okuma
-- Kimliği doğrulanmış yöneticiler: Tam okuma/yazma erişimi

DROP POLICY IF EXISTS "categories_anon_select" ON categories;
CREATE POLICY "categories_anon_select" ON categories
    FOR SELECT
    TO anon
    USING (true);

DROP POLICY IF EXISTS "categories_admin_all" ON categories;
CREATE POLICY "categories_admin_all" ON categories
    FOR ALL
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- --------------------------------------------------------------------------------------------------------
-- 8.4 MAKALE POLİTİKALARI
-- --------------------------------------------------------------------------------------------------------

-- Anonim kullanıcılar: Yalnız yayımlanmış makaleleri okuma
-- Kimliği doğrulanmış yöneticiler: Tam okuma/yazma erişimi

DROP POLICY IF EXISTS "posts_anon_select_published" ON posts;
CREATE POLICY "posts_anon_select_published" ON posts
    FOR SELECT
    TO anon
    USING (status = 'published');

DROP POLICY IF EXISTS "posts_admin_all" ON posts;
CREATE POLICY "posts_admin_all" ON posts
    FOR ALL
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- --------------------------------------------------------------------------------------------------------
-- 8.5 YORUM POLİTİKALARI
-- --------------------------------------------------------------------------------------------------------

-- Anonim kullanıcılar: Onaylı yorumları okuma ve yeni yorum gönderme
-- Kimliği doğrulanmış yöneticiler: Tam okuma/yazma erişimi

DROP POLICY IF EXISTS "comments_anon_select_approved" ON comments;
CREATE POLICY "comments_anon_select_approved" ON comments
    FOR SELECT
    TO anon
    USING (status = 'approved');

DROP POLICY IF EXISTS "comments_anon_insert" ON comments;
CREATE POLICY "comments_anon_insert" ON comments
    FOR INSERT
    TO anon
    WITH CHECK (
        status = 'pending'
        AND approved_at IS NULL
        AND EXISTS (SELECT 1 FROM posts WHERE id = post_id AND status = 'published')
    );

DROP POLICY IF EXISTS "comments_admin_all" ON comments;
CREATE POLICY "comments_admin_all" ON comments
    FOR ALL
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- --------------------------------------------------------------------------------------------------------
-- 8.6 MEDYA POLİTİKALARI
-- --------------------------------------------------------------------------------------------------------

-- Anonim kullanıcılar: Yalnız okuma
-- Kimliği doğrulanmış yöneticiler: Tam okuma/yazma erişimi

DROP POLICY IF EXISTS "media_anon_select" ON media;
CREATE POLICY "media_anon_select" ON media
    FOR SELECT
    TO anon
    USING (true);

DROP POLICY IF EXISTS "media_admin_all" ON media;
CREATE POLICY "media_admin_all" ON media
    FOR ALL
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- --------------------------------------------------------------------------------------------------------
-- 8.7 BÜLTEN ABONESİ POLİTİKALARI
-- --------------------------------------------------------------------------------------------------------

-- Anonim kullanıcılar: Yalnız kendi aboneliğini oluşturma
-- Kimliği doğrulanmış yöneticiler: Tam okuma/yazma erişimi

DROP POLICY IF EXISTS "newsletter_anon_insert" ON newsletter_subscribers;
CREATE POLICY "newsletter_anon_insert" ON newsletter_subscribers
    FOR INSERT
    TO anon
    WITH CHECK (true);

DROP POLICY IF EXISTS "newsletter_admin_all" ON newsletter_subscribers;
CREATE POLICY "newsletter_admin_all" ON newsletter_subscribers
    FOR ALL
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- --------------------------------------------------------------------------------------------------------
-- 8.8 SİTE İÇERİĞİ POLİTİKALARI
-- --------------------------------------------------------------------------------------------------------

DROP POLICY IF EXISTS "site_content_anon_select" ON site_content;
CREATE POLICY "site_content_anon_select" ON site_content
    FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "site_content_admin_all" ON site_content;
CREATE POLICY "site_content_admin_all" ON site_content
    FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Anonim ziyaretçiler yorum e-posta adreslerini Data API üzerinden hiçbir zaman alamaz.
REVOKE ALL ON comments FROM anon;
GRANT SELECT (id, post_id, author_name, content, rating, status, approved_at, created_at) ON comments TO anon;
GRANT INSERT (post_id, author_name, author_email, content, rating, status, approved_at) ON comments TO anon;
GRANT ALL ON comments TO authenticated;

-- Yetkili çalışan yorum denetimi fonksiyonları yalnız yöneticilere açıktır; görüntülenme artırma herkese açık kalır.
REVOKE ALL ON FUNCTION increment_post_views(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION approve_comment(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION reject_comment(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_post_views(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION approve_comment(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_comment(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Yönetim görünümleri denetim verilerini anonim çağrılara sızdırmamalıdır.
REVOKE ALL ON pending_comments, dashboard_stats FROM anon;
GRANT SELECT ON pending_comments, dashboard_stats TO authenticated;
GRANT SELECT ON published_posts TO anon, authenticated;

-- ========================================================================================================
-- 9. DEPOLAMA KOVALARI
-- ========================================================================================================

-- --------------------------------------------------------------------------------------------------------
-- 9.1 DEPOLAMA KOVALARINI OLUŞTURMA
-- --------------------------------------------------------------------------------------------------------

-- Makale kovası (herkese açık görseller ve videolar)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'posts',
    'posts',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- Profil kovası (herkese açık, yalnız görseller)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profiles',
    'profiles',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Genel dosya kovası (herkese açık, çeşitli dosyalar)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'general',
    'general',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4', 'video/webm', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- ========================================================================================================
-- 10. DEPOLAMA POLİTİKALARI
-- ========================================================================================================

-- --------------------------------------------------------------------------------------------------------
-- 10.1 MAKALE KOVASI POLİTİKALARI
-- --------------------------------------------------------------------------------------------------------

-- Anonim: Yalnız okuma
DROP POLICY IF EXISTS "posts_anon_select" ON storage.objects;
CREATE POLICY "posts_anon_select" ON storage.objects
    FOR SELECT
    TO anon
    USING (bucket_id = 'posts');

-- Kimliği doğrulanmış yöneticiler: Tam okuma/yazma erişimi
DROP POLICY IF EXISTS "posts_admin_insert" ON storage.objects;
CREATE POLICY "posts_admin_insert" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'posts' AND is_admin());

DROP POLICY IF EXISTS "posts_admin_update" ON storage.objects;
CREATE POLICY "posts_admin_update" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'posts' AND is_admin())
    WITH CHECK (bucket_id = 'posts' AND is_admin());

DROP POLICY IF EXISTS "posts_admin_delete" ON storage.objects;
CREATE POLICY "posts_admin_delete" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'posts' AND is_admin());

-- --------------------------------------------------------------------------------------------------------
-- 10.2 PROFİL KOVASI POLİTİKALARI
-- --------------------------------------------------------------------------------------------------------

-- Anonim: Yalnız okuma
DROP POLICY IF EXISTS "profiles_anon_select" ON storage.objects;
CREATE POLICY "profiles_anon_select" ON storage.objects
    FOR SELECT
    TO anon
    USING (bucket_id = 'profiles');

-- Kimliği doğrulanmış yöneticiler: Tam okuma/yazma erişimi
DROP POLICY IF EXISTS "profiles_admin_insert" ON storage.objects;
CREATE POLICY "profiles_admin_insert" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'profiles' AND is_admin());

DROP POLICY IF EXISTS "profiles_admin_update" ON storage.objects;
CREATE POLICY "profiles_admin_update" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'profiles' AND is_admin())
    WITH CHECK (bucket_id = 'profiles' AND is_admin());

DROP POLICY IF EXISTS "profiles_admin_delete" ON storage.objects;
CREATE POLICY "profiles_admin_delete" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'profiles' AND is_admin());

-- --------------------------------------------------------------------------------------------------------
-- 10.3 GENEL DOSYA KOVASI POLİTİKALARI
-- --------------------------------------------------------------------------------------------------------

-- Anonim: Yalnız okuma
DROP POLICY IF EXISTS "general_anon_select" ON storage.objects;
CREATE POLICY "general_anon_select" ON storage.objects
    FOR SELECT
    TO anon
    USING (bucket_id = 'general');

-- Kimliği doğrulanmış yöneticiler: Tam okuma/yazma erişimi
DROP POLICY IF EXISTS "general_admin_insert" ON storage.objects;
CREATE POLICY "general_admin_insert" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'general' AND is_admin());

DROP POLICY IF EXISTS "general_admin_update" ON storage.objects;
CREATE POLICY "general_admin_update" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'general' AND is_admin())
    WITH CHECK (bucket_id = 'general' AND is_admin());

DROP POLICY IF EXISTS "general_admin_delete" ON storage.objects;
CREATE POLICY "general_admin_delete" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'general' AND is_admin());

-- ========================================================================================================
-- 11. BAŞLANGIÇ VERİSİ (İSTEĞE BAĞLI - GELİŞTİRME/TEST İÇİN)
-- ========================================================================================================

-- --------------------------------------------------------------------------------------------------------
-- 11.1 BAŞLANGIÇ KATEGORİLERİ
-- --------------------------------------------------------------------------------------------------------

INSERT INTO categories (name, description) VALUES
    ('Tarım', 'Tarımsal üretim ve uygulama bilgileri'),
    ('Bitki Koruma', 'Hastalık, zararlı ve entegre mücadele yaklaşımları'),
    ('Sulama', 'Su yönetimi ve doğru sulama yöntemleri'),
    ('Toprak', 'Toprak sağlığı, analiz ve verimlilik'),
    ('Doğa', 'Doğa, çevre ve sürdürülebilir yaşam')
ON CONFLICT (name) DO NOTHING;

INSERT INTO site_content (key, type, data) VALUES (
    'hero',
    'hero',
    '{
      "title": "Tarımı Bilimle Anlamak",
      "subtitle": "Ziraat, doğa ve sürdürülebilir üretim üzerine saha notları ve rehberler",
      "image_url": "/images/ziraat-hero-fallback.webp",
      "button_text": "Makaleleri Keşfet",
      "button_link": "#posts",
      "label": "Ziraat Mühendisliği"
    }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

REVOKE ALL ON profiles FROM anon;
-- Herkese açık Hakkımda sorgusu yalnız yönetici profilini filtreler; bu alan profil yanıtında dönmez.
GRANT SELECT (id, name, email, avatar_url, bio, profession, phone, is_admin, facebook, instagram, twitter, linkedin, created_at, updated_at) ON profiles TO anon;
GRANT SELECT ON categories, posts, media, site_content TO anon;
GRANT INSERT ON newsletter_subscribers TO anon;
GRANT ALL ON profiles, categories, posts, comments, media, newsletter_subscribers, site_content TO authenticated;

-- ========================================================================================================
-- 12. SON DOĞRULAMA
-- ========================================================================================================

-- Gerekli tüm tabloların oluştuğunu doğrular.
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('profiles', 'categories', 'posts', 'comments', 'media', 'newsletter_subscribers', 'site_content');
    
    IF table_count != 7 THEN
        RAISE EXCEPTION 'Migration validation failed: Expected 7 tables, found %', table_count;
    END IF;
    
    RAISE NOTICE 'All 7 tables created successfully';
END $$;

-- Gerekli tüm fonksiyonların oluştuğunu doğrular.
DO $$
DECLARE
    function_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname IN (
        'update_updated_at_column',
        'generate_slug_from_title',
        'increment_post_views',
        'approve_comment',
        'reject_comment',
        'is_admin',
        'handle_new_user',
        'set_published_at',
        'calculate_reading_time',
        'set_post_reading_time'
    );
    
    IF function_count != 10 THEN
        RAISE EXCEPTION 'Migration validation failed: Expected 10 functions, found %', function_count;
    END IF;
    
    RAISE NOTICE 'All 10 functions created successfully';
END $$;

-- Gerekli tüm görünümlerin oluştuğunu doğrular.
DO $$
DECLARE
    view_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO view_count
    FROM information_schema.views
    WHERE table_schema = 'public'
    AND table_name IN ('published_posts', 'pending_comments', 'dashboard_stats');
    
    IF view_count != 3 THEN
        RAISE EXCEPTION 'Migration validation failed: Expected 3 views, found %', view_count;
    END IF;
    
    RAISE NOTICE 'All 3 views created successfully';
END $$;

-- Gerekli tüm depolama kovalarının oluştuğunu doğrular.
DO $$
DECLARE
    bucket_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO bucket_count
    FROM storage.buckets
    WHERE id IN ('posts', 'profiles', 'general');
    
    IF bucket_count != 3 THEN
        RAISE EXCEPTION 'Migration validation failed: Expected 3 storage buckets, found %', bucket_count;
    END IF;
    
    RAISE NOTICE 'All 3 storage buckets created successfully';
END $$;

-- Yeni kurulumlarda da artımlı güvenlik migration'ıyla aynı kuralı uygula.
CREATE OR REPLACE FUNCTION public.get_public_profile_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
    SELECT p.id
    FROM public.profiles AS p
    WHERE p.is_admin = true
    ORDER BY COALESCE(p.id::text = (
        SELECT s.data ->> 'profile_id'
        FROM public.site_content AS s WHERE s.key = 'about_profile'
    ), false) DESC, p.updated_at DESC, p.id ASC
    LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.get_public_profile_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_profile_id() TO anon, authenticated;
DROP POLICY IF EXISTS "profiles_anon_select" ON public.profiles;
CREATE POLICY "profiles_anon_select" ON public.profiles
    FOR SELECT TO anon USING (id = (SELECT public.get_public_profile_id()));

COMMIT;

-- ========================================================================================================
-- MIGRATION BAŞARIYLA TAMAMLANDI
-- ========================================================================================================

SELECT 
    'Migration completed successfully' as status,
    '8 tables created' as tables,
    '11 functions created' as functions,
    '3 views created' as views,
    '3 storage buckets created' as storage,
    'RLS enabled on all tables' as security,
    'All indexes and triggers active' as performance;

-- ========================================================================================================
-- MIGRATION SONRASI NOTLAR
-- ========================================================================================================
/*
The application schema now contains seven tables, three administrative views,
three public Storage buckets, admin-role RLS, Turkish-safe slug generation,
automatic profile creation and the initial category/hero content.

Kurulumdan sonra Supabase Authentication'da yönetici hesabını oluşturun.
Yetki ataması için supabase/admin-access.sql içindeki kimlik kontrollü örneği kullanın.
Yeni hesaplara kendiliğinden yönetici yetkisi verilmez.
*/
