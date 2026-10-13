import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';

interface OfficialStoreBadgeProps {
  officialUrl: string;
  className?: string;
}

/**
 * Component displayed in ProductViewer & QuickView when a design is officially available on RhinoShield.
 * Replaces reference price & contact inquiry button with an official store notification and direct purchase button.
 */
export default function OfficialStoreBadge({
  officialUrl,
  className = '',
}: OfficialStoreBadgeProps) {
  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      {/* Official Status Banner */}
      <div className="rounded-2xl p-3.5 sm:p-4 bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-orange-500/10 border border-amber-300/60 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0 border border-amber-400/40">
            <span className="text-base select-none">✨</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-sans font-bold text-xs sm:text-[13px] text-amber-950">
                已上架rhinoshield
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-900 font-semibold border border-amber-400/30">
                <ShieldCheck className="h-2.5 w-2.5" />
                OFFICIAL
              </span>
            </div>
            <p className="text-[10.5px] text-amber-900/80 mt-0.5 truncate leading-tight">
              此圖款已於犀牛盾 RhinoShield 官網上架販售
            </p>
          </div>
        </div>
      </div>

      {/* Primary CTA: Go to official store */}
      <a
        href={officialUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 rounded-full py-3.5 px-5 bg-[#231F2E] text-white hover:bg-black hover:scale-[1.01] active:scale-[0.99] transition-all font-semibold text-xs tracking-wider uppercase shadow-[0_8px_20px_rgba(35,31,46,0.25)] mb-2.5 cursor-pointer select-none group"
        title="在新分頁開啟犀牛盾官方商城"
      >
        <span className="text-amber-300 group-hover:scale-110 transition-transform">🦏</span>
        <span>前往官網購買</span>
        <ExternalLink className="h-3.5 w-3.5 text-amber-200 group-hover:translate-x-0.5 transition-transform" />
      </a>
    </div>
  );
}

/**
 * Compact inline pill tag used next to titles or inside cards.
 */
export function OfficialStoreTag({
  officialUrl,
  className = '',
}: {
  officialUrl?: string | null;
  className?: string;
}) {
  const content = (
    <span
      className={`inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-300/80 px-2 py-0.5 rounded-md font-semibold text-[11px] shadow-2xs select-none ${className}`}
    >
      <span className="text-xs">✨</span>
      <span>已上架rhinoshield</span>
      {officialUrl && <ExternalLink className="h-2.5 w-2.5 text-amber-700" />}
    </span>
  );

  if (officialUrl) {
    return (
      <a
        href={officialUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:scale-[1.02] transition-transform inline-flex cursor-pointer"
        title="前往犀牛盾官網購買"
      >
        {content}
      </a>
    );
  }

  return content;
}
