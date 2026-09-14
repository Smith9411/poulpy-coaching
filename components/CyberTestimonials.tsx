"use client";

import React, { useState } from "react";
import Link from "next/link";
import DecryptedText from "./DecryptedText";
import { Star, ShieldCheck, ChevronLeft, ChevronRight, Quote, ArrowUpRight } from "lucide-react";

export default function CyberTestimonials() {
  const [activeIdx, setActiveIdx] = useState(0);

  const reviews = [
    {
      author: "Alexandre D.",
      discord: "Vortex#2044",
      rankBefore: "DIAMANT 1",
      rankAfter: "IMMORTEL 2",
      rrGain: "+450 RR",
      game: "VALORANT",
      text: "J'étais bloqué en D1 depuis 6 mois, persuadé que mon aim était le problème. En une séance, Poulpy a mis le doigt sur mon micro-décalage trop large et mon over-peek sur A-Long. En 4 semaines de suivi Discord, j'ai touché l'Immortel 2 sans forcer.",
    },
    {
      author: "Mathis R.",
      discord: "Spectre#9910",
      rankBefore: "PLATINE 2",
      rankAfter: "MASTER APEX",
      rrGain: "TOP 450 EU",
      game: "APEX LEGENDS",
      text: "Son analyse de bulle et de positionnement ALGS est d'un autre monde. Il ne donne pas des conseils bateau qu'on trouve sur YouTube : il décortique votre mécanique et reconstruit vos prises d'information. Meilleur investissement de ma vie esport.",
    },
    {
      author: "Sarah B.",
      discord: "Kitsune#0412",
      rankBefore: "ASCENDANT 1",
      rankAfter: "IMMORTEL 1",
      rrGain: "+210 RR",
      game: "VALORANT",
      text: "La bienveillance alliée à une exigence chirurgicale. Les vidéos VOD 4K découpées image par image m'ont fait réaliser mes 10 erreurs de réticule récurrentes. Premier rank-up 9 jours après la première session.",
    },
    {
      author: "Thomas V.",
      discord: "Aero#7718",
      rankBefore: "OR 3",
      rankAfter: "DIAMANT 2",
      rrGain: "+6 PALIERS",
      game: "VALORANT",
      text: "Passé d'un joueur qui panique en 1v1 à un joueur calme qui clutch régulièrement sous pression. Le travail sur la respiration et l'arbre décisionnel m'a fait sauter 6 divisions en moins de deux mois.",
    },
  ];

  const current = reviews[activeIdx];

  const nextReview = () => {
    setActiveIdx((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setActiveIdx((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <section id="avis" className="py-32 px-6 sm:px-12 lg:px-16 bg-[#07090D] border-t border-white/10 font-mono">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <span className="data-badge data-badge-laser">
              <DecryptedText text="RETOUR D'EXPÉRIENCE" />
            </span>
            <h2 className="text-4xl sm:text-6xl font-display text-white tracking-wider">
              RÉSULTATS VALIDÉS PAR <span className="text-[#FF7582]">LES JOUEURS</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/50 max-w-xl leading-relaxed">
              Des données réelles, des profils vérifiés et des rangs certifiés en jeu après le protocole Poulpy.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={prevReview}
              className="w-10 h-10 border border-white/20 bg-black flex items-center justify-center hover:border-[#FF7582] hover:text-[#FF7582] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-white/40">
              0{activeIdx + 1} / 0{reviews.length}
            </span>
            <button
              onClick={nextReview}
              className="w-10 h-10 border border-white/20 bg-black flex items-center justify-center hover:border-[#FF7582] hover:text-[#FF7582] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Infinite Live Ticker Bar */}
        <div className="overflow-hidden border-y border-white/10 py-3 bg-black/60 relative">
          <div className="animate-marquee gap-8 text-xs font-mono tracking-wider">
            {[...reviews, ...reviews].map((r, i) => (
              <div key={i} className="flex items-center gap-3 shrink-0">
                <span className="w-1.5 h-1.5 bg-[#A4DE87] animate-ping" />
                <span className="text-white font-bold">{r.author}</span>
                <span className="text-white/40">[{r.game}]</span>
                <span className="text-white/60">{r.rankBefore}</span>
                <span className="text-[#A4DE87]">➔ {r.rankAfter}</span>
                <span className="data-badge data-badge-acid text-[9px]">{r.rrGain}</span>
                <span className="text-white/20 ml-4">//</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Testimonial Card with Motion */}
        <div className="relative min-h-[360px]">
          <div
            key={activeIdx}
            className="reticle-box p-8 sm:p-12 bg-[#040404]/95 border border-white/10 space-y-8 relative overflow-hidden transition-all duration-300 shadow-[0_0_30px_rgba(143,175,212,0.08)]"
          >

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF7582] text-black font-bold flex items-center justify-center text-sm shadow-[0_0_15px_rgba(255,117,130,0.35)]">
                  {current.author.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{current.author}</h3>
                  <span className="text-xs text-white/40">{current.discord}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-[#FF7582]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="data-badge data-badge-acid text-[10px]">
                  {current.game}
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-lg text-white/85 leading-relaxed italic relative z-10">
              &ldquo;{current.text}&rdquo;
            </p>

            {/* Progression Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10 relative z-10">
              <div className="p-3 bg-black/80 border border-white/5 space-y-1">
                <span className="text-[10px] text-white/40 block">RANG INITIAL</span>
                <span className="text-base font-bold text-white/60">{current.rankBefore}</span>
              </div>

              <div className="p-3 bg-black/80 border border-white/5 space-y-1">
                <span className="text-[10px] text-white/40 block">RANG ACTUEL CERTIFIÉ</span>
                <span className="text-base font-bold text-[#A4DE87]">{current.rankAfter}</span>
              </div>

              <div className="p-3 bg-black/80 border border-white/5 space-y-1">
                <span className="text-[10px] text-white/40 block">GAIN DE PALIER</span>
                <span className="text-base font-bold text-[#8FAFD4]">{current.rrGain}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action button to open full /avis page */}
        <div className="text-center pt-2">
          <Link
            href="/avis"
            className="inline-flex items-center justify-center gap-2 text-xs py-3.5 px-6 sm:px-8 bg-black/80 border border-white/15 hover:border-[#FF7582] text-white/90 hover:text-white transition-all font-mono tracking-widest uppercase shadow-md group w-full sm:w-auto"
          >
            <span>CONSULTER LES AVIS</span>
            <ArrowUpRight className="w-4 h-4 text-[#FF7582] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
          </Link>
        </div>
      </div>
    </section>
  );
}
