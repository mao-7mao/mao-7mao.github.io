import React from 'react';
import { ChevronDown, Sparkles, Image, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-start overflow-hidden px-4 sm:px-8 md:px-16 pt-28 pb-20">
      {/* Editorial High-Res Photo Banner Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-55 transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(240,240,245,0.2) 0%, rgba(240,240,245,0.7) 100%), url("https://pub-ee3a4255fbd840f589cf8057238045a5.r2.dev/type/banner.webp")`,
        }}
      />

      {/* Decorative Brand Circles */}
      <div className="absolute right-0 bottom-0 w-[45vw] h-[45vw] rounded-full bg-blue-300/10 blur-[130px] pointer-events-none" />
      <div className="absolute left-1/4 top-10 w-[30vw] h-[30vw] rounded-full bg-pink-300/10 blur-[100px] pointer-events-none" />

      {/* Content in a pristine Frosted Glass Bubble */}
      <div className="relative z-10 max-w-2xl glass-frosted rounded-[36px] p-8 md:p-12 text-brand-text shadow-2xl border border-white/50 backdrop-blur-3xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-2 mb-4"
        >
          <span className="h-2 w-2 rounded-full bg-black animate-pulse" />
          <span className="font-mono text-xs tracking-[0.25em] text-black/50 uppercase flex items-center gap-1.5 font-bold">
            <Sparkles className="h-3.5 w-3.5 text-brand-gold animate-spin" style={{ animationDuration: '6s' }} />
            Omnistate V2 · Studio Commerce
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6 text-black"
        >
          萬有狀態 <br />
          <span className="font-serif italic font-normal text-brand-gold text-2xl sm:text-3xl md:text-4xl mt-1 block">
            Omnistate
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-sans font-medium text-xs sm:text-sm text-black/75 leading-relaxed max-w-lg mb-8"
        >
          萬有狀態の客製化手機殼🫧
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap gap-4"
        >
          <button
            onClick={() => scrollToSection('product-viewer')}
            className="group flex items-center gap-2 bg-black text-white hover:scale-[1.02] transition-transform font-mono text-xs tracking-wider uppercase px-6 py-4 rounded-full shadow-md font-semibold"
          >
            <Compass className="h-4 w-4 group-hover:rotate-45 transition-transform" />
            <span>開始配置殼體</span>
          </button>

          <button
            onClick={() => scrollToSection('gallery-section')}
            className="flex items-center gap-2 bg-white/40 hover:bg-white/60 border border-white/50 hover:border-black/10 transition-all text-black font-mono text-xs tracking-wider uppercase px-6 py-4 rounded-full backdrop-blur-md shadow-sm font-semibold"
          >
            <Image className="h-4 w-4 text-brand-gold" />
            <span>瀏覽全品類</span>
          </button>
        </motion.div>
      </div>

      {/* Chevron down indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, delay: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-black/40 cursor-pointer"
        onClick={() => scrollToSection('product-viewer')}
      >
        <ChevronDown className="h-6 w-6" />
      </motion.div>
    </section>
  );
}
