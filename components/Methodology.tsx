"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Target, Dumbbell, TrendingUp, Crosshair, ChevronRight, CheckCircle2, Shield, Eye, Zap, Sparkles } from "lucide-react";
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

// Interactive 3D Tilt HUD Card Component
function HudTiltCard({ step, index }: { step: StepData; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const Icon = step.icon;
  const isAcid = step.accent === "acid";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    // Angle d'inclinaison 3D physique
    const rotX = ((y - rect.height / 2) / (rect.height / 2)) * -14;
    const rotY = ((x - rect.width / 2) / (rect.width / 2)) * 14;

    setRotate({ x: rotX, y: rotY });
    setMousePos({ x: percentX, y: percentY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="perspective-1000 h-full"
      style={{ perspective: "1200px" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        animate={{
          rotateX: rotate.x,
          rotateY: rotate.y,
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        style={{ transformStyle: "preserve-3d" }}
        className={`relative h-full p-7 flex flex-col justify-between space-y-6 bg-[#090c10] border transition-colors duration-200 overflow-hidden select-none ${
          isHovered
            ? isAcid
              ? "border-[#FF7582] shadow-[0_0_35px_rgba(255,117,130,0.3)] bg-[#0d1017]"
              : "border-[#8FAFD4] shadow-[0_0_35px_rgba(143,175,212,0.3)] bg-[#0d1017]"
            : "border-white/10"
        }`}
      >
        {/* Dynamic Specular Light Follower (Spotlight) */}
        {isHovered && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-200"
            style={{
              background: `radial-gradient(circle 240px at ${mousePos.x}% ${mousePos.y}%, ${
                isAcid ? "rgba(255, 117, 130, 0.18)" : "rgba(143, 175, 212, 0.18)"
              }, transparent 80%)`,
            }}
          />
        )}

        {/* HUD Targeting Reticle overlay when hovered */}
        <div
          className={`absolute top-3 right-3 text-[10px] font-mono tracking-widest flex items-center gap-1 transition-opacity duration-200 ${
            isHovered ? "opacity-100 text-[#FF7582]" : "opacity-0"
          }`}
        >
          <Crosshair className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "6s" }} />
          <span>LOCKED</span>
        </div>

        {/* Corner HUD Brackets */}
        <div
          className={`absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 transition-colors ${
            isHovered ? (isAcid ? "border-[#FF7582]" : "border-[#8FAFD4]") : "border-white/20"
          }`}
        />
        <div
          className={`absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 transition-colors ${
            isHovered ? (isAcid ? "border-[#FF7582]" : "border-[#8FAFD4]") : "border-white/20"
          }`}
        />
        <div
          className={`absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 transition-colors ${
            isHovered ? (isAcid ? "border-[#FF7582]" : "border-[#8FAFD4]") : "border-white/20"
          }`}
        />
        <div
          className={`absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 transition-colors ${
            isHovered ? (isAcid ? "border-[#FF7582]" : "border-[#8FAFD4]") : "border-white/20"
          }`}
        />

        {/* 3D Elevated Content Layer */}
        <div className="space-y-6 relative z-10" style={{ transform: "translateZ(25px)" }}>
          {/* Top Header */}
          <div className="flex items-start justify-between border-b border-white/10 pb-4">
            <div className="space-y-1">
              <span className="text-[10px] text-[#FF7582] font-bold tracking-widest uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#FF7582] animate-pulse" />
                {step.code}
              </span>
              <div className="text-4xl sm:text-5xl font-display text-white tracking-wider">
                {step.num}
              </div>
            </div>

            <div
              className={`w-12 h-12 border flex items-center justify-center transition-transform duration-300 ${
                isHovered ? "scale-110" : ""
              } ${
                isAcid
                  ? "border-[#FF7582]/40 text-[#FF7582] bg-[#FF7582]/10"
                  : "border-[#8FAFD4]/40 text-[#8FAFD4] bg-[#8FAFD4]/10"
              }`}
              style={{ transform: "translateZ(40px)" }}
            >
              <Icon className="w-6 h-6" />
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h3 className="text-xl font-display text-white tracking-wider">
              {step.title}
            </h3>
            <div className={`text-[11px] font-medium ${isAcid ? "text-[#FF7582]" : "text-[#8FAFD4]"}`}>
              {step.subtitle}
            </div>
            <p className="text-xs text-white/60 leading-relaxed pt-1">
              {step.description}
            </p>
          </div>

          {/* Metrics Box */}
          <div
            className="space-y-2 pt-4 border-t border-white/10 text-xs"
            style={{ transform: "translateZ(20px)" }}
          >
            {step.metrics.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-2 transition-colors ${
                  isHovered ? "bg-black/80 border border-white/10" : "bg-black/40 border border-white/5"
                }`}
              >
                <span className="text-white/50 text-[11px]">{m.label} :</span>
                <strong className="text-white font-mono">{m.val}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Tag */}
        <div
          className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40 group-hover:text-white transition-colors relative z-10"
          style={{ transform: "translateZ(15px)" }}
        >
          <span className="tracking-wider">{step.tag}</span>
          <div className="flex items-center gap-1">
            <span className={`text-[9px] uppercase font-bold ${isHovered ? "text-[#FF7582]" : "text-white/30"}`}>
              {isHovered ? "INTERACTION HUD" : "PHASE OK"}
            </span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isHovered ? "translate-x-1 text-[#FF7582]" : "text-white/30"}`} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Methodology() {
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
                <DecryptedText text="OPTION 3 : RÉTICULE HUD & 3D TILT" />
              </span>
              <span className="text-xs text-white/40 font-mono flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-[#FF7582]" />
                INCLINAISON 3D &amp; CIBLAGE SOURIS
              </span>
            </div>

            <h2 className="text-4xl sm:text-6xl font-display text-white tracking-wider">
              UNE MÉTHODE. PAS DE <span className="text-[#FF7582]">RECETTE MAGIQUE.</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/50 max-w-2xl leading-relaxed">
              Passe ton curseur sur les cartes pour ressentir la physique 3D et le ciblage optique de chaque phase de ton entraînement.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/60 bg-black/60 border border-white/10 px-3.5 py-2">
            <Sparkles className="w-4 h-4 text-[#FF7582]" />
            <span>SURVOLE LES CARTES AVEC TA SOURIS</span>
          </div>
        </div>

        {/* 4 Cards Grid with 3D Tilt HUD */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, index) => (
            <HudTiltCard key={step.num} step={step} index={index} />
          ))}
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
