"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import CyberNavbar from "@/components/CyberNavbar";
import HeroCyber from "@/components/HeroCyber";
import WhyPoulpy from "@/components/WhyPoulpy";
import CyberAbout from "@/components/CyberAbout";
import CyberGames from "@/components/CyberGames";
import Methodology from "@/components/Methodology";
import CyberFooter from "@/components/CyberFooter";

const Scene3D = dynamic(() => import("@/components/Scene3D"), {
  ssr: false,
});
const Booking = dynamic(() => import("@/components/Booking"));
const CyberTestimonials = dynamic(() => import("@/components/CyberTestimonials"));
const CyberMedia = dynamic(() => import("@/components/CyberMedia"));
const CyberFAQ = dynamic(() => import("@/components/CyberFAQ"));

export default function CybercorePoulpyPage() {
  const watermarkRef = useRef<HTMLDivElement | null>(null);
  const [watermarkLoaded, setWatermarkLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollToPlugin);

      // Defer 7.1MB VCT watermark image decode until after Hero & LCP have painted
      const loadTimer = setTimeout(() => {
        setWatermarkLoaded(true);
      }, 900);

      let lastOpacity = -1;
      let ticking = false;

      const updateWatermark = () => {
        ticking = false;
        const el = watermarkRef.current;
        if (!el) return;

        const scrollY = window.scrollY;
        const heroHeight = window.innerHeight;
        // Start revealing only when reaching horizontal scroll (when 3D is gone)
        const startThreshold = heroHeight * 0.80;
        const fullThreshold = heroHeight * 1.05;

        let targetOpacity = 0;
        if (scrollY > startThreshold) {
          const progress = Math.min(1, (scrollY - startThreshold) / (fullThreshold - startThreshold));
          targetOpacity = progress * 0.16;
        }

        if (Math.abs(targetOpacity - lastOpacity) > 0.002) {
          lastOpacity = targetOpacity;
          el.style.opacity = targetOpacity.toFixed(3);
          el.style.visibility = targetOpacity <= 0.001 ? "hidden" : "visible";
        }
      };

      const handleScroll = () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateWatermark);
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      updateWatermark();

      return () => {
        clearTimeout(loadTimer);
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  const scrollToBooking = () => {
    const el = document.getElementById("booking");
    if (el) {
      const heading = el.querySelector("h2, h3") as HTMLElement | null;
      const targetTop = heading
        ? Math.max(0, heading.getBoundingClientRect().top + window.scrollY - 88)
        : Math.max(0, el.getBoundingClientRect().top + window.scrollY - 70);
      const distance = Math.abs(targetTop - window.scrollY);
      const duration = Math.min(1.8, Math.max(0.9, distance / 3200));
      gsap.to(window, {
        scrollTo: { y: targetTop, autoKill: false },
        duration,
        ease: "power3.inOut",
        overwrite: "auto",
      });
    }
  };

  return (
    <main className="w-full block text-[#F5F4F0] selection:bg-[#CA1C30] selection:text-[#0A1C1D] relative z-10 overflow-x-clip bg-[#0A1C1D]">
      {/* 3D WebGL Background Scene (Asynchronously decoupled, non-blocking) */}
      <Scene3D />

      {/* 01. Complete Poulpy Cyber Navbar */}
      <CyberNavbar onOpenBooking={scrollToBooking} />

      {/* 02. Monumental Hero Section (100% pristine & transparent so 3D scene is fully visible) */}
      <div id="hero" className="relative z-10">
        <HeroCyber onOpenBooking={scrollToBooking} />
      </div>

      {/* Main Content Sections with seamless blurred transition into dark obsidian strictly below hero fold */}
      <div className="relative z-20">
        {/* Background layer: transparent at seam, progressively blurred & darkened to #0B0A0D before the cards */}
        <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
          {/* Top smooth blurred fade reaching complete obsidian higher up above cards */}
          <div
            className="fade-top-gradient absolute top-0 left-0 right-0 h-44 sm:h-52 md:h-60 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(11, 10, 13, 0) 0%, rgba(11, 10, 13, 0.25) 18%, rgba(11, 10, 13, 0.65) 42%, rgba(11, 10, 13, 0.92) 68%, #0B0A0D 82%, #0B0A0D 100%)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              maskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 100%)",
            }}
          />
          {/* Solid obsidian body starting higher up right after the top fade */}
          <div className="absolute top-44 sm:top-52 md:top-60 inset-x-0 bottom-0 bg-[#0B0A0D]" />

          {/* Static transparent VCT trophy watermark positioned strictly behind cards & vignettes on black background */}
          <div
            ref={watermarkRef}
            className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden will-change-opacity"
            style={{ opacity: 0, visibility: "hidden" }}
            aria-hidden="true"
          >
            <div
              className="w-full h-full bg-center bg-cover bg-no-repeat mix-blend-screen"
              style={{
                backgroundImage: watermarkLoaded ? "url('/vct-trophy-official-bw.png')" : "none",
                filter: "contrast(1.35) brightness(0.95)",
                maskImage: "radial-gradient(ellipse 92% 88% at 50% 50%, black 50%, transparent 98%)",
                WebkitMaskImage: "radial-gradient(ellipse 92% 88% at 50% 50%, black 50%, transparent 98%)",
              }}
            />
          </div>
        </div>

        {/* 03. Pourquoi Poulpy (06 piliers avec défilement horizontal fluide) */}
        <WhyPoulpy />

        {/* 04. À Propos de Coach Poulpy (Atheris Esport) */}
        <CyberAbout onOpenBooking={scrollToBooking} />

        {/* 05. Disciplines & Jeux (Valorant & Apex Legends) */}
        <CyberGames onOpenBooking={scrollToBooking} />

        {/* 06. Méthodologie en 4 étapes clés */}
        <Methodology />

        {/* 07. Module de Réservation & Tarifs Officiels en 4 étapes */}
        <Booking />

        {/* 08. Témoignages & Avis d'Élèves Vérifiés */}
        <CyberTestimonials />

        {/* 09. Médias Officiels : Diffusions YouTube & Twitch (VOD) */}
        <CyberMedia />

        {/* 11. FAQ Tactique */}
        <CyberFAQ />

        {/* 12. Footer Brutaliste Cybercore */}
        <CyberFooter />
      </div>
    </main>
  );
}

