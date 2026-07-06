export interface ModelImg {
  name: string;
  imgs: string[];
}

export interface DesignLink {
  platform: string;
  url: string;
}

export interface Design {
  id: string;
  title: string;
  badge: string;
  link: string | DesignLink[] | Record<string, string>;
  models: ModelImg[];
  layer?: string;
  desc?: string;
}

export interface Subseries {
  id: string;
  name: string;
  nameEm?: string;
  desc?: string;
  designs: Design[];
}

export interface Series {
  id: string;
  name: string;
  nameEm?: string;
  desc?: string;
  subseries?: Subseries[];
  designs?: Design[];
}

export interface CaseType {
  name: string;
  nameEm: string;
  img: string;
  desc: string;
  iconBg: string;
  iconColor: string;
  icon: string;
  salePrice?: string;
  saleDeadline?: string;
  models: { name: string; price: string }[];
}

export interface NoteItem {
  label: string;
  val: string;
}

export const CASE_TYPES: CaseType[] = [
  {
    name: 'AirX',
    nameEm: '訂製款極致氣墊緩衝手機殼<br/><span style="font-size: 0.85em; color: #666;">本殼體提供15-17機型及SamsungS26、S26u</span>',
    img: 'https://pub-ee3a4255fbd840f589cf8057238045a5.r2.dev/type/airx.webp',
    desc: '雙側減壓氣室設計，手感曲線雕塑，長時間手持亦常保舒適<br/><span style="font-size: 0.85em; color: #666;">本款默認磁吸</span>',
    iconBg: '#e8f3f8',
    iconColor: '#4a9ab8',
    icon: 'Airplay',
    models: [{ name: '訂製款Airx', price: '398元' }]
  },
  {
    name: 'Mod NX',
    nameEm: '訂製款邊框背蓋兩用防摔手機殼<br/><span style="font-size: 0.85em; color: #666;">本殼體僅提供iPhone全機型</span>',
    img: 'https://pub-ee3a4255fbd840f589cf8057238045a5.r2.dev/type/modnx.webp',
    desc: '經典防摔分體殼',
    iconBg: '#f0ede8',
    iconColor: '#8a7868',
    icon: 'Layers',
    models: [
      { name: '訂製款磁吸背板+邊框', price: '245元' },
      { name: '訂製款非磁吸背板+邊框', price: '200元' },
      { name: '訂製款磁吸背板', price: '190元' },
      { name: '訂製款非磁吸背板', price: '95元' }
    ]
  },
  {
    name: 'ClearX',
    nameEm: '訂製款裸機感抗黃防摔透明殼<br/><span style="font-size: 0.85em; color: #666;">本殼體提供iPhone17pro、17promax機型</span>',
    img: 'https://pub-ee3a4255fbd840f589cf8057238045a5.r2.dev/type/clearx.webp',
    desc: '1mm 超薄側邊，還原 iPhone 裸機手感，四角防護配置獨家柔韌吸震配方，有效吸收外部衝擊力，終結黃化，終身保固',
    iconBg: '#f5f0e8',
    iconColor: '#9a7850',
    icon: 'Smartphone',
    models: [
      { name: '訂製款磁吸clearX', price: '350元' },
      { name: '訂製款非磁吸clearX', price: '315元' }
    ]
  },
  {
    name: 'SolidX',
    nameEm: '訂製款經典防摔手機殼<br/><span style="font-size: 0.85em; color: #666;">本殼體提供Samsung及iPhone15-17機型，其中透色款為17系列專屬</span>',
    img: 'https://pub-ee3a4255fbd840f589cf8057238045a5.r2.dev/type/solidx.webp',
    desc: '強化四角與內部設計，全面升級防摔力道',
    iconBg: '#fdf0ec',
    iconColor: '#b04030',
    icon: 'Shield',
    models: [
      { name: '訂製款磁吸solidx', price: '300元' },
      { name: '訂製款非磁吸solidx', price: '255元' }
    ]
  },
  {
    name: 'Clear',
    nameEm: '訂製款抗黃化透明防摔手機殼<br/><span style="font-size: 0.85em; color: #666;">本殼體提供iPhone及Samsung機型</span>',
    img: 'https://pub-ee3a4255fbd840f589cf8057238045a5.r2.dev/type/clear.webp',
    desc: '終結黃化，終身保固',
    iconBg: '#f5f0e8',
    iconColor: '#9a7850',
    icon: 'Sparkles',
    models: [
      { name: '訂製款磁吸clear', price: '315元' },
      { name: '訂製款非磁吸clear', price: '245元' }
    ]
  },
  {
    name: 'SolidSuit',
    nameEm: '訂製款經典防摔手機殼（SolidX為其更新版）<br/><span style="font-size: 0.85em; color: #666;">本殼體僅提供iphone14及以下機型</span>',
    img: 'https://pub-ee3a4255fbd840f589cf8057238045a5.r2.dev/type/solidsuit.webp',
    desc: '超越軍規防摔標準，更耐摔更耐用',
    iconBg: '#f5f0e8',
    iconColor: '#9a7850',
    icon: 'Cpu',
    models: [
      { name: '訂製款磁吸solidsuit', price: '290元' },
      { name: '訂製款非磁吸solidsuit', price: '190元' }
    ]
  },
  {
    name: '微醺斑比不重複',
    nameEm: '默認透明背景版本，可選添加背景：鵝黃 淡綠 淡藍 淺灰 淡紫 淡粉',
    img: 'https://pub-ee3a4255fbd840f589cf8057238045a5.r2.dev/type/weixun.webp',
    desc: '底下文字可以客製化，總價+10rmb 僅限英文、數字 和符號():;,.?!',
    iconBg: '#f5f0e8',
    iconColor: '#9a7850',
    icon: 'Heart',
    models: [
      { name: '微醺斑比不重複排版airx', price: '428元' },
      { name: '微醺斑比不重複排版磁吸背板+邊框', price: '290元' },
      { name: '微醺斑比不重複排版非磁吸背板+邊框', price: '230元' },
      { name: '微醺斑比不重複排版磁吸背板', price: '225元' },
      { name: '微醺斑比不重複排版非磁吸背板', price: '140元' },
      { name: '微醺斑比不重複排版磁吸clearx', price: '385元' },
      { name: '微醺斑比不重複排版非磁吸clearx', price: '350元' },
      { name: '微醺斑比不重複排版磁吸clear', price: '340元' },
      { name: '微醺斑比不重複排版非磁吸clear', price: '280元' },
      { name: '微醺斑比不重複排版磁吸solidx', price: '335元' },
      { name: '微醺斑比不重複排版非磁吸solidx', price: '295元' },
      { name: '微醺斑比不重複排版磁吸solidsuit', price: '315元' },
      { name: '微醺斑比不重複排版非磁吸solidsuit', price: '235元' }
    ]
  },
  {
    name: '微醺斑比小動物連連看/花花',
    nameEm: '默認透明背景版本，可選添加背景：鵝黃 淡綠 淡藍 淺灰 淡紫 淡粉',
    img: 'https://pub-ee3a4255fbd840f589cf8057238045a5.r2.dev/type/weixunani.webp',
    desc: '底下文字可以客製化，總價+10rmb 僅限英文、數字 和符號():;,.?!',
    iconBg: '#f5f0e8',
    iconColor: '#9a7850',
    icon: 'PawPrint',
    models: [
      { name: '微醺斑比小動物連連看&花花排版airx', price: '403元' },
      { name: '微醺斑比小動物連連看&花花排版磁吸背板+邊框', price: '255元' },
      { name: '微醺斑比小動物連連看&花花排版非磁吸背板+邊框', price: '205元' },
      { name: '微醺斑比小動物連連看&花花排版磁吸背板', price: '200元' },
      { name: '微醺斑比小動物連連看&花花排版非磁吸背板', price: '105元' },
      { name: '微醺斑比小動物連連看&花花排版磁吸clearx', price: '365元' },
      { name: '微醺斑比小動物連連看&花花排版非磁吸clearx', price: '330元' },
      { name: '微醺斑比小動物連連看&花花排版磁吸clear', price: '325元' },
      { name: '微醺斑比小動物連連看&花花排版非磁吸clear', price: '255元' },
      { name: '微醺斑比小動物連連看&花花排版磁吸solidx', price: '310元' },
      { name: '微醺斑比小動物連連看&花花排版非磁吸solidx', price: '265元' },
      { name: '微醺斑比小動物連連看&花花排版磁吸solidsuit', price: '295元' },
      { name: '微醺斑比小動物連連看&花花排版非磁吸solidsuit', price: '195元' }
    ]
  }
];

export const NOTES: NoteItem[] = [
  { label: '下單方式', val: '可截圖傳訊息告知：圖款編號 ＋ 機型 ＋ 殼體 ＋ 殼體顏色或者直接填寫jimmibobo專屬表格<br>如若需要訂製款水壺、ipad殼等產品請私訊' },
  { label: '製作時間', val: '所有商品均非現貨，官網下單，下單後約 3-5 個工作日出貨，遇到特殊節日或公休可能會更久，敬請見諒🙇' },
  { label: '添加官網貼紙', val: '如需在定制款基礎上添加犀牛盾官網的貼紙（需要提供貼紙的準確名稱，描述添加的具體位置），按照「貼紙價格（TWD）/4」計算' },
  { label: '注意事項', val: '預覽圖僅供參考，實際色彩請您以實物為準<br><strong>❕本頁面價格及運費僅針對中國大陸，寄送至其他國家or地區煩請詳詢萬有狀態</strong>' },
  { label: '聯繫方式', val: '萬有狀態🫧：<strong>mussessein-7</strong>  <br>萬有狀態line：<strong>esmusssein-</strong> <br>Jimmibobo🫧：<strong>jimmibobotw</strong>' }
];

export const TUTUBOOM_PRICES = [
  { name: 'TutuBoom訂製款單層背板+邊框', price: '295.8元' },
  { name: 'TutuBoom訂製款雙層背板+邊框', price: '312.8元' }
];

export const TUTUBOOM_CASE_TYPES: CaseType[] = [
  {
    name: 'TutuBoom',
    nameEm: '分離殼/一體殼',
    img: 'https://pub-ee3a4255fbd840f589cf8057238045a5.r2.dev/type/tutuboom.webp',
    desc: '<b>【分離殼】</b>：雙層印刷具有半透明效果</b>分離殼提供17pro/17pro max型號<br>分離殼邊框顏色含有：🩷迷你粉 🖤暗夜嘿 🤎朱古力 🤍磨砂透<br><b>【一體殼 (磨砂殼)】</b>：細膩磨砂質感，提供16pro/16pro max/air/17pro/17pro max型號<br>實物和預覽圖可能有色彩差異，預覽圖僅供參考 <br>⭐️tutuboom價格含大陸段運費，具體可直接詢問萬有狀態<br>tutuboom與rhinoshield不是同一品牌🙇',
    iconBg: '#f0ede8',
    iconColor: '#8a7868',
    icon: 'Layers',
    models: [
      { name: 'TutuBoom訂製款單層印刷背板', price: '168.3元' },
      { name: 'TutuBoom訂製款單層印刷背板+邊框', price: '295.8元' },
      { name: 'TutuBoom訂製款雙層印刷背板', price: '185.3元' },
      { name: 'TutuBoom訂製款雙層印刷背板+邊框', price: '312.8元' } ,
      { name: 'TutuBoom訂製款白透or全透磨砂殼', price: '142.8元' },
      { name: 'TutuBoom訂製款白透or全透磨砂殼(相機按鈕版)', price: '159.8元' }
    ]
  }
];
