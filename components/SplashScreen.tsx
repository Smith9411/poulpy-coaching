"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(15);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Progress increment simulation
    const p1 = setTimeout(() => setProgress(45), 250);
    const p2 = setTimeout(() => setProgress(82), 600);
    const p3 = setTimeout(() => setProgress(100), 950);

    // Fade out after completion
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("poulpy_splash_reveal"));
      }
    }, 1100);

    // Completely unmount after transition
    const unmountTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1650);

    return () => {
      clearTimeout(p1);
      clearTimeout(p2);
      clearTimeout(p3);
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0B0A0D] font-mono select-none transition-all duration-500 ease-out ${
        isFadingOut
          ? "opacity-0 scale-105 pointer-events-none"
          : "opacity-100 scale-100 pointer-events-auto"
      }`}
    >
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

      {/* Ambient Radial Coral Glow */}
      <div className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-[#CA1C30]/15 blur-3xl pointer-events-none" />

      {/* Center Container */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-sm px-6">
        {/* Logo Frame with Corner Reticles */}
        <div className="relative p-2 bg-black border border-[#CA1C30]/40 shadow-[0_0_30px_rgba(202, 28, 48,0.25)]">
          <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#CA1C30]" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#CA1C30]" />
          <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#CA1C30]" />
          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#CA1C30]" />

          <div className="w-20 h-20 sm:w-24 sm:h-24 relative overflow-hidden bg-black flex items-center justify-center">
            <Image
              src="/icons/icon-192x192.png"
              alt="Poulpy Logo"
              width={96}
              height={96}
              className="w-full h-full object-cover animate-pulse"
              priority
            />
          </div>
        </div>

        {/* Brand Title & Subtitle */}
        <div className="space-y-1">
          <div className="flex items-center justify-center">
            <span className="text-2xl sm:text-3xl font-display text-white tracking-widest">
              POULPY
            </span>
          </div>
          <p className="text-[10px] text-white/50 tracking-widest uppercase">
            SYSTÈME DE COACHING E-SPORT // V2.4
          </p>
        </div>

        {/* Technical Boot Progress Bar */}
        <div className="w-48 sm:w-56 space-y-2">
          <div className="w-full h-1 bg-white/10 overflow-hidden relative border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-[#CA1C30] to-[#00B4A0] transition-all duration-300 ease-out shadow-[0_0_10px_#CA1C30]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-white/40">
            <span>CHARGEMENT 3D</span>
            <span className="text-[#CA1C30] font-bold">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
