import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Cat } from 'lucide-react';
import { ShareQueueItem } from '../types';
import html2canvas from 'html2canvas';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareList: ShareQueueItem[];
}

interface DynamicCardStyle {
  bgColor: string;
  isDark: boolean;
  textColor: string;
  subTextColor: string;
  borderColor: string;
  itemBg: string;
  itemBorder: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
}

const DEFAULT_STYLE: DynamicCardStyle = {
  bgColor: '#FAF9F6',
  isDark: false,
  textColor: '#1F1C24',
  subTextColor: '#746B84',
  borderColor: 'rgba(0, 0, 0, 0.08)',
  itemBg: 'rgba(0, 0, 0, 0.03)',
  itemBorder: 'rgba(0, 0, 0, 0.05)',
  badgeBg: '#1F1C24',
  badgeText: '#C5A880',
  accentColor: '#C5A880',
};

export default function ShareCardModal({
  isOpen,
  onClose,
  shareList = [],
}: ShareCardModalProps) {
  const [cardStyle, setCardStyle] = useState<DynamicCardStyle>(DEFAULT_STYLE);
  const [isExtractingColor, setIsExtractingColor] = useState(false);

  // Extract the largest area dominant color from the selected images
  useEffect(() => {
    if (!isOpen || shareList.length === 0) {
      setCardStyle(DEFAULT_STYLE);
      return;
    }

    const primaryImgUrl = shareList.find((item) => item.currentImage)?.currentImage;
    if (!primaryImgUrl) {
      setCardStyle(DEFAULT_STYLE);
      return;
    }

    setIsExtractingColor(true);

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = primaryImgUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const size = 64;
        canvas.width = size;
        canvas.height = size;

        if (!ctx) {
          setIsExtractingColor(false);
          return;
        }

        ctx.drawImage(img, 0, 0, size, size);
        const imgData = ctx.getImageData(0, 0, size, size).data;

        // Bucket color frequencies (5 bits per RGB channel = 32 bins per channel)
        const colorCounts: { [key: string]: { r: number; g: number; b: number; count: number } } = {};

        for (let i = 0; i < imgData.length; i += 4) {
          const a = imgData[i + 3];
          if (a < 50) continue; // Skip transparent background

          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];

          // Quantize to step of 16
          const qR = Math.floor(r / 16) * 16;
          const qG = Math.floor(g / 16) * 16;
          const qB = Math.floor(b / 16) * 16;

          const key = `${qR},${qG},${qB}`;
          if (!colorCounts[key]) {
            colorCounts[key] = { r: qR, g: qG, b: qB, count: 0 };
          }
          colorCounts[key].count += 1;
        }

        // Find the color bucket with the largest area (max count)
        let dominant = { r: 250, g: 249, b: 246, count: 0 };
        let maxCount = 0;

        Object.values(colorCounts).forEach((entry) => {
          if (entry.count > maxCount) {
            maxCount = entry.count;
            dominant = entry;
          }
        });

        const r = dominant.r;
        const g = dominant.g;
        const b = dominant.b;

        // Calculate perceived luminance: 0.299*R + 0.587*G + 0.114*B
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        const isDark = luminance < 135;

        setCardStyle({
          bgColor: `rgb(${r}, ${g}, ${b})`,
          isDark,
          textColor: isDark ? '#FFFFFF' : '#1F1C24',
          subTextColor: isDark ? 'rgba(255, 255, 255, 0.72)' : '#665C74',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
          itemBg: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.03)',
          itemBorder: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
          badgeBg: isDark ? '#FFFFFF' : '#1F1C24',
          badgeText: isDark ? '#1F1C24' : '#C5A880',
          accentColor: isDark ? '#F5E6CC' : '#8C7250',
        });
      } catch (err) {
        console.warn('Canvas color extraction fell back gracefully:', err);
        setCardStyle(DEFAULT_STYLE);
      } finally {
        setIsExtractingColor(false);
      }
    };

    img.onerror = () => {
      setCardStyle(DEFAULT_STYLE);
      setIsExtractingColor(false);
    };
  }, [isOpen, shareList]);

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
    return { container: 'w-18 h-[90px]', scaleFactor: 0.3 };
  };

  const { container, scaleFactor } = getCellSize(shareList.length);

  // Clean the descriptive text for a cleaner look in tight grids and remove any pricing to avoid bans on social platforms
  const cleanCaseTypeName = (name: string) => {
    if (!name) return '';
    return name
      .replace(/\(.*?\)/g, '')
      .replace(/（.*?）/g, '')
      .replace(/[\d.]+\s*[-~至到]?\s*[\d.]*\s*元/g, '')
      .replace(/[$¥NT]/g, '')
      .replace(/tutuboom訂製款/g, '')
      .replace(/訂製系列/g, '')
      .replace(/分離殼/g, '分離')
      .replace(/防摔殼/g, '防摔')
      .trim();
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
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
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors text-stone-600 hover:text-black cursor-pointer"
            aria-label="Close modal"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Title */}
          <div className="text-center mb-3 mt-1">
            <h3 className="text-sm font-bold text-stone-800">Share Card</h3>
            <p className="text-[10px] text-stone-400 mt-0.5">
              {shareList.length} 款設計對比
            </p>
          </div>

          {/* The Premium 3:4 Aspect Ratio Card to Screenshot */}
          <div
            id="share-target-card"
            className="aspect-[3/4] w-full rounded-[24px] p-5 shadow-lg relative overflow-hidden flex flex-col justify-between transition-colors duration-500 mb-4"
            style={{
              backgroundColor: cardStyle.bgColor,
              borderColor: cardStyle.borderColor,
              borderWidth: 1,
              boxShadow: '0 12px 30px -8px rgba(0,0,0,0.12)',
            }}
          >
            {/* Header block */}
            <div 
              className="flex justify-between items-start pb-2 border-b"
              style={{ borderColor: cardStyle.borderColor }}
            >
              <div>
                <h4 
                  className="font-mono text-[9px] tracking-[0.2em] uppercase font-bold opacity-90"
                  style={{ color: cardStyle.textColor }}
                >
                  OMNISTATE
                </h4>
                <p 
                  className="text-[8px] tracking-wider font-medium"
                  style={{ color: cardStyle.subTextColor }}
                >
                  DESIGN CURATION
                </p>
              </div>
              <span 
                className="text-[8px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-full scale-90 origin-right shadow-2xs"
                style={{ 
                  backgroundColor: cardStyle.badgeBg, 
                  color: cardStyle.badgeText 
                }}
              >
                {shareList.length} ITEMS
              </span>
            </div>

            {/* Center mockup grid */}
            <div className="flex-1 w-full flex items-center justify-center py-3.5 select-none">
              <div className={`grid ${getGridLayout(shareList.length)} gap-3 w-full justify-center items-center`}>
                {shareList.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex flex-col items-center justify-center p-1.5 rounded-xl transition-all relative border"
                    style={{
                      backgroundColor: cardStyle.itemBg,
                      borderColor: cardStyle.itemBorder,
                    }}
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
                      <p 
                        className="text-[8px] font-bold truncate max-w-full leading-tight"
                        style={{ color: cardStyle.textColor }}
                      >
                        #{item.design.id} {item.design.title}
                      </p>
                      <p 
                        className="text-[7px] truncate max-w-full mt-0.5 leading-tight font-medium"
                        style={{ color: cardStyle.subTextColor }}
                      >
                        {cleanCaseTypeName(item.displayCaseType)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Elegant semi-transparent watermark background at the bottom of the card */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none opacity-[0.07] select-none text-center flex flex-col items-center">
              <span 
                className="font-serif text-[18px] font-bold tracking-[0.25em] uppercase whitespace-nowrap"
                style={{ color: cardStyle.textColor }}
              >
                OMNISTATE
              </span>
              <span 
                className="text-[7px] tracking-[0.5em] font-medium mt-0.5 whitespace-nowrap"
                style={{ color: cardStyle.textColor }}
              >
                萬有狀態
              </span>
            </div>

            {/* Row of cute cat logos inside the card */}
            <div 
              className="flex justify-center items-center gap-1.5 my-1 opacity-60 select-none pointer-events-none"
              style={{ color: cardStyle.textColor }}
            >
              <Cat className="h-2.5 w-2.5 rotate-[-12deg]" />
              <Cat className="h-3 w-3 rotate-[-4deg]" />
              <Cat className="h-3.5 w-3.5 animate-bounce" style={{ color: cardStyle.accentColor, animationDuration: '3s' }} />
              <Cat className="h-3 w-3 rotate-[4deg]" />
              <Cat className="h-2.5 w-2.5 rotate-[12deg]" />
            </div>

            {/* Footer text */}
            <div 
              className="border-t pt-2 flex justify-between items-end text-[8px]"
              style={{ borderColor: cardStyle.borderColor }}
            >
              <div>
                <h3 
                  className="font-serif text-[10px] font-bold tracking-tight line-clamp-1 mb-0.5"
                  style={{ color: cardStyle.textColor }}
                >
                  萬有狀態 Omnistate
                </h3>
                <p 
                  className="text-[7px] tracking-wide"
                  style={{ color: cardStyle.subTextColor }}
                >
                  Omnistate
                </p>
              </div>
              <div className="text-right">
                <span 
                  className="block text-[7px] font-mono opacity-60 uppercase tracking-widest"
                  style={{ color: cardStyle.textColor }}
                >
                  omnistate.cc.cd
                </span>
              </div>
            </div>
          </div>

          {/* Cute Cat Logo Row physically below the card */}
          <div className="flex items-center justify-center gap-1.5 py-2 opacity-80 animate-pulse select-none" style={{ animationDuration: '4s' }}>
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
              type="button"
            >
              關閉視窗
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
