"use client";

import React, { useState } from "react";
import DecryptedText from "./DecryptedText";
import { Plus, Minus, HelpCircle } from "lucide-react";

export default function CyberFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Comment se déroule une session ?",
      a: "Les sessions se déroulent sur Discord avec partage d'écran. On analyse ensemble ton gameplay, on identifie les points à améliorer, et on met en place un plan d'action concret.",
    },
    {
      q: "Dois-je avoir un certain niveau ?",
      a: "Non, tous les niveaux sont acceptés. Que tu sois débutant ou joueur confirmé, le coaching s'adapte à ton niveau actuel et tes objectifs.",
    },
    {
      q: "Est-ce que tu coaches les débutants ?",
      a: "Absolument ! Le coaching est adapté à tous les niveaux. Pour les débutants, on se concentre sur les fondamentaux essentiels pour progresser rapidement.",
    },
    {
      q: "Les sessions sont disponibles sur Discord ?",
      a: "Oui, toutes les sessions se font via Discord avec partage d'écran et communication vocale pour un coaching interactif en temps réel.",
    },
    {
      q: "Puis-je faire analyser une VOD ?",
      a: "Oui ! L'analyse de VOD est incluse dans les sessions de 60 et 90 minutes. Tu peux m'envoyer tes replays avant la session.",
    },
    {
      q: "Quel jeu dois-je choisir ?",
      a: "Choisis le jeu sur lequel tu veux progresser. Si tu hésites, on peut faire une session mixte pour évaluer tes besoins sur plusieurs jeux.",
    },
    {
      q: "Puis-je réserver plusieurs sessions ?",
      a: "Bien sûr ! Pour une progression optimale, je recommande au moins 2-3 sessions espacées pour mesurer les résultats et ajuster le plan.",
    },
    {
      q: "Comment fonctionne le paiement ?",
      a: "Le paiement se fait en ligne de manière sécurisée lors de la réservation. Tu reçois ensuite une confirmation avec tous les détails de ta session.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-14 sm:py-16 px-6 sm:px-12 lg:px-16 bg-[#07090D] border-t border-white/10 font-mono">
      <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10">
        <div className="space-y-3 text-center">
          <span className="data-badge data-badge-laser inline-flex">
            <DecryptedText text="INFORMATIONS PRATIQUES &amp; FAQ" />
          </span>
          <h2 className="text-4xl sm:text-6xl font-display text-white tracking-wider">
            RÉPONSES <span className="text-[#8FAFD4]">TACTIQUES</span>
          </h2>
          <p className="text-xs sm:text-sm text-white/50 max-w-lg mx-auto leading-relaxed">
            Toutes les réponses aux questions techniques et pratiques.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`reticle-box transition-all duration-200 ${
                  isOpen
                    ? "border-[#8FAFD4]/40 bg-[#090C12]"
                    : "border-white/10 bg-[#07090D] hover:border-white/20"
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 select-none cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#8FAFD4]">
                      0{idx + 1} ·
                    </span>
                    <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                      {faq.q}
                    </span>
                  </div>

                  <div className="w-6 h-6 border border-white/20 flex items-center justify-center shrink-0 text-white">
                    {isOpen ? <Minus className="w-3.5 h-3.5 text-[#8FAFD4]" /> : <Plus className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {/* Animated Accordion Content with CSS transform & opacity */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                >
                  <div className="p-6 pt-0 border-t border-white/5 text-xs sm:text-sm text-white/60 leading-relaxed">
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
