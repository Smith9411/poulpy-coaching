"use client";

import React from "react";
import { Search, Target, Dumbbell, TrendingUp, ChevronRight } from "lucide-react";
import DecryptedText from "./DecryptedText";
import CornerBrackets from "./CornerBrackets";


export default function Methodology() {
  const steps = [
    {
      num: "01",
      code: "PHASE_ANALYSE",
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
    },
    {
      num: "02",
      code: "PHASE_IDENTIFICATION",
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
    },
    {
      num: "03",
      code: "PHASE_ROUTINES",
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
    },
    {
      num: "04",
      code: "PHASE_ASCENSION",
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
    },
  ];

  return (
    <section id="methodology" className="py-32 px-6 sm:px-12 lg:px-16 bg-[#07090D] border-t border-[rgba(255,255,255,0.08)] font-mono">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3">
            <span className="data-badge data-badge-acid">
              <DecryptedText text="PROCESSUS D'ACCOMPAGNEMENT // 04 PHASES" />
            </span>
            <h2 className="text-4xl sm:text-6xl font-display text-white tracking-wider">
              UNE MÉTHODE. PAS DE <span className="text-[#FF7582]">RECETTE MAGIQUE.</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/50 max-w-2xl leading-relaxed">
              Un processus structuré en 4 étapes clés pour garantir une progression constante, mesurable et durable sur le long terme.
            </p>
          </div>
        </div>

        {/* 4 Steps Grid — Spacious & Stable */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            const isAcid = step.accent === "acid";
            return (
              <div
                key={step.num}
                className={`group relative reticle-box ${
                  isAcid ? "" : "reticle-laser"
                } p-8 flex flex-col justify-between space-y-6 bg-[#090c10] border border-white/10 transition-all duration-300 hover:border-[#FF7582]/60 overflow-hidden`}
              >
                <CornerBrackets />
                <div className="space-y-6 relative z-10">
                  {/* Top Header */}
                  <div className="flex items-start justify-between border-b border-white/10 pb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#FF7582] font-bold tracking-widest uppercase">
                        {step.code}
                      </span>
                      <div className="glitch-text text-4xl sm:text-5xl font-display text-white">
                        {step.num}
                      </div>
                    </div>

                    <div
                      className={`w-12 h-12 border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                        isAcid
                          ? "border-[#FF7582]/40 text-[#FF7582] bg-[#FF7582]/5 group-hover:bg-[#FF7582]/20"
                          : "border-[#8FAFD4]/40 text-[#8FAFD4] bg-[#8FAFD4]/5 group-hover:bg-[#8FAFD4]/20"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-display text-white tracking-wider">
                      {step.title}
                    </h3>
                    <div className="text-[11px] text-[#FF7582] font-medium">
                      {step.subtitle}
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed pt-1">
                      {step.description}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-2 pt-4 border-t border-white/10 text-[11px]">
                    {step.metrics.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between text-white/50">
                        <span>{m.label} :</span>
                        <strong className="text-white font-mono">{m.val}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Tag */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40 group-hover:text-white transition-colors relative z-10">
                  <span>{step.tag}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#FF7582] transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
