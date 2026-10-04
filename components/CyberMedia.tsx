"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DecryptedText from "./DecryptedText";
import { Tv, ExternalLink, MessageCircle } from "lucide-react";

export function YoutubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.016 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export function TwitchIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
    </svg>
  );
}

export default function CyberMedia() {
  const [platform, setPlatform] = useState<"youtube" | "twitch">("youtube");
  const [transitionKey, setTransitionKey] = useState(0);

  const youtubeUrl = "https://www.youtube.com/@Poulpy_C";
  const youtubeEmbed = "https://www.youtube-nocookie.com/embed/4gfWbGCA5q0";
  const twitchUrl = "https://www.twitch.tv/poulpy_coaching";
  const twitchEmbed = "https://player.twitch.tv/?channel=poulpy_coaching&parent=localhost&parent=127.0.0.1&parent=poulpy-coaching.vercel.app";

  const handleSwitchPlatform = (target: "youtube" | "twitch") => {
    if (target === platform) return;
    setPlatform(target);
    setTransitionKey((prev) => prev + 1);
  };

  return (
    <section id="media" className="py-14 sm:py-16 px-6 sm:px-12 lg:px-16 bg-transparent font-mono">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <h2 className="text-4xl sm:text-6xl font-display text-[#F5F4F0] tracking-wider">
              YOUTUBE &amp; <span className="text-[#CA1C30]">TWITCH</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#F5F4F0]/60 max-w-xl leading-relaxed">
              Sessions en direct, reviews VOD et replays d&apos;entraînement.
            </p>
          </div>

          {/* Platform Switcher Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSwitchPlatform("youtube")}
              className={`px-6 py-2.5 text-xs font-bold uppercase rounded-full border transition-all flex items-center gap-2 cursor-pointer ${
                platform === "youtube"
                  ? "bg-[#CA1C30] text-black border-[#CA1C30] shadow-[0_0_20px_rgba(202,28,48,0.4)]"
                  : "bg-[#121117] text-[#F5F4F0]/60 border-white/15 hover:border-white/40"
              }`}
            >
              <YoutubeIcon className="w-4 h-4" />
              <span>YOUTUBE</span>
            </button>

            <button
              onClick={() => handleSwitchPlatform("twitch")}
              className={`px-6 py-2.5 text-xs font-bold uppercase rounded-full border transition-all flex items-center gap-2 cursor-pointer ${
                platform === "twitch"
                  ? "bg-[#9146FF] text-white border-[#9146FF] shadow-[0_0_20px_rgba(145,70,255,0.4)]"
                  : "bg-[#121117] text-[#F5F4F0]/60 border-white/15 hover:border-white/40"
              }`}
            >
              <TwitchIcon className="w-4 h-4" />
              <span>TWITCH</span>
            </button>
          </div>
        </div>

        {/* Video Player Frame without background vignette */}
        <div className="relative w-full aspect-video bg-black rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden select-none shadow-2xl">
          {/* Base Layer: YouTube Player */}
          <div className="absolute inset-0 w-full h-full">
            <iframe
              src={youtubeEmbed}
              title="Poulpy YouTube"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Top Animated Layer: Twitch Player with Diagonal Slash Wipe */}
          <motion.div
            initial={false}
            animate={{
              clipPath:
                platform === "twitch"
                  ? "polygon(-25% 0%, 130% 0%, 105% 100%, -25% 100%)"
                  : "polygon(0% 0%, 0% 0%, -25% 100%, -25% 100%)",
            }}
            transition={{
              duration: 0.65,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute inset-0 w-full h-full z-10 bg-black"
          >
            <iframe
              src={twitchEmbed}
              title="Poulpy Twitch"
              className="w-full h-full border-0"
              allowFullScreen
            />
          </motion.div>

          {/* Glowing Diagonal Laser Slash Beam traveling across during transition */}
          <AnimatePresence>
            {transitionKey > 0 && (
              <motion.div
                key={transitionKey}
                initial={{
                  left: platform === "twitch" ? "-15%" : "115%",
                  opacity: 1,
                }}
                animate={{
                  left: platform === "twitch" ? "115%" : "-15%",
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 0.65,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute top-[-20%] bottom-[-20%] w-[3px] sm:w-[4px] z-30 pointer-events-none -skew-x-[20deg]"
                style={{
                  background:
                    platform === "twitch"
                      ? "linear-gradient(to bottom, #9146FF, #00B4A0, #9146FF)"
                      : "linear-gradient(to bottom, #CA1C30, #00B4A0, #CA1C30)",
                  boxShadow:
                    platform === "twitch"
                      ? "0 0 20px #9146FF, 0 0 40px #9146FF, 0 0 60px #00B4A0"
                      : "0 0 20px #CA1C30, 0 0 40px #CA1C30, 0 0 60px #00B4A0",
                }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Action / Links Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
          <div className="text-[#F5F4F0]/60 text-[11px]">
            {platform === "youtube" ? (
              <span>Chaîne officielle YouTube de Poulpy — VOD reviews, guides et démonstrations.</span>
            ) : (
              <span>Lives réguliers de coaching, questions-réponses et gameplay compétitif.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {platform === "youtube" ? (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cyber-primary px-5 py-2.5 text-[11px] font-bold tracking-wider uppercase cursor-pointer"
              >
                <YoutubeIcon className="w-3.5 h-3.5" />
                <span>OUVRIR SUR YOUTUBE</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            ) : (
              <a
                href={twitchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full bg-purple-600/20 border border-purple-500/50 hover:bg-purple-600/35 text-purple-300 hover:text-white transition-all flex items-center gap-1.5 font-bold text-[11px]"
              >
                <TwitchIcon className="w-3.5 h-3.5" />
                <span>OUVRIR SUR TWITCH</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            )}

            <a
              href="https://discord.gg/rJMg3ZZRkp"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cyber-ghost px-5 py-2.5 text-[11px] font-medium tracking-wider uppercase cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#5865F2]" />
              <span>DISCORD</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
