'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      {/* Flash néon au changement de page */}
      <motion.div
        key={`bar-${pathname}`}
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: 1, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        style={{ originX: 0 }}
        className="fixed top-0 left-0 right-0 h-[2px] z-[9999] bg-gradient-to-r from-transparent via-purple-400 to-cyan-400 pointer-events-none"
        aria-hidden
      />

      {/* Contenu animé — mode sync : entrée et sortie se chevauchent, pas d'écran blanc */}
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          style={{ width: '100%' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
