"use client";

import React, { useState } from "react";
import DecryptedText from "./DecryptedText";
import { Plus, Minus, HelpCircle } from "lucide-react";

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
    <section id="faq" className="py-14 sm:py-16 px-6 sm:px-12 lg:px-16 bg-transparent font-mono">
      <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10">
        <div className="space-y-3 text-center">
          <h2 className="text-4xl sm:text-6xl font-display text-[#F5F4F0] tracking-wider">
            FOIRE AUX <span className="text-[#CA1C30]">QUESTIONS</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#F5F4F0]/60 max-w-lg mx-auto leading-relaxed">
            Tout ce qu&apos;il faut savoir avant de réserver ta session.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`reticle-box rounded-2xl transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-[#CA1C30]/50 bg-[#121117]"
                    : "border-white/10 bg-[#1A1822] hover:border-white/20"
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 select-none cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#00B4A0]">
                      0{idx + 1} ·
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[#F5F4F0] tracking-tight">
                      {faq.q}
                    </span>
                  </div>

                  <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center shrink-0 text-[#F5F4F0] bg-black/40">
                    {isOpen ? <Minus className="w-3.5 h-3.5 text-[#CA1C30]" /> : <Plus className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {/* Animated Accordion Content with CSS transform & opacity */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                >
                  <div className="p-6 pt-0 border-t border-white/5 text-xs sm:text-sm text-[#F5F4F0]/70 leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
