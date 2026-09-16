"use client";

import React, { useState } from "react";
import DecryptedText from "./DecryptedText";
import { Target, Zap, Shield, ArrowUpRight, Crosshair } from "lucide-react";

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
      badgeColor: "laser",
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
      badgeColor: "acid",
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

  const current = games.find((g) => g.id === activeGame) || games[0];

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
                onClick={() => setActiveGame(g.id)}
                className={`px-4 py-2 text-xs font-bold uppercase border transition-all ${
                  activeGame === g.id
                    ? "bg-[#FF7582] text-black border-[#FF7582] shadow-[0_0_15px_rgba(255,117,130,0.35)]"
                    : "bg-black text-white/60 border-white/10 hover:border-white/30"
                }`}
              >
                {g.title}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Game Deep Technical Card with Smooth Motion Transition */}
        <div className="relative min-h-[480px]">
          <div
            key={current.id}
            className="reticle-box reticle-laser p-8 sm:p-12 bg-[#090c10] border border-white/10 space-y-8 relative overflow-hidden transition-all duration-300 shadow-[0_0_40px_rgba(0,0,0,0.8)]"
          >

            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6 relative z-10">
              <div className="space-y-1">
                <span className="text-xs text-[#8FAFD4] tracking-widest uppercase flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#8FAFD4] animate-ping" />
                  {current.subtitle}
                </span>
                <h3 className="text-4xl sm:text-5xl font-display text-white tracking-wider">
                  {current.title}
                </h3>
              </div>

              <div className="data-badge data-badge-laser text-xs py-1.5 px-4 animate-pulse">
                {current.badge}
              </div>
            </div>

            <p className="text-sm sm:text-base text-white/70 max-w-3xl leading-relaxed relative z-10">
              {current.desc}
            </p>

            {/* Protocols List */}
            <div className="space-y-3 relative z-10">
              <span className="text-xs text-white/40 uppercase tracking-widest block">
                MODULES D&apos;ENTRAÎNEMENT CERTIFIÉS :
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {current.protocols.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-black/80 border border-white/10 flex items-center gap-3 text-xs text-white/80 hover:border-[#8FAFD4]/50 hover:bg-[#8FAFD4]/5 transition-colors duration-200"
                  >
                    <span className="w-1.5 h-1.5 bg-[#FF7582]" />
                    <span>{p}</span>
                  </div>
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
          </div>
        </div>
      </div>
    </section>
  );
}
