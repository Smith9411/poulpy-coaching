"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import DecryptedText from "./DecryptedText";
import { ArrowUpRight, Terminal, Crosshair, Shield, Zap, Activity } from "lucide-react";

interface HeroCyberProps {
  onOpenBooking: () => void;
}

export default function HeroCyber({ onOpenBooking }: HeroCyberProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const titleLettersRef = useRef<HTMLDivElement | null>(null);
  const hudMetricsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const letters = titleLettersRef.current?.querySelectorAll(".letter-reveal");
    
    // Set initial hidden state
    if (letters) {
      gsap.set(letters, {
        yPercent: 120,
        opacity: 0,
        rotateX: -45,
      });
    }
    if (hudMetricsRef.current) {
      gsap.set(hudMetricsRef.current, { opacity: 0, y: 30 });
    }

    let hasAnimated = false;
    const animateHero = () => {
      if (hasAnimated) return;
      hasAnimated = true;

      if (letters) {
        gsap.to(letters, {
          yPercent: 0,
          opacity: 1,
          rotateX: 0,
          stagger: 0.05,
          duration: 1.1,
          ease: "power4.out",
        });
      }

      if (hudMetricsRef.current) {
        gsap.to(hudMetricsRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          delay: 0.35,
        });
      }
    };

    window.addEventListener("poulpy_splash_reveal", animateHero);
    const fallbackTimer = setTimeout(animateHero, 1150);

    return () => {
      window.removeEventListener("poulpy_splash_reveal", animateHero);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const titleString = "POULPY";

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90vh] flex flex-col justify-between pt-36 sm:pt-40 pb-16 sm:pb-20 px-4 sm:px-12 lg:px-16 z-10 overflow-hidden"
    >
      {/* Center Monumental Architectural Title */}
      <div className="my-auto py-12 sm:py-16 flex flex-col items-start select-none max-w-full">
        <div className="data-badge data-badge-acid mb-6">
          <span>COACHING E-SPORT HAUT NIVEAU</span>
        </div>

        {/* Huge Title Animated by GSAP */}
        <div
          ref={titleLettersRef}
          className="relative overflow-hidden flex items-center leading-[0.82] text-[clamp(2.75rem,13.5vw,18.5rem)] font-display text-white tracking-tighter py-2 max-w-full"
        >
          {titleString.split("").map((letter, idx) => (
            <span
              key={idx}
              className="letter-reveal inline-block will-change-transform text-white hover:text-[#FF7582] transition-colors duration-150 cursor-crosshair"
            >
              {letter}
            </span>
          ))}
          <span className="letter-reveal text-[#FF7582] inline-block ml-2 will-change-transform animate-pulse">
            .
          </span>
        </div>

        {/* Sub-headline & Tagline */}
        <div className="mt-6 max-w-3xl grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-8 space-y-2">
            <p className="text-lg md:text-2xl text-white font-mono font-medium leading-snug tracking-tight">
              L&apos;ÉLITE DU COACHING FPS COMPÉTITIF.
              <br />
              <span className="text-[#8FAFD4]">
                VALORANT (IMMORTAL 2 #5000) &amp; APEX (3x PICK #450).
              </span>
            </p>
            <p className="text-xs md:text-sm text-white/40 font-mono leading-relaxed">
              Zéro théorie inutile. Zéro dégradé complaisant. Analyse biomécanique sub-pixel, déconstruction chirurgicale de VOD et domination psychologique en clutch.
            </p>
          </div>

          <div className="md:col-span-4 flex flex-col gap-3">
            <button
              onClick={onOpenBooking}
              className="btn-cyber-primary"
            >
              <span>ENGAGER LE COACHING</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <a
              href="#methodology"
              className="px-6 py-3 border border-transparent hover:border-[#8FAFD4] hover:bg-[#8FAFD4]/10 hover:shadow-[0_0_15px_rgba(143,175,212,0.25)] text-white/50 hover:text-[#8FAFD4] text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center text-center cursor-pointer"
            >
              <span>EXPLORER LA MÉTHODE</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Telemetry HUD Bar */}
      <div
        ref={hudMetricsRef}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-[rgba(255,255,255,0.08)]"
      >
        <div className="reticle-box p-4 space-y-1">
          <span className="text-[10px] text-white/40 font-mono tracking-widest uppercase block">
            01 // AIM TRAINING
          </span>
          <div className="text-xl font-bold font-mono text-[#A4DE87]">
            VT JADE CONFIRMED
          </div>
          <span className="text-[11px] text-white/60">Voltaic Benchmark Officiel</span>
        </div>

        <div className="reticle-box reticle-laser p-4 space-y-1">
          <span className="text-[10px] text-white/40 font-mono tracking-widest uppercase block">
            02 // VALORANT PEAK
          </span>
          <div className="text-xl font-bold font-mono text-[#8FAFD4]">
            IMMORTAL 2 #5000
          </div>
          <span className="text-[11px] text-white/60">Top 0.05% Serveur Europe</span>
        </div>

        <div className="reticle-box p-4 space-y-1">
          <span className="text-[10px] text-white/40 font-mono tracking-widest uppercase block">
            03 // APEX LEGENDS
          </span>
          <div className="text-xl font-bold font-mono text-[#FF7582]">
            3x PICK #450 S24
          </div>
          <span className="text-[11px] text-white/60">Predator MNK Pure Mechanics</span>
        </div>

        <div className="reticle-box p-4 space-y-1">
          <span className="text-[10px] text-white/40 font-mono tracking-widest uppercase block">
            04 // PRO STRUCTURE
          </span>
          <div className="text-xl font-bold font-mono text-[#FF7582]">
            ATHERIS ESPORT
          </div>
          <span className="text-[11px] text-white/60">Coach Officiel de l&apos;Équipe</span>
        </div>
      </div>
    </section>
  );
}
