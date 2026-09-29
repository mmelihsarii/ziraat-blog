/**
 * Dosyanın görevi: Uygulamanın Türkçe belge kabuğunu, global stillerini ve bildirim sağlayıcısını yükler.
 * Kullanıldığı yerler: Next.js dosya tabanlı rota sistemi tarafından doğrudan yüklenir.
 */
import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";

// Yönetim değişikliklerini ilk istekte göstermek için public sayfaları istek anında üret.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Ziraat Notları",
    template: "%s | Ziraat Notları",
  },
  description: "Ziraat mühendisliği, tarım, doğa ve sürdürülebilir üretim üzerine makaleler ve saha notları.",
  applicationName: "Ziraat Notları",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Ziraat Notları",
  },
};

/** Uygulamanın Türkçe belge kabuğunu, global stillerini ve bildirim sağlayıcısını yükler. */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-brand-dark">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
