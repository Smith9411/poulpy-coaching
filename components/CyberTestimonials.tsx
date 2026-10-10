"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
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
  admin_response?: string | null;
}

const slideVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 28 : -28,
    opacity: 0,
    filter: "blur(4px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.28,
      ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
    },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -28 : 28,
    opacity: 0,
    filter: "blur(4px)",
    transition: {
      duration: 0.22,
      ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
    },
  }),
};

export default function CyberTestimonials() {
  const [reviews, setReviews] = useState<RealReview[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState<1 | -1>(1);

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
    // Postpone below-the-fold reviews fetch until after hero 3D intro animation fully completes
    const timer = setTimeout(() => {
      fetchFeaturedReviews();
    }, 7000);
    return () => clearTimeout(timer);
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
    setDirection(1);
    setActiveIdx((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    if (reviews.length === 0) return;
    setDirection(-1);
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
        
        {/* Section Header with Sleek Minimalist Navigation Controls */}
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
            <div className="flex items-center gap-5 sm:gap-6 select-none">
              <button
                onClick={prevReview}
                aria-label="Avis précédent"
                className="group flex items-center gap-1.5 text-xs text-[#F5F4F0]/50 hover:text-white transition-colors cursor-pointer font-bold tracking-wider py-1.5"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">PRÉCÉDENT</span>
              </button>

              <div className="flex items-center gap-2">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setDirection(i > activeIdx ? 1 : -1);
                      setActiveIdx(i);
                    }}
                    aria-label={`Avis ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      i === activeIdx
                        ? "w-7 bg-[#00B4A0] shadow-[0_0_10px_rgba(0,180,160,0.5)]"
                        : "w-2 bg-white/15 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextReview}
                aria-label="Avis suivant"
                className="group flex items-center gap-1.5 text-xs text-[#F5F4F0]/50 hover:text-white transition-colors cursor-pointer font-bold tracking-wider py-1.5"
              >
                <span className="hidden sm:inline">SUIVANT</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>

        {/* Live Ticker Bar with subtle edge gradient mask */}
        {marqueeItems.length > 0 && (
          <div className="overflow-hidden border-y border-white/10 py-3.5 bg-[#121117]/80 relative rounded-full [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="animate-marquee gap-8 text-xs font-mono tracking-wider">
              {marqueeItems.map((r, i) => (
                <div key={`${r.id}-${i}`} className="flex items-center gap-3 shrink-0">
                  <span className="text-[#F5F4F0] font-bold">{r.name}</span>
                  <span className="text-[#F5F4F0]/40">[{r.game.toUpperCase()}]</span>
                  {r.rank && <span className="text-[#00B4A0]">{formatRank(r.rank)}</span>}
                  <span className="text-[#CA1C30]/40 ml-4 font-bold select-none">//</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clean Vignette with Silky Directional Motion Transition */}
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
          <div className="relative min-h-[280px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="p-8 sm:p-12 bg-[#121417]/95 backdrop-blur-xl rounded-3xl space-y-8 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] select-none"
              >
                {/* Subtle Ambient Glows */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-[#CA1C30]/[0.035] rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#00B4A0]/[0.025] rounded-full blur-3xl pointer-events-none" />

                {/* Editorial Watermark Quote */}
                <span className="absolute right-8 -bottom-6 text-8xl font-serif text-white/[0.03] select-none pointer-events-none leading-none">
                  &rdquo;
                </span>

                {/* Top Header Row (Sans pastille, nom du jeu & 5 étoiles fixes) */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
                  <span className="text-xs font-mono tracking-widest text-[#F5F4F0]/60 uppercase font-bold">
                    {current.game.toUpperCase()}
                  </span>
                  
                  {/* Fixed 5-star container: prevents star shifting/bugging when rating varies */}
                  <div
                    className="flex items-center gap-1.5 shrink-0"
                    aria-label={`${current.rating || 5} étoiles sur 5`}
                  >
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const isFilled = starVal <= (current.rating || 5);
                      return (
                        <Star
                          key={starVal}
                          className={`w-3.5 h-3.5 shrink-0 transition-colors duration-200 ${
                            isFilled
                              ? "fill-[#00B4A0] text-[#00B4A0]"
                              : "fill-transparent text-white/15"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Student Identity */}
                <div className="space-y-1 relative z-10">
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
                <p className="text-base sm:text-lg text-[#F5F4F0]/85 max-w-4xl leading-relaxed font-sans italic whitespace-pre-wrap relative z-10">
                  &ldquo;{current.text}&rdquo;
                </p>

                {/* Coach debrief if available */}
                {current.admin_response && (
                  <div className="pt-4 border-t border-white/5 flex items-start gap-2 relative z-10">
                    <span className="text-xs font-mono font-bold text-[#CA1C30] shrink-0">Poulpy :</span>
                    <p className="text-xs sm:text-sm text-[#F5F4F0]/70 font-sans italic leading-relaxed">
                      &ldquo;{current.admin_response}&rdquo;
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
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
