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
          "Le coaching sera fait en live afin de partager mon analyse à la communauté. Vous pourrez retrouver les VODs et des vidéos des coachings sur mon YouTube.",
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
          { label: "Analyse stats", val: "Tracker Valorant / Apex complet" },
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
    intro:
      "Une session ayant pour objectif le pur gain de RR. On analyse votre gameplay, vos habitudes et votre mentalité afin de rédiger votre fiche de suivi personnalisée. Cette session se base sur le travail fait lors de la session diagnostic : elle permettra de mettre en place des routines d'échauffement et d'entraînement pour pallier aux problèmes relevés dans celle-ci. L'objectif est de vous donner les outils pour accélérer votre progression et vous permettre de sky rocket dans le leaderboard. À la fin de la session vous aurez accès à votre fiche de suivi. La session prend entre 1h et 1h30, au programme :",
    steps: [
      {
        num: "01",
        code: "AIM // DRILLS_AND_CLIPS",
        icon: Dumbbell,
        title: "ANALYSES MÉCANIQUES",
        subtitle: "Range, deathmatch & analyse de clips",
        description:
          "Range, deathmatch et analyse de clips. Objectifs : trouver vos points faibles et vos points forts mécaniques pour adapter la routine d'aim training mise en place.",
        metrics: [
          { label: "Range & DM", val: "Tests in-game & calibrage moteur" },
          { label: "Analyse clips", val: "Audit de micro-ajustements & crosshair" },
          { label: "Diagnostic", val: "Points faibles & points forts ciblés" },
          { label: "Livrable", val: "Routine d'aim training sur-mesure" },
        ],
        tag: "MÉCANIQUE PURE // 01",
        accent: "laser",
        color: "#00B4A0",
      },
      {
        num: "02",
        code: "MINDSET // GAME_BREAKDOWN",
        icon: Target,
        title: "ANALYSE GAME-SENS & MENTAL",
        subtitle: "Review d'une game au choix & compréhension des axes de grind",
        description:
          "Review d'une game de votre choix. Objectifs : pas forcément pointer les erreurs mais comprendre fondamentalement les axes de jeu qui vous empêchent de grind : Mental · Mécanique · Micro · Macro.",
        metrics: [
          { label: "VOD Review", val: "1 game complète de votre choix" },
          { label: "Axes d'analyse", val: "Mental · Mécanique · Micro · Macro" },
          { label: "Facteur mental", val: "Résilience & gestion des rounds sous stress" },
          { label: "Déblocage", val: "Suppression des blocages de progression" },
        ],
        tag: "GAME-SENS // 02",
        accent: "acid",
        color: "#CA1C30",
      },
      {
        num: "03",
        code: "COCKPIT // TRACKING_SHEET",
        icon: TrendingUp,
        title: "RÉDACTION DE VOTRE FICHE DE SUIVI",
        subtitle: "Outils concrets, routines & garantie de montée en rank",
        description:
          "Retour sur les points abordés pendant la session et explication des choses mises en place. Vous ressortez du coaching avec des outils vous permettant de progresser et vous assurant une montée en rank.",
        metrics: [
          { label: "Fiche perso", val: "Rédigée & accessible sur le site" },
          { label: "Process", val: "Explication claire des outils mis en place" },
          { label: "Autonomie", val: "Routines d'entraînement applicables" },
          { label: "Objectif RR", val: "Montée en rank mesurable & assurée" },
        ],
        tag: "RÉSULTAT GARANTI // 03",
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

  const handleBookingScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const id = targetId.replace("#", "");
    const targetElement = document.getElementById(id);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", targetId);
    } else {
      window.location.hash = targetId;
    }
  };

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
                          onClick={(e) => handleBookingScroll(e, currentPlan.bookingTarget)}
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
