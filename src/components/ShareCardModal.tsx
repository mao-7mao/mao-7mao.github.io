import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Palette, Camera } from 'lucide-react';
import { Design } from '../data/productsData';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  design: Design;
  currentImage: string;
  caseImgScale: number;
  caseImgX: number;
  caseImgY: number;
  standCutout: string | null;
  standX: number;
  standY: number;
  standSize: number;
  standRotate: number;
  displayCaseType: string;
  currentPrice: string;
}

const BG_THEMES = [
  { id: 'white', name: '藝廊白', bgClass: 'bg-[#FAF9F6] text-stone-900', borderClass: 'border-stone-200/80', descColor: 'text-stone-500' },
  { id: 'dark', name: '極致黑', bgClass: 'bg-[#121212] text-stone-100', borderClass: 'border-stone-800', descColor: 'text-stone-400' },
  { id: 'cream', name: '香檳杏', bgClass: 'bg-[#F4F0E6] text-[#4A3B32]', borderClass: 'border-[#E3DAC9]', descColor: 'text-[#6E5D53]' },
  { id: 'sage', name: '雅緻綠', bgClass: 'bg-[#DFE3DB] text-[#2C352D]', borderClass: 'border-[#CDD3C7]', descColor: 'text-[#4A5348]' },
];

export default function ShareCardModal({
  isOpen,
  onClose,
  design,
  currentImage,
  caseImgScale,
  caseImgX,
  caseImgY,
  standCutout,
  standX,
  standY,
  standSize,
  standRotate,
  displayCaseType,
  currentPrice,
}: ShareCardModalProps) {
  const [selectedTheme, setSelectedTheme] = useState('white');
  const theme = BG_THEMES.find((t) => t.id === selectedTheme) || BG_THEMES[0];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        {/* Animated Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-[380px] bg-white rounded-[28px] p-6 shadow-2xl flex flex-col items-center border border-black/5"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors text-stone-600 hover:text-black"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Theme Selector */}
          <div className="w-full mb-5 flex items-center justify-between bg-stone-100 p-1 rounded-full text-xs mt-2">
            <span className="pl-3 text-stone-500 font-medium flex items-center gap-1.5 select-none">
              <Palette className="h-3.5 w-3.5 text-stone-500" />
              <span>卡片主題</span>
            </span>
            <div className="flex gap-1">
              {BG_THEMES.map((themeOption) => (
                <button
                  key={themeOption.id}
                  onClick={() => setSelectedTheme(themeOption.id)}
                  className={`px-3 py-1.5 rounded-full transition-all font-semibold ${
                    selectedTheme === themeOption.id
                      ? 'bg-black text-white shadow-sm'
                      : 'text-stone-600 hover:text-black'
                  }`}
                >
                  {themeOption.name}
                </button>
              ))}
            </div>
          </div>

          {/* The 3:4 Premium Aspect Ratio Card to Screenshot */}
          <div
            id="share-target-card"
            className={`aspect-[3/4] w-full rounded-[24px] p-5 shadow-lg relative overflow-hidden border flex flex-col justify-between transition-colors duration-500 mb-5 ${theme.bgClass} ${theme.borderClass}`}
            style={{
              boxShadow: '0 12px 30px -8px rgba(0,0,0,0.08)'
            }}
          >
            {/* Header block */}
            <div className="flex justify-between items-start border-b border-black/5 pb-2.5">
              <div>
                <h4 className="font-mono text-[10px] tracking-[0.2em] uppercase font-bold opacity-75">
                  OMNISTATE
                </h4>
                <p className="text-[9px] opacity-50 mt-0.5 tracking-wider">
                  {design.id || 'CUST-01'}
                </p>
              </div>
              {design.badge && (
                <span className="text-[9px] font-mono font-bold tracking-widest uppercase bg-black text-brand-gold px-2 py-0.5 rounded-full scale-90 origin-right">
                  {design.badge}
                </span>
              )}
            </div>

            {/* Center mock stage */}
            <div className="flex-1 w-full flex items-center justify-center py-3 select-none">
              <div className="relative w-36 h-[200px] rounded-[20px] border-2 border-slate-800/80 shadow-md bg-slate-100 overflow-hidden flex items-center justify-center">
                {/* Clean interior background */}
                <div className="absolute inset-0 bg-white/80" />

                {/* Case texture */}
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={design.title}
                    className="max-h-full max-w-full object-contain pointer-events-none"
                    referrerPolicy="no-referrer"
                    style={{
                      transform: `scale(${caseImgScale}) translate(${caseImgX * 0.6}px, ${caseImgY * 0.6}px)`,
                    }}
                  />
                ) : (
                  <div className="text-center opacity-25 text-xs">無預覽效果</div>
                )}

                {/* Stand Overlay if enabled */}
                {standCutout && (
                  <div
                    className="absolute pointer-events-none select-none"
                    style={{
                      left: `${standX}%`,
                      top: `${standY}%`,
                      width: `${standSize}%`,
                      transform: `translate(-50%, -50%) rotate(${standRotate}deg)`,
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))',
                    }}
                  >
                    <img
                      src={standCutout}
                      alt="手機支架"
                      className="w-full h-auto object-contain pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer text / Specifications */}
            <div className="border-t border-black/5 pt-3 flex justify-between items-end">
              <div>
                <h3 className="font-serif text-sm font-bold tracking-tight line-clamp-1 mb-0.5">
                  {design.title}
                </h3>
                <p className={`text-[9px] tracking-wide ${theme.descColor}`}>
                  {displayCaseType}
                </p>
              </div>
              <div className="text-right">

                <span className="block text-[8px] font-mono opacity-40 uppercase tracking-widest mt-0.5">
                  omnistate.cc.cd
                </span>
              </div>
            </div>
          </div>

          {/* Screenshot hint instead of a download button */}
          <div className="w-full mb-4 flex items-start gap-2 bg-stone-50 border border-stone-200/70 rounded-2xl p-3">
            <Camera className="h-4 w-4 text-stone-500 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-stone-500">
              可直接使用裝置的<b className="text-stone-700">截圖功能</b>保存此卡片。
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-black text-white hover:bg-stone-900 rounded-full font-semibold text-xs tracking-wider uppercase transition-colors shadow-md text-center"
          >
            關閉視窗
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
