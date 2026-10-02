"use client";

import React, { useState } from "react";
import DecryptedText from "./DecryptedText";
import { Tv, ExternalLink, MessageCircle, Play, Radio } from "lucide-react";

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

  const youtubeUrl = "https://www.youtube.com/@Poulpy_C";
  const youtubeEmbed = "https://www.youtube-nocookie.com/embed/4gfWbGCA5q0";
  const twitchUrl = "https://www.twitch.tv/poulpy_coaching";

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
              onClick={() => setPlatform("youtube")}
              className={`px-6 py-2.5 text-xs font-bold uppercase rounded-full border transition-all flex items-center gap-2 cursor-pointer ${
                platform === "youtube"
                  ? "bg-[#CA1C30] text-black border-[#CA1C30] shadow-[0_0_20px_rgba(202, 28, 48,0.4)]"
                  : "bg-[#121117] text-[#F5F4F0]/60 border-white/15 hover:border-white/40"
              }`}
            >
              <YoutubeIcon className="w-4 h-4" />
              <span>YOUTUBE</span>
            </button>

            <button
              onClick={() => setPlatform("twitch")}
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

        {/* Video Player Frame with Cybercore Reticles */}
        <div className="reticle-box p-3 sm:p-4 bg-[#121117] rounded-3xl border border-white/15 relative shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Top Status Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#1A1822] rounded-xl border border-white/5 mb-3 text-[11px]">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${platform === "youtube" ? "bg-[#CA1C30]" : "bg-purple-500"}`} />
                <span className={`relative inline-flex h-2 w-2 rounded-full ${platform === "youtube" ? "bg-[#CA1C30]" : "bg-purple-500"}`} />
              </span>
              <span className="text-[#F5F4F0] font-bold tracking-wider">
                {platform === "youtube" ? "CANAL : YOUTUBE REPLAY · REVIEWS APEX & VALORANT" : "CANAL : TWITCH EN DIRECT · @POULPY_COACHING"}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-[#F5F4F0]/40 text-[10px]">
              <span>QUALITÉ 1080P60</span>
              <span>•</span>
              <span>AUDIO HI-FI</span>
            </div>
          </div>

          {/* Video Container (16:9 Aspect Ratio) */}
          <div className="relative w-full aspect-video bg-black rounded-2xl border border-white/10 overflow-hidden">
            {platform === "youtube" ? (
              <iframe
                src={youtubeEmbed}
                title="Poulpy YouTube"
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <iframe
                src="https://player.twitch.tv/?channel=poulpy_coaching&parent=localhost&parent=127.0.0.1&parent=poulpy-coaching.vercel.app"
                title="Poulpy Twitch"
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
              />
            )}
          </div>

          {/* Bottom Action / Links Row */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs">
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
                  className="px-5 py-2.5 rounded-full bg-[#CA1C30]/10 border border-[#CA1C30]/40 hover:bg-[#CA1C30]/20 text-[#CA1C30] hover:text-white transition-all flex items-center gap-1.5 font-bold text-[11px]"
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
                  className="px-5 py-2.5 rounded-full bg-purple-600/10 border border-purple-500/40 hover:bg-purple-600/20 text-purple-400 hover:text-white transition-all flex items-center gap-1.5 font-bold text-[11px]"
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
                className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-white/30 text-[#F5F4F0]/70 hover:text-white transition-all flex items-center gap-1.5 font-medium text-[11px]"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#5865F2]" />
                <span>DISCORD</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
