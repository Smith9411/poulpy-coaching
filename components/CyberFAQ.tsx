"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CyberFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Comment se déroule une séance de coaching Valorant ou Apex Legends ?",
      a: "La session se déroule en direct sur Discord en vocal et partage d'écran 60 FPS. Elle combine l'analyse de VOD personnalisée (VOD review), la correction de tes mécaniques de tir et de positionnement, et l'établissement d'une feuille de route concrète.",
    },
    {
      q: "Quel niveau faut-il avoir pour prendre un coach Valorant ou un coach Apex ?",
      a: "Tous les rangs sont accompagnés : du joueur débutant bloqué en Fer/Bronze ou Silver voulant acquérir de bonnes bases, au joueur compétitif cherchant à passer Ascendant/Immortel sur Valorant ou Master/Predator sur Apex Legends.",
    },
    {
      q: "Pourquoi choisir le coaching Valorant avec Coach Poulpy ?",
      a: "Coach Poulpy (Atheris Esport, Immortal 2 #5000) applique une méthode scientifique éprouvée : biomécanique de visée, crosshair placement, routines KovaaKs/Aim Lab sur-mesure et prise de décision collective.",
    },
    {
      q: "Qu'apprend-on lors d'un coaching Apex Legends (Apex coaching) ?",
      a: "Tu travailles le tracking réactif à haut DPS, le movement tech avancé (tap-strafe, superglide, wall bounce), les rotations intelligentes et la gestion des combats 3v3 sous pression.",
    },
    {
      q: "Comment fonctionne la première séance d'essai gratuite ?",
      a: "La séance d'initiation de 30 minutes est 100 % offerte et sans engagement. Tu choisis ton créneau sur le calendrier du site pour faire un premier bilan de tes objectifs et de ton gameplay.",
    },
    {
      q: "Comment envoyer ma VOD avant le cours ?",
      a: "Enregistre simplement une partie compétitive représentative (format YouTube non répertorié ou lien direct) et transmets-la sur Discord avant le début de ta séance.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 sm:py-20 px-6 sm:px-12 lg:px-16 bg-transparent font-mono">
      <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12">
        {/* Section Header aligné avec la DA (Pôles d'excellence, À Propos, Média) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-5xl font-display text-[#F5F4F0] tracking-wider uppercase">
              FOIRE AUX <span className="text-[#CA1C30]">QUESTIONS</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#F5F4F0]/60 max-w-xl leading-relaxed">
              Tout ce qu&apos;il faut savoir avant de réserver ta première session.
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
                    <span
                      className={`text-base sm:text-lg md:text-xl font-display font-medium tracking-wide transition-colors ${
                        isOpen
                          ? "text-[#F5F4F0]"
                          : "text-[#F5F4F0]/80 group-hover:text-white"
                      }`}
                    >
                      {faq.q}
                    </span>
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
                  {isOpen && (
                    <motion.div
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
