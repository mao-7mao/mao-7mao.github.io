import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Sparkles, ShieldCheck, Heart, Compass, Layers } from 'lucide-react';

interface NavigationHeaderProps {
  favoritesCount: number;
  onOpenFavorites: () => void;
  allDesignsCount: number;
}

export default function NavigationHeader({
  favoritesCount,
  onOpenFavorites,
  allDesignsCount,
}: NavigationHeaderProps) {
  const location = useLocation();
  const isStudioActive = location.pathname.startsWith('/studio');

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/85 backdrop-blur-2xl border-b border-purple-100/80 h-14 sm:h-16 flex items-center justify-between px-3.5 sm:px-8 md:px-12 shadow-[0_2px_12px_rgba(139,92,246,0.04)] transition-all">
      {/* Brand logo */}
      <Link
        to="/"
        className="flex items-center gap-1.5 sm:gap-2 cursor-pointer relative z-10 select-none group min-w-0"
      >
        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 group-hover:rotate-12 transition-transform shrink-0" />
        <h1 className="font-serif text-sm sm:text-base md:text-lg font-bold tracking-tight text-[#231F2E] flex items-center whitespace-nowrap overflow-hidden text-ellipsis">
          萬有狀態 <span className="text-[#8B5CF6] font-normal italic font-serif ml-1 sm:ml-1.5 text-xs sm:text-sm md:text-base">Omnistate</span>
        </h1>
      </Link>

      {/* Center Navigation Tabs - Hidden on mobile, visible on desktop/tablet */}
      <nav className="hidden md:flex items-center p-1 bg-purple-50/80 rounded-full border border-purple-200/60 relative z-10 shadow-inner max-w-full gap-0.5">
        <NavLink
          to="/studio"
          className={({ isActive }) =>
            `flex items-center gap-1 sm:gap-1.5 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none whitespace-nowrap ${
              isActive || isStudioActive
                ? 'bg-[#5C5468] text-white shadow-xs scale-[1.02]'
                : 'text-[#746B84] hover:text-[#231F2E] hover:bg-purple-100/70'
            }`
          }
        >
          <Compass className="h-3.5 w-3.5" />
          <span>瀏覽區</span>
        </NavLink>

        <NavLink
          to="/gallery"
          className={({ isActive }) =>
            `flex items-center gap-1 sm:gap-1.5 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none whitespace-nowrap ${
              isActive
                ? 'bg-[#5C5468] text-white shadow-xs scale-[1.02]'
                : 'text-[#746B84] hover:text-[#231F2E] hover:bg-purple-100/70'
            }`
          }
        >
          <Layers className="h-3.5 w-3.5" />
          <span>全品類</span>
          {allDesignsCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                location.pathname === '/gallery'
                  ? 'bg-white/25 text-white'
                  : 'bg-purple-200/70 text-purple-900'
              }`}
            >
              {allDesignsCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/pricing"
          className={({ isActive }) =>
            `flex items-center gap-1 sm:gap-1.5 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none whitespace-nowrap ${
              isActive
                ? 'bg-[#5C5468] text-white shadow-xs scale-[1.02]'
                : 'text-[#746B84] hover:text-[#231F2E] hover:bg-purple-100/70'
            }`
          }
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>價格與運送</span>
        </NavLink>
      </nav>

      {/* Right Controls: Favorites Button */}
      <div className="flex items-center gap-2 relative z-10 shrink-0">
        <button
          onClick={onOpenFavorites}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#231F2E] hover:text-purple-700 bg-purple-50/80 hover:bg-purple-100/80 backdrop-blur-md transition-all border border-purple-200/60 relative cursor-pointer"
          title="開啟我的收藏清單"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              favoritesCount > 0 ? 'text-rose-500 fill-current' : 'text-[#746B84]'
            }`}
          />
          <span className="hidden sm:inline">收藏清單</span>
          {favoritesCount > 0 && (
            <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono leading-none shadow-xs">
              {favoritesCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
