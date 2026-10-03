/**
 * Dosyanın görevi: Fotoğraf ve videoları optimize ederek yükleyen, yayınlayan, sıralayan ve silen galeri panelini sunar.
 * Kullanıldığı yerler: /dashboard/gallery yönetim rotası.
 */
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Film,
  Images,
  Loader2,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import ConfirmModal from '@/components/admin/ConfirmModal';
import {
  createGalleryItem,
  deleteGalleryItem,
  getGalleryItems,
  swapGalleryItems,
  updateGalleryItem,
} from '@/services/galleryService';
import { formatFileSize, validateGalleryFile } from '@/lib/gallery-media';
import { getErrorMessage } from '@/lib/errors';
import type { GalleryItem } from '@/types';

interface GalleryAdminCardProps {
  item: GalleryItem;
  index: number;
  total: number;
  onSave: (input: { id: string; description: string; published: boolean }) => Promise<void>;
  onDelete: (item: GalleryItem) => void;
  onMove: (index: number, direction: -1 | 1) => Promise<void>;
}

/** Tek galeri kaydının açıklama, yayın ve sıra kontrollerini yönetir. */
function GalleryAdminCard({ item, index, total, onSave, onDelete, onMove }: GalleryAdminCardProps) {
  const [description, setDescription] = useState(item.description || '');
  const [published, setPublished] = useState(item.published);
  const [saving, setSaving] = useState(false);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    setDescription(item.description || '');
    setPublished(item.published);
  }, [item]);

  /** Düzenlenen metin ve yayın durumunu birlikte kaydeder. */
  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave({ id: item.id, description, published });
    } finally {
      setSaving(false);
    }
  };

  /** Sıra düğmesinin aynı anda birden fazla güncelleme başlatmasını engeller. */
  const handleMove = async (direction: -1 | 1) => {
    try {
      setMoving(true);
      await onMove(index, direction);
    } finally {
      setMoving(false);
    }
  };

  return (
    <article className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm">
      <div className="relative aspect-[4/3] bg-neutral-950">
        {item.media_type === 'image' ? (
          <Image src={item.url} alt={item.alt || 'Galeri görseli'} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
        ) : item.poster_url ? (
          <Image src={item.poster_url} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover opacity-90" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"><Film className="w-12 h-12 text-white/35" /></div>
        )}
        <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/75 text-white text-[10px] font-bold uppercase tracking-wider">
          {item.media_type === 'video' ? 'Video' : 'Fotoğraf'}
        </span>
        <span className={`absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${item.published ? 'bg-emerald-600 text-white' : 'bg-amber-400 text-neutral-950'}`}>
          {item.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          {item.published ? 'Yayında' : 'Taslak'}
        </span>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-3 text-xs text-brand-gray">
          <span className="truncate" title={item.filename}>{item.filename}</span>
          <span className="shrink-0">{formatFileSize(item.size)}</span>
        </div>
        <div>
          <label htmlFor={`gallery-description-${item.id}`} className="block mb-1.5 font-display font-bold text-xs uppercase text-brand-dark">Açıklama</label>
          <textarea
            id={`gallery-description-${item.id}`}
            value={description}
            onChange={(event) => setDescription(event.target.value.slice(0, 600))}
            rows={3}
            className="w-full resize-none border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <p className="mt-1 text-right text-[10px] text-neutral-400 tabular-nums">{description.length}/600</p>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} className="w-4 h-4 accent-emerald-600" />
          <span className="font-display font-bold text-sm text-brand-dark">Galeride yayınla</span>
        </label>
        <div className="flex items-center gap-2 pt-1 border-t border-neutral-100">
          <button type="button" onClick={() => void handleMove(-1)} disabled={index === 0 || moving} className="w-10 h-10 flex items-center justify-center border border-neutral-200 hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-30" aria-label="Öne taşı" title="Öne taşı"><ArrowUp className="w-4 h-4" /></button>
          <button type="button" onClick={() => void handleMove(1)} disabled={index === total - 1 || moving} className="w-10 h-10 flex items-center justify-center border border-neutral-200 hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-30" aria-label="Arkaya taşı" title="Arkaya taşı"><ArrowDown className="w-4 h-4" /></button>
          <button type="button" onClick={() => onDelete(item)} className="w-10 h-10 flex items-center justify-center border border-neutral-200 hover:border-red-500 hover:text-red-600" aria-label="Medyayı sil" title="Sil"><Trash2 className="w-4 h-4" /></button>
          <button type="button" onClick={() => void handleSave()} disabled={saving} className="ml-auto h-10 px-4 inline-flex items-center gap-2 bg-neutral-950 hover:bg-emerald-700 text-white font-display font-bold text-xs uppercase disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Kaydet
          </button>
        </div>
      </div>
    </article>
  );
}

/** Galeri yükleme formunu ve mevcut medya kütüphanesini aynı yönetim ekranında birleştirir. */
export default function GalleryManagementPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [published, setPublished] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  /** Galeri listesini yönetici sırasıyla yeniden yükler. */
  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setItems(await getGalleryItems());
    } catch (error) {
      console.error('Gallery load failed:', error);
      toast.error('Galeri kayıtları yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(loadItems); }, [loadItems]);

  /** Seçilen dosyayı yükleme öncesi tür ve boyut sınırlarıyla doğrular. */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] || null;
    if (!selected) return;
    const error = validateGalleryFile(selected);
    if (error) {
      toast.error(error);
      event.target.value = '';
      return;
    }
    setFile(selected);
  };

  /** Medyayı optimize edip Storage ve veritabanına kaydeder. */
  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      toast.error('Bir fotoğraf veya video seçin');
      return;
    }
    if (description.trim().length < 3) {
      toast.error('Açıklama en az 3 karakter olmalıdır');
      return;
    }
    try {
      setUploading(true);
      await createGalleryItem(file, description, published);
      toast.success('Medya galeriye eklendi');
      setFile(null);
      setDescription('');
      setPublished(true);
      if (inputRef.current) inputRef.current.value = '';
      await loadItems();
    } catch (error) {
      console.error('Gallery upload failed:', error);
      toast.error(getErrorMessage(error) || 'Medya yüklenemedi');
    } finally {
      setUploading(false);
    }
  };

  /** Karttaki açıklama ve yayın durumunu kaydedip listeyi tazeler. */
  const handleSave = async (input: { id: string; description: string; published: boolean }) => {
    try {
      await updateGalleryItem(input);
      toast.success('Galeri kaydı güncellendi');
      await loadItems();
    } catch (error) {
      console.error('Gallery update failed:', error);
      toast.error(getErrorMessage(error) || 'Galeri kaydı güncellenemedi');
    }
  };

  /** Komşu iki öğenin sıra değerlerini değiştirir. */
  const handleMove = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (!items[index] || !items[target]) return;
    try {
      await swapGalleryItems(items[index], items[target]);
      await loadItems();
    } catch (error) {
      console.error('Gallery reorder failed:', error);
      toast.error('Galeri sırası değiştirilemedi');
    }
  };

  /** Onaylanan galeri kaydını dosyalarıyla birlikte kaldırır. */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteGalleryItem(deleteTarget);
      toast.success('Medya galeriden silindi');
      setDeleteTarget(null);
      await loadItems();
    } catch (error) {
      console.error('Gallery delete failed:', error);
      toast.error(getErrorMessage(error) || 'Medya silinemedi');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-emerald-100 rounded-lg"><Images className="w-6 h-6 text-emerald-700" /></div>
            <h1 className="font-display font-black text-3xl md:text-4xl uppercase tracking-wider text-brand-dark">Galeri</h1>
          </div>
          <p className="text-sm md:text-base text-brand-gray">Fotoğraf ve video yayınlarını yönetin</p>
        </div>

        <form onSubmit={handleUpload} className="bg-white border border-neutral-200 rounded-lg p-5 md:p-7 shadow-sm">
          <div className="grid lg:grid-cols-[minmax(280px,420px)_1fr] gap-6 md:gap-8">
            <div>
              <input ref={inputRef} id="gallery-file" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={handleFileChange} disabled={uploading} className="sr-only" />
              <label htmlFor="gallery-file" className="relative flex items-center justify-center w-full aspect-video border-2 border-dashed border-neutral-300 hover:border-emerald-500 bg-neutral-50 cursor-pointer overflow-hidden rounded">
                {previewUrl && file ? (
                  file.type.startsWith('image/') ? <Image src={previewUrl} alt="Yükleme önizlemesi" fill unoptimized className="object-cover" /> : <video src={previewUrl} muted playsInline preload="metadata" className="w-full h-full object-cover" />
                ) : (
                  <span className="flex flex-col items-center gap-3 text-center px-4"><Upload className="w-10 h-10 text-neutral-400" /><strong className="font-display text-sm uppercase text-brand-dark">Dosya Seç</strong><span className="text-xs text-brand-gray">JPG, PNG, WebP, MP4 veya WebM</span></span>
                )}
              </label>
              {file && <p className="mt-2 text-xs text-brand-gray truncate">{file.name} · {formatFileSize(file.size)}</p>}
            </div>
            <div className="flex flex-col gap-5">
              <div>
                <label htmlFor="gallery-description" className="block mb-2 font-display font-bold text-sm text-brand-dark">Açıklama</label>
                <textarea id="gallery-description" value={description} onChange={(event) => setDescription(event.target.value.slice(0, 600))} rows={5} required minLength={3} maxLength={600} className="w-full resize-none border border-neutral-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <p className="mt-1 text-right text-xs text-neutral-400 tabular-nums">{description.length}/600</p>
              </div>
              <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} className="w-4 h-4 accent-emerald-600" /><span className="font-display font-bold text-sm text-brand-dark">Yükledikten sonra yayınla</span></label>
              <button type="submit" disabled={uploading} className="self-start min-w-40 h-12 px-6 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-sm uppercase tracking-wider rounded disabled:opacity-60">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                {uploading ? 'İşleniyor' : 'Galeriye Ekle'}
              </button>
            </div>
          </div>
        </form>

        <section className="mt-10">
          <div className="flex items-center justify-between gap-4 mb-5"><h2 className="font-display font-black text-xl md:text-2xl uppercase text-brand-dark">Medya Kütüphanesi</h2><span className="text-sm text-brand-gray">{items.length} kayıt</span></div>
          {loading ? (
            <div className="py-20 text-center"><Loader2 className="w-8 h-8 mx-auto text-emerald-600 animate-spin" /></div>
          ) : items.length === 0 ? (
            <div className="border-y border-neutral-200 py-16 text-center"><Images className="w-10 h-10 mx-auto text-neutral-300" /><p className="mt-3 font-display font-bold text-brand-dark">Henüz galeri kaydı yok</p></div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {items.map((item, index) => <GalleryAdminCard key={item.id} item={item} index={index} total={items.length} onSave={handleSave} onDelete={setDeleteTarget} onMove={handleMove} />)}
            </div>
          )}
        </section>
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Medyayı Sil"
        message="Bu fotoğraf veya video galeriden ve depolama alanından kalıcı olarak silinecek."
        confirmText="Sil"
        isLoading={deleting}
      />
    </AdminLayout>
  );
}
