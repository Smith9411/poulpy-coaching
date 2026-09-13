"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Target, Dumbbell, TrendingUp, ChevronRight, CheckCircle2, Crosshair, ArrowRight, Sparkles, Layers, Shield } from "lucide-react";
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
  const [activeStep, setActiveStep] = useState<number>(0);

  return (
    <section id="methodology" className="py-32 px-6 sm:px-12 lg:px-16 bg-[#07090D] border-t border-[rgba(255,255,255,0.08)] font-mono relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#FF7582]/[0.03] blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="data-badge data-badge-acid">
                <DecryptedText text="OPTION 4 : L'ACCORDÉON TACTIQUE" />
              </span>
              <span className="text-xs text-white/40 font-mono flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#FF7582]" />
                VOLETS HORIZONTAUX COULISSANTS
              </span>
            </div>

            <h2 className="text-4xl sm:text-6xl font-display text-white tracking-wider">
              UNE MÉTHODE. PAS DE <span className="text-[#FF7582]">RECETTE MAGIQUE.</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/50 max-w-2xl leading-relaxed">
              Passe ton curseur ou clique sur les volets pour déployer instantanément les modules et analyser les étapes chirurgicales du coaching.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/60 bg-black/60 border border-white/10 px-3.5 py-2">
            <Sparkles className="w-4 h-4 text-[#FF7582]" />
            <span>SURVOLE OU CLIQUE UN VOLET</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* DESKTOP ACCORDION (HORIZONTAL PANELS) */}
        {/* ======================================================== */}
        <div className="hidden lg:flex gap-4 h-[460px] items-stretch">
          {STEPS.map((step, index) => {
            const isActive = activeStep === index;
            const Icon = step.icon;
            const isAcid = step.accent === "acid";

            return (
              <motion.div
                key={step.num}
                layout
                onClick={() => setActiveStep(index)}
                onMouseEnter={() => setActiveStep(index)}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 26,
                }}
                className={`relative cursor-pointer overflow-hidden border transition-colors duration-300 flex flex-col justify-between ${
                  isActive
                    ? "flex-[3.5] bg-[#0d1017] shadow-[0_0_40px_rgba(0,0,0,0.8)]"
                    : "flex-[1] bg-[#090c10] hover:bg-[#0c0f14]"
                } ${
                  isActive
                    ? isAcid
                      ? "border-[#FF7582] shadow-[0_0_30px_rgba(255,117,130,0.25)]"
                      : "border-[#8FAFD4] shadow-[0_0_30px_rgba(143,175,212,0.25)]"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                {/* Corner Brackets on active card */}
                {isActive && <CornerBrackets color={isAcid ? "coral" : "slate"} />}

                {/* ACTIVE VIEW CONTENT */}
                {isActive ? (
                  <motion.div
                    key="active-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="p-8 h-full flex flex-col justify-between space-y-6 select-none"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
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

                    {/* Middle Body */}
                    <div className="space-y-4 max-w-xl">
                      <div>
                        <span className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">
                          {step.tag}
                        </span>
                        <h3 className="text-3xl font-display text-white tracking-wider">
                          {step.title}
                        </h3>
                        <div className={`text-xs font-medium mt-1 ${isAcid ? "text-[#FF7582]" : "text-[#8FAFD4]"}`}>
                          {step.subtitle}
                        </div>
                      </div>

                      <p className="text-xs text-white/70 leading-relaxed">
                        {step.description}
                      </p>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        {step.metrics.map((m, idx) => (
                          <div key={idx} className="p-3 bg-black/60 border border-white/10">
                            <span className="text-[10px] text-white/40 block mb-0.5">{m.label}</span>
                            <strong className="text-white text-xs font-mono">{m.val}</strong>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer Callout */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                      <div className="flex items-center gap-2">
                        <Crosshair className="w-3.5 h-3.5 text-[#A4DE87]" />
                        <span className="text-[11px] text-white/70">VOLET DÉPLOYÉ & VÉRIFIÉ</span>
                      </div>
                      <a
                        href="#booking"
                        className={`flex items-center gap-1.5 font-bold uppercase tracking-wider text-xs transition-colors ${
                          isAcid ? "text-[#FF7582] hover:text-white" : "text-[#8FAFD4] hover:text-white"
                        }`}
                      >
                        <span>CHOISIR CE PROTOCOLE</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </motion.div>
                ) : (
                  /* COLLAPSED VIEW CONTENT */
                  <motion.div
                    key="collapsed-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-6 h-full flex flex-col items-center justify-between select-none"
                  >
                    {/* Top Phase Number */}
                    <div className="text-center space-y-1">
                      <span className="text-[10px] text-white/40 font-mono tracking-widest block">
                        PHASE
                      </span>
                      <span className="text-2xl font-display text-white/70">
                        {step.num}
                      </span>
                    </div>

                    {/* Center Vertical Title & Icon */}
                    <div className="flex flex-col items-center gap-6 my-auto py-4">
                      <div className="w-9 h-9 border border-white/10 bg-black/40 text-white/50 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div
                        className="text-xs font-display text-white/60 tracking-widest uppercase"
                        style={{
                          writingMode: "vertical-rl",
                          transform: "rotate(180deg)",
                        }}
                      >
                        {step.title}
                      </div>
                    </div>

                    {/* Bottom Status Dot */}
                    <div className="flex flex-col items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isAcid ? "bg-[#FF7582]/50" : "bg-[#8FAFD4]/50"}`} />
                      <span className="text-[9px] text-white/30 tracking-widest uppercase">VOIR</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* MOBILE / TABLET ACCORDION (VERTICAL PANELS) */}
        {/* ======================================================== */}
        <div className="lg:hidden space-y-4">
          {STEPS.map((step, index) => {
            const isActive = activeStep === index;
            const Icon = step.icon;
            const isAcid = step.accent === "acid";

            return (
              <div
                key={step.num}
                className={`border transition-all overflow-hidden ${
                  isActive
                    ? isAcid
                      ? "border-[#FF7582] bg-[#0d1017] shadow-[0_0_20px_rgba(255,117,130,0.15)]"
                      : "border-[#8FAFD4] bg-[#0d1017] shadow-[0_0_20px_rgba(143,175,212,0.15)]"
                    : "border-white/10 bg-[#090c10]"
                }`}
              >
                {/* Mobile Accordion Header */}
                <button
                  onClick={() => setActiveStep(isActive ? -1 : index)}
                  className="w-full p-5 flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-lg font-display ${isAcid ? "text-[#FF7582]" : "text-[#8FAFD4]"}`}>
                      {step.num}
                    </span>
                    <div>
                      <h3 className="text-base font-display text-white tracking-wider">
                        {step.title}
                      </h3>
                      <p className="text-[11px] text-white/40">{step.subtitle}</p>
                    </div>
                  </div>

                  <div className={`w-8 h-8 border flex items-center justify-center shrink-0 ${
                    isActive
                      ? isAcid ? "border-[#FF7582] text-[#FF7582]" : "border-[#8FAFD4] text-[#8FAFD4]"
                      : "border-white/10 text-white/40"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </button>

                {/* Mobile Expanded Body */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="px-5 pb-5 pt-2 border-t border-white/10 space-y-4"
                    >
                      <p className="text-xs text-white/70 leading-relaxed">
                        {step.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {step.metrics.map((m, idx) => (
                          <div key={idx} className="p-2.5 bg-black/60 border border-white/5 flex items-center justify-between text-xs">
                            <span className="text-white/40">{m.label} :</span>
                            <strong className="text-white font-mono">{m.val}</strong>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-[10px] text-white/40">{step.tag}</span>
                        <a
                          href="#booking"
                          className="text-xs text-[#FF7582] font-bold uppercase tracking-wider flex items-center gap-1"
                        >
                          <span>RÉSERVER CE MODULE</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Bottom Callout Banner */}
        <div className="p-4 bg-[#090c10] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#A4DE87] shrink-0" />
            <span>
              <strong className="text-white">PRÉCISION SUB-PIXEL :</strong> Chaque phase cible une composante isolée de ton jeu pour maximiser ton winrate.
            </span>
          </div>
          <a
            href="#booking"
            className="text-xs text-[#FF7582] hover:text-white font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 transition-colors"
          >
            <span>RÉSERVER CE PROTOCOLE</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
