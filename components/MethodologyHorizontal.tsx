"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DecryptedText from "./DecryptedText";
import { Target, Video, Brain, Trophy, ChevronRight, Activity } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function MethodologyHorizontal() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const steps = [
    {
      num: "01",
      code: "PHASE_AIM_BIOMECHANICS",
      title: "AUDIT BIOMÉCANIQUE & PRÉCISION REFLEX",
      desc: "Calibration millimétrique de la chaîne cinétique : prise de souris (claw/fingertip), position de l'avant-bras, eDPI optimal et élimination complète de l'over-shooting sur les micro-flicks.",
      metrics: [
        { label: "Acquisition 1er tir", value: "135ms" },
        { label: "Stabilité du tracking", value: "99.2%" },
        { label: "Routine sur-mesure", value: "20 min / jour" },
      ],
      tag: "MÉCANIQUE PURE",
      accent: "acid",
      icon: Target,
    },
    {
      num: "02",
      code: "PHASE_VOD_CHIRURGIE",
      title: "ANALYSE DE VOD 4K & SENS TACTIQUE",
      desc: "Découpage chirurgical de vos replays image par image. Chaque élimination subie est décortiquée : micro-angle mal tenu, timing de décalage trop hâtif ou manque d'information visuelle.",
      metrics: [
        { label: "Angles corrigés", value: "18 par partie" },
        { label: "Trade kill success", value: "+64%" },
        { label: "Player analytique", value: "4K 60FPS" },
      ],
      tag: "DATA LOG",
      accent: "laser",
      icon: Video,
    },
    {
      num: "03",
      code: "PHASE_COGNITIVE_CLUTCH",
      title: "ARBRE DÉCISIONNEL & PSYCHOLOGIE DU CLUTCH",
      desc: "Transformer le chaos du match en une suite de duels 1v1 binaire. Maîtrise absolue du rythme cardiaque sous haute pression, élimination du tilt et lecture mentale des schémas adverses.",
      metrics: [
        { label: "Survie en 1v2 / 1v3", value: "44.8%" },
        { label: "Sang-froid mesuré", value: "-16 bpm" },
        { label: "Prise de décision", value: "Instantanée" },
      ],
      tag: "MENTAL ENGINE",
      accent: "acid",
      icon: Brain,
    },
    {
      num: "04",
      code: "PHASE_RANK_UP_DOMINATION",
      title: "MONITORING EN CONTINU & ASCENSION RANKED",
      desc: "Vous n'êtes jamais seul face au doute. Accès direct au Discord VIP du coach 7j/7, fiches de révision Notion mises à jour après chaque manche et garantie de franchir votre palier bloquant.",
      metrics: [
        { label: "Délai 1er Rank Up", value: "< 14 jours" },
        { label: "Joueurs accompagnés", value: "+100" },
        { label: "Note de satisfaction", value: "4.9 / 5" },
      ],
      tag: "VICTORY PROTOCOL",
      accent: "laser",
      icon: Trophy,
    },
  ];

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth + 80),
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${track.scrollWidth - window.innerWidth + 80}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onRefresh: () => {
            ScrollTrigger.update();
          },
        },
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="methodology"
      ref={containerRef}
      className="relative bg-black/85 backdrop-blur-sm border-t border-[rgba(255,255,255,0.08)] overflow-hidden"
    >
      {/* Pinned Title Ribbon */}
      <div className="absolute top-8 left-8 sm:left-12 z-20 flex items-center gap-4 text-xs font-mono">
        <span className="data-badge data-badge-acid">
          <DecryptedText text="MÉTHODOLOGIE D'ÉLITE // 04 ÉTAPES" />
        </span>
        <span className="text-white/40 hidden sm:inline flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#00ff41] animate-ping" />
          DÉFILEMENT HORIZONTAL GSAP SCROLLTRIGGER PINNED
        </span>
      </div>

      {/* Horizontal Sliding Track */}
      <div
        ref={trackRef}
        className="flex items-center h-screen w-max pl-8 sm:pl-12 pr-24 space-x-12"
      >
        {steps.map((step) => {
          const Icon = step.icon;
          const isAcid = step.accent === "acid";
          return (
            <div
              key={step.num}
              className={`w-[85vw] sm:w-[580px] lg:w-[650px] shrink-0 reticle-box ${
                isAcid ? "" : "reticle-laser"
              } p-8 sm:p-12 space-y-8 bg-[#040404]`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between border-b border-[rgba(255,255,255,0.08)] pb-6">
                <div className="space-y-1">
                  <div className="text-xs font-mono text-[#00ff41] font-bold tracking-widest uppercase">
                    {step.code}
                  </div>
                  <div className="text-5xl sm:text-7xl font-display text-white tracking-wider">
                    {step.num}
                  </div>
                </div>

                <div
                  className={`w-14 h-14 border flex items-center justify-center ${
                    isAcid
                      ? "border-[#00ff41]/40 text-[#00ff41] bg-[#00ff41]/5"
                      : "border-[#00f0ff]/40 text-[#00f0ff] bg-[#00f0ff]/5"
                  }`}
                >
                  <Icon className="w-7 h-7" />
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-3">
                <h3 className="text-2xl sm:text-3xl font-display text-white tracking-wider">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/50 font-mono leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[rgba(255,255,255,0.08)]">
                {step.metrics.map((m) => (
                  <div key={m.label} className="p-3 bg-black/60 border border-white/5 space-y-1">
                    <div className="text-[10px] text-white/40 font-mono uppercase truncate">
                      {m.label}
                    </div>
                    <div
                      className={`text-base sm:text-lg font-bold font-mono ${
                        isAcid ? "text-[#00ff41]" : "text-[#00f0ff]"
                      }`}
                    >
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Card Footer Tag */}
              <div className="flex items-center justify-between text-[11px] font-mono text-white/40 pt-2">
                <span>{step.tag}</span>
                <span className="flex items-center gap-1 text-white">
                  ÉTAPE SUIVANTE <ChevronRight className="w-3.5 h-3.5 text-[#00ff41]" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
