import React from 'react';
import { Sparkles, Pin, Bell, Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section
      id="hero"
      className="relative min-h-[75vh] sm:min-h-[85vh] lg:min-h-[90vh] flex items-center justify-start overflow-hidden w-full px-3.5 sm:px-8 md:px-16 pt-16 sm:pt-24 pb-10 sm:pb-20"
    >
      {/* Editorial High-Res Photo Banner Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 transition-transform duration-1000 scale-105 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(250,248,252,0.4) 0%, rgba(250,248,252,0.9) 100%), url("https://pub-ee3a4255fbd840f589cf8057238045a5.r2.dev/type/banner.webp")`,
        }}
      />

      {/* Subtle Ambient Decorative Circles */}
      <div className="absolute right-0 bottom-0 w-[45vw] h-[45vw] rounded-full bg-purple-300/15 blur-[140px] pointer-events-none" />
      <div className="absolute left-1/4 top-10 w-[30vw] h-[30vw] rounded-full bg-pink-200/15 blur-[120px] pointer-events-none" />

      {/* Content in a pristine Frosted Glass Bubble */}
      <div className="relative z-10 w-full max-w-2xl bg-white/85 rounded-[28px] sm:rounded-[36px] p-5 sm:p-8 md:p-10 text-brand-text shadow-[0_12px_40px_rgba(139,92,246,0.06)] border border-purple-200/80 backdrop-blur-2xl">
        {/* Step 1: Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: 'easeOut' }}
          className="flex items-center gap-2 mb-3 sm:mb-4"
        >
          <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-purple-600 animate-pulse" />
          <span className="font-mono text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] text-purple-800 bg-purple-50/90 px-2.5 py-1 rounded-full border border-purple-200/60 uppercase flex items-center gap-1.5 font-bold">
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-purple-600 animate-spin" style={{ animationDuration: '6s' }} />
            Omnistate · STUDIO
          </span>
        </motion.div>

        {/* Step 2: Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15, ease: 'easeOut' }}
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] sm:leading-[1.1] tracking-tight mb-2 sm:mb-3 text-[#231F2E]"
        >
          萬有狀態 <br />
          <span className="font-serif italic font-normal text-[#8B5CF6] text-xl sm:text-2xl md:text-3xl mt-0.5 block">
            Omnistate
          </span>
        </motion.h1>

        {/* Step 3: Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25, ease: 'easeOut' }}
          className="font-sans font-medium text-xs sm:text-sm text-[#746B84] leading-relaxed max-w-lg mb-5"
        >
          萬有狀態之客製化手機殼🫧
        </motion.p>

        {/* Step 4: Sticky Note Bulletin / Notice Board (便利貼更新說明) */}
        <motion.div
          initial={{ opacity: 0, y: 12, rotate: -0.5 }}
          animate={{ opacity: 1, y: 0, rotate: -0.5 }}
          transition={{ duration: 0.4, delay: 0.35, ease: 'easeOut' }}
          className="relative bg-gradient-to-br from-amber-50/90 via-[#fefbf6]/90 to-purple-50/70 border border-amber-200/70 rounded-2xl p-4 sm:p-5 shadow-[0_8px_25px_rgba(217,119,6,0.08)] backdrop-blur-md"
        >
          {/* Top Tape Graphic Effect */}
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-white/70 border border-amber-200/60 rounded-xs shadow-xs backdrop-blur-xs rotate-[-1deg] pointer-events-none" />

          {/* Header of Sticky Note */}
          <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-amber-200/50">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs sm:text-sm font-serif">
              <Pin className="h-3.5 w-3.5 text-amber-600 fill-amber-500 shrink-0" />
              <span>Notice Memo</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-amber-800/80 bg-amber-100/60 px-2 py-0.5 rounded-md font-semibold shrink-0">
              <Calendar className="h-3 w-3" />
              <span>2026/08/28 更新</span>
            </div>
          </div>

          {/* Bulletin Items */}
          <div className="space-y-2.5 text-xs text-[#5C5468] leading-relaxed">
            <div className="flex items-start gap-2 bg-white/60 p-2.5 rounded-xl border border-amber-100/80">
              <span className="text-sm shrink-0">✨</span>
              <div>
                <span className="font-bold text-[#231F2E]">【全系列圖款上新】</span>
                <span>tutuboom單層圖款淡色系 單層浮雕圖款</span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-white/60 p-2.5 rounded-xl border border-amber-100/80">
              <span className="text-sm shrink-0">🏷️</span>
              <div>
                <span className="font-bold text-[#231F2E]">【ModNX調漲】</span>
                <span>預計9月3日調漲</span>
              </div>
            </div>


          </div>

          {/* Quick Action Footer in Memo */}
          <div className="mt-3 pt-2.5 border-t border-amber-200/50 flex items-center justify-between">
            <span className="text-[10px] text-amber-800/70 italic font-mono">
              * 具體庫存與現貨情況以私訊確認為準
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
