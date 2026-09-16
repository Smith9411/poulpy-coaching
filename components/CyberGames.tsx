"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DecryptedText from "./DecryptedText";
import CornerBrackets from "./CornerBrackets";
import { ArrowUpRight } from "lucide-react";

interface CyberGamesProps {
  onOpenBooking: () => void;
}

export default function CyberGames({ onOpenBooking }: CyberGamesProps) {
  const [[activeGame, direction], setActiveGameState] = useState<["val" | "apex", number]>(["val", 0]);

  const games = [
    {
      id: "val" as const,
      title: "VALORANT",
      subtitle: "FPS TACTIQUE 5V5 · RIOT GAMES",
      badge: "IMMORTAL 2 #5000 PEAK",
      badgeColor: "acid" as const,
      desc: "Perfectionnement complet : placement de viseur, micro-flicks, gestion des compétences, lecture du jeu adverse et communication clutch.",
      protocols: [
        "Aim, Micro-flicks & Crosshair placement",
        "Movement & Peeking techniques (deadzoning, jiggle)",
        "Game Sense & Prise de décision sous pression",
        "Positionnement tactique & Map control",
        "Gestion de l'économie & Scénarios clutch",
        "Routine d'aim & Analyse approfondie de VOD",
      ],
    },
    {
      id: "apex" as const,
      title: "APEX LEGENDS",
      subtitle: "BATTLE ROYALE RAPIDE · EA",
      badge: "3X PICK #450 S24 (PREDATOR)",
      badgeColor: "laser" as const,
      desc: "Domine tes duels et tes rotations : fluidité mécanique, tracking haute vitesse, mobilité avancée et prise de décision sous forte pression.",
      protocols: [
        "Aim, Smooth & Reactive Tracking (KovaaK's / Aim Lab)",
        "Movement avancé (Tap-strafe, Wall-bounce, Superglide)",
        "Positionnement & Contrôle du High Ground",
        "Fight Selection & Gestion des 3rd parties",
        "Communication & Leadership IGL en squad",
        "Routines d'échauffement & Analyse de VOD",
      ],
    },
  ];

  const selectGame = (id: "val" | "apex") => {
    if (id === activeGame) return;
    const oldIndex = games.findIndex((g) => g.id === activeGame);
    const newIndex = games.findIndex((g) => g.id === id);
    setActiveGameState([id, newIndex > oldIndex ? 1 : -1]);
  };

  const current = games.find((g) => g.id === activeGame) || games[0];
  const isAcid = current.badgeColor === "acid";

  const cardVariants: import("framer-motion").Variants = {
    enter: (dir: number) => ({
      x: dir >= 0 ? 70 : -70,
      scale: 0.95,
      opacity: 0,
      rotateY: dir >= 0 ? 5 : -5,
      filter: "blur(4px)",
    }),
    center: {
      x: 0,
      scale: 1,
      opacity: 1,
      rotateY: 0,
      filter: "blur(0px)",
      transition: {
        x: { type: "spring", stiffness: 320, damping: 30 },
        opacity: { duration: 0.28 },
        scale: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
        rotateY: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
        filter: { duration: 0.25 },
      },
    },
    exit: (dir: number) => ({
      x: dir >= 0 ? -70 : 70,
      scale: 0.95,
      opacity: 0,
      rotateY: dir >= 0 ? -5 : 5,
      filter: "blur(4px)",
      transition: {
        duration: 0.22,
        ease: [0.4, 0, 1, 1],
      },
    }),
  };

  return (
    <section id="games" className="py-14 sm:py-16 px-6 sm:px-12 lg:px-16 bg-[#07090D] border-t border-[rgba(255,255,255,0.08)]">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10 font-mono">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <span className="data-badge data-badge-laser">
              <DecryptedText text="CATALOGUE DES DISCIPLINES" />
            </span>
            <h2 className="text-4xl sm:text-6xl font-display text-white tracking-wider">
              JEUX &amp; <span className="text-[#8FAFD4]">PÔLES D&apos;EXCELLENCE</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/50 max-w-xl leading-relaxed">
              Chaque jeu dispose de son propre modèle télémétrique et de routines d&apos;entraînement dédiées.
            </p>
          </div>

          {/* Game selector tabs */}
          <div className="flex items-center gap-2">
            {games.map((g) => (
              <button
                key={g.id}
                onClick={() => selectGame(g.id)}
                className={`px-5 py-2.5 text-xs font-bold uppercase border transition-all cursor-pointer ${
                  activeGame === g.id
                    ? g.id === "val"
                      ? "bg-[#FF7582] text-black border-[#FF7582] shadow-[0_0_18px_rgba(255,117,130,0.4)]"
                      : "bg-[#8FAFD4] text-black border-[#8FAFD4] shadow-[0_0_18px_rgba(143,175,212,0.4)]"
                    : "bg-black text-white/60 border-white/10 hover:border-white/30 hover:text-white"
                }`}
              >
                {g.title}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Game Deep Technical Card with 3D Depth Shift Animation */}
        <div className="relative min-h-[460px] overflow-hidden" style={{ perspective: "1400px" }}>
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={current.id}
              custom={direction}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{ transformStyle: "preserve-3d" }}
              className={`reticle-box ${
                isAcid ? "" : "reticle-laser"
              } p-8 sm:p-12 bg-[#090c10] border ${
                isAcid ? "border-[#FF7582]/30" : "border-[#8FAFD4]/30"
              } space-y-8 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.85)]`}
            >
              <CornerBrackets color={isAcid ? "coral" : "slate"} size={14} />

              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6 relative z-10">
                <div className="space-y-1">
                  <span
                    className={`text-xs tracking-widest uppercase flex items-center gap-2 ${
                      isAcid ? "text-[#FF7582]" : "text-[#8FAFD4]"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 animate-ping ${
                        isAcid ? "bg-[#FF7582]" : "bg-[#8FAFD4]"
                      }`}
                    />
                    {current.subtitle}
                  </span>
                  <h3 className="text-4xl sm:text-5xl font-display text-white tracking-wider">
                    {current.title}
                  </h3>
                </div>

                <div
                  className={`text-xs py-1.5 px-4 font-bold border tracking-wider animate-pulse ${
                    isAcid
                      ? "border-[#FF7582]/40 bg-[#FF7582]/10 text-[#FF7582]"
                      : "border-[#8FAFD4]/40 bg-[#8FAFD4]/10 text-[#8FAFD4]"
                  }`}
                >
                  {current.badge}
                </div>
              </div>

              <p className="text-sm sm:text-base text-white/70 max-w-3xl leading-relaxed relative z-10">
                {current.desc}
              </p>

              {/* Protocols List with Stagger */}
              <div className="space-y-3 relative z-10">
                <span className="text-xs text-white/40 uppercase tracking-widest block">
                  MODULES D&apos;ENTRAÎNEMENT CERTIFIÉS :
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {current.protocols.map((p, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 + idx * 0.03, duration: 0.25 }}
                      className={`p-3.5 bg-black/80 border border-white/10 flex items-center gap-3 text-xs text-white/80 transition-colors duration-200 ${
                        isAcid
                          ? "hover:border-[#FF7582]/50 hover:bg-[#FF7582]/5"
                          : "hover:border-[#8FAFD4]/50 hover:bg-[#8FAFD4]/5"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 ${isAcid ? "bg-[#FF7582]" : "bg-[#8FAFD4]"}`} />
                      <span>{p}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="pt-2 flex justify-end relative z-10">
                <button
                  onClick={onOpenBooking}
                  className="btn-cyber-primary"
                >
                  <span>S&apos;ENTRAÎNER SUR {current.title}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

