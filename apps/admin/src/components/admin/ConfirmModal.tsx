/**
 * Dosyanın görevi: Geri alınamaz yönetim işlemleri için yükleme durumlu ortak onay diyaloğunu gösterir.
 * Kullanıldığı yerler: app/dashboard/categories/page.tsx, app/dashboard/comments/page.tsx, app/dashboard/posts/page.tsx, tests/components.test.tsx
 */
'use client';

import { useCallback, useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

/** Geri alınamaz yönetim işlemleri için yükleme durumlu ortak onay diyaloğunu gösterir. */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const confirmingRef = useRef(false);

  /** Klavye ve tiklama ile gelen onayi tek isleme indirger. */
  const handleConfirm = useCallback(async () => {
    if (isLoading || confirmingRef.current) return;

    confirmingRef.current = true;
    try {
      await onConfirm();
    } finally {
      confirmingRef.current = false;
    }
  }, [isLoading, onConfirm]);

  useEffect(() => {
    if (!isOpen) return;

    confirmButtonRef.current?.focus();

    /** Açık onay penceresinde Enter tuşunu tek bir onay işlemine dönüştürür. */
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || event.isComposing) return;

      event.preventDefault();
      void handleConfirm();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleConfirm, isOpen]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
{/* Başlık alanı */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              variant === 'danger' ? 'bg-red-100 text-red-600' :
              variant === 'warning' ? 'bg-yellow-100 text-yellow-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 id="confirm-modal-title" className="font-display font-bold text-xl text-brand-dark">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-neutral-400 hover:text-neutral-600 transition-colors disabled:opacity-50"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

{/* Açıklama alanı */}
        <div className="px-6 pb-6">
          <p className="font-sans text-brand-gray text-[15px] leading-relaxed">
            {message}
          </p>
        </div>

{/* Eylem alanı */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-neutral-50 border-t border-neutral-100">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="font-display font-bold text-sm text-brand-dark hover:text-neutral-600 px-4 py-2 rounded transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={() => void handleConfirm()}
            disabled={isLoading}
            className={`font-display font-bold text-sm text-white px-6 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]}`}
          >
            {isLoading ? 'İşleniyor...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
