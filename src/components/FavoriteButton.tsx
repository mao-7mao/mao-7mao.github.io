import React, { useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import { motion, useAnimationControls } from 'framer-motion';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  iconClassName?: string;
  children?: React.ReactNode;
  title?: string;
  ariaLabel?: string;
  burstRadius?: number;
}

const PARTICLE_COUNT = 8;
const PARTICLE_COLORS = [
  '#F43F5E', // rose-500
  '#FB7185', // rose-400
  '#EC4899', // pink-500
  '#C084FC', // purple-400
  '#F43F5E', // rose-500
  '#FDA4AF', // rose-300
  '#A855F7', // purple-500
  '#FB7185', // rose-400
];

const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angleDeg = i * (360 / PARTICLE_COUNT);
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    index: i,
    cos: Math.cos(angleRad),
    sin: Math.sin(angleRad),
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    sizeClass: i % 2 === 0 ? 'w-1.5 h-1.5' : 'w-1 h-1',
  };
});

export default function FavoriteButton({
  isFavorite,
  onToggle,
  className = '',
  iconClassName = 'h-4 w-4',
  children,
  title,
  ariaLabel,
  burstRadius = 22,
}: FavoriteButtonProps) {
  const heartControls = useAnimationControls();
  const [bursts, setBursts] = useState<number[]>([]);
  const burstCounterRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const willBeFavorite = !isFavorite;
    onToggle(e);

    heartControls.stop();

    if (willBeFavorite) {
      // Spawn 8 radial dots around the heart
      const burstId = ++burstCounterRef.current;
      setBursts((prev) => [...prev, burstId]);
      const timer = window.setTimeout(() => {
        setBursts((prev) => prev.filter((id) => id !== burstId));
      }, 750);
      timersRef.current.push(timer);

      // Pop heart to 1.3 then spring back with stiffness 300, damping 10
      void heartControls
        .start({
          scale: 1.3,
          transition: { duration: 0.08, ease: 'easeOut' },
        })
        .then(() => {
          void heartControls.start({
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 10 },
          });
        });
    } else {
      // Subtle feedback when removing from favorites
      void heartControls
        .start({
          scale: 0.84,
          transition: { duration: 0.08, ease: 'easeOut' },
        })
        .then(() => {
          void heartControls.start({
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 14 },
          });
        });
    }
  };

  return (
    <motion.button
      type="button"
      data-no-global-spring="true"
      data-favorite-btn="true"
      onClick={handleClick}
      whileTap={{ scale: 0.94, boxShadow: '0 1px 2px rgba(81, 74, 88, 0.05)' }}
      transition={{ type: 'spring', stiffness: 260, damping: 12 }}
      className={`overflow-visible ${className}`}
      title={title ?? (isFavorite ? '取消收藏' : '加入收藏')}
      aria-label={ariaLabel ?? title ?? (isFavorite ? '取消收藏' : '加入收藏')}
      aria-pressed={isFavorite}
    >
      <span className="relative inline-flex items-center justify-center overflow-visible">
        {/* 8 radial burst particles */}
        {bursts.map((burstId) => (
          <span
            key={burstId}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible z-30"
          >
            {PARTICLES.map((p) => (
              <motion.span
                key={p.index}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x: p.cos * burstRadius,
                  y: p.sin * burstRadius,
                  scale: [0, 1.2, 0],
                  opacity: [1, 1, 0],
                }}
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 10 },
                  y: { type: 'spring', stiffness: 300, damping: 10 },
                  scale: { duration: 0.56, times: [0, 0.35, 1], ease: 'easeOut' },
                  opacity: { duration: 0.56, times: [0, 0.65, 1], ease: 'easeOut' },
                }}
                className={`absolute rounded-full pointer-events-none ${p.sizeClass}`}
                style={{ backgroundColor: p.color }}
              />
            ))}
          </span>
        ))}

        {/* Animated Heart Icon */}
        <motion.span
          animate={heartControls}
          initial={{ scale: 1 }}
          className="inline-flex items-center justify-center"
        >
          <Heart className={iconClassName} />
        </motion.span>
      </span>
      {children}
    </motion.button>
  );
}
