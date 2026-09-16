"use client";

import React from "react";
import Image from "next/image";
import DecryptedText from "./DecryptedText";
import CornerBrackets from "./CornerBrackets";
import { Shield, Award, Terminal, CheckCircle2, ArrowUpRight } from "lucide-react";

interface CyberAboutProps {
  onOpenBooking: () => void;
}

export default function CyberAbout({ onOpenBooking }: CyberAboutProps) {
  return (
    <section id="apropos" className="py-14 sm:py-16 px-6 sm:px-12 lg:px-16 bg-[#07090D] border-t border-white/10 font-mono">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <span className="data-badge data-badge-acid">
              <DecryptedText text="PROFIL DU HEAD COACH · DOSSIER 01" />
            </span>
            <h2 className="text-4xl sm:text-6xl font-display text-white tracking-wider">
              QUI EST <span className="text-[#FF7582]">POULPY ?</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/50 max-w-xl leading-relaxed">
              Un joueur de haut niveau devenu entraîneur spécialisé, passionné de balistique et de pédagogie active.
            </p>
          </div>
          <div className="text-xs text-white/40">
            DISCIPLINE: FPS MNK PURE
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Photo Frame with Cyber Reticles */}
          <div className="lg:col-span-5 relative">
            <div className="group reticle-box p-3 bg-[#040404] border border-[#FF7582]/30 relative">
              <CornerBrackets size={12} />
              <div className="relative aspect-square w-full bg-black overflow-hidden flex items-center justify-center">
                <Image
                  src="/poulpy-profile.png"
                  alt="Coach Poulpy"
                  width={400}
                  height={400}
                  style={{ width: "100%", height: "100%" }}
                  className="object-cover filter contrast-125 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] bg-black/80 p-2 border border-white/10">
                  <span className="text-[#A4DE87] font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#A4DE87] animate-ping" />
                    <span className="glitch-text">STATUS: COACH EN LIGNE</span>
                  </span>
                  <span className="text-white/60">ID: POULPY_01</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Bio & Credentials */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <h3 className="text-3xl sm:text-4xl font-display text-white tracking-wider">
                20 ANS, PASSIONNÉ ET EXIGEANT.
              </h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Coach officiel de l&apos;Atheris Esport, j&apos;ai commencé comme toi, frustré de stagner, perdu dans les conseils contradictoires. J&apos;ai passé 6 ans à décortiquer la mécanique pure, le game sense, la prise de décision. Aujourd&apos;hui, je te transmets ce qui marche vraiment.
              </p>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-[#040404] border border-white/10 space-y-1">
                <div className="text-[#FF7582] font-bold text-xs uppercase">
                  ATHERIS ESPORT
                </div>
                <div className="text-[11px] text-white/50">
                  Coach officiel de la structure
                </div>
              </div>

              <div className="p-3.5 bg-[#040404] border border-white/10 space-y-1">
                <div className="text-[#8FAFD4] font-bold text-xs uppercase">
                  +120 ÉLÈVES FORMÉS
                </div>
                <div className="text-[11px] text-white/50">
                  Taux de recommandation 98.4%
                </div>
              </div>

              <div className="p-3.5 bg-[#040404] border border-white/10 space-y-1">
                <div className="text-white font-bold text-xs uppercase">
                  BENCHMARK VOLTAIC JADE
                </div>
                <div className="text-[11px] text-white/50">
                  Top 0.1% mondial en visée pure
                </div>
              </div>

              <div className="p-3.5 bg-[#040404] border border-white/10 space-y-1">
                <div className="text-[#A4DE87] font-bold text-xs uppercase">
                  IMMORTEL 2 // PREDATOR
                </div>
                <div className="text-[11px] text-white/50">
                  Expérience vécue au sommet
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={onOpenBooking}
                className="btn-cyber-primary"
              >
                <span>RÉSERVER UNE SÉANCE AVEC POULPY</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
