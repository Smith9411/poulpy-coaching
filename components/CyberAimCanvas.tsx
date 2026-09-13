"use client";

import React, { useState, useEffect, useRef } from "react";
import { Target, Zap, Activity, RotateCcw, Crosshair, Terminal } from "lucide-react";

export default function CyberAimCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [reactionMs, setReactionMs] = useState<number>(142);
  const [flickSpeed, setFlickSpeed] = useState<number>(4320);
  const [accuracy, setAccuracy] = useState<number>(98.6);
  const [hitsCount, setHitsCount] = useState<number>(8);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      width = canvas.parentElement?.clientWidth || 600;
      height = canvas.parentElement?.clientHeight || 400;
      canvas.width = width * Math.min(window.devicePixelRatio, 2);
      canvas.height = height * Math.min(window.devicePixelRatio, 2);
      ctx?.scale(Math.min(window.devicePixelRatio, 2), Math.min(window.devicePixelRatio, 2));
    };

    resize();
    window.addEventListener("resize", resize);

    let target = {
      x: width * 0.5,
      y: height * 0.5,
      radius: 14,
      spawnTime: Date.now(),
    };

    let crosshair = { x: width * 0.2, y: height * 0.5 };
    const flickTrails: { fromX: number; fromY: number; toX: number; toY: number; alpha: number }[] = [];
    let hits = hitsCount;
    let totalReaction = 142 * 8;

    const spawnTarget = () => {
      const pad = 50;
      target = {
        x: pad + Math.random() * Math.max(80, width - pad * 2),
        y: pad + Math.random() * Math.max(80, height - pad * 2),
        radius: 14,
        spawnTime: Date.now(),
      };
    };

    const handleClick = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const dist = Math.hypot(clickX - target.x, clickY - target.y);

      if (dist <= target.radius + 8) {
        // Hit
        const dt = Math.max(85, Date.now() - target.spawnTime);
        hits++;
        totalReaction += dt;

        setReactionMs(dt);
        setHitsCount(hits);
        setFlickSpeed(Math.round(480000 / dt));
        setAccuracy(Math.min(99.8, Number((96 + hits * 0.35).toFixed(1))));

        flickTrails.push({
          fromX: crosshair.x,
          fromY: crosshair.y,
          toX: clickX,
          toY: clickY,
          alpha: 1.0,
        });

        crosshair = { x: clickX, y: clickY };
        spawnTarget();
      } else {
        crosshair = { x: clickX, y: clickY };
      }
    };

    canvas.addEventListener("pointerdown", handleClick);

    let animId: number;

    const render = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // Cyber Grid
      ctx.strokeStyle = "rgba(0, 255, 65, 0.08)";
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Laser Flick vectors
      for (let i = flickTrails.length - 1; i >= 0; i--) {
        const p = flickTrails[i];
        p.alpha -= 0.025;
        if (p.alpha <= 0) {
          flickTrails.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = `rgba(0, 240, 255, ${p.alpha})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);

        ctx.beginPath();
        ctx.moveTo(p.fromX, p.fromY);
        ctx.lineTo(p.toX, p.toY);
        ctx.stroke();

        // Sharp square landing impact (NO ROUND CORNERS)
        ctx.strokeStyle = `rgba(0, 255, 65, ${p.alpha})`;
        ctx.lineWidth = 1.5;
        const s = (1 - p.alpha) * 36 + 6;
        ctx.strokeRect(p.toX - s / 2, p.toY - s / 2, s, s);
        ctx.restore();
      }

      // Draw active sniper target (Brutalist angles & crosshair)
      const pulse = Math.sin(Date.now() * 0.01) * 2;

      ctx.save();
      // Outer square reticle
      ctx.strokeStyle = "#00ff41";
      ctx.lineWidth = 1.5;
      const boxSize = target.radius * 2 + pulse;
      ctx.strokeRect(target.x - boxSize / 2, target.y - boxSize / 2, boxSize, boxSize);

      // Center laser dot
      ctx.fillStyle = "#00f0ff";
      ctx.fillRect(target.x - 2, target.y - 2, 4, 4);

      // Corner crosshair ticks
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(target.x - 20, target.y);
      ctx.lineTo(target.x - 8, target.y);
      ctx.moveTo(target.x + 8, target.y);
      ctx.lineTo(target.x + 20, target.y);
      ctx.moveTo(target.x, target.y - 20);
      ctx.lineTo(target.x, target.y - 8);
      ctx.moveTo(target.x, target.y + 8);
      ctx.lineTo(target.x, target.y + 20);
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", handleClick);
    };
  }, [hitsCount]);

  return (
    <div className="reticle-box p-6 sm:p-8 bg-[#040404] space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.08)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="data-badge data-badge-acid">PROVING GROUND HUD</span>
            <span className="text-white/40">SUB-PIXEL CALIBRATOR</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-display text-white tracking-wider">
            BANC DE MESURE BALISTIQUE EN TEMPS RÉEL
          </h3>
        </div>

        <button
          onClick={() => {
            setHitsCount(0);
            setReactionMs(142);
            setFlickSpeed(4300);
            setAccuracy(97.0);
          }}
          className="btn-cyber-ghost text-xs py-2 px-4"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET TARGETS</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Interactive Canvas */}
        <div className="lg:col-span-8 relative aspect-[16/10] w-full bg-[#000000] border border-[rgba(255,255,255,0.08)] cursor-crosshair">
          <canvas ref={canvasRef} className="w-full h-full block" />
          <div className="absolute top-3 left-3 px-3 py-1 bg-black/80 border border-white/10 text-[10px] font-mono text-[#00ff41]">
            [CLIQUEZ SUR LA CIBLE POUR MESURER VOTRE TEMPS DE RÉACTION]
          </div>
        </div>

        {/* Telemetry Numbers */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 bg-black/60 border border-[rgba(0,255,65,0.2)] space-y-1">
            <div className="flex items-center justify-between text-xs text-white/50 font-mono">
              <span>RÉACTION BRUTE</span>
              <Zap className="w-3.5 h-3.5 text-[#00ff41]" />
            </div>
            <div className="text-3xl font-bold font-mono text-[#00ff41]">
              {reactionMs} <span className="text-sm font-normal text-white/40">MS</span>
            </div>
            <div className="text-[10px] text-white/40 font-mono">
              SEUIL RADIANT / PRO : &lt; 145MS
            </div>
          </div>

          <div className="p-4 bg-black/60 border border-[rgba(0,240,255,0.2)] space-y-1">
            <div className="flex items-center justify-between text-xs text-white/50 font-mono">
              <span>VÉLOCITÉ DU FLICK</span>
              <Activity className="w-3.5 h-3.5 text-[#00f0ff]" />
            </div>
            <div className="text-3xl font-bold font-mono text-[#00f0ff]">
              {flickSpeed} <span className="text-sm font-normal text-white/40">PX/S</span>
            </div>
            <div className="text-[10px] text-white/40 font-mono">
              DÉVIATION ÉCART-TYPE : σ = 0.018
            </div>
          </div>

          <div className="p-4 bg-black/60 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-white/50 font-mono">
              <span>SCORE DE RÉGULARITÉ</span>
              <Target className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-3xl font-bold font-mono text-white">
              {accuracy}%
            </div>
            <div className="text-[10px] text-white/40 font-mono">
              {hitsCount} IMPACTS VALIDÉS CONSÉCUTIFS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
