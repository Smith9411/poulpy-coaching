"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import DecryptedText from "./DecryptedText";
import { ArrowUpRight, ChevronDown } from "lucide-react";

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
      gsap.set(hudMetricsRef.current, { opacity: 0, y: 20 });
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
      className="relative min-h-[100dvh] h-screen flex flex-col justify-between pt-20 pb-6 px-6 sm:px-12 lg:px-16 z-10 overflow-hidden"
    >
      {/* Spacer top for navbar clearance */}
      <div className="h-4 sm:h-8" aria-hidden="true" />

      {/* Main Centered Hero Block */}
      <div className="max-w-5xl mx-auto w-full my-auto py-6 flex flex-col items-center justify-center text-center select-none">
        {/* Architectural Title with Subtle Smooth Hover Lift & Color Glow */}
        <div
          ref={titleLettersRef}
          className="relative flex items-center justify-center leading-[0.95] text-[clamp(2.75rem,8.5vw,7.8rem)] font-display font-bold text-[#F5F4F0] tracking-tight py-2"
        >
          {titleString.split("").map((letter, idx) => (
            <span
              key={idx}
              className="letter-reveal inline-block will-change-transform transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-105 hover:text-[#CA1C30] hover:drop-shadow-[0_4px_25px_rgba(202,28,48,0.45)] cursor-default"
            >
              {letter}
            </span>
          ))}
        </div>

        {/* Sub-headline & Call-To-Actions (Centered) */}
        <div className="mt-6 sm:mt-8 max-w-2xl mx-auto flex flex-col items-center text-center space-y-6">
          <p className="text-lg sm:text-xl md:text-2xl text-[#F5F4F0] font-semibold leading-snug tracking-tight">
            L&apos;ÉLITE DU COACHING FPS COMPÉTITIF.
            <br />
            <span className="font-accent text-[#00B4A0] text-sm sm:text-base md:text-lg font-semibold tracking-wider block mt-2">
              VALORANT (IMMORTAL 2 #5000) &amp; APEX (3x PICK PRED #450).
            </span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 w-full max-w-md">
            <button
              onClick={onOpenBooking}
              className="btn-cyber-primary w-full sm:w-auto px-8 py-3.5 justify-center font-bold text-xs tracking-wider cursor-pointer"
            >
              <span>ENGAGER LE COACHING</span>
            </button>
            <a
              href="#methodology"
              className="btn-cyber-ghost w-full sm:w-auto px-7 py-3.5 text-xs font-semibold tracking-wider uppercase justify-center cursor-pointer"
            >
              <span>EXPLORER LA MÉTHODE</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Subtle Bouncing Down Arrow */}
      <div
        ref={hudMetricsRef}
        className="flex items-center justify-center pb-2 z-20 pointer-events-auto"
      >
        <a
          href="#coaching"
          aria-label="Dérouler vers la suite"
          className="p-3 text-white/40 hover:text-[#CA1C30] transition-colors flex items-center justify-center animate-bounce"
        >
          <ChevronDown className="w-6 h-6" />
        </a>
      </div>
    </section>
  );
}
