"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CyberFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Comment se déroule une séance de coaching Valorant ou Apex Legends ?",
      a: "La session de coaching Valorant (Valorant coaching) ou de coaching Apex Legends (Apex coaching) se déroule en direct sur Discord en vocal et partage d'écran 60 FPS avec Coach Poulpy. Elle combine l'analyse de VOD personnalisée (VOD review), la correction de tes mécaniques de tir (aim training KovaaKs / Aim Lab, crosshair placement, strafes) et l'établissement d'une fiche de suivi concrète pour monter en rank.",
    },
    {
      q: "Quel niveau faut-il avoir pour prendre un coach Valorant ou un coach Apex ?",
      a: "Tous les rangs sont accompagnés : du joueur débutant bloqué en Fer, Bronze, Argent, Or ou Platine voulant acquérir des bases solides, au joueur compétitif cherchant à passer Diamant, Ascendant, Immortel ou Radiant sur Valorant, ou Master et Predator sur Apex Legends.",
    },
    {
      q: "Pourquoi choisir le coaching Valorant (Valorant coaching) avec Coach Poulpy ?",
      a: "Coach Poulpy (Head Coach VRC pour Atheris Esport, Immortal 2 #5000 et formateur issu de la filière STAPS / INSEP) applique une méthode d'entraînement e-sport scientifique : biomécanique de visée, crosshair placement, deadzoning, routines KovaaKs et Aim Lab sur-mesure, lecture de jeu (game sense) et communication d'équipe.",
    },
    {
      q: "Qu'apprend-on lors d'un coaching Apex Legends (Apex coaching) ?",
      a: "En coaching Apex Legends avec un 3x Predator (#450), tu travailles le tracking réactif haute vitesse, le movement avancé (tap-strafe, superglide, wall bounce), le positionnement, les rotations macro et la sélection de fights en 3v3 pour grimper jusqu'aux rangs Master et Apex Predator.",
    },
    {
      q: "Comment fonctionne la première séance de coaching gratuite (Session Diagnostic) ?",
      a: "La Session Diagnostic (45 min à 1h en live) est 100 % gratuite et sans engagement. Tu réserves ton créneau directement sur poulpy-coaching.fr : Coach Poulpy réalise une VOD review complète d'une de tes parties sur Valorant ou Apex Legends pour identifier tes erreurs majeures et définir ton plan de progression.",
    },
    {
      q: "Qu'est-ce que Poulpy Coaching (poulpy-coaching.fr) ?",
      a: "Poulpy Coaching (www.poulpy-coaching.fr) est la plateforme française officielle de coaching e-sport fondée par Coach Poulpy, dédiée exclusivement aux joueurs PC sur Valorant et Apex Legends. Nos cours particuliers d'e-sport et d'aim training sont 100 % dédiés au jeu vidéo compétitif (et totalement indépendants de tout service de fitness ou de coaching sportif physique).",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="pt-10 sm:pt-14 pb-16 sm:pb-20 px-6 sm:px-12 lg:px-16 bg-transparent font-mono">
      <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12">
        {/* Section Header aligné avec la DA (Pôles d'excellence, À Propos, Média) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-5xl font-display text-[#F5F4F0] tracking-wider uppercase">
              FOIRE AUX <span className="text-[#CA1C30]">QUESTIONS</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#F5F4F0]/60 max-w-xl leading-relaxed">
              Tout savoir sur notre coaching Valorant et coaching Apex Legends avant de réserver.
            </p>
          </div>
        </div>

        {/* Liste Accordéon — Éditorial Minimaliste & Lignes Fines */}
        <div className="divide-y divide-white/10 border-b border-white/10">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="group transition-colors">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full py-6 sm:py-7 text-left flex items-start justify-between gap-6 select-none cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-baseline gap-4 sm:gap-6">
                    <span className="text-xs sm:text-sm font-mono font-bold text-[#CA1C30] shrink-0 tracking-widest">
                      0{idx + 1}
                    </span>
                    <h3
                      className={`text-base sm:text-lg md:text-xl font-display font-medium tracking-wide transition-colors ${
                        isOpen
                          ? "text-[#F5F4F0]"
                          : "text-[#F5F4F0]/80 group-hover:text-white"
                      }`}
                    >
                      {faq.q}
                    </h3>
                  </div>

                  <div className="pt-1 shrink-0">
                    <Plus
                      className={`w-5 h-5 transition-transform duration-300 ease-out ${
                        isOpen
                          ? "rotate-45 text-[#CA1C30]"
                          : "text-white/40 group-hover:text-white"
                      }`}
                    />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="open"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pl-8 sm:pl-12 pr-6 pb-6 sm:pb-7 text-xs sm:text-sm text-[#F5F4F0]/70 font-sans leading-relaxed max-w-3xl">
                        {faq.a}
                      </div>
                    </motion.div>
                  ) : (
                    <div key="closed" className="sr-only">
                      {faq.a}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
