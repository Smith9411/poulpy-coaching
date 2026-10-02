"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Target, Dumbbell, TrendingUp, ArrowRight, Layers, CheckCircle2 } from "lucide-react";
import DecryptedText from "./DecryptedText";

interface StepData {
  num: string;
  code: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  description: string;
  metrics: Array<{ label: string; val: string }>;
  tag: string;
  accent: "acid" | "laser";
  color: string;
}

const STEPS: StepData[] = [
  {
    num: "01",
    code: "TARGET // PHASE_01",
    icon: Search,
    title: "ANALYSE CLINIQUE",
    subtitle: "Diagnostic complet & audit de gameplay",
    description:
      "Audit chirurgical de ta sensibilité (cm/360), analyse biomécanique de ta posture, inspection matérielle et décryptage VOD frame par frame.",
    metrics: [
      { label: "Analyse VOD", val: "Frame par frame & timing de tir" },
      { label: "Sensibilité & Grip", val: "Calibration cm/360 exacte" },
      { label: "Placement de viseur", val: "Mesure de micro-ajustement" },
      { label: "Bilan", val: "Rapport d'audit complet remis" },
    ],
    tag: "AUDIT GLOBAL // 01",
    accent: "laser",
    color: "#00B4A0",
  },
  {
    num: "02",
    code: "TARGET // PHASE_02",
    icon: Target,
    title: "IDENTIFICATION DES BLOCAGES",
    subtitle: "Ciblage précis des 3 freins majeurs",
    description:
      "Mise en lumière immédiate des 2 à 3 habitudes inconscientes et faiblesses structurelles qui plafonnent ton rang et coûtent tes duels clés.",
    metrics: [
      { label: "Axes prioritaires", val: "3 blocages critiques identifiés" },
      { label: "Diagnostic d'erreur", val: "Immédiat en session" },
      { label: "Arbre de décision", val: "Cartographie des mauvais choix" },
      { label: "Plan d'action", val: "Ordre de priorité chirurgical" },
    ],
    tag: "CIBLAGE CHIRURGICAL // 02",
    accent: "acid",
    color: "#CA1C30",
  },
  {
    num: "03",
    code: "TARGET // PHASE_03",
    icon: Dumbbell,
    title: "TRAVAIL & ROUTINES",
    subtitle: "Entraînement guidé & Exercices pratiques",
    description:
      "Création d'une playlist d'entraînement dédiée (KovaaK's / Aimlabs) et exercices in-game sur-mesure pour intégrer les automatismes moteurs.",
    metrics: [
      { label: "Routine quotidienne", val: "15 à 20 min / jour calibrées" },
      { label: "Playlists Aim", val: "Scénarios personnalisés KovaaK's" },
      { label: "Exercices In-game", val: "Drills de crosshair & deadzone" },
      { label: "Conditionnement", val: "Répétition neuromusculaire" },
    ],
    tag: "MÉCANIQUE PURE // 03",
    accent: "laser",
    color: "#00B4A0",
  },
  {
    num: "04",
    code: "TARGET // PHASE_04",
    icon: TrendingUp,
    title: "PROGRESSION & SUIVI",
    subtitle: "Mesure continue & Montée en rang",
    description:
      "Évaluation continue de ton évolution après chaque séance, ajustement dynamique des exercices et suivi direct sur Discord 7j/7.",
    metrics: [
      { label: "Accompagnement", val: "Discord direct 7j/7" },
      { label: "Suivi statistique", val: "Courbe de progression RR" },
      { label: "Ajustements", val: "Mise à jour hebdo de la routine" },
      { label: "Objectif", val: "Passage de palier mesurable" },
    ],
    tag: "RÉSULTAT GARANTI // 04",
    accent: "acid",
    color: "#CA1C30",
  },
];

export default function Methodology() {
  return (
    <section id="methodology" className="py-16 sm:py-24 px-6 sm:px-12 lg:px-16 bg-transparent font-mono relative">
      <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-5xl font-display text-[#F5F4F0] tracking-wider">
              UNE MÉTHODE. PAS DE <span className="text-[#CA1C30]">RECETTE MAGIQUE.</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#F5F4F0]/60 max-w-2xl leading-relaxed">
              Chaque phase s&apos;empile naturellement au scroll pour structurer et verrouiller ton plan de progression.
            </p>
          </div>
        </div>

        {/* Scroll Stacking Typographic Panels (Zero Heavy Card Boxes, Pure Typography & Smooth Stacking) */}
        <div className="relative pt-4 pb-12 space-y-8">
          {STEPS.map((step, index) => {
            const isAcid = step.accent === "acid";
            const isLast = index === STEPS.length - 1;
            const stickyTop = `calc(85px + ${index * 26}px)`;

            return (
              <div
                key={step.num}
                className="sticky mb-10 w-full will-change-transform"
                style={{
                  top: stickyTop,
                  zIndex: 10 + index,
                }}
              >
                <div className="p-8 sm:p-12 bg-[#121417]/95 backdrop-blur-xl rounded-3xl transition-all duration-300 shadow-[0_-20px_50px_rgba(0,0,0,0.95)] space-y-8">
                  {/* Top Phase Header Row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isAcid ? "bg-[#CA1C30] shadow-[0_0_10px_#CA1C30]" : "bg-[#00B4A0] shadow-[0_0_10px_#00B4A0]"
                        }`}
                      />
                      <span className="text-xs font-mono tracking-widest text-[#F5F4F0]/60 uppercase">
                        PHASE {step.num} / 04 · {step.code}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-mono font-bold px-4 py-1.5 rounded-full ${
                        isAcid
                          ? "bg-[#CA1C30]/15 text-[#CA1C30]"
                          : "bg-[#00B4A0]/15 text-[#00B4A0]"
                      }`}
                    >
                      {step.tag}
                    </span>
                  </div>

                  {/* Monumental Typographic Title */}
                  <div className="space-y-2">
                    <h3 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-[#F5F4F0]">
                      {step.title}
                    </h3>
                    <p className={`text-xs sm:text-sm font-mono font-semibold ${isAcid ? "text-[#CA1C30]" : "text-[#00B4A0]"}`}>
                      {step.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[#F5F4F0]/75 max-w-3xl leading-relaxed font-sans">
                    {step.description}
                  </p>

                  {/* Typographic Metrics / Actions Grid */}
                  <div className="pt-2">
                    <span className="text-[10px] font-mono text-[#F5F4F0]/40 uppercase tracking-widest block pb-3">
                      LIVRABLES &amp; ACTIONS CLÉS :
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {step.metrics.map((m, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-4 py-3 border-b border-white/10 group"
                        >
                          <span className="text-xs text-[#F5F4F0]/50 font-mono uppercase tracking-wide">
                            {m.label}
                          </span>
                          <span className="text-xs text-[#F5F4F0] font-mono font-bold group-hover:text-[#CA1C30] transition-colors text-right">
                            {m.val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Link on the last stacked phase (Phase 04) */}
                  {isLast && (
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white/50">
                        PROTOCOLE 100% VALIDÉ
                      </span>
                      <a
                        href="#booking"
                        className="btn-cyber-primary rounded-full px-7 py-3 text-xs font-mono font-bold tracking-wider inline-flex items-center gap-2 cursor-pointer"
                      >
                        <span>CHOISIR MON CRÉNEAU</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
