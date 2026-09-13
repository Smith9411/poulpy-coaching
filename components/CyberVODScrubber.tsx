"use client";

import React, { useState } from "react";
import { Play, Pause, RotateCcw, Eye, Crosshair, ChevronRight, Video } from "lucide-react";
import DecryptedText from "./DecryptedText";

export default function CyberVODScrubber() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [scrub, setScrub] = useState<number>(38);
  const [sightlines, setSightlines] = useState<boolean>(true);
  const [activeLogIdx, setActiveLogIdx] = useState<number>(0);

  const logs = [
    {
      time: "03:12.45",
      title: "PEEK OFFENSIF // B-MAIN ASCENT",
      verdict: "DÉFAUT D'ALIGNEMENT (-14PX)",
      desc: "Décalage au counter-strafe incomplet. Le réticule est resté bloqué 4 frames trop bas avant le tir tête.",
      severity: "CRITIQUE",
    },
    {
      time: "08:44.10",
      title: "ISOLATION 1V1 // SITE BIND",
      verdict: "TIMING DE JEU OPTIMISÉ (+120MS)",
      desc: "Prise d'angle en micro-jiggle pour forcer le tir adverse dans le mur avant de punir au retour.",
      severity: "EXCELLENT",
    },
    {
      time: "15:20.80",
      title: "CLUTCH 1V2 // APEX FINAL RING",
      verdict: "DÉCISIONNEL TACTIQUE HOMOLOGUÉ",
      desc: "Utilisation du bouclier ennemi à terre comme cover dynamique. Réinitialisation du bouclier en 3.2s.",
      severity: "OPTIMAL",
    },
  ];

  return (
    <div className="reticle-box p-6 sm:p-8 bg-[#040404] space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.08)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="data-badge data-badge-laser">VOD LAB CHIRURGICAL</span>
            <span className="text-white/40">4K 60FPS ANALYZER</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-display text-white tracking-wider">
            DÉCOUPAGE D&apos;ANGLES &amp; SIGHTLINES EN DUEL
          </h3>
        </div>

        <button
          onClick={() => setSightlines(!sightlines)}
          className={`btn-cyber-ghost text-xs py-1.5 px-3 ${
            sightlines ? "border-[#00f0ff] text-[#00f0ff]" : ""
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>LIGNES DE VUE: {sightlines ? "ON" : "OFF"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Scrubber Viewport */}
        <div className="lg:col-span-8 bg-[#000000] border border-[rgba(255,255,255,0.08)] p-6 space-y-4">
          <div className="relative aspect-[16/9] w-full bg-[#030303] border border-white/5 flex items-center justify-center overflow-hidden">
            {/* Tactical Grid */}
            <div className="absolute inset-0 cyber-grid opacity-30" />

            {/* Geometry Site Walls */}
            <div className="absolute w-44 h-28 border border-[rgba(0,255,65,0.3)] bg-[rgba(0,255,65,0.02)]" />
            <div className="absolute top-1/4 left-1/4 w-32 h-20 border border-[rgba(0,240,255,0.2)]" />

            {/* Player Point */}
            <div
              className="absolute w-4 h-4 bg-[#00ff41] border border-white shadow-[0_0_12px_#00ff41] transition-all duration-150"
              style={{
                left: `${scrub * 0.7 + 15}%`,
                top: `${46 + Math.sin(scrub * 0.1) * 10}%`,
              }}
            />

            {/* Sightlines Laser Cone */}
            {sightlines && (
              <div
                className="absolute pointer-events-none transition-all duration-150"
                style={{
                  left: `${scrub * 0.7 + 15}%`,
                  top: `${46 + Math.sin(scrub * 0.1) * 10}%`,
                  transform: "translate(-10%, -50%) rotate(20deg)",
                  width: "220px",
                  height: "90px",
                  background: "linear-gradient(to right, rgba(0,240,255,0.35), transparent)",
                  clipPath: "polygon(0 50%, 100% 0, 100% 100%)",
                }}
              />
            )}

            {/* Target Opponent */}
            <div className="absolute right-[22%] top-[40%] w-5 h-5 border border-[#ff0033] bg-[#ff0033]/20 flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-[#ff0033]" />
            </div>

            {/* Reticle error readout */}
            <div className="absolute bottom-3 right-3 font-mono text-[10px] text-[#00ff41] bg-black/80 px-2 py-1 border border-white/10">
              FRAME: 0{Math.round(scrub * 14.4)} // SIGHT_CONE: 48°
            </div>
          </div>

          {/* Scrubber Playback Controls */}
          <div className="space-y-2 font-mono">
            <div className="flex items-center justify-between text-xs text-white/60">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-7 h-7 bg-white text-black flex items-center justify-center font-bold hover:bg-[#00ff41] transition-colors"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                </button>
                <span>
                  {logs[activeLogIdx].time} / 22:15.00
                </span>
              </div>
              <span className="text-[11px] text-[#00f0ff] uppercase">
                {logs[activeLogIdx].title}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={scrub}
              onChange={(e) => setScrub(Number(e.target.value))}
              className="w-full accent-[#00ff41] cursor-pointer h-1.5 bg-white/10"
            />
          </div>
        </div>

        {/* Timestamp Event Logs */}
        <div className="lg:col-span-4 space-y-3 font-mono">
          <span className="text-xs text-white/50 tracking-wider uppercase block">
            ANALYSE SÉQUENTIELLE EN DIRECT :
          </span>

          {logs.map((log, idx) => (
            <div
              key={log.time}
              onClick={() => {
                setActiveLogIdx(idx);
                setScrub(idx === 0 ? 25 : idx === 1 ? 55 : 88);
              }}
              className={`p-4 border cursor-pointer transition-all space-y-1.5 ${
                activeLogIdx === idx
                  ? "bg-black/90 border-[#00ff41] shadow-[0_0_15px_rgba(0,255,65,0.15)]"
                  : "bg-black/40 border-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#00ff41] font-bold">{log.time}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 uppercase font-bold ${
                    log.severity === "CRITIQUE"
                      ? "bg-[#ff0033]/20 text-[#ff0033] border border-[#ff0033]/40"
                      : "bg-[#00ff41]/20 text-[#00ff41] border border-[#00ff41]/40"
                  }`}
                >
                  {log.severity}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white uppercase">{log.title}</h4>
              <p className="text-[10px] text-white/50 leading-relaxed">{log.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
