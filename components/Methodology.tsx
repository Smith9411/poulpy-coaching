"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Target, Dumbbell, TrendingUp, ChevronRight, ChevronLeft, CheckCircle2, Crosshair, ArrowRight, Sparkles, Terminal, Activity, Play, Pause } from "lucide-react";
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
  telemetry: string;
}

const STEPS: StepData[] = [
  {
    num: "01",
    code: "DIAGNOSTIC // PROTOCOL_01",
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
    telemetry: "SIGNAL ACQUIRED // 60 FPS RECORDING // TELEMETRY OK",
  },
  {
    num: "02",
    code: "TARGETING // PROTOCOL_02",
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
    telemetry: "BOTTLENECK DETECTED // ERROR RATE -34% ON PEEKING",
  },
  {
    num: "03",
    code: "DRILLS // PROTOCOL_03",
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
    telemetry: "WORKOUT LOAD 100% // TIME-TO-KILL REDUCED BY 120MS",
  },
  {
    num: "04",
    code: "ASCENT // PROTOCOL_04",
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
    telemetry: "WINRATE BOOST +18% // TIER PROGRESSION CONFIRMED",
  },
];

export default function Methodology() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const current = STEPS[activeStep];
  const Icon = current.icon;
  const isAcid = current.accent === "acid";

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
                <DecryptedText text="OPTION 5 : LE PIPELINE TACTIQUE SÉQUENTIEL" />
              </span>
              <span className="text-xs text-white/40 font-mono flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#FF7582]" />
                CONSOLE DE BRIEFING PAR ÉTAPES
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-display text-white tracking-wider">
              UNE MÉTHODE. PAS DE <span className="text-[#FF7582]">RECETTE MAGIQUE.</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/50 max-w-2xl leading-relaxed">
              Navigue à travers le pipeline d&apos;entraînement pas-à-pas pour découvrir la précision millimétrée de chaque étape.
            </p>
          </div>

          {/* Autoplay toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`px-3 py-1.5 text-xs font-bold border transition-colors flex items-center gap-2 cursor-pointer ${
                autoPlay
                  ? "border-[#FF7582] bg-[#FF7582]/15 text-[#FF7582]"
                  : "border-white/15 bg-black/60 text-white/50 hover:text-white"
              }`}
            >
              {autoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{autoPlay ? "DÉFILEMENT AUTO ACTIF" : "AUTO-DÉFILEMENT"}</span>
            </button>
          </div>
        </div>

        {/* STEPPER PROGRESS BAR PIPELINE */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STEPS.map((step, idx) => {
            const isSelected = activeStep === idx;
            const isPassed = activeStep > idx;
            const stepAcid = step.accent === "acid";

            return (
              <button
                key={step.num}
                onClick={() => {
                  setActiveStep(idx);
                  setAutoPlay(false);
                }}
                className={`relative p-4 border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? stepAcid
                      ? "border-[#FF7582] bg-[#FF7582]/10 shadow-[0_0_20px_rgba(255,117,130,0.2)]"
                      : "border-[#8FAFD4] bg-[#8FAFD4]/10 shadow-[0_0_20px_rgba(143,175,212,0.2)]"
                    : "border-white/10 bg-[#090c10] hover:border-white/30 text-white/60"
                }`}
              >
                {/* Top Number & Tag */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold font-mono ${
                    isSelected ? (stepAcid ? "text-[#FF7582]" : "text-[#8FAFD4]") : "text-white/40"
                  }`}>
                    PHASE {step.num}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${
                    isSelected ? (stepAcid ? "bg-[#FF7582] animate-pulse" : "bg-[#8FAFD4] animate-pulse") : isPassed ? "bg-white/40" : "bg-white/10"
                  }`} />
                </div>

                <div className="text-sm font-display tracking-wider text-white truncate">
                  {step.title}
                </div>

                <div className="text-[10px] text-white/40 truncate mt-0.5">
                  {step.tag}
                </div>

                {/* Active Indicator Line */}
                {isSelected && (
                  <motion.div
                    layoutId="active-stepper-line"
                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${stepAcid ? "bg-[#FF7582]" : "bg-[#8FAFD4]"}`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* MAIN COMMAND CONSOLE */}
        <div className="reticle-box p-6 sm:p-10 bg-[#090c10] border border-white/20 relative shadow-[0_0_40px_rgba(0,0,0,0.8)]">
          <CornerBrackets color={isAcid ? "coral" : "slate"} />

          <AnimatePresence mode="wait">
            <motion.div
              key={current.num}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              {/* Left Column: Visual Telemetry Screen (5 cols) */}
              <div className="lg:col-span-5 p-6 bg-black/80 border border-white/10 space-y-6 flex flex-col justify-between h-full">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-[10px] text-white/50 tracking-widest font-mono">
                      {current.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest ${
                      isAcid ? "bg-[#FF7582] text-black" : "bg-[#8FAFD4] text-black"
                    }`}>
                      {current.tag}
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-5xl sm:text-6xl font-display text-white tracking-wider">
                      {current.num}
                    </span>
                    <div className={`w-14 h-14 border flex items-center justify-center ${
                      isAcid ? "border-[#FF7582]/40 text-[#FF7582] bg-[#FF7582]/10" : "border-[#8FAFD4]/40 text-[#8FAFD4] bg-[#8FAFD4]/10"
                    }`}>
                      <Icon className="w-7 h-7" />
                    </div>
                  </div>
                </div>

                {/* Animated Telemetry Signal Box */}
                <div className="p-3.5 bg-[#07090D] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-white/40">
                    <span className="flex items-center gap-1.5">
                      <Activity className={`w-3.5 h-3.5 ${isAcid ? "text-[#FF7582]" : "text-[#8FAFD4]"}`} />
                      TÉLÉMÉTRIE EN DIRECT
                    </span>
                    <span className="text-[#A4DE87] font-bold">ACTIF</span>
                  </div>
                  <div className="text-[11px] text-white/80 font-mono tracking-tight bg-black/40 p-2 border border-white/5">
                    &gt; {current.telemetry}
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Execution Briefing (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest block font-mono">
                    MODULE OPÉRATIONNEL DÉPLOYÉ
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-display text-white tracking-wider">
                    {current.title}
                  </h3>
                  <div className={`text-xs font-semibold ${isAcid ? "text-[#FF7582]" : "text-[#8FAFD4]"}`}>
                    {current.subtitle}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  {current.description}
                </p>

                {/* Metrics Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {current.metrics.map((m, idx) => (
                    <div key={idx} className="p-3 bg-black/60 border border-white/10 flex items-center justify-between">
                      <span className="text-[11px] text-white/50">{m.label} :</span>
                      <strong className="text-xs text-white font-mono">{m.val}</strong>
                    </div>
                  ))}
                </div>

                {/* Navigation Bar */}
                <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      disabled={activeStep === 0}
                      onClick={() => {
                        setActiveStep((prev) => Math.max(0, prev - 1));
                        setAutoPlay(false);
                      }}
                      className="px-3.5 py-2 border border-white/15 bg-black/60 text-xs text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-white/40 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>PRÉCÉDENT</span>
                    </button>

                    <button
                      disabled={activeStep === STEPS.length - 1}
                      onClick={() => {
                        setActiveStep((prev) => Math.min(STEPS.length - 1, prev + 1));
                        setAutoPlay(false);
                      }}
                      className="px-3.5 py-2 border border-white/15 bg-black/60 text-xs text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-white/40 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>SUIVANT</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <a
                    href="#booking"
                    className="btn-cyber-primary py-2.5 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                  >
                    <span>RÉSERVER CETTE FORMULE</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Callout Banner */}
        <div className="p-4 bg-[#090c10] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#A4DE87] shrink-0" />
            <span>
              <strong className="text-white">PROTOCOLE VALIDÉ :</strong> Chaque phase cible une composante isolée de ton jeu pour maximiser ton winrate.
            </span>
          </div>
          <span className="text-white/40 font-mono text-[11px]">
            ÉTAPE {activeStep + 1} SUR {STEPS.length}
          </span>
        </div>
      </div>
    </section>
  );
}
