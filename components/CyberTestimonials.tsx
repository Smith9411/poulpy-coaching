"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DecryptedText from "./DecryptedText";
import { Star, ChevronLeft, ChevronRight, ArrowUpRight, MessageSquare, Loader2 } from "lucide-react";

interface RealReview {
  id: string;
  name: string;
  game: string;
  rank: string;
  text: string;
  rating: number;
  user_id?: string;
  created_at: string;
  featured?: boolean;
}

export default function CyberTestimonials() {
  const [reviews, setReviews] = useState<RealReview[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeaturedReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/reviews?featured=true");
      if (!res.ok) throw new Error("Erreur");
      const data = await res.json();
      if (data.reviews && Array.isArray(data.reviews) && data.reviews.length > 0) {
        setReviews(data.reviews);
      }
    } catch {
      // Ignorer silencieusement
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedReviews();
  }, [fetchFeaturedReviews]);

  // Adjust activeIdx if reviews change
  useEffect(() => {
    if (activeIdx >= reviews.length && reviews.length > 0) {
      setActiveIdx(0);
    }
  }, [reviews, activeIdx]);

  const current = reviews[activeIdx] || reviews[0];

  const nextReview = () => {
    if (reviews.length === 0) return;
    setActiveIdx((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    if (reviews.length === 0) return;
    setActiveIdx((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  // Helper to parse rank progression
  const parseRank = (rankStr?: string) => {
    if (!rankStr) {
      return { before: "DÉBUT DE PROTOCOLE", after: "CERTIFIÉ POULPY", gain: "+ RÉSULTAT VALIDÉ" };
    }
    if (rankStr.includes("→") || rankStr.includes("->")) {
      const parts = rankStr.split(/→|->/).map((s) => s.trim());
      return {
        before: parts[0] || "INITIAL",
        after: parts[1] || parts[0],
        gain: "+ GAIN VALIDÉ",
      };
    }
    return {
      before: "MEMBRE ATELIER",
      after: rankStr,
      gain: "+ PALIER CERTIFIÉ",
    };
  };

  const currentParsed = parseRank(current?.rank);

  // Repeat reviews for infinite smooth marquee ticker
  const marqueeItems =
    reviews.length > 0
      ? reviews.length < 5
        ? [...reviews, ...reviews, ...reviews, ...reviews]
        : [...reviews, ...reviews]
      : [];

  return (
    <section id="avis" className="py-32 px-6 sm:px-12 lg:px-16 bg-[#07090D] border-t border-white/10 font-mono">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <span className="data-badge data-badge-laser">
              <DecryptedText text="RETOUR D'EXPÉRIENCE · AVIS ÉLÈVES" />
            </span>
            <h2 className="text-4xl sm:text-6xl font-display text-white tracking-wider">
              RÉSULTATS VALIDÉS PAR <span className="text-[#FF7582]">LES JOUEURS</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/50 max-w-xl leading-relaxed">
              Des retours réels et vérifiés d&apos;élèves coachés par Poulpy.
            </p>
          </div>

          {reviews.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={prevReview}
                aria-label="Avis précédent"
                className="w-10 h-10 border border-white/20 bg-black flex items-center justify-center hover:border-[#FF7582] hover:text-[#FF7582] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-white/60 font-bold tracking-widest">
                {String(activeIdx + 1).padStart(2, "0")} / {String(reviews.length).padStart(2, "0")}
              </span>
              <button
                onClick={nextReview}
                aria-label="Avis suivant"
                className="w-10 h-10 border border-white/20 bg-black flex items-center justify-center hover:border-[#FF7582] hover:text-[#FF7582] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Infinite Live Ticker Bar (Never pauses on hover) */}
        {marqueeItems.length > 0 && (
          <div className="overflow-hidden border-y border-white/10 py-3 bg-black/60 relative">
            <div className="animate-marquee gap-8 text-xs font-mono tracking-wider">
              {marqueeItems.map((r, i) => {
                const parsed = parseRank(r.rank);
                return (
                  <div key={`${r.id}-${i}`} className="flex items-center gap-3 shrink-0">
                    <span className="w-1.5 h-1.5 bg-[#A4DE87] animate-ping" />
                    <span className="text-white font-bold">{r.name}</span>
                    <span className="text-white/40">[{r.game.toUpperCase()}]</span>
                    <span className="text-white/60">{parsed.before}</span>
                    <span className="text-[#A4DE87]">➔ {parsed.after}</span>
                    <span className="data-badge data-badge-acid text-[9px]">{parsed.gain}</span>
                    <span className="text-white/20 ml-4">//</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Testimonial Card */}
        {isLoading ? (
          <div className="py-20 text-center text-white/40 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF7582]" />
            <span className="text-xs">Chargement des avis vérifiés...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center text-white/40 space-y-3 bg-black/40 border border-white/10 p-8">
            <MessageSquare className="w-8 h-8 text-white/20 mx-auto" />
            <p className="text-sm text-white/70 font-bold">AUCUN AVIS SÉLECTIONNÉ</p>
            <p className="text-xs text-white/40">
              Les administrateurs peuvent ajouter des avis à l&apos;accueil depuis la page des avis.
            </p>
          </div>
        ) : current ? (
          <div className="relative min-h-[340px]">
            <div
              key={current.id}
              className="reticle-box p-8 sm:p-12 bg-[#040404]/95 border border-white/10 space-y-8 relative overflow-hidden transition-all duration-300 shadow-[0_0_30px_rgba(143,175,212,0.08)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FF7582] text-black font-bold flex items-center justify-center text-sm shadow-[0_0_15px_rgba(255,117,130,0.35)]">
                    {current.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wider">{current.name}</h3>
                    <span className="text-xs text-[#8FAFD4] uppercase font-bold">{current.game}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-[#FF7582]">
                    {[...Array(current.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="data-badge data-badge-acid text-[10px]">
                    {current.game.toUpperCase()}
                  </span>
                </div>
              </div>

              <p className="text-sm sm:text-lg text-white/90 leading-relaxed italic relative z-10 whitespace-pre-wrap">
                &ldquo;{current.text}&rdquo;
              </p>

              {/* Progression Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10 relative z-10">
                <div className="p-3 bg-black/80 border border-white/5 space-y-1">
                  <span className="text-[10px] text-white/40 block">RANG INITIAL</span>
                  <span className="text-base font-bold text-white/60">{currentParsed.before}</span>
                </div>

                <div className="p-3 bg-black/80 border border-white/5 space-y-1">
                  <span className="text-[10px] text-white/40 block">RANG ATTEINT / ACTUEL</span>
                  <span className="text-base font-bold text-[#A4DE87]">{currentParsed.after}</span>
                </div>

                <div className="p-3 bg-black/80 border border-white/5 space-y-1">
                  <span className="text-[10px] text-white/40 block">STATUT DE VALIDATION</span>
                  <span className="text-base font-bold text-[#8FAFD4]">{currentParsed.gain}</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

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
