"use client";

import React, { useEffect, useState } from "react";
import DecryptedText from "./DecryptedText";
import { ArrowUpRight, ChevronDown } from "lucide-react";

interface HeroCyberProps {
  onOpenBooking: () => void;
}

export default function HeroCyber({ onOpenBooking }: HeroCyberProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    let fallbackTimer: NodeJS.Timeout | undefined;

    const reveal = () => {
      setIsRevealed(true);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };

    window.addEventListener("poulpy_splash_reveal", reveal);
    fallbackTimer = setTimeout(reveal, 3000);

    return () => {
      window.removeEventListener("poulpy_splash_reveal", reveal);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, []);

  const titleString = "POULPY";

  return (
    <section
      className="relative min-h-[100dvh] h-screen flex flex-col justify-between pt-20 pb-6 px-6 sm:px-12 lg:px-16 z-10 overflow-hidden"
    >
      {/* Spacer top for navbar clearance */}
      <div className="h-4 sm:h-8" aria-hidden="true" />

      {/* Main Centered Hero Block */}
      <div className="max-w-5xl mx-auto w-full my-auto py-6 flex flex-col items-center justify-center text-center select-none">
        {/* Architectural Title with Pure GPU Composited Fluid Entrance */}
        <div
          className="relative flex items-center justify-center leading-[0.95] text-[clamp(2.75rem,8.5vw,7.8rem)] font-display font-bold text-[#F5F4F0] tracking-tight py-2 overflow-hidden"
          style={{ transform: "translateZ(0)" }}
        >
          {titleString.split("").map((letter, idx) => (
            <span
              key={idx}
              style={{
                animationDelay: `${idx * 55}ms`,
              }}
              className={`letter-reveal inline-block select-none cursor-default poulpy-letter ${
                isRevealed ? "poulpy-letter-active" : ""
              } hover:-translate-y-2 hover:scale-105 hover:text-[#CA1C30] hover:drop-shadow-[0_4px_25px_rgba(202,28,48,0.45)] transition-transform duration-300`}
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
        style={{
          animation: isRevealed
            ? "poulpyHudFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) 250ms both"
            : "none",
          opacity: isRevealed ? undefined : 0,
          transform: "translateZ(0)",
        }}
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
