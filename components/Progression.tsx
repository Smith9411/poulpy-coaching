'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Target, Zap, Activity, BarChart3 } from 'lucide-react';
import { useState } from 'react';

// Data per game view: progress metrics + RR/LP curve
const views = {
  global: {
    label: 'Global',
    metrics: [
      { label: 'Aim Score', subLabel: 'Flick / Tracking', value: 78, color: 'from-cyan-500 to-cyan-400', icon: Target },
      { label: 'Game Sense', subLabel: '& Vision tactique', value: 72, color: 'from-purple-500 to-purple-400', icon: Zap },
      { label: 'Mouvement', subLabel: 'Fluidité', value: 68, color: 'from-orange-500 to-orange-400', icon: Activity },
      { label: 'Consistency', subLabel: 'Régularité', value: 81, color: 'from-green-500 to-emerald-400', icon: BarChart3 },
    ],
    sessions: [
      { s: 'S1', rr: 0 },
      { s: 'S2', rr: 18 },
      { s: 'S3', rr: 42 },
      { s: 'S4', rr: 71 },
      { s: 'S5', rr: 105 },
    ],
    color1: '#a855f7',
    color2: '#06b6d4',
  },
  valorant: {
    label: 'Valorant',
    metrics: [
      { label: 'Aim Score', subLabel: 'Flick / Tracking', value: 82, color: 'from-red-500 to-red-400', icon: Target },
      { label: 'Game Sense', subLabel: '& Vision tactique', value: 76, color: 'from-purple-500 to-purple-400', icon: Zap },
      { label: 'Mouvement', subLabel: 'Fluidité', value: 70, color: 'from-orange-500 to-orange-400', icon: Activity },
      { label: 'Consistency', subLabel: 'Régularité', value: 84, color: 'from-green-500 to-emerald-400', icon: BarChart3 },
    ],
    sessions: [
      { s: 'S1', rr: 0 },
      { s: 'S2', rr: 22 },
      { s: 'S3', rr: 48 },
      { s: 'S4', rr: 80 },
      { s: 'S5', rr: 120 },
    ],
    color1: '#ef4444',
    color2: '#f97316',
  },
  apex: {
    label: 'Apex Legends',
    metrics: [
      { label: 'Aim Score', subLabel: 'Flick / Tracking', value: 75, color: 'from-cyan-500 to-cyan-400', icon: Target },
      { label: 'Game Sense', subLabel: '& Vision tactique', value: 79, color: 'from-purple-500 to-purple-400', icon: Zap },
      { label: 'Mouvement', subLabel: 'Fluidité', value: 88, color: 'from-orange-500 to-orange-400', icon: Activity },
      { label: 'Consistency', subLabel: 'Régularité', value: 73, color: 'from-green-500 to-emerald-400', icon: BarChart3 },
    ],
    sessions: [
      { s: 'S1', rr: 0 },
      { s: 'S2', rr: 15 },
      { s: 'S3', rr: 38 },
      { s: 'S4', rr: 65 },
      { s: 'S5', rr: 95 },
    ],
    color1: '#06b6d4',
    color2: '#3b82f6',
  },
};

export default function Progression() {
  const [activeView, setActiveView] = useState<'global' | 'valorant' | 'apex'>('global');
  const view = views[activeView];

  // Build smooth path from session data
  const buildPath = (data: { s: string; rr: number }[], maxRR: number, width: number, height: number) => {
    const padX = 40;
    const padY = 40;
    const usableW = width - padX * 2;
    const usableH = height - padY * 2;
    return data.map((d, i) => {
      const x = padX + (i / (data.length - 1)) * usableW;
      const y = padY + (1 - d.rr / maxRR) * usableH;
      return { x, y, ...d };
    });
  };

  const chartW = 500;
  const chartH = 320;
  const maxRR = 130;
  const points = buildPath(view.sessions, maxRR, chartW, chartH);
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartH - 40} L ${points[0].x} ${chartH - 40} Z`;

  const handleCTAClick = () => {
    const booking = document.getElementById('booking');
    if (booking) booking.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="progression" className="py-20 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-600/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-600/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-block glass px-4 py-2 rounded-full mb-4">
            <span className="text-sm text-purple-400 font-medium">SUIVI MÉTRIQUE RIGOUREUX</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-3">
            Ta progression <span className="text-gradient">visualisée.</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Après chaque session. Visualise objectivement tes gains de performance et d'aim.
          </p>
        </motion.div>

        {/* Analytics Window */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-dark rounded-2xl overflow-hidden border border-white/10 backdrop-blur-2xl"
        >
          {/* macOS-style Window Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/30 border-b border-white/5 backdrop-blur-xl">
            {/* Traffic lights + title grouped on left */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors" />
                <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors" />
              </div>
              <span className="glass px-2 py-0.5 rounded text-xs font-mono text-gray-400">Poulpy_analytics_V2.4.exe</span>
            </div>

            {/* Game view toggles on right */}
            <div className="flex items-center gap-1 glass px-1 py-1 rounded-lg">
              {(['global', 'valorant', 'apex'] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveView(key)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    activeView === key
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {key === 'global' ? 'Global' : key === 'valorant' ? 'Valorant' : 'Apex'}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/5" />

          {/* Main Content Area */}
          <div className="grid lg:grid-cols-2 gap-0">
            {/* LEFT: Ascension Curve Chart */}
            <div className="p-6 lg:p-8 min-h-[420px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-cyan-400" />
                  <span className="font-semibold text-white">Courbe d'ascension</span>
                </div>
                <span className="text-xs text-gray-500 font-mono">RR / LP par session</span>
              </div>

              {/* Chart Container */}
              <div className="flex-1 relative">
                <svg
                  viewBox={`0 0 ${chartW} ${chartH}`}
                  className="w-full h-full"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="curveStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={view.color1} />
                      <stop offset="100%" stopColor={view.color2} />
                    </linearGradient>
                    <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={view.color1} stopOpacity="0.35" />
                      <stop offset="100%" stopColor={view.color1} stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="curveReflection" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={view.color2} stopOpacity="0.15" />
                      <stop offset="100%" stopColor={view.color2} stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((pct, i) => {
                    const y = 40 + (1 - pct / 100) * (chartH - 80);
                    return (
                      <g key={pct}>
                        <line x1={40} y1={y} x2={chartW - 30} y2={y} stroke="#ffffff" strokeOpacity="0.05" strokeWidth={1} />
                        <text x={30} y={y + 4} textAnchor="end" fill="#ffffff" fillOpacity="0.4" fontSize={10} fontFamily="monospace">
                          {pct}%
                        </text>
                      </g>
                    );
                  })}

                  {/* X-axis labels */}
                  {points.map((p, i) => (
                    <text key={p.s} x={p.x} y={chartH - 15} textAnchor="middle" fill="#ffffff" fillOpacity="0.5" fontSize={11} fontFamily="monospace">
                      {p.s}
                    </text>
                  ))}

                  {/* Reflection (mirrored curve below) */}
                  <path
                    d={points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ` L ${points[points.length - 1].x} ${chartH - 40} L ${points[0].x} ${chartH - 40} Z`}
                    fill="url(#curveReflection)"
                    opacity={0.4}
                  />

                  {/* Area fill */}
                  <path d={areaPath} fill="url(#curveFill)" />

                  {/* Main curve line with glow */}
                  <path
                    d={linePath}
                    stroke="url(#curveStroke)"
                    strokeWidth={3}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                  />

                  {/* Data points */}
                  {points.map((p, i) => (
                    <g key={p.s}>
                      <circle cx={p.x} cy={p.y} r={5} fill={view.color2} stroke="#0a0a0f" strokeWidth={2} />
                      <circle cx={p.x} cy={p.y} r={2} fill="#fff" />
                      {/* RR value label above point */}
                      <text x={p.x} y={p.y - 12} textAnchor="middle" fill="#ffffff" fillOpacity="0.8" fontSize={10} fontFamily="monospace">
                        +{p.rr}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* RIGHT: Progress Bars */}
            <div className="p-6 lg:p-8 min-h-[420px] flex flex-col justify-center border-l border-white/5 bg-black/20">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} className="text-purple-400" />
                  <span className="font-semibold text-white">Score d'évaluation</span>
                </div>
                <span className="text-xs text-gray-500 font-mono">Mécanique & Tactique</span>
              </div>

              <div className="space-y-6">
                {view.metrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <metric.icon size={16} className="text-gray-400 group-hover:text-white transition-colors" />
                        <div>
                          <div className="font-medium text-white text-sm">{metric.label}</div>
                          <div className="text-xs text-gray-500">{metric.subLabel}</div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-lg text-white">{metric.value}%</span>
                    </div>
                    <div className="h-2.5 bg-black/40 rounded-full overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10" />
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${metric.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.3 + index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="h-full rounded-full relative"
                        style={{ background: `linear-gradient(90deg, ${metric.color.split(' to ')[0]}, ${metric.color.split(' to ')[1]})` }}
                      >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-white/20 blur-sm" />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="px-6 py-6 bg-black/20 border-t border-white/5 flex items-center justify-center"
          >
            <button
              onClick={handleCTAClick}
              className="group relative px-8 py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-purple-600 to-cyan-500 hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105 flex items-center gap-3"
            >
              <Activity size={22} className="group-hover:rotate-12 transition-transform" />
              Prêt à mesurer ta vraie valeur ??
              <TrendingUp size={22} className="group-hover:translate-x-1 transition-transform" />
              {/* Animated glow border */}
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/0 via-cyan-400/30 to-purple-400/0 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}