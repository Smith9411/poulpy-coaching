"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DecryptedText from "./DecryptedText";
import CornerBrackets from "./CornerBrackets";
import { Target, Brain, Crosshair, TrendingUp, ShieldCheck, Flame, ChevronRight, ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function WhyPoulpy() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [scrollPct, setScrollPct] = useState(0);

  const pillars = [
    {
      num: "01",
      icon: Target,
      badge: "VOD CHIRURGIE",
      title: "ANALYSE CHIRURGICALE",
      subtitle: "Dissection millimétrique de tes parties",
      description:
        "Nous analysons tes replays en 4K image par image. Chaque élimination subie est décortiquée : micro-déficit d'angle, mauvais tempo de décalage ou exposition inutile.",
      specs: [
        { label: "Précision d'analyse", val: "Sub-pixel & 60 FPS" },
        { label: "Erreurs corrigées", val: "15 à 20 par session" },
        { label: "Rapport", val: "Fiche Notion exportable" },
      ],
      color: "laser",
    },
    {
      num: "02",
      icon: Brain,
      badge: "VISION TACTIQUE",
      title: "GAME SENSE & MACRO-GAME",
      subtitle: "Anticiper au lieu de subir",
      description:
        "Apprends à décoder les intentions ennemies 15 secondes avant qu'elles ne se produisent. Maîtrise des rotations, timing d'utilitaires et domination psychologique en clutch 1v2+.",
      specs: [
        { label: "Survie en clutch", val: "+45% en 3 semaines" },
        { label: "Lecture de carte", val: "Prédiction macro" },
        { label: "Prise de décision", val: "Instantanée sous stress" },
      ],
      color: "acid",
    },
    {
      num: "03",
      icon: Crosshair,
      badge: "MÉCANIQUE PURE",
      title: "AIM & BIOMÉCANIQUE",
      subtitle: "La visée au millimètre près",
      description:
        "Programme sur-mesure axé sur la régularité pure : placement du viseur sub-pixel, tracking sans saccade, synchronisation mouvement/tir et posture physique adaptée.",
      specs: [
        { label: "Routine sur-mesure", val: "20 min KovaaK / Aimlabs" },
        { label: "Sensibilité eDPI", val: "Calibration cm/360" },
        { label: "Headshot %", val: "+18% en moyenne" },
      ],
      color: "laser",
    },
    {
      num: "04",
      icon: Flame,
      badge: "PSYCHOLOGIE DU JOUEUR",
      title: "ANTI-TILT & SANG-FROID",
      subtitle: "Garder le contrôle absolu sous haute pression",
      description:
        "Le talent mécanique ne vaut rien si le mental flanche en prolongation. Travail sur la gestion émotionnelle, les routines respiratoires de match et l'élimination des spirales négatives.",
      specs: [
        { label: "Résistance au tilt", val: "Protocole anti-panique" },
        { label: "Sang-froid mesuré", val: "BPM stabilisé en 1v1" },
        { label: "Mentalité", val: "Posture de compétiteur pro" },
      ],
      color: "acid",
    },
    {
      num: "05",
      icon: TrendingUp,
      badge: "RÉSULTATS FORMELS",
      title: "PROGRESSION MESURABLE",
      subtitle: "Suivi continu et objectifs clairs",
      description:
        "Un accompagnement rigoureux basé sur tes objectifs réels de compétition. Après chaque session, tes métriques sont mises à jour pour mesurer tes gains de performance tangibles.",
      specs: [
        { label: "Gain moyen", val: "+350 à +450 RR constatés" },
        { label: "Liaison", val: "Canal privé Discord 7j/7" },
        { label: "Debriefing", val: "Suivi continu après match" },
      ],
      color: "laser",
    },
    {
      num: "06",
      icon: ShieldCheck,
      badge: "CONTRAT DE CONFIANCE",
      title: "GARANTIE DE PALIER",
      subtitle: "Montée en division garantie sous 14 jours",
      description:
        "Si après avoir suivi le protocole et appliqué les routines prescrites tu ne progresses pas en compétition, les séances de recalibrage sont offertes jusqu'à validation de ton objectif.",
      specs: [
        { label: "Garantie", val: "+1 division minimum" },
        { label: "Délai moyen", val: "9 à 14 jours" },
        { label: "Engagement", val: "100% formalisé" },
      ],
      color: "acid",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const trackDistanceRef = useRef(3000);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    let ctx: gsap.Context | null = null;

    const bindScroll = () => {
      if (ctx) ctx.revert();

      // Measure precise scroll width
      const maxScroll = Math.max(0, track.scrollWidth - window.innerWidth + 140);
      const totalH = maxScroll + window.innerHeight;

      // Apply height directly to DOM element without triggering React re-renders
      section.style.height = `${totalH}px`;
      trackDistanceRef.current = maxScroll;

      ctx = gsap.context(() => {
        gsap.to(track, {
          x: () => -maxScroll,
          ease: "none",
          scrollTrigger: {
            id: "whypoulpy-scroll",
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const pct = Math.round(self.progress * 100);
              const idx = Math.min(5, Math.floor(self.progress * 6));
              setScrollPct(pct);
              setActiveIndex(idx);
            },
          },
        });
      }, section);
    };

    bindScroll();

    const handleResize = () => {
      bindScroll();
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      if (ctx) ctx.revert();
    };
  }, []);

  const goToCard = (index: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const target = section.offsetTop + (index / 6) * trackDistanceRef.current;
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <section
      id="coaching"
      ref={sectionRef}
      className="relative w-full bg-[#07090D] border-t border-[rgba(255,255,255,0.08)] font-mono min-h-[4200px]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between pt-24 sm:pt-28 pb-8 sm:pb-10 z-20 bg-[#07090D]">
        {/* Top Telemetry Bar */}
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 z-20">
          <div className="flex items-center gap-3">
            <span className="data-badge data-badge-acid">
              <DecryptedText text="POURQUOI CHOISIR POULPY ? // 06 PILIERS" />
            </span>
            <span className="text-white/40 text-xs hidden md:inline-flex items-center">
              <span className="w-1.5 h-1.5 bg-[#FF7582] animate-ping" />
            </span>
          </div>

          {/* Pill Navigation & Live Progress */}
          <div className="flex items-center gap-4 text-xs">
            {/* Direct Card Jump Pills */}
            <div className="hidden lg:flex items-center gap-1.5">
              {pillars.map((p, idx) => (
                <button
                  key={p.num}
                  onClick={() => goToCard(idx)}
                  className={`px-2 py-0.5 text-[10px] font-bold border transition-all ${
                    activeIndex === idx
                      ? "border-[#FF7582] bg-[#FF7582] text-black shadow-[0_0_10px_rgba(255,117,130,0.4)]"
                      : "border-white/15 text-white/50 hover:border-white/40 hover:text-white bg-black/40"
                  }`}
                >
                  {p.num}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => goToCard(Math.max(0, activeIndex - 1))}
                className="px-2 py-1 border border-white/15 text-white/60 hover:text-white hover:border-[#FF7582] text-xs transition-colors"
                title="Précédent"
              >
                ←
              </button>
              <button
                onClick={() => goToCard(Math.min(5, activeIndex + 1))}
                className="px-2 py-1 border border-white/15 text-white/60 hover:text-white hover:border-[#FF7582] text-xs transition-colors"
                title="Suivant"
              >
                →
              </button>
            </div>

            <span className="text-white/40 hidden sm:inline">AVANCEMENT :</span>
            <span className="text-[#FF7582] font-bold">{scrollPct}%</span>
            <div className="w-24 sm:w-32 h-1.5 bg-white/10 border border-white/15 relative overflow-hidden">
              <div
                className="h-full bg-[#FF7582] shadow-[0_0_10px_#FF7582] transition-all duration-75"
                style={{ width: `${scrollPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Horizontal Sliding Track */}
        <div
          ref={trackRef}
          className="flex items-center w-max pl-6 sm:pl-12 pr-32 space-x-8 sm:space-x-12 my-auto will-change-transform transform-gpu select-none"
        >
          {pillars.map((item) => {
            const Icon = item.icon;
            const isAcid = item.color === "acid";
            return (
              <div
                key={item.num}
                className={`group w-[85vw] sm:w-[500px] lg:w-[560px] shrink-0 reticle-box ${
                  isAcid ? "" : "reticle-laser"
                } p-8 sm:p-10 space-y-6 bg-[#090c10] border border-white/10 relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.9)] transition-colors duration-300 ${
                  isAcid ? "hover:border-[#FF7582]/50" : "hover:border-[#8FAFD4]/50"
                }`}
              >
                <CornerBrackets color={isAcid ? "coral" : "slate"} />
                {/* Card Header */}
                <div className="flex items-start justify-between border-b border-white/10 pb-4 relative z-10">
                  <div className="space-y-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider ${
                        isAcid
                          ? "bg-[#FF7582]/10 text-[#FF7582] border border-[#FF7582]/30"
                          : "bg-[#8FAFD4]/10 text-[#8FAFD4] border border-[#8FAFD4]/30"
                      }`}
                    >
                      {item.badge}
                    </span>
                    <div className="glitch-text text-4xl sm:text-6xl font-display text-white tracking-wider">
                      {item.num}
                    </div>
                  </div>

                  <div
                    className={`w-12 h-12 border flex items-center justify-center ${
                      isAcid
                        ? "border-[#FF7582]/40 text-[#FF7582] bg-[#FF7582]/5"
                        : "border-[#8FAFD4]/40 text-[#8FAFD4] bg-[#8FAFD4]/5"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                {/* Card Body */}
                <div className="space-y-2 relative z-10">
                  <h3 className="text-2xl font-display text-white tracking-wider">
                    {item.title}
                  </h3>
                  <div className="text-xs text-[#FF7582] font-medium">
                    {item.subtitle}
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed pt-2">
                    {item.description}
                  </p>
                </div>

                {/* Specs & Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 border-t border-white/10 relative z-10">
                  {item.specs.map((s, sIdx) => (
                    <div key={sIdx} className="p-2.5 bg-black/80 border border-white/5 space-y-1">
                      <span className="text-[9px] text-white/40 uppercase block truncate">
                        {s.label}
                      </span>
                      <strong
                        className={`text-xs font-mono font-bold block ${
                          isAcid ? "text-[#FF7582]" : "text-[#8FAFD4]"
                        }`}
                      >
                        {s.val}
                      </strong>
                    </div>
                  ))}
                </div>

                {/* Footer Indicator */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40 relative z-10">
                  <span>PILIER {item.num} // 06</span>
                  <span className="flex items-center gap-1 text-[#FF7582]">
                    CONTINUER LE SCROLL <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}

          {/* Final Callout Card at End of Scroll */}
          <div className="w-[85vw] sm:w-[480px] shrink-0 reticle-box p-8 sm:p-10 flex flex-col justify-between space-y-6 bg-black border border-[#FF7582]/50 relative overflow-hidden shadow-[0_0_40px_rgba(255,117,130,0.2)]">
            <div className="radar-sweep-line" />
            <div className="space-y-3 relative z-10">
              <span className="data-badge data-badge-acid">PRÊT POUR L&apos;ASCENSION ?</span>
              <h3 className="text-3xl sm:text-4xl font-display text-white tracking-wider">
                LE PROCHAIN PALIER C&apos;EST MAINTENANT.
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Ne perds plus des mois à tourner en rond en ranked. Réserve ton premier audit dès aujourd&apos;hui.
              </p>
            </div>

            <div className="pt-6 border-t border-white/10 relative z-10">
              <a
                href="#tarifs"
                className="btn-cyber-primary w-full justify-center text-xs py-3"
              >
                <span>DÉCOUVRIR LES TARIFS</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Hint */}
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-end text-[10px] text-white/30 z-20">
          <span className="text-[#FF3E4D] font-mono">DÉROULEZ LA PAGE VERS LE BAS ↓</span>
        </div>
      </div>
    </section>
  );
}
