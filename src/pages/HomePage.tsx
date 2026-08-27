import React from 'react';
import Hero from '../components/Hero';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full flex-grow flex flex-col justify-center"
    >
      <Hero />
    </motion.div>
  );
}
