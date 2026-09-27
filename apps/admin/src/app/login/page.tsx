/**
 * Dosyanın görevi: Supabase e-posta/şifre oturumunu başlatan yönetici giriş ekranını sunar.
 * Kullanıldığı yerler: Next.js dosya tabanlı rota sistemi tarafından doğrudan yüklenir.
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

/** Supabase e-posta/şifre oturumunu başlatan yönetici giriş ekranını sunar. */
function LoginForm() {
  const router = useRouter();
  const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /** Girilen yönetici bilgilerini doğrular ve başarılı oturumda dashboard'a geçer. */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', data.user.id)
          .maybeSingle();
        if (!profile?.is_admin) {
          await supabase.auth.signOut();
          throw new Error('Bu hesabın yönetim paneline erişim yetkisi bulunmuyor.');
        }
        router.replace('/dashboard');
        router.refresh();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px] lg:min-h-[700px]">
          
          {/* Karşılama bölümü */}
          <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 p-8 md:p-12 lg:p-16 flex flex-col justify-center text-white overflow-hidden">
            {/* Mevcut arka plan deseni */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            <div className="relative z-10 space-y-6 animate-fade-in">
{/* Site logosu */}
              <div className="space-y-2">
                <a href={publicSiteUrl} className="inline-flex items-baseline cursor-pointer select-none group">
                  <span className="font-sans italic font-light text-xl md:text-2xl tracking-tight text-white/80 group-hover:text-white transition-colors">Ziraat</span>
                  <span className="font-display font-black text-2xl md:text-3xl ml-1 tracking-tight text-white">
                    Notları
                  </span>
                </a>
                <div className="w-16 h-1 bg-white/30 rounded-full" />
              </div>

              {/* Karşılama metni */}
              <div className="space-y-4 pt-4">
                <h1 className="font-display font-black text-3xl md:text-4xl lg:text-5xl uppercase tracking-wide leading-tight">
                  Tekrar Hoş Geldiniz
                </h1>
                <p className="font-sans text-white/90 text-base md:text-lg leading-relaxed max-w-md">
                  Makaleleri, kategorileri, yorumları ve site içeriğini tek panelden yönetin.
                </p>
              </div>

              {/* Yönetim özellikleri listesi */}
              <div className="space-y-3 pt-4">
                {['Makaleleri yayınlayın', 'Yorumları yönetin', 'İstatistikleri takip edin'].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    <span className="font-sans text-sm text-white/80">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Giriş formu bölümü */}
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full space-y-8">
              
              {/* Form başlığı */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-600">
                  <LogIn className="w-5 h-5" />
                  <span className="font-display text-xs font-bold tracking-[0.2em] uppercase">Yönetici Girişi</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold tracking-wider text-neutral-900 uppercase">
                  Giriş Yap
                </h2>
                <p className="font-sans text-sm text-neutral-500">
                  Yönetim paneline erişmek için bilgilerinizi girin
                </p>
              </div>

              {/* Hata bildirimi */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-display font-bold text-sm uppercase tracking-wider">
                      Giriş Başarısız
                    </h4>
                    <p className="font-sans text-xs leading-relaxed">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Oturum açma alanları */}
              <form onSubmit={handleSubmit} className="space-y-6">
                
{/* E-posta alanı */}
                <div className="space-y-1">
                  <label htmlFor="email" className="block font-display text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                    E-posta Adresi
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-white border border-neutral-200 rounded px-4 py-3.5 pl-11 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all h-14 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

{/* Şifre alanı */}
                <div className="space-y-1">
                  <label htmlFor="password" className="block font-display text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                    Şifre
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      placeholder="Şifrenizi girin"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-white border border-neutral-200 rounded px-4 py-3.5 pl-11 pr-11 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all h-14 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

{/* Kaydetme düğmesi */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full font-display text-sm font-bold tracking-[0.2em] bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-all flex items-center justify-center gap-3 h-14 uppercase disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] shadow-md hover:shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Giriş Yapılıyor...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Giriş Yap</span>
                    </>
                  )}
                </button>
              </form>

{/* Ana sayfaya dönüş */}
              <div className="text-center pt-4 border-t border-neutral-100">
                <a
                  href={publicSiteUrl}
                  className="font-sans text-sm text-neutral-500 hover:text-emerald-600 transition-colors inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Ana Sayfaya Dön
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/** Yönetici giriş formunu doğrudan render eder. */
export default function LoginPage() {
  return <LoginForm />;
}
