import React, { useState } from 'react';
import { CASE_TYPES, NOTES } from '../data/productsData';
import { ShieldCheck, Truck, Scale, AlertCircle, Copy, Check, Sparkles, Layers, Info, ArrowDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PricePage() {
  const [copiedText, setCopiedText] = useState<'wechat1' | 'wechat2' | 'line1' | null>(null);
  const [tutuboomTab, setTutuboomTab] = useState<'split' | 'solid'>('split');
  const [selectedRhinoCase, setSelectedRhinoCase] = useState<string>('all');

  const copyContact = (text: string, type: 'wechat1' | 'wechat2' | 'line1') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Helper to extract clean short name for shortcut buttons
  const getShortCaseName = (rawName: string) => {
    if (rawName.includes('AirX')) return 'AirX';
    if (rawName.includes('ModNX')) return 'ModNX';
    if (rawName.includes('ClearX')) return 'ClearX';
    if (rawName.includes('SolidX')) return 'SolidX';
    if (rawName.includes('Clear')) return 'Clear';
    if (rawName.includes('SolidSuit')) return 'SolidSuit';
    if (rawName.includes('不重複')) return '微醺斑比不重複';
    if (rawName.includes('小動物') || rawName.includes('連連看')) return '微醺斑比連連看/花花';
    return rawName.replace(/\(.*?\)/g, '').trim();
  };

  const filteredCaseTypes = selectedRhinoCase === 'all' 
    ? CASE_TYPES 
    : CASE_TYPES.filter(ct => ct.name === selectedRhinoCase);

  // tutuboom structured data
  const tutuboomData = {
    split: {
      title: '分離殼 (可換背板)',
      subtitle: '雙層 / 單層印刷工藝・背板與邊框可拆裝',
      craft: [
        { label: '雙層印刷', desc: '圖層分離效果明顯，立體景深豐富' },
        { label: '單層印刷', desc: '可做出半透明、漸變、細緻微浮雕效果' },
      ],
      modelsSupported: ['iPhone 17 Pro', 'iPhone 17 Pro Max'],
      regularFrames: ['迷你粉', '暗夜黑', '朱古力', '磨砂透'],
      limitedFrames: ['限定透藍框', '限定透粉框'],
      prices: [
        { name: '單層印刷背板', price: '¥168.3' },
        { name: '單層印刷背板 + 常規邊框', price: '¥295.8' },
        { name: '雙層印刷背板', price: '¥185.3' },
        { name: '雙層印刷背板 + 常規邊框', price: '¥312.8' },
        { name: '限定透彩邊框 + 背板 (透藍/透粉, 單雙層皆可)', price: '¥308.0' },
      ]
    },
    solid: {
      title: '一體殼 (磨砂殼)',
      subtitle: '單層印刷工藝・細膩磨砂質感手感',
      craft: [
        { label: '單層印刷', desc: '細緻噴繪印刷，磨砂親膚防滑觸感，全包保護' },
      ],
      modelsSupported: ['iPhone 16 Pro', 'iPhone 16 Pro Max', 'iPhone 17 Air', 'iPhone 17 Pro', 'iPhone 17 Pro Max'],
      caseTypes: ['白透磨砂', '全透磨砂', '相機按鈕版'],
      prices: [
        { name: '白透 / 全透磨砂殼', price: '¥142.8' },
        { name: '白透 / 全透磨砂殼 (相機按鈕版)', price: '¥159.8' },
      ]
    }
  };

  return (
    <section id="price-page" className="py-4 sm:py-6 px-3 sm:px-6 md:px-10 max-w-7xl mx-auto page-enter relative z-10">
      {/* Compact Editorial Header */}
      <div className="text-center mb-5 sm:mb-7">
        <span className="font-mono text-[9.5px] sm:text-[10.5px] tracking-[0.2em] text-[#746B84] uppercase block mb-1 font-bold">
          PRICE & SPECIFICATIONS
        </span>
        <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-[#231F2E]">
          殼體規格與 <span className="font-serif italic font-normal text-[#8B5CF6]">價格運送說明</span>
        </h2>
        <p className="text-[11.5px] text-[#746B84] mt-1 max-w-md mx-auto leading-relaxed">
          
        </p>

        {/* 3 Quick Jump Action Buttons Requested by User */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4 select-none">
          <button
            onClick={() => scrollToSection('tutuboom-price-section')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#5C5468] hover:bg-[#453D50] text-white text-xs font-semibold shadow-xs hover:scale-[1.02] transition-all cursor-pointer border border-[#453D50]/50"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-300" />
            <span>tutuboom 價格</span>
            <ArrowDown className="h-3 w-3 opacity-70" />
          </button>

          <button
            onClick={() => scrollToSection('rhinoshield-price-section')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/90 hover:bg-purple-50 text-[#231F2E] text-xs font-semibold shadow-xs hover:scale-[1.02] transition-all cursor-pointer border border-purple-200"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#8B5CF6]" />
            <span>🦏🛡️價格</span>
            <ArrowDown className="h-3 w-3 opacity-60 text-[#746B84]" />
          </button>

          <button
            onClick={() => scrollToSection('rhinoshield-shipping-section')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/90 hover:bg-purple-50 text-[#231F2E] text-xs font-semibold shadow-xs hover:scale-[1.02] transition-all cursor-pointer border border-purple-200"
          >
            <Truck className="h-3.5 w-3.5 text-[#8B5CF6]" />
            <span>🦏🛡️商品寄送說明</span>
            <ArrowDown className="h-3 w-3 opacity-60 text-[#746B84]" />
          </button>
        </div>
      </div>

      {/* 1. TUTUBOOM DEDICATED SHOWCASE SECTION */}
      <div id="tutuboom-price-section" className="mb-8 sm:mb-10 scroll-mt-20">
        <div className="bg-white/85 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-purple-200/80 shadow-[0_6px_25px_rgba(139,92,246,0.05)] backdrop-blur-2xl relative overflow-hidden">
          {/* Header Banner for tutuboom */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-100/80 text-purple-700 flex items-center justify-center shrink-0 shadow-xs border border-purple-200/60">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#231F2E] flex items-center gap-1.5">
                    tutuboom <span className="text-purple-600 font-normal italic font-serif text-sm sm:text-base">訂製系列價格</span>
                  </h3>
                  <span className="text-[8.5px] font-mono font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full shadow-xs tracking-wider uppercase">
                    Brand Exclusive
                  </span>
                </div>
                <p className="text-[11px] text-[#746B84] mt-0.5">
                  高品質雙層/單層工藝分離殼與輕薄磨砂一體殼
                </p>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center p-1 bg-purple-100/60 rounded-xl border border-purple-200/60 shrink-0">
              <button
                onClick={() => setTutuboomTab('split')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  tutuboomTab === 'split'
                    ? 'bg-[#5C5468] text-white shadow-xs'
                    : 'text-[#5C5468] hover:text-[#231F2E] hover:bg-purple-200/50'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>分離殼 (可換背板)</span>
              </button>
              <button
                onClick={() => setTutuboomTab('solid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  tutuboomTab === 'solid'
                    ? 'bg-[#5C5468] text-white shadow-xs'
                    : 'text-[#5C5468] hover:text-[#231F2E] hover:bg-purple-200/50'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>一體殼 (磨砂殼)</span>
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="mt-4">
            <AnimatePresence mode="wait">
              {tutuboomTab === 'split' ? (
                <motion.div
                  key="split-tab"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Info Row: Craft & Compatibility */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Craft Process Description */}
                    <div className="lg:col-span-6 bg-purple-50/50 border border-purple-100 rounded-xl p-3.5 sm:p-4 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-purple-900 font-semibold text-xs tracking-wide">
                        <Info className="h-3.5 w-3.5 text-purple-600" />
                        <span>工藝說明 / Craft Process</span>
                      </div>
                      <div className="space-y-1.5 text-[11.5px]">
                        {tutuboomData.split.craft.map((c, i) => (
                          <div key={i} className="flex items-start gap-2 bg-white/75 rounded-lg p-2 border border-purple-100/70">
                            <span className="font-bold text-purple-950 shrink-0">・{c.label}：</span>
                            <span className="text-[#5C5468] leading-relaxed">{c.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Models & Frames Chips */}
                    <div className="lg:col-span-6 bg-purple-50/50 border border-purple-100 rounded-xl p-3.5 sm:p-4 space-y-3">
                      {/* Supported Models */}
                      <div>
                        <span className="font-mono text-[9.5px] uppercase tracking-wider text-purple-900/70 block mb-1 font-bold">
                          ☁️ 適用型號 / Compatible Models
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {tutuboomData.split.modelsSupported.map((model, i) => (
                            <span key={i} className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-white border border-purple-200/80 text-purple-950 shadow-xs">
                              {model}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Regular Frames */}
                      <div>
                        <span className="font-mono text-[9.5px] uppercase tracking-wider text-purple-900/70 block mb-1 font-bold">
                          🎨 常規邊框顏色 / Regular Frames
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {tutuboomData.split.regularFrames.map((color, i) => (
                            <span key={i} className="px-2.5 py-0.5 rounded-full text-[10.5px] font-medium bg-purple-100/80 border border-purple-200 text-purple-900">
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Limited Frames */}
                      <div>
                        <span className="font-mono text-[9.5px] uppercase tracking-wider text-purple-900/70 block mb-1 font-bold">
                          ✨ 限定透彩邊框 / Limited Edition
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {tutuboomData.split.limitedFrames.map((color, i) => (
                            <span key={i} className="px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-gradient-to-r from-pink-100 to-purple-100 border border-purple-300/70 text-purple-900 shadow-xs">
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Table Card */}
                  <div className="bg-white/90 border border-purple-100 rounded-xl p-3.5 sm:p-4 shadow-xs">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="font-mono text-[9.5px] uppercase tracking-wider text-purple-900/70 font-bold">
                        訂製價格表格 / Price Breakdown
                      </span>
                      <span className="text-[10.5px] text-[#746B84] font-medium">
                        單層 / 雙層背板與邊框組合
                      </span>
                    </div>

                    <div className="divide-y divide-purple-100/70 border border-purple-100 rounded-lg overflow-hidden">
                      {tutuboomData.split.prices.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 px-3 bg-white hover:bg-purple-50/40 transition-colors text-xs">
                          <span className="font-medium text-[#231F2E] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            {p.name}
                          </span>
                          <span className="font-mono font-bold text-purple-700 text-xs sm:text-sm bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200/50">
                            {p.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="solid-tab"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Info Row: Craft & Compatibility */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Craft Process Description */}
                    <div className="lg:col-span-6 bg-purple-50/50 border border-purple-100 rounded-xl p-3.5 sm:p-4 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-purple-900 font-semibold text-xs tracking-wide">
                        <Info className="h-3.5 w-3.5 text-purple-600" />
                        <span>工藝說明 / Craft Process</span>
                      </div>
                      <div className="space-y-1.5 text-[11.5px]">
                        {tutuboomData.solid.craft.map((c, i) => (
                          <div key={i} className="flex items-start gap-2 bg-white/75 rounded-lg p-2 border border-purple-100/70">
                            <span className="font-bold text-purple-950 shrink-0">・{c.label}：</span>
                            <span className="text-[#5C5468] leading-relaxed">{c.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Models & Options Chips */}
                    <div className="lg:col-span-6 bg-purple-50/50 border border-purple-100 rounded-xl p-3.5 sm:p-4 space-y-3">
                      {/* Supported Models */}
                      <div>
                        <span className="font-mono text-[9.5px] uppercase tracking-wider text-purple-900/70 block mb-1 font-bold">
                          ☁️ 適用型號 / Compatible Models
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {tutuboomData.solid.modelsSupported.map((model, i) => (
                            <span key={i} className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-white border border-purple-200/80 text-purple-950 shadow-xs">
                              {model}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Shell Material Options */}
                      <div>
                        <span className="font-mono text-[9.5px] uppercase tracking-wider text-purple-900/70 block mb-1 font-bold">
                          🎨 殼體選項 / Shell Finish Options
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {tutuboomData.solid.caseTypes.map((opt, i) => (
                            <span key={i} className="px-2.5 py-0.5 rounded-full text-[10.5px] font-medium bg-purple-100/80 border border-purple-200 text-purple-900">
                              {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Table Card */}
                  <div className="bg-white/90 border border-purple-100 rounded-xl p-3.5 sm:p-4 shadow-xs">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="font-mono text-[9.5px] uppercase tracking-wider text-purple-900/70 font-bold">
                        訂製價格表格 / Price Breakdown
                      </span>
                      <span className="text-[10.5px] text-[#746B84] font-medium">
                        全包一體磨砂殼
                      </span>
                    </div>

                    <div className="divide-y divide-purple-100/70 border border-purple-100 rounded-lg overflow-hidden">
                      {tutuboomData.solid.prices.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 px-3 bg-white hover:bg-purple-50/40 transition-colors text-xs">
                          <span className="font-medium text-[#231F2E] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            {p.name}
                          </span>
                          <span className="font-mono font-bold text-purple-700 text-xs sm:text-sm bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200/50">
                            {p.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Gray Note Disclaimer */}
          <div className="mt-4 pt-3 border-t border-purple-100 flex flex-col sm:flex-row gap-2 sm:gap-5 text-[11px] text-stone-500 bg-stone-50/70 rounded-xl p-2.5 border border-stone-200/60">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-amber-500">💡</span>
              <span>實物和預覽圖可能有輕微色差，預覽圖僅供工藝參考。</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-purple-500">💡</span>
              <span>tutuboom 標示價格已含大陸段運費，具體事宜可直接私訊萬有狀態。</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. OTHER CASE TYPES GRID (🦏🛡️等其他殼體) */}
      <div id="rhinoshield-price-section" className="mb-8 sm:mb-10 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-3.5">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#231F2E] flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#81758F]" />
              <span>🦏🛡️殼體品類規格與參考價格</span>
            </h3>
            <p className="text-[11.5px] text-[#746B84] mt-0.5">
              點擊下方快捷按鈕可快速切換查看特定殼體規格與價格
            </p>
          </div>
          <span className="text-[11px] text-[#746B84] font-mono hidden sm:inline-block">
            RhinoShield & Official Cases ({CASE_TYPES.length} 款)
          </span>
        </div>

        {/* 殼體快捷按鈕列 (Quick Case Type Shortcut Selector) */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 border border-purple-200/70 shadow-2xs mb-4">
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {/* 全部按鈕 */}
            <button
              onClick={() => setSelectedRhinoCase('all')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer select-none shrink-0 ${
                selectedRhinoCase === 'all'
                  ? 'bg-[#5C5468] text-white shadow-xs scale-[1.02]'
                  : 'bg-purple-50/70 text-[#5C5468] hover:bg-purple-100 hover:text-[#231F2E] border border-purple-100'
              }`}
            >
              <span>全部殼體</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedRhinoCase === 'all' ? 'bg-white/25 text-white' : 'bg-purple-200/60 text-[#5C5468]'
              }`}>
                {CASE_TYPES.length}
              </span>
            </button>

            {/* 各殼體快捷按鈕 */}
            {CASE_TYPES.map((ct) => {
              const shortName = getShortCaseName(ct.name);
              const isSelected = selectedRhinoCase === ct.name;
              return (
                <button
                  key={ct.name}
                  onClick={() => setSelectedRhinoCase(ct.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer select-none shrink-0 ${
                    isSelected
                      ? 'bg-[#5C5468] text-white shadow-xs scale-[1.02]'
                      : 'bg-white text-[#5C5468] hover:bg-purple-50 hover:text-[#231F2E] border border-purple-200/60 shadow-2xs'
                  }`}
                >
                  <span 
                    className="w-2 h-2 rounded-full shrink-0" 
                    style={{ backgroundColor: isSelected ? '#ECE8F0' : (ct.iconColor || '#81758F') }} 
                  />
                  <span>{shortName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 殼體卡片列表 (支援全部展示與單殼體獨立聚焦) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <AnimatePresence mode="popLayout">
            {filteredCaseTypes.map((ct, idx) => (
              <motion.div
                key={ct.name}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, delay: idx * 0.02 }}
                className="group relative flex flex-col rounded-2xl overflow-hidden glass-card transition-all hover:shadow-md border border-purple-100/90"
              >
                {/* Header */}
                <div className="p-3.5 sm:p-4 border-b border-purple-100/70 bg-white/50">
                  <div className="flex items-start justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-serif text-sm sm:text-base font-bold text-[#231F2E]">
                          {ct.name}
                        </h4>
                        {selectedRhinoCase === ct.name && (
                          <span className="text-[9px] bg-[#ECE8F0] text-[#5C5468] font-mono px-1.5 py-0.2 rounded font-semibold">
                            已選中
                          </span>
                        )}
                      </div>
                      <p 
                        className="text-[10.5px] text-[#746B84] mt-0.5 leading-normal"
                        dangerouslySetInnerHTML={{ __html: ct.nameEm }}
                      />
                    </div>
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs border border-purple-100"
                      style={{ 
                        backgroundColor: ct.iconBg || '#f5f0fb', 
                        color: ct.iconColor || '#8B5CF6' 
                      }}
                    >
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-center">
                    <div className="sm:col-span-3 space-y-1">
                      <span className="font-mono text-[8.5px] uppercase tracking-wider block font-bold text-[#746B84]">
                        工藝說明 / Details
                      </span>
                      <p 
                        className="text-[11px] leading-relaxed text-[#5C5468]"
                        dangerouslySetInnerHTML={{ __html: ct.desc }}
                      />
                    </div>
                    <div className="sm:col-span-2 flex justify-center">
                      <div className="relative w-16 h-22 rounded-lg overflow-hidden p-1 flex items-center justify-center border border-dashed border-purple-200/80 bg-purple-50/30">
                        {ct.img ? (
                          <img 
                            src={ct.img} 
                            alt={ct.name} 
                            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="text-[9px] text-[#746B84] font-mono">Image</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price list */}
                  <div className="pt-2.5 border-t border-purple-100/70 space-y-1">
                    <span className="font-mono text-[8.5px] uppercase tracking-wider block font-bold text-[#746B84]">
                      訂製參考價格 / Models & Prices
                    </span>
                    <div className="space-y-0.5">
                      {ct.models.map((m, mIdx) => (
                        <div 
                          key={mIdx} 
                          className="flex justify-between items-center text-xs py-0.5 border-b border-purple-50 last:border-0"
                        >
                          <span className="font-medium text-[#231F2E] text-[11.5px]">{m.name}</span>
                          <span className="font-mono font-bold text-[#5C5468] text-xs bg-purple-50 px-2 py-0.2 rounded border border-purple-200/40">
                            {m.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 若只選中單個殼體時，顯示返回全部按鈕 */}
        {selectedRhinoCase !== 'all' && (
          <div className="text-center mt-4">
            <button
              onClick={() => setSelectedRhinoCase('all')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-purple-50 text-[#5C5468] border border-purple-200 shadow-2xs transition-all cursor-pointer"
            >
              <span>查看所有🦏🛡️殼體規格 ({CASE_TYPES.length} 款)</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Logistics & Shipping Guide */}
      <div id="rhinoshield-shipping-section" className="glass-frosted rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-8 scroll-mt-20 border border-purple-100 shadow-[0_6px_25px_rgba(139,92,246,0.04)]">
        <div className="flex items-center gap-2 mb-4">
          <Truck className="h-5 w-5 text-[#5C5468]" />
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#231F2E]">
            商品寄送說明 <em>for🦏🛡️</em>
          </h3>
        </div>

        {/* Schemes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="bg-white/75 rounded-xl p-3.5 sm:p-4 border border-purple-100 shadow-xs">
            <span className="inline-block text-[9px] font-mono tracking-widest bg-[#5C5468] text-white px-2 py-0.5 rounded-full mb-2 uppercase font-semibold">
              Scheme A
            </span>
            <h4 className="font-sans font-bold text-xs sm:text-sm text-[#231F2E] mb-1.5">僅購買萬有商品</h4>
            <ol className="list-decimal list-inside text-xs text-[#5C5468] space-y-1 leading-relaxed">
              <li>填寫集運委託登記表單（萬有狀態商品滿 <b>225元</b> 即可安排下單，未滿需等待湊單滿額後下單🙇）</li>
              <li>私訊萬有狀態支付商品款項</li>
              <li>私訊 Jimmibobo 支付運費並通知留意包裹</li>
              <li>商品寄達台灣後由 Jimmibobo 代收並拼郵，安排寄往大陸</li>
            </ol>
          </div>

          <div className="bg-white/75 rounded-xl p-3.5 sm:p-4 border border-purple-100 shadow-xs">
            <span className="inline-block text-[9px] font-mono tracking-widest bg-[#5C5468] text-white px-2 py-0.5 rounded-full mb-2 uppercase font-semibold">
              Scheme B
            </span>
            <h4 className="font-sans font-bold text-xs sm:text-sm text-[#231F2E] mb-1.5">已有 Jimmibobo 其他商品，想合併寄送</h4>
            <ol className="list-decimal list-inside text-xs text-[#5C5468] space-y-1 leading-relaxed">
              <li>私訊萬有狀態並支付手機殼商品款項</li>
              <li>通知集運留意包裹，待所有委託商品集齊</li>
              <li>Jimmibobo 收到萬有商品及其他委託商品</li>
              <li>合併打包後寄出</li>
            </ol>
          </div>
        </div>

        {/* Methods */}
        <div className="mb-5">
          <h4 className="font-serif text-xs sm:text-sm font-bold text-[#231F2E] mb-3 text-center">
            ✦ 四種彈性寄送方案 ✦
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white rounded-xl border border-purple-300/80 shadow-xs relative">
              <span className="absolute top-2.5 right-2.5 text-[8.5px] font-mono font-bold bg-[#5C5468] text-white px-1.5 py-0.2 rounded-full">
                推薦
              </span>
              <h5 className="font-sans font-bold text-xs text-[#231F2E] mb-0.5">拼郵 (默認)</h5>
              <p className="text-[10px] text-[#746B84] mb-1.5">代收、集運、大陸段轉寄</p>
              <div className="font-mono text-xs font-bold text-purple-700 mb-1.5">約 ¥25 元起 / <b>300 g</b> <br />（如果一元拍需加¥5）</div>
              <p className="text-[10.5px] text-[#5C5468] leading-normal">可與 Jimmibobo 其他委託商品合包寄送，包裹需控制在300g以內，總重量不超過1kg。</p>
            </div>

            <div className="p-3.5 bg-white/75 rounded-xl border border-purple-100 shadow-xs">
              <h5 className="font-sans font-bold text-xs text-[#231F2E] mb-0.5">Jimmibobo 順豐直郵優惠版</h5>
              <p className="text-[10px] text-[#746B84] mb-1.5">台灣 → 大陸・專屬福利方案</p>
              <div className="font-mono text-xs font-bold text-purple-700 mb-1.5">¥55 元 / 1kg</div>
              <p className="text-[10.5px] text-[#5C5468] leading-normal"><b>必須</b>與 Jimmibobo 其他委託商品合包，萬有商品包裹控制在300g以內。</p>
            </div>

            <div className="p-3.5 bg-white/75 rounded-xl border border-purple-100 shadow-xs">
              <h5 className="font-sans font-bold text-xs text-[#231F2E] mb-0.5">萬有順豐直郵</h5>
              <p className="text-[10px] text-[#746B84] mb-1.5">台灣 → 大陸・無需拼郵</p>
              <div className="font-mono text-xs font-bold text-purple-700 mb-1.5">運費到付 (約 ¥80 元)</div>
              <p className="text-[10.5px] text-[#5C5468] leading-normal">依實際物流報價為準，可直接聯繫萬有安排寄出。</p>
            </div>

            <div className="p-3.5 bg-white/75 rounded-xl border border-purple-100 shadow-xs">
              <h5 className="font-sans font-bold text-xs text-[#231F2E] mb-0.5">🦏🛡️官網直郵</h5>
              <p className="text-[10px] text-[#746B84] mb-1.5">台灣 → 大陸/香港/澳門</p>
              <div className="font-mono text-xs font-bold text-purple-700 mb-1.5">滿 ¥450 元免運</div>
              <p className="text-[10.5px] text-[#5C5468] leading-normal">訂單滿 450 元 (CNY)。可能產生稅金(20%)需自理🙇。</p>
            </div>
          </div>
        </div>

        {/* Weight reference */}
        <div className="bg-purple-50/60 rounded-xl p-3 sm:p-4 border border-purple-100 flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
          <div className="flex items-start gap-2.5">
            <Scale className="h-4.5 w-4.5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-sans font-bold text-xs text-[#231F2E] mb-0.5">
                Jimmibobo 委託寄送重量規則
              </h5>
              <p className="text-[11px] text-[#5C5468] leading-relaxed">
                單份包裹建議不超過 <b>300g</b> (約 2 個手機殼)，<b>每超過 300g</b> 需補運費 <b>¥20 元</b>。如若包裹總重量<b>大於1kg</b>，則無法使用拼郵只能使用順豐寄送🙇。
                <br />
                <b>重量參考：</b>單背板含原包裝約 <b>50g</b>；手機殼含原包裝約 <b>125g</b>。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Notes & Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 glass-frosted rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-purple-100">
        <div>
          <h4 className="font-serif font-bold text-xs sm:text-sm text-[#231F2E] border-l-2 border-purple-600 pl-2 mb-3">
            備註與注意事項 / Notice
          </h4>
          <ul className="space-y-2 text-xs text-[#5C5468] leading-relaxed">
            {NOTES.slice(0, 4).map((note, i) => (
              <li key={i} className="bg-white/60 p-2.5 rounded-lg border border-purple-50">
                <span className="font-bold text-[#231F2E] block mb-0.5 text-[11.5px]">
                  {note.label}：
                </span>
                <span className="text-[11px]" dangerouslySetInnerHTML={{ __html: note.val }} />
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <h4 className="font-serif font-bold text-xs sm:text-sm text-[#231F2E] border-l-2 border-purple-600 pl-2 mb-3">
              聯繫方式 / Contacts
            </h4>
            <div className="space-y-2">
              {/* 萬有狀態 WeChat */}
              <div className="p-2.5 sm:p-3 bg-white/75 rounded-xl border border-purple-100 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[9.5px] text-[#746B84] font-mono uppercase tracking-wider block font-semibold">萬有狀態 WeChat</span>
                  <span className="text-xs sm:text-sm font-bold font-mono text-[#231F2E]">mussessein-7</span>
                </div>
                <button
                  onClick={() => copyContact('mussessein-7', 'wechat1')}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#5C5468] hover:bg-[#453D50] text-white transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  {copiedText === 'wechat1' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedText === 'wechat1' ? '已複製' : '複製'}</span>
                </button>
              </div>

              {/* 萬有狀態 Line */}
              <div className="p-2.5 sm:p-3 bg-white/75 rounded-xl border border-purple-100 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[9.5px] text-[#746B84] font-mono uppercase tracking-wider block font-semibold">萬有狀態 Line</span>
                  <span className="text-xs sm:text-sm font-bold font-mono text-[#231F2E]">esmusssein-</span>
                </div>
                <button
                  onClick={() => copyContact('esmusssein-', 'line1')}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#5C5468] hover:bg-[#453D50] text-white transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  {copiedText === 'line1' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedText === 'line1' ? '已複製' : '複製'}</span>
                </button>
              </div>

              {/* Jimmibobo WeChat */}
              <div className="p-2.5 sm:p-3 bg-white/75 rounded-xl border border-purple-100 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[9.5px] text-[#746B84] font-mono uppercase tracking-wider block font-semibold">Jimmibobo WeChat</span>
                  <span className="text-xs sm:text-sm font-bold font-mono text-[#231F2E]">jimmibobotw</span>
                </div>
                <button
                  onClick={() => copyContact('jimmibobotw', 'wechat2')}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#5C5468] hover:bg-[#453D50] text-white transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  {copiedText === 'wechat2' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedText === 'wechat2' ? '已複製' : '複製'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3.5 p-2.5 sm:p-3 rounded-xl border border-purple-100 bg-purple-50/60 flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-purple-700 shrink-0 mt-0.5" />
            <p className="text-[10.5px] text-[#5C5468] leading-normal font-medium">
              本頁面之運費與拼郵等細則僅針對運往大陸段，其他地區與國家之購買規則請您聯繫萬有狀態了解詳情 🗺️。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
