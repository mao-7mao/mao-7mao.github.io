import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ChevronDown, ChevronUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareQueueItem } from '../types';

interface ComparisonDrawerProps {
  shareList: ShareQueueItem[];
  isOpen: boolean;
  onToggleOpen: () => void;
  onRemoveItem: (id: string) => void;
  onClearList: () => void;
  onOpenShareModal: () => void;
  onShowToast: (msg: string) => void;
}

export default function ComparisonDrawer({
  shareList,
  isOpen,
  onToggleOpen,
  onRemoveItem,
  onClearList,
  onOpenShareModal,
  onShowToast,
}: ComparisonDrawerProps) {
  const navigate = useNavigate();

  if (shareList.length === 0) return null;

  return (
    <div className="fixed bottom-14 md:bottom-0 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4 pb-4 pointer-events-none">
      <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-2xl border border-stone-200/60 dark:border-stone-800 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] rounded-[24px] overflow-hidden pointer-events-auto">
        {/* Header bar / Toggle */}
        <div
          onClick={onToggleOpen}
          className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-brand-gold/15">
              <Layers className="h-4 w-4 text-brand-gold" />
            </div>
            <span className="text-xs font-bold text-stone-800 dark:text-stone-100">
              殼款對比分享清單
            </span>
            <span className="bg-black dark:bg-stone-800 text-white dark:text-brand-gold text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full">
              {shareList.length} / 9
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-stone-400 font-medium">
              {isOpen ? '收起清單' : '展開對比'}
            </span>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-stone-400" />
            ) : (
              <ChevronUp className="h-4 w-4 text-stone-400" />
            )}
          </div>
        </div>

        {/* Expandable Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {/* Miniature Grid Carousel */}
              <div className="flex gap-3 overflow-x-auto px-5 py-4 scrollbar-none scroll-smooth bg-stone-50/50 dark:bg-stone-950/20 border-t border-b border-stone-100/80 dark:border-stone-800">
                {shareList.map((item) => (
                  <div
                    key={item.id}
                    className="relative w-[76px] flex-shrink-0 flex flex-col items-center bg-white dark:bg-stone-800 p-1.5 rounded-xl border border-stone-200 dark:border-stone-700 shadow-xs group"
                  >
                    {/* Close/Remove mini button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveItem(item.id);
                      }}
                      className="absolute -top-1.5 -right-1.5 bg-rose-500 hover:bg-rose-600 text-white p-0.5 rounded-full shadow-md z-10 transition-colors cursor-pointer"
                      title="從對比中移除"
                    >
                      <X className="h-3 w-3" />
                    </button>

                    {/* Miniature Mockup Stage */}
                    <div className="relative w-12 h-16 bg-stone-100 dark:bg-stone-900 rounded-lg border border-stone-250 dark:border-stone-800 overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-white/70" />
                      {item.currentImage ? (
                        <img
                          src={item.currentImage}
                          alt={item.design.title}
                          className="max-h-full max-w-full object-contain pointer-events-none animate-fade-in"
                          referrerPolicy="no-referrer"
                          style={{
                            transform: `scale(${item.caseImgScale * 0.35}) translate(${item.caseImgX * 0.35}px, ${item.caseImgY * 0.35}px)`,
                          }}
                        />
                      ) : (
                        <span className="text-[6px] opacity-20">無圖</span>
                      )}

                      {/* Miniature Stand Cutout overlay */}
                      {item.standCutout && (
                        <div
                          className="absolute pointer-events-none select-none"
                          style={{
                            left: `${item.standX}%`,
                            top: `${item.standY}%`,
                            width: `${item.standSize}%`,
                            transform: `translate(-50%, -50%) rotate(${item.standRotate}deg)`,
                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))',
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

                    {/* Label info */}
                    <p className="text-[7px] font-bold text-stone-700 dark:text-stone-300 truncate w-full text-center mt-1.5 leading-none">
                      {item.design.title}
                    </p>
                    <p className="text-[6px] text-stone-400 dark:text-stone-500 truncate w-full text-center mt-0.5 leading-none">
                      {item.displayCaseType
                        .replace(/tutuboom訂製款/g, '')
                        .replace(/分離殼/g, '分離')
                        .replace(/防摔殼/g, '一體')
                        .trim()}
                    </p>
                  </div>
                ))}

                {/* Add Placeholder button inside drawer if under 9 */}
                {shareList.length < 9 && (
                  <div
                    onClick={() => {
                      onShowToast('請在「瀏覽區」配置好圖款後點擊「加入對比」！');
                      navigate('/studio');
                    }}
                    className="w-[76px] flex-shrink-0 flex flex-col items-center justify-center border border-dashed border-stone-300 dark:border-stone-700 hover:border-stone-400 p-1.5 rounded-xl cursor-pointer bg-stone-50/40 dark:bg-stone-900/10 text-stone-400 hover:text-stone-600 transition-colors group"
                  >
                    <div className="w-12 h-16 rounded-lg border border-dashed border-stone-200 dark:border-stone-800 flex items-center justify-center bg-stone-100/50 dark:bg-stone-900/30 group-hover:scale-95 transition-transform">
                      <span className="text-xl font-light text-stone-400 group-hover:text-stone-600">
                        +
                      </span>
                    </div>
                    <span className="text-[7px] font-bold mt-1.5 leading-none">繼續加</span>
                    <span className="text-[5px] opacity-60 mt-0.5 leading-none">上限 9 款</span>
                  </div>
                )}
              </div>

              {/* Footer / Actions inside drawer */}
              <div className="flex gap-2.5 px-5 py-3.5 bg-stone-50/85 dark:bg-stone-950/40">
                <button
                  onClick={onClearList}
                  className="px-4 py-2.5 border border-stone-200 dark:border-stone-800 hover:border-rose-200 dark:hover:border-rose-900 text-stone-500 dark:text-stone-400 hover:text-rose-500 dark:hover:text-rose-400 font-semibold text-xs rounded-full transition-colors cursor-pointer"
                >
                  清空對比
                </button>
                <button
                  onClick={onOpenShareModal}
                  className="flex-1 py-2.5 bg-black hover:bg-stone-900 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-black font-semibold text-xs rounded-full shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>立即生成 {shareList.length} 款對比分享卡 ✉️</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
