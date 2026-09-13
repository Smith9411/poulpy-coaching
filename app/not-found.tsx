"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Crosshair, Radar, RefreshCw, AlertTriangle, ShieldAlert, Sparkles, Terminal } from "lucide-react";
import DecryptedText from "@/components/DecryptedText";
import CornerBrackets from "@/components/CornerBrackets";

export default function NotFound() {
  const [coordinates, setCoordinates] = useState({ x: 404, y: 777 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCoordinates({
        x: Math.floor(100 + Math.random() * 899),
        y: Math.floor(100 + Math.random() * 899),
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#06080A] text-white font-mono flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden selection:bg-[#FF7582] selection:text-black">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF7582]/[0.04] blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-[#8FAFD4]/[0.03] blur-[140px] pointer-events-none" />

      {/* Top HUD Header */}
      <header className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="w-2.5 h-2.5 bg-[#FF7582] shadow-[0_0_10px_#FF7582] inline-block animate-pulse" />
          <span className="text-xl font-display text-white group-hover:text-[#FF7582] transition-colors tracking-widest font-bold">
            POULPY<span className="text-[#FF7582]">.</span>
          </span>
        </Link>

        <div className="flex items-center gap-3 text-xs text-white/50">
          <span className="hidden sm:inline-block font-mono text-[11px]">
            COORD : [ X:{coordinates.x} // Y:{coordinates.y} ]
          </span>
          <span className="px-2.5 py-0.5 text-[10px] font-bold bg-red-500/10 border border-red-500/30 text-[#FF7582] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#FF7582] animate-ping" />
            SIGNAL PERDU
          </span>
        </div>
      </header>

      {/* Center 404 Command Console */}
      <div className="my-auto py-8 flex flex-col items-center justify-center text-center relative z-10 max-w-2xl mx-auto w-full">
        {/* Giant Glowing 404 Number with Radar Sweep */}
        <div className="relative select-none my-2">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-[clamp(6.5rem,20vw,14rem)] font-display text-white tracking-tighter leading-none relative z-10"
          >
            4<span className="text-[#FF7582]">0</span>4
          </motion.div>

          {/* Radar Scanning Line Effect */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 sm:w-72 h-48 sm:h-72 rounded-full border border-white/10 relative animate-spin" style={{ animationDuration: "12s" }}>
              <div className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-gradient-to-t from-[#FF7582]/40 to-transparent" />
            </div>
          </div>
        </div>

        {/* Tactical Status Card */}
        <div className="w-full reticle-box p-6 sm:p-8 bg-[#090c10] border border-white/20 relative shadow-[0_0_40px_rgba(0,0,0,0.8)] space-y-5">
          <CornerBrackets color="coral" />

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs text-[#FF7582] font-bold tracking-widest uppercase">
              <ShieldAlert className="w-4 h-4" />
              <span>ERREUR CRITIQUE // SECTEUR HORS DE PORTÉE</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-display text-white tracking-wider">
              COORDONNÉES TACTIQUES INTROUVABLES
            </h1>

            <p className="text-xs text-white/60 leading-relaxed max-w-lg mx-auto">
              La page que tu essaies de rejoindre a été déplacée, déclassifiée ou n&apos;existe plus dans la base de données de l&apos;Atelier Poulpy.
            </p>
          </div>

          {/* Telemetry log simulation */}
          <div className="p-3 bg-black/80 border border-white/10 text-left text-[11px] font-mono text-white/60 space-y-1">
            <div className="flex items-center justify-between text-white/40 text-[10px]">
              <span className="flex items-center gap-1">
                <Terminal className="w-3 h-3 text-[#FF7582]" />
                JOURNAL SYSTÈME
              </span>
              <span className="text-[#FF7582] font-bold">ERR_404_VORTEX</span>
            </div>
            <div className="text-white/80">&gt; RECHERCHE CIBLE : ÉCHEC DE LOCALISATION</div>
            <div className="text-white/40">&gt; CONSEIL : RECALIBRER LA NAVIGATION VERS L&apos;ACCUEIL</div>
          </div>

          {/* Action Recovery Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="btn-cyber-primary w-full sm:w-auto py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>RETOURNER À L&apos;ACCUEIL</span>
            </Link>

            <Link
              href="/#booking"
              className="btn-cyber-ghost w-full sm:w-auto py-3 px-6 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <Crosshair className="w-4 h-4 text-[#FF7582]" />
              <span>RÉSERVER UN CRÉNEAU</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <footer className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-white/40 relative z-10">
        <span>POULPY COACHING · PERFORMANCE ENGINE V8</span>
        <div className="flex items-center gap-4">
          <Link href="/avis" className="hover:text-white transition-colors">AVIS ÉLÈVES</Link>
          <span>·</span>
          <Link href="/contact" className="hover:text-white transition-colors">CONTACT TACTIQUE</Link>
        </div>
      </footer>
    </main>
  );
}
