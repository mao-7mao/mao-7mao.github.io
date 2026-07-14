import React, { useState, useMemo } from 'react';
import { PRODUCTS_DATA } from '../data/products';
import { TUTU_PRODUCTS_DATA } from '../data/tutuproducts';
import { Series, Design, Subseries } from '../data/productsData';
import { Search, SlidersHorizontal, Check, RefreshCw, Star, Layers, Zap, ExternalLink, Compass, X, ChevronLeft, ChevronRight, ShoppingBag, Heart } from 'lucide-react';
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
    TUTU_PRODUCTS_DATA.forEach((design) => {
      list.push({
        ...design,
        category: 'tutuboom 分離殼系列',
        seriesId: 'tutuboom',
        subseriesId: 'all',
      });
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
        if (d.seriesId === 'tutuboom') {
          if (selectedCaseCompatible === '分離殼') {
            // Both single and double layer designs support Separation Shell (分離殼)
            // Allow this design to pass through
          } else if (selectedCaseCompatible === '一體殼') {
            // Only single layer designs support Matte Shell (一體殼)
            if (d.layer !== '單層') return false;
          } else {
            // rhinoshield  filters don't apply to tutuboom designs
            return false;
          }
        } else {
          // rhinoshield  designs don't support tutuboom shell types
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

  return (
    <section id="gallery-section" className="py-16 px-6 max-w-7xl mx-auto scroll-mt-12 relative z-10">
      {/* Eye brow section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10 border-b border-black/5 pb-6">
        <div>
          <span className="font-mono text-xs tracking-[0.25em] text-black/50 uppercase block mb-1">
            Phonecase Gallery
          </span>
          <h2 className="font-serif text-3xl font-semibold text-brand-text">
            客製化 <em>瀏覽區</em>
          </h2>
          <p className="text-xs text-brand-muted mt-1 leading-relaxed">
            可以上傳手機配件預覽搭配效果♥️
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


      {/* Main Container with Sticky Sidebar and Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* STICKY SIDEBAR FILTERS (lg:col-span-3) */}
        <div className="lg:col-span-3 lg:sticky lg:top-20 z-20 space-y-6 glass-frosted rounded-2xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <h3 className="font-serif font-semibold text-sm text-brand-text flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4 text-brand-gold" />
              <span>{lang === 'en' ? 'Filters' : '智能篩選 / Filters'}</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[10px] font-mono font-medium text-black hover:underline flex items-center gap-1"
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
              placeholder="搜尋圖號、關鍵字..."
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
            <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1 no-scrollbar text-xs">
              <button
                onClick={() => {
                  setSelectedSeries('all');
                  setSelectedSubseries('all');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                  selectedSeries === 'all'
                    ? 'bg-black text-white font-medium'
                    : 'text-brand-text hover:bg-white/60'
                }`}
              >
                <span>全部設計系列</span>
                {selectedSeries === 'all' && <Check className="h-3 w-3" />}
              </button>
              {/* tutuboom SECTION */}
              <div className="space-y-1 pt-1.5">
                <div className="px-3 py-1 font-sans font-bold text-[10px] tracking-wider text-purple-600 uppercase bg-purple-50 rounded-md mb-2 flex items-center justify-between">
                  <span>👾 tutuboom 系列分類</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedSeries('tutuboom');
                    setSelectedSubseries('all');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                    selectedSeries === 'tutuboom'
                      ? 'bg-black text-white font-medium'
                      : 'text-brand-text hover:bg-white/60'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-purple-500" />
                    tutuboom
                  </span>
                  {selectedSeries === 'tutuboom' && <Check className="h-3 w-3" />}
                </button>
              </div>

              {/* rhinoshield  SECTION */}
              <div className="space-y-1 pt-3 border-t border-black/5">
                <div className="px-3 py-1 font-sans font-bold text-[10px] tracking-wider text-amber-600/90 uppercase bg-amber-50 rounded-md mb-2 flex items-center justify-between">
                  <span>🦏 rhinoshield  系列分類</span>
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
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                          isSelected && selectedSubseries === 'all'
                            ? 'bg-black text-white font-medium'
                            : isSelected
                              ? 'bg-black/5 text-black font-semibold border-l-2 border-black pl-2.5'
                              : 'text-brand-text/90 hover:bg-white/60'
                        }`}
                      >
                        <span className="truncate">{s.name}</span>
                        {isSelected && selectedSubseries === 'all' && <Check className="h-3 w-3" />}
                      </button>
                      
                      {/* Nested Subseries options */}
                      {hasSubseries && isSelected && (
                        <div className="pl-3.5 pr-1 py-1 space-y-1 bg-black/[0.02] rounded-lg border-l border-black/10 ml-2">
                          <button
                            onClick={() => setSelectedSubseries('all')}
                            className={`w-full text-left text-[11px] px-2.5 py-1 rounded-md transition-all flex items-center justify-between ${
                              selectedSubseries === 'all'
                                ? 'text-black font-semibold bg-white shadow-sm'
                                : 'text-brand-muted hover:text-black hover:bg-white/40'
                            }`}
                          >
                            <span>全部子系列</span>
                            {selectedSubseries === 'all' && <Check className="h-2.5 w-2.5 text-black/40" />}
                          </button>
                          {s.subseries!.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => setSelectedSubseries(sub.id)}
                              className={`w-full text-left text-[11px] px-2.5 py-1 rounded-md transition-all flex items-center justify-between ${
                                selectedSubseries === sub.id
                                  ? 'text-black font-semibold bg-white shadow-sm border border-black/5'
                                  : 'text-brand-muted hover:text-black hover:bg-white/40'
                              }`}
                            >
                              <span className="truncate">
                                {sub.name}
                              </span>
                              {selectedSubseries === sub.id && <Check className="h-2.5 w-2.5 text-brand-gold" />}
                            </button>
                          ))}
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
              {(selectedSeries === 'tutuboom'
                ? ['all', '分離殼', '一體殼']
                : ['all', 'SolidX', 'AirX', 'ModNX', 'ClearX', 'Clear']
              ).map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCaseCompatible(c)}
                  className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg border transition-all ${
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
                  onClick={() => setSelectedBadge(b)}
                  className={`text-[10px] tracking-wider font-mono py-1.5 rounded-lg border transition-all uppercase flex items-center justify-center gap-1 ${
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
        </div>

        {/* RESULTS GRID (lg:col-span-9) */}
        <div className="lg:col-span-9 space-y-5">
          {/* Active Series/Subseries Header with description */}
          {(selectedSeries !== 'all' || selectedSubseries !== 'all') && (
            <div className="p-4.5 rounded-2xl bg-white/60 border border-black/5 flex flex-col gap-2 shadow-sm">
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-brand-muted">
                <span className="font-mono text-[10px] bg-black/5 px-1.5 py-0.5 rounded">正在瀏覽 / Browsing</span>
                <span className="font-semibold text-black">
                  {selectedSeries === 'tutuboom' ? 'tutuboom 系列' : PRODUCTS_DATA.SERIES.find(s => s.id === selectedSeries)?.name}
                </span>
                {selectedSubseries !== 'all' && (
                  <>
                    <span className="text-black/30">/</span>
                    <span className="font-semibold text-black">
                      {PRODUCTS_DATA.SERIES.find(s => s.id === selectedSeries)?.subseries?.find(sub => sub.id === selectedSubseries)?.name}
                    </span>
                  </>
                )}
              </div>
              
              {/* Display subseries description (desc) and series description if applicable */}
              {selectedSeries !== 'tutuboom' && (
                <div className="text-xs text-brand-text/80 space-y-1.5 mt-1 leading-relaxed">
                  {/* Series description */}
                  {PRODUCTS_DATA.SERIES.find(s => s.id === selectedSeries)?.desc && (
                    <p className="flex items-start gap-1.5">
                      <span className="text-brand-gold select-none">✦</span>
                      <span>{PRODUCTS_DATA.SERIES.find(s => s.id === selectedSeries)?.desc}</span>
                    </p>
                  )}
                  {/* Subseries description */}
                  {selectedSubseries !== 'all' && PRODUCTS_DATA.SERIES.find(s => s.id === selectedSeries)?.subseries?.find(sub => sub.id === selectedSubseries)?.desc && (
                    <div className="flex items-start gap-2 bg-black/[0.02] p-2.5 rounded-xl border-l-2 border-brand-gold">
                      <span className="text-brand-gold select-none">ℹ️</span>
                      <span>{PRODUCTS_DATA.SERIES.find(s => s.id === selectedSeries)?.subseries?.find(sub => sub.id === selectedSubseries)?.desc}</span>
                    </div>
                  )}
                </div>
              )}
              {selectedSeries === 'tutuboom' && (
                <p className="text-xs text-brand-text/85 mt-1 leading-relaxed flex items-start gap-1.5 bg-purple-50/40 p-2.5 rounded-xl border-l-2 border-purple-500">
                  <span className="text-purple-600 select-none">✦</span>
                  <span>tutuboom 系列：雙面分體印刷與磨砂一體殼。雙層印刷具有較為明顯的圖層分離效果，單層印刷可以做出半透明、漸變、浮雕之效果。實物和預覽圖可能有色彩差異。</span>
                </p>
              )}
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
                      <span>顯示更多款式 / Load More ({filteredDesigns.length - visibleCount} 款)</span>
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
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-opacity opacity-0 group-hover/img:opacity-100"
                        type="button"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setModalImgIdx(prev => (prev === quickViewDesign.models[modalModelIdx].imgs.length - 1 ? 0 : prev + 1))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-opacity opacity-0 group-hover/img:opacity-100"
                        type="button"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Carousel indicators if has multiple images */}
                {quickViewDesign.models?.[modalModelIdx]?.imgs && quickViewDesign.models[modalModelIdx].imgs.length > 1 && (
                  <div className="flex gap-2 mt-4 z-10">
                    {quickViewDesign.models[modalModelIdx].imgs.map((_, imgIdx) => (
                      <button
                        key={imgIdx}
                        onClick={() => setModalImgIdx(imgIdx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          modalImgIdx === imgIdx ? 'bg-black w-4' : 'bg-black/20 hover:bg-black/40'
                        }`}
                        type="button"
                      />
                    ))}
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
