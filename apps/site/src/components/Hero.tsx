/**
 * Dosyanın görevi: Yönetilebilir ana mesajı tam genişlikte görsel, başlık ve yönlendirme bağlantısıyla sunar.
 * Kullanıldığı yerler: app/page.tsx
 */
import Image from 'next/image';
import Link from 'next/link';

interface HeroProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
  buttonText: string;
  buttonLink: string;
  label?: string;
}

/** Yönetilebilir ana mesajı tam genişlikte görsel, başlık ve yönlendirme bağlantısıyla sunar. */
export default function Hero({ title, subtitle, backgroundImage, buttonText, buttonLink, label }: HeroProps) {
  const href = buttonLink || '#posts';
  const isExternal = /^https?:\/\//.test(href);
  return (
    <section className="relative h-[650px] md:h-[800px] lg:h-[900px] w-full flex items-center justify-center text-center overflow-hidden bg-neutral-900">
      {backgroundImage && (
        <Image src={backgroundImage} alt="" fill priority sizes="100vw" className="object-cover object-center scale-105" />
      )}
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 max-w-5xl px-6 md:px-12 flex flex-col items-center gap-6 md:gap-8 mt-16 animate-fade-in">
        {label && <span className="inline-block px-4 py-1 bg-white/10 backdrop-blur-sm text-white text-sm font-display font-bold uppercase tracking-wider rounded-full border border-white/20">{label}</span>}
        <div className="flex flex-col gap-4">
          <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-wide leading-tight md:leading-none uppercase drop-shadow-lg">{title}</h1>
          <p className="font-sans text-white/90 text-lg sm:text-xl md:text-3xl font-light tracking-wider drop-shadow-md">{subtitle}</p>
        </div>
        {buttonText && (
          <Link href={href} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined} className="bg-white hover:bg-neutral-100 text-brand-dark font-display font-bold text-base sm:text-lg md:text-xl px-8 py-3.5 rounded-sm shadow-xl hover:-translate-y-0.5 transition-all border-2 border-white">
            {buttonText}
          </Link>
        )}
      </div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}
