/**
 * Dosyanın görevi: Makale, kategori, yorum ve görüntülenme özetlerini yöneticiye tek bakışta gösterir.
 * Kullanıldığı yerler: Next.js dosya tabanlı rota sistemi tarafından doğrudan yüklenir.
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, FolderTree, MessageSquare, Eye, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase/client';
import { getCommentStats } from '@/services/supabaseService';

/** Makale, kategori, yorum ve görüntülenme özetlerini yöneticiye tek bakışta gösterir. */
export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalCategories: 0,
    totalViews: 0,
    totalComments: 0,
    pendingComments: 0,
    approvedComments: 0,
  });
  const [loading, setLoading] = useState(true);

  /** Dashboard sayaçları için gerekli sorguları paralel çalıştırıp toplamları hesaplar. */
  const loadStats = useCallback(async () => {
    try {
      const [postsData, categoriesData, commentStats] = await Promise.all([
        supabase.from('posts').select('status, views'),
        supabase.from('categories').select('id'),
        getCommentStats(),
      ]);

      const posts = (postsData.data || []) as Array<{ status: string; views: number }>;
      const categories = categoriesData.data || [];

      const publishedCount = posts.filter(p => p.status === 'published').length;
      const draftCount = posts.filter(p => p.status === 'draft').length;
      const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);

      setStats({
        totalPosts: posts.length,
        publishedPosts: publishedCount,
        draftPosts: draftCount,
        totalCategories: categories.length,
        totalViews,
        totalComments: commentStats.total,
        pendingComments: commentStats.pending,
        approvedComments: commentStats.approved,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadStats);
  }, [loadStats]);

  const statCards = [
    {
      title: 'Toplam Makale',
      value: stats.totalPosts,
      icon: FileText,
      color: 'bg-blue-500',
      href: '/dashboard/posts',
    },
    {
      title: 'Yayınlanan',
      value: stats.publishedPosts,
      icon: TrendingUp,
      color: 'bg-green-500',
      href: '/dashboard/posts?status=published',
    },
    {
      title: 'Taslak',
      value: stats.draftPosts,
      icon: FileText,
      color: 'bg-yellow-500',
      href: '/dashboard/posts?status=draft',
    },
    {
      title: 'Kategoriler',
      value: stats.totalCategories,
      icon: FolderTree,
      color: 'bg-purple-500',
      href: '/dashboard/categories',
    },
    {
      title: 'Toplam Görüntülenme',
      value: stats.totalViews.toLocaleString('tr-TR'),
      icon: Eye,
      color: 'bg-emerald-500',
      href: '/dashboard/posts',
    },
    {
      title: 'Toplam Yorum',
      value: stats.totalComments,
      icon: MessageSquare,
      color: 'bg-cyan-500',
      href: '/dashboard/comments',
    },
    {
      title: 'Bekleyen Yorum',
      value: stats.pendingComments,
      icon: Clock,
      color: 'bg-orange-500',
      href: '/dashboard/comments',
      badge: stats.pendingComments > 0,
    },
    {
      title: 'Onaylanan Yorum',
      value: stats.approvedComments,
      icon: CheckCircle,
      color: 'bg-teal-500',
      href: '/dashboard/comments',
    },
  ];

  return (
    <AdminLayout>
{/* Başlık alanı */}
      <div className="mb-8">
        <h1 className="font-display font-black text-3xl uppercase tracking-wider text-brand-dark">
          Dashboard
        </h1>
        <p className="font-sans text-sm text-brand-gray mt-1">
          Blog yönetim paneline hoş geldiniz
        </p>
      </div>

{/* Özet sayaçları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow relative"
            >
              {card.badge && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-sans text-sm text-brand-gray mb-1">
                    {card.title}
                  </p>
                  <p className="font-display font-black text-3xl text-brand-dark">
                    {loading ? '—' : card.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

{/* Hızlı işlemler */}
      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
        <h2 className="font-display font-bold text-xl uppercase tracking-wider text-brand-dark mb-6">
          Hızlı İşlemler
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/posts/new"
            className="flex items-center gap-4 p-4 border-2 border-neutral-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all"
          >
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-brand-dark">
                Yeni Makale Oluştur
              </h3>
              <p className="font-sans text-xs text-brand-gray mt-0.5">
                Blog için yeni içerik ekleyin
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/categories/new"
            className="flex items-center gap-4 p-4 border-2 border-neutral-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FolderTree className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-brand-dark">
                Yeni Kategori Oluştur
              </h3>
              <p className="font-sans text-xs text-brand-gray mt-0.5">
                Yeni içerik kategorisi tanımlayın
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/comments"
            className="flex items-center gap-4 p-4 border-2 border-neutral-200 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-all"
          >
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-cyan-600" />
            </div>
            <div className="flex items-center gap-2">
              <div>
                <h3 className="font-display font-bold text-sm text-brand-dark">
                  Yorumları Yönet
                </h3>
                <p className="font-sans text-xs text-brand-gray mt-0.5">
                  Bekleyen yorumları inceleyin
                </p>
              </div>
              {stats.pendingComments > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {stats.pendingComments}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
