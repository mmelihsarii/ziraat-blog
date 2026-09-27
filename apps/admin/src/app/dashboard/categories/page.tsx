/**
 * Dosyanın görevi: Kategorileri listeler, düzenleme bağlantıları sunar ve bağlı içerik kontrolüyle güvenli silme yapar.
 * Kullanıldığı yerler: Next.js dosya tabanlı rota sistemi tarafından doğrudan yüklenir.
 */
'use client';

import { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, FolderTree, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { getCategories, deleteCategory, checkCategoryHasPosts } from '@/services/adminService';
import type { Category } from '@/types';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/errors';

/** Kategorileri listeler, düzenleme bağlantıları sunar ve bağlı içerik kontrolüyle güvenli silme yapar. */
export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  /** Güncel kategori listesini yönetim tablosuna yükler. */
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Kategoriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadCategories);
  }, [loadCategories]);

  /** Silme onayı için seçilen kategoriyi modal durumuna taşır. */
  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  /** Bağlı makale yoksa seçilen kategoriyi silip listeyi yeniler. */
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      setDeleting(true);
      
      // Önce bağlı makale kontrolü yap
      const hasPosts = await checkCategoryHasPosts(categoryToDelete.id);
      if (hasPosts) {
        toast.error('Bu kategoriye bağlı makaleler var. Önce makaleleri silmeniz veya kategorilerini değiştirmeniz gerekiyor.');
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
        return;
      }

      await deleteCategory(categoryToDelete.id);
      toast.success('Kategori başarıyla silindi');
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      await loadCategories();
    } catch (error: unknown) {
      console.error('Error deleting category:', error);
      toast.error(getErrorMessage(error) || 'Kategori silinirken bir hata oluştu');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout>
      {/* Başlık alanı */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-black text-3xl uppercase tracking-wider text-brand-dark">
            Kategoriler
          </h1>
          <p className="font-sans text-sm text-brand-gray mt-1">
            Makale kategorilerini yönetin
          </p>
        </div>
        <Link
          href="/dashboard/categories/new"
          className="flex items-center gap-2 font-display font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg uppercase tracking-wider transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Kategori
        </Link>
      </div>

      {/* İçerik */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="font-sans text-sm text-brand-gray">Kategoriler yükleniyor...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <FolderTree className="w-8 h-8 text-neutral-400" />
          </div>
          <h2 className="font-display font-bold text-xl text-brand-dark mb-2">
            Henüz kategori yok
          </h2>
          <p className="font-sans text-sm text-brand-gray mb-6">
            İlk kategorinizi oluşturarak başlayın
          </p>
          <Link
            href="/dashboard/categories/new"
            className="inline-flex items-center gap-2 font-display font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg uppercase tracking-wider transition-colors"
          >
            <Plus className="w-4 h-4" />
            Yeni Kategori
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-6 py-4 font-display font-bold text-sm text-brand-dark uppercase tracking-wider">
                    Ad
                  </th>
                  <th className="text-left px-6 py-4 font-display font-bold text-sm text-brand-dark uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="text-left px-6 py-4 font-display font-bold text-sm text-brand-dark uppercase tracking-wider">
                    Açıklama
                  </th>
                  <th className="text-left px-6 py-4 font-display font-bold text-sm text-brand-dark uppercase tracking-wider">
                    Oluşturulma
                  </th>
                  <th className="text-right px-6 py-4 font-display font-bold text-sm text-brand-dark uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-display font-bold text-sm text-brand-dark">
                        {category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="font-mono text-xs bg-neutral-100 px-2 py-1 rounded text-brand-gray">
                        {category.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-sans text-sm text-brand-gray line-clamp-1">
                        {category.description || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-sans text-sm text-brand-gray">
                        {new Date(category.created_at).toLocaleDateString('tr-TR')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/categories/${category.id}/edit`}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(category)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Silme onay penceresi */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Kategoriyi Sil"
        message={`"${categoryToDelete?.name}" kategorisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        variant="danger"
        isLoading={deleting}
      />
    </AdminLayout>
  );
}
