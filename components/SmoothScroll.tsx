"use client";

import React, { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Smooth scroll très subtil et léger : élimine les crans secs sans effet de glisse excessif
    const lenis = new Lenis({
      lerp: 0.15, // Très réactif et discret (juste un léger adoucissement)
      wheelMultiplier: 1.0,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: false,
      respectReducedMotion: false,
    });

    lenisRef.current = lenis;
    if (typeof window !== "undefined") {
      (window as any).__lenis = lenis;
    }

    lenis.on("scroll", ScrollTrigger.update);

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(500, 33);

    // Déverrouillage automatique : si un glisser de sélection est relâché n'importe où, on libère le curseur
    const handleGlobalMouseUp = () => {
      if (lenis) {
        lenis.start();
        lenis.animatedScroll = lenis.targetScroll = window.scrollY;
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("pointerup", handleGlobalMouseUp);

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(refreshTimer);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("pointerup", handleGlobalMouseUp);
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      lenisRef.current = null;
      if (typeof window !== "undefined") {
        (window as any).__lenis = null;
      }
    };
  }, []);

  return <>{children}</>;
}

