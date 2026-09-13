"use client";

import React, { useState } from "react";
import DecryptedText from "./DecryptedText";
import { Plus, Minus, HelpCircle } from "lucide-react";

export default function CyberFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "À quel niveau / rang s'adresse le coaching ?",
      a: "Le coaching s'adresse à tout joueur déterminé à progresser, qu'il soit bloqué en Argent/Or ou qu'il cherche à franchir le cap de l'Immortel/Radiant. L'approche est personnalisée : nous analysons vos forces et faiblesses individuelles sans jugement.",
    },
    {
      q: "Comment se déroule concrètement une séance de 60 minutes ?",
      a: "Nous commençons par un débriefing de 10 minutes sur votre ressenti et vos objectifs, suivi de 30 minutes de dissection chirurgicale de votre VOD (arrêts sur image, tracés de lignes de tir), puis 20 minutes d'entraînement pratique in-game ou d'exercices personnalisés. Vous repartez avec un plan d'action écrit.",
    },
    {
      q: "Que dois-je préparer avant la première séance ?",
      a: "Il vous suffit d'avoir Discord installé avec un microphone clair et d'enregistrer au moins un match classé récent représentatif (victoire ou défaite serrée) en résolution minimale 1080p via OBS, Medal ou GeForce Experience.",
    },
    {
      q: "Que couvre la garantie de résultat sous 14 jours ?",
      a: "Si après avoir suivi 4 séances d'accompagnement et appliqué rigoureusement les routines quotidiennes prescrites vous ne gagnez aucun palier compétitif, les sessions complémentaires de recalibrage vous sont offertes jusqu'à validation de votre rang cible.",
    },
    {
      q: "Le coaching est-il adapté aux joueurs manette / controller ?",
      a: "Poulpy est spécialisé dans la mécanique souris pure (MNK - Mouse & Keyboard). Bien que 70% des notions tactiques (macro-game, timing d'angles, prise de décision) soient universelles, le calibrage biomécanique s'adresse principalement aux joueurs clavier/souris.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-32 px-6 sm:px-12 lg:px-16 bg-[#07090D] border-t border-white/10 font-mono">
      <div className="max-w-4xl mx-auto space-y-16">
        <div className="space-y-3 text-center">
          <span className="data-badge data-badge-laser inline-flex">
            <DecryptedText text="INFORMATIONS PRATIQUES &amp; FAQ" />
          </span>
          <h2 className="text-4xl sm:text-6xl font-display text-white tracking-wider">
            RÉPONSES <span className="text-[#8FAFD4]">TACTIQUES</span>
          </h2>
          <p className="text-xs sm:text-sm text-white/50 max-w-lg mx-auto leading-relaxed">
            Toutes les réponses aux questions techniques et pratiques sur le fonctionnement de l&apos;Atelier.
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
