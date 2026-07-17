import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import ProductViewer from './components/ProductViewer';
import Gallery from './components/Gallery';
import PricePage from './components/PricePage';
import OrderInquiryModal from './components/OrderInquiryModal';
import FavoritesDrawer from './components/FavoritesDrawer';
import { PRODUCTS_DATA } from './data/products';
import { TUTU_PRODUCTS_DATA } from './data/tutuproducts';
import { Design } from './data/productsData';
import { Smartphone, ShoppingBag, Layers, ShieldCheck, ArrowUp, Compass, Sparkles, Heart, Trash2, X, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareQueueItem } from './types';

export default function App() {
  // Configured states
  const [selectedDesign, setSelectedDesign] = useState<Design>(() => {
    const list: Design[] = [];
    TUTU_PRODUCTS_DATA.forEach((design) => {
      list.push(design);
    });
    PRODUCTS_DATA.SERIES.forEach((series) => {
      if (series.subseries && series.subseries.length) {
        series.subseries.forEach((sub) => {
          list.push(...sub.designs);
        });
      } else if (series.designs) {
        list.push(...series.designs);
      }
    });

    const savedDesignId = localStorage.getItem('omnistate_selected_design_id');
    if (savedDesignId) {
      const found = list.find((d) => d.id === savedDesignId);
      if (found) return found;
    }

    // No saved design - user's first visit or session starting fresh without saved preference.
    // Randomly select a design that is tagged "new" or "hot"
    const featured = list.filter((d) => d.badge === 'new' || d.badge === 'hot');
    if (featured.length > 0) {
      const randomIndex = Math.floor(Math.random() * featured.length);
      return featured[randomIndex];
    }

    return PRODUCTS_DATA.SERIES[0].subseries?.[0].designs[0] || PRODUCTS_DATA.SERIES[0].designs![0];
  });
  const [selectedCaseCompatible, setSelectedCaseCompatible] = useState<string>('all');

  // Favorites States
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  // Comparison / Share List States
  const [shareList, setShareList] = useState<ShareQueueItem[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load favorites from localstorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('fav_designs');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (err) {
        console.error('Error loading favorites from localStorage', err);
      }
    }
  }, []);

  // Load share list on mount
  useEffect(() => {
    try {
    const saved = localStorage.getItem('omnistate_share_list');
    if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setShareList(parsed);
        } else {
          setShareList([]);
        }
      }
      } catch (err) {
        console.error('Error loading share list from localStorage', err);
      setShareList([]);
    }
  }, []);

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const isFav = prev.includes(id);
      const updated = isFav ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem('fav_designs', JSON.stringify(updated));
      return updated;
    });
  };

  const saveShareList = (list: ShareQueueItem[]) => {
    setShareList(list);
    try {
    localStorage.setItem('omnistate_share_list', JSON.stringify(list));
    } catch (err) {
      console.warn('Unable to write share list to localStorage (likely inside sandboxed iframe):', err);
    }
  };

  const handleAddToShareList = (item: Omit<ShareQueueItem, 'id'>) => {
    if (shareList.length >= 9) {
      setToastMessage('對比清單已達上限 9 張，請先刪除一些項目再新增！');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const isDuplicate = shareList.some(
      (existing) =>
        existing.design.id === item.design.id &&
        existing.currentImage === item.currentImage &&
        existing.displayCaseType === item.displayCaseType &&
        existing.standCutout === item.standCutout
    );
    if (isDuplicate) {
      setToastMessage('該殼面配置已在對比清單中！');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const id = `${item.design.id}-${Date.now()}`;
    const newList = [...shareList, { ...item, id }];
    saveShareList(newList);
    setToastMessage('✨ 已成功加入對比清單！');
    setTimeout(() => setToastMessage(null), 3000);
    setIsShareDrawerOpen(true);
  };

  const handleRemoveFromShareList = (id: string) => {
    const newList = shareList.filter((item) => item.id !== id);
    saveShareList(newList);
    setToastMessage('已從對比清單移除');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleClearShareList = () => {
    saveShareList([]);
    setToastMessage('已清空對比清單');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Flatten all designs for looking up objects
  const allDesigns = React.useMemo(() => {
    const list: Design[] = [];
    TUTU_PRODUCTS_DATA.forEach((design) => {
      list.push(design);
    });
    PRODUCTS_DATA.SERIES.forEach((series) => {
      if (series.subseries && series.subseries.length) {
        series.subseries.forEach((sub) => {
          list.push(...sub.designs);
        });
      } else if (series.designs) {
        list.push(...series.designs);
      }
    });
    return list;
  }, []);

  // Inquiry Modal States
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquirySpecs, setInquirySpecs] = useState({
    caseType: '',
    model: '',
    bg: '',
    text: '',
    price: '',
  });

  // Floating Back-to-Top State
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  const handleSelectDesign = (design: Design) => {
    setSelectedDesign(design);
    localStorage.setItem('omnistate_selected_design_id', design.id);
  };

  const handleOpenInquiry = (caseType: string, model: string, bg: string, text: string, price: string) => {
    setInquirySpecs({ caseType, model, bg, text, price });
    setIsInquiryOpen(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-brand-text font-sans smooth-scroll flex flex-col selection:bg-black/10 selection:text-black relative overflow-x-clip">
      {/* Immersive Apple-style Glass Ambient Background Blur Spots */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-5%] right-[-10%] w-[650px] h-[650px] bg-blue-200/30 rounded-full blur-[130px]" />
        <div className="absolute top-[35%] left-[-15%] w-[550px] h-[550px] bg-pink-200/25 rounded-full blur-[110px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-emerald-100/20 rounded-full blur-[120px]" />
      </div>

      {/* Dynamic Frosted Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/50 backdrop-blur-3xl border-b border-white/30 h-16 flex items-center justify-between px-6 md:px-12 shadow-sm">
        {/* Brand logo */}
        <div className="flex items-center gap-2 cursor-pointer relative z-10" onClick={() => scrollToSection('hero')}>
          <Sparkles className="h-5 w-5 text-brand-gold" />
          <h1 className="font-serif text-lg font-semibold tracking-wide text-brand-text flex items-center">
            萬有狀態 <em className="text-black font-normal italic font-serif ml-1.5">Omnistate</em>
          </h1>
        </div>

        {/* Floating Quick Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 relative z-10">
          <button
            onClick={() => scrollToSection('price-page')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold text-brand-muted hover:text-black hover:bg-white/60 backdrop-blur-md transition-all border border-transparent hover:border-white/40"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-brand-gold" />
            <span className="hidden sm:inline">殼體價格與運送說明</span>
          </button>

          <button
            onClick={() => setIsFavoritesOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold text-brand-muted hover:text-black hover:bg-white/60 backdrop-blur-md transition-all border border-transparent hover:border-white/40 relative"
          >
            <Heart className={`h-3.5 w-3.5 ${favorites.length > 0 ? 'text-rose-500 fill-current' : ''}`} />
            <span className="hidden sm:inline">我的收藏</span>
            {favorites.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                {favorites.length}
              </span>
            )}
          </button>

          <button
            onClick={() => scrollToSection('product-viewer')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold text-brand-muted hover:text-black hover:bg-white/60 backdrop-blur-md transition-all border border-transparent hover:border-white/40"
          >
            <Compass className="h-3.5 w-3.5 text-black" />
            <span className="hidden sm:inline">瀏覽區</span>
          </button>

          <button
            onClick={() => scrollToSection('gallery-section')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold text-brand-muted hover:text-black hover:bg-white/60 backdrop-blur-md transition-all border border-transparent hover:border-white/40"
          >
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">全品類</span>
          </button>
        </nav>
      </header>

      {/* Main Blocks */}
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <Hero />

        {/* Product Studio configurator */}
        <ProductViewer
          selectedDesign={selectedDesign}
          onOpenOrderModal={handleOpenInquiry}
          preferredCaseType={selectedCaseCompatible}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          shareList={shareList}
          onAddToShareList={handleAddToShareList}
          onRemoveFromShareList={handleRemoveFromShareList}
          isShareModalOpen={isShareModalOpen}
          setIsShareModalOpen={setIsShareModalOpen}
        />

        {/* Core Gallery Showcase */}
        <Gallery
          onSelectDesign={handleSelectDesign}
          activeDesignId={selectedDesign.id}
          selectedCaseCompatible={selectedCaseCompatible}
          setSelectedCaseCompatible={setSelectedCaseCompatible}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* Prices and shipping logistics guide */}
        <PricePage />
      </main>

      {/* Minimal Footer */}
      <footer className="py-12 px-6 border-t border-brand-border bg-brand-card text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="font-serif text-sm italic text-brand-muted">
            「redbook: 萬有狀態」
          </p>
          <div className="text-[11px] text-brand-muted/75 leading-relaxed tracking-wider font-sans">
            看中哪款，<b>煩請截圖規格或複製商品資訊</b> 告知圖款編號 ＋ 機型 ＋ 殼種 ✦
            <br />
            © 2026 萬有狀態Omnistate. All Rights Reserved. Crafted with pristine structural design.
          </div>
        </div>
      </footer>

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-30 p-3.5 rounded-full bg-brand-dark text-white shadow-xl hover:bg-black transition-all hover:scale-105"
            aria-label="返回頂部"
          >
            <ArrowUp className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Inquiry Detail Form Modal */}
      <OrderInquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        selectedDesign={selectedDesign}
        selectedCaseType={inquirySpecs.caseType}
        totalPrice={inquirySpecs.price}
      />

      {/* Favorites List Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onSelectDesign={handleSelectDesign}
        scrollToSection={scrollToSection}
        allDesigns={allDesigns}
      />

      {/* Floating Comparison Drawer / Tray */}
      <AnimatePresence>
        {shareList.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4 pb-4 pointer-events-none"
          >
            <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-2xl border border-stone-200/60 dark:border-stone-800 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] rounded-[24px] overflow-hidden pointer-events-auto">
              {/* Header bar / Toggle */}
              <div
                onClick={() => setIsShareDrawerOpen(!isShareDrawerOpen)}
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
                    {isShareDrawerOpen ? '收起清單' : '展開對比'}
                  </span>
                  {isShareDrawerOpen ? (
                    <ChevronDown className="h-4 w-4 text-stone-400" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-stone-400" />
                  )}
                </div>
              </div>

              {/* Expandable Content */}
              <AnimatePresence>
                {isShareDrawerOpen && (
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
                              handleRemoveFromShareList(item.id);
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
                            {item.displayCaseType.replace(/tutuboom訂製款/g, '').replace(/分離殼/g, '分離').replace(/防摔殼/g, '一體').trim()}
                          </p>
                        </div>
                      ))}

                      {/* Add Placeholder button inside drawer if under 9 */}
                      {shareList.length < 9 && (
                        <div
                          onClick={() => {
                            setToastMessage('請在「瀏覽區」點擊「加入對比」按鈕來新增客製殼面！');
                            setTimeout(() => setToastMessage(null), 3500);
                            scrollToSection('product-viewer');
                          }}
                          className="w-[76px] flex-shrink-0 flex flex-col items-center justify-center border border-dashed border-stone-300 dark:border-stone-700 hover:border-stone-400 p-1.5 rounded-xl cursor-pointer bg-stone-50/40 dark:bg-stone-900/10 text-stone-400 hover:text-stone-600 transition-colors group"
                        >
                          <div className="w-12 h-16 rounded-lg border border-dashed border-stone-200 dark:border-stone-800 flex items-center justify-center bg-stone-100/50 dark:bg-stone-900/30 group-hover:scale-95 transition-transform">
                            <span className="text-xl font-light text-stone-400 group-hover:text-stone-600">+</span>
                          </div>
                          <span className="text-[7px] font-bold mt-1.5 leading-none">繼續加</span>
                          <span className="text-[5px] opacity-60 mt-0.5 leading-none">上限 9 款</span>
                        </div>
                      )}
                    </div>

                    {/* Footer / Actions inside drawer */}
                    <div className="flex gap-2.5 px-5 py-3.5 bg-stone-50/85 dark:bg-stone-950/40">
                      <button
                        onClick={handleClearShareList}
                        className="px-4 py-2.5 border border-stone-200 dark:border-stone-800 hover:border-rose-200 dark:hover:border-rose-900 text-stone-500 dark:text-stone-400 hover:text-rose-500 dark:hover:text-rose-400 font-semibold text-xs rounded-full transition-colors cursor-pointer"
                      >
                        清空對比
                      </button>
                      <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="flex-1 py-2.5 bg-black hover:bg-stone-900 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-black font-semibold text-xs rounded-full shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>立即生成 {shareList.length} 款對比分享卡 ✉️</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sleek Custom Toast Notifications */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 dark:bg-white/95 text-white dark:text-stone-950 px-5 py-3 rounded-full text-[11px] font-bold shadow-2xl backdrop-blur-md border border-white/10 dark:border-black/5 flex items-center gap-2 select-none"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
