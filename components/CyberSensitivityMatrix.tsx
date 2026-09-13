"use client";

import React, { useState } from "react";
import { Sliders, RotateCw, CheckCircle2 } from "lucide-react";
import DecryptedText from "./DecryptedText";

export default function CyberSensitivityMatrix() {
  const [dpi, setDpi] = useState<number>(800);
  const [valSens, setValSens] = useState<number>(0.32);

  const edpi = Math.round(dpi * valSens);
  const apexSens = (valSens * 3.1818).toFixed(3);
  const csSens = (valSens * 3.1818).toFixed(3);
  const owSens = (valSens * 10.6).toFixed(2);
  const cm360 = Math.round((360 / (valSens * 0.07 * dpi)) * 2.54);

  return (
    <div className="reticle-box p-6 sm:p-8 bg-[#040404] space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.08)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="data-badge data-badge-acid">eDPI CONVERTER</span>
            <span className="text-white/40">CALIBRATION BALISTIQUE UNIVERSELLE</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-display text-white tracking-wider">
            MATRICE DE SENSIBILITÉ &amp; DISTANCE 360°
          </h3>
        </div>

        <div className="data-badge data-badge-laser">
          <span>{cm360} CM / 360° (STANDARD TOURNEMENT)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Sliders & DPI */}
        <div className="md:col-span-6 space-y-5 font-mono">
          <div>
            <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">
              DPI CAPTEUR :
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[400, 800, 1200, 1600].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDpi(val)}
                  className={`py-2 text-xs font-bold border transition-all ${
                    dpi === val
                      ? "bg-[#00ff41] text-black border-[#00ff41]"
                      : "bg-black text-white/60 border-white/10 hover:border-white/30"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 text-xs text-white/60">
              <label className="uppercase tracking-widest">
                SENSIBILITÉ IN-GAME (VALORANT) :
              </label>
              <span className="text-base font-bold text-[#00ff41] font-mono">
                {valSens}
              </span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.80"
              step="0.01"
              value={valSens}
              onChange={(e) => setValSens(Number(e.target.value))}
              className="w-full accent-[#00ff41] cursor-pointer h-1.5 bg-white/10"
            />
          </div>

          <div className="p-4 bg-black border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Circonférence 360° :</span>
              <span className="font-mono font-bold text-lg text-[#00f0ff]">{cm360} CM</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#00f0ff] transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(10, (cm360 / 60) * 100))}%` }}
              />
            </div>
            <p className="text-[10px] text-white/30">
              Plage recommandée Valorant VCT : 32cm à 46cm.
            </p>
          </div>
        </div>

        {/* Matrix Converted Output */}
        <div className="md:col-span-6 grid grid-cols-2 gap-3 font-mono">
          <div className="p-4 bg-black border border-[rgba(0,255,65,0.2)] space-y-1">
            <span className="text-[10px] text-white/40 uppercase">VALORANT eDPI</span>
            <div className="text-3xl font-bold text-[#00ff41]">{edpi}</div>
            <span className="text-[10px] text-white/40 block">Prise d&apos;angle laser</span>
          </div>

          <div className="p-4 bg-black border border-[rgba(0,240,255,0.2)] space-y-1">
            <span className="text-[10px] text-white/40 uppercase">APEX LEGENDS</span>
            <div className="text-3xl font-bold text-[#00f0ff]">{apexSens}</div>
            <span className="text-[10px] text-white/40 block">Tracking close-quarters</span>
          </div>

          <div className="p-4 bg-black border border-white/10 space-y-1">
            <span className="text-[10px] text-white/40 uppercase">COUNTER-STRIKE 2</span>
            <div className="text-3xl font-bold text-white">{csSens}</div>
            <span className="text-[10px] text-white/40 block">Moteur Source 1:1</span>
          </div>

          <div className="p-4 bg-black border border-white/10 space-y-1">
            <span className="text-[10px] text-white/40 uppercase">OVERWATCH 2</span>
            <div className="text-3xl font-bold text-white">{owSens}</div>
            <span className="text-[10px] text-white/40 block">Hitscan &amp; Projectiles</span>
          </div>
        </div>
      </div>
    </div>
  );
}
