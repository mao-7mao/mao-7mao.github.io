import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import ProductViewer from './components/ProductViewer';
import Gallery from './components/Gallery';
import PricePage from './components/PricePage';
import OrderInquiryModal from './components/OrderInquiryModal';
import { PRODUCTS_DATA } from './data/products';
import { Design } from './data/productsData';
import { Smartphone, ShoppingBag, Layers, ShieldCheck, ArrowUp, Compass, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Configured states
  const [selectedDesign, setSelectedDesign] = useState<Design>(
    PRODUCTS_DATA.SERIES[0].subseries?.[0].designs[0] || PRODUCTS_DATA.SERIES[0].designs![0]
  );
  const [selectedCaseCompatible, setSelectedCaseCompatible] = useState<string>('all');

  // Inquiry Modal States
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquirySpecs, setInquirySpecs] = useState({
    caseType: '',
    model: '',
    bg: '',
    text: '',
    price: '',
  });

  // Prevent Right Click on Images
useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault(); // 當目標是圖片時，防止右鍵菜單彈出
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);


  // Floating Back-to-Top State
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelectDesign = (design: Design) => {
    setSelectedDesign(design);
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
    <div className="min-h-screen bg-[#F2F2F7] text-brand-text font-sans smooth-scroll flex flex-col selection:bg-black/10 selection:text-black relative overflow-hidden">
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
          <h1 className="font-serif text-lg font-semibold tracking-wide text-brand-text">
            萬有狀態 <em className="text-black font-normal italic font-serif">Omnistate</em>
          </h1>
        </div>

        {/* Floating Quick Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 relative z-10">
          <button
            onClick={() => scrollToSection('price-page')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-muted hover:text-black hover:bg-white/60 backdrop-blur-md transition-all border border-transparent hover:border-white/40"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-brand-gold" />
            <span className="hidden sm:inline">殼體價格與運送說明</span>
          </button>

          <button
            onClick={() => scrollToSection('product-viewer')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-muted hover:text-black hover:bg-white/60 backdrop-blur-md transition-all border border-transparent hover:border-white/40"
          >
            <Compass className="h-3.5 w-3.5 text-black" />
            <span className="hidden sm:inline">瀏覽區</span>
          </button>

          <button
            onClick={() => scrollToSection('gallery-section')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-muted hover:text-black hover:bg-white/60 backdrop-blur-md transition-all border border-transparent hover:border-white/40"
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
        />

        {/* Core Gallery Showcase */}
        <Gallery
          onSelectDesign={handleSelectDesign}
          activeDesignId={selectedDesign.id}
          selectedCaseCompatible={selectedCaseCompatible}
          setSelectedCaseCompatible={setSelectedCaseCompatible}
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
            看中哪款，<b>煩請截圖規格或複製商品資訊</b> 告知客服圖款編號 ＋ 機型 ＋ 殼種 ✦
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
    </div>
  );
}
