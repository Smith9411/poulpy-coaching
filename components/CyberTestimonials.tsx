"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Star, ChevronLeft, ChevronRight, MessageSquare, Loader2, ArrowRight } from "lucide-react";

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

  // Helper to format rank cleanly
  const formatRank = (rankStr?: string) => {
    if (!rankStr) return "";
    return rankStr.replace(/->/g, "➔").replace(/→/g, "➔");
  };

  // Repeat reviews for smooth ticker
  const marqueeItems =
    reviews.length > 0
      ? reviews.length < 5
        ? [...reviews, ...reviews, ...reviews, ...reviews]
        : [...reviews, ...reviews]
      : [];

  return (
    <section id="avis" className="py-20 sm:py-24 px-6 sm:px-12 lg:px-16 bg-transparent font-mono relative z-10">
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <h2 className="text-4xl sm:text-6xl font-display text-[#F5F4F0] tracking-wider">
              RÉSULTATS DES <span className="text-[#00B4A0]">ÉLÈVES</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#F5F4F0]/60 max-w-xl leading-relaxed">
              Retours d&apos;expérience d&apos;élèves coachés.
            </p>
          </div>

          {reviews.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={prevReview}
                aria-label="Avis précédent"
                className="w-11 h-11 border border-white/15 bg-[#121117] rounded-2xl flex items-center justify-center text-white hover:border-[#CA1C30] hover:text-[#CA1C30] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-[#F5F4F0]/60 font-bold tracking-widest px-2">
                <span className="text-[#CA1C30]">{String(activeIdx + 1).padStart(2, "0")}</span> / {String(reviews.length).padStart(2, "0")}
              </span>
              <button
                onClick={nextReview}
                aria-label="Avis suivant"
                className="w-11 h-11 border border-white/15 bg-[#121117] rounded-2xl flex items-center justify-center text-white hover:border-[#CA1C30] hover:text-[#CA1C30] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Live Ticker Bar */}
        {marqueeItems.length > 0 && (
          <div className="overflow-hidden border-y border-white/10 py-3.5 bg-[#121117]/80 relative rounded-full">
            <div className="animate-marquee gap-8 text-xs font-mono tracking-wider">
              {marqueeItems.map((r, i) => (
                <div key={`${r.id}-${i}`} className="flex items-center gap-3 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CA1C30]" />
                  <span className="text-[#F5F4F0] font-bold">{r.name}</span>
                  <span className="text-[#F5F4F0]/40">[{r.game.toUpperCase()}]</span>
                  {r.rank && <span className="text-[#00B4A0]">{formatRank(r.rank)}</span>}
                  <span className="text-white/20 ml-4">//</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clean Vignette (Même DA : un haut avec point rouge, pas de bord extérieur, non cliquable) */}
        {isLoading ? (
          <div className="py-20 text-center text-[#F5F4F0]/40 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#CA1C30]" />
            <span className="text-xs">Chargement des avis...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center text-[#F5F4F0]/40 space-y-3 bg-[#121417]/95 rounded-3xl p-8">
            <MessageSquare className="w-8 h-8 text-white/20 mx-auto" />
            <p className="text-sm text-[#F5F4F0]/70 font-bold">AUCUN AVIS SÉLECTIONNÉ</p>
          </div>
        ) : current ? (
          <div className="relative">
            <div
              key={current.id}
              className="p-8 sm:p-12 bg-[#121417]/95 backdrop-blur-xl rounded-3xl space-y-8 relative overflow-hidden transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.85)] select-none"
            >
              {/* Top Header Row (Épuré comme les autres vignettes : point rouge, label & étoiles) */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#CA1C30] shadow-[0_0_10px_#CA1C30]" />
                  <span className="text-xs font-mono tracking-widest text-[#F5F4F0]/60 uppercase">
                    TÉMOIGNAGE ÉLÈVE · {current.game.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[#00B4A0]">
                  {[...Array(current.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>

              {/* Student Identity */}
              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-[#F5F4F0]">
                  {current.name}
                </h3>
                {current.rank && (
                  <p className="text-xs sm:text-sm font-mono font-semibold text-[#00B4A0]">
                    {formatRank(current.rank)}
                  </p>
                )}
              </div>

              {/* Testimonial Quote */}
              <p className="text-base sm:text-lg text-[#F5F4F0]/85 max-w-4xl leading-relaxed font-sans italic whitespace-pre-wrap">
                &ldquo;{current.text}&rdquo;
              </p>
            </div>
          </div>
        ) : null}

        {/* Action button */}
        <div className="text-center pt-2">
          <Link
            href="/avis"
            className="btn-cyber-primary px-8 py-3.5 text-xs font-bold font-mono tracking-wider cursor-pointer inline-flex items-center gap-2"
          >
            <span>CONSULTER LES AVIS</span>
            <ArrowRight className="w-3.5 h-3.5 text-black" />
          </Link>
        </div>
      </div>
    </section>
  );
}
