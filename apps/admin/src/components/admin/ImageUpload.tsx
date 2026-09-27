/**
 * Dosyanın görevi: Makale ve profil görsellerini doğrulayıp Storage'a yükleyen yeniden kullanılabilir alanı sunar.
 * Kullanıldığı yerler: app/dashboard/posts/new/page.tsx, app/dashboard/posts/[id]/edit/page.tsx, app/dashboard/profile/page.tsx
 */
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImage } from '@/services/adminService';
import { validateImageFile } from '@/lib/validations';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  bucket?: 'posts' | 'profiles' | 'general';
  label?: string;
  required?: boolean;
}

/** Makale ve profil görsellerini doğrulayıp Storage'a yükleyen yeniden kullanılabilir alanı sunar. */
export default function ImageUpload({
  value,
  onChange,
  bucket = 'posts',
  label = 'Görsel Yükle',
  required = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Seçilen dosyayı doğrular, ilerleme durumuyla yükler ve public URL'yi forma aktarır. */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

// Yüklemeden önce tür ve depo boyut sınırını denetler.
    const validationError = validateImageFile(file, bucket);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    let progressInterval: ReturnType<typeof setInterval> | undefined;
    try {
      setUploading(true);
      setUploadProgress(0);

// Storage ilerleme değeri vermediği için yüzde 90’a kadar temsili ilerleme gösterir.
      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const url = await uploadImage(file, bucket);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      onChange(url);
      toast.success('Görsel başarıyla yüklendi');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Görsel yüklenirken bir hata oluştu');
    } finally {
      if (progressInterval) clearInterval(progressInterval);
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /** Formdaki görsel URL'sini ve dosya inputunu temizler. */
  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block font-display font-bold text-sm text-brand-dark">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {value ? (
        <div className="relative w-full aspect-video bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200">
          <Image
            src={value}
            alt="Uploaded image"
            fill
            className="object-cover"
            unoptimized
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
            aria-label="Görseli kaldır"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              uploading
                ? 'border-emerald-400 bg-emerald-50'
                : 'border-neutral-300 hover:border-emerald-500 bg-neutral-50 hover:bg-emerald-50/50'
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                <div className="w-48 h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="font-sans text-sm text-brand-gray">
                  Yükleniyor... {uploadProgress}%
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-10 h-10 text-neutral-400" />
                <span className="font-display font-bold text-sm text-brand-dark">
                  Görsel Yüklemek İçin Tıklayın
                </span>
                <span className="font-sans text-xs text-brand-gray">
                  JPG, PNG, WEBP (Maks. {bucket === 'profiles' ? 5 : 10}MB)
                </span>
              </div>
            )}
          </label>
        </div>
      )}
    </div>
  );
}
