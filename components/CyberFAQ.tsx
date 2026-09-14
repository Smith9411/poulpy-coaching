"use client";

import React, { useState } from "react";
import DecryptedText from "./DecryptedText";
import { Plus, Minus, HelpCircle } from "lucide-react";

export default function CyberFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Comment se déroule une session ?",
      a: "La séance se déroule en direct sur Discord en vocal et partage d'écran haute fluidité. Nous commençons par un diagnostic ciblé de tes objectifs et de tes blocages actuels, puis nous analysons ton gameplay ou ta VOD séquence par séquence (placement de viseur, prise d'informations, prise de décision). La session se termine par des exercices pratiques ciblés et la remise d'une fiche de suivi personnalisée avec tes axes prioritaires de travail.",
    },
    {
      q: "Dois-je avoir un certain niveau ?",
      a: "Non, aucun niveau minimum n'est requis. Le coaching est 100% individualisé : que tu fasses tes premiers pas en parties classées (Fer / Bronze / Argent) ou que tu vises les plus hauts échelons compétitifs (Ascendant / Immortel / Radiant / Predator), chaque session est calibrée sur mesure selon ton rang actuel et ton potentiel.",
    },
    {
      q: "Est-ce que tu coaches les débutants ?",
      a: "Absolument ! Accompagner un joueur débutant permet d'ancrer immédiatement les bonnes habitudes (réglages eDPI optimaux, posture, crosshair placement, lecture de carte) et d'éviter les erreurs fondamentales qui freinent la progression sur le long terme.",
    },
    {
      q: "Les sessions sont disponibles sur Discord ?",
      a: "Oui, l'intégralité du coaching a lieu sur Discord via un salon privé dédié. Tu as simplement besoin d'un micro fonctionnel, d'une connexion stable et de Discord installé sur ton PC pour partager ton écran ou suivre les retours en direct en temps réel.",
    },
    {
      q: "Puis-je faire analyser une VOD ?",
      a: "Oui, l'analyse VOD est au cœur de la méthode. Tu peux enregistrer l'une de tes parties représentatives (via YouTube en non répertorié, Medal.tv ou Twitch) et l'envoyer avant la séance, ou la déposer directement dans ton espace élève. Nous la décortiquons ensemble pour identifier précisément chaque moment clé.",
    },
    {
      q: "Quel jeu dois-je choisir ?",
      a: "Le coaching est spécialisé sur Valorant et Apex Legends. Tu choisis la discipline sur laquelle tu souhaites te concentrer lors de la réservation. Si tu pratiques les deux jeux, nous pouvons également structurer un accompagnement pour perfectionner tes fondamentaux FPS transversaux (aiming, tracking, réactivité, positionnement).",
    },
    {
      q: "Puis-je réserver plusieurs sessions ?",
      a: "Tout à fait. Pour constater une transformation durable de ton niveau de jeu, un suivi régulier sur plusieurs séances espacées de 1 à 2 semaines est fortement recommandé. Cela permet d'assimiler les corrections, de pratiquer entre chaque séance et de mesurer concrètement tes gains de rang.",
    },
    {
      q: "Comment fonctionne le paiement ?",
      a: "Le règlement s'effectue directement en ligne de manière 100% sécurisée (carte bancaire, Apple Pay, Google Pay) au moment de sélectionner ton créneau. Dès validation, ton créneau est instantanément bloqué dans l'agenda et tu reçois ta confirmation détaillée par email ainsi que sur ton espace personnel.",
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
