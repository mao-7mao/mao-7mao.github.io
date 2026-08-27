import React from 'react';
import { motion } from 'framer-motion';
import Gallery from '../components/Gallery';
import { Design } from '../data/productsData';

interface GalleryPageProps {
  onSelectDesign: (design: Design) => void;
  activeDesignId: string;
  selectedCaseCompatible: string;
  setSelectedCaseCompatible: (val: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export default function GalleryPage({
  onSelectDesign,
  activeDesignId,
  selectedCaseCompatible,
  setSelectedCaseCompatible,
  favorites,
  onToggleFavorite,
}: GalleryPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full pt-2 sm:pt-6"
    >
      <Gallery
        onSelectDesign={onSelectDesign}
        activeDesignId={activeDesignId}
        selectedCaseCompatible={selectedCaseCompatible}
        setSelectedCaseCompatible={setSelectedCaseCompatible}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
      />
    </motion.div>
  );
}
