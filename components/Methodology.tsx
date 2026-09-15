"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Target, Dumbbell, TrendingUp, ChevronRight, CheckCircle2, Crosshair, ArrowRight, Layers, Shield } from "lucide-react";
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
  statusLabel: string;
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
    statusLabel: "PHASE 01 : DIAGNOSTIC DU GAMEPLAY",
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
    statusLabel: "PHASE 02 : ANALYSE DES BLOCAGES",
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
    statusLabel: "PHASE 03 : CALIBRATION MÉCANIQUE",
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
    statusLabel: "PROTOCOLE VALIDÉ",
  },
];

// Single Sticky Stacking Card with Hover Spotlight & Corner Brackets
function ScrollStackCard({ step, index, total }: { step: StepData; index: number; total: number }) {
  const Icon = step.icon;
  const isAcid = step.accent === "acid";
  const isLast = index === total - 1;
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // Sticky top calculation for clean stacking offset
  const stickyTop = `calc(90px + ${index * 24}px)`;

  return (
    <div
      className="sticky mb-12 w-full will-change-transform"
      style={{
        top: stickyTop,
        zIndex: 10 + index,
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative max-w-4xl mx-auto p-6 sm:p-9 reticle-box bg-[#090C12] border transition-[border-color,background-color,box-shadow] duration-200 shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden select-none ${
          isHovered
            ? isAcid
              ? "border-[#FF7582] shadow-[0_0_35px_rgba(255,117,130,0.25)] bg-[#0d1017]"
              : "border-[#8FAFD4] shadow-[0_0_35px_rgba(143,175,212,0.25)] bg-[#0d1017]"
            : isAcid
            ? "border-[#FF7582]/40"
            : "border-[#8FAFD4]/40"
        }`}
      >
        {/* Corner Brackets */}
        <CornerBrackets color={isAcid ? "coral" : "slate"} />

        {/* Dynamic Spotlight on Hover */}
        {isHovered && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-200"
            style={{
              background: `radial-gradient(circle 300px at ${mousePos.x}% ${mousePos.y}%, ${
                isAcid ? "rgba(255, 117, 130, 0.14)" : "rgba(143, 175, 212, 0.14)"
              }, transparent 80%)`,
            }}
          />
        )}

        <div className="space-y-6 relative z-10">
          {/* Card Top Row */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                  isAcid ? "bg-[#FF7582] text-black" : "bg-[#8FAFD4] text-black"
                }`}
              >
                PHASE {step.num} / {total < 10 ? `0${total}` : total}
              </span>
              <span className="text-xs text-white/50 tracking-wider font-mono">
                {step.code}
              </span>
            </div>

            <div
              className={`w-11 h-11 border flex items-center justify-center ${
                isAcid
                  ? "border-[#FF7582]/40 text-[#FF7582] bg-[#FF7582]/10"
                  : "border-[#8FAFD4]/40 text-[#8FAFD4] bg-[#8FAFD4]/10"
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
          </div>

          {/* Main Card Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-3">
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

              <p className="text-xs text-white/70 leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Metrics column */}
            <div className="md:col-span-4 space-y-2.5">
              {step.metrics.map((m, idx) => (
                <div key={idx} className="p-3 bg-black/70 border border-white/10 flex flex-col justify-between">
                  <span className="text-[10px] text-white/40 uppercase font-mono">{m.label}</span>
                  <strong className="text-xs text-white font-mono mt-0.5">{m.val}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Card Footer ONLY on the last card (Phase 04) */}
          {isLast && (
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Crosshair className="w-3.5 h-3.5 text-[#A4DE87]" />
                <span className="text-[11px] font-mono tracking-wider font-bold text-[#A4DE87]">
                  PROTOCOLE VALIDÉ
                </span>
              </div>

              <a
                href="#booking"
                className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-xs text-[#FF7582] hover:text-white transition-colors"
              >
                <span>CHOISIR MON CRÉNEAU</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function Methodology() {
  return (
    <section id="methodology" className="py-24 px-6 sm:px-12 lg:px-16 bg-[#07090D] border-t border-[rgba(255,255,255,0.08)] font-mono relative">
      {/* Background ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#FF7582]/[0.03] blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-14 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="data-badge data-badge-acid">
                <DecryptedText text="MÉTHODOLOGIE D'ENTRAÎNEMENT" />
              </span>
              <span className="text-xs text-white/40 font-mono flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#FF7582]" />
                4 PHASES CHIRURGICALES
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-display text-white tracking-wider">
              UNE MÉTHODE. PAS DE <span className="text-[#FF7582]">RECETTE MAGIQUE.</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/50 max-w-2xl leading-relaxed">
              Chaque phase se verrouille et s&apos;empile naturellement pour révéler l&apos;intégralité de la stratégie.
            </p>
          </div>
        </div>

        {/* SCROLL STACKING CARDS LIST */}
        <div className="relative pt-4 pb-6 space-y-8">
          {STEPS.map((step, index) => (
            <ScrollStackCard
              key={step.num}
              step={step}
              index={index}
              total={STEPS.length}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
