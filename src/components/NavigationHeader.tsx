import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Sparkles, ShieldCheck, Heart, Compass, Layers, Home } from 'lucide-react';

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
  const isHomeActive = location.pathname === '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-2xl border-b border-purple-100/80 h-13 sm:h-15 flex items-center justify-between px-3 sm:px-6 md:px-10 shadow-[0_2px_12px_rgba(81,74,88,0.04)] transition-all">
      {/* Brand logo - Single-line layout, enlarged mobile font size, and dynamic luxury shimmer effect */}
      <Link
        to="/"
        className="group relative flex items-center gap-1.5 sm:gap-2 px-2 py-1 -ml-1 sm:ml-0 rounded-xl transition-all active:scale-[0.97] cursor-pointer select-none min-w-0 hover:bg-purple-50/60"
        title="返回首頁 / Back to Home"
      >
        {/* Shimmer light sweep container on the logo */}
        <div className="absolute inset-0 rounded-xl animate-logo-shimmer pointer-events-none" />

        {/* Animated Sparkle Icon */}
        <div className="relative flex items-center justify-center shrink-0">
          <Sparkles className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-[#81758F] group-hover:text-[#514A58] animate-sparkle-glow shrink-0 transition-colors" />
          <span className="absolute -inset-1 rounded-full bg-purple-200/30 blur-[4px] -z-10 group-hover:bg-purple-300/40 transition-colors" />
        </div>

        {/* Single-line Title and Subtitle with enlarged font size for mobile */}
        <h1 className="font-serif text-[15.5px] sm:text-lg font-bold tracking-tight text-[#302C35] flex items-center whitespace-nowrap overflow-hidden">
          <span>萬有狀態</span>
          <span className="text-[#81758F] font-serif italic font-normal ml-1 sm:ml-1.5 text-[12.5px] sm:text-sm tracking-normal">
            Omnistate
          </span>
        </h1>
      </Link>

      {/* Center Navigation Tabs - Hidden on mobile, visible on desktop/tablet */}
      <nav className="hidden md:flex items-center p-1 bg-purple-50/80 rounded-full border border-purple-200/60 relative z-10 shadow-inner max-w-full gap-0.5">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none whitespace-nowrap ${
              isActive && !isStudioActive
                ? 'bg-[#5C5468] text-white shadow-xs scale-[1.02]'
                : 'text-[#77717D] hover:text-[#302C35] hover:bg-purple-100/70'
            }`
          }
        >
          <Home className="h-3.5 w-3.5" />
          <span>首頁</span>
        </NavLink>

        <NavLink
          to="/gallery"
          className={({ isActive }) =>
            `flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none whitespace-nowrap ${
              isActive
                ? 'bg-[#5C5468] text-white shadow-xs scale-[1.02]'
                : 'text-[#77717D] hover:text-[#302C35] hover:bg-purple-100/70'
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
          to="/studio"
          className={({ isActive }) =>
            `flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none whitespace-nowrap ${
              isActive || isStudioActive
                ? 'bg-[#5C5468] text-white shadow-xs scale-[1.02]'
                : 'text-[#77717D] hover:text-[#302C35] hover:bg-purple-100/70'
            }`
          }
        >
          <Compass className="h-3.5 w-3.5" />
          <span>瀏覽區</span>
        </NavLink>

        <NavLink
          to="/pricing"
          className={({ isActive }) =>
            `flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none whitespace-nowrap ${
              isActive
                ? 'bg-[#5C5468] text-white shadow-xs scale-[1.02]'
                : 'text-[#77717D] hover:text-[#302C35] hover:bg-purple-100/70'
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
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#302C35] hover:text-[#514A58] bg-purple-50/90 hover:bg-purple-100/90 backdrop-blur-md transition-all border border-purple-200/70 relative cursor-pointer shadow-2xs"
          title="開啟我的收藏清單"
        >
          <Heart
            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors ${
              favoritesCount > 0 ? 'text-rose-500 fill-current' : 'text-[#77717D]'
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

