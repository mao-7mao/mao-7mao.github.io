#!/usr/bin/env node
/**
 * mkdirs.js — 自動從 index.html 掃描所有 img 路徑，建立資料夾
 * 用法：node mkdirs.js
 * 放在與 index.html 同層的專案根目錄即可
 */

const fs   = require('fs');
const path = require('path');

// ── 設定 ────────────────────────────────────────────
const HTML_FILE   = 'index.html';   // 你的 HTML 檔案路徑
const IMAGES_ROOT = 'images';       // 圖片根目錄
// ────────────────────────────────────────────────────

if (!fs.existsSync(HTML_FILE)) {
  console.error(`❌ 找不到 ${HTML_FILE}，請確認腳本與 index.html 在同一層目錄`);
  process.exit(1);
}

const html = fs.readFileSync(HTML_FILE, 'utf-8');

// 收集所有有效的 img 路徑資料夾
const folders = new Set();

// 匹配所有 img:'...' 或 img:"..."
const regex = /img\s*:\s*['"]([^'"]+)['"]/g;
let match;

while ((match = regex.exec(html)) !== null) {
  const imgPath = match[1].trim();

  // 跳過空路徑或只有 'images/' 的不完整路徑
  if (!imgPath || imgPath === 'images/' || imgPath === 'images') continue;

  // 取得資料夾（去掉最後的檔名）
 // 如果路徑最後有 /，代表它本身就是資料夾
const folder = imgPath.endsWith('/')
  ? imgPath.replace(/\/$/, '')
  : path.dirname(imgPath);

  // 只處理 images/ 開頭的路徑
  if (folder.startsWith('images') && folder !== 'images') {
    folders.add(folder);
  }
}

// 也從系列資料結構推導出「應該有但 img 還空著的」資料夾
// 掃描 id:'sX-Y' 與 id:'AXX'/'BXX'... 組合出路徑
const seriesMatches  = [...html.matchAll(/id:'(s\d+)'/g)].map(m => m[1]);
const subMatches     = [...html.matchAll(/id:'(s\d+-\d+)'/g)].map(m => m[1]);
const designMatches  = [...html.matchAll(/id:'([A-Z]\d+)'/g)].map(m => m[1]);

// 建立 series → subseries 對應表
const seriesMap = {};
subMatches.forEach(sub => {
  const parent = sub.replace(/-\d+$/, '');  // s1-1 → s1
  if (!seriesMap[parent]) seriesMap[parent] = [];
  if (!seriesMap[parent].includes(sub)) seriesMap[parent].push(sub);
});

// 建立 subseries → designs 對應表（從 HTML 結構推斷）
// 利用更精確的正則：抓取同一個 subseries block 裡的 designs
const subDesignMap = {};
const subBlockRegex = /id:'(s\d+-\d+)'[\s\S]*?designs:\s*\[([\s\S]*?)(?=\},\s*\{[\s\S]*?id:'s\d|]\s*\}[\s\S]*?subseries|\]\s*\}[\s\S]*?\}[\s\S]*?(?:subseries|\];))/g;

let subBlock;
while ((subBlock = subBlockRegex.exec(html)) !== null) {
  const subId   = subBlock[1];
  const content = subBlock[2];
  const ids     = [...content.matchAll(/id:'([A-Z]\d+)'/g)].map(m => m[1]);
  subDesignMap[subId] = [...new Set(ids)];
}

// 若 subDesignMap 抓取結果為空，改用簡單對應（所有 designs 配第一個 subseries）
if (Object.keys(subDesignMap).length === 0) {
  subMatches.forEach((sub, i) => {
    subDesignMap[sub] = designMatches;
  });
}

// 把推導出的路徑也加進去
Object.entries(subDesignMap).forEach(([sub, designs]) => {
  const parent = sub.replace(/-\d+$/, '');
  designs.forEach(d => {
    const folder = `${IMAGES_ROOT}/${parent}/${sub}/${d}`;
    folders.add(folder);
  });
});

if (folders.size === 0) {
  console.log('⚠️  沒有找到任何圖片路徑，請確認 HTML 格式正確');
  process.exit(0);
}

// ── 建立資料夾 ───────────────────────────────────────
console.log(`\n📁 共找到 ${folders.size} 個資料夾路徑\n`);

let created = 0;
let existed  = 0;

[...folders].sort().forEach(folder => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
    console.log(`  ✅ 建立  ${folder}`);
    created++;
  } else {
    console.log(`  ⏭️  已存在 ${folder}`);
    existed++;
  }
});

console.log(`\n完成！建立 ${created} 個新資料夾，${existed} 個已存在。`);

// ── 輸出目前游標所在的資料夾（給 Paste Image 使用）──
// 可搭配 VS Code task 讀取這個輸出來動態設定 pasteImage.path
console.log(`\n📋 Paste Image 建議設定路徑：`);
[...folders].sort().forEach(f => console.log(`   ${path.resolve(f)}`));
