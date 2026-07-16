import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Download, Camera, Cat } from 'lucide-react';
import { ShareQueueItem } from '../types';
import html2canvas from 'html2canvas';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareList: ShareQueueItem[];
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
  shareList = [],
}: ShareCardModalProps) {
  const [selectedTheme, setSelectedTheme] = useState('white');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const theme = BG_THEMES.find((t) => t.id === selectedTheme) || BG_THEMES[0];

  if (!isOpen) return null;

  // Calculate grid layout classes and dimensions based on list size
  const getGridLayout = (total: number) => {
    if (total <= 1) return 'grid-cols-1';
    if (total === 2) return 'grid-cols-2';
    if (total === 3) return 'grid-cols-3';
    if (total === 4) return 'grid-cols-2 grid-rows-2';
    if (total <= 6) return 'grid-cols-3 grid-rows-2';
    return 'grid-cols-3 grid-rows-3';
  };

  const getCellSize = (total: number) => {
    if (total <= 1) return { container: 'w-32 h-[180px]', scaleFactor: 0.6 };
    if (total === 2) return { container: 'w-24 h-[135px]', scaleFactor: 0.45 };
    if (total === 3) return { container: 'w-20 h-[110px]', scaleFactor: 0.38 };
    if (total <= 4) return { container: 'w-24 h-[125px]', scaleFactor: 0.42 };
    if (total <= 6) return { container: 'w-20 h-[105px]', scaleFactor: 0.35 };
    return { container: 'w-18 h-[90px]', scaleFactor: 0.30 };
  };

  const { container, scaleFactor } = getCellSize(shareList.length);

  // Clean the descriptive text for a cleaner look in tight grids
  const cleanCaseTypeName = (name: string) => {
    return name
      .replace(/tutuboom訂製款/g, '')
      .replace(/訂製系列/g, '')
      .replace(/分離殼/g, '分離')
      .replace(/防摔殼/g, '防摔')
      .trim();
  };

  const handleDownload = async () => {
    const cardElement = document.getElementById('share-target-card');
    if (!cardElement) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardElement, {
        useCORS: true,
        scale: 2, // crisp double resolution
        backgroundColor: null,
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `Omnistate-Design-Share-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating share card image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
        {/* Animated Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-[420px] bg-white rounded-[28px] p-6 shadow-2xl flex flex-col items-center border border-black/5 my-8"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors text-stone-600 hover:text-black"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Title */}
          <div className="text-center mb-4 mt-2">
            <h3 className="text-sm font-bold text-stone-800">Share Card</h3>
            <p className="text-[10px] text-stone-400 mt-1">
              {shareList.length} 款設計對比
            </p>
          </div>

          {/* Theme Selector */}
          <div className="w-full mb-4 flex items-center justify-between bg-stone-100 p-1 rounded-full text-[10px]">
            <span className="pl-3 text-stone-500 font-medium flex items-center gap-1.5 select-none">
              <Palette className="h-3 w-3 text-stone-500" />
              <span>卡片主題</span>
            </span>
            <div className="flex gap-0.5">
              {BG_THEMES.map((themeOption) => (
                <button
                  key={themeOption.id}
                  onClick={() => setSelectedTheme(themeOption.id)}
                  className={`px-2.5 py-1 rounded-full transition-all font-semibold ${
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

          {/* The Premium 3:4 Aspect Ratio Card to Screenshot */}
          <div
            id="share-target-card"
            className={`aspect-[3/4] w-full rounded-[24px] p-5 shadow-lg relative overflow-hidden border flex flex-col justify-between transition-colors duration-500 mb-5 ${theme.bgClass} ${theme.borderClass}`}
            style={{
              boxShadow: '0 12px 30px -8px rgba(0,0,0,0.08)'
            }}
          >
            {/* Header block */}
            <div className="flex justify-between items-start border-b border-black/5 pb-2">
              <div>
                <h4 className="font-mono text-[9px] tracking-[0.2em] uppercase font-bold opacity-80">
                  OMNISTATE
                </h4>
                <p className="text-[8px] opacity-50 tracking-wider">
                  DESIGN CURATION
                </p>
              </div>
              <span className="text-[8px] font-mono font-bold tracking-widest uppercase bg-black text-brand-gold px-2 py-0.5 rounded-full scale-90 origin-right">
                {shareList.length} ITEMS
              </span>
            </div>

            {/* Center mockup grid */}
            <div className="flex-1 w-full flex items-center justify-center py-4 select-none">
              <div className={`grid ${getGridLayout(shareList.length)} gap-3 w-full justify-center items-center`}>
                {shareList.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/[0.03] dark:border-white/[0.03] transition-all relative"
                  >
                    {/* Mockup wrapper */}
                    <div className={`relative ${container} rounded-[14px] border border-slate-800/40 shadow-sm bg-slate-100 overflow-hidden flex items-center justify-center`}>
                      <div className="absolute inset-0 bg-white/75" />

                      {item.currentImage ? (
                        <img
                          src={item.currentImage}
                          alt={item.design.title}
                          className="max-h-full max-w-full object-contain pointer-events-none"
                          referrerPolicy="no-referrer"
                          style={{
                            transform: `scale(${item.caseImgScale}) translate(${item.caseImgX * scaleFactor}px, ${item.caseImgY * scaleFactor}px)`,
                          }}
                        />
                      ) : (
                        <div className="text-[8px] opacity-25">無預覽</div>
                      )}

                      {/* Stand overlay if configured */}
                      {item.standCutout && (
                        <div
                          className="absolute pointer-events-none select-none"
                          style={{
                            left: `${item.standX}%`,
                            top: `${item.standY}%`,
                            width: `${item.standSize}%`,
                            transform: `translate(-50%, -50%) rotate(${item.standRotate}deg)`,
                            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.22))',
                          }}
                        >
                          <img
                            src={item.standCutout}
                            alt="手機支架"
                            className="w-full h-auto object-contain pointer-events-none"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>

                    {/* Metadata below mockup */}
                    <div className="mt-1.5 w-full text-center px-0.5">
                      <p className={`text-[8px] font-bold truncate max-w-full leading-tight ${selectedTheme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
                        #{item.design.id} {item.design.title}
                      </p>
                      <p className={`text-[7px] truncate max-w-full mt-0.5 leading-tight ${selectedTheme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>
                        {cleanCaseTypeName(item.displayCaseType)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Elegant semi-transparent watermark background at the bottom of the card */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none opacity-[0.06] select-none text-center flex flex-col items-center">
              <span className="font-serif text-[18px] font-bold tracking-[0.25em] uppercase whitespace-nowrap">
                OMNISTATE
              </span>
              <span className="text-[7px] tracking-[0.5em] font-medium mt-0.5 whitespace-nowrap">
                萬有狀態
              </span>
            </div>

            {/* Row of cute cat logos inside the card */}
            <div className="flex justify-center items-center gap-1.5 my-1 opacity-50 select-none pointer-events-none">
              <Cat className="h-2.5 w-2.5 rotate-[-12deg]" />
              <Cat className="h-3 w-3 rotate-[-4deg]" />
              <Cat className="h-3.5 w-3.5 text-brand-gold animate-bounce" style={{ animationDuration: '3s' }} />
              <Cat className="h-3 w-3 rotate-[4deg]" />
              <Cat className="h-2.5 w-2.5 rotate-[12deg]" />
            </div>

            {/* Footer text */}
            <div className="border-t border-black/5 pt-2 flex justify-between items-end text-[8px]">
              <div>
                <h3 className="font-serif text-[10px] font-bold tracking-tight line-clamp-1 mb-0.5">
                  萬有狀態 Omnistate
                </h3>
                <p className={`text-[7px] tracking-wide ${theme.descColor}`}>
                  Omnistate
                </p>
              </div>
              <div className="text-right">
                <span className="block text-[7px] font-mono opacity-50 uppercase tracking-widest">
                  omnistate.cc.cd
                </span>
              </div>
            </div>
          </div>

          {/* Cute Cat Logo Row physically below the card */}
          <div className="flex items-center justify-center gap-1.5 py-2.5 opacity-80 animate-pulse select-none" style={{ animationDuration: '4s' }}>
            <span className="text-[10px] font-bold text-stone-400 mr-1 font-mono uppercase tracking-wider">CUTE NEKOS:</span>
            <Cat className="h-4 w-4 text-stone-300 hover:text-brand-gold transition-colors cursor-pointer" />
            <Cat className="h-4.5 w-4.5 text-stone-400 hover:text-brand-gold transition-colors cursor-pointer animate-bounce" style={{ animationDuration: '2.5s' }} />
            <Cat className="h-5 w-5 text-brand-gold hover:scale-110 transition-transform cursor-pointer" />
            <Cat className="h-4.5 w-4.5 text-stone-400 hover:text-brand-gold transition-colors cursor-pointer" />
            <Cat className="h-4 w-4 text-stone-300 hover:text-brand-gold transition-colors cursor-pointer" />
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-2">
            <div className="text-center text-[10.5px] text-stone-500 font-medium flex items-center justify-center gap-1.5 py-2 bg-stone-50 rounded-xl border border-stone-100">
              <Camera className="h-3.5 w-3.5 text-brand-gold animate-pulse" />
              <span>請直接透過螢幕截圖進行分享</span>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-1 py-2.5 border border-stone-200 text-stone-600 hover:text-black hover:bg-stone-50 rounded-full font-semibold text-xs transition-colors text-center cursor-pointer"
            >
              關閉視窗
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
