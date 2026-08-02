import React, { useState, useMemo } from 'react';
import { PRODUCTS_DATA } from '../data/products';
import { TUTU_SERIES_LIST } from '../data/tutuproducts';
import { Series, Design, Subseries } from '../data/productsData';
import { Search, SlidersHorizontal, Check, RefreshCw, Star, Layers, Zap, ExternalLink, Compass, X, ChevronLeft, ChevronRight, ShoppingBag, Heart, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const convertToTC = (s: string) => s;

interface GalleryProps {
  onSelectDesign: (design: Design) => void;
  activeDesignId: string;
  selectedCaseCompatible: string;
  setSelectedCaseCompatible: (val: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export default function Gallery({
  onSelectDesign,
  activeDesignId,
  selectedCaseCompatible,
  setSelectedCaseCompatible,
  favorites,
  onToggleFavorite,
}: GalleryProps) {
  const lang = 'zh-TW' as string;
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  const [selectedSubseries, setSelectedSubseries] = useState<string>('all');
  const [selectedBadge, setSelectedBadge] = useState<string>('all');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Pagination State for high display and loading performance
  const [visibleCount, setVisibleCount] = useState(24);

  // Quick View State
  const [quickViewDesign, setQuickViewDesign] = useState<(Design & { category?: string }) | null>(null);
  const [modalModelIdx, setModalModelIdx] = useState(0);
  const [modalImgIdx, setModalImgIdx] = useState(0);

  // Reset pagination when any filter changes to keep rendering fast
  React.useEffect(() => {
    setVisibleCount(24);
  }, [searchQuery, selectedSeries, selectedSubseries, selectedCaseCompatible, selectedBadge]);

  // Reset case compatibility when the series category changes to prevent cross-filter zero results
  React.useEffect(() => {
    setSelectedCaseCompatible('all');
  }, [selectedSeries, setSelectedCaseCompatible]);

  const getSocialLinks = (link: any): { platform: string; url: string }[] => {
    if (!link) return [];
    if (Array.isArray(link)) {
      return link;
    }
    if (typeof link === 'string') {
      return [{ platform: 'xhs', url: link }];
    }
    if (typeof link === 'object') {
      return Object.entries(link).map(([platform, url]) => ({ platform, url: url as string }));
    }
    return [];
  };

  // Flatten designs list for filtering
  const allDesigns = useMemo(() => {
    const list: (Design & { category: string; seriesId: string; subseriesId: string })[] = [];

    // tutuboom products
    TUTU_SERIES_LIST.forEach((s) => {
      if (s.designs) {
        s.designs.forEach((design: Design) => {
          list.push({
            ...design,
            category: s.name,
            seriesId: s.id,
            subseriesId: 'all',
          });
        });
      }
    });

    // Products Data Series
    PRODUCTS_DATA.SERIES.forEach((series) => {
      if (series.subseries && series.subseries.length) {
        series.subseries.forEach((sub) => {
          sub.designs.forEach((design) => {
            list.push({
              ...design,
              category: `${series.name} · ${sub.name}`,
              seriesId: series.id,
              subseriesId: sub.id,
            });
          });
        });
      } else if (series.designs) {
        series.designs.forEach((design) => {
          list.push({
            ...design,
            category: series.name,
            seriesId: series.id,
            subseriesId: 'all',
          });
        });
      }
    });

    return list;
  }, []);

  // Currently active series object & available subseries
  const activeSeriesObj = useMemo(() => {
    const tutuMatch = TUTU_SERIES_LIST.find((s) => s.id === selectedSeries);
    if (tutuMatch) return tutuMatch;
    return PRODUCTS_DATA.SERIES.find((s) => s.id === selectedSeries);
  }, [selectedSeries]);

const availableSubseries = useMemo(() => {
  if (!activeSeriesObj || !('subseries' in activeSeriesObj) || !activeSeriesObj.subseries) return [];
  return activeSeriesObj.subseries;
}, [activeSeriesObj]);

  const getSubseriesCount = (subId: string) => {
    if (selectedSeries === 'all') return 0;
    if (subId === 'all') {
      return allDesigns.filter((d) => d.seriesId === selectedSeries).length;
    }
    return allDesigns.filter((d) => d.seriesId === selectedSeries && d.subseriesId === subId).length;
  };

  // Filtered designs
  const filteredDesigns = useMemo(() => {
    return allDesigns.filter((d) => {
      // 1. Search Query
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const queryTC = convertToTC(query).toLowerCase();
        const matchesId = d.id.toLowerCase().includes(query) || d.id.toLowerCase().includes(queryTC);
        const matchesTitle = d.title.toLowerCase().includes(query) || d.title.toLowerCase().includes(queryTC);
        const matchesCategory = d.category.toLowerCase().includes(query) || d.category.toLowerCase().includes(queryTC);
        if (!matchesId && !matchesTitle && !matchesCategory) return false;
      }

      // 2. Series Selection
      if (selectedSeries !== 'all' && d.seriesId !== selectedSeries) {
        return false;
      }

      // 2b. Subseries Selection
      if (selectedSubseries !== 'all' && d.subseriesId !== selectedSubseries) {
        return false;
      }

      // 3. Case Compatibility
      if (selectedCaseCompatible !== 'all' && d.seriesId !== 's8' && !d.id.startsWith('8-')) {
        if (d.seriesId.startsWith('tutuboom')) {
          if (selectedCaseCompatible === '分離殼') {
            // Both single and double layer designs support Separation Shell (分離殼)
            // Allow this design to pass through
          } else if (selectedCaseCompatible === '一體殼') {
            // Only single layer designs support Matte Shell (一體殼)
            if (d.layer !== '單層') return false;
          } else {
            // 🦏🛡️  filters don't apply to tutuboom designs
            return false;
          }
        } else {
          // 🦏🛡️  designs don't support tutuboom shell types
          if (selectedCaseCompatible === '分離殼' || selectedCaseCompatible === '一體殼') {
            return false;
          }
        const hasCompatible = d.models.some(
          (m) => m.name.toLowerCase() === selectedCaseCompatible.toLowerCase()
        );
        if (!hasCompatible) return false;
        }
      }

      // 4. Badge Filter
      if (selectedBadge !== 'all' && d.badge !== selectedBadge) {
        return false;
      }

      return true;
    });
  }, [allDesigns, searchQuery, selectedSeries, selectedSubseries, selectedCaseCompatible, selectedBadge]);

  // Slice displayed designs based on current visibleCount limit
  const displayedDesigns = useMemo(() => {
    return filteredDesigns.slice(0, visibleCount);
  }, [filteredDesigns, visibleCount]);

  const handleCardClick = (design: Design) => {
    onSelectDesign(design);
  };

  const handleQuickView = (design: Design & { category?: string }) => {
    setQuickViewDesign(design);
    setModalModelIdx(0);
    setModalImgIdx(0);
  };

  const handleCustomizeInStudio = (design: Design) => {
    onSelectDesign(design);
    setQuickViewDesign(null);
    const el = document.getElementById('product-viewer');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSeries('all');
    setSelectedSubseries('all');
    setSelectedCaseCompatible('all');
    setSelectedBadge('all');
  };

  const renderSidebarInner = (isMobile: boolean) => (
    <>
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <h3 className="font-serif font-semibold text-sm text-brand-text flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4 text-brand-gold" />
              <span>{lang === 'en' ? 'Filters' : '智能篩選 / Filters'}</span>
            </h3>
            <button
          onClick={() => {
            handleResetFilters();
            if (isMobile) setIsMobileSidebarOpen(false);
          }}
          className="text-[10px] font-mono font-medium text-black hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="h-2.5 w-2.5" />
              <span>{lang === 'en' ? 'Reset' : '重置'}</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-brand-muted" />
            <input
              type="text"
          placeholder="搜尋設計名稱、圖號或關鍵字..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-white/50 backdrop-blur-md text-brand-text border border-black/5 rounded-xl pl-9 pr-4 py-3 outline-none focus:border-black transition-all font-sans shadow-sm"
            />
          </div>

          {/* Filter 1: Series List */}
          <div>
            <span className="font-mono text-[10px] tracking-wider text-black/40 uppercase block mb-2 font-semibold">
              系列分類 / Series
            </span>
        <div className="space-y-1 lg:max-h-[520px] max-h-[260px] overflow-y-auto pr-1 no-scrollbar text-xs">
              <button
                onClick={() => {
                  setSelectedSeries('all');
                  setSelectedSubseries('all');
              if (isMobile) setIsMobileSidebarOpen(false);
                }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all cursor-pointer ${
                  selectedSeries === 'all'
                ? 'bg-black text-white font-medium shadow-sm'
                    : 'text-brand-text hover:bg-white/60'
                }`}
              >
                <span>全部設計系列</span>
                {selectedSeries === 'all' && <Check className="h-3 w-3" />}
              </button>
              {/* tutuboom SECTION */}
              <div className="space-y-1 pt-1.5">
                <div className="px-3 py-1 font-sans font-bold text-[10px] tracking-wider text-purple-700 uppercase bg-purple-50 rounded-md mb-2 flex items-center justify-between">
                  <span>🩵 tutuboom 系列分類</span>
                </div>
                <div className="space-y-1">
                  {TUTU_SERIES_LIST.map((ts) => {
                    const count = allDesigns.filter((d) => d.seriesId === ts.id).length;
                    const isSelected = selectedSeries === ts.id;
                    return (
                      <button
                        key={ts.id}
                        onClick={() => {
                          setSelectedSeries(ts.id);
                          setSelectedSubseries('all');
                          if (isMobile) setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-900 text-white font-medium shadow-sm'
                            : 'text-brand-text hover:bg-purple-50/70'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 text-[12px] font-semibold">
                          <Layers className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-purple-200' : 'text-purple-500'}`} />
                          <span className="truncate">{ts.name}</span>
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                            isSelected ? 'bg-white/20 text-white font-bold' : 'text-purple-600 bg-purple-50'
                          }`}>
                            {count}款
                          </span>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 🦏🛡️  SECTION */}
              <div className="space-y-1 pt-3 border-t border-black/5">
                <div className="px-3 py-1 font-sans font-bold text-[10px] tracking-wider text-amber-700 uppercase bg-amber-50 rounded-md mb-2 flex items-center justify-between">
                  <span>🧡 🦏🛡️  系列分類</span>
                </div>
                {PRODUCTS_DATA.SERIES.map((s) => {
                  const isSelected = selectedSeries === s.id;
                  const hasSubseries = s.subseries && s.subseries.length > 0;
                  
                  return (
                    <div key={s.id} className="space-y-1">
                      <button
                        onClick={() => {
                          setSelectedSeries(s.id);
                          setSelectedSubseries('all');
                          if (isMobile && !hasSubseries) setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all cursor-pointer ${
                          isSelected && selectedSubseries === 'all'
                            ? 'bg-black text-white font-medium shadow-sm'
                            : isSelected
                              ? 'bg-amber-50 text-amber-950 font-semibold border-l-2 border-amber-600 pl-2.5'
                              : 'text-brand-text/90 hover:bg-white/60'
                        }`}
                      >
                        <span className="truncate">{s.name}</span>
                        {isSelected && selectedSubseries === 'all' && <Check className="h-3 w-3" />}
                      </button>
                      
                      {/* Nested Subseries options */}
                      {hasSubseries && isSelected && (
                        <div className="pl-2.5 pr-1 py-1 space-y-1 bg-amber-50/40 rounded-lg border-l-2 border-amber-400 ml-2">
                          <button
                            onClick={() => {
                              setSelectedSubseries('all');
                              if (isMobile) setIsMobileSidebarOpen(false);
                            }}
                            className={`w-full text-left text-[11.5px] px-2.5 py-1.5 rounded-md transition-all flex items-center justify-between cursor-pointer ${
                              selectedSubseries === 'all'
                                ? 'text-amber-950 font-bold bg-white shadow-sm border border-amber-200'
                                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                            }`}
                          >
                            <span>全部 {s.name} 圖款</span>
                            <span className="text-[10px] font-mono text-amber-700 font-semibold">
                              ({allDesigns.filter(d => d.seriesId === s.id).length}款)
                            </span>
                          </button>
                          {s.subseries!.map((sub) => {
                            const subCount = allDesigns.filter(d => d.seriesId === s.id && d.subseriesId === sub.id).length;
                            const isSubSelected = selectedSubseries === sub.id;
                            return (
                              <button
                                key={sub.id}
                                onClick={() => {
                                  setSelectedSubseries(sub.id);
                                  if (isMobile) setIsMobileSidebarOpen(false);
                                }}
                                className={`w-full text-left text-[11.5px] px-2.5 py-1.5 rounded-md transition-all flex items-center justify-between cursor-pointer ${
                                  isSubSelected
                                    ? 'text-amber-950 font-bold bg-white shadow-sm border border-amber-300 ring-1 ring-amber-300/50'
                                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                                }`}
                              >
                                <span className="truncate flex items-center gap-1">
                                  {isSubSelected && <span className="text-amber-600 font-bold">✦</span>}
                                  {sub.name}
                                </span>
                                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                                  isSubSelected ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-400'
                                }`}>
                                  {subCount}款
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Filter 2: Case Compatibility list */}
          <div>
            <span className="font-mono text-[10px] tracking-wider text-black/40 uppercase block mb-2 font-semibold">
              支援殼體 / Shell Support
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(selectedSeries.startsWith('tutuboom')
                ? ['all', '分離殼', '一體殼']
                : ['all', 'SolidX', 'AirX', 'ModNX', 'ClearX', 'Clear']
              ).map((c) => (
                <button
                  key={c}
              onClick={() => {
                setSelectedCaseCompatible(c);
                if (isMobile) setIsMobileSidebarOpen(false);
              }}
              className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    selectedCaseCompatible === c
                      ? 'bg-black text-white border-black shadow-sm'
                      : 'border-white/40 text-brand-muted bg-white/20 hover:bg-white/50'
                  }`}
                >
                  {c === 'all' ? '全部相容' : c}
                </button>
              ))}
            </div>
          </div>

          {/* Filter 3: Badges */}
          <div>
            <span className="font-mono text-[10px] tracking-wider text-black/40 uppercase block mb-2 font-semibold">
              標籤 / Highlights
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {['all', 'new', 'hot'].map((b) => (
                <button
                  key={b}
              onClick={() => {
                setSelectedBadge(b);
                if (isMobile) setIsMobileSidebarOpen(false);
              }}
              className={`text-[10px] tracking-wider font-mono py-1.5 rounded-lg border transition-all uppercase flex items-center justify-center gap-1 cursor-pointer ${
                    selectedBadge === b
                      ? 'bg-black text-white border-black shadow-sm'
                      : 'border-white/40 text-brand-muted hover:bg-white/50 bg-white/20'
                  }`}
                >
                  {b === 'new' && <Zap className="h-3 w-3 text-brand-gold" />}
                  {b === 'hot' && <Star className="h-3 w-3 text-brand-gold" />}
                  <span>{b === 'all' ? '全部' : b}</span>
                </button>
              ))}
            </div>
          </div>
    </>
  );

  return (
    <section id="gallery-section" className="py-16 px-6 max-w-7xl mx-auto scroll-mt-12 relative z-10">
      {/* Eye brow section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10 border-b border-black/5 pb-6">
        <div>
          <span className="font-mono text-xs tracking-[0.25em] text-black/50 uppercase block mb-1">
            Phone Case Gallery
          </span>
          <h2 className="font-serif text-3xl font-semibold text-brand-text">
            瀏覽區
          </h2>
          <p className="text-xs text-brand-muted mt-1 leading-relaxed">點擊圖款即可進入瀏覽區瀏覽
          </p>
        </div>

        {/* Total stats */}
        <div className="flex flex-col items-end gap-1">
          <span className="font-mono text-xs text-brand-muted bg-white/50 border border-black/5 px-3.5 py-1.5 rounded-lg select-none">
            {lang === 'en' ? 'Count' : '顯示款數'} : <b className="text-black font-semibold">{filteredDesigns.length}</b> {lang === 'en' ? 'styles' : '款'}
          </span>
          <span className="text-[9px] font-mono text-black/40 bg-white/40 px-2 py-0.5 rounded border border-black/5">
            all:{allDesigns.length} | filtered:{filteredDesigns.length} | series:{selectedSeries} | sub:{selectedSubseries} | comp:{selectedCaseCompatible} | badge:{selectedBadge} | q:"{searchQuery}"
          </span>
        </div>
      </div>

      {/* Mobile Sidebar Toggle Button & Quick Badge bar (only visible on mobile) */}
      <div className="lg:hidden flex flex-col gap-2.5 mb-6">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-black text-white hover:bg-stone-900 py-3 px-4 rounded-xl font-semibold text-xs tracking-wider uppercase transition-all shadow-md active:scale-98 cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4 text-brand-gold" />
            <span>系列與篩選 / Series ({filteredDesigns.length}款)</span>
          </button>
          
          {/* Quick reset button if any filter is active */}
          {(searchQuery || selectedSeries !== 'all' || selectedSubseries !== 'all' || selectedCaseCompatible !== 'all' || selectedBadge !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="p-3 bg-stone-100 text-stone-600 rounded-xl hover:text-black hover:bg-stone-200 transition-colors border border-stone-200/50 cursor-pointer"
              title="清除所有篩選"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Quick horizontal categories row on mobile so users can instantly jump to series */}
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 no-scrollbar -mx-2 px-2">
          <button
            onClick={() => { setSelectedSeries('all'); setSelectedSubseries('all'); }}
            className={`text-[10.5px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
              selectedSeries === 'all'
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white/80 text-stone-600 border-stone-200/60'
            }`}
          >
            全部系列
          </button>
          {TUTU_SERIES_LIST.map((ts) => {
            const isSelected = selectedSeries === ts.id;
            return (
          <button
                key={ts.id}
                onClick={() => { setSelectedSeries(ts.id); setSelectedSubseries('all'); }}
            className={`text-[10.5px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                    : 'bg-purple-50/70 text-purple-700 border-purple-200/60 hover:bg-purple-100'
            }`}
          >
                tutu {ts.name}
          </button>
            );
          })}
          {PRODUCTS_DATA.SERIES.map((s) => (
            <button
              key={s.id}
              onClick={() => { setSelectedSeries(s.id); setSelectedSubseries('all'); }}
              className={`text-[10.5px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                selectedSeries === s.id
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-white/80 text-stone-600 border-stone-200/60'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Sidebar Slider Drawer Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 lg:hidden"
            />
            {/* Slide-out Sidebar Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed top-0 left-0 h-full w-[310px] bg-white shadow-2xl z-50 lg:hidden overflow-y-auto flex flex-col border-r border-stone-200"
            >
              <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-stone-50/50">
                <h3 className="font-serif font-bold text-base text-brand-text flex items-center gap-2">
                  <SlidersHorizontal className="h-4.5 w-4.5 text-brand-gold animate-pulse" />
                  <span>系列與分類篩選</span>
                </h3>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 rounded-full hover:bg-stone-200/60 text-stone-500 hover:text-black transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-5 space-y-6 flex-grow">
                {renderSidebarInner(true)}
              </div>
              
              <div className="p-4 border-t border-stone-100 bg-stone-50">
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="w-full py-2.5 bg-black text-white font-semibold text-xs rounded-xl uppercase tracking-wider cursor-pointer text-center"
                >
                  套用篩選
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Container with Sticky Sidebar and Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* DESKTOP STICKY SIDEBAR FILTERS (lg:col-span-3 - hidden on mobile) */}
        <div className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 self-start z-20 space-y-6 glass-frosted rounded-2xl p-5">
          {renderSidebarInner(false)}
        </div>

        {/* RESULTS GRID (lg:col-span-9) */}
        <div className="lg:col-span-9 space-y-5">
          {/* Active Series Header with description */}
          {(selectedSeries !== 'all' || selectedSubseries !== 'all') && (
            <div className="p-4.5 rounded-2xl bg-white/60 border border-black/5 flex flex-col gap-2 shadow-sm">
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-brand-muted">
                <span className="font-mono text-[10px] bg-black/5 px-1.5 py-0.5 rounded">
                  {lang === 'en' ? 'Browsing' : '正在瀏覽 / Browsing'}
                </span>
                <span className="font-semibold text-black">
                  {activeSeriesObj?.name}
                </span>
                {selectedSubseries !== 'all' && (
                  <>
                    <span className="text-black/30">/</span>
                    <span className="font-semibold text-black">
                      {availableSubseries.find((sub: Subseries) => sub.id === selectedSubseries)?.name}
                    </span>
                  </>
                )}
              </div>
              
              {/* Display series description */}
              {activeSeriesObj?.desc && (
                <p className="text-xs text-brand-text/80 flex items-start gap-1.5 mt-1 leading-relaxed">
                  <span className="text-brand-gold select-none">✦</span>
                  <span>{activeSeriesObj.desc}</span>
                </p>
              )}

              {/* Subseries description if selected */}
              {selectedSubseries !== 'all' && availableSubseries.find((sub: Subseries) => sub.id === selectedSubseries)?.desc && (
                <div className="flex items-start gap-2 bg-black/[0.02] p-2.5 rounded-xl border-l-2 border-brand-gold mt-1 text-xs text-brand-text">
                  <span className="text-brand-gold select-none">ℹ️</span>
                  <span>{availableSubseries.find((sub: Subseries) => sub.id === selectedSubseries)?.desc}</span>
                </div>
              )}
            </div>
          )}

          {/* Subseries Quick Selector Card when a series with subseries is selected */}
          {availableSubseries.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/70 via-stone-50/80 to-purple-50/70 border border-stone-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-600 animate-pulse" />
                  <span className="font-serif font-bold text-xs text-stone-800 tracking-wide">
                    {activeSeriesObj?.name} · 子系列快速選單
                  </span>
                  <span className="text-[10px] font-mono text-stone-500 bg-white/80 px-2 py-0.5 rounded-full border border-stone-200">
                    共 {availableSubseries.length} 個子系列
                  </span>
                </div>
                {selectedSubseries !== 'all' && (
                  <button
                    onClick={() => setSelectedSubseries('all')}
                    className="text-[11px] font-mono text-amber-800 hover:text-black hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>顯示全部子系列</span>
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Subseries Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSubseries('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    selectedSubseries === 'all'
                      ? 'bg-stone-900 text-white border-stone-900 shadow-sm ring-1 ring-stone-900/10'
                      : 'bg-white/90 text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-white'
                  }`}
                >
                  <span>全部圖款</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedSubseries === 'all' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {getSubseriesCount('all')}
                  </span>
                </button>

                {availableSubseries.map((sub: Subseries) => {
                  const count = getSubseriesCount(sub.id);
                  const isActive = selectedSubseries === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubseries(sub.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        isActive
                          ? selectedSeries.startsWith('tutuboom')
                            ? 'bg-purple-700 text-white border-purple-700 shadow-md ring-2 ring-purple-500/20'
                            : 'bg-amber-700 text-white border-amber-700 shadow-md ring-2 ring-amber-500/20'
                          : 'bg-white/90 text-stone-700 border-stone-200 hover:border-amber-400 hover:bg-white'
                      }`}
                    >
                      {isActive && <Check className="h-3.5 w-3.5" />}
                      <span>{sub.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-white/25 text-white' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {count}款
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <AnimatePresence mode="popLayout">
            {filteredDesigns.length > 0 ? (
              <div className="space-y-6">
                <motion.div
                  layout
                  className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
                >
                  {displayedDesigns.map((d, index) => {
                    const selectedModel = (selectedCaseCompatible && selectedCaseCompatible !== 'all')
                      ? d.models?.find(m => {
                          const mName = m.name.toLowerCase();
                          const cComp = selectedCaseCompatible.toLowerCase();
                          return mName === cComp || mName.includes(cComp) || cComp.includes(mName);
                        })
                      : null;
                    const defaultImgModel = selectedModel || d.models?.[0];
                    const previewImg = defaultImgModel?.imgs?.[0] || '';
                    const isActive = activeDesignId === d.id;
                    const isFavorite = favorites.includes(d.id);

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.45 }}
                        key={d.id}
                        onClick={() => handleCardClick(d)}
                        className={`group relative flex flex-col justify-between glass-card rounded-2xl overflow-hidden cursor-pointer transition-all ${
                          isActive
                            ? 'border-black ring-1 ring-black/10 shadow-md scale-[1.02]'
                            : 'border-white/40 hover:shadow-xl hover:-translate-y-1'
                        }`}
                      >
                        {/* Product Preview Image Block */}
                        <div className="relative w-full aspect-[3/4] bg-neutral-100/50 overflow-hidden flex items-center justify-center p-3 select-none">
                          {previewImg ? (
                            <img
                              src={previewImg}
                              alt={d.title}
                              className="max-h-full max-w-full object-contain pointer-events-none group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                              draggable="false"
                              onContextMenu={(e) => e.preventDefault()}
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-brand-muted/30 gap-1.5 font-mono text-[10px]">
                              <span>No Preview</span>
                            </div>
                          )}

                          {/* Heart favorite overlay */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(d.id);
                            }}
                            className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md border shadow-sm transition-all hover:scale-110 z-20 ${
                              isFavorite
                                ? 'bg-rose-50 border-rose-200 text-rose-500'
                                : 'bg-white/60 border-white/40 text-black/40 hover:text-rose-500 hover:bg-white'
                            }`}
                            type="button"
                            title={isFavorite ? '取消收藏' : '加入收藏'}
                          >
                            <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                          </button>

                          {/* Top Badges */}
                          {d.badge && (
                            <span className="absolute top-2 left-2 font-mono text-[8px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded shadow-sm bg-black text-white">
                              {d.badge}
                            </span>
                          )}

                          {/* Layer indicator for tutuboom */}
                          {d.layer && (
                            <span className="absolute bottom-2 left-2 font-mono text-[8px] font-semibold tracking-wider uppercase bg-black/10 backdrop-blur text-black px-1.5 py-0.5 rounded">
                              {d.layer}
                            </span>
                          )}
                        </div>

                        {/* Card Info Details */}
                        <div className="p-3.5 border-t border-black/5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-1">
                              <span className="font-mono text-[9px] text-brand-muted truncate block mb-1">
                                {d.category}
                              </span>
                              {isActive && (
                                <span className="text-[10px] bg-black text-brand-gold font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 scale-90">
                                  <Check className="h-2.5 w-2.5" />
                                  <span>已選取</span>
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-semibold text-brand-text group-hover:text-black transition-colors line-clamp-1">
                              {d.title}
                            </h4>
                            {d.link && getSocialLinks(d.link).length > 0 && (
                              <div className="mt-2.5 flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                                {getSocialLinks(d.link).map((link, idx) => (
                                  <a
                                    key={idx}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/50 px-2 py-0.5 rounded-full transition-all text-[10px] font-semibold"
                                  >
                                    <span>📕 小紅書</span>
                                    <ExternalLink className="h-2.5 w-2.5" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Bottom Model compatible list tags */}
                          <div className="mt-3 flex flex-wrap gap-1 items-center justify-between">
                            <div className="flex flex-wrap gap-1 items-center">
                              <span className="font-mono text-[9px] font-medium text-black bg-white/70 border border-black/5 px-2 py-0.5 rounded">
                                #{d.id}
                              </span>
                              <div className="flex gap-1 overflow-hidden">
                                {d.models.slice(0, 2).map((m) => (
                                  <span
                                    key={m.name}
                                    className="font-mono text-[8px] text-brand-muted bg-white/40 border border-white/50 px-1.5 py-0.5 rounded shrink-0"
                                  >
                                    {m.name}
                                  </span>
                                ))}
                                {d.models.length > 2 && (
                                  <span className="font-mono text-[8px] text-brand-muted bg-white/40 border border-white/50 px-1 py-0.5 rounded shrink-0">
                                    +{d.models.length - 2}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Interactive Action Bar (Exposes Both Gallery Viewing & Studio Customization) */}
                          <div className="mt-4 pt-3 border-t border-black/5 flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleQuickView(d)}
                              className="flex-1 py-2 rounded-xl text-[10px] font-bold bg-white/80 hover:bg-black hover:text-white border border-black/5 transition-all text-center flex items-center justify-center gap-1 shadow-sm"
                              title="快速預覽"
                              type="button"
                            >
                              <Search className="h-3 w-3" />
                              <span>快速預覽</span>
                            </button>
                            <button
                              onClick={() => handleCustomizeInStudio(d)}
                              className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all text-center flex items-center justify-center gap-1 shadow-md hover:scale-[1.02] ${
                                isActive
                                  ? 'bg-brand-gold text-black font-extrabold animate-pulse'
                                  : 'bg-black text-white'
                              }`}
                              title="進入瀏覽區"
                              type="button"
                            >
                              <Compass className="h-3 w-3" />
                              <span>瀏覽區</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
                
                {filteredDesigns.length > visibleCount && (
                  <div className="flex justify-center pt-6 pb-2">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 24)}
                      className="px-8 py-3 rounded-xl bg-white hover:bg-black hover:text-white text-black border border-black/10 hover:border-black font-semibold text-xs transition-all duration-300 flex items-center gap-2 shadow-sm tracking-wide font-sans hover:-translate-y-0.5"
                    >
                      <span>
                        顯示更多款式 ({filteredDesigns.length - visibleCount} 款)
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full py-20 flex flex-col items-center justify-center text-center glass-frosted rounded-2xl p-6"
              >
                <SlidersHorizontal className="h-8 w-8 text-brand-muted opacity-30 mb-3 animate-bounce" />
                <h4 className="font-serif font-semibold text-brand-text mb-1">未找到相符設計</h4>
                <p className="text-xs text-brand-muted max-w-xs">
                  很抱歉，沒有找到符合您篩選條件的設計款手機殼。請嘗試清除搜尋字詞或重置篩選器。
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 font-mono text-xs bg-black text-white hover:opacity-85 px-4 py-2 rounded-xl transition-colors"
                >
                  重置所有篩選
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quick View Lightbox Modal */}
      <AnimatePresence>
        {quickViewDesign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-4xl bg-white rounded-[28px] overflow-hidden shadow-2xl border border-black/5 flex flex-col md:flex-row max-h-[90vh] md:max-h-none"
            >
              {/* Close Button */}
              <button
                onClick={() => setQuickViewDesign(null)}
                className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-black/5 hover:bg-black/10 transition-colors text-stone-600 hover:text-black"
                aria-label="Close quick view"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Left Side: Mock Stage Carousel */}
              <div className="w-full md:w-1/2 bg-slate-100/70 flex flex-col items-center justify-center p-6 min-h-[300px] md:min-h-[460px] relative select-none border-b md:border-b-0 md:border-r border-black/5">

                {/* Badge (New/Hot) inside image stage to prevent overlap with close button */}
                {quickViewDesign.badge && (
                  <span className="absolute top-4 left-4 z-20 font-mono text-[9px] tracking-wider uppercase px-2 py-1 rounded font-extrabold bg-black text-white shadow-sm">
                    {quickViewDesign.badge}
                  </span>
                )}

                {/* Main image container */}
                <div className="relative w-48 h-[270px] rounded-[24px] border-2 border-slate-800/80 bg-slate-50 shadow-lg overflow-hidden flex items-center justify-center group/img z-10">
                  
                  {quickViewDesign.models?.[modalModelIdx]?.imgs?.[modalImgIdx] ? (
                    <img
                      src={quickViewDesign.models[modalModelIdx].imgs[modalImgIdx]}
                      alt={quickViewDesign.title}
                      className="max-h-full max-w-full object-contain pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-xs text-brand-muted opacity-40">無預覽效果</span>
                  )}

                  {/* Left and Right arrows inside image container */}
                  {quickViewDesign.models?.[modalModelIdx]?.imgs && quickViewDesign.models[modalModelIdx].imgs.length > 1 && (
                    <>
                      <button
                        onClick={() => setModalImgIdx(prev => (prev === 0 ? quickViewDesign.models[modalModelIdx].imgs.length - 1 : prev - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all opacity-80 group-hover/img:opacity-100 shadow-md backdrop-blur-xs hover:scale-110 active:scale-95 cursor-pointer z-20"
                        type="button"
                        title="上一張圖片"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setModalImgIdx(prev => (prev === quickViewDesign.models[modalModelIdx].imgs.length - 1 ? 0 : prev + 1))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all opacity-80 group-hover/img:opacity-100 shadow-md backdrop-blur-xs hover:scale-110 active:scale-95 cursor-pointer z-20"
                        type="button"
                        title="下一張圖片"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Navigation bar with Left/Right Arrows & Dots indicators */}
                {quickViewDesign.models?.[modalModelIdx]?.imgs && quickViewDesign.models[modalModelIdx].imgs.length > 1 && (
                  <div className="flex items-center justify-center gap-2.5 mt-4 z-10 w-full px-2">
                    <button
                      onClick={() => setModalImgIdx(prev => (prev === 0 ? quickViewDesign.models[modalModelIdx].imgs.length - 1 : prev - 1))}
                      className="p-1.5 rounded-full bg-white hover:bg-black hover:text-white text-black/70 transition-all border border-black/10 shadow-sm active:scale-90 cursor-pointer flex items-center justify-center shrink-0"
                      type="button"
                      title="上一張"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-full border border-black/5 shadow-sm">
                    {quickViewDesign.models[modalModelIdx].imgs.map((_, imgIdx) => (
                      <button
                        key={imgIdx}
                        onClick={() => setModalImgIdx(imgIdx)}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            modalImgIdx === imgIdx ? 'bg-black w-5' : 'bg-black/20 hover:bg-black/50 w-2'
                        }`}
                        type="button"
                          title={`切換至第 ${imgIdx + 1} 張`}
                      />
                    ))}
                      <span className="font-mono text-[10px] text-black/60 font-semibold ml-0.5 select-none">
                        {modalImgIdx + 1}/{quickViewDesign.models[modalModelIdx].imgs.length}
                      </span>
                    </div>

                    <button
                      onClick={() => setModalImgIdx(prev => (prev === quickViewDesign.models[modalModelIdx].imgs.length - 1 ? 0 : prev + 1))}
                      className="p-1.5 rounded-full bg-white hover:bg-black hover:text-white text-black/70 transition-all border border-black/10 shadow-sm active:scale-90 cursor-pointer flex items-center justify-center shrink-0"
                      type="button"
                      title="下一張"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Right Side: Details & Actions */}
              <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-none">
                <div className="space-y-5">
                  {/* Category */}
                  <div>
                    <span className="font-mono text-[10px] tracking-widest text-black/50 uppercase block font-semibold">
                      {quickViewDesign.category}
                    </span>
                  </div>

                  {/* Title & Design ID & Favorite Button */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                    <h3 className="font-serif text-2xl font-bold text-brand-text leading-tight">
                      {quickViewDesign.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-mono text-xs text-black/60 bg-black/[0.03] border border-black/5 px-2.5 py-0.5 rounded-md">
                          圖號 #{quickViewDesign.id}
                      </span>
                      {quickViewDesign.layer && (
                        <span className="font-sans text-xs font-semibold text-black/80 bg-black/[0.03] border border-black/5 px-2.5 py-0.5 rounded-md">
                            分類: {quickViewDesign.layer}
                        </span>
                      )}
                    </div>
                    </div>

                    {/* Favorite Button in Quick View */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(quickViewDesign.id);
                      }}
                      className={`p-3 rounded-full border shadow-sm transition-all hover:scale-110 shrink-0 ${
                        favorites.includes(quickViewDesign.id)
                          ? 'bg-rose-50 border-rose-200 text-rose-500'
                          : 'bg-neutral-50 hover:bg-black/5 border-black/5 text-black/40 hover:text-rose-500'
                      }`}
                      type="button"
                      title={favorites.includes(quickViewDesign.id) ? '取消收藏' : '加入收藏'}
                    >
                      <Heart className={`h-5 w-5 ${favorites.includes(quickViewDesign.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Description if present */}
                  {quickViewDesign.desc && (
                    <p className="text-xs text-brand-muted leading-relaxed italic bg-amber-50/40 border border-amber-200/20 p-3 rounded-xl">
                      📝 {quickViewDesign.desc}
                    </p>
                  )}

                  {/* Model/Case Types tabs inside modal */}
                  {quickViewDesign.models && quickViewDesign.models.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-mono text-[10px] tracking-wider text-black/40 uppercase block font-semibold">
                        殼體預覽切換 / Shell Models
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {quickViewDesign.models.map((m, mIdx) => (
                          <button
                            key={m.name}
                            onClick={() => {
                              setModalModelIdx(mIdx);
                              setModalImgIdx(0);
                            }}
                            className={`text-xs px-3 py-2 rounded-xl border transition-all ${
                              modalModelIdx === mIdx
                                ? 'bg-black text-white border-black font-semibold'
                                : 'border-black/5 hover:bg-black/5 bg-white'
                            }`}
                            type="button"
                          >
                            {m.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Social media / LRB Link */}
                  {quickViewDesign.link && getSocialLinks(quickViewDesign.link).length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="font-mono text-[10px] tracking-wider text-black/40 uppercase block font-semibold">
                        社群平台展示 / Social Link
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {getSocialLinks(quickViewDesign.link).map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 px-3 py-1.5 rounded-full transition-all text-xs font-semibold"
                          >
                            <span className="text-sm">📕</span>
                            <span>小紅書</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary CTA Action */}
                <div className="mt-8 pt-5 border-t border-black/5 space-y-3">
                  <button
                    onClick={() => handleCustomizeInStudio(quickViewDesign)}
                    className="w-full py-4 rounded-full bg-black text-white hover:bg-stone-900 transition-all font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01]"
                    type="button"
                  >
                    <Compass className="h-4 w-4 text-brand-gold" />
                    <span>進入瀏覽區瀏覽 🎨</span>
                  </button>

                  <button
                    onClick={() => setQuickViewDesign(null)}
                    className="w-full py-3 rounded-full border border-black/10 hover:bg-black/5 transition-colors font-semibold text-xs text-brand-muted uppercase text-center"
                    type="button"
                  >
                    返回全品類
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
