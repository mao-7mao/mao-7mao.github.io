import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
            seriesId: s.id, // e.g. "tb-sub-1", "tb-sub-2"
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

  // Helper to detect tutuboom series
  const isTutuSeriesId = (id?: string) => {
    if (!id) return false;
    return id.startsWith('tb-') || id.startsWith('tutuboom');
  };

  // Brand counts
  const tutuCount = useMemo(() => allDesigns.filter((d) => isTutuSeriesId(d.seriesId)).length, [allDesigns]);
  const rhinoCount = useMemo(() => allDesigns.filter((d) => !isTutuSeriesId(d.seriesId)).length, [allDesigns]);

  // Currently active series object & available subseries
  const activeSeriesObj = useMemo(() => {
    if (selectedSeries === 'brand-tutuboom') {
      return {
        id: 'brand-tutuboom',
        name: 'tutuboom  (全部)',
        desc: 'tutuboom ，包含雙層工藝分離殼與單層一體殼等原創款式。',
      };
    }
    if (selectedSeries === 'brand-rhino') {
      return {
        id: 'brand-rhino',
        name: '🦏🛡️ (全部)',
        desc: '🦏🛡️ ，支援 SolidX、AirX、ClearX、ModNX 等多種兼容殼體。',
      };
    }
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
    if (selectedSeries === 'brand-tutuboom') {
      if (subId === 'all') return tutuCount;
      return allDesigns.filter((d) => d.seriesId === subId).length;
    }
    if (selectedSeries === 'brand-rhino') {
      if (subId === 'all') return rhinoCount;
      return allDesigns.filter((d) => d.seriesId === subId).length;
    }
    if (subId === 'all') {
      return allDesigns.filter((d) => d.seriesId === selectedSeries).length;
    }
    return allDesigns.filter((d) => d.seriesId === selectedSeries && d.subseriesId === subId).length;
  };

  // Filtered designs with automatic prioritization of new & hot badges
  const filteredDesigns = useMemo(() => {
    const list = allDesigns.filter((d) => {
      // 1. Search Query
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const queryTC = convertToTC(query).toLowerCase();
        const matchesId = d.id.toLowerCase().includes(query) || d.id.toLowerCase().includes(queryTC);
        const matchesTitle = d.title.toLowerCase().includes(query) || d.title.toLowerCase().includes(queryTC);
        const matchesCategory = d.category.toLowerCase().includes(query) || d.category.toLowerCase().includes(queryTC);
        if (!matchesId && !matchesTitle && !matchesCategory) return false;
      }

      // 2. Series & Brand Selection
      if (selectedSeries === 'brand-tutuboom') {
        if (!isTutuSeriesId(d.seriesId)) return false;
      } else if (selectedSeries === 'brand-rhino') {
        if (isTutuSeriesId(d.seriesId)) return false;
      } else if (selectedSeries !== 'all' && d.seriesId !== selectedSeries) {
        return false;
      }

      // 2b. Subseries Selection
      if (selectedSubseries !== 'all' && d.subseriesId !== selectedSubseries) {
        return false;
      }

      // 3. Case Compatibility
      if (selectedCaseCompatible !== 'all' && d.seriesId !== 's8' && !d.id.startsWith('8-')) {
        if (isTutuSeriesId(d.seriesId)) {
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

      // 4. Badge Filter (all, new, hot, or new+hot composite)
      if (selectedBadge === 'new' && d.badge !== 'new') {
        return false;
      }
      if (selectedBadge === 'hot' && d.badge !== 'hot') {
        return false;
      }
      if (selectedBadge === 'all_badges' && d.badge !== 'new' && d.badge !== 'hot') {
        return false;
      }
      if (
        selectedBadge !== 'all' &&
        selectedBadge !== 'new' &&
        selectedBadge !== 'hot' &&
        selectedBadge !== 'all_badges' &&
        d.badge !== selectedBadge
      ) {
        return false;
      }

      return true;
    });

    // 自動將 new、hot 標籤往前排（new 權重 2, hot 權重 1, 其他 0）
    return [...list].sort((a, b) => {
      const getBadgeWeight = (badge?: string) => {
        if (badge === 'new') return 2;
        if (badge === 'hot') return 1;
        return 0;
      };
      return getBadgeWeight(b.badge) - getBadgeWeight(a.badge);
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

  const navigate = useNavigate();

  const handleCustomizeInStudio = (design: Design) => {
    onSelectDesign(design);
    setQuickViewDesign(null);
    navigate(`/studio/${design.id}`);
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
          <div className="flex items-center justify-between pb-2.5 border-b border-purple-100/70">
            <h3 className="font-serif font-semibold text-xs text-[#231F2E] flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-purple-600" />
              <span>{lang === 'en' ? 'Filters' : '智能篩選 / Filters'}</span>
            </h3>
            <button
          onClick={() => {
            handleResetFilters();
            if (isMobile) setIsMobileSidebarOpen(false);
          }}
          className="text-[10px] font-mono font-medium text-purple-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="h-2.5 w-2.5" />
              <span>{lang === 'en' ? 'Reset' : '重置'}</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#746B84]" />
            <input
              type="text"
              placeholder="搜尋設計名稱、圖號..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-white/70 text-[#231F2E] border border-purple-200/70 rounded-xl pl-8 pr-3 py-2 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-400 transition-all font-sans shadow-2xs"
            />
          </div>

          {/* Filter 1: Series List */}
          <div>
            <span className="font-mono text-[9.5px] tracking-wider text-[#746B84] uppercase block mb-1.5 font-semibold">
              系列分類 / Series
            </span>
        <div className="space-y-1 lg:max-h-[460px] max-h-[240px] overflow-y-auto pr-1 no-scrollbar text-xs">
              {/* ALL DESIGNS BUTTON */}
              <button
                onClick={() => {
                  setSelectedSeries('all');
                  setSelectedSubseries('all');
                  if (isMobile) setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-all cursor-pointer ${
                  selectedSeries === 'all'
                    ? 'bg-[#5C5468] text-white font-semibold shadow-xs'
                    : 'text-[#231F2E] hover:bg-purple-50/70'
                }`}
              >
                <span className="font-semibold text-xs">全部設計系列</span>
                <span className="flex items-center gap-1 shrink-0">
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                    selectedSeries === 'all' ? 'bg-white/20 text-white font-bold' : 'text-purple-800 bg-purple-50'
                  }`}>
                    {allDesigns.length}款
                  </span>
                  {selectedSeries === 'all' && <Check className="h-3 w-3" />}
                </span>
              </button>

              {/* tutuboom BRAND SECTION */}
              <div className="space-y-1 pt-2">
                <div className="px-2.5 py-1 font-sans font-bold text-[10.5px] tracking-wider text-purple-950 uppercase bg-purple-100/70 rounded-lg flex items-center justify-between border border-purple-200/60">
                  <span className="flex items-center gap-1">
                    <span>💜</span>
                    <span>tutuboom</span>
                  </span>
                  <span className="text-[9.5px] font-mono text-purple-800 font-semibold bg-white/80 px-1.5 py-0.2 rounded">
                    {tutuCount}款
                  </span>
                </div>

                <div className="space-y-0.5 pl-0.5">
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
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-900 text-white font-medium shadow-xs'
                            : 'text-[#231F2E] hover:bg-purple-50/70'
                        }`}
                      >
                        <span className="flex items-center gap-1 text-[11.5px] font-semibold">
                          <Layers className={`h-3 w-3 shrink-0 ${isSelected ? 'text-purple-200' : 'text-purple-500'}`} />
                          <span className="truncate">{ts.name}</span>
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                          <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded ${
                            isSelected ? 'bg-white/20 text-white font-bold' : 'text-purple-700 bg-purple-50'
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

              {/* 🦏🛡️ BRAND SECTION */}
              <div className="space-y-1 pt-2 border-t border-purple-100/70">
                <div className="px-2.5 py-1 font-sans font-bold text-[10.5px] tracking-wider text-[#352F3D] uppercase bg-purple-100/50 rounded-lg flex items-center justify-between border border-purple-200/50">
                  <span className="flex items-center gap-1">
                    <span>🧡</span>
                    <span>🦏🛡️系列</span>
                  </span>
                  <span className="text-[9.5px] font-mono text-purple-800 font-semibold bg-white/80 px-1.5 py-0.2 rounded">
                    {rhinoCount}款
                  </span>
                </div>

                <div className="space-y-0.5 pl-0.5">
                  {PRODUCTS_DATA.SERIES.map((s) => {
                    const isSelected = selectedSeries === s.id;
                    const hasSubseries = s.subseries && s.subseries.length > 0;
                    const seriesCount = allDesigns.filter((d) => d.seriesId === s.id).length;
                    
                    return (
                      <div key={s.id} className="space-y-0.5">
                        <button
                          onClick={() => {
                            setSelectedSeries(s.id);
                            setSelectedSubseries('all');
                            if (isMobile && !hasSubseries) setIsMobileSidebarOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                            isSelected && selectedSubseries === 'all'
                              ? 'bg-[#5C5468] text-white font-medium shadow-xs'
                              : isSelected
                                ? 'bg-purple-50 text-[#231F2E] font-semibold border-l-2 border-purple-600 pl-2'
                                : 'text-[#231F2E] hover:bg-purple-50/60'
                          }`}
                        >
                          <span className="truncate text-[11.5px]">{s.name}</span>
                          <span className="flex items-center gap-1 shrink-0">
                            <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded ${
                              isSelected && selectedSubseries === 'all' ? 'bg-white/20 text-white font-bold' : 'text-purple-800 bg-purple-50'
                            }`}>
                              {seriesCount}款
                            </span>
                            {isSelected && selectedSubseries === 'all' && <Check className="h-3 w-3 text-white" />}
                          </span>
                        </button>
                        
                        {/* Nested Subseries options */}
                        {hasSubseries && isSelected && (
                          <div className="pl-2 pr-1 py-1 space-y-0.5 bg-purple-50/50 rounded-lg border-l-2 border-purple-400 ml-1.5">
                            <button
                              onClick={() => {
                                setSelectedSubseries('all');
                                if (isMobile) setIsMobileSidebarOpen(false);
                              }}
                              className={`w-full text-left text-[11px] px-2 py-1 rounded transition-all flex items-center justify-between cursor-pointer ${
                                selectedSubseries === 'all'
                                  ? 'text-[#231F2E] font-bold bg-white shadow-2xs border border-purple-200'
                                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                              }`}
                            >
                              <span>全部 {s.name}</span>
                              <span className="text-[9.5px] font-mono text-purple-800 font-semibold">
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
                                  className={`w-full text-left text-[11px] px-2 py-1 rounded transition-all flex items-center justify-between cursor-pointer ${
                                    isSubSelected
                                      ? 'text-[#231F2E] font-bold bg-white shadow-2xs border border-purple-300 ring-1 ring-purple-300/40'
                                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                                  }`}
                                >
                                  <span className="truncate flex items-center gap-1">
                                    {isSubSelected && <span className="text-purple-600 font-bold">✦</span>}
                                    {sub.name}
                                  </span>
                                  <span className={`text-[9.5px] font-mono px-1 py-0.2 rounded ${
                                    isSubSelected ? 'bg-purple-100 text-purple-900 font-bold' : 'text-stone-400'
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
          </div>

          {/* Filter 2: Case Compatibility list */}
          <div>
            <span className="font-mono text-[9.5px] tracking-wider text-[#746B84] uppercase block mb-1.5 font-semibold">
              支援殼體 / Shell Support
            </span>
            <div className="flex flex-wrap gap-1">
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
                  className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                    selectedCaseCompatible === c
                      ? 'bg-[#5C5468] text-white border-[#5C5468] font-bold shadow-2xs'
                      : 'border-purple-200/60 bg-white/70 hover:bg-purple-50 text-[#231F2E]'
                  }`}
                >
                  {c === 'all' ? '全部相容' : c}
                </button>
              ))}
            </div>
          </div>

          {/* Filter 3: Badges */}
          <div>
            <span className="font-mono text-[9.5px] tracking-wider text-[#746B84] uppercase block mb-1.5 font-semibold">
              標籤篩選 / Highlights
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'all', label: '全部圖款', icon: null },
                { id: 'all_badges', label: 'NEW + HOT', icon: Sparkles, iconColor: 'text-purple-600' },
                { id: 'new', label: 'NEW ', icon: Zap, iconColor: 'text-purple-600' },
                { id: 'hot', label: 'HOT ', icon: Star, iconColor: 'text-amber-500' },
              ].map((b) => {
                const Icon = b.icon;
                const isSelected = selectedBadge === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBadge(b.id);
                      if (isMobile) setIsMobileSidebarOpen(false);
                    }}
                    className={`text-[10px] tracking-wider font-mono py-1.5 px-2 rounded-xl border transition-all flex items-center justify-center gap-1 cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#5C5468] text-white border-[#5C5468] shadow-2xs font-semibold'
                        : 'border-purple-100 text-stone-600 hover:bg-purple-50 bg-white/60 hover:text-black'
                    }`}
                  >
                    {Icon && <Icon className={`h-3 w-3 ${isSelected ? 'text-white' : b.iconColor}`} />}
                    <span>{b.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
    </>
  );

  return (
    <section id="gallery-section" className="pt-3 pb-12 px-3 sm:px-6 max-w-7xl mx-auto scroll-mt-16 relative z-10 page-enter">
      {/* Compact Editorial Header */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-4 sm:mb-5 border-b border-purple-100/70">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[9.5px] sm:text-[10px] tracking-wider text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md uppercase font-bold border border-purple-200/50 shrink-0">
            Catalog
          </span>
          <h2 className="font-serif text-base sm:text-lg md:text-xl font-bold text-[#231F2E] truncate">
            全品類 <span className="font-serif italic font-normal text-purple-600">瀏覽</span>
          </h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[11px] text-purple-900 bg-purple-50/90 border border-purple-200/60 px-2.5 py-1 rounded-lg shadow-2xs select-none">
            顯示 <b className="text-purple-950 font-bold">{filteredDesigns.length}</b> 款
          </span>
        </div>
      </div>

      {/* Mobile Sidebar Toggle Button & Quick Filter pills bar (only visible on mobile) */}
      <div className="lg:hidden flex flex-col gap-2.5 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-[#5C5468] text-white hover:bg-[#453D50] py-2.5 px-3 rounded-xl font-semibold text-xs tracking-wider uppercase transition-all shadow-xs active:scale-[0.99] cursor-pointer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-purple-200" />
            <span>系列與篩選 ({filteredDesigns.length}款)</span>
          </button>
          
          {/* Quick reset button if any filter is active */}
          {(searchQuery || selectedSeries !== 'all' || selectedSubseries !== 'all' || selectedCaseCompatible !== 'all' || selectedBadge !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="p-2.5 bg-purple-50 text-purple-800 rounded-xl hover:bg-purple-100 transition-colors border border-purple-200/70 shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
              title="清除所有篩選"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Quick Badge Filter row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
          <span className="text-[9.5px] font-mono text-[#746B84] uppercase font-semibold shrink-0 mr-0.5 flex items-center gap-1 select-none">
            <Sparkles className="h-3 w-3 text-purple-600" />
            <span>標籤</span>
          </span>
          {[
            { id: 'all', label: '全部', icon: null },
            { id: 'all_badges', label: 'NEW + HOT', icon: Sparkles, iconClass: 'text-purple-600' },
            { id: 'new', label: 'NEW', icon: Zap, iconClass: 'text-purple-600' },
            { id: 'hot', label: 'HOT', icon: Star, iconClass: 'text-amber-500' },
          ].map((b) => {
            const Icon = b.icon;
            const isSelected = selectedBadge === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setSelectedBadge(b.id)}
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-lg whitespace-nowrap transition-all border shrink-0 flex items-center gap-1 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[#5C5468] text-white border-[#5C5468] shadow-xs'
                    : 'bg-white/80 text-stone-600 border-purple-200/60 hover:bg-purple-50'
                }`}
              >
                {Icon && <Icon className={`h-2.5 w-2.5 ${isSelected ? 'text-white' : b.iconClass}`} />}
                <span>{b.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Quick horizontal series categories row on mobile with clear tutuboom & Rhino distinction */}
        <div className="flex flex-col gap-1.5 select-none">
          {/* Row 1: 全部系列 + 💜 tutuboom 品牌群組 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar -mx-1 px-1">
            <button
              onClick={() => { setSelectedSeries('all'); setSelectedSubseries('all'); }}
              className={`text-[10.5px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap transition-all border shrink-0 cursor-pointer flex items-center gap-1 ${
                selectedSeries === 'all'
                  ? 'bg-[#5C5468] text-white border-[#5C5468] shadow-xs font-bold'
                  : 'bg-white/90 text-[#231F2E] border-purple-200/70 hover:bg-purple-50'
              }`}
            >
              <span>全部系列</span>
              <span className={`text-[9px] font-mono px-1 py-0.1 rounded ${
                selectedSeries === 'all' ? 'bg-white/20 text-white font-bold' : 'bg-purple-50 text-purple-700'
              }`}>
                {allDesigns.length}
              </span>
            </button>

            {/* tutuboom series */}
            <div className="flex items-center gap-1 shrink-0 bg-purple-50/80 p-0.5 rounded-xl border border-purple-200/60">
              <span className="text-[10.5px] font-bold text-purple-950 px-1.5 py-0.5 flex items-center gap-1">
                <span>💜</span>
                <span>tutuboom</span>
              </span>
              {TUTU_SERIES_LIST.map((ts) => {
                const isSelected = selectedSeries === ts.id;
                const count = allDesigns.filter((d) => d.seriesId === ts.id).length;
                return (
                  <button
                    key={ts.id}
                    onClick={() => { setSelectedSeries(ts.id); setSelectedSubseries('all'); }}
                    className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-lg whitespace-nowrap transition-all border shrink-0 cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-purple-900 text-white border-purple-900 shadow-xs font-bold'
                        : 'bg-white text-purple-950 border-purple-200/80 hover:bg-purple-100/70'
                    }`}
                  >
                    <span>{ts.name}</span>
                    <span className={`text-[9px] font-mono px-1 py-0.1 rounded ${
                      isSelected ? 'bg-white/20 text-white font-bold' : 'bg-purple-100 text-purple-800 font-semibold'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: 🦏🛡️ 品牌群組 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar -mx-1 px-1">
            <div className="flex items-center gap-1 shrink-0 bg-purple-50/60 p-0.5 rounded-xl border border-purple-200/50">
              <span className="text-[10.5px] font-bold text-[#231F2E] px-1.5 py-0.5 flex items-center gap-1">
                <span>🧡</span>
                <span>🦏🛡️</span>
              </span>
              {PRODUCTS_DATA.SERIES.map((s) => {
                const isSelected = selectedSeries === s.id;
                const count = allDesigns.filter((d) => d.seriesId === s.id).length;
                return (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedSeries(s.id); setSelectedSubseries('all'); }}
                    className={`text-[10.5px] font-semibold px-2.5 py-0.5 rounded-lg whitespace-nowrap transition-all border shrink-0 cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#5C5468] text-white border-[#5C5468] shadow-xs font-bold'
                        : 'bg-white text-[#231F2E] border-purple-200/80 hover:bg-purple-100/60'
                    }`}
                  >
                    <span>{s.name}</span>
                    <span className={`text-[9px] font-mono px-1 py-0.1 rounded ${
                      isSelected ? 'bg-white/20 text-white font-bold' : 'bg-purple-100 text-purple-800 font-semibold'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
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
              className="fixed top-0 left-0 h-full w-[300px] bg-white shadow-2xl z-50 lg:hidden overflow-y-auto flex flex-col border-r border-purple-100"
            >
              <div className="flex items-center justify-between p-4 border-b border-purple-100 bg-purple-50/40">
                <h3 className="font-serif font-bold text-sm text-[#231F2E] flex items-center gap-1.5">
                  <SlidersHorizontal className="h-4 w-4 text-purple-600" />
                  <span>系列與分類篩選</span>
                </h3>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1 rounded-full hover:bg-purple-100 text-stone-500 hover:text-black transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="p-4 space-y-4 flex-grow">
                {renderSidebarInner(true)}
              </div>
              
              <div className="p-3 border-t border-purple-100 bg-purple-50/30">
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="w-full py-2.5 bg-[#5C5468] text-white font-semibold text-xs rounded-xl uppercase tracking-wider cursor-pointer text-center"
                >
                  套用篩選
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Container with Sticky Sidebar and Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* DESKTOP STICKY SIDEBAR FILTERS (lg:col-span-3 - hidden on mobile) */}
        <div className="hidden lg:block lg:col-span-3 lg:sticky lg:top-20 self-start z-20 space-y-4 glass-frosted rounded-2xl p-4 border border-purple-100/80">
          {renderSidebarInner(false)}
        </div>

        {/* RESULTS GRID (lg:col-span-9) */}
        <div className="lg:col-span-9 space-y-4">
          {/* Desktop quick horizontal series bar - Split into 2 clear rows */}
          <div className="hidden lg:flex flex-col gap-1.5 select-none">
            {/* Row 1: 全部系列 + 💜 tutuboom 品牌群組 */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              <button
                onClick={() => { setSelectedSeries('all'); setSelectedSubseries('all'); }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all border shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  selectedSeries === 'all'
                    ? 'bg-[#5C5468] text-white border-[#5C5468] shadow-xs font-bold'
                    : 'bg-white/90 text-[#231F2E] border-purple-200/80 hover:bg-purple-50'
                }`}
              >
                <span>全部系列</span>
                <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded-md ${
                  selectedSeries === 'all' ? 'bg-white/20 text-white font-bold' : 'bg-purple-50 text-purple-700'
                }`}>
                  {allDesigns.length}
                </span>
              </button>

              {/* 品牌 1: 💜 tutuboom 品牌群組 */}
              <div className="flex items-center gap-1 shrink-0 bg-purple-50/90 p-0.5 rounded-xl border border-purple-200/80 shadow-2xs">
                <span className="text-xs font-bold text-purple-950 px-2 py-0.5 flex items-center gap-1">
                  <span>💜</span>
                  <span>tutuboom</span>
                </span>
                {TUTU_SERIES_LIST.map((ts) => {
                  const isSelected = selectedSeries === ts.id;
                  const count = allDesigns.filter((d) => d.seriesId === ts.id).length;
                  return (
                    <button
                      key={ts.id}
                      onClick={() => { setSelectedSeries(ts.id); setSelectedSubseries('all'); }}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap transition-all border shrink-0 cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-purple-900 text-white border-purple-900 shadow-xs font-bold'
                          : 'bg-white text-purple-950 border-purple-200 hover:bg-purple-100/90'
                      }`}
                    >
                      <span>{ts.name}</span>
                      <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded-md ${
                        isSelected ? 'bg-white/20 text-white font-bold' : 'bg-purple-100 text-purple-800 font-semibold'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: 🦏🛡️ 品牌群組 */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              <div className="flex items-center gap-1 shrink-0 bg-purple-50/60 p-0.5 rounded-xl border border-purple-200/50 shadow-2xs">
                <span className="text-xs font-bold text-[#231F2E] px-2 py-0.5 flex items-center gap-1">
                  <span>🦏</span>
                  <span>🦏🛡️</span>
                </span>
                {PRODUCTS_DATA.SERIES.map((s) => {
                  const isSelected = selectedSeries === s.id;
                  const count = allDesigns.filter((d) => d.seriesId === s.id).length;
                  return (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedSeries(s.id); setSelectedSubseries('all'); }}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap transition-all border shrink-0 cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#5C5468] text-white border-[#5C5468] shadow-xs font-bold'
                          : 'bg-white text-[#231F2E] border-purple-200 hover:bg-purple-100/70'
                      }`}
                    >
                      <span>{s.name}</span>
                      <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded-md ${
                        isSelected ? 'bg-white/20 text-white font-bold' : 'bg-purple-100 text-purple-800 font-semibold'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Series Header with description & active badges summary */}
          {(selectedSeries !== 'all' || selectedSubseries !== 'all' || selectedBadge !== 'all') && (
            <div className="p-3.5 rounded-xl bg-white/80 backdrop-blur-md border border-purple-100/80 flex flex-col gap-1.5 shadow-2xs">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#746B84]">
                <span className="font-mono text-[9.5px] bg-purple-50 text-purple-900 border border-purple-200/50 px-2 py-0.5 rounded-md select-none font-semibold">
                  正在瀏覽
                </span>
                <span className="font-semibold text-[#231F2E]">
                  {selectedSeries === 'all' ? '全部系列' : activeSeriesObj?.name}
                </span>
                {selectedSubseries !== 'all' && (
                  <>
                    <span className="text-stone-400">/</span>
                    <span className="font-semibold text-purple-900">
                      {availableSubseries.find((sub: Subseries) => sub.id === selectedSubseries)?.name}
                    </span>
                  </>
                )}
                {selectedBadge !== 'all' && (
                  <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-900 border border-purple-200">
                    <Sparkles className="h-2.5 w-2.5 text-purple-600" />
                    <span>
                      {selectedBadge === 'all_badges'
                        ? 'NEW + HOT 精選'
                        : selectedBadge === 'new'
                          ? 'NEW '
                          : 'HOT '}
                    </span>
                  </span>
                )}
              </div>
              
              {/* Display series description */}
              {activeSeriesObj?.desc && (
                <p className="text-xs text-stone-600 flex items-start gap-1.5 leading-relaxed">
                  <span className="text-purple-600 select-none">✦</span>
                  <span>{activeSeriesObj.desc}</span>
                </p>
              )}

              {/* Subseries description if selected */}
              {selectedSubseries !== 'all' && availableSubseries.find((sub: Subseries) => sub.id === selectedSubseries)?.desc && (
                <div className="flex items-start gap-1.5 bg-purple-50/60 p-2 rounded-lg border-l-2 border-purple-500 text-xs text-stone-700">
                  <span className="text-purple-600 select-none">ℹ️</span>
                  <span>{availableSubseries.find((sub: Subseries) => sub.id === selectedSubseries)?.desc}</span>
                </div>
              )}
            </div>
          )}

          {/* Subseries Quick Selector Card when a series with subseries is selected */}
          {availableSubseries.length > 0 && (
            <div className="p-3.5 rounded-xl bg-purple-50/40 border border-purple-100 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                  <span className="font-serif font-bold text-xs text-[#231F2E] tracking-wide">
                    {activeSeriesObj?.name} · 子系列選單
                  </span>
                  <span className="text-[9.5px] font-mono text-purple-800 bg-white px-2 py-0.5 rounded-full border border-purple-200 shadow-2xs">
                    共 {availableSubseries.length} 個子系列
                  </span>
                </div>
                {selectedSubseries !== 'all' && (
                  <button
                    onClick={() => setSelectedSubseries('all')}
                    className="text-[10.5px] font-mono text-purple-800 hover:text-black hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <span>全部子系列</span>
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Subseries Buttons */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedSubseries('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    selectedSubseries === 'all'
                      ? 'bg-[#5C5468] text-white border-[#5C5468] shadow-2xs'
                      : 'bg-white text-stone-700 border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                >
                  <span>全部圖款</span>
                  <span className={`text-[9.5px] px-1.5 py-0.1 rounded-full font-mono ${
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
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer border ${
                        isActive
                          ? 'bg-[#5C5468] text-white border-[#5C5468] shadow-2xs'
                          : 'bg-white text-stone-700 border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                      }`}
                    >
                      {isActive && <Check className="h-3 w-3" />}
                      <span>{sub.name}</span>
                      <span className={`text-[9.5px] px-1.5 py-0.1 rounded-full font-mono ${
                        isActive ? 'bg-white/25 text-white' : 'bg-purple-50 text-purple-800'
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
              <div className="space-y-5">
                <motion.div
                  layout
                  className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5"
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
                            ? 'border-purple-600 ring-2 ring-purple-400/40 shadow-md scale-[1.01]'
                            : 'border-purple-100/70 hover:shadow-lg hover:-translate-y-0.5'
                        }`}
                      >
                        {/* Product Preview Image Block */}
                        <div className="relative w-full aspect-[3/4] bg-neutral-100/40 overflow-hidden flex items-center justify-center p-2.5 select-none">
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
                            <div className="flex flex-col items-center justify-center text-brand-muted/30 gap-1 font-mono text-[10px]">
                              <span>No Preview</span>
                            </div>
                          )}

                          {/* Heart favorite overlay */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(d.id);
                            }}
                            className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md border shadow-xs transition-all hover:scale-110 z-20 ${
                              isFavorite
                                ? 'bg-rose-50 border-rose-200 text-rose-500'
                                : 'bg-white/80 border-purple-100 text-purple-700/60 hover:text-rose-500 hover:bg-white'
                            }`}
                            type="button"
                            title={isFavorite ? '取消收藏' : '加入收藏'}
                          >
                            <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                          </button>

                          {/* Top Badges */}
                          {d.badge && (
                            <span className="absolute top-2 left-2 font-mono text-[8px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded shadow-xs bg-[#5C5468] text-white">
                              {d.badge}
                            </span>
                          )}

                          {/* Layer indicator for tutuboom */}
                          {d.layer && (
                            <span className="absolute bottom-2 left-2 font-mono text-[8px] font-bold tracking-wider uppercase bg-purple-900/80 backdrop-blur text-white px-1.5 py-0.5 rounded">
                              {d.layer}
                            </span>
                          )}
                        </div>

                        {/* Card Info Details */}
                        <div className="p-3 border-t border-purple-100/70 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-1">
                              <span className="font-mono text-[9px] text-[#746B84] truncate block mb-0.5">
                                {d.category}
                              </span>
                              {isActive && (
                                <span className="text-[8.5px] bg-[#5C5468] text-white font-semibold px-1.5 py-0.2 rounded flex items-center gap-0.5 shrink-0 whitespace-nowrap">
                                  <Check className="h-2.5 w-2.5 shrink-0" />
                                  <span className="whitespace-nowrap">已選取</span>
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-semibold text-[#231F2E] group-hover:text-purple-900 transition-colors line-clamp-1">
                              {d.title}
                            </h4>
                            {d.link && getSocialLinks(d.link).length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
                                {getSocialLinks(d.link).map((link, idx) => (
                                  <a
                                    key={idx}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/50 px-1.5 py-0.2 rounded-md transition-all text-[9.5px] font-semibold"
                                  >
                                    <span>📕 小紅書</span>
                                    <ExternalLink className="h-2 w-2" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Bottom Model compatible list tags */}
                          <div className="mt-2 flex flex-wrap gap-1 items-center justify-between">
                            <div className="flex flex-wrap gap-1 items-center">
                              <span className="font-mono text-[9px] font-semibold text-purple-900 bg-purple-50 border border-purple-200/60 px-1.5 py-0.2 rounded">
                                #{d.id}
                              </span>
                              <div className="flex gap-1 overflow-hidden">
                                {d.models.slice(0, 2).map((m) => (
                                  <span
                                    key={m.name}
                                    className="font-mono text-[8px] text-stone-500 bg-white/70 border border-purple-100 px-1.5 py-0.2 rounded shrink-0"
                                  >
                                    {m.name}
                                  </span>
                                ))}
                                {d.models.length > 2 && (
                                  <span className="font-mono text-[8px] text-stone-500 bg-white/70 border border-purple-100 px-1 py-0.2 rounded shrink-0">
                                    +{d.models.length - 2}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Interactive Action Bar */}
                          <div className="mt-2.5 pt-2 border-t border-purple-100/70 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleQuickView(d)}
                              className="flex-1 py-1.5 px-1 rounded-lg text-[9.5px] font-bold bg-purple-50/80 hover:bg-purple-100 text-purple-950 border border-purple-200/70 transition-all text-center flex items-center justify-center gap-1 shadow-2xs whitespace-nowrap cursor-pointer"
                              title="快速預覽"
                              type="button"
                            >
                              <Search className="h-2.5 w-2.5 shrink-0 text-purple-700" />
                              <span className="whitespace-nowrap">快速預覽</span>
                            </button>
                            <button
                              onClick={() => handleCustomizeInStudio(d)}
                              className={`flex-1 py-1.5 px-1 rounded-lg text-[9.5px] font-bold transition-all text-center flex items-center justify-center gap-1 shadow-2xs hover:scale-[1.02] whitespace-nowrap cursor-pointer ${
                                isActive
                                  ? 'bg-[#5C5468] text-white font-extrabold shadow-xs'
                                  : 'bg-[#5C5468] text-white hover:bg-[#453D50]'
                              }`}
                              title="進入瀏覽區"
                              type="button"
                            >
                              <Compass className="h-2.5 w-2.5 shrink-0 text-purple-200" />
                              <span className="whitespace-nowrap">瀏覽區</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
                
                {filteredDesigns.length > visibleCount && (
                  <div className="flex justify-center pt-4 pb-2">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 24)}
                      className="px-6 py-2.5 rounded-xl bg-white hover:bg-[#5C5468] hover:text-white text-[#231F2E] border border-purple-200 hover:border-[#5C5468] font-semibold text-xs transition-all duration-300 flex items-center gap-2 shadow-2xs tracking-wide font-sans cursor-pointer"
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
                className="w-full py-16 flex flex-col items-center justify-center text-center glass-frosted rounded-2xl p-6 border border-purple-100"
              >
                <SlidersHorizontal className="h-7 w-7 text-purple-400 opacity-60 mb-2 animate-bounce" />
                <h4 className="font-serif font-semibold text-[#231F2E] mb-1">未找到相符設計</h4>
                <p className="text-xs text-stone-500 max-w-xs">
                  很抱歉，沒有找到符合您篩選條件的設計款手機殼。請嘗試清除搜尋字詞或重置篩選器。
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-3 font-mono text-xs bg-[#5C5468] text-white hover:bg-[#453D50] px-4 py-2 rounded-xl transition-colors cursor-pointer"
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
              className="relative w-full max-w-3xl bg-white rounded-[24px] overflow-hidden shadow-2xl border border-purple-100 flex flex-col md:flex-row max-h-[90vh] md:max-h-none"
            >
              {/* Close Button */}
              <button
                onClick={() => setQuickViewDesign(null)}
                className="absolute top-3.5 right-3.5 z-50 p-2 rounded-full bg-purple-50 hover:bg-purple-100 transition-colors text-stone-600 hover:text-black cursor-pointer"
                aria-label="Close quick view"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Left Side: Mock Stage Carousel */}
              <div className="w-full md:w-1/2 bg-purple-50/30 flex flex-col items-center justify-center p-5 min-h-[280px] md:min-h-[420px] relative select-none border-b md:border-b-0 md:border-r border-purple-100">

                {/* Badge inside image stage */}
                {quickViewDesign.badge && (
                  <span className="absolute top-3.5 left-3.5 z-20 font-mono text-[9px] tracking-wider uppercase px-2 py-0.5 rounded font-bold bg-[#5C5468] text-white shadow-xs">
                    {quickViewDesign.badge}
                  </span>
                )}

                {/* Main image container */}
                <div className="relative w-44 h-[250px] rounded-[22px] border-2 border-stone-700/60 bg-white shadow-md overflow-hidden flex items-center justify-center group/img z-10">
                  {quickViewDesign.models?.[modalModelIdx]?.imgs?.[modalImgIdx] ? (
                    <img
                      src={quickViewDesign.models[modalModelIdx].imgs[modalImgIdx]}
                      alt={quickViewDesign.title}
                      className="max-h-full max-w-full object-contain pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-xs text-stone-400">無預覽效果</span>
                  )}

                  {/* Left and Right arrows */}
                  {quickViewDesign.models?.[modalModelIdx]?.imgs && quickViewDesign.models[modalModelIdx].imgs.length > 1 && (
                    <>
                      <button
                        onClick={() => setModalImgIdx(prev => (prev === 0 ? quickViewDesign.models[modalModelIdx].imgs.length - 1 : prev - 1))}
                        className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all opacity-80 group-hover/img:opacity-100 shadow-md backdrop-blur-xs cursor-pointer z-20"
                        type="button"
                        title="上一張圖片"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setModalImgIdx(prev => (prev === quickViewDesign.models[modalModelIdx].imgs.length - 1 ? 0 : prev + 1))}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all opacity-80 group-hover/img:opacity-100 shadow-md backdrop-blur-xs cursor-pointer z-20"
                        type="button"
                        title="下一張圖片"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Navigation bar with Left/Right Arrows & Dots indicators */}
                {quickViewDesign.models?.[modalModelIdx]?.imgs && quickViewDesign.models[modalModelIdx].imgs.length > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-3 z-10 w-full px-2">
                    <button
                      onClick={() => setModalImgIdx(prev => (prev === 0 ? quickViewDesign.models[modalModelIdx].imgs.length - 1 : prev - 1))}
                      className="p-1 rounded-full bg-white hover:bg-purple-100 text-stone-700 transition-all border border-purple-200 shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
                      type="button"
                      title="上一張"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5 bg-white/90 px-2.5 py-1 rounded-full border border-purple-100 shadow-2xs">
                    {quickViewDesign.models[modalModelIdx].imgs.map((_, imgIdx) => (
                      <button
                        key={imgIdx}
                        onClick={() => setModalImgIdx(imgIdx)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            modalImgIdx === imgIdx ? 'bg-[#5C5468] w-4' : 'bg-purple-200 hover:bg-purple-400 w-1.5'
                        }`}
                        type="button"
                          title={`切換至第 ${imgIdx + 1} 張`}
                      />
                    ))}
                      <span className="font-mono text-[9.5px] text-purple-900 font-semibold ml-0.5 select-none">
                        {modalImgIdx + 1}/{quickViewDesign.models[modalModelIdx].imgs.length}
                      </span>
                    </div>

                    <button
                      onClick={() => setModalImgIdx(prev => (prev === quickViewDesign.models[modalModelIdx].imgs.length - 1 ? 0 : prev + 1))}
                      className="p-1 rounded-full bg-white hover:bg-purple-100 text-stone-700 transition-all border border-purple-200 shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
                      type="button"
                      title="下一張"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Right Side: Details & Actions */}
              <div className="w-full md:w-1/2 p-5 md:p-6 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-none">
                <div className="space-y-4">
                  {/* Category */}
                  <div>
                    <span className="font-mono text-[9.5px] tracking-widest text-[#746B84] uppercase block font-semibold">
                      {quickViewDesign.category}
                    </span>
                  </div>

                  {/* Title & Design ID & Favorite Button */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                    <h3 className="font-serif text-xl font-bold text-[#231F2E] leading-tight">
                      {quickViewDesign.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="font-mono text-[11px] text-purple-900 bg-purple-50 border border-purple-200/60 px-2 py-0.5 rounded-md font-semibold">
                          圖號 #{quickViewDesign.id}
                      </span>
                      {quickViewDesign.layer && (
                        <span className="font-sans text-[11px] font-semibold text-[#231F2E] bg-purple-100/60 border border-purple-200/60 px-2 py-0.5 rounded-md">
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
                      className={`p-2.5 rounded-full border shadow-2xs transition-all hover:scale-110 shrink-0 cursor-pointer ${
                        favorites.includes(quickViewDesign.id)
                          ? 'bg-rose-50 border-rose-200 text-rose-500'
                          : 'bg-white hover:bg-purple-50 border-purple-200 text-purple-700/60 hover:text-rose-500'
                      }`}
                      type="button"
                      title={favorites.includes(quickViewDesign.id) ? '取消收藏' : '加入收藏'}
                    >
                      <Heart className={`h-4 w-4 ${favorites.includes(quickViewDesign.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Description if present */}
                  {quickViewDesign.desc && (
                    <p className="text-xs text-stone-600 leading-relaxed italic bg-purple-50/50 border border-purple-100 p-2.5 rounded-xl">
                      📝 {quickViewDesign.desc}
                    </p>
                  )}

                  {/* Model/Case Types tabs inside modal */}
                  {quickViewDesign.models && quickViewDesign.models.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="font-mono text-[9.5px] tracking-wider text-[#746B84] uppercase block font-semibold">
                        殼體預覽切換 / Shell Models
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {quickViewDesign.models.map((m, mIdx) => (
                          <button
                            key={m.name}
                            onClick={() => {
                              setModalModelIdx(mIdx);
                              setModalImgIdx(0);
                            }}
                            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                              modalModelIdx === mIdx
                                ? 'bg-[#5C5468] text-white border-[#5C5468] font-semibold'
                                : 'border-purple-200/70 hover:bg-purple-50 bg-white text-[#231F2E]'
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
                    <div className="space-y-1.5 pt-1">
                      <span className="font-mono text-[9.5px] tracking-wider text-[#746B84] uppercase block font-semibold">
                        社群平台展示 / Social Link
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {getSocialLinks(quickViewDesign.link).map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/60 px-2.5 py-1 rounded-md transition-all text-xs font-semibold"
                          >
                            <span className="text-xs">📕</span>
                            <span>小紅書</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary CTA Action */}
                <div className="mt-5 pt-3.5 border-t border-purple-100 space-y-2">
                  <button
                    onClick={() => handleCustomizeInStudio(quickViewDesign)}
                    className="w-full py-3 rounded-full bg-[#5C5468] text-white hover:bg-[#453D50] transition-all font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm hover:scale-[1.01] cursor-pointer"
                    type="button"
                  >
                    <Compass className="h-4 w-4 text-purple-200" />
                    <span>進入客製化瀏覽區 🎨</span>
                  </button>

                  <button
                    onClick={() => setQuickViewDesign(null)}
                    className="w-full py-2 rounded-full border border-purple-200 hover:bg-purple-50 transition-colors font-semibold text-xs text-stone-600 uppercase text-center cursor-pointer"
                    type="button"
                  >
                    關閉
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
