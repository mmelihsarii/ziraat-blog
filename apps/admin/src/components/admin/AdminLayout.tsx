/**
 * Dosyanın görevi: Yetkili yönetim ekranlarını ortak kenar çubuğu, kullanıcı bilgisi ve çıkış işlemiyle sarar.
 * Kullanıldığı yerler: app/dashboard/categories/new/page.tsx, app/dashboard/categories/page.tsx, app/dashboard/categories/[id]/edit/page.tsx, app/dashboard/comments/page.tsx, app/dashboard/content/hero/page.tsx, app/dashboard/page.tsx ve 4 dosya daha
 */
'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderTree, 
  FileText, 
  MessageSquare,
  ImageIcon,
  UserRound,
  LogOut, 
  Menu, 
  X,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface AdminLayoutProps {
  children: ReactNode;
}

/** Yetkili yönetim ekranlarını ortak kenar çubuğu, kullanıcı bilgisi ve çıkış işlemiyle sarar. */
export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    /** Kenar çubuğunda gösterilecek kullanıcıyı doğrular; geçersiz oturumda girişe döner. */
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
      } else {
        setUserEmail(user.email || null);
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  /** Supabase oturumunu kapatıp giriş sayfasına geri döner. */
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Başarıyla çıkış yapıldı');
      router.push('/login');
    } catch {
      toast.error('Çıkış yapılırken bir hata oluştu');
    }
  };

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/dashboard/categories',
      label: 'Kategoriler',
      icon: FolderTree,
    },
    {
      href: '/dashboard/posts',
      label: 'Makaleler',
      icon: FileText,
    },
    {
      href: '/dashboard/comments',
      label: 'Yorumlar',
      icon: MessageSquare,
    },
    {
      href: '/dashboard/content/hero',
      label: 'Hero Yönetimi',
      icon: ImageIcon,
    },
    {
      href: '/dashboard/profile',
      label: 'Profil',
      icon: UserRound,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-emerald-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-display font-bold text-lg uppercase tracking-wider">
            Yükleniyor...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
{/* Mobil menü düğmesi */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        aria-label="Menüyü aç/kapat"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

{/* Yönetim kenar çubuğu */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-neutral-200 z-40 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
{/* Site logosu */}
          <div className="p-6 border-b border-neutral-200">
            <Link href="/dashboard">
              <h1 className="font-display font-black text-2xl uppercase tracking-wider text-brand-dark">
                Ziraat Blog
              </h1>
              <p className="font-sans text-xs text-brand-gray mt-1">
                Admin Panel
              </p>
            </Link>
          </div>

{/* Gezinme bağlantıları */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-display font-bold text-sm transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-brand-dark hover:bg-neutral-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

{/* Oturum bilgisi ve çıkış */}
          <div className="p-4 border-t border-neutral-200">
            <div className="mb-3 px-2">
              <p className="font-sans text-xs text-brand-gray">Oturum açan:</p>
              <p className="font-display font-bold text-sm text-brand-dark truncate">
                {userEmail}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-3 rounded-lg font-display font-bold text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Çıkış Yap
            </button>
          </div>
        </div>
      </aside>

{/* Mobil menü arka planı */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}

      {/* Ana içerik */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
