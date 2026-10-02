"use client";

import React, { useState } from "react";
import { X, Check, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import DecryptedText from "./DecryptedText";

interface CyberBookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CyberBookingDrawer({ isOpen, onClose }: CyberBookingDrawerProps) {
  const [pkg, setPkg] = useState<string>("pro");
  const [game, setGame] = useState<string>("Valorant");
  const [discord, setDiscord] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const packages = [
    {
      id: "session",
      name: "SESSION // 30 MIN",
      price: "29 €",
      specs: ["Analyse rapide de gameplay", "Conseils personnalisés immédiats", "Exercices ciblés"],
    },
    {
      id: "pro",
      name: "PRO // 60 MIN",
      price: "49 €",
      popular: true,
      specs: ["Analyse complète de vos parties", "Coaching personnalisé en direct", "Plan de progression 4 sem."],
    },
    {
      id: "performance",
      name: "PERFORMANCE // 90 MIN",
      price: "89 €",
      specs: ["Analyse approfondie multicritères", "Aim training & VOD review", "Suivi Discord continu"],
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="max-w-2xl w-full bg-[#121117] border border-[#CA1C30]/35 rounded-2xl p-6 sm:p-10 reticle-box space-y-6 relative shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#F5F4F0]/50 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-12 text-center space-y-4 font-mono">
            <div className="w-16 h-16 rounded-2xl border border-[#CA1C30] bg-[#CA1C30]/10 flex items-center justify-center mx-auto text-[#CA1C30] shadow-[0_0_20px_rgba(202, 28, 48,0.3)]">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-display text-[#F5F4F0] tracking-wider font-bold">
              ORDRE DE MISSION TRANSMIS
            </h3>
            <p className="text-xs text-[#F5F4F0]/60 max-w-md mx-auto">
              L&apos;invitation pour la salle tactique sécurisée a été envoyée sur Discord. Début des hostilités imminent.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="btn-cyber-primary mt-4 rounded-xl"
            >
              FERMER LA SESSION
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 font-mono">
            <div className="space-y-1">
              <span className="data-badge data-badge-acid">ENRÔLEMENT COMPÉTITIF</span>
              <h3 className="text-2xl sm:text-3xl font-display text-[#F5F4F0] tracking-wider font-bold">
                SÉLECTIONNE TON PROTOCOLE D&apos;ENGAGEMENT
              </h3>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {packages.map((p) => {
                const isSelected = pkg === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setPkg(p.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? "border-[#CA1C30] bg-[#CA1C30]/10 shadow-[0_0_20px_rgba(202, 28, 48,0.25)]"
                        : "border-white/10 bg-[#1A1822] hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-[#F5F4F0] truncate">{p.name}</span>
                    </div>
                    <div className="text-2xl font-display font-bold text-[#CA1C30]">{p.price}</div>
                    <ul className="text-[10px] text-[#F5F4F0]/60 space-y-1 pt-2 border-t border-white/10">
                      {p.specs.map((s, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-[#00B4A0]" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#F5F4F0]/60 uppercase tracking-widest block mb-1.5 font-semibold">
                  TITRE DU JEU :
                </label>
                <select
                  value={game}
                  onChange={(e) => setGame(e.target.value)}
                  className="w-full bg-[#0B0A0D] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-[#F5F4F0] font-mono outline-none focus:border-[#CA1C30] transition-colors"
                >
                  <option value="Valorant">VALORANT (RIOT GAMES)</option>
                  <option value="Apex Legends">APEX LEGENDS (EA)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#F5F4F0]/60 uppercase tracking-widest block mb-1.5 font-semibold">
                  IDENTIFIANT DISCORD :
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Poulpy#0001"
                  value={discord}
                  onChange={(e) => setDiscord(e.target.value)}
                  className="w-full bg-[#0B0A0D] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-[#F5F4F0] font-mono outline-none focus:border-[#CA1C30] placeholder-white/30 transition-colors"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[10px] text-[#F5F4F0]/40">
                LIAISON PRIVÉE CRYPTÉE // ZÉRO ENGAGEMENT
              </span>
              <button type="submit" className="btn-cyber-primary rounded-xl w-full sm:w-auto">
                <span>VERROUILLER LA SESSION</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
