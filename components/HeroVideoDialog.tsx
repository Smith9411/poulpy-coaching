"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";

export interface HeroVideoDialogProps {
  animationStyle?: "from-center" | "from-top" | "from-bottom" | "from-left" | "from-right" | "fade";
  videoSrc: string;
  thumbnailSrc?: string;
  thumbnailAlt?: string;
  className?: string;
}

export function getYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

const animationVariants = {
  "from-center": {
    initial: { scale: 0.9, opacity: 0, y: 15 },
    animate: { scale: 1, opacity: 1, y: 0 },
    exit: { scale: 0.94, opacity: 0, y: 10 },
  },
  "from-top": {
    initial: { y: -60, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -40, opacity: 0 },
  },
  "from-bottom": {
    initial: { y: 60, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 40, opacity: 0 },
  },
  "from-left": {
    initial: { x: -60, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  },
  "from-right": {
    initial: { x: 60, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 40, opacity: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
};

export function HeroVideoDialog({
  animationStyle = "from-center",
  videoSrc,
  thumbnailSrc,
  thumbnailAlt = "Aperçu de la vidéo",
  className = "",
}: HeroVideoDialogProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>("");

  const ytId = getYoutubeVideoId(videoSrc);

  useEffect(() => {
    if (thumbnailSrc) {
      setImgSrc(thumbnailSrc);
    } else if (ytId) {
      setImgSrc(`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`);
    } else {
      setImgSrc("/poulpy-profile.png");
    }
  }, [thumbnailSrc, ytId]);

  // Handle ESC key press to close dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsVideoOpen(false);
      }
    };
    if (isVideoOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVideoOpen]);

  // Build autoplay embed URL
  const getEmbedUrl = () => {
    if (!videoSrc) return "";
    let embed = videoSrc;
    if (ytId && !embed.includes("embed")) {
      embed = `https://www.youtube-nocookie.com/embed/${ytId}`;
    }
    const separator = embed.includes("?") ? "&" : "?";
    return `${embed}${separator}autoplay=1&rel=0&modestbranding=1`;
  };

  const selectedAnimation = animationVariants[animationStyle] || animationVariants["from-center"];

  return (
    <div className={`relative ${className}`}>
      {/* Video Thumbnail Trigger Card */}
      <div
        onClick={() => setIsVideoOpen(true)}
        className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/15 bg-[#121117] transition-all duration-500 hover:border-[#CA1C30]/50 hover:shadow-[0_0_45px_rgba(202,28,48,0.25)] shadow-[0_15px_40px_rgba(0,0,0,0.8)]"
      >
        {/* Aspect Ratio 16:9 Container with slight crop to remove compression edge lines */}
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-[#0B0A0D]">
          {/* Main Thumbnail Image (scale 1.04 to perfectly crop any edge line/green line) */}
          <img
            src={imgSrc}
            alt={thumbnailAlt}
            onError={() => {
              if (ytId && imgSrc.includes("maxresdefault")) {
                setImgSrc(`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`);
              }
            }}
            className="h-full w-full object-cover scale-[1.04] filter contrast-[1.06] brightness-95 transition-transform duration-700 ease-out group-hover:scale-[1.08] group-hover:brightness-105"
            loading="lazy"
          />

          {/* Subtle Dark Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A0D]/70 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors duration-500 pointer-events-none" />

          {/* Center Luxury Glowing Play Button */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative flex items-center justify-center">
              {/* Outer Pulsing Halo */}
              <div className="absolute -inset-3 rounded-full bg-[#CA1C30] opacity-40 blur-md group-hover:opacity-75 transition-opacity duration-500 animate-pulse" />
              <div className="absolute -inset-6 rounded-full bg-[#CA1C30]/20 animate-ping pointer-events-none" />

              {/* Main Circular Button */}
              <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-[#CA1C30] text-black shadow-[0_0_30px_rgba(202,28,48,0.6)] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#E82C40] group-hover:shadow-[0_0_40px_rgba(202,28,48,0.85)]">
                <Play className="h-6 w-6 sm:h-8 sm:w-8 fill-black translate-x-0.5 transition-transform duration-300 group-hover:scale-110" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cinematic Modal Dialog */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/90 backdrop-blur-2xl font-mono"
            onClick={() => setIsVideoOpen(false)}
          >
            {/* Modal Wrapper with sleek neutral border (no red border) */}
            <motion.div
              initial={selectedAnimation.initial}
              animate={selectedAnimation.animate}
              exit={selectedAnimation.exit}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl rounded-3xl border border-white/15 bg-[#0B0A0D] p-2 sm:p-3 shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden"
            >
              {/* Floating Close Button */}
              <button
                onClick={() => setIsVideoOpen(false)}
                aria-label="Fermer la vidéo"
                className="absolute -top-12 right-0 sm:top-4 sm:right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>

              {/* 16:9 Video Frame */}
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
                <iframe
                  src={getEmbedUrl()}
                  title="Poulpy Video Player"
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HeroVideoDialog;
