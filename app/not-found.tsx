"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#07090D] text-white font-mono flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden selection:bg-[#FF7582] selection:text-black">
      {/* Subtle ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF7582]/[0.03] blur-[140px] pointer-events-none" />

      {/* Top Brand Logo */}
      <header className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <span className="w-2.5 h-2.5 bg-[#FF7582] shadow-[0_0_10px_#FF7582] inline-block animate-pulse" />
          <span className="text-xl font-display text-white group-hover:text-[#FF7582] transition-colors tracking-widest font-bold">
            POULPY<span className="text-[#FF7582]">.</span>
          </span>
        </Link>
      </header>

      {/* Center Minimal Content */}
      <div className="my-auto py-12 flex flex-col items-center justify-center text-center relative z-10 max-w-md mx-auto space-y-6">
        {/* Animated Number 404 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          <div className="text-7xl sm:text-8xl font-display text-white tracking-wider">
            4<span className="text-[#FF7582]">0</span>4
          </div>
        </motion.div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-xl font-display text-white tracking-wider">
            ERREUR 404
          </h1>
          <p className="text-xs text-white/50 leading-relaxed max-w-xs mx-auto">
            La page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
        </div>

        {/* Single Clean Return Button */}
        <div className="pt-2">
          <Link
            href="/"
            className="btn-cyber-primary py-3 px-8 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETOUR À L&apos;ACCUEIL</span>
          </Link>
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="text-center text-[10px] text-white/30 relative z-10">
        POULPY COACHING · TOUS DROITS RÉSERVÉS
      </footer>
    </main>
  );
}
