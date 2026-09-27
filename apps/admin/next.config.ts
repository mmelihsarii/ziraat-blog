/**
 * Dosyanın görevi: Ayrı yayınlanan yönetim uygulamasının derleme ve görsel kaynak ayarlarını tanımlar.
 * Kullanıldığı yerler: Derleme aracı veya ilgili çalışma komutu tarafından yüklenir.
 */
import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: fileURLToPath(new URL('../..', import.meta.url)),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseUrl
      ? [
          {
            protocol: "https",
            hostname: new URL(supabaseUrl).hostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
