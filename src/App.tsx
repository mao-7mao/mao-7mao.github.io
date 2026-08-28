import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import NavigationHeader from './components/NavigationHeader';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import StudioPage from './pages/StudioPage';
import GalleryPage from './pages/GalleryPage';
import PricingPage from './pages/PricingPage';
import OrderInquiryModal from './components/OrderInquiryModal';
import FavoritesDrawer from './components/FavoritesDrawer';
import ComparisonDrawer from './components/ComparisonDrawer';
import { PRODUCTS_DATA } from './data/products';
import { TUTU_SERIES_LIST } from './data/tutuproducts';
import { Design, Subseries } from './data/productsData';
import { ShareQueueItem } from './types';
import { ArrowUp, Compass, Layers, ShieldCheck, Heart, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  // Flatten all designs for looking up objects
  const allDesigns = useMemo(() => {
    const list: Design[] = [];
    TUTU_SERIES_LIST.forEach((s) => {
      if (s.designs) list.push(...s.designs);
    });
    PRODUCTS_DATA.SERIES.forEach((series) => {
      if (series.subseries && series.subseries.length) {
        series.subseries.forEach((sub: Subseries) => {
          list.push(...sub.designs);
        });
      } else if (series.designs) {
        list.push(...series.designs);
      }
    });
    return list;
  }, []);

  // Selected design state across pages
  const [selectedDesign, setSelectedDesign] = useState<Design>(() => {
    const list: Design[] = [];
    TUTU_SERIES_LIST.forEach((s) => {
      if (s.designs) list.push(...s.designs);
    });
    PRODUCTS_DATA.SERIES.forEach((series) => {
      if (series.subseries && series.subseries.length) {
        series.subseries.forEach((sub: Subseries) => {
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

    const featured = list.filter((d) => d.badge === 'new' || d.badge === 'hot');
    if (featured.length > 0) {
      const randomIndex = Math.floor(Math.random() * featured.length);
      return featured[randomIndex];
    }

    return PRODUCTS_DATA.SERIES[0].subseries?.[0].designs[0] || PRODUCTS_DATA.SERIES[0].designs![0];
  });

  const [selectedCaseCompatible, setSelectedCaseCompatible] = useState<string>('all');

  // Favorites States (persisted to localStorage)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fav_designs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  // Comparison / Share List States (persisted to localStorage)
  const [shareList, setShareList] = useState<ShareQueueItem[]>(() => {
    try {
      const saved = localStorage.getItem('omnistate_share_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      // fallback
    }
    return [];
  });
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const isFav = prev.includes(id);
      const updated = isFav ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('fav_designs', JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not save favorites to localStorage:', err);
      }
      return updated;
    });
  };

  const saveShareList = (list: ShareQueueItem[]) => {
    setShareList(list);
    try {
      localStorage.setItem('omnistate_share_list', JSON.stringify(list));
    } catch (err) {
      console.warn('Unable to write share list to localStorage:', err);
    }
  };

  const handleAddToShareList = (item: Omit<ShareQueueItem, 'id'>) => {
    if (shareList.length >= 9) {
      showToast('對比清單已達上限 9 張，請先刪除一些項目再新增！');
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
      showToast('該殼面配置已在對比清單中！');
      return;
    }

    const id = `${item.design.id}-${Date.now()}`;
    const newList = [...shareList, { ...item, id }];
    saveShareList(newList);
    showToast('✨ 已成功加入對比清單！');
    setIsShareDrawerOpen(true);
  };

  const handleRemoveFromShareList = (id: string) => {
    const newList = shareList.filter((item) => item.id !== id);
    saveShareList(newList);
    showToast('已從對比清單移除');
  };

  const handleClearShareList = () => {
    saveShareList([]);
    showToast('已清空對比清單');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectDesign = (design: Design) => {
    setSelectedDesign(design);
    try {
      localStorage.setItem('omnistate_selected_design_id', design.id);
    } catch {
      // ignore
    }
  };

  const handleOpenInquiry = (caseType: string, model: string, bg: string, text: string, price: string) => {
    setInquirySpecs({ caseType, model, bg, text, price });
    setIsInquiryOpen(true);
  };

  const isStudioActive = location.pathname.startsWith('/studio');

  return (
    <div className="min-h-screen bg-[#FAF8FC] text-[#231F2E] font-sans smooth-scroll flex flex-col selection:bg-purple-200 selection:text-purple-900 relative overflow-x-clip">
      <ScrollToTop />

      {/* Immersive Glass Ambient Background Blur Spots - Softened Purple & Rose Tones */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-5%] right-[-10%] w-[650px] h-[650px] bg-purple-200/25 rounded-full blur-[140px]" />
        <div className="absolute top-[35%] left-[-15%] w-[550px] h-[550px] bg-pink-200/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-purple-100/30 rounded-full blur-[140px]" />
      </div>

      {/* Top Fixed Navigation Header */}
      <NavigationHeader
        favoritesCount={favorites.length}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        allDesignsCount={allDesigns.length}
      />

      {/* Main Routed Content Area */}
      <main className="flex-grow pt-14 sm:pt-16 pb-20 md:pb-8 flex flex-col min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] relative z-10">
        <AnimatePresence mode="wait">
          <Routes location={location}>
            {/* 1. Home Page: Hero Only */}
            <Route path="/" element={<HomePage />} />

            {/* 2. Studio Configurator Page */}
            <Route
              path="/studio"
              element={
                <StudioPage
                  selectedDesign={selectedDesign}
                  onSelectDesign={handleSelectDesign}
                  allDesigns={allDesigns}
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
              }
            />

            {/* Direct link with design id parameter: /studio/:id */}
            <Route
              path="/studio/:id"
              element={
                <StudioPage
                  selectedDesign={selectedDesign}
                  onSelectDesign={handleSelectDesign}
                  allDesigns={allDesigns}
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
              }
            />

            {/* 3. Gallery Catalog Page */}
            <Route
              path="/gallery"
              element={
                <GalleryPage
                  onSelectDesign={handleSelectDesign}
                  activeDesignId={selectedDesign.id}
                  selectedCaseCompatible={selectedCaseCompatible}
                  setSelectedCaseCompatible={setSelectedCaseCompatible}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              }
            />

            {/* 4. Pricing and Shipping Page */}
            <Route path="/pricing" element={<PricingPage />} />

            {/* Unknown routes redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Mobile Ergonomic Bottom Tab Navigation Bar - 4 tabs (首頁、瀏覽區、全品類、價格運送) with compact height & font size */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-purple-100/80 px-1 sm:px-2 py-0.5 sm:py-1 h-12 flex items-center justify-around shadow-[0_-3px_16px_rgba(81,74,88,0.06)]">
        {/* 1. 首頁 */}
        <button
          onClick={() => navigate('/')}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 px-0.5 rounded-lg transition-all cursor-pointer select-none ${
            location.pathname === '/'
              ? 'text-[#302C35] font-bold bg-[#ECE8F0]/80 shadow-2xs'
              : 'text-[#77717D] font-medium hover:text-[#302C35]'
          }`}
        >
          <Home className={`h-4 w-4 ${location.pathname === '/' ? 'stroke-[2.4] text-[#514A58]' : ''}`} />
          <span className="text-[9.5px] leading-tight whitespace-nowrap">首頁</span>
        </button>

        {/* 2. 全品類 */}
        <button
          onClick={() => navigate('/gallery')}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 px-0.5 rounded-lg transition-all relative cursor-pointer select-none ${
            location.pathname === '/gallery'
              ? 'text-[#302C35] font-bold bg-[#ECE8F0]/80 shadow-2xs'
              : 'text-[#77717D] font-medium hover:text-[#302C35]'
          }`}
        >
          <Layers className={`h-4 w-4 ${location.pathname === '/gallery' ? 'stroke-[2.4] text-[#514A58]' : ''}`} />
          <span className="text-[9.5px] leading-tight whitespace-nowrap">全品類</span>
          {location.pathname !== '/gallery' && (
            <span className="absolute top-1 right-2 sm:right-3 w-1.5 h-1.5 rounded-full bg-[#81758F]" />
          )}
        </button>

        {/* 3. 瀏覽區 */}
        <button
          onClick={() => navigate('/studio')}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 px-0.5 rounded-lg transition-all cursor-pointer select-none ${
            isStudioActive
              ? 'text-[#302C35] font-bold bg-[#ECE8F0]/80 shadow-2xs'
              : 'text-[#77717D] font-medium hover:text-[#302C35]'
          }`}
        >
          <Compass className={`h-4 w-4 ${isStudioActive ? 'stroke-[2.4] text-[#514A58]' : ''}`} />
          <span className="text-[9.5px] leading-tight whitespace-nowrap">瀏覽區</span>
        </button>

        {/* 4. 價格運送 */}
        <button
          onClick={() => navigate('/pricing')}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 px-0.5 rounded-lg transition-all cursor-pointer select-none ${
            location.pathname === '/pricing'
              ? 'text-[#302C35] font-bold bg-[#ECE8F0]/80 shadow-2xs'
              : 'text-[#77717D] font-medium hover:text-[#302C35]'
          }`}
        >
          <ShieldCheck className={`h-4 w-4 ${location.pathname === '/pricing' ? 'stroke-[2.4] text-[#514A58]' : ''}`} />
          <span className="text-[9.5px] leading-tight whitespace-nowrap">價格運送</span>
        </button>
      </div>

      {/* Minimal Footer */}
      <footer className="py-10 px-6 border-t border-purple-100/70 bg-white/70 text-center mb-14 md:mb-0 relative z-10">
        <div className="max-w-2xl mx-auto space-y-3">
          <p className="font-serif text-sm italic text-purple-900">
            「redbook: 萬有狀態」
          </p>
          <div className="text-[11px] text-stone-500 leading-relaxed tracking-wider font-sans">
            看中哪款，<b>煩請截圖規格或複製商品資訊</b> 告知圖款編號 ＋ 機型 ＋ 殼種 ✦
            <br />
            © 2026 萬有狀態 Omnistate.
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
            className="fixed bottom-20 md:bottom-6 right-5 md:right-6 z-30 p-3.5 rounded-full bg-[#5C5468] hover:bg-[#453D50] text-white shadow-[0_8px_20px_rgba(92,84,104,0.3)] transition-all hover:scale-105 cursor-pointer"
            aria-label="返回頂部"
          >
            <ArrowUp className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Shared Modals and Drawers */}
      <OrderInquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        selectedDesign={selectedDesign}
        selectedCaseType={inquirySpecs.caseType}
        totalPrice={inquirySpecs.price}
      />

      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onSelectDesign={handleSelectDesign}
        allDesigns={allDesigns}
      />

      <ComparisonDrawer
        shareList={shareList}
        isOpen={isShareDrawerOpen}
        onToggleOpen={() => setIsShareDrawerOpen(!isShareDrawerOpen)}
        onRemoveItem={handleRemoveFromShareList}
        onClearList={handleClearShareList}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onShowToast={showToast}
      />

      {/* Toast Notification */}
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

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
