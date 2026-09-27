/**
 * Dosyanın görevi: Ana sayfa hero içeriğini ve görselini kod gerektirmeden yöneten ekranı sunar.
 * Kullanıldığı yerler: Next.js dosya tabanlı rota sistemi tarafından doğrudan yüklenir.
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import HeroForm from '@/components/admin/HeroForm';
import { getHeroContent, upsertHeroContent, uploadHeroImage, deleteHeroImage } from '@/services/contentService';
import type { HeroContent, CreateHeroInput } from '@/types';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/errors';

/** Ana sayfa hero içeriğini ve görselini kod gerektirmeden yöneten ekranı sunar. */
export default function HeroManagementPage() {
  const [loading, setLoading] = useState(true);
  const [heroData, setHeroData] = useState<HeroContent | null>(null);

  /** Mevcut tekil hero kaydını forma yükler. */
  const loadHeroData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getHeroContent();
      setHeroData(data);
    } catch (error) {
      console.error('Error loading hero data:', error);
      toast.error('Hero içeriği yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadHeroData);
  }, [loadHeroData]);

  /** Hero alanlarını tek kayıt kuralıyla kaydedip güncel veriyi tekrar getirir. */
  const handleSubmit = async (data: CreateHeroInput) => {
    try {
      await upsertHeroContent(data);
      await loadHeroData();
    } catch (error: unknown) {
      console.error('Error updating hero:', error);
      throw new Error(getErrorMessage(error) || 'Hero güncellenirken bir hata oluştu');
    }
  };

  /** Seçilen hero görselini genel Storage alanına yükler. */
  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      return await uploadHeroImage(file);
    } catch (error: unknown) {
      console.error('Error uploading image:', error);
      throw new Error(getErrorMessage(error) || 'Görsel yüklenirken bir hata oluştu');
    }
  };

  /** Eski hero görselini yalnızca projeye ait Storage yolundaysa siler. */
  const handleImageDelete = async (url: string) => {
    try {
      await deleteHeroImage(url);
    } catch (error: unknown) {
      console.error('Error deleting image:', error);
      throw new Error(getErrorMessage(error) || 'Görsel silinirken bir hata oluştu');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl">
{/* Başlık alanı */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <ImageIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <h1 className="font-display font-black text-3xl md:text-4xl uppercase tracking-wider text-brand-dark">
              Hero Yönetimi
            </h1>
          </div>
          <p className="font-sans text-base text-brand-gray">
            Ana sayfadaki hero alanının içeriğini buradan düzenleyebilirsiniz
          </p>
        </div>

{/* Form alanı */}
        <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-6 md:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
              <p className="font-display font-bold text-lg text-brand-gray">
                Yükleniyor...
              </p>
            </div>
          ) : (
            <HeroForm
              initialData={heroData}
              onSubmit={handleSubmit}
              onImageUpload={handleImageUpload}
              onImageDelete={handleImageDelete}
            />
          )}
        </div>

{/* Bilgi alanı */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-display font-bold text-sm text-blue-900 mb-2">
            Bilgi
          </h3>
          <ul className="space-y-1 text-sm text-blue-800 list-disc pl-5">
            <li>Değişiklikler anında ana sayfaya yansır</li>
            <li>Görsel maksimum 10MB olabilir</li>
            <li>Desteklenen formatlar: JPG, PNG, WebP</li>
            <li>Tüm alanlar zorunludur (etiket hariç)</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
