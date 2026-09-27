/**
 * Dosyanın görevi: Ziraat mühendisinin Supabase profilini veya kurulum bekleyen güvenli varsayılan metni gösterir.
 * Kullanıldığı yerler: Next.js dosya tabanlı rota sistemi tarafından doğrudan yüklenir.
 */
import type { Metadata } from 'next';
import Image from 'next/image';
import { Mail, Phone, UserRound } from 'lucide-react';
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPublicProfile } from '@/services/publicService';

export const metadata: Metadata = {
  title: 'Hakkımda',
  description: 'Ziraat Notları blogunun arkasındaki ziraat mühendisi, uzmanlıkları ve iletişim bilgileri.',
};

/** Ziraat mühendisinin Supabase profilini veya kurulum bekleyen güvenli varsayılan metni gösterir. */
export default async function AboutPage() {
  const profile = await getPublicProfile();
  const name = profile?.name || 'Ziraat Mühendisi';
  const profession = profile?.profession || 'Ziraat Mühendisliği';
  const bio = profile?.bio || 'Tarımı bilimsel bilgi, saha deneyimi ve sürdürülebilir üretim yaklaşımıyla ele alan içerikler hazırlıyorum.';
  const socialLinks = [
    { label: 'Instagram', href: profile?.instagram, icon: FaInstagram },
    { label: 'Facebook', href: profile?.facebook, icon: FaFacebook },
    { label: 'Twitter', href: profile?.twitter, icon: FaTwitter },
    { label: 'LinkedIn', href: profile?.linkedin, icon: FaLinkedin },
  ].filter((item): item is typeof item & { href: string } => Boolean(item.href));

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="bg-neutral-950 text-white pt-40 pb-20 px-4 md:px-12">
          <div className="max-w-7xl mx-auto"><p className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-xs">Blogun Arkasında</p><h1 className="mt-4 font-display font-black text-4xl md:text-6xl uppercase">{name}</h1><p className="mt-4 text-xl text-neutral-300">{profession}</p></div>
        </section>
        <section className="max-w-7xl mx-auto px-4 md:px-12 py-16 md:py-24 grid lg:grid-cols-[minmax(280px,420px)_1fr] gap-12 lg:gap-20 items-start">
          <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden rounded-sm">
            {profile?.avatar_url ? <Image src={profile.avatar_url} alt={name} fill sizes="(max-width: 1024px) 100vw, 420px" className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center font-display text-8xl font-black text-emerald-600">{name.charAt(0)}</div>}
          </div>
          <div className="space-y-10">
            <div>
              <div className="flex items-center gap-3 text-emerald-600">
                <UserRound className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">Profesyonel Profil</span>
              </div>
              <h2 className="mt-4 font-display font-black text-3xl md:text-4xl uppercase">Hakkımda</h2>
              <p className="mt-6 text-lg text-brand-gray leading-8 whitespace-pre-line">{bio}</p>
            </div>

            {(profile?.email || profile?.phone) && (
              <div className="pt-8 border-t border-neutral-200">
                <h3 className="font-display font-bold text-lg uppercase">İletişim</h3>
                <div className="mt-4 flex flex-col sm:flex-row gap-5">
                  {profile.email && <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-3 text-sm font-bold hover:text-emerald-600"><Mail className="w-5 h-5" />{profile.email}</a>}
                  {profile.phone && <a href={`tel:${profile.phone}`} className="inline-flex items-center gap-3 text-sm font-bold hover:text-emerald-600"><Phone className="w-5 h-5" />{profile.phone}</a>}
                </div>
              </div>
            )}

            {socialLinks.length > 0 && (
              <div className="pt-8 border-t border-neutral-200">
                <h3 className="font-display font-bold text-lg uppercase">Sosyal Bağlantılar</h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  {socialLinks.map(({ label, href, icon: Icon }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-neutral-300 hover:border-emerald-500 hover:text-emerald-700 px-4 py-2.5 rounded-sm text-sm font-bold transition-colors">
                      <Icon className="w-4 h-4" />{label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer companyName="Ziraat Notları" profile={profile} />
    </div>
  );
}
