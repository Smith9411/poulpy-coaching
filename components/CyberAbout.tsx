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
    <section id="apropos" className="py-14 sm:py-16 px-6 sm:px-12 lg:px-16 bg-transparent font-mono">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <span className="data-badge data-badge-acid">
              <DecryptedText text="À PROPOS" />
            </span>
            <h2 className="text-4xl sm:text-6xl font-display text-[#F5F4F0] tracking-wider">
              QUI EST <span className="text-[#CA1C30]">POULPY ?</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#F5F4F0]/60 max-w-xl leading-relaxed">
              Coach officiel Atheris Esport, joueur de haut niveau et formateur.
            </p>
          </div>
          <div className="text-xs text-[#F5F4F0]/40">
            DISCIPLINE : FPS MNK
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Photo Frame with Cyber Reticles */}
          <div className="lg:col-span-5 relative">
            <div className="group reticle-box p-3 bg-[#121117] rounded-3xl border border-[#CA1C30]/30 relative overflow-hidden">
              <CornerBrackets size={12} />
              <div className="relative aspect-square w-full bg-[#0B0A0D] rounded-2xl overflow-hidden flex items-center justify-center">
                <Image
                  src="/poulpy-profile.png"
                  alt="Coach Poulpy"
                  width={400}
                  height={400}
                  style={{ width: "100%", height: "100%" }}
                  className="object-cover filter contrast-125 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A0D] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] bg-[#1A1822]/90 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
                  <span className="text-[#F5F4F0] font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#CA1C30] animate-ping" />
                    <span className="glitch-text">STATUS: COACH EN LIGNE</span>
                  </span>
                  <span className="text-[#F5F4F0]/60">ID: POULPY_01</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Bio & Credentials */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <h3 className="text-3xl sm:text-4xl font-display text-[#F5F4F0] tracking-wider">
                PASSIONNÉ ET EXIGEANT.
              </h3>
              <p className="text-xs sm:text-sm text-[#F5F4F0]/75 leading-relaxed">
                Coach officiel Atheris Esport avec 6 ans d&apos;expérience dans l&apos;analyse de jeu, la visée et la prise de décision. Mon objectif : te transmettre une méthode claire et applicable immédiatement.
              </p>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 bg-[#1A1822] border border-white/10 rounded-2xl space-y-1">
                <div className="text-[#CA1C30] font-bold text-xs uppercase">
                  ATHERIS ESPORT
                </div>
                <div className="text-[11px] text-[#F5F4F0]/50">
                  Coach officiel
                </div>
              </div>

              <div className="p-4 bg-[#1A1822] border border-white/10 rounded-2xl space-y-1">
                <div className="text-[#00B4A0] font-bold text-xs uppercase">
                  +120 ÉLÈVES
                </div>
                <div className="text-[11px] text-[#F5F4F0]/50">
                  98.4% satisfaction
                </div>
              </div>

              <div className="p-4 bg-[#1A1822] border border-white/10 rounded-2xl space-y-1">
                <div className="text-[#F5F4F0] font-bold text-xs uppercase">
                  VOLTAIC JADE
                </div>
                <div className="text-[11px] text-[#F5F4F0]/50">
                  Top 0.1% visée pure
                </div>
              </div>

              <div className="p-4 bg-[#1A1822] border border-white/10 rounded-2xl space-y-1">
                <div className="text-[#00B4A0] font-bold text-xs uppercase">
                  IMMO 2 / PREDATOR
                </div>
                <div className="text-[11px] text-[#F5F4F0]/50">
                  Top rank atteint
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={onOpenBooking}
                className="btn-cyber-primary rounded-full px-8 py-3.5"
              >
                <span>RÉSERVER UNE SÉANCE</span>
                <div className="w-5 h-5 rounded-full bg-black/30 flex items-center justify-center">
                  <ArrowUpRight className="w-3.5 h-3.5 text-black" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
