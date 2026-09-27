/**
 * Dosyanın görevi: Yönetim işlemlerinin başarı ve hata bildirimlerini uygulama kökünde görünür kılar.
 * Kullanıldığı yerler: app/layout.tsx
 */
'use client';

import { Toaster } from 'react-hot-toast';

/** Yönetim işlemlerinin başarı ve hata bildirimlerini uygulama kökünde görünür kılar. */
export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
          fontSize: '14px',
          fontFamily: 'var(--font-geist-sans)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
