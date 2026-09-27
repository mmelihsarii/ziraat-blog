/**
 * Dosyanın görevi: Makaleleri durum ve kategori filtreleriyle listeler; düzenleme ve güvenli silme işlemlerini sunar.
 * Kullanıldığı yerler: Next.js dosya tabanlı rota sistemi tarafından doğrudan yüklenir.
 */
'use client';

import { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Trash2, FileText, Loader2, Eye, Filter } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { getPosts, deletePost, getCategories } from '@/services/adminService';
import type { AdminPost, Category } from '@/types';
import toast from 'react-hot-toast';

/** Makaleleri durum ve kategori filtreleriyle listeler; düzenleme ve güvenli silme işlemlerini sunar. */
export default function PostsPage() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<AdminPost | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  /** Aktif filtrelerle makale ve kategori verilerini paralel yükler. */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [postsData, categoriesData] = await Promise.all([
        getPosts({
          status: statusFilter === 'all' ? undefined : statusFilter,
          category_id: categoryFilter === 'all' ? undefined : categoryFilter,
        }),
        getCategories(),
      ]);
      setPosts(postsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, statusFilter]);

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, [loadData]);

  /** Silme onayı için seçilen makaleyi modal durumuna taşır. */
  const handleDeleteClick = (post: AdminPost) => {
    setPostToDelete(post);
    setDeleteModalOpen(true);
  };

  /** Onaylanan makaleyi silip filtreli listeyi yeniler. */
  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    try {
      setDeleting(true);
      await deletePost(postToDelete.id);
      toast.success('Makale başarıyla silindi');
      setDeleteModalOpen(false);
      setPostToDelete(null);
      await loadData();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Makale silinirken bir hata oluştu');
    } finally {
      setDeleting(false);
    }
  };

  /** Makale durumunu Türkçe etiket ve renk sınıflarıyla gösterir. */
  const getStatusBadge = (status: 'draft' | 'published') => {
    const styles = {
      draft: 'bg-yellow-100 text-yellow-700',
      published: 'bg-green-100 text-green-700',
    };
    const labels = {
      draft: 'Taslak',
      published: 'Yayında',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-sans font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <AdminLayout>
{/* Başlık alanı */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-black text-3xl uppercase tracking-wider text-brand-dark">
            Makaleler
          </h1>
          <p className="font-sans text-sm text-brand-gray mt-1">
            Blog makalelerini yönetin
          </p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="flex items-center gap-2 font-display font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg uppercase tracking-wider transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Makale
        </Link>
      </div>

{/* Liste filtreleri */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-gray" />
          <span className="font-display font-bold text-sm text-brand-dark">Filtrele:</span>
        </div>
        
{/* Durum filtresi */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'published')}
          className="px-4 py-2 border border-neutral-300 rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="draft">Taslak</option>
          <option value="published">Yayında</option>
        </select>

{/* Kategori filtresi */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-neutral-300 rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">Tüm Kategoriler</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

{/* İçerik */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="font-sans text-sm text-brand-gray">Makaleler yükleniyor...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-neutral-400" />
          </div>
          <h2 className="font-display font-bold text-xl text-brand-dark mb-2">
            {statusFilter === 'all' && categoryFilter === 'all' 
              ? 'Henüz makale yok'
              : 'Filtre kriterlerine uygun makale bulunamadı'
            }
          </h2>
          <p className="font-sans text-sm text-brand-gray mb-6">
            {statusFilter === 'all' && categoryFilter === 'all'
              ? 'İlk makalenizi oluşturarak başlayın'
              : 'Farklı filtreler deneyebilirsiniz'
            }
          </p>
          {statusFilter === 'all' && categoryFilter === 'all' && (
            <Link
              href="/dashboard/posts/new"
              className="inline-flex items-center gap-2 font-display font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg uppercase tracking-wider transition-colors"
            >
              <Plus className="w-4 h-4" />
              Yeni Makale
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-6 py-4 font-display font-bold text-sm text-brand-dark uppercase tracking-wider">
                    Makale
                  </th>
                  <th className="text-left px-6 py-4 font-display font-bold text-sm text-brand-dark uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="text-left px-6 py-4 font-display font-bold text-sm text-brand-dark uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="text-left px-6 py-4 font-display font-bold text-sm text-brand-dark uppercase tracking-wider">
                    Görüntülenme
                  </th>
                  <th className="text-left px-6 py-4 font-display font-bold text-sm text-brand-dark uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="text-right px-6 py-4 font-display font-bold text-sm text-brand-dark uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                          <Image
                            src={post.cover_image}
                            alt={post.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-display font-bold text-sm text-brand-dark line-clamp-1">
                            {post.title}
                          </h3>
                          <p className="font-sans text-xs text-brand-gray line-clamp-1 mt-1">
                            {post.excerpt}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {post.category ? (
                        <span className="font-sans text-sm text-brand-gray">
                          {post.category.name}
                        </span>
                      ) : (
                        <span className="font-sans text-sm text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(post.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-brand-gray" />
                        <span className="font-sans text-sm text-brand-gray">
                          {post.views.toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-sans text-sm text-brand-gray">
                        {new Date(post.created_at).toLocaleDateString('tr-TR')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/posts/${post.id}/edit`}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(post)}
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
          setPostToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Makaleyi Sil"
        message={`"${postToDelete?.title}" makalesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        variant="danger"
        isLoading={deleting}
      />
    </AdminLayout>
  );
}
