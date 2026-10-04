"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CyberFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Comment se déroule une session ?",
      a: "Sur Discord en vocal et partage d'écran. Analyse de VOD en direct, identification des points de blocage et plan d'entraînement concret.",
    },
    {
      q: "Quel niveau faut-il avoir pour commencer ?",
      a: "Tous les niveaux sont acceptés. L'entraînement est personnalisé en fonction de ton rang et de tes objectifs.",
    },
    {
      q: "Comment envoyer ma VOD ?",
      a: "Enregistre une partie représentative (format YouTube non répertorié ou lien direct) et transmets-la avant la séance.",
    },
    {
      q: "Sur quels jeux interviens-tu ?",
      a: "Spécialisation Valorant et Apex Legends (visée pure, biomécanique, game sense et prise de décision).",
    },
    {
      q: "Comment fonctionne le paiement et la confirmation ?",
      a: "Paiement en ligne sécurisé lors de la réservation. Tu reçois instantanément la confirmation de ton créneau par email.",
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
          <div className="text-xs font-mono text-[#F5F4F0]/40 flex items-center gap-2">
            <span className="text-[#CA1C30] font-bold">//</span>
            <span>05 RÉPONSES TACTIQUES</span>
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
