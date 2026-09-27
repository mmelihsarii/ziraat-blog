/**
 * Dosyanın görevi: Öne çıkan makaleyi ana akışın ortasında tam genişlikte ikincil çağrı alanı olarak gösterir.
 * Kullanıldığı yerler: app/page.tsx
 */
import Link from 'next/link';

interface MidBannerProps {
  title: string;
  subtitle: string;
  category?: string;
  backgroundImage?: string;
  buttonText: string;
  href: string;
}

/** Öne çıkan makaleyi ana akışın ortasında tam genişlikte ikincil çağrı alanı olarak gösterir. */
export default function MidBanner({ title, subtitle, category, backgroundImage, buttonText, href }: MidBannerProps) {
  return (
    <section className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center text-center overflow-hidden my-12 bg-neutral-900">
      {backgroundImage && <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${backgroundImage}')` }} />}
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 max-w-5xl px-6 md:px-12 flex flex-col items-center gap-6">
        {category && <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white font-display font-bold text-xs md:text-sm px-4 py-2 rounded-sm uppercase tracking-widest">{category}</span>}
        <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-tight leading-tight md:leading-none uppercase max-w-4xl">{title}</h2>
        <p className="text-neutral-200 text-sm sm:text-base md:text-lg lg:text-xl font-light max-w-2xl leading-relaxed">{subtitle}</p>
        <Link href={href} className="bg-white hover:bg-neutral-50 text-emerald-600 hover:text-emerald-700 font-display font-bold text-sm sm:text-base md:text-lg px-8 py-3.5 rounded-sm shadow-xl uppercase tracking-widest mt-4">{buttonText}</Link>
      </div>
    </section>
  );
}
