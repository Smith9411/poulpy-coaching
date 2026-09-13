"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Target, Dumbbell, TrendingUp, ChevronRight, Zap, Activity, ArrowRight, CheckCircle2 } from "lucide-react";
import DecryptedText from "./DecryptedText";
import CornerBrackets from "./CornerBrackets";

export default function Methodology() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      num: "01",
      code: "PHASE_01 // DIAGNOSTIC",
      icon: Search,
      title: "ANALYSE CLINIQUE",
      subtitle: "Diagnostic complet de ton gameplay",
      description:
        "Étude chirurgicale de tes statistiques, de ta sensibilité eDPI, de ton matériel (grip, posture) et de ta prise de décision en match pour cartographier tes réflexes.",
      metrics: [
        { label: "Analyse VOD", val: "Image par image" },
        { label: "Sensibilité", val: "Calibration cm/360" },
      ],
      tag: "AUDIT GLOBAL",
      accent: "laser",
      color: "#8FAFD4",
    },
    {
      num: "02",
      code: "PHASE_02 // CIBLAGE",
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
      code: "PHASE_03 // ENTRAÎNEMENT",
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
      code: "PHASE_04 // ASCENSION",
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

  return (
    <section id="methodology" className="py-32 px-6 sm:px-12 lg:px-16 bg-[#07090D] border-t border-[rgba(255,255,255,0.08)] font-mono relative overflow-hidden">
      {/* Background ambient grid flow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(255,117,130,0.06),transparent)] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="data-badge data-badge-acid">
                <DecryptedText text="OPTION 1 : TIMELINE CIRCUIT D'ARMEMENT" />
              </span>
              <span className="text-xs text-white/40 font-mono flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#FF7582] animate-pulse" />
                FLUX LINÉAIRE CONTINU
              </span>
            </div>

            <h2 className="text-4xl sm:text-6xl font-display text-white tracking-wider">
              UNE MÉTHODE. PAS DE <span className="text-[#FF7582]">RECETTE MAGIQUE.</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/50 max-w-2xl leading-relaxed">
              Un circuit tactique en 4 phases successives et interconnectées pour transformer tes mécaniques et sécuriser ta montée en grade.
            </p>
          </div>

          {/* Interactive Step Quick Tracker */}
          <div className="hidden lg:flex items-center gap-2 text-xs">
            {steps.map((s, i) => (
              <button
                key={s.num}
                onClick={() => setActiveStep(activeStep === i ? null : i)}
                className={`px-3 py-1 border transition-all cursor-pointer font-mono text-[11px] ${
                  activeStep === i
                    ? "border-[#FF7582] bg-[#FF7582] text-black font-bold shadow-[0_0_12px_rgba(255,117,130,0.4)]"
                    : "border-white/15 bg-black/60 text-white/60 hover:text-white hover:border-white/30"
                }`}
              >
                PHASE {s.num}
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            CIRCUIT D'ARMEMENT : TIMELINE AVEC LIGNE D'ÉNERGIE CONNECTÉE
           ═══════════════════════════════════════════════════════════════ */}
        <div className="relative">
          {/* Ligne de faisceau continue sur Desktop */}
          <div className="hidden lg:block absolute top-[28px] left-[5%] right-[5%] h-[2px] bg-white/10 z-0">
            {/* Rayon d'impulsion énergétique en flux continu */}
            <motion.div
              animate={{
                x: ["-100%", "200%"],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 3.5,
                ease: "easeInOut",
              }}
              className="w-1/3 h-full bg-gradient-to-r from-transparent via-[#FF7582] to-transparent shadow-[0_0_15px_#FF7582]"
            />
          </div>

          {/* Grille des 4 étapes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isAcid = step.accent === "acid";
              const isHighlighted = activeStep === index;

              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.15,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                  onMouseEnter={() => setActiveStep(index)}
                  onMouseLeave={() => setActiveStep(null)}
                  className={`group relative reticle-box ${
                    isAcid ? "" : "reticle-laser"
                  } p-7 flex flex-col justify-between space-y-6 bg-[#090c10] border transition-all duration-300 ${
                    isHighlighted
                      ? "border-[#FF7582] shadow-[0_0_35px_rgba(255,117,130,0.25)] -translate-y-2 bg-[#0d1017]"
                      : "border-white/10 hover:border-[#FF7582]/60 hover:-translate-y-1"
                  }`}
                >
                  <CornerBrackets />

                  {/* Top Connector Node */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 relative">
                    {/* Node Circle Indicator */}
                    <div className="flex items-center gap-2.5">
                      <div className={`w-3.5 h-3.5 rounded-none border flex items-center justify-center transition-all duration-300 ${
                        isHighlighted
                          ? "border-[#FF7582] bg-[#FF7582] shadow-[0_0_12px_#FF7582]"
                          : "border-white/30 bg-black group-hover:border-[#FF7582]"
                      }`}>
                        <div className={`w-1.5 h-1.5 ${isHighlighted ? "bg-black" : "bg-[#FF7582] animate-pulse"}`} />
                      </div>
                      <span className="text-[10px] text-white/50 font-mono uppercase tracking-widest">
                        {step.code}
                      </span>
                    </div>

                    {/* Step Big Number */}
                    <div className="text-3xl sm:text-4xl font-display text-white group-hover:text-[#FF7582] transition-colors">
                      {step.num}
                    </div>
                  </div>

                  {/* Icon & Title */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                          isAcid
                            ? "border-[#FF7582]/40 text-[#FF7582] bg-[#FF7582]/10 group-hover:bg-[#FF7582]/25"
                            : "border-[#8FAFD4]/40 text-[#8FAFD4] bg-[#8FAFD4]/10 group-hover:bg-[#8FAFD4]/25"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-display text-white tracking-wider leading-tight">
                          {step.title}
                        </h3>
                        <div className="text-[11px] text-[#FF7582] font-medium leading-snug">
                          {step.subtitle}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-white/60 leading-relaxed pt-1">
                      {step.description}
                    </p>
                  </div>

                  {/* Metrics with Linear Circuit Bars */}
                  <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs">
                    {step.metrics.map((m, idx) => (
                      <div key={idx} className="p-2 bg-black/60 border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-white/50">{m.label} :</span>
                          <strong className="text-white font-mono">{m.val}</strong>
                        </div>
                        {/* Technical mini progress line */}
                        <div className="w-full h-1 bg-white/5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: "100%" }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: index * 0.2 + idx * 0.1 }}
                            className={`h-full ${isAcid ? "bg-[#FF7582]" : "bg-[#8FAFD4]"}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Connection Arrow */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40 group-hover:text-white transition-colors relative z-10">
                    <span className="tracking-wider">{step.tag}</span>
                    <div className="flex items-center gap-1 text-[#FF7582] font-bold">
                      <span className="text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        ACTIF
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Flow Summary Banner */}
        <div className="p-4 bg-[#090c10] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#A4DE87] shrink-0" />
            <span>
              <strong className="text-white">PROTOCOLE EN CONTINU :</strong> Chaque étape débloque les analyses nécessaires à la phase suivante sans interruption.
            </span>
          </div>
          <a
            href="#booking"
            className="text-xs text-[#FF7582] hover:text-white font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 transition-colors"
          >
            <span>DÉMARRER LA PHASE 01</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
