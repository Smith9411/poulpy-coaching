"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Target,
  Dumbbell,
  TrendingUp,
  ArrowRight,
  Tv,
  Crosshair,
  BarChart3,
  FileSpreadsheet,
  Users,
  ShieldAlert,
  Zap,
  Flame,
} from "lucide-react";

type MethodPlan = "diagnostic" | "ranked" | "pro";

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

interface PlanConfig {
  id: MethodPlan;
  name: string;
  priceTag: string;
  bookingTarget: string;
  accentColor: string;
  intro: string;
  steps: StepData[];
}

const PLANS: Record<MethodPlan, PlanConfig> = {
  diagnostic: {
    id: "diagnostic",
    name: "SESSION DIAGNOSTIC",
    priceTag: "GRATUIT",
    bookingTarget: "#booking",
    accentColor: "#CA1C30",
    intro:
      "Une session de mise en bouche, pour vous comme pour moi. Elle vous permet de tester ma façon de fonctionner tout en vérifiant que le feeling passe. De mon côté, elle me permet de vous découvrir afin de préparer la suite et d'adapter mes méthodes à votre profil.",
    steps: [
      {
        num: "01",
        code: "DISCOVERY // LIVE_STREAM",
        icon: Tv,
        title: "1H DE VOD REVIEW EN LIVE",
        subtitle: "Session découverte & diagnostic en direct sur Twitch",
        description:
          "Le coaching sera fait en live afin de partager mon analyse à la communauté. Vous pourrez retrouver les VODs sur ma chaîne Twitch et des vidéos sur mon YouTube des coachings.",
        metrics: [
          { label: "Format", val: "1h en direct sur Twitch" },
          { label: "Rediffusion", val: "VODs Twitch & Best-of YouTube" },
          { label: "Objectif", val: "Tester le feeling & la méthode" },
          { label: "Accès", val: "100% Gratuit & interactif" },
        ],
        tag: "COMMUNAUTÉ // 01",
        accent: "acid",
        color: "#CA1C30",
      },
      {
        num: "02",
        code: "AUDIT // GAME_BREAKDOWN",
        icon: Crosshair,
        title: "IDENTIFICATION DES ERREURS CLÉS",
        subtitle: "Déroulé round par round & recherche de solutions",
        description:
          "Pendant cette session on déroule une game round par round pour identifier les erreurs et donner des solutions. Le coaching est interactif : je mettrai le chat et le profil coaché à contribution pour trouver les solutions et permettre une réelle progression.",
        metrics: [
          { label: "Méthode", val: "Déroulé complet round par round" },
          { label: "Interactivité", val: "Joueur & chat mis à contribution" },
          { label: "Pédagogie", val: "Solutions concrètes & applicables" },
          { label: "Impact", val: "Prise de recul immédiate sur les erreurs" },
        ],
        tag: "INTERACTION DIRECTE // 02",
        accent: "acid",
        color: "#CA1C30",
      },
      {
        num: "03",
        code: "DATA // TRACKER_DECODE",
        icon: BarChart3,
        title: "ANALYSE DU TRACKER",
        subtitle: "Détection des anomalies statistiques globales",
        description:
          "Le tracker me permettra d'identifier les problèmes globaux dans votre gameplay et de vous donner des pistes sur comment les corriger. Il me sert aussi à rédiger la fiche de suivi perso si vous décidez de me faire confiance et de continuer les séances.",
        metrics: [
          { label: "Audit stats", val: "Tracker Valorant / Apex complet" },
          { label: "Diagnostic", val: "Détection des faiblesses récurrentes" },
          { label: "Pistes d'action", val: "Recommandations correctives ciblées" },
          { label: "Préparation", val: "Fondation de la fiche de suivi perso" },
        ],
        tag: "DATA STATISTIQUE // 03",
        accent: "laser",
        color: "#00B4A0",
      },
      {
        num: "04",
        code: "COCKPIT // PERSONAL_SHEET",
        icon: FileSpreadsheet,
        title: "CRÉATION D'UNE FICHE PERSO",
        subtitle: "Fiche de suivi sur-mesure (si suivi approfondi)",
        description:
          "La fiche de suivi est au cœur de mes méthodes de coaching. Elle vous permet de suivre votre progression quand vous le souhaitez, d'avoir toujours vos objectifs à portée de main et d'avoir un résumé de chacune des sessions pour ne jamais refaire les mêmes erreurs. Elle me permet de vous transmettre objectifs, routines, vidéos directement sur le site et d'adapter en continu mes interventions.",
        metrics: [
          { label: "Espace élève", val: "Cockpit accessible sur le site" },
          { label: "Livrables", val: "Objectifs, routines & résumés complets" },
          { label: "Ressources", val: "Vidéos privées & drills dédiés" },
          { label: "Évolution", val: "Méthodes adaptées à votre profil" },
        ],
        tag: "SUIVI SUR-MESURE // 04",
        accent: "acid",
        color: "#CA1C30",
      },
    ],
  },
  ranked: {
    id: "ranked",
    name: "COACHING RANKED",
    priceTag: "10 €",
    bookingTarget: "#booking",
    accentColor: "#CA1C30",
    intro: "",
    steps: [
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
    ],
  },
  pro: {
    id: "pro",
    name: "COACHING PRO",
    priceTag: "20 €",
    bookingTarget: "#booking",
    accentColor: "#00B4A0",
    intro: "",
    steps: [
      {
        num: "01",
        code: "ELITE // POOL_AND_META",
        icon: Users,
        title: "AUDIT COMPÉTITIF & POOL D'AGENTS",
        subtitle: "Synergies méta, rôle en équipe & macro",
        description:
          "Analyse chirurgicale de votre agent pool, maîtrise des synergies d'équipe et calibrage des responsabilités individuelles selon la méta compétitive actuelle.",
        metrics: [
          { label: "Agent Pool", val: "Optimisation de l'arbre de picks" },
          { label: "Rôle en équipe", val: "Définition stricte des prérogatives" },
          { label: "Méta analysis", val: "Adaptation aux drafts & comps pros" },
          { label: "Diagnostic d'entrée", val: "Cartographie des failles macro" },
        ],
        tag: "MACRO & ÉQUIPE // 01",
        accent: "laser",
        color: "#00B4A0",
      },
      {
        num: "02",
        code: "ELITE // PRACCS_SCRIMS",
        icon: ShieldAlert,
        title: "ANALYSE DE PRACCS & SCRIMS",
        subtitle: "Décryptage d'équipe, exécutions & retakes",
        description:
          "Décomposition méticuleuse des VODs de scrims et de tournois. Analyse de la hiérarchie des communications d'urgence, des synchronisations utilitaires et des protocoles de retake.",
        metrics: [
          { label: "Comms audit", val: "Clarté, débit & hiérarchie vocale" },
          { label: "Exec & Retakes", val: "Synchronisation des timings utility" },
          { label: "Adaptabilité", val: "Ajustements intra-round en temps réel" },
          { label: "Livrable", val: "Rapport tactique pour l'équipe / joueur" },
        ],
        tag: "TACTIQUE D'ÉQUIPE // 02",
        accent: "laser",
        color: "#00B4A0",
      },
      {
        num: "03",
        code: "ELITE // WIN_CONDITIONS",
        icon: Zap,
        title: "WIN CONDITIONS & CLUTCH",
        subtitle: "Micro-décisions sous pression & sang-froid",
        description:
          "Conditionnement à la lecture instantanée des conditions de victoire dans les rounds charnières. Maîtrise des situations de clutch (1vX), manipulation du chrono et isolement des duels.",
        metrics: [
          { label: "Clutch mastery", val: "Isolement systématique des 1v1" },
          { label: "Win-Conditions", val: "Identification instantanée du round lever" },
          { label: "Gestion de l'éco", val: "Optimisation des ultis & force-buys" },
          { label: "Sang-froid", val: "Prise de décision sous haute tension" },
        ],
        tag: "CLUTCH MASTERY // 03",
        accent: "acid",
        color: "#CA1C30",
      },
      {
        num: "04",
        code: "ELITE // MENTAL_LEAD",
        icon: Flame,
        title: "CONDITIONNEMENT & MENTAL LEAD",
        subtitle: "Résilience en tournoi, préparation mentale & suivi continu",
        description:
          "Développement du leadership vocal et de la cohésion sous stress de match. Protocoles anti-tilt, routines d'échauffement pré-match et accompagnement personnalisé entre les tournois.",
        metrics: [
          { label: "Résilience mentale", val: "Protocoles anti-tilt & reset express" },
          { label: "Routine tournoi", val: "Activation neuromusculaire d'avant-match" },
          { label: "Vocal lead", val: "Impact psychologique & leadership" },
          { label: "Suivi continu", val: "Débriefing post-matchs & hotline Discord" },
        ],
        tag: "PERFORMANCE ÉLITE // 04",
        accent: "laser",
        color: "#00B4A0",
      },
    ],
  },
};

const PLAN_KEYS: MethodPlan[] = ["diagnostic", "ranked", "pro"];

export default function Methodology() {
  const [activePlan, setActivePlan] = useState<MethodPlan>("ranked");

  const currentPlan = PLANS[activePlan];

  return (
    <section id="methodology" className="pt-24 sm:pt-36 pb-16 sm:pb-24 px-6 sm:px-12 lg:px-16 bg-transparent font-mono relative">
      <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16 relative z-10">
        {/* Section Header */}
        <div className="space-y-2 border-b border-white/10 pb-8">
          <h2 className="text-3xl sm:text-5xl font-display text-[#F5F4F0] tracking-wider">
            3 MÉTHODES POUR <span className="text-[#CA1C30]">3 TYPES DE PROFILS.</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#F5F4F0]/60 max-w-xl leading-relaxed">
            Protocoles sur-mesure et adaptés à chaque niveau d&apos;ambition.
          </p>
        </div>

        {/* 3 Selectors centered matching CyberGames DA (Zero border contour) */}
        <div className="flex justify-center items-center gap-3 sm:gap-4 flex-wrap pt-2">
          {PLAN_KEYS.map((planKey) => {
            const plan = PLANS[planKey];
            const isActive = activePlan === planKey;

            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setActivePlan(planKey)}
                className={`px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-mono font-bold uppercase rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2.5 ${
                  isActive
                    ? plan.id === "pro"
                      ? "bg-[#00B4A0] text-black shadow-[0_0_25px_rgba(0,180,160,0.5)]"
                      : "bg-[#CA1C30] text-black shadow-[0_0_25px_rgba(202,28,48,0.5)]"
                    : "bg-white/5 text-[#F5F4F0]/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>{plan.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    isActive
                      ? "bg-black/25 text-black"
                      : "bg-white/10 text-white/80"
                  }`}
                >
                  {plan.priceTag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Subtitle / Intro for selected method (si présent) */}
        {currentPlan.intro ? (
          <div className="max-w-3xl mx-auto text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={activePlan}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="text-xs sm:text-sm text-[#F5F4F0]/75 leading-relaxed font-sans"
              >
                {currentPlan.intro}
              </motion.p>
            </AnimatePresence>
          </div>
        ) : null}

        {/* Scroll Stacking Typographic Panels with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePlan}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="relative pt-4 pb-12 space-y-8"
          >
            {currentPlan.steps.map((step, index) => {
              const isAcid = step.accent === "acid";
              const isLast = index === currentPlan.steps.length - 1;
              const stickyTop = `calc(85px + ${index * 26}px)`;

              return (
                <div
                  key={`${activePlan}-${step.num}`}
                  className="sticky mb-10 w-full will-change-transform"
                  style={{
                    top: stickyTop,
                    zIndex: 10 + index,
                  }}
                >
                  <div className="p-8 sm:p-12 bg-[#121417]/95 backdrop-blur-xl rounded-3xl transition-all duration-300 shadow-[0_-20px_50px_rgba(0,0,0,0.95)] space-y-8">
                    {/* Monumental Typographic Title */}
                    <div className="space-y-2">
                      <h3 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-[#F5F4F0]">
                        {step.title}
                      </h3>
                      <p
                        className={`text-xs sm:text-sm font-mono font-semibold ${
                          isAcid ? "text-[#CA1C30]" : "text-[#00B4A0]"
                        }`}
                      >
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
                      <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <span className="text-xs font-mono font-bold text-white/50">
                          {activePlan === "diagnostic"
                            ? "SÉANCE DÉCOUVERTE · 100% OFFERTE"
                            : "PROTOCOLE 100% VALIDÉ"}
                        </span>
                        <a
                          href={currentPlan.bookingTarget}
                          className="btn-cyber-primary rounded-full px-7 py-3 text-xs font-mono font-bold tracking-wider inline-flex items-center gap-2 cursor-pointer"
                        >
                          <span>RÉSERVER CETTE MÉTHODE</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
