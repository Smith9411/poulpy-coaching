"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import DecryptedText from "./DecryptedText";
import { ArrowUpRight } from "lucide-react";

interface CyberGamesProps {
  onOpenBooking: () => void;
}

export default function CyberGames({ onOpenBooking }: CyberGamesProps) {
  const [activeGame, setActiveGame] = useState<"val" | "apex">("val");

  const games = [
    {
      id: "val" as const,
      title: "VALORANT",
      subtitle: "FPS TACTIQUE 5V5 · RIOT GAMES",
      badge: "IMMORTAL 2 #5000 PEAK",
      badgeColor: "acid" as const,
      desc: "Crosshair placement chirurgical, micro-flicks, gestion rigoureuse des utilitaires et prise de décision sous haute pression.",
      protocols: [
        { num: "01", name: "Aim, Micro-flicks & Crosshair placement" },
        { num: "02", name: "Movement & Peeking (deadzoning, jiggle)" },
        { num: "03", name: "Game Sense & Arbre de décision" },
        { num: "04", name: "Gestion d'économie & Scénarios clutch" },
      ],
    },
    {
      id: "apex" as const,
      title: "APEX LEGENDS",
      subtitle: "BATTLE ROYALE RAPIDE · EA",
      badge: "3X PICK #450 S24 (PREDATOR)",
      badgeColor: "laser" as const,
      desc: "Tracking haute vitesse réactif, mécanique de déplacement avancée, fight selection et domination du positionnement.",
      protocols: [
        { num: "01", name: "Smooth & Reactive Tracking" },
        { num: "02", name: "Movement avancé (Tap-strafe, Superglide)" },
        { num: "03", name: "Positionnement & Contrôle du High Ground" },
        { num: "04", name: "Fight Selection & Gestion des 3rd parties" },
      ],
    },
  ];

  const current = games.find((g) => g.id === activeGame) || games[0];
  const isAcid = current.badgeColor === "acid";

  const letterVariants: Variants = {
    hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.035,
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
    exit: (i: number) => ({
      opacity: 0,
      y: -25,
      filter: "blur(4px)",
      transition: {
        delay: i * 0.02,
        duration: 0.22,
        ease: [0.4, 0, 1, 1] as const,
      },
    }),
  };

  const lineVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.15 + i * 0.05,
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
    exit: (i: number) => ({
      opacity: 0,
      x: 20,
      transition: {
        delay: i * 0.03,
        duration: 0.2,
      },
    }),
  };

  return (
    <section id="games" className="py-16 sm:py-20 px-6 sm:px-12 lg:px-16 bg-transparent">
      <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16 font-mono">
        {/* Section Header with Minimal Game Selectors */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <span className="data-badge data-badge-laser">
              <DecryptedText text="DISCIPLINES // PROGRAMMES" />
            </span>
            <h2 className="text-3xl sm:text-5xl font-display text-[#F5F4F0] tracking-wider">
              JEUX &amp; <span className="text-[#CA1C30]">PÔLES D&apos;EXCELLENCE</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#F5F4F0]/60 max-w-xl leading-relaxed">
              Protocoles d&apos;entraînement dédiés et calibrés par discipline.
            </p>
          </div>

          {/* Minimal Game Selector Tabs */}
          <div className="flex items-center gap-3">
            {games.map((g) => (
              <button
                key={g.id}
                onClick={() => setActiveGame(g.id)}
                className={`px-6 py-2.5 text-xs font-mono font-bold uppercase rounded-full transition-all cursor-pointer ${
                  activeGame === g.id
                    ? g.id === "val"
                      ? "bg-[#CA1C30] text-black shadow-[0_0_25px_rgba(202,28,48,0.5)]"
                      : "bg-[#00B4A0] text-black shadow-[0_0_25px_rgba(0,180,160,0.5)]"
                    : "bg-white/5 text-[#F5F4F0]/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {g.title}
              </button>
            ))}
          </div>
        </div>

        {/* Pure Typographic Game Content (Zero Vignettes / Zero Card Boxes) */}
        <div className="relative min-h-[380px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Monumental Animated Title + Rank Directly Below */}
              <div className="space-y-2 py-1">
                <div className="overflow-hidden">
                  <h3 className="text-5xl sm:text-7xl lg:text-8xl font-display font-bold tracking-tight text-[#F5F4F0] flex flex-wrap">
                    {current.title.split("").map((letter, i) => (
                      <motion.span
                        key={`${current.id}-${i}`}
                        custom={i}
                        variants={letterVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="inline-block whitespace-pre"
                      >
                        {letter}
                      </motion.span>
                    ))}
                  </h3>
                </div>

                {/* Small rank in pure red without contour */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ delay: 0.08, duration: 0.25 }}
                  className="text-xs sm:text-sm font-mono font-bold tracking-widest uppercase text-[#CA1C30]"
                >
                  {current.badge}
                </motion.div>
              </div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="text-sm sm:text-base text-[#F5F4F0]/70 max-w-3xl leading-relaxed font-sans"
              >
                {current.desc}
              </motion.p>

              {/* Typographic Protocols List (Clean Lines, Zero Card Boxes) */}
              <div className="space-y-4 pt-4">
                <span className="text-xs font-mono text-[#F5F4F0]/40 uppercase tracking-widest block">
                  MODULES D&apos;ENTRAÎNEMENT SPÉCIFIQUES :
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {current.protocols.map((p, idx) => (
                    <motion.div
                      key={`${current.id}-proto-${idx}`}
                      custom={idx}
                      variants={lineVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="flex items-center gap-4 py-3.5 border-b border-white/10 group"
                    >
                      <span
                        className={`text-xs font-mono font-bold ${
                          isAcid ? "text-[#CA1C30]" : "text-[#00B4A0]"
                        }`}
                      >
                        {p.num}
                      </span>
                      <span className="text-xs sm:text-sm text-[#F5F4F0]/90 font-mono tracking-wide group-hover:text-white transition-colors">
                        {p.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="pt-6 flex justify-start"
              >
                <button
                  onClick={onOpenBooking}
                  className="btn-cyber-primary rounded-full px-8 py-3.5 text-xs font-mono font-bold tracking-wider cursor-pointer"
                >
                  <span>S&apos;ENTRAÎNER SUR {current.title}</span>
                  <div className="w-5 h-5 rounded-full bg-black/30 flex items-center justify-center">
                    <ArrowUpRight className="w-3.5 h-3.5 text-black" />
                  </div>
                </button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

