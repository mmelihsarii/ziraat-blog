/**
 * Dosyanın görevi: Makalenin arama motoru başlığını, açıklamasını ve sosyal paylaşım görselini içerikten üretir.
 * Kullanıldığı yerler: app/makaleler/[slug]/page.tsx
 */
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Clock, Eye } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CommentForm from '@/components/CommentForm';
import CommentList from '@/components/CommentList';
import ArticleActions from '@/components/ArticleActions';
import ProtectedArticleContent from '@/components/ProtectedArticleContent';
import { sanitizeRichText } from '@/lib/sanitize';
import { getApprovedCommentsByPostId, getPublishedPostBySlug, getPublicProfile } from '@/services/publicService';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

/** Makalenin arama motoru başlığını, açıklamasını ve sosyal paylaşım görselini içerikten üretir. */
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: 'Makale Bulunamadı' };
  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    alternates: { canonical: `/makaleler/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      images: post.cover_image ? [{ url: post.cover_image, alt: post.title }] : [],
      publishedTime: post.published_at || post.created_at,
      tags: post.tags,
    },
  };
}

/** Slug ile makale ve yorumları sunucuda getirip güvenli, SEO uyumlu detay sayfasını oluşturur. */
export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();
  const [comments, profile] = await Promise.all([
    getApprovedCommentsByPostId(post.id),
    getPublicProfile(),
  ]);
  const formattedDate = new Intl.DateTimeFormat('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(post.published_at || post.created_at));

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#121416] selection:bg-emerald-500 selection:text-black">
      <Header />
      <section className="relative h-[480px] sm:h-[650px] md:h-[800px] w-full bg-neutral-900 flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image src={post.cover_image} alt={post.title} fill priority sizes="100vw" className="object-cover object-center" />
          <div className="absolute inset-0 bg-black/45" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20 w-full">
          <div className="max-w-4xl space-y-6 sm:space-y-8">
            <nav aria-label="İçerik yolu" className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-white/80 uppercase tracking-[0.2em]">
              <Link href="/" className="hover:text-emerald-300">Ana Sayfa</Link><span className="text-white/40">/</span>
              {post.category && <><Link href={`/makaleler?kategori=${encodeURIComponent(post.category.name)}`} className="hover:text-emerald-300">{post.category.name}</Link><span className="text-white/40">/</span></>}
              <span className="text-white/60 truncate max-w-xs">{post.title}</span>
            </nav>
            {post.category && <span className="inline-block bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-300 text-[10px] tracking-[0.2em] font-bold px-4 py-1.5 uppercase rounded-full">{post.category.name}</span>}
            <div className="space-y-4">
              <h1 className="font-display text-2xl sm:text-4xl md:text-6xl font-extrabold uppercase text-white leading-[1.1] drop-shadow-lg max-w-4xl">{post.title}</h1>
              <p className="font-serif text-lg sm:text-2xl md:text-3xl text-neutral-200 font-light leading-relaxed max-w-3xl italic">{post.excerpt}</p>
            </div>
            <div className="flex flex-wrap items-center gap-y-4 gap-x-6 pt-4 border-t border-white/20 text-white/90 text-xs font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2"><span className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-black">Z</span>Ziraat Mühendisi</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-400" />{post.reading_time} dk okuma</span>
              <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-emerald-400" />{post.views} görüntülenme</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </section>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <ProtectedArticleContent html={sanitizeRichText(post.content)} />
        {post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-12 pt-8 border-t border-neutral-200">
            <span className="font-display text-sm font-bold text-neutral-500 uppercase">Etiketler:</span>
            {post.tags.map((tag) => <span key={tag} className="px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full">#{tag}</span>)}
          </div>
        )}
        <div className="mt-12"><ArticleActions postId={post.id} title={post.title} /></div>
        <div className="flex justify-center pt-12">
          <Link href="/makaleler" className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-black text-white font-display font-bold px-8 py-4 rounded-lg uppercase tracking-wider text-sm"><ChevronLeft className="w-5 h-5" />Tüm Makaleler</Link>
        </div>
        <section className="mt-16 pt-16 border-t border-neutral-200 space-y-12">
          <CommentList comments={comments} />
          <CommentForm postId={post.id} />
        </section>
      </main>
      <Footer companyName="Ziraat Notları" profile={profile} />
    </div>
  );
}
