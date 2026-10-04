"use client";

import React from "react";
import Image from "next/image";

interface CyberAboutProps {
  onOpenBooking: () => void;
}

export default function CyberAbout({ onOpenBooking }: CyberAboutProps) {
  return (
    <section id="apropos" className="py-14 sm:py-16 px-6 sm:px-12 lg:px-16 bg-transparent font-mono">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <h2 className="text-4xl sm:text-6xl font-display text-[#F5F4F0] tracking-wider">
              QUI EST <span className="text-[#CA1C30]">POULPY ?</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#F5F4F0]/60 max-w-xl leading-relaxed">
              Coach officiel Atheris Esport, joueur de haut niveau et formateur.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Photo sans vignette arrière-plan */}
          <div className="lg:col-span-5 relative group">
            <div className="relative aspect-square w-full rounded-2xl sm:rounded-3xl overflow-hidden flex items-center justify-center shadow-2xl">
              <Image
                src="/poulpy-profile.png"
                alt="Coach Poulpy"
                width={400}
                height={400}
                style={{ width: "100%", height: "100%" }}
                className="object-cover filter contrast-125 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A0D]/90 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-5 left-5 z-10 pointer-events-none">
                <span className="glitch-text font-bold text-xs uppercase tracking-wider text-[#F5F4F0]">
                  COACH EN LIGNE
                </span>
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

            {/* Achievements - Version épurée alignée à la DA */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-y border-white/10">
              <div className="space-y-1 sm:pr-4">
                <div className="text-[#CA1C30] font-display font-bold text-sm tracking-wider uppercase">
                  ATHERIS ESPORT
                </div>
                <div className="text-[11px] text-[#F5F4F0]/50 font-mono">
                  Coach officiel
                </div>
              </div>

              <div className="space-y-1 sm:pl-4 sm:border-l sm:border-white/10">
                <div className="text-[#00B4A0] font-display font-bold text-sm tracking-wider uppercase">
                  +120 ÉLÈVES
                </div>
                <div className="text-[11px] text-[#F5F4F0]/50 font-mono">
                  98.4% satisfaction
                </div>
              </div>

              <div className="space-y-1 sm:pl-4 sm:border-l sm:border-white/10">
                <div className="text-[#F5F4F0] font-display font-bold text-sm tracking-wider uppercase">
                  VOLTAIC JADE
                </div>
                <div className="text-[11px] text-[#F5F4F0]/50 font-mono">
                  Top 0.1% visée pure
                </div>
              </div>

              <div className="space-y-1 sm:pl-4 sm:border-l sm:border-white/10">
                <div className="text-[#00B4A0] font-display font-bold text-sm tracking-wider uppercase">
                  IMMO 2 / PREDATOR
                </div>
                <div className="text-[11px] text-[#F5F4F0]/50 font-mono">
                  Top rank atteint
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={onOpenBooking}
                className="btn-cyber-primary px-8 py-3.5 text-xs font-bold font-mono tracking-wider cursor-pointer"
              >
                <span>RÉSERVER UNE SÉANCE</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
