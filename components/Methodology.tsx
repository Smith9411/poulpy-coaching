"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Target, Dumbbell, TrendingUp, Layers, CheckCircle2, ChevronRight, Shield, Zap, ArrowDown } from "lucide-react";
import DecryptedText from "./DecryptedText";
import CornerBrackets from "./CornerBrackets";

export default function Methodology() {
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);

  const steps = [
    {
      num: "01",
      code: "PHASE_01 // AUDIT CLINIQUE & CARTOGRAPHIE",
      icon: Search,
      title: "ANALYSE CLINIQUE DU GAMEPLAY",
      subtitle: "Diagnostic chirurgical de tes réflexes et de ta posture",
      description:
        "Étude exhaustive de tes replays et statistiques : nous décortiquons ta sensibilité eDPI (calibration cm/360), ton type de grip, ta posture physique, ton temps de réaction sub-pixel et tes choix de placement sous haute pression.",
      metrics: [
        { label: "Analyse VOD", val: "Frame par frame (60fps)" },
        { label: "Sensibilité & eDPI", val: "Calibration optimale cm/360" },
        { label: "Audit Matériel", val: "Tapis, grip, posture validés" },
        { label: "Temps d'audit", val: "Diagnostic initial 30 min" },
      ],
      tag: "AUDIT GLOBAL // POINT ZÉRO",
      accent: "laser",
      color: "#8FAFD4",
      bgGradient: "from-[#8FAFD4]/15 via-black to-[#090c10]",
      borderHighlight: "border-[#8FAFD4]/50 hover:border-[#8FAFD4]",
    },
    {
      num: "02",
      code: "PHASE_02 // ISOLATION DES FAIBLESSES",
      icon: Target,
      title: "IDENTIFICATION & CIBLAGE DES BLOCAGES",
      subtitle: "Isolation formelle des 3 freins qui bloquent ton rang",
      description:
        "Nous isolons précisément les micro-défauts invisibles à l'œil nu : micro-hésitation de visée lors des duels en mouvement, mauvais timing de contre-strafe, mauvaise lecture de map ou communication confuse en situation de clutch.",
      metrics: [
        { label: "Axes prioritaires", val: "3 blocages majeurs identifiés" },
        { label: "Score d'impact", val: "Hiérarchisation par priorité" },
        { label: "Clarté décisionnelle", val: "Objectifs nets immédiats" },
        { label: "Rapport", val: "Fiche d'axes sur-mesure" },
      ],
      tag: "CIBLAGE CHIRURGICAL // PRÉCISION",
      accent: "acid",
      color: "#FF7582",
      bgGradient: "from-[#FF7582]/15 via-black to-[#090c10]",
      borderHighlight: "border-[#FF7582]/50 hover:border-[#FF7582]",
    },
    {
      num: "03",
      code: "PHASE_03 // RECALIBRAGE & ROUTINES",
      icon: Dumbbell,
      title: "ENTRAÎNEMENT GUIDÉ & ROUTINES D'ÉLITE",
      subtitle: "Exercices pratiques quotidiens et conditionnement mécanique",
      description:
        "Mise en place de routines d'entraînement intensives personnalisées (KovaaK's / Aimlabs / Playlists dédiées), d'exercices de placement de réticule et de drills de crosshair placement automatisés adaptés à tes agents et cartes favorites.",
      metrics: [
        { label: "Temps quotidien", val: "20 min / jour de drill" },
        { label: "Playlists Aim", val: "100% calibrées à tes manques" },
        { label: "Exercices en jeu", val: "Drills pré-shoot & décalages" },
        { label: "Mémoire musculaire", val: "Automatisation sous 7 jours" },
      ],
      tag: "MÉCANIQUE PURE // DISCIPLINE",
      accent: "laser",
      color: "#8FAFD4",
      bgGradient: "from-[#8FAFD4]/15 via-black to-[#090c10]",
      borderHighlight: "border-[#8FAFD4]/50 hover:border-[#8FAFD4]",
    },
    {
      num: "04",
      code: "PHASE_04 // ASCENSION & VALIDATION",
      icon: TrendingUp,
      title: "MONTÉE EN RANG & SUIVI CONTINU",
      subtitle: "Mesure continue des gains et accompagnement privé 7j/7",
      description:
        "Évaluation continue de tes victoires et montée de rang après chaque session. Ajustement de ta stratégie, canal vocal privé Discord direct 7j/7 avec Poulpy et garantie formelle de franchir le rang sur lequel tu stagnais.",
      metrics: [
        { label: "Support Discord", val: "Canal privé direct 7j/7" },
        { label: "Garantie de palier", val: "Rank up sous 14 jours" },
        { label: "Suivi continu", val: "Débriefs vocaux réguliers" },
        { label: "Résultat garanti", val: "Progression mesurée & pérenne" },
      ],
      tag: "RÉSULTAT GARANTI // RANG VALIDÉ",
      accent: "acid",
      color: "#FF7582",
      bgGradient: "from-[#FF7582]/15 via-black to-[#090c10]",
      borderHighlight: "border-[#FF7582]/50 hover:border-[#FF7582]",
    },
  ];

  return (
    <section id="methodology" className="py-32 px-6 sm:px-12 lg:px-16 bg-[#07090D] border-t border-[rgba(255,255,255,0.08)] font-mono relative">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="data-badge data-badge-acid">
                <DecryptedText text="OPTION 2 : STACKING DECK // DOSSIER TACTIQUE" />
              </span>
              <span className="text-xs text-white/40 font-mono flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#FF7582]" />
                SUPERPOSITION AU DÉFILEMENT
              </span>
            </div>

            <h2 className="text-4xl sm:text-6xl font-display text-white tracking-wider">
              UNE MÉTHODE. PAS DE <span className="text-[#FF7582]">RECETTE MAGIQUE.</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/50 max-w-2xl leading-relaxed">
              Fais défiler la page pour découvrir les 4 phases du protocole qui s&apos;empilent comme les dossiers tactiques d&apos;une préparation e-sport pro.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/60 bg-black/60 border border-white/10 px-4 py-2">
            <ArrowDown className="w-4 h-4 text-[#FF7582] animate-bounce" />
            <span>SCROLLE POUR EMPILER LES DOSSIERS</span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            STACKING DECK CONTAINER : CARTES QUI SE SUPERPOSENT AU SCROLL
           ═══════════════════════════════════════════════════════════════ */}
        <div className="space-y-12 relative pb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isAcid = step.accent === "acid";
            // Sticky stacking offset: chaque carte s'arrête légèrement en dessous de la précédente
            const topOffset = 100 + index * 24;

            return (
              <div
                key={step.num}
                style={{
                  top: `${topOffset}px`,
                  zIndex: index + 1,
                }}
                className="sticky transition-all duration-300"
              >
                <div
                  className={`reticle-box bg-gradient-to-br ${step.bgGradient} border ${step.borderHighlight} p-8 sm:p-12 shadow-[0_-25px_60px_rgba(0,0,0,0.95)] relative overflow-hidden backdrop-blur-xl transition-all duration-300`}
                >
                  <CornerBrackets />

                  {/* Watermark Big Background Number */}
                  <div className="absolute right-4 -bottom-6 text-[120px] sm:text-[180px] font-display text-white/[0.03] select-none pointer-events-none tracking-tighter">
                    {step.num}
                  </div>

                  <div className="relative z-10 space-y-8">
                    {/* Header bar of the card */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-3 py-1 uppercase tracking-widest ${
                          isAcid
                            ? "bg-[#FF7582] text-black"
                            : "bg-[#8FAFD4] text-black"
                        }`}>
                          ÉTAPE {step.num}
                        </span>
                        <span className="text-xs text-white/50 font-mono tracking-wider">
                          {step.code}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest hidden sm:inline">
                          PHASE ACTIVE
                        </span>
                        <div className={`w-2.5 h-2.5 ${isAcid ? "bg-[#FF7582]" : "bg-[#8FAFD4]"} animate-pulse`} />
                      </div>
                    </div>

                    {/* Main content grid: Left Title & Description, Right Metrics */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      {/* Left: Icon, Title, Description */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-14 h-14 border flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(0,0,0,0.5)] ${
                              isAcid
                                ? "border-[#FF7582]/40 text-[#FF7582] bg-[#FF7582]/10"
                                : "border-[#8FAFD4]/40 text-[#8FAFD4] bg-[#8FAFD4]/10"
                            }`}
                          >
                            <Icon className="w-7 h-7" />
                          </div>
                          <div>
                            <h3 className="text-2xl sm:text-3xl font-display text-white tracking-wider">
                              {step.title}
                            </h3>
                            <div className={`text-xs font-medium ${isAcid ? "text-[#FF7582]" : "text-[#8FAFD4]"}`}>
                              {step.subtitle}
                            </div>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-white/70 leading-relaxed pt-2">
                          {step.description}
                        </p>

                        <div className="pt-2 flex items-center gap-2 text-xs text-white/40">
                          <span className="w-1.5 h-1.5 bg-white/30" />
                          <span>{step.tag}</span>
                        </div>
                      </div>

                      {/* Right: Key Metrics Grid */}
                      <div className="lg:col-span-5 bg-black/70 border border-white/10 p-5 space-y-3">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                          <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">
                            INDICATEURS DE CETTE PHASE
                          </span>
                          <span className={`text-[10px] font-bold ${isAcid ? "text-[#FF7582]" : "text-[#8FAFD4]"}`}>
                            LIVRABLE
                          </span>
                        </div>

                        <div className="space-y-2.5 text-xs">
                          {step.metrics.map((m, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 bg-white/[0.02] border border-white/5"
                            >
                              <span className="text-white/60 text-[11px]">{m.label} :</span>
                              <strong className="text-white font-mono text-xs">{m.val}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Step Progression Breadcrumb */}
                    <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        {steps.map((s, i) => (
                          <div
                            key={s.num}
                            className={`px-2 py-0.5 text-[10px] border ${
                              i === index
                                ? isAcid ? "border-[#FF7582] bg-[#FF7582] text-black font-bold" : "border-[#8FAFD4] bg-[#8FAFD4] text-black font-bold"
                                : i < index
                                ? "border-white/20 bg-white/10 text-white/60"
                                : "border-white/5 text-white/20"
                            }`}
                          >
                            P{s.num}
                          </div>
                        ))}
                      </div>

                      <a
                        href="#booking"
                        className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                          isAcid ? "text-[#FF7582] hover:text-white" : "text-[#8FAFD4] hover:text-white"
                        }`}
                      >
                        <span>RÉSERVER CETTE FORMULE</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Callout Banner */}
        <div className="p-6 bg-[#090c10] border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/70">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#A4DE87] shrink-0" />
            <div>
              <div className="font-bold text-white uppercase tracking-wider">MÉTHODOLOGIE APPROUVÉE EN COMPÉTITION</div>
              <div className="text-[11px] text-white/50">Plus de 150 joueurs accompagnés du rang Silver jusqu&apos;à Radiant / Predator.</div>
            </div>
          </div>
          <a
            href="#booking"
            className="btn-cyber-primary py-2.5 px-6 text-xs uppercase font-bold shrink-0"
          >
            <span>DÉMARRER MON COACHING</span>
          </a>
        </div>
      </div>
    </section>
  );
}
