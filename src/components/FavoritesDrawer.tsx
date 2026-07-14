import React from 'react';
import { Design } from '../data/productsData';
import { X, Heart, Sparkles, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectDesign: (design: Design) => void;
  scrollToSection: (id: string) => void;
  allDesigns: Design[];
}

export default function FavoritesDrawer({
  isOpen,
  onClose,
  favorites,
  onToggleFavorite,
  onSelectDesign,
  scrollToSection,
  allDesigns,
}: FavoritesDrawerProps) {
  // Find full design objects from favorite IDs
  const favoriteDesigns = React.useMemo(() => {
    return favorites
      .map((id) => allDesigns.find((d) => d.id === id))
      .filter((d): d is Design => !!d);
  }, [favorites, allDesigns]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col h-full border-l border-black/5"
          >
            {/* Header */}
            <div className="p-5 border-b border-black/5 flex items-center justify-between bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-500 fill-current" />
                <h2 className="font-serif text-lg font-bold text-brand-text">
                  我的收藏清單
                </h2>
                <span className="font-sans text-xs bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-full font-semibold">
                  {favoriteDesigns.length} 款
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-black/5 text-stone-500 hover:text-black transition-colors"
                title="關閉"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {favoriteDesigns.length > 0 ? (
                favoriteDesigns.map((d) => {
                  const previewImg = d.models?.[0]?.imgs?.[0] || '';
                  const istutuboom = d.id.startsWith('tb-') || !!d.layer;

                  return (
                    <motion.div
                      key={d.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group relative flex gap-4 p-3 rounded-2xl border border-black/5 hover:border-black/10 hover:shadow-sm transition-all bg-white"
                    >
                      {/* Image Preview Thumbnail */}
                      <div className="w-20 h-20 bg-neutral-100 rounded-xl overflow-hidden flex items-center justify-center p-1.5 shrink-0 select-none relative">
                        {previewImg ? (
                          <img
                            src={previewImg}
                            alt={d.title}
                            className="max-h-full max-w-full object-contain pointer-events-none"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="text-[9px] text-brand-muted">No Img</span>
                        )}
                      </div>

                      {/* Info and Actions */}
                      <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="font-mono text-[8px] font-bold tracking-wider text-stone-400">
                              #{d.id}
                            </span>
                            {istutuboom ? (
                              <span className="text-[8px] px-1.5 py-0.5 rounded font-bold bg-purple-50 text-purple-600 border border-purple-100">
                                tutuboom
                              </span>
                            ) : (
                              <span className="text-[8px] px-1.5 py-0.5 rounded font-bold bg-amber-50 text-amber-600 border border-amber-100">
                                rhinoshield  
                              </span>
                            )}
                          </div>
                          <h3 className="font-sans text-xs font-semibold text-brand-text truncate leading-snug group-hover:text-black transition-colors">
                            {d.title}
                          </h3>
                        </div>

                        {/* Button Bar */}
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              onSelectDesign(d);
                              onClose();
                              setTimeout(() => {
                                scrollToSection('product-viewer');
                              }, 150);
                            }}
                            className="flex-grow flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg text-[10px] font-bold bg-black text-white hover:bg-neutral-800 transition-colors"
                            type="button"
                          >
                            <span>進入瀏覽區</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>

                          <button
                            onClick={() => onToggleFavorite(d.id)}
                            className="p-1.5 rounded-lg border border-black/5 hover:border-rose-100 text-stone-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                            title="取消收藏"
                            type="button"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                  <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100/50 flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-rose-300" />
                  </div>
                  <h4 className="font-serif font-bold text-sm text-brand-text mb-1.5">
                    收藏清單空空如也
                  </h4>
                  <p className="text-xs text-brand-muted max-w-xs leading-relaxed">
                    您目前尚未將任何手機殼設計加入收藏。
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      scrollToSection('gallery-section');
                    }}
                    className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:opacity-90 rounded-xl text-xs font-semibold transition-all shadow-sm"
                  >
                    <Sparkles className="h-3 w-3 text-brand-gold animate-spin-slow" />
                    <span>去瀏覽區逛逛</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
