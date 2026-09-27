/**
 * Dosyanın görevi: Yönetim uygulamasının Türkçe belge kabuğunu, global stillerini ve bildirim sağlayıcısını yükler.
 * Kullanıldığı yerler: Next.js dosya tabanlı rota sistemi tarafından doğrudan yüklenir.
 */
import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001"),
  title: {
    default: "Yönetim Paneli | Ziraat Notları",
    template: "%s | Ziraat Notları Yönetim",
  },
  description: "Ziraat Notları içerik ve profil yönetim paneli.",
  applicationName: "Ziraat Notları Yönetim",
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
