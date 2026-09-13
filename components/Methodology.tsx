"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Target, Dumbbell, TrendingUp, ChevronRight, ChevronLeft, CheckCircle2, Crosshair, ArrowRight, Sparkles, Layers, Shield, Eye } from "lucide-react";
import DecryptedText from "./DecryptedText";
import CornerBrackets from "./CornerBrackets";

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
    subtitle: "Diagnostic complet de ton gameplay",
    description:
      "Étude chirurgicale de tes statistiques, de ta sensibilité eDPI, de ton matériel (grip, posture) et de ta prise de décision en match pour cartographier tes réflexes.",
    metrics: [
      { label: "Analyse VOD", val: "Frame par frame" },
      { label: "Sensibilité", val: "Calibration cm/360" },
    ],
    tag: "AUDIT GLOBAL",
    accent: "laser",
    color: "#8FAFD4",
  },
  {
    num: "02",
    code: "TARGET // PHASE_02",
    icon: Target,
    title: "IDENTIFICATION DES FAIBLESSES",
    subtitle: "Ciblage précis des axes d'amélioration",
    description:
      "Isolation formelle des 2 à 3 facteurs bloquants majeurs qui limitent ta montée en grade : sur-déplacement, micro-hésitation de visée ou mauvais timing de décalage.",
    metrics: [
      { label: "Axes prioritaires", val: "3 blocages clés" },
      { label: "Diagnostic", val: "Immédiat" },
    ],
    tag: "CIBLAGE CHIRURGICAL",
    accent: "acid",
    color: "#FF7582",
  },
  {
    num: "03",
    code: "TARGET // PHASE_03",
    icon: Dumbbell,
    title: "TRAVAIL & ROUTINES",
    subtitle: "Entraînement guidé & Exercices pratiques",
    description:
      "Mise en place de routines d'aim personnalisées (KovaaK's / Aimlabs), d'exercices de placement de réticule et de drills de crosshair placement adaptés à ta façon de jouer.",
    metrics: [
      { label: "Routine quotidienne", val: "20 min / jour" },
      { label: "Exercices", val: "100% sur-mesure" },
    ],
    tag: "MÉCANIQUE PURE",
    accent: "laser",
    color: "#8FAFD4",
  },
  {
    num: "04",
    code: "TARGET // PHASE_04",
    icon: TrendingUp,
    title: "PROGRESSION & SUIVI",
    subtitle: "Mesure continue & Montée en rang",
    description:
      "Évaluation continue de tes gains de niveau après chaque séance. Ajustement du plan tactique, canal privé Discord 7j/7 et garantie formelle de franchir ton palier bloquant.",
    metrics: [
      { label: "Suivi Discord", val: "7j / 7 direct" },
      { label: "Garantie", val: "Rank up sous 14j" },
    ],
    tag: "RÉSULTAT GARANTI",
    accent: "acid",
    color: "#FF7582",
  },
];

export default function Methodology() {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const nextCard = () => setActiveIndex((prev) => (prev + 1) % STEPS.length);
  const prevCard = () => setActiveIndex((prev) => (prev - 1 + STEPS.length) % STEPS.length);

  return (
    <section id="methodology" className="py-20 px-6 sm:px-12 lg:px-16 bg-[#07090D] border-t border-[rgba(255,255,255,0.08)] font-mono relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#FF7582]/[0.03] blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="data-badge data-badge-acid">
                <DecryptedText text="OPTION 6 : LE DECK 3D EMPILÉ" />
              </span>
              <span className="text-xs text-white/40 font-mono flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#FF7582]" />
                CARTES HOLOGRAPHIQUES EN PROFONDEUR
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-display text-white tracking-wider">
              UNE MÉTHODE. PAS DE <span className="text-[#FF7582]">RECETTE MAGIQUE.</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/50 max-w-2xl leading-relaxed">
              Fais défiler les cartes du deck tactique en 3D ou clique directement sur les onglets pour explorer chaque phase.
            </p>
          </div>

          {/* Direct Phase Selector Badges */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, idx) => {
              const isCurrent = activeIndex === idx;
              return (
                <button
                  key={s.num}
                  onClick={() => setActiveIndex(idx)}
                  className={`px-3 py-1.5 text-xs font-bold border transition-all cursor-pointer ${
                    isCurrent
                      ? "border-[#FF7582] bg-[#FF7582] text-black shadow-[0_0_15px_rgba(255,117,130,0.3)]"
                      : "border-white/10 bg-black/60 text-white/50 hover:text-white"
                  }`}
                >
                  {s.num}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3D STACKED CARDS CONTAINER */}
        <div className="relative min-h-[440px] flex items-center justify-center py-6" style={{ perspective: "1200px" }}>
          <div className="w-full max-w-3xl relative h-[400px]">
            {STEPS.map((step, idx) => {
              // Calculate relative position from activeIndex (0 to 3)
              const offset = (idx - activeIndex + STEPS.length) % STEPS.length;
              const isFront = offset === 0;
              const Icon = step.icon;
              const isAcid = step.accent === "acid";

              // Determine 3D positioning for stacking
              // offset 0: front (scale 1, zIndex 40, y 0, opacity 1)
              // offset 1: right/behind (scale 0.94, zIndex 30, x 24, y 12, opacity 0.6)
              // offset 2: further behind (scale 0.88, zIndex 20, x 48, y 24, opacity 0.35)
              // offset 3: bottom/hidden (scale 0.82, zIndex 10, x 72, y 36, opacity 0.15)

              const xOffset = offset === 0 ? 0 : offset * 20;
              const yOffset = offset === 0 ? 0 : offset * 12;
              const scale = 1 - offset * 0.05;
              const zIndex = 40 - offset * 10;
              const opacity = offset === 0 ? 1 : offset === 1 ? 0.6 : offset === 2 ? 0.35 : 0.15;

              return (
                <motion.div
                  key={step.num}
                  layout
                  onClick={() => {
                    if (!isFront) setActiveIndex(idx);
                  }}
                  animate={{
                    x: xOffset,
                    y: yOffset,
                    scale: scale,
                    zIndex: zIndex,
                    opacity: opacity,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 280,
                    damping: 24,
                  }}
                  className={`absolute inset-0 reticle-box p-6 sm:p-8 flex flex-col justify-between transition-colors duration-200 select-none cursor-pointer ${
                    isFront
                      ? isAcid
                        ? "bg-[#0d1017] border border-[#FF7582] shadow-[0_0_40px_rgba(255,117,130,0.25)] ring-1 ring-[#FF7582]"
                        : "bg-[#0d1017] border border-[#8FAFD4] shadow-[0_0_40px_rgba(143,175,212,0.25)] ring-1 ring-[#8FAFD4]"
                      : "bg-[#090C12] border border-white/15 hover:border-white/40"
                  }`}
                >
                  {isFront && <CornerBrackets color={isAcid ? "coral" : "slate"} />}

                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                          isAcid ? "bg-[#FF7582] text-black" : "bg-[#8FAFD4] text-black"
                        }`}
                      >
                        PHASE {step.num}
                      </span>
                      <span className="text-xs text-white/50 tracking-wider">
                        {step.code}
                      </span>
                    </div>

                    <div
                      className={`w-10 h-10 border flex items-center justify-center ${
                        isAcid
                          ? "border-[#FF7582]/40 text-[#FF7582] bg-[#FF7582]/10"
                          : "border-[#8FAFD4]/40 text-[#8FAFD4] bg-[#8FAFD4]/10"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Body */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-white/40 uppercase tracking-widest block font-mono">
                        {step.tag}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-display text-white tracking-wider mt-0.5">
                        {step.title}
                      </h3>
                      <div className={`text-xs font-semibold mt-1 ${isAcid ? "text-[#FF7582]" : "text-[#8FAFD4]"}`}>
                        {step.subtitle}
                      </div>
                    </div>

                    <p className="text-xs text-white/70 leading-relaxed max-w-xl">
                      {step.description}
                    </p>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {step.metrics.map((m, mIdx) => (
                        <div key={mIdx} className="p-2.5 bg-black/60 border border-white/10 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-white/50">{m.label} :</span>
                          <strong className="text-white font-mono text-xs">{m.val}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                    <div className="flex items-center gap-2">
                      <Crosshair className="w-3.5 h-3.5 text-[#A4DE87]" />
                      <span className="text-[11px] text-white/60">CARTE ACTIVE DU DECK</span>
                    </div>
                    <a
                      href="#booking"
                      className={`flex items-center gap-1 font-bold uppercase tracking-wider text-xs transition-colors ${
                        isAcid ? "text-[#FF7582] hover:text-white" : "text-[#8FAFD4] hover:text-white"
                      }`}
                    >
                      <span>CHOISIR CE PROTOCOLE</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Deck Controls (Previous / Next Buttons) */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={prevCard}
            className="btn-cyber-ghost flex items-center gap-2 py-2.5 px-6 text-xs uppercase cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>PHASE PRÉCÉDENTE</span>
          </button>

          <span className="text-xs text-white/40 font-mono">
            {activeIndex + 1} / {STEPS.length}
          </span>

          <button
            onClick={nextCard}
            className="btn-cyber-primary flex items-center gap-2 py-2.5 px-6 text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <span>PHASE SUIVANTE</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Callout Banner */}
        <div className="p-4 bg-[#090c10] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#A4DE87] shrink-0" />
            <span>
              <strong className="text-white">PRÉCISION SUB-PIXEL :</strong> Chaque phase cible une composante isolée de ton jeu pour maximiser ton winrate.
            </span>
          </div>
          <span className="text-white/40 font-mono text-[11px]">
            CLIQUE SUR LES CARTES ARRIÈRE POUR LES FAIRE PASSER DEVANT
          </span>
        </div>
      </div>
    </section>
  );
}
