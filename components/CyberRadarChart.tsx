"use client";

import React, { useEffect, useRef } from "react";
import DecryptedText from "./DecryptedText";

export default function CyberRadarChart() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      width = canvas.parentElement?.clientWidth || 360;
      height = canvas.parentElement?.clientHeight || 360;
      canvas.width = width * Math.min(window.devicePixelRatio, 2);
      canvas.height = height * Math.min(window.devicePixelRatio, 2);
      ctx?.scale(Math.min(window.devicePixelRatio, 2), Math.min(window.devicePixelRatio, 2));
    };
    resize();
    window.addEventListener("resize", resize);

    const labels = ["AIM / MICRO-FLICK", "GAME SENSE", "FLUIDITÉ MOUVEMENT", "SANG-FROID", "COMMUNICATION"];
    const baseStats = [0.55, 0.48, 0.62, 0.40, 0.50];
    const postStats = [0.94, 0.88, 0.92, 0.86, 0.90];

    const count = labels.length;
    let animT = 0;
    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.38;

      // Draw Web Rings
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;

      for (let r = 0.2; r <= 1.0; r += 0.2) {
        ctx.beginPath();
        for (let i = 0; i < count; i++) {
          const angle = (i * Math.PI * 2) / count - Math.PI / 2;
          const x = cx + Math.cos(angle) * (radius * r);
          const y = cy + Math.sin(angle) * (radius * r);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Draw Spokes
      for (let i = 0; i < count; i++) {
        const angle = (i * Math.PI * 2) / count - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
        ctx.stroke();

        // Label
        const lx = cx + Math.cos(angle) * (radius + 20);
        const ly = cy + Math.sin(angle) * (radius + 20);
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(labels[i], lx, ly);
      }

      // Draw Post-Coaching Polygon (Acid Green)
      animT = Math.min(1, animT + 0.02);

      ctx.save();
      ctx.strokeStyle = "#00ff41";
      ctx.lineWidth = 2;
      ctx.fillStyle = "rgba(0, 255, 65, 0.15)";
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const angle = (i * Math.PI * 2) / count - Math.PI / 2;
        const val = postStats[i] * animT;
        const x = cx + Math.cos(angle) * (radius * val);
        const y = cy + Math.sin(angle) * (radius * val);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Vertex dots
      ctx.fillStyle = "#00ff41";
      for (let i = 0; i < count; i++) {
        const angle = (i * Math.PI * 2) / count - Math.PI / 2;
        const val = postStats[i] * animT;
        const x = cx + Math.cos(angle) * (radius * val);
        const y = cy + Math.sin(angle) * (radius * val);
        ctx.fillRect(x - 2, y - 2, 4, 4);
      }
      ctx.restore();

      // Draw Baseline Polygon (Muted Red/White)
      ctx.save();
      ctx.strokeStyle = "rgba(255, 0, 51, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.fillStyle = "rgba(255, 0, 51, 0.08)";
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const angle = (i * Math.PI * 2) / count - Math.PI / 2;
        const val = baseStats[i];
        const x = cx + Math.cos(angle) * (radius * val);
        const y = cy + Math.sin(angle) * (radius * val);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="reticle-box p-6 bg-[#040404] space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <span className="text-xs font-mono font-bold text-[#00ff41]">
          <DecryptedText text="PROFIL MULTI-AXES // RADAR" />
        </span>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-[#ff0033]">
            <span className="w-2 h-2 bg-[#ff0033]" /> INITIAL
          </span>
          <span className="flex items-center gap-1 text-[#00ff41]">
            <span className="w-2 h-2 bg-[#00ff41]" /> APRÈS COACHING
          </span>
        </div>
      </div>

      <div className="relative aspect-square w-full">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      <div className="pt-2 border-t border-white/5 text-[10px] font-mono text-white/40 flex justify-between">
        <span>COGNITIVE EXPANSION INDEX</span>
        <span className="text-[#00ff41] font-bold">+86.4%</span>
      </div>
    </div>
  );
}
