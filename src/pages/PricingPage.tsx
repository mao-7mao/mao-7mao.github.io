import React from 'react';
import { motion } from 'framer-motion';
import PricePage from '../components/PricePage';

export default function PricingPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full pt-2 sm:pt-6"
    >
      <PricePage />
    </motion.div>
  );
}
