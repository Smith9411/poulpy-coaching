"use client";

import React, { useEffect } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import CyberNavbar from "@/components/CyberNavbar";
import HeroCyber from "@/components/HeroCyber";
import WhyPoulpy from "@/components/WhyPoulpy";
import CyberGames from "@/components/CyberGames";
import Methodology from "@/components/Methodology";
import Booking from "@/components/Booking";
import CyberTestimonials from "@/components/CyberTestimonials";
import CyberAbout from "@/components/CyberAbout";
import CyberMedia from "@/components/CyberMedia";
import CyberFAQ from "@/components/CyberFAQ";
import CyberFooter from "@/components/CyberFooter";
import Scene3D from "@/components/Scene3D";

export default function CybercorePoulpyPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollToPlugin);
    }
  }, []);

  const scrollToBooking = () => {
    const el = document.getElementById("booking");
    if (el) {
      const navOffset = 70;
      const targetTop = el.getBoundingClientRect().top + window.scrollY - navOffset;
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
          {/* Top smooth blurred fade from 0% opacity down to solid obsidian */}
          <div
            className="fade-top-gradient absolute top-0 left-0 right-0 h-64 sm:h-80 md:h-96 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(11, 10, 13, 0) 0%, rgba(11, 10, 13, 0.15) 20%, rgba(11, 10, 13, 0.45) 45%, rgba(11, 10, 13, 0.78) 70%, rgba(11, 10, 13, 0.95) 90%, #0B0A0D 100%)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              maskImage: "linear-gradient(to bottom, transparent 0%, black 25%, black 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 25%, black 100%)",
            }}
          />
          {/* Solid obsidian body starting right after the top fade */}
          <div className="absolute top-64 sm:top-80 md:top-96 inset-x-0 bottom-0 bg-[#0B0A0D]" />
        </div>

        {/* 03. Pourquoi Poulpy (06 piliers avec défilement horizontal fluide) */}
        <WhyPoulpy />

        {/* 04. Disciplines & Jeux (Valorant & Apex Legends) */}
        <CyberGames onOpenBooking={scrollToBooking} />

        {/* 05. Méthodologie en 4 étapes clés */}
        <Methodology />

        {/* 06. Module de Réservation & Tarifs Officiels en 4 étapes */}
        <Booking />

        {/* 08. Témoignages & Avis d'Élèves Vérifiés */}
        <CyberTestimonials />

        {/* 09. À Propos de Coach Poulpy (Atheris Esport) */}
        <CyberAbout onOpenBooking={scrollToBooking} />

        {/* 10. Médias Officiels : Diffusions YouTube & Twitch */}
        <CyberMedia />

        {/* 11. FAQ Tactique */}
        <CyberFAQ />

        {/* 12. Footer Brutaliste Cybercore */}
        <CyberFooter />
      </div>
    </main>
  );
}

