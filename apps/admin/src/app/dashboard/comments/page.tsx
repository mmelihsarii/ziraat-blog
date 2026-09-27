/**
 * Dosyanın görevi: Yorumları arama ve durum filtreleriyle listeler; onay, ret ve silme akışlarını yönetir.
 * Kullanıldığı yerler: Next.js dosya tabanlı rota sistemi tarafından doğrudan yüklenir.
 */
'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Star,
  Search,
  Clock
} from 'lucide-react';
import { 
  getAllComments, 
  approveComment, 
  rejectComment, 
  deleteComment,
  getCommentStats 
} from '@/services/supabaseService';
import type { AdminComment, CommentStats } from '@/types';
import { toast } from 'react-hot-toast';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

/** Yorumları arama ve durum filtreleriyle listeler; onay, ret ve silme akışlarını yönetir. */
export default function CommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [stats, setStats] = useState<CommentStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  /** Yorum listesini ve sayaçlarını aynı anda yükler. */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [commentsData, statsData] = await Promise.all([
        getAllComments(),
        getCommentStats(),
      ]);
      setComments(commentsData);
      setStats(statsData);
    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error);
      toast.error('Yorumlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, [loadData]);

  const filteredComments = useMemo(() => {
    let filtered = [...comments];

// Durum filtresi
    if (filterStatus !== 'all') {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

// Metin arama filtresi
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.author_name.toLowerCase().includes(query) ||
          c.author_email.toLowerCase().includes(query) ||
          c.content.toLowerCase().includes(query) ||
          c.post?.title.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [comments, filterStatus, searchQuery]);

  /** Bekleyen veya reddedilmiş yorumu public görünür hale getirir. */
  const handleApprove = async (commentId: string) => {
    try {
      setActionLoading(commentId);
      await approveComment(commentId);
      toast.success('Yorum onaylandı');
      await loadData();
    } catch (error) {
      console.error('Onaylama hatası:', error);
      toast.error('Yorum onaylanamadı');
    } finally {
      setActionLoading(null);
    }
  };

  /** Yorumu public görünümden kaldırıp reddedilmiş duruma taşır. */
  const handleReject = async (commentId: string) => {
    try {
      setActionLoading(commentId);
      await rejectComment(commentId);
      toast.success('Yorum reddedildi');
      await loadData();
    } catch (error) {
      console.error('Reddetme hatası:', error);
      toast.error('Yorum reddedilemedi');
    } finally {
      setActionLoading(null);
    }
  };

  /** Modalda seçilmiş yorumu kalıcı olarak siler. */
  const handleDelete = async () => {
    if (!selectedCommentId) return;

    try {
      setActionLoading(selectedCommentId);
      await deleteComment(selectedCommentId);
      toast.success('Yorum silindi');
      await loadData();
      setDeleteModalOpen(false);
      setSelectedCommentId(null);
    } catch (error) {
      console.error('Silme hatası:', error);
      toast.error('Yorum silinemedi');
    } finally {
      setActionLoading(null);
    }
  };

  /** Veritabanı yorum durumunu ikonlu Türkçe etikete dönüştürür. */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
            <Clock className="w-3 h-3" />
            Bekliyor
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
            <CheckCircle className="w-3 h-3" />
            Onaylandı
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded-full">
            <XCircle className="w-3 h-3" />
            Reddedildi
          </span>
        );
      default:
        return null;
    }
  };

  /** ISO tarihi yönetim ekranı için Türkçe tarih-saat metnine dönüştürür. */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
{/* Başlık alanı */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yorumlar</h1>
          <p className="mt-2 text-gray-600">Kullanıcı yorumlarını yönetin</p>
        </div>

{/* Özet sayaçları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <MessageSquare className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bekleyen</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Onaylanan</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reddedilen</p>
                <p className="text-3xl font-bold text-gray-600 mt-2">{stats.rejected}</p>
              </div>
              <XCircle className="w-12 h-12 text-gray-500 opacity-20" />
            </div>
          </div>
        </div>

{/* Filtre ve arama alanı */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
{/* Arama */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Yazar, e-posta, yorum veya makale ara..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

{/* Durum filtresi */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  filterStatus === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Bekleyen
              </button>
              <button
                onClick={() => setFilterStatus('approved')}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  filterStatus === 'approved'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Onaylanan
              </button>
              <button
                onClick={() => setFilterStatus('rejected')}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  filterStatus === 'rejected'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Reddedilen
              </button>
            </div>
          </div>
        </div>

{/* Yorum listesi */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Yorum bulunamadı</h3>
            <p className="text-gray-500">
              {searchQuery
                ? 'Arama kriterlerinize uygun yorum bulunamadı'
                : 'Henüz hiç yorum yapılmamış'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row gap-6">
{/* Yorum bilgileri */}
                  <div className="flex-1 space-y-4">
{/* Başlık alanı */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                          {comment.author_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{comment.author_name}</h3>
                          <p className="text-sm text-gray-500">{comment.author_email}</p>
                        </div>
                      </div>
                      {getStatusBadge(comment.status)}
                    </div>

{/* İlgili makale bağlantısı */}
                    {comment.post && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Makale:</span>
                        <button
                          onClick={() => window.open(`/makaleler/${comment.post?.slug}`, '_blank')}
                          className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                        >
                          {comment.post.title}
                        </button>
                      </div>
                    )}

{/* İçerik */}
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                      {comment.content}
                    </p>

{/* Tarih ve iletişim bilgileri */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {comment.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{comment.rating}/5</span>
                        </div>
                      )}
                      <span>{formatDate(comment.created_at)}</span>
                      {comment.approved_at && (
                        <span className="text-green-600">
                          Onaylandı: {formatDate(comment.approved_at)}
                        </span>
                      )}
                    </div>
                  </div>

{/* İşlem düğmeleri */}
                  <div className="flex lg:flex-col gap-2 lg:w-40">
                    {comment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(comment.id)}
                          disabled={actionLoading === comment.id}
                          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Onayla</span>
                        </button>
                        <button
                          onClick={() => handleReject(comment.id)}
                          disabled={actionLoading === comment.id}
                          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reddet</span>
                        </button>
                      </>
                    )}
                    
                    {comment.status === 'approved' && (
                      <button
                        onClick={() => handleReject(comment.id)}
                        disabled={actionLoading === comment.id}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reddet</span>
                      </button>
                    )}

                    {comment.status === 'rejected' && (
                      <button
                        onClick={() => handleApprove(comment.id)}
                        disabled={actionLoading === comment.id}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Onayla</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedCommentId(comment.id);
                        setDeleteModalOpen(true);
                      }}
                      disabled={actionLoading === comment.id}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Sil</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

{/* Silme onay penceresi */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedCommentId(null);
        }}
        onConfirm={handleDelete}
        title="Yorumu Sil"
        message="Bu yorumu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        variant="danger"
        isLoading={selectedCommentId ? actionLoading === selectedCommentId : false}
      />
    </AdminLayout>
  );
}
