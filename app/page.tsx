"use client";

import React, { useEffect } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import CyberNavbar from "@/components/CyberNavbar";
import ThemeToggle from "@/components/ThemeToggle";
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
    <main className="w-full block text-white selection:bg-[#FF7582] selection:text-black relative z-10">
      {/* 3D WebGL Background Scene (Asynchronously decoupled, non-blocking) */}
      <Scene3D />

      {/* Floating Minimalist Theme Toggle (Moon / Sun in top right corner) */}
      <ThemeToggle />

      {/* 01. Complete Poulpy Cyber Navbar */}
      <CyberNavbar onOpenBooking={scrollToBooking} />

      {/* 02. Monumental Hero Section (Transparent so 3D planet is visible) */}
      <div id="hero">
        <HeroCyber onOpenBooking={scrollToBooking} />
      </div>

      {/* Solid unified dark background for the lower half of the page */}
      <div className="bg-black relative z-20">
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

