import React, { useState, useEffect, useRef } from 'react';
import { CASE_TYPES, CaseType, Design } from '../data/productsData';
import { PRODUCTS_DATA } from '../data/products';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ShoppingBag, Layers, Check, RefreshCw, Upload, Scissors, Move, RotateCw, Trash2, Sliders, CheckSquare, Sparkles, ExternalLink, Share2, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ShareCardModal from './ShareCardModal';
import { ShareQueueItem } from '../types';

interface ProductViewerProps {
  selectedDesign: Design;
  onOpenOrderModal: (
    caseType: string,
    model: string,
    bg: string,
    text: string,
    price: string
  ) => void;
  preferredCaseType?: string;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  shareList: ShareQueueItem[];
  onAddToShareList: (item: Omit<ShareQueueItem, 'id'>) => void;
  onRemoveFromShareList: (id: string) => void;
  isShareModalOpen: boolean;
  setIsShareModalOpen: (open: boolean) => void;
}

const CASE_TYPE_DISPLAY_NAMES: Record<string, { label: string; desc: string }> = {
  'SolidX': { label: 'SolidX 經典防摔', desc: '強化四角，防摔升級' },
  'ModNX': { label: 'Mod NX 邊框背蓋', desc: '邊框背蓋，經典防摔' },
  'AirX': { label: 'AirX 極致氣墊', desc: '雙側氣室，極致防摔' },
  'ClearX': { label: 'ClearX 抗黃透明', desc: '裸機感抗黃防摔' },
  'Clear': { label: 'Clear 抗黃防摔', desc: '終結黃化，終身保固' },
  'SolidSuit': { label: 'SolidSuit 經典防摔', desc: '超越軍規，耐用防摔' },
  '預覽': { label: '預覽圖款', desc: '設計預覽效果' },
  '實物': { label: '實物圖款', desc: '實品實拍' },
};

export default function ProductViewer({
  selectedDesign,
  onOpenOrderModal,
  preferredCaseType,
  favorites,
  onToggleFavorite,
  shareList,
  onAddToShareList,
  onRemoveFromShareList,
  isShareModalOpen,
  setIsShareModalOpen,
}: ProductViewerProps) {
  const lang = 'zh-TW' as string;
  const getCaseTypeDisplayName = (name: string) => {
    const zhNames: Record<string, { label: string; desc: string }> = {
      'SolidX': { label: 'SolidX 經典防摔', desc: '強化四角，防摔升級' },
      'ModNX': { label: 'Mod NX 邊框背蓋', desc: '邊框背蓋，經典防摔' },
      'AirX': { label: 'AirX 極致氣墊', desc: '雙側氣室，極致防摔' },
      'ClearX': { label: 'ClearX 抗黃透明', desc: '裸機感抗黃防摔' },
      'Clear': { label: 'Clear 抗黃防摔', desc: '終結黃化，終身保固' },
      'SolidSuit': { label: 'SolidSuit 經典防摔', desc: '超越軍規，耐用防摔' },
      '預覽': { label: '預覽圖款', desc: '設計預覽效果' },
      '實物': { label: '實物圖款', desc: '實品實拍' },
    };
    return zhNames[name] || { label: name, desc: '對應客製規格' };
  };
  // Config state
  const [activeModelIdx, setActiveModelIdx] = useState(0);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [selectedCaseType, setSelectedCaseType] = useState<string>('');
  const [isZoomed, setIsZoomed] = useState(false);
  const [tutuboomType, settutuboomType] = useState<'single' | 'double' | 'matte'>('double');

  const isFavorite = favorites.includes(selectedDesign.id);

  useEffect(() => {
    if (selectedDesign.id.startsWith('tb-') || selectedDesign.layer) {
      const initialLayer = selectedDesign.layer || '雙層';
      if (initialLayer === '單層') {
        settutuboomType('single');
      } else if (initialLayer === '雙層') {
        settutuboomType('double');
      } else {
        settutuboomType('matte');
      }
    }
  }, [selectedDesign]);

  // Case Mockup fine tuning states (Remove margins/borders adaptively)
  const [showTweakControls, setShowTweakControls] = useState<boolean>(false);
  const [caseImgScale, setCaseImgScale] = useState<number>(1.15); // Default to 1.15x for auto-removing margins
  const [caseImgX, setCaseImgX] = useState<number>(0);
  const [caseImgY, setCaseImgY] = useState<number>(0);

  // Stand/Grip custom states
  const [standImage, setStandImage] = useState<string | null>(null);
  const [standCutout, setStandCutout] = useState<string | null>(null);
  const [processMode, setProcessMode] = useState<'auto' | 'crop' | 'lasso'>('crop');
  const [tolerance, setTolerance] = useState<number>(20);
  
  // Crop parameters
  const [cropCx, setCropCx] = useState<number>(50);
  const [cropCy, setCropCy] = useState<number>(50);
  const [cropRadius, setCropRadius] = useState<number>(30);

  // Lasso selection parameters
  const [lassoPoints, setLassoPoints] = useState<{ x: number; y: number }[]>([]);
  const [isDrawingLasso, setIsDrawingLasso] = useState(false);
  const lassoCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live positioning
  const [standX, setStandX] = useState<number>(50);
  const [standY, setStandY] = useState<number>(45); // Aligned to phone magnetic ring
  const [standSize, setStandSize] = useState<number>(26); // Match magnetic ring size roughly
  const [standRotate, setStandRotate] = useState<number>(0);
  const [isDraggingStand, setIsDraggingStand] = useState(false);
  const [isResizingStand, setIsResizingStand] = useState(false);
  const resizeStartDistRef = useRef<number>(1);
  const resizeStartSizeRef = useRef<number>(26);

  const originalImageRef = useRef<HTMLImageElement | null>(null);

  const istutuboom = selectedDesign.id.startsWith('tb-') || !!selectedDesign.layer;
  const isS8OrS9 = 
    (selectedDesign as any).seriesId === 's8' || 
    (selectedDesign as any).seriesId === 's9' ||
    selectedDesign.id.startsWith('8-') || 
    selectedDesign.id.startsWith('9-');

  const getVirtualModels = (): { name: string; imgs: string[] }[] => {
    if (!istutuboom) {
      return selectedDesign.models || [];
    }

    // If models are already explicitly defined as separate case types (e.g. including '分離' or '一體') in the JSON,
    // directly use and respect the models array to achieve a clean one-to-one correspondence.
    const hasExplicitTutuModels = selectedDesign.models?.some(
      m => m.name.includes('分離') || m.name.includes('一體')
    );
    if (hasExplicitTutuModels) {
      return selectedDesign.models || [];
    }

    const layer = selectedDesign.layer || '雙層';
    const jsonPreviewModel = selectedDesign.models?.find(m => m.name === '預覽') || selectedDesign.models?.[0];
    const jsonRealModel = selectedDesign.models?.find(m => m.name === '實物') || selectedDesign.models?.[1];

    const previewImgs = jsonPreviewModel?.imgs || [];
    const realImgs = jsonRealModel?.imgs || [];

    if (layer === '單層') {
      return [
        { name: '分離殼預覽', imgs: previewImgs },
        { name: '一體殼預覽', imgs: previewImgs },
        ...(realImgs.length > 0 ? [{ name: '實物', imgs: realImgs }] : [{ name: '實物', imgs: previewImgs }])
      ];
    } else {
      return [
        { name: '分離殼預覽', imgs: previewImgs },
        ...(realImgs.length > 0 ? [{ name: '實物', imgs: realImgs }] : [{ name: '實物', imgs: previewImgs }])
      ];
    }
  };

  const virtualModels = getVirtualModels();

  // Sync selection when design shifts or preferredCaseType changes
  useEffect(() => {
    // Always reset image index to 0 when design changes to prevent out-of-bounds/stuck image previews
    setActiveImgIdx(0);

    if (virtualModels.length > 0) {
      const targetType = preferredCaseType && preferredCaseType !== 'all' ? preferredCaseType : '';
      let matchIdx = -1;
      if (targetType) {
        const normalizedTarget = targetType.toLowerCase();
        if (normalizedTarget.includes('磨砂') || normalizedTarget.includes('一體')) {
          matchIdx = virtualModels.findIndex(m => m.name.includes('一體'));
        } else if (normalizedTarget.includes('分離')) {
          matchIdx = virtualModels.findIndex(m => m.name.includes('分離'));
        } else {
          matchIdx = virtualModels.findIndex(
            (m) => m.name.toLowerCase() === targetType.toLowerCase()
          );
        }
      }

      if (matchIdx !== -1) {
        setActiveModelIdx(matchIdx);
        setSelectedCaseType(virtualModels[matchIdx].name);
      } else {
        // Fallback to previous selectedCaseType if still valid for this design, otherwise index 0
        const prevIdx = virtualModels.findIndex(
          (m) => m.name === selectedCaseType
        );
        if (prevIdx !== -1) {
          setActiveModelIdx(prevIdx);
        } else {
          setActiveModelIdx(0);
          setSelectedCaseType(virtualModels[0].name);
        }
      }
    } else {
      setSelectedCaseType('');
    }
  }, [selectedDesign, preferredCaseType]);

  const activeModel = virtualModels[activeModelIdx] || virtualModels[0];
  const images = activeModel?.imgs || [];
  const currentImage = images[activeImgIdx] || '';

  const isCurrentInShareList = () => {
    return shareList.some(item => 
      item.design.id === selectedDesign.id && 
      item.currentImage === currentImage && 
      item.displayCaseType === getDisplayCaseType() &&
      item.standCutout === standCutout
    );
  };

  const handleAddToComparison = () => {
    if (isCurrentInShareList()) {
      return;
    }
    onAddToShareList({
      design: selectedDesign,
      currentImage,
      caseImgScale,
      caseImgX,
      caseImgY,
      standCutout,
      standX,
      standY,
      standSize,
      standRotate,
      displayCaseType: getDisplayCaseType(),
    });
  };

  const handleOpenShareModal = () => {
    if (!isCurrentInShareList()) {
      onAddToShareList({
        design: selectedDesign,
        currentImage,
        caseImgScale,
        caseImgX,
        caseImgY,
        standCutout,
        standX,
        standY,
        standSize,
        standRotate,
        displayCaseType: getDisplayCaseType(),
      });
    }
    setIsShareModalOpen(true);
  };

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

  const parseDetailedPrice = (modelsList: { name: string; price: string }[]) => {
    if (modelsList.length > 0) {
      const prices = modelsList.map(m => {
        const num = parseFloat(m.price.replace(/[^\d.]/g, ''));
        return isNaN(num) ? 0 : num;
      }).filter(p => p > 0).sort((a, b) => a - b);

      if (prices.length === 1) return `${prices[0]}元`;
      if (prices.length > 1) {
        if (prices[0] === prices[prices.length - 1]) {
          return `${prices[0]}元`;
        }
        return `${prices[0]} - ${prices[prices.length - 1]}元`;
      }
    }
    return '';
  };

  // Pricing calculation
  const getPrice = () => {
    // Check if tutuboom design
    if (selectedDesign.id.startsWith('tb-') || selectedDesign.layer) {
      const layer = selectedDesign.layer || '雙層';
      if (layer === '單層') {
        if (selectedCaseType.includes('分離')) {
          return '295.8元';
        }
        if (selectedCaseType.includes('一體')) {
          return '142.8 - 159.8元';
        }
        return '142.8 - 295.8元';
      } else {
        return '312.8元';
      }
    }

    // Bambi repeat
    const isBambiRepeat = selectedDesign.id.startsWith('9-1');
    const isBambiLink = selectedDesign.id.startsWith('9-2') || selectedDesign.id.startsWith('9-3');

    if (isBambiRepeat) {
      const weixunType = CASE_TYPES.find(c => c.name.includes('微醺斑比不重複'));
      if (weixunType) {
        const matches = weixunType.models.filter(m => m.name.toLowerCase().includes(selectedCaseType.toLowerCase()));
        if (matches.length > 0) {
          return parseDetailedPrice(matches);
        }
      }
      return '295元起';
    }

    if (isBambiLink) {
      const weixunType = CASE_TYPES.find(c => c.name.includes('微醺斑比小動物'));
      if (weixunType) {
        const matches = weixunType.models.filter(m => m.name.toLowerCase().includes(selectedCaseType.toLowerCase()));
        if (matches.length > 0) {
          return parseDetailedPrice(matches);
        }
      }
      return '265元起';
    }

    const ct = CASE_TYPES.find(c => c.name.toLowerCase() === selectedCaseType.toLowerCase());
    if (ct && ct.models && ct.models.length > 0) {
      return parseDetailedPrice(ct.models);
    }

    return '190元起';
  };

  const getDisplayCaseType = () => {
    if (selectedDesign.id.startsWith('tb-') || selectedDesign.layer) {
      const layer = selectedDesign.layer || '雙層';
      if (layer === '單層') {
        if (selectedCaseType.includes('分離')) return 'tutuboom訂製款分離殼 (單層背板+邊框)';
        if (selectedCaseType.includes('一體')) return 'tutuboom訂製款磨砂一體殼';
        return 'tutuboom 訂製系列 (單層)';
      } else {
        return 'tutuboom訂製款分離殼 (雙層背板+邊框)';
      }
    }
    return selectedCaseType;
  };

  const handleNextImage = () => {
    if (images.length > 0) {
      setActiveImgIdx((prev) => (prev + 1) % images.length);
    }
  };

  const handlePrevImage = () => {
    if (images.length > 0) {
      setActiveImgIdx((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  // Stand processing algorithm
  const processAuto = (img: HTMLImageElement, thresh: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Corner pixel sampling as reference
    const refR = data[0];
    const refG = data[1];
    const refB = data[2];

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const distRef = Math.sqrt((r - refR) ** 2 + (g - refG) ** 2 + (b - refB) ** 2);
      const distWhite = Math.sqrt((r - 255) ** 2 + (g - 255) ** 2 + (b - 255) ** 2);

      if (Math.min(distRef, distWhite) < thresh * 2.5) {
        data[i + 3] = 0; // Transparent
      }
    }

    ctx.putImageData(imgData, 0, 0);
    setStandCutout(canvas.toDataURL('image/png'));
  };

  const processCrop = (img: HTMLImageElement, cx: number, cy: number, r: number) => {
    const canvas = document.createElement('canvas');
    const size = Math.min(img.width, img.height);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const realCx = img.width * (cx / 100);
    const realCy = img.height * (cy / 100);
    const realR = size * (r / 100);

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, realR, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(
      img,
      realCx - realR,
      realCy - realR,
      realR * 2,
      realR * 2,
      size / 2 - realR,
      size / 2 - realR,
      realR * 2,
      realR * 2
    );
    ctx.restore();

    setStandCutout(canvas.toDataURL('image/png'));
  };

  const generateLassoCutout = () => {
    if (!originalImageRef.current || lassoPoints.length < 3) {
      setStandCutout(standImage);
      return;
    }
    const img = originalImageRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // UI Canvas fixed design dimensions
    const uiW = 300;
    const uiH = 300;
    const scale = Math.min(uiW / img.width, uiH / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = (uiW - dw) / 2;
    const dy = (uiH - dh) / 2;

    ctx.clearRect(0, 0, img.width, img.height);
    ctx.save();
    
    // Create the path
    ctx.beginPath();
    const firstX = (lassoPoints[0].x - dx) / scale;
    const firstY = (lassoPoints[0].y - dy) / scale;
    ctx.moveTo(
      Math.max(0, Math.min(img.width, firstX)),
      Math.max(0, Math.min(img.height, firstY))
    );

    for (let i = 1; i < lassoPoints.length; i++) {
      const ptX = (lassoPoints[i].x - dx) / scale;
      const ptY = (lassoPoints[i].y - dy) / scale;
      ctx.lineTo(
        Math.max(0, Math.min(img.width, ptX)),
        Math.max(0, Math.min(img.height, ptY))
      );
    }
    ctx.closePath();
    ctx.clip();

    // Draw original image
    ctx.drawImage(img, 0, 0);
    ctx.restore();

    // Trim transparent margins
    const imgData = ctx.getImageData(0, 0, img.width, img.height);
    const data = imgData.data;
    
    let minX = img.width;
    let maxX = 0;
    let minY = img.height;
    let maxY = 0;
    let hasPixels = false;
    
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const idx = (y * img.width + x) * 4;
        if (data[idx + 3] > 15) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          hasPixels = true;
        }
      }
    }

    if (hasPixels) {
      const cropW = maxX - minX + 1;
      const cropH = maxY - minY + 1;
      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = cropW;
      cropCanvas.height = cropH;
      const cropCtx = cropCanvas.getContext('2d');
      if (cropCtx) {
        cropCtx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
        setStandCutout(cropCanvas.toDataURL('image/png'));
      }
    } else {
      setStandCutout(canvas.toDataURL('image/png'));
    }
  };

  const drawLassoCanvas = () => {
    const canvas = lassoCanvasRef.current;
    if (!canvas || !originalImageRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = originalImageRef.current;
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Calculate fit dimensions
    const scale = Math.min(W / img.width, H / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = (W - dw) / 2;
    const dy = (H - dh) / 2;

    // Draw background image slightly dimmed
    ctx.globalAlpha = 0.65;
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.globalAlpha = 1.0;

    // Draw the lasso path
    if (lassoPoints.length > 0) {
      ctx.beginPath();
      ctx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
      for (let i = 1; i < lassoPoints.length; i++) {
        ctx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
      }
      
      if (!isDrawingLasso) {
        ctx.closePath();
      }

      ctx.strokeStyle = '#D4AF37'; // Golden color
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(212, 175, 55, 0.6)';
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    }
  };

  const handleLassoPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = lassoCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    setLassoPoints([{ x, y }]);
    setIsDrawingLasso(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleLassoPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingLasso) return;
    const canvas = lassoCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    setLassoPoints((prev) => [...prev, { x, y }]);
  };

  const handleLassoPointerUp = () => {
    if (!isDrawingLasso) return;
    setIsDrawingLasso(false);
    generateLassoCutout();
  };

  // Trigger processing on parameters change
  useEffect(() => {
    if (!originalImageRef.current) return;
    if (processMode === 'auto') {
      processAuto(originalImageRef.current, tolerance);
    } else if (processMode === 'crop') {
      processCrop(originalImageRef.current, cropCx, cropCy, cropRadius);
    } else if (processMode === 'lasso') {
      generateLassoCutout();
    }
  }, [tolerance, cropCx, cropCy, cropRadius, processMode, standImage]);

  // Redraw lasso canvas when points or image loads
  useEffect(() => {
    if (processMode === 'lasso') {
      drawLassoCanvas();
    }
  }, [lassoPoints, processMode, standImage, isDrawingLasso]);

  const handleStandUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setStandImage(dataUrl);
      setLassoPoints([]); // Reset drawing points on new upload

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        originalImageRef.current = img;
        if (processMode === 'auto') {
          processAuto(img, tolerance);
        } else if (processMode === 'crop') {
          processCrop(img, cropCx, cropCy, cropRadius);
        } else {
          setStandCutout(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const [isDraggingCrop, setIsDraggingCrop] = useState(false);

  const handleCropPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingCrop(true);
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    updateCropPos(e);
  };

  const handleCropPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingCrop) return;
    updateCropPos(e);
  };

  const handleCropPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingCrop) {
      setIsDraggingCrop(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const updateCropPos = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCropCx(Math.max(0, Math.min(100, Math.round(x))));
    setCropCy(Math.max(0, Math.min(100, Math.round(y))));
  };

  const handleCropWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1 : -1;
    setCropRadius((prev) => Math.max(5, Math.min(50, prev + zoomFactor)));
  };

  // Pointer dragging handler on mockup stage
  const handleMockupPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement && e.target.closest('#stand-preview-overlay')) {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);

      // Check if clicked on a resize handle
      const isResizeHandle = e.target.closest('.stand-resize-handle');
      if (isResizeHandle) {
        setIsResizingStand(true);
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + (standX / 100) * rect.width;
        const centerY = rect.top + (standY / 100) * rect.height;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        
        resizeStartDistRef.current = dist;
        resizeStartSizeRef.current = standSize;
      } else {
        setIsDraggingStand(true);
      }
    }
  };

  const handleMockupPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    
    if (isResizingStand) {
      const centerX = rect.left + (standX / 100) * rect.width;
      const centerY = rect.top + (standY / 100) * rect.height;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      
      const newSize = resizeStartSizeRef.current * (currentDist / resizeStartDistRef.current);
      setStandSize(Math.max(10, Math.min(80, Math.round(newSize))));
      return;
    }

    if (!isDraggingStand) return;
    const relativeX = ((e.clientX - rect.left) / rect.width) * 100;
    const relativeY = ((e.clientY - rect.top) / rect.height) * 100;
    
    setStandX(Math.max(5, Math.min(95, relativeX)));
    setStandY(Math.max(5, Math.min(95, relativeY)));
  };

  const handleMockupPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingStand || isResizingStand) {
      setIsDraggingStand(false);
      setIsResizingStand(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleMockupWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (standCutout) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1 : -1;
      setStandSize((prev) => Math.max(10, Math.min(80, prev + zoomFactor)));
    }
  };

  const getSubseriesInfo = () => {
    for (const series of PRODUCTS_DATA.SERIES) {
      if (series.subseries) {
        for (const sub of series.subseries) {
          if (sub.designs.some(d => d.id === selectedDesign.id)) {
            return { seriesName: series.name, subseriesName: sub.name, desc: sub.desc };
          }
        }
      } else if (series.designs) {
        if (series.designs.some(d => d.id === selectedDesign.id)) {
          return { seriesName: series.name, subseriesName: '', desc: series.desc };
        }
      }
    }
    if (selectedDesign.id.startsWith('tb-') || selectedDesign.layer) {
      return {
        seriesName: 'tutuboom 系列',
        subseriesName: '分離殼 / 一體殼',
        desc: '本系列價格皆已含中國大陸運費。'
      };
    }
    return null;
  };

  const subInfo = getSubseriesInfo();

  const currentPrice = getPrice();

  return (
    <div id="product-viewer" className="py-16 px-4 md:px-12 max-w-7xl mx-auto page-enter scroll-mt-12 relative z-10">
      {/* Editorial Title */}
      <div className="text-center mb-12">
        <span className="font-mono text-xs tracking-[0.25em] text-black/50 uppercase block mb-1">
          Handcrafted Configurator
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-brand-text">
          客製化 <em>瀏覽區</em>
        </h2>
        <p className="text-xs text-brand-muted mt-2">
          可以上傳手機配件預覽搭配效果♥️
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* LEFT COLUMN: Configurator Panel (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col justify-between glass-frosted rounded-3xl p-6 sm:p-8">
          <div className="space-y-6">
            {/* Design Identifier Head */}
            <div className="border-b border-black/5 pb-4 space-y-3">
              <div>
                <span className="font-mono text-[10px] tracking-widest text-black/40 font-semibold uppercase block mb-1">
                  Active Selection / 正在瀏覽
                </span>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-brand-text leading-tight">
                      {selectedDesign.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-mono text-xs text-black/60 bg-white/50 border border-black/5 px-2.5 py-1 rounded-md">
                        圖號 #{selectedDesign.id}
                      </span>
                      {selectedDesign.layer && (
                        <span className="font-sans text-xs font-semibold text-black/80 bg-white/70 border border-black/5 px-2.5 py-1 rounded-md">
                          分類: {selectedDesign.layer}
                        </span>
                      )}
                    </div>
                    {selectedDesign.link && getSocialLinks(selectedDesign.link).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        {getSocialLinks(selectedDesign.link).map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/50 px-2.5 py-1 rounded-full transition-all text-[11px] font-semibold hover:scale-[1.02]"
                          >
                            <span className="text-sm">📕</span>
                            <span>小紅書</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedDesign.badge && (
                    <span className="font-mono text-[9px] tracking-wider uppercase px-2 py-1 rounded font-semibold shrink-0 bg-black text-white">
                      {selectedDesign.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Series and Subseries text info */}
              {subInfo && (
                <div className="p-3 bg-black/[0.02] border border-black/5 rounded-xl text-[11px] leading-relaxed text-brand-text/90">
                  <div className="font-sans font-bold text-black/80 mb-0.5 flex items-center gap-1">
                    <span>📂 所屬系列:</span>
                    <span className="text-brand-gold">{subInfo.seriesName}</span>
                    {subInfo.subseriesName && (
                      <>
                        <span className="text-black/30">/</span>
                        <span>{subInfo.subseriesName}</span>
                      </>
                    )}
                  </div>
                  {subInfo.desc && (
                    <p className="text-brand-muted italic mt-0.5">{subInfo.desc}</p>
                  )}
                </div>
              )}

              {/* Design level specific remarks box */}
              {selectedDesign.desc && (
                <div className="p-3 bg-amber-50/50 border border-amber-200/40 rounded-xl text-[11px] leading-relaxed text-amber-900 flex items-start gap-2 shadow-sm">
                  <span className="text-amber-600 shrink-0 mt-0.5 select-none">📝</span>
                  <div>
                    <span className="font-bold">產品備註：</span>
                    <span>{selectedDesign.desc}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 1: Case Type selection (Determined purely by JSON) */}
            {!isS8OrS9 && (
              <div>
                <label className="font-mono text-[10px] tracking-widest text-black/40 uppercase block mb-2.5 font-semibold">
                  🌟選擇殼體種類
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {virtualModels.map((m, mIdx) => {
                    const displayInfo = getCaseTypeDisplayName(m.name);
                    const isSelected = selectedCaseType === m.name;
                    return (
                      <button
                        key={`${m.name}-${mIdx}`}
                        onClick={() => {
                          setSelectedCaseType(m.name);
                          setActiveModelIdx(mIdx);
                          setActiveImgIdx(0);
                        }}
                        className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-black text-white border-black shadow-sm'
                            : 'border-black/5 hover:bg-white bg-white/40'
                        }`}
                      >
                        <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-brand-text'}`}>
                          {displayInfo.label}
                        </span>
                        <span className={`text-[10px] mt-1 line-clamp-1 ${isSelected ? 'text-white/60' : 'text-brand-muted'}`}>
                          {displayInfo.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-brand-muted mt-2 leading-relaxed italic">
                  * 註：僅展示已上傳之殼體渲染圖，若有未及可留言萬有狀態。
                </p>
              </div>
            )}

            {/* Case Mockup Fine Tuning (Remove margins / borders) */}
            <div className="pt-3 border-t border-black/5">
              <button 
                onClick={() => setShowTweakControls(!showTweakControls)}
                className="flex items-center justify-between w-full text-left font-mono text-[10px] tracking-widest text-black/40 uppercase font-semibold hover:text-black transition-colors"
                type="button"
              >
                <span>🎨 渲染圖尺寸微調 (去除白邊/居中)</span>
                <span className="text-[11px] font-sans font-normal text-black/60 hover:underline">
                  {showTweakControls ? '隱藏' : '展開'}
                </span>
              </button>
              
              {showTweakControls && (
                <div className="mt-3 space-y-3 bg-black/[0.02] border border-black/5 rounded-xl p-3.5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-brand-muted">
                      <span>手機殼大小縮放 (自適應調節):</span>
                      <span className="font-mono font-semibold">{caseImgScale.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="1.5"
                      step="0.05"
                      value={caseImgScale}
                      onChange={(e) => setCaseImgScale(parseFloat(e.target.value))}
                      className="w-full accent-black h-1 bg-black/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <span className="block text-brand-muted mb-1">水平偏置 X: {caseImgX}px</span>
                      <input
                        type="range"
                        min="-60"
                        max="60"
                        value={caseImgX}
                        onChange={(e) => setCaseImgX(parseInt(e.target.value))}
                        className="w-full accent-black h-1 bg-black/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="block text-brand-muted mb-1">垂直偏置 Y: {caseImgY}px</span>
                      <input
                        type="range"
                        min="-60"
                        max="60"
                        value={caseImgY}
                        onChange={(e) => setCaseImgY(parseInt(e.target.value))}
                        className="w-full accent-black h-1 bg-black/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setCaseImgScale(1.15);
                      setCaseImgX(0);
                      setCaseImgY(0);
                    }}
                    className="w-full py-1.5 border border-black/5 rounded-lg text-[10px] text-brand-muted hover:bg-black/5 transition-colors font-medium text-center"
                    type="button"
                  >
                    重置自適應設定
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Custom stand/grip uploader & auto-cutout preview module */}
            <div className="pt-4 border-t border-black/5">
              <label className="font-mono text-[10px] tracking-widest text-black/40 uppercase block mb-3 font-semibold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-brand-gold animate-pulse" />
                🌟預覽您的手機配件（磁吸支架、指環支架等）搭配 (選填)
              </label>

              {!standImage ? (
                <div className="border border-dashed border-black/10 hover:border-black/30 rounded-2xl p-5 bg-white/25 text-center transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleStandUpload}
                    className="hidden"
                    id="stand-upload-input"
                  />
                  <label htmlFor="stand-upload-input" className="cursor-pointer flex flex-col items-center gap-2">
                    <div className="p-3 rounded-full bg-black/5 hover:scale-105 transition-transform">
                      <Upload className="h-5 w-5 text-black/60" />
                    </div>
                    <span className="text-xs font-semibold text-brand-text">上傳支架照片</span>
                    <span className="text-[10px] text-brand-muted leading-relaxed max-w-[220px] mx-auto block">
                      支援 PNG/JPG 格式，網頁將自動智能去背或提供手動裁切預覽。
                    </span>
                  </label>
                </div>
              ) : (
                <div className="space-y-4 bg-white/40 border border-black/5 rounded-2xl p-4">
                  {/* Mode Selector */}
                  <div className="flex gap-1 p-0.5 bg-black/5 rounded-lg text-xs">
                    <button
                      onClick={() => setProcessMode('auto')}
                      className={`flex-1 py-1.5 rounded-md font-semibold transition-all ${
                        processMode === 'auto' ? 'bg-white shadow-sm text-black' : 'text-brand-muted hover:text-black'
                      }`}
                      type="button"
                    >
                      ✨ 智能
                    </button>
                    <button
                      onClick={() => setProcessMode('lasso')}
                      className={`flex-1 py-1.5 rounded-md font-semibold transition-all ${
                        processMode === 'lasso' ? 'bg-white shadow-sm text-black' : 'text-brand-muted hover:text-black'
                      }`}
                      type="button"
                    >
                      ✍️ 畫筆套索
                    </button>
                    <button
                      onClick={() => setProcessMode('crop')}
                      className={`flex-1 py-1.5 rounded-md font-semibold transition-all ${
                        processMode === 'crop' ? 'bg-white shadow-sm text-black' : 'text-brand-muted hover:text-black'
                      }`}
                      type="button"
                    >
                      🎯 圓形
                    </button>
                  </div>

                  {/* Processing Settings Controls */}
                  {processMode === 'auto' ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] font-medium text-brand-muted">
                        <span>智能去背容差 (自動鍵合)</span>
                        <span className="font-mono">{tolerance}</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="80"
                        value={tolerance}
                        onChange={(e) => setTolerance(parseInt(e.target.value))}
                        className="w-full accent-black h-1 bg-black/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  ) : processMode === 'lasso' ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-brand-muted leading-relaxed">
                        <Scissors className="h-3.5 w-3.5 shrink-0 text-brand-gold animate-bounce" />
                        <span>請在下方圖片中拖曳滑鼠或手指，畫出主體外圈：</span>
                      </div>
                      <div className="relative w-full aspect-square max-w-[280px] mx-auto bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-black/5 cursor-crosshair touch-none select-none">
                        <canvas
                          ref={lassoCanvasRef}
                          width={300}
                          height={300}
                          onPointerDown={handleLassoPointerDown}
                          onPointerMove={handleLassoPointerMove}
                          onPointerUp={handleLassoPointerUp}
                          className="max-w-full max-h-full"
                        />
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-brand-muted">
                        <span>已繪製 {lassoPoints.length} 個軌跡點</span>
                        {lassoPoints.length > 0 && (
                          <button
                            onClick={() => {
                              setLassoPoints([]);
                              setStandCutout(standImage);
                            }}
                            className="text-brand-accent hover:underline font-semibold"
                            type="button"
                          >
                            重置畫筆
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Live Crop region SVG preview overlay */}
                      <div 
                        onPointerDown={handleCropPointerDown}
                        onPointerMove={handleCropPointerMove}
                        onPointerUp={handleCropPointerUp}
                        onWheel={handleCropWheel}
                        className="relative w-full h-44 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-black/5 cursor-move touch-none select-none"
                        title="拖曳滑鼠移動中心，滾動滾輪調整大小"
                      >
                        <img 
                          src={standImage} 
                          alt="Original Stand" 
                          className="max-h-full max-w-full object-contain select-none"
                          referrerPolicy="no-referrer"
                        />
                        {/* Real-time SVG Crop Overlay */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                          <defs>
                            <mask id="crop-mask">
                              <rect width="100%" height="100%" fill="white" />
                              <circle cx={`${cropCx}%`} cy={`${cropCy}%`} r={`${cropRadius}%`} fill="black" />
                            </mask>
                          </defs>
                          <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#crop-mask)" />
                          <circle cx={`${cropCx}%`} cy={`${cropCy}%`} r={`${cropRadius}%`} fill="none" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
                        </svg>
                      </div>

                      <div className="bg-black/[0.02] border border-black/5 rounded-xl p-3 text-[11px] text-brand-muted space-y-1.5 leading-relaxed">
                        <div className="flex items-center gap-1.5 text-brand-text font-semibold">
                          <Move className="h-3.5 w-3.5 text-brand-gold" />
                          <span>畫框手勢調整說明：</span>
                        </div>
                        <p>📍 <b>移動位置</b>：在圖片上按住滑鼠左鍵並<b>拖曳</b>，可改變裁切中心 (X: {cropCx}%, Y: {cropCy}%)</p>
                        <p>🔍 <b>縮放大小</b>：在圖片上滾動<b>滑鼠滾輪</b>，可即時調整裁切半徑 ({cropRadius}%)</p>
                      </div>
                    </div>
                  )}

                  {/* Live placement micro-tuning controls */}
                  <div className="pt-3 border-t border-black/5 space-y-3">
                    <span className="block text-[10px] font-mono tracking-wider text-black/40 uppercase font-semibold">
                      ↕️ 支架擺放微調 (請使用鼠標調整)
                    </span>

                    <div className="bg-black/[0.02] border border-black/5 rounded-xl p-3 text-[11px] text-brand-muted space-y-1.5 leading-relaxed">
                      <div className="flex items-center gap-1.5 text-brand-text font-semibold">
                        <Sparkles className="h-3.5 w-3.5 text-brand-gold animate-pulse" />
                        <span>手機殼支架手勢調整：</span>
                      </div>
                      <p>📍 <b>拖曳調整</b>：在右側手機上按住支架，即可<b>自由拖曳</b>移動其位置 ({standX.toFixed(0)}%, {standY.toFixed(0)}%)</p>
                      <p>🔍 <b>滾輪縮放</b>：在右側手機上，滾動<b>滑鼠滾輪</b>即可即時縮放支架大小 ({standSize}%)</p>
                    </div>
                    
                    <div className="space-y-1">
                      <span className="block text-[11px] text-brand-muted mb-1">旋轉角度 Angle: {standRotate}°</span>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={standRotate}
                        onChange={(e) => setStandRotate(parseInt(e.target.value))}
                        className="w-full accent-black h-1 bg-black/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => {
                          setStandImage(null);
                          setStandCutout(null);
                          originalImageRef.current = null;
                        }}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold border border-black/10 bg-white/20 hover:bg-black/5 text-brand-text flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>移除此配件</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Order Action bar */}
          <div className="mt-8 pt-6 border-t border-black/5">
            <div className="flex justify-between items-baseline mb-4">
              <span className="font-mono text-[10px] tracking-widest text-black/40 uppercase">
                參考定價 / Reference Price
              </span>
              <span className="font-serif text-2xl font-bold text-black italic">
                {currentPrice}
              </span>
            </div>

            <div className="flex flex-col">
              <button
                onClick={() => onOpenOrderModal(getDisplayCaseType(), '', '', '', currentPrice)}
                className="w-full flex items-center justify-center gap-2 rounded-full py-4 bg-black text-white hover:scale-[1.01] transition-transform font-semibold text-xs tracking-wider uppercase shadow-md mb-3 cursor-pointer"
              >
                <ShoppingBag className="h-4.5 w-4.5 text-brand-gold" />
                <span>諮詢萬有狀態</span>
              </button>

              <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onToggleFavorite(selectedDesign.id)}
                  className={`flex items-center justify-center gap-1.5 rounded-full py-3.5 border transition-all hover:scale-[1.02] font-semibold text-xs tracking-wider uppercase shadow-xs cursor-pointer ${
                  isFavorite
                    ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100'
                    : 'border-black/10 bg-white hover:bg-black/5 text-black'
                }`}
                title={isFavorite ? '取消收藏' : '加入收藏'}
              >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-rose-500' : 'text-brand-gold'}`} />
                  <span>{isFavorite ? '已收藏' : '收藏'}</span>
              </button>

              <button
                  onClick={handleAddToComparison}
                  className={`flex items-center justify-center gap-1.5 rounded-full py-3.5 border transition-all hover:scale-[1.02] font-semibold text-xs tracking-wider uppercase shadow-xs cursor-pointer ${
                    isCurrentInShareList()
                      ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                      : 'border-black/10 bg-white hover:bg-black/5 text-black'
                  }`}
                  title="加入對比清單"
                >
                  <Layers className={`h-4 w-4 ${isCurrentInShareList() ? 'text-amber-500' : 'text-brand-gold'}`} />
                  <span>{isCurrentInShareList() ? '已入對比' : '加入對比'}</span>
                </button>

                <button
                  onClick={handleOpenShareModal}
                  className="flex items-center justify-center gap-1.5 rounded-full py-3.5 border border-black/10 bg-white hover:bg-black/5 text-black hover:scale-[1.02] transition-all font-semibold text-xs tracking-wider uppercase shadow-xs cursor-pointer"
                  title="生成分享卡片"
              >
                  <Share2 className="h-4 w-4 text-brand-gold" />
                <span>分享卡片</span>
              </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Huge Display Stage (lg:col-span-7) */}
        <div className="lg:col-span-7 relative flex flex-col justify-between items-center rounded-3xl glass-card overflow-hidden p-6 min-h-[550px]">
          {/* Action floating buttons */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2.5 rounded-full bg-white/60 hover:bg-white/80 backdrop-blur-md border border-white/40 text-brand-text shadow-sm hover:scale-105 transition-all"
              title="細節縮放"
            >
              {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
            </button>
            <button
              onClick={() => onToggleFavorite(selectedDesign.id)}
              className={`p-2.5 rounded-full backdrop-blur-md border shadow-sm hover:scale-105 transition-all ${
                isFavorite
                  ? 'bg-rose-50 border-rose-200 text-rose-500'
                  : 'bg-white/60 hover:bg-white/80 border-white/40 text-brand-text'
              }`}
              title={isFavorite ? '取消收藏' : '加入收藏'}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleOpenShareModal}
              className="p-2.5 rounded-full bg-white/60 hover:bg-white/80 backdrop-blur-md border border-white/40 text-brand-text shadow-sm hover:scale-105 transition-all cursor-pointer"
              title="分享卡片"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Display grid model list */}
          {virtualModels.length > 1 && (
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              {virtualModels.map((m, mIdx) => (
                <button
                  key={`${m.name}-${mIdx}`}
                  onClick={() => {
                    setActiveModelIdx(mIdx);
                    setActiveImgIdx(0);
                    setSelectedCaseType(m.name);
                  }}
                  className={`text-[10px] font-mono px-3 py-1.5 rounded-lg border transition-all ${
                    activeModelIdx === mIdx
                      ? 'bg-black text-white border-black'
                      : 'bg-white/40 hover:bg-white/60 text-brand-muted border-white/40 backdrop-blur-md'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          )}

          {/* The Phone Case Art Container */}
          <div className="flex-1 w-full flex items-center justify-center py-6">
            <div 
              className="relative w-72 h-[420px] rounded-[38px] border-4 border-slate-800 shadow-2xl bg-slate-100 overflow-hidden flex items-center justify-center transition-all duration-300 touch-none"
              style={{
                boxShadow: '0 25px 60px -15px rgba(0,0,0,0.25)',
              }}
              onPointerDown={handleMockupPointerDown}
              onPointerMove={handleMockupPointerMove}
              onPointerUp={handleMockupPointerUp}
              onPointerLeave={handleMockupPointerUp}
              onWheel={handleMockupWheel}
            >
              {/* Refined clean interior background */}
              <div className="absolute inset-0 bg-white/80 transition-colors" />

              {/* Case Texture Rendering over the Phone */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: isZoomed ? 1.4 : 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0 w-full h-full flex items-center justify-center p-3 select-none"
                >
                  {currentImage ? (
                    <img 
                      src={currentImage} 
                      alt={selectedDesign.title} 
                      className="max-h-full max-w-full object-contain pointer-events-none" 
                      draggable="false"
                      onContextMenu={(e) => e.preventDefault()}
                      referrerPolicy="no-referrer"
                      style={{
                        transform: `scale(${caseImgScale}) translate(${caseImgX}px, ${caseImgY}px)`,
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-black/20 gap-2">
                      <Layers className="h-10 w-10 opacity-30 animate-pulse" />
                      <span className="font-mono text-[10px]">No Render Image</span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Dynamic Phone Stand Preview Overlay */}
              {standCutout && (
                <div 
                  id="stand-preview-overlay"
                  className="absolute z-20 cursor-move select-none pointer-events-auto group/stand"
                  style={{
                    left: `${standX}%`,
                    top: `${standY}%`,
                    width: `${standSize}%`,
                    transform: `translate(-50%, -50%) rotate(${standRotate}deg)`,
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.35))',
                    touchAction: 'none'
                  }}
                >
                  <img 
                    src={standCutout} 
                    alt="手機支架" 
                    className="w-full h-auto object-contain pointer-events-none select-none"
                    draggable="false"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Thin dashed outline on hover or active */}
                  <div className="absolute inset-[-3px] border border-dashed border-black/35 rounded-lg pointer-events-none group-hover/stand:border-black/60 transition-colors" />
                  
                  {/* Four Corner Handles for Resizing */}
                  <div className="stand-resize-handle absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-black rounded-full cursor-nwse-resize shadow-md flex items-center justify-center hover:scale-125 transition-all z-30" title="拖曳縮放" />
                  <div className="stand-resize-handle absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-black rounded-full cursor-nesw-resize shadow-md flex items-center justify-center hover:scale-125 transition-all z-30" title="拖曳縮放" />
                  <div className="stand-resize-handle absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-black rounded-full cursor-nesw-resize shadow-md flex items-center justify-center hover:scale-125 transition-all z-30" title="拖曳縮放" />
                  <div className="stand-resize-handle absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-black rounded-full cursor-nwse-resize shadow-md flex items-center justify-center hover:scale-125 transition-all z-30" title="拖曳縮放" />

                  {/* Subtle active state focus border */}
                  {(isDraggingStand || isResizingStand) && (
                    <div className="absolute inset-[-6px] border border-dashed border-black rounded-full animate-pulse pointer-events-none opacity-40" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Picture Navigation indicators & Arrows */}
          {images.length > 1 && (
            <div className="w-full flex items-center justify-between gap-4 mt-2">
              <button
                onClick={handlePrevImage}
                className="p-2 rounded-full border border-white/40 bg-white/40 hover:bg-white/65 backdrop-blur-md transition-colors shadow-sm"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Thumbnails row */}
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar max-w-[60%]">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImgIdx(i)}
                    className={`relative w-11 h-14 rounded-lg bg-white/50 border overflow-hidden p-1 shrink-0 transition-all ${
                      activeImgIdx === i 
                        ? 'border-black ring-1 ring-black/10 scale-105' 
                        : 'border-white/40 opacity-65 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt="Thumbnail" 
                      className="w-full h-full object-contain" 
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextImage}
                className="p-2 rounded-full border border-white/40 bg-white/40 hover:bg-white/65 backdrop-blur-md transition-colors shadow-sm"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Share Card Modal */}
      <ShareCardModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareList={shareList}
      />
    </div>
  );
}
