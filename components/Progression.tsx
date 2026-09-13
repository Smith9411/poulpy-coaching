"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Target, Zap, Activity, BarChart3, ChevronRight, Shield } from "lucide-react";
import DecryptedText from "./DecryptedText";

interface Metric {
  label: string;
  subLabel: string;
  value: number;
  color: string;
  accent: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SessionData {
  s: string;
  rr: number;
}

interface GameView {
  label: string;
  tag: string;
  description: string;
  metrics: Metric[];
  sessions: SessionData[];
  strokeColor: string;
  fillColor: string;
  pointColor: string;
}

const views: Record<"global" | "valorant" | "apex", GameView> = {
  global: {
    label: "GLOBAL TELEMETRY",
    tag: "TOUS TITRES CONFONDUS",
    description: "Moyenne pondérée des performances mécaniques et cognitives mesurées sur l'ensemble de nos élèves actifs.",
    metrics: [
      { label: "AIM SCORE", subLabel: "FLICK / TRACKING SUB-PIXEL", value: 78, color: "#00ff41", accent: "rgba(0,255,65,0.2)", icon: Target },
      { label: "GAME SENSE", subLabel: "MACRO & VISION TACTIQUE", value: 72, color: "#00f0ff", accent: "rgba(0,240,255,0.2)", icon: Zap },
      { label: "MOUVEMENT", subLabel: "FLUIDITÉ & TIMING DEADZONE", value: 68, color: "#ff0033", accent: "rgba(255,0,51,0.2)", icon: Activity },
      { label: "CONSISTENCY", subLabel: "RÉGULARITÉ EN CLUTCH", value: 81, color: "#00ff41", accent: "rgba(0,255,65,0.2)", icon: BarChart3 },
    ],
    sessions: [
      { s: "S1 // AUDIT", rr: 0 },
      { s: "S2 // DRILL", rr: 18 },
      { s: "S3 // CALIB", rr: 42 },
      { s: "S4 // REPAIR", rr: 71 },
      { s: "S5 // MASTERY", rr: 105 },
    ],
    strokeColor: "#00ff41",
    fillColor: "rgba(0,255,65,0.15)",
    pointColor: "#00ff41",
  },
  valorant: {
    label: "VALORANT PROTOCOL",
    tag: "RIOT COMPETITIVE // IMMORTAL+",
    description: "Métriques spécifiques à l'écosystème Valorant : crosshair placement, first-bullet accuracy et timing d'utilitaires.",
    metrics: [
      { label: "AIM SCORE", subLabel: "HEADSHOT % & FIRST-BULLET", value: 84, color: "#00f0ff", accent: "rgba(0,240,255,0.2)", icon: Target },
      { label: "GAME SENSE", subLabel: "ROTATIONS & UTIL TIMING", value: 76, color: "#00ff41", accent: "rgba(0,255,65,0.2)", icon: Zap },
      { label: "MOUVEMENT", subLabel: "COUNTER-STRAFING & JIGGLE", value: 74, color: "#ff0033", accent: "rgba(255,0,51,0.2)", icon: Activity },
      { label: "CONSISTENCY", subLabel: "K/D RATIO EN SITUATION DE RETAKE", value: 86, color: "#00f0ff", accent: "rgba(0,240,255,0.2)", icon: BarChart3 },
    ],
    sessions: [
      { s: "S1 // AUDIT", rr: 0 },
      { s: "S2 // DRILL", rr: 22 },
      { s: "S3 // CALIB", rr: 48 },
      { s: "S4 // REPAIR", rr: 80 },
      { s: "S5 // MASTERY", rr: 120 },
    ],
    strokeColor: "#00f0ff",
    fillColor: "rgba(0,240,255,0.15)",
    pointColor: "#00f0ff",
  },
  apex: {
    label: "APEX LEGENDS MATRIX",
    tag: "ALGS PREDATOR STANDARD",
    description: "Métriques axées sur les combats haute vélocité : tracking continu, tap-strafing, shield-swap et rotations de zone.",
    metrics: [
      { label: "AIM SCORE", subLabel: "SMG TRACKING & BEAM ACCURACY", value: 88, color: "#ff0033", accent: "rgba(255,0,51,0.2)", icon: Target },
      { label: "GAME SENSE", subLabel: "ZONE READING & THIRD-PARTY", value: 79, color: "#00ff41", accent: "rgba(0,255,65,0.2)", icon: Zap },
      { label: "MOUVEMENT", subLabel: "TAP-STRAFE / WALLBOUNCE / EVASION", value: 92, color: "#00f0ff", accent: "rgba(0,240,255,0.2)", icon: Activity },
      { label: "CONSISTENCY", subLabel: "SURVIVAL TIME & TOP 3 FINISH", value: 75, color: "#ff0033", accent: "rgba(255,0,51,0.2)", icon: BarChart3 },
    ],
    sessions: [
      { s: "S1 // AUDIT", rr: 0 },
      { s: "S2 // DRILL", rr: 15 },
      { s: "S3 // CALIB", rr: 38 },
      { s: "S4 // REPAIR", rr: 65 },
      { s: "S5 // MASTERY", rr: 95 },
    ],
    strokeColor: "#ff0033",
    fillColor: "rgba(255,0,51,0.15)",
    pointColor: "#ff0033",
  },
};

export default function Progression() {
  const [activeTab, setActiveTab] = useState<"global" | "valorant" | "apex">("global");
  const view = views[activeTab];

  const chartW = 540;
  const chartH = 320;
  const maxRR = 130;
  const padX = 45;
  const padY = 40;
  const usableW = chartW - padX * 2;
  const usableH = chartH - padY * 2;

  const points = view.sessions.map((d, i) => {
    const x = padX + (i / (view.sessions.length - 1)) * usableW;
    const y = padY + (1 - d.rr / maxRR) * usableH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartH - 35} L ${points[0].x} ${chartH - 35} Z`;

  const scrollToBooking = () => {
    const el = document.getElementById("booking");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="progression" className="py-24 px-6 lg:px-12 bg-black border-t border-[rgba(255,255,255,0.08)] font-mono">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <span className="data-badge data-badge-acid">
              <DecryptedText text="SUIVI MÉTRIQUE RIGOUREUX // TELEMETRY" />
            </span>
            <h2 className="text-4xl sm:text-6xl font-display text-white tracking-wider">
              TA PROGRESSION <span className="text-[#00ff41]">VISUALISÉE</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/50 max-w-xl leading-relaxed">
              Après chaque session. Visualise objectivement tes gains de performance, ton taux de conversion de duels et ton ascension en RR/LP.
            </p>
          </div>

          {/* Tab Switchers */}
          <div className="flex items-center gap-2 border border-white/15 bg-[#040404] p-1">
            {(["global", "valorant", "apex"] as const).map((key) => {
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-2 text-xs uppercase font-bold transition-all ${
                    active
                      ? "bg-[#00ff41] text-black shadow-[0_0_15px_rgba(0,255,65,0.3)]"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {key === "global" ? "GLOBAL" : key === "valorant" ? "VALORANT" : "APEX"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Analytics Brutalist Frame */}
        <div className="reticle-box bg-[#040404] border border-white/10 overflow-hidden">
          {/* Terminal Sub-header */}
          <div className="px-6 py-3 border-b border-white/10 bg-black/80 flex flex-wrap items-center justify-between text-xs text-white/40 gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-[#00ff41] animate-pulse" />
              <span className="text-white font-bold">{view.label}</span>
              <span className="text-white/30">//</span>
              <span>{view.tag}</span>
            </div>
            <div className="text-[11px] text-white/50">
              GAINS MOYENS CONSTATÉS: <span className="text-[#00ff41] font-bold">+105 à +120 RR EN 5 SÉANCES</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            {/* Left: Ascension Curve */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#00ff41]" />
                  <span className="text-sm font-bold text-white tracking-wider">
                    COURBE D&apos;ASCENSION COMPETITIVE
                  </span>
                </div>
                <span className="text-xs text-white/40 font-mono">GAIN CUMULÉ RR / LP</span>
              </div>

              {/* Chart SVG */}
              <div className="w-full aspect-[16/9] min-h-[260px] relative">
                <svg
                  viewBox={`0 0 ${chartW} ${chartH}`}
                  className="w-full h-full"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={view.strokeColor} stopOpacity="0.25" />
                      <stop offset="100%" stopColor={view.strokeColor} stopOpacity="0" />
                    </linearGradient>
                    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Grid Lines */}
                  {[0, 25, 50, 75, 100].map((pct) => {
                    const y = padY + (1 - pct / 100) * usableH;
                    return (
                      <g key={pct}>
                        <line
                          x1={padX}
                          y1={y}
                          x2={chartW - 20}
                          y2={y}
                          stroke="rgba(255,255,255,0.08)"
                          strokeDasharray="2,4"
                          strokeWidth={1}
                        />
                        <text
                          x={padX - 8}
                          y={y + 3}
                          textAnchor="end"
                          fill="rgba(255,255,255,0.3)"
                          fontSize={9}
                          fontFamily="monospace"
                        >
                          {pct}%
                        </text>
                      </g>
                    );
                  })}

                  {/* Area Fill Animated */}
                  <motion.path
                    key={`area-${activeTab}`}
                    d={areaPath}
                    fill="url(#chartGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.3 }}
                  />

                  {/* Main Line with Motion Draw & Neon Glow */}
                  <motion.path
                    key={`line-${activeTab}`}
                    d={linePath}
                    stroke={view.strokeColor}
                    strokeWidth={3}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#neonGlow)"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.4, ease: [0.23, 1, 0.32, 1] }}
                  />

                  {/* Animated Points, Glow Rings & Labels */}
                  {points.map((p, idx) => (
                    <motion.g
                      key={`${activeTab}-${idx}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 + idx * 0.15, duration: 0.5, ease: "easeOut" }}
                    >
                      {/* Outer Ping Glow on last point */}
                      {idx === points.length - 1 && (
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={12}
                          fill="none"
                          stroke={view.strokeColor}
                          strokeWidth={1.5}
                          className="animate-ping"
                          opacity={0.6}
                        />
                      )}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={5.5}
                        fill="#000000"
                        stroke={view.strokeColor}
                        strokeWidth={2.5}
                      />
                      <circle cx={p.x} cy={p.y} r={2} fill="#ffffff" />
                      <text
                        x={p.x}
                        y={p.y - 14}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize={11}
                        fontWeight="bold"
                        fontFamily="monospace"
                        className="drop-shadow-[0_0_8px_rgba(0,0,0,0.9)]"
                      >
                        +{p.rr} RR
                      </text>
                      <text
                        x={p.x}
                        y={chartH - 12}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.6)"
                        fontSize={9}
                        fontFamily="monospace"
                      >
                        {p.s}
                      </text>
                    </motion.g>
                  ))}
                </svg>
              </div>

              <div className="text-[11px] text-white/40 pt-2 border-t border-white/5 flex items-center justify-between">
                <span>MESURE PROTOCOLAIRE // 5 SEMAINES</span>
                <span className="text-[#00ff41]">+100% SUCCÈS CLUTCH</span>
              </div>
            </div>

            {/* Right: Telemetry Metrics Meters */}
            <div className="lg:col-span-5 p-6 sm:p-8 space-y-6 flex flex-col justify-between bg-black/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#00f0ff]" />
                  <span className="text-sm font-bold text-white tracking-wider">
                    SCORES D&apos;ÉVALUATION
                  </span>
                </div>
                <span className="text-xs text-white/40">CALIBRATION 0-100</span>
              </div>

              <div className="space-y-6">
                {view.metrics.map((m, idx) => {
                  const Icon = m.icon;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-white/50" />
                          <div>
                            <span className="font-bold text-white tracking-wide">{m.label}</span>
                            <span className="text-[10px] text-white/40 block">{m.subLabel}</span>
                          </div>
                        </div>
                        <span className="font-mono text-base font-bold text-white">{m.value}%</span>
                      </div>

                      {/* Brutalist Progress Bar with Laser Pulse */}
                      <div className="h-2.5 w-full bg-white/5 border border-white/10 relative overflow-hidden">
                        <motion.div
                          key={`${activeTab}-${m.label}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${m.value}%` }}
                          transition={{ duration: 0.9, delay: idx * 0.1, ease: [0.23, 1, 0.32, 1] }}
                          className="h-full relative shadow-[0_0_12px_currentColor]"
                          style={{ backgroundColor: m.color, color: m.color }}
                        >
                          <span className="absolute right-0 top-0 bottom-0 w-2 bg-white shadow-[0_0_8px_#ffffff]" />
                        </motion.div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="text-[10px] text-white/40">
                  ÉVALUATION MISE À JOUR EN DIRECT APRÈS CHAQUE VOD REVIEW
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="px-6 py-5 bg-[#080808] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#00ff41]" />
              <div className="text-xs text-white/70">
                <span className="text-white font-bold">GARANTIE D&apos;ÉLÉVATION COMPÉTITIVE :</span> Montée de palier minimum de +1 division ou séances offertes.
              </div>
            </div>
            <button
              onClick={scrollToBooking}
              className="btn-cyber-primary py-2.5 px-6 text-xs whitespace-nowrap"
            >
              <span>RÉSERVER MON AUDIT DE DÉPART</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
