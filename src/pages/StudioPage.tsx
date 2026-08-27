import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductViewer from '../components/ProductViewer';
import { Design } from '../data/productsData';
import { ShareQueueItem } from '../types';

interface StudioPageProps {
  selectedDesign: Design;
  onSelectDesign: (design: Design) => void;
  allDesigns: Design[];
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

export default function StudioPage({
  selectedDesign,
  onSelectDesign,
  allDesigns,
  onOpenOrderModal,
  preferredCaseType,
  favorites,
  onToggleFavorite,
  shareList,
  onAddToShareList,
  onRemoveFromShareList,
  isShareModalOpen,
  setIsShareModalOpen,
}: StudioPageProps) {
  const { id } = useParams<{ id?: string }>();

  // If route has specific design id parameter, automatically select that design
  useEffect(() => {
    if (id && allDesigns.length > 0) {
      const match = allDesigns.find((d) => d.id.toLowerCase() === id.toLowerCase());
      if (match && match.id !== selectedDesign.id) {
        onSelectDesign(match);
      }
    }
  }, [id, allDesigns, selectedDesign.id, onSelectDesign]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full"
    >
      <ProductViewer
        selectedDesign={selectedDesign}
        onOpenOrderModal={onOpenOrderModal}
        preferredCaseType={preferredCaseType}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
        shareList={shareList}
        onAddToShareList={onAddToShareList}
        onRemoveFromShareList={onRemoveFromShareList}
        isShareModalOpen={isShareModalOpen}
        setIsShareModalOpen={setIsShareModalOpen}
      />
    </motion.div>
  );
}
