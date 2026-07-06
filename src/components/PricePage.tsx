import React, { useState } from 'react';
import { CASE_TYPES, TUTUBOOM_CASE_TYPES, NOTES, CaseType } from '../data/productsData';
import { ShieldCheck, Truck, Scale, AlertCircle, Copy, Check, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export default function PricePage() {
  const [copiedText, setCopiedText] = useState<'wechat1' | 'wechat2' | 'line1' | null>(null);

  const copyContact = (text: string, type: 'wechat1' | 'wechat2' | 'line1') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const ALL_DISPLAY_TYPES = [...CASE_TYPES, ...TUTUBOOM_CASE_TYPES];

  return (
    <section id="price-page" className="py-20 px-6 max-w-7xl mx-auto page-enter relative z-10">
      {/* Eye Brow */}
      <div className="text-center mb-12">
        <span className="font-mono text-xs tracking-[0.2em] text-black/50 uppercase block mb-2 font-semibold">
          Pricing & Logistics
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-brand-text">
          殼體規格與 <em>物流說明書</em>
        </h2>
        <p className="text-xs text-brand-muted mt-2 max-w-lg mx-auto leading-relaxed">
          所有設計皆由官方殼體承載
        </p>
      </div>

      {/* Case Types Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {ALL_DISPLAY_TYPES.map((ct, idx) => (
          <motion.div
            key={ct.name}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
            className="group relative flex flex-col glass-card rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1"
          >
            {/* Header */}
            <div className="p-5 border-b border-black/5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-brand-text flex items-center gap-1.5">
                    {ct.name}
                  </h3>
                  <p 
                    className="text-[11px] text-brand-muted mt-1 leading-normal"
                    dangerouslySetInnerHTML={{ __html: ct.nameEm }}
                  />
                </div>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${ct.iconBg}`, color: ct.iconColor }}
                >
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Content Split: Left Info, Right Image */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
                <div className="sm:col-span-3 space-y-2">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-black/40 block font-semibold">
                    殼種詳情 / Description
                  </span>
                  <p 
                    className="text-[11px] text-brand-text/80 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: ct.desc }}
                  />
                </div>
                <div className="sm:col-span-2 flex justify-center">
                  <div className="relative w-24 h-32 rounded-xl bg-white/20 border border-dashed border-black/10 overflow-hidden p-2 flex items-center justify-center">
                    {ct.img ? (
                      <img 
                        src={ct.img} 
                        alt={ct.name} 
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-[10px] text-brand-muted font-mono">Image</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Price list */}
              <div className="mt-5 pt-4 border-t border-black/5 space-y-2">
                <span className="font-mono text-[9px] uppercase tracking-wider text-black/40 block font-semibold">
                  訂製價格 / Models & Prices
                </span>
                <div className="space-y-1.5">
                  {ct.models.map((m, mIdx) => (
                    <div key={mIdx} className="flex justify-between items-center text-xs pb-1 border-b border-black/5 last:border-0 last:pb-0">
                      <span className="text-brand-text/90 font-sans">{m.name}</span>
                      <span className="font-mono font-semibold text-black">{m.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Logistics & Shipping Guide */}
      <div className="glass-frosted rounded-2xl p-6 sm:p-8 mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Truck className="h-5 w-5 text-black" />
          <h3 className="font-serif text-xl font-semibold text-brand-text">
            商品購買與 <em>寄送物流說明 </em>
          </h3>
        </div>

        {/* Schemes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/40 rounded-xl p-5 border border-white/50 backdrop-blur-md shadow-sm">
            <span className="inline-block text-[10px] font-mono tracking-widest bg-black text-white px-2.5 py-1 rounded-full mb-3 uppercase font-semibold">
              Scheme A
            </span>
            <h4 className="font-sans font-semibold text-sm text-brand-text mb-2">僅購買萬有商品</h4>
            <ol className="list-decimal list-inside text-xs text-brand-text/80 space-y-1.5 leading-relaxed">
              <li>填寫集運委託登記表單（萬有狀態商品滿 <b>225元</b> 即可安排下單，未滿需等待湊單滿額後下單🙇）</li>
              <li>私訊萬有狀態支付商品款項</li>
              <li>私訊Jimmibobo支付運費並通知留意包裹</li>
              <li>商品寄達台灣後由jimmibobo代收並拼郵，安排安排寄往大陸</li>
            </ol>
          </div>

          <div className="bg-white/40 rounded-xl p-5 border border-white/50 backdrop-blur-md shadow-sm">
            <span className="inline-block text-[10px] font-mono tracking-widest bg-black text-white px-2.5 py-1 rounded-full mb-3 uppercase font-semibold">
              Scheme B
            </span>
            <h4 className="font-sans font-semibold text-sm text-brand-text mb-2">已有 Jimmibobo 其他商品，想合併寄送</h4>
            <ol className="list-decimal list-inside text-xs text-brand-text/80 space-y-1.5 leading-relaxed">
              <li>私訊萬有狀態並支付手機殼商品款項</li>
              <li>通知集運留意包裹，待所有委託商品集齊</li>
              <li>Jimmibobo 收到萬有商品及其他委託商品</li>
              <li>合併打包後寄出</li>
            </ol>
          </div>
        </div>

        {/* Methods */}
        <div className="mb-8">
          <h4 className="font-serif text-sm font-semibold text-brand-text mb-4 text-center">
            ✦ 四種彈性寄送方案 ✦
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white/60 rounded-xl border border-black shadow-sm relative">
              <span className="absolute top-3 right-3 text-[9px] font-mono font-semibold bg-black text-white px-1.5 py-0.5 rounded">
                推薦
              </span>
              <h5 className="font-sans font-semibold text-xs text-brand-text mb-1.5">拼郵 (默認)</h5>
              <p className="text-[11px] text-brand-muted mb-2">代收、集運、大陸段轉寄</p>
              <div className="font-mono text-xs font-semibold text-black mb-2">約 ¥25 元起 / <b>300 g</b> <br />（如果🍑一元拍需要加¥5 元）</div>
              <p className="text-[11px] text-brand-text/70 leading-normal">可與 Jimmibobo （僅ZFB收款）其他委託商品合包寄送，合包寄送時萬有狀態商品包裹需控制在300g以內，總重量不得超過1kg（指加上jimmibobo處所購之產品）。 <br />🙇‍♀️如若超過只能使用順豐寄送。</p>
            </div>

            <div className="p-4 bg-white/30 rounded-xl border border-white/50 backdrop-blur-md shadow-sm">
              <h5 className="font-sans font-semibold text-xs text-brand-text mb-1.5">Jimmibobo 順豐直郵優惠版</h5>
              <p className="text-[11px] text-brand-muted mb-2">台灣 → 大陸・jimmibobo專屬福利方案</p>
              <div className="font-mono text-xs font-semibold text-black mb-2">¥55 元 / 1kg</div>
              <p className="text-[11px] text-brand-text/70 leading-normal"><b>必須</b>與 Jimmibobo 其他委託商品合包。萬有狀態商品包裹需控制在300g以內。</p>
            </div>

            <div className="p-4 bg-white/30 rounded-xl border border-white/50 backdrop-blur-md shadow-sm">
              <h5 className="font-sans font-semibold text-xs text-brand-text mb-1.5">萬有順豐直郵</h5>
              <p className="text-[11px] text-brand-muted mb-2">台灣 → 大陸・無需拼郵或合包</p>
              <div className="font-mono text-xs font-semibold text-black mb-2">運費到付 (約 ¥80)</div>
              <p className="text-[11px] text-brand-text/70 leading-normal">具體價格依物流報價為準，可直接聯繫萬有安排寄出。</p>
            </div>

            <div className="p-4 bg-white/30 rounded-xl border border-white/50 backdrop-blur-md shadow-sm">
              <h5 className="font-sans font-semibold text-xs text-brand-text mb-1.5">犀牛盾官網直郵</h5>
              <p className="text-[11px] text-brand-muted mb-2">台灣 → 大陸/香港/澳門・訂單滿¥450 元</p>
              <div className="font-mono text-xs font-semibold text-black mb-2">官方免運費</div>
              <p className="text-[11px] text-brand-text/70 leading-normal">訂單滿 450 元 (CNY)。可能產生稅金(20%)需自理🙇，可直接聯繫萬有狀態安排。</p>
            </div>
          </div>
        </div>

        {/* Weight reference */}
        <div className="bg-white/40 rounded-xl p-5 border border-white/50 backdrop-blur-md flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex items-start gap-3">
            <Scale className="h-5 w-5 text-brand-gold shrink-0 mt-0.5" />
            <div>
              <h5 className="font-sans font-semibold text-xs text-brand-text mb-1">
                Jimmibobo 委託寄送重量規則
              </h5>
              <p className="text-[11px] text-brand-muted leading-relaxed">
                單份包裹建議不超過 <b>300g</b> (約 2 個手機殼)，<b>每超過 300g</b> 需補運費 <b>¥20 元</b>。如若包裹總重量<b>大於1kg</b>，則無法使用拼郵只能使用順豐寄送🙇。
                <br />
                <b>重量參考：</b>單背板含原包裝約 <b>50g</b>；手機殼含原包裝約 <b>125g</b>。
                <br />
                偏遠地區若產生額外費用，Jimmibobo 會提前告知，同時需補運費時，Jimmibobo 會私訊另行通知，請留意訊息。
                <br />
                以上內容如有更新會再另行通知，謝謝每位各位的耐心閱讀與支持💕
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes & Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 glass-frosted rounded-2xl p-6 sm:p-8">
        <div>
          <h4 className="font-serif font-semibold text-sm text-brand-text border-l-2 border-black pl-2 mb-4">
            備註與注意事項 / Notice
          </h4>
          <ul className="space-y-3.5 text-xs text-brand-text/80 leading-relaxed">
            {NOTES.slice(0, 4).map((note, i) => (
              <li key={i}>
                <span className="font-semibold text-brand-text block mb-0.5">{note.label}：</span>
                <span dangerouslySetInnerHTML={{ __html: note.val }} />
              </li>
            ))}
          </ul>
        </div>

<div className="flex flex-col justify-between">
  <div>
    <h4 className="font-serif font-semibold text-sm text-brand-text border-l-2 border-black pl-2 mb-4">
      聯繫方式 / Contacts
    </h4>
    <div className="space-y-3.5">
      {/* 萬有狀態 WeChat */}
      <div className="p-4 bg-white/40 rounded-xl border border-white/50 backdrop-blur-md flex items-center justify-between shadow-sm">
        <div>
          <span className="text-[10px] text-brand-muted font-mono uppercase tracking-wider block">萬有狀態 WeChat</span>
          <span className="text-sm font-semibold font-mono text-brand-text">mussessein-7</span>
        </div>
        <button
          onClick={() => copyContact('mussessein-7', 'wechat1')}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-black text-white hover:opacity-80 transition-opacity flex items-center gap-1 shadow-sm"
        >
          {copiedText === 'wechat1' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          <span>{copiedText === 'wechat1' ? '已複製' : '複製'}</span>
        </button>
      </div>

      {/* 新增的 萬有狀態 Line */}
      <div className="p-4 bg-white/40 rounded-xl border border-white/50 backdrop-blur-md flex items-center justify-between shadow-sm">
        <div>
          <span className="text-[10px] text-brand-muted font-mono uppercase tracking-wider block">萬有狀態 Line</span>
          <span className="text-sm font-semibold font-mono text-brand-text">esmusssein-</span>
        </div>
        <button
          onClick={() => copyContact('esmusssein-', 'line1')}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-black text-white hover:opacity-80 transition-opacity flex items-center gap-1 shadow-sm"
        >
          {copiedText === 'line1' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          <span>{copiedText === 'line1' ? '已複製' : '複製'}</span>
        </button>
      </div>

      {/* Jimmibobo WeChat */}
      <div className="p-4 bg-white/40 rounded-xl border border-white/50 backdrop-blur-md flex items-center justify-between shadow-sm">
        <div>
          <span className="text-[10px] text-brand-muted font-mono uppercase tracking-wider block">Jimmibobo WeChat</span>
          <span className="text-sm font-semibold font-mono text-brand-text">jimmibobotw</span>
        </div>
        <button
          onClick={() => copyContact('jimmibobotw', 'wechat2')}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-black text-white hover:opacity-80 transition-opacity flex items-center gap-1 shadow-sm"
        >
          {copiedText === 'wechat2' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          <span>{copiedText === 'wechat2' ? '已複製' : '複製'}</span>
        </button>
      </div>
    </div>
  </div>

          <div className="mt-6 p-4 rounded-xl border border-black/10 bg-black/5 flex items-start gap-2.5">
            <AlertCircle className="h-4.5 w-4.5 text-black shrink-0 mt-0.5" />
            <p className="text-[11px] text-black/70 leading-normal font-medium">
              本頁面之運費與拼郵等細則僅針對運往大陸段，其他地區與國家之購買規則請您聯繫萬有狀態了解詳情 🗺️。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
