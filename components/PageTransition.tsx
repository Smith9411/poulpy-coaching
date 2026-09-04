'use client';

import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';

// Variantes d'animation : entrée et sortie de chaque page
const variants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    scale: 0.995,
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 1.005,
    transition: {
      duration: 0.22,
      ease: [0.55, 0, 1, 0.45] as [number, number, number, number],
    },
  },
};

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  // On garde l'ancienne key pour ne pas déclencher de transition au premier rendu
  const isFirstRender = useRef(true);

  if (isFirstRender.current) {
    isFirstRender.current = false;
    // Premier rendu : on affiche directement sans animation d'entrée
    return (
      <motion.div
        key={pathname}
        initial={false}
        animate="enter"
        variants={variants}
        className="min-h-0 flex-1 w-full"
      >
        {children}
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="hidden"
        animate="enter"
        exit="exit"
        className="min-h-0 flex-1 w-full"
      >
        {/* Flash néon discret au changement de page */}
        <motion.div
          initial={{ opacity: 0.35, scaleX: 0 }}
          animate={{ opacity: 0, scaleX: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          style={{ originX: 0 }}
          className="fixed top-0 left-0 right-0 h-[2px] z-[9999] bg-gradient-to-r from-transparent via-purple-400 to-cyan-400 pointer-events-none"
          aria-hidden
        />
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
