/** @jsxRuntime classic */
/** @jsx React.createElement */
import React, { useState } from 'react';
import { Copy, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDesign: {
    id: string;
    title: string;
    layer?: string;
  } | null;
  selectedCaseType: string;
  totalPrice: string;
}

export default function OrderInquiryModal({
  isOpen,
  onClose,
  selectedDesign,
  selectedCaseType,
  totalPrice,
}: OrderInquiryModalProps) {
  const [copiedText, setCopiedText] = useState<'wechat' | 'wechat2' | 'line' | 'order' | null>(null);

  const isTutuBoom = selectedDesign?.id.startsWith('tb-') || !!selectedDesign?.layer || selectedCaseType.includes('TutuBoom');

  const getDesignNote = (title?: string) => {
    if (!title) return '';
    const parts = title.split(/<br\s*\/?>/i);
    return parts.length > 1 ? parts.slice(1).join('<br/>').trim() : '';
  };

  const orderSummaryText = `我想要詢問客製化手機殼：
- 款號：${selectedDesign?.id || '未選擇'}
- 款式名稱：${selectedDesign?.title || '未選擇'}
- 殼體：${selectedCaseType}
- 參考價格：${totalPrice}`;

  const copyToClipboard = (text: string, type: 'wechat' | 'wechat2' | 'line' | 'order') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-brand-bg p-5 sm:p-6 shadow-2xl border border-brand-border z-10 no-scrollbar"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-brand-muted hover:bg-brand-border hover:text-brand-text transition-colors"
              aria-label="關閉"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <span className="font-mono text-xs tracking-widest text-brand-accent uppercase block mb-1">
                Order Request
              </span>
              <h3 className="font-serif text-2xl font-semibold text-brand-text">
                購買諮詢與 <em>客製確認</em>
              </h3>
              <p className="text-xs text-brand-muted mt-1">
                萬有狀態採取手工登記訂製，請複製下方規格詳情並私訊。
              </p>
            </div>

            {/* Selected Spec Summary */}
            <div className="rounded-xl border border-brand-border bg-brand-card p-4 mb-6 shadow-inner">
              <span className="font-mono text-[10px] tracking-wider text-brand-muted uppercase block mb-2">
                您的客製規格 / Specifications
              </span>
              <div className="space-y-1.5 text-xs text-brand-text font-sans">
                <div className="flex justify-between border-b border-brand-bg pb-1">
                  <span className="text-brand-muted">圖款編號</span>
                  <span className="font-mono font-medium text-brand-accent">{selectedDesign?.id || '未選'}</span>
                </div>
                <div className="flex justify-between border-b border-brand-bg pb-1">
                  <span className="text-brand-muted">圖款名稱</span>
                  <span className="font-medium">{selectedDesign?.title || '未選'}</span>
                </div>
                <div className="flex justify-between border-b border-brand-bg pb-1">
                  <span className="text-brand-muted">殼體種類（登記需註明顏色）</span>
                  <span className="font-medium text-brand-gold">{selectedCaseType}</span>
                </div>
                <div className="flex justify-between pt-1 font-semibold text-sm">
                  <span>估算總價</span>
                  <span className="text-brand-accent">{totalPrice}</span>
                </div>
              </div>

              {/* Quick Copy Spec Button */}
              <button
                onClick={() => copyToClipboard(orderSummaryText, 'order')}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium bg-brand-border hover:bg-brand-muted/10 transition-colors text-brand-text"
              >
                {copiedText === 'order' ? (
                  <React.Fragment>
                    <Check className="h-3.5 w-3.5 text-brand-accent" />
                    <span>規格已複製！</span>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <Copy className="h-3.5 w-3.5" />
                    <span>一鍵複製規格資訊</span>
                  </React.Fragment>
                )}
              </button>
            </div>

            {/* How to Order Steps */}
            <div className="mb-6 text-xs text-brand-text space-y-4">
              <h4 className="font-serif font-semibold text-sm text-brand-text border-l-2 border-brand-accent pl-2">
                簡易下單流程
              </h4>
              {isTutuBoom ? (
                <div className="p-4 bg-brand-card rounded-xl border border-brand-border space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-brand-accent text-white text-[10px] font-mono font-bold animate-pulse">
                      ✦
                    </span>
                    <span className="font-semibold text-brand-text text-[13px]">私訊萬有狀態下單 (TutuBoom 大陸段包郵)</span>
                  </div>
                  <p className="text-brand-muted text-[11px] leading-relaxed">
                    <b>TutuBoom 系列價格已含大陸段運費（免集運）</b>！請點擊上方「一鍵複製規格資訊」並截圖本預覽畫面，直接私訊萬有狀態，即可輕鬆完成商品款項支付與寄送登記。
                  </p>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between gap-1.5 bg-brand-bg p-2 rounded-lg border border-brand-border">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-brand-muted">WeChat：</span>
                        <span className="font-mono text-xs select-all font-semibold text-brand-accent">mussessein-7</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard('mussessein-7', 'wechat')}
                        className="text-brand-accent hover:text-brand-text text-[10px] flex items-center gap-1 font-semibold border border-brand-accent/20 px-2 py-0.5 rounded bg-white/50 transition-all hover:scale-[1.02]"
                      >
                        {copiedText === 'wechat' ? '已複製' : '複製WeChat'}
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-1.5 bg-brand-bg p-2 rounded-lg border border-brand-border">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-brand-muted">Line ：</span>
                        <span className="font-mono text-xs select-all font-semibold text-brand-accent">esmusssein-</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard('esmusssein-', 'line')}
                        className="text-brand-accent hover:text-brand-text text-[10px] flex items-center gap-1 font-semibold border border-brand-accent/20 px-2 py-0.5 rounded bg-white/50 transition-all hover:scale-[1.02]"
                      >
                        {copiedText === 'line' ? '已複製' : '「或」複製Line'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="p-3 bg-brand-card rounded-lg border border-brand-border">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-brand-accent text-white text-[10px] font-mono">
                        1
                      </span>
                      <span className="font-medium">私訊萬有狀態</span>
                    </div>
                    <p className="text-brand-muted text-[11px] leading-relaxed">
                      提供複製的規格與截圖，完成商品款項支付。
                    </p>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center justify-between gap-1.5 bg-brand-bg p-1.5 rounded border border-brand-border">
                        <span className="font-mono text-[10px] select-all font-semibold">mussessein-7</span>
                        <button
                          onClick={() => copyToClipboard('mussessein-7', 'wechat')}
                          className="text-brand-accent hover:text-brand-text text-[10px] flex items-center gap-1"
                        >
                          {copiedText === 'wechat' ? '已複製' : '複製WeChat'}
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-1.5 bg-brand-bg p-1.5 rounded border border-brand-border">
                        <span className="font-mono text-[10px] select-all font-semibold">esmusssein-</span>
                        <button
                          onClick={() => copyToClipboard('esmusssein-', 'line')}
                          className="text-brand-accent hover:text-brand-text text-[10px] flex items-center gap-1"
                        >
                          {copiedText === 'line' ? '已複製' : '「或」複製Line'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-brand-card rounded-lg border border-brand-border">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-brand-gold text-white text-[10px] font-mono">
                        2
                      </span>
                      <span className="font-medium">私訊Jimmibobo</span>
                    </div>
                    <p className="text-brand-muted text-[11px] leading-relaxed">
                      私訊 Jimmibobo 支付運費，委託寄送，也可合併其他委託。
                    </p>
                    <div className="mt-2.5 flex items-center justify-between gap-1.5 bg-brand-bg p-1.5 rounded border border-brand-border">
                      <span className="font-mono text-[10px] select-all font-semibold">jimmibobotw</span>
                      <button
                        onClick={() => copyToClipboard('jimmibobotw', 'wechat2')}
                        className="text-brand-gold hover:text-brand-text text-[10px] flex items-center gap-1"
                      >
                        {copiedText === 'wechat2' ? '已複製' : '複製WeChat'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-brand-border">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl py-3 text-xs font-semibold bg-brand-card border border-brand-border hover:bg-brand-bg transition-colors"
              >
                返回瀏覽區
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
