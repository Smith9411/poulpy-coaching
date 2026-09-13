"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Calendar, Clock, User, Shield, ChevronRight, ChevronLeft, ArrowRight, Disc, Send } from "lucide-react";
import DecryptedText from "./DecryptedText";
import CornerBrackets from "./CornerBrackets";
import { supabase } from "@/lib/supabase";

interface PlanOption {
  id: string;
  name: string;
  duration: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}

const PLANS: PlanOption[] = [
  {
    id: "session",
    name: "SESSION",
    duration: "30 MIN",
    price: "29 €",
    description: "Idéal pour un premier diagnostic rapide et précis de ton gameplay.",
    features: ["Analyse rapide de gameplay", "Conseils personnalisés immédiats", "Exercices ciblés de recalibrage", "Compte-rendu écrit"],
  },
  {
    id: "pro",
    name: "PRO",
    duration: "60 MIN",
    price: "49 €",
    popular: true,
    description: "Le standard pour progresser durablement et monter de rank garanti.",
    features: [
      "Analyse complète de gameplay",
      "Coaching personnalisé en vocal",
      "Travail d'aim & placement du viseur",
      "Plan de progression 4 semaines",
      "Suivi Discord VIP 7j/7",
    ],
  },
  {
    id: "performance",
    name: "PERFORMANCE",
    duration: "90 MIN",
    price: "89 €",
    description: "Pour les compétiteurs et objectifs ambitieux (rank up, tournois).",
    features: [
      "Analyse approfondie multicritères",
      "Coaching live & VOD review complète",
      "Aim training KovaaK's & Aimlabs",
      "Plan personnalisé 8 semaines",
      "Suivi continu Discord prioritaire",
    ],
  },
];

const AVAILABLE_DAYS = [
  { day: "LUN", date: "15 SEPT", full: "Lundi 15 Septembre" },
  { day: "MAR", date: "16 SEPT", full: "Mardi 16 Septembre" },
  { day: "MER", date: "17 SEPT", full: "Mercredi 17 Septembre" },
  { day: "JEU", date: "18 SEPT", full: "Jeudi 18 Septembre" },
  { day: "VEN", date: "19 SEPT", full: "Vendredi 19 Septembre" },
  { day: "SAM", date: "20 SEPT", full: "Samedi 20 Septembre" },
  { day: "DIM", date: "21 SEPT", full: "Dimanche 21 Septembre" },
];

const TIME_SLOTS = ["14:00", "15:30", "17:00", "18:30", "20:00", "21:30"];

export default function Booking() {
  const [step, setStep] = useState<number>(1);
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<string>("18:30");
  
  // Form fields
  const [inGameName, setInGameName] = useState<string>("");
  const [discordId, setDiscordId] = useState<string>("");
  const [game, setGame] = useState<string>("Valorant");
  const [currentRank, setCurrentRank] = useState<string>("Diamant 2");
  const [objective, setObjective] = useState<string>("");
  const [confirmedMissionId, setConfirmedMissionId] = useState<string>("");

  const activePlan = PLANS.find((p) => p.id === selectedPlan) || PLANS[1];

  const handleNextStep = async () => {
    if (step === 3) {
      // Generate mission order id
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const missionId = `PLP-${randomCode}-OP`;
      setConfirmedMissionId(missionId);

      try {
        const dateObj = (AVAILABLE_DAYS[selectedDay] || AVAILABLE_DAYS[0]).full;
        await supabase.from("coaching_bookings").insert({
          plan_name: `${activePlan.name} (${activePlan.price})`,
          booking_date: dateObj,
          booking_time: selectedTime,
          student_name: inGameName || discordId,
          discord_id: discordId,
          game: `${game} (${currentRank})`,
          notes: objective,
          status: "confirmed",
        });
      } catch (err) {
        console.warn("Booking Supabase save fallback:", err);
      }

      setStep(4);
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setStep(1);
    setInGameName("");
    setDiscordId("");
    setObjective("");
  };

  return (
    <section id="booking" className="py-32 px-6 sm:px-12 lg:px-16 bg-[#07090D] border-t border-[rgba(255,255,255,0.08)] font-mono">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3">
            <span className="data-badge data-badge-laser">
              <DecryptedText text="MODULE DE RÉSERVATION" />
            </span>
            <h2 className="text-4xl sm:text-6xl font-display text-white tracking-wider">
              RÉSERVE TON <span className="text-[#FF7582]">COACHING</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/50 max-w-2xl leading-relaxed">
              Verrouille ton créneau tactique avec Poulpy. Sélectionne ta formule, ton horaire et transmets tes données de jeu en moins de 60 secondes.
            </p>
          </div>

          {/* Stepper Progress Badges */}
          <div className="flex items-center gap-2">
            {[
              { id: 1, label: "01. FORMULE" },
              { id: 2, label: "02. CRÉNEAU" },
              { id: 3, label: "03. INFOS" },
              { id: 4, label: "04. STATUT" },
            ].map((s) => {
              const isActive = step === s.id;
              const isDone = step > s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    if (isDone) setStep(s.id);
                  }}
                  className={`px-3.5 py-1.5 text-xs font-bold border transition-all cursor-pointer ${
                    isActive
                      ? "border-[#FF7582] bg-[#FF7582] text-black shadow-[0_0_15px_rgba(255,117,130,0.35)]"
                      : isDone
                      ? "border-[#FF7582]/50 text-[#FF7582] bg-[#FF7582]/10"
                      : "border-white/10 text-white/40 bg-black"
                  }`}
                >
                  {s.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Step Container */}
        <div className="reticle-box p-6 sm:p-10 bg-[#090c10] border border-white/20 relative min-h-[500px] flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.9)]">
          <AnimatePresence mode="wait" initial={false}>
            {/* STEP 1: FORMULE SELECTION */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between border-b border-white/15 pb-4">
                  <div className="text-xs text-white/70 uppercase tracking-wider font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#FF7582]" />
                    ÉTAPE 01 : SÉLECTION DU PROTOCOLE D&apos;ENTRAÎNEMENT
                  </div>
                  <span className="text-xs text-[#FF7582] font-bold tracking-wider">3 FORMULES DISPONIBLES</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                  {/* Carte PRO — spotlight 7 cols */}
                  <div
                    onClick={() => setSelectedPlan("pro")}
                    className={`group lg:col-span-7 reticle-box p-8 sm:p-10 flex flex-col justify-between space-y-8 relative overflow-hidden cursor-pointer transition-all duration-300 ${
                      selectedPlan === "pro"
                        ? "bg-[#FF7582]/10 border border-[#FF7582] shadow-[0_0_40px_rgba(255,117,130,0.25)]"
                        : "bg-[#090C12] border border-white/20 hover:border-[#FF7582]/60"
                    }`}
                  >
                    <CornerBrackets />
                    <div className="space-y-5 relative z-10">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                        <span className="bg-[#FF7582] text-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                          FORMULE DE RÉFÉRENCE
                        </span>
                        <span className="text-xs text-[#8FAFD4] tracking-widest font-semibold">
                          DURÉE : 60 MINUTES
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-white/40 uppercase tracking-widest block">
                          COACHING INDIVIDUEL COMPLET
                        </span>
                        <h3 className="text-4xl sm:text-5xl font-display text-white tracking-wider mt-1">
                          COACHING PRO
                        </h3>
                        <div className="flex items-baseline gap-3 mt-3">
                          <span className="glitch-text text-5xl font-display text-[#FF7582]">49 €</span>
                          <span className="text-xs text-white/40">/ SÉANCE INTENSIVE</span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-xl">
                        L&apos;expérience centrale de l&apos;Atelier Poulpy : diagnostic en direct, recalibrage biomécanique du viseur et correction chirurgicale de vos prises d&apos;information.
                      </p>

                      <div className="space-y-3 pt-4 border-t border-white/10">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest block">CONTENU DU PROTOCOLE :</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-white/80">
                          {[
                            "Analyse complète de gameplay",
                            "Coaching personnalisé en vocal",
                            "Travail d'aim & placement du viseur",
                            "Feuille de route Notion 4 semaines",
                            "Suivi Discord VIP 7j/7",
                          ].map((feat, i) => (
                            <div key={i} className="p-3 bg-black/60 border border-white/5 flex items-start gap-2.5">
                              <span className="w-1.5 h-1.5 bg-[#FF7582] shrink-0 mt-1.5" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 pt-4 border-t border-white/10">
                      <span className="text-[10px] text-white/50">Idéal pour débloquer un palier de ranked tenace</span>
                    </div>
                  </div>

                  {/* Cartes satellites — 5 cols empilées */}
                  <div className="lg:col-span-5 flex flex-col gap-6">

                    {/* SESSION DIAGNOSTIC */}
                    <div
                      onClick={() => setSelectedPlan("session")}
                      className={`group relative flex-1 p-7 flex flex-col justify-between space-y-5 cursor-pointer transition-all ${
                        selectedPlan === "session"
                          ? "bg-[#FF7582]/10 border border-[#FF7582] shadow-[0_0_25px_rgba(255,117,130,0.2)]"
                          : "bg-[#090C12] border border-white/15 hover:border-white/40"
                      }`}
                    >
                      <CornerBrackets />
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-wider bg-white/10 text-white/70">
                            DIAGNOSTIC FLASH
                          </span>
                          <span className="text-xs text-white/40">30 MINUTES</span>
                        </div>
                        <div>
                          <h4 className="text-2xl font-display text-white tracking-wider">SESSION DIAGNOSTIC</h4>
                          <div className="text-3xl font-display text-white mt-1">29 €</div>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed">
                          Audit ciblé pour isoler rapidement les défauts majeurs de viseur ou de crosshair placement.
                        </p>
                        <ul className="space-y-2 text-xs text-white/70 pt-3 border-t border-white/10">
                          {["Analyse rapide de gameplay", "Conseils personnalisés immédiats", "Compte-rendu écrit"].map((f, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-white/40 shrink-0 mt-1.5" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* PERFORMANCE */}
                    <div
                      onClick={() => setSelectedPlan("performance")}
                      className={`group relative flex-1 p-7 flex flex-col justify-between space-y-5 cursor-pointer transition-all ${
                        selectedPlan === "performance"
                          ? "bg-[#8FAFD4]/10 border border-[#8FAFD4] shadow-[0_0_25px_rgba(143,175,212,0.2)]"
                          : "bg-[#090C12] border border-white/15 hover:border-white/40"
                      }`}
                    >
                      <CornerBrackets color="slate" />
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-wider bg-[#8FAFD4]/20 text-[#8FAFD4]">
                            COMPÉTITION & TEAM
                          </span>
                          <span className="text-xs text-[#8FAFD4]">90 MINUTES</span>
                        </div>
                        <div>
                          <h4 className="text-2xl font-display text-white tracking-wider">PERFORMANCE</h4>
                          <div className="text-3xl font-display text-white mt-1">89 €</div>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed">
                          Immersion totale : VOD review approfondie, simulation de match et routine KovaaK&apos;s sur-mesure.
                        </p>
                        <ul className="space-y-2 text-xs text-white/70 pt-3 border-t border-white/10">
                          {["Double session VOD & coaching live", "Programme KovaaK's / Aim Lab", "Suivi Discord prioritaire"].map((f, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-[#8FAFD4] shrink-0 mt-1.5" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs text-white/60">
                    SÉLECTION ACTUELLE : <strong className="text-white font-mono">{activePlan.name} ({activePlan.price} - {activePlan.duration})</strong>
                  </span>
                  <button
                    onClick={handleNextStep}
                    className="btn-cyber-primary flex items-center gap-2 py-3.5 px-8 text-xs font-bold uppercase tracking-wider w-full sm:w-auto justify-center"
                  >
                    <span>CHOISIR LE CRÉNEAU</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: CRÉNEAU SELECTION */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between border-b border-white/15 pb-4">
                  <div className="text-xs text-white/70 uppercase tracking-wider font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#FF7582]" />
                    ÉTAPE 02 : VERROUILLAGE DU CALENDRIER // CRÉNEAU TACTIQUE
                  </div>
                  <span className="text-xs text-[#FF7582] font-bold tracking-wider">FORMULE: {activePlan.name}</span>
                </div>

                <div className="space-y-6">
                  {/* Days Bar */}
                  <div className="space-y-2">
                    <label className="text-xs text-white/60 block uppercase font-bold">
                      1. SÉLECTIONNER UN JOUR :
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                      {AVAILABLE_DAYS.map((d, index) => {
                        const isDaySelected = selectedDay === index;
                        return (
                          <div
                            key={index}
                            onClick={() => setSelectedDay(index)}
                            className={`p-3 border text-center cursor-pointer transition-all ${
                              isDaySelected
                                ? "border-[#FF7582] bg-[#FF7582] text-black shadow-[0_0_15px_rgba(255,117,130,0.35)] font-bold"
                                : "border-white/15 bg-black hover:border-white/40 text-white"
                            }`}
                          >
                            <div className="text-[10px] opacity-75">{d.day}</div>
                            <div className="text-sm font-display tracking-wider">{d.date}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="space-y-2">
                    <label className="text-xs text-white/60 block uppercase font-bold">
                      2. SÉLECTIONNER L&apos;HORAIRE (HEURE DE PARIS UTC+1) :
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {TIME_SLOTS.map((t) => {
                        const isTimeSelected = selectedTime === t;
                        return (
                          <div
                            key={t}
                            onClick={() => setSelectedTime(t)}
                            className={`p-4 border text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                              isTimeSelected
                                ? "border-[#8FAFD4] bg-[#8FAFD4]/10 text-[#8FAFD4] font-bold shadow-[0_0_15px_rgba(143,175,212,0.25)]"
                                : "border-white/15 bg-black hover:border-white/40 text-white/80"
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-sm font-mono">{t}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Summary Badge */}
                  <div className="p-4 bg-black border border-white/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-[#FF7582]" />
                      <span>
                        CRÉNEAU VALIDÉ : <strong className="text-white">{(AVAILABLE_DAYS[selectedDay] || AVAILABLE_DAYS[0]).full} à {selectedTime}</strong>
                      </span>
                    </div>
                    <span className="text-[#A4DE87] font-bold">DISPONIBLE</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="btn-cyber-ghost flex items-center gap-2 py-3 px-6 text-xs uppercase"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>RETOUR FORMULES</span>
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="btn-cyber-primary flex items-center gap-2 py-3 px-8 text-xs font-bold uppercase"
                  >
                    <span>RENSEIGNER MON PROFIL</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: INFOS & FORM */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="text-xs text-white/50 uppercase tracking-wider">
                    ÉTAPE 03 : PROFIL JOUEUR &amp; DOSSIER TACTIQUE
                  </div>
                  <span className="text-xs text-[#FF7582] font-bold">
                    {activePlan.name} // {(AVAILABLE_DAYS[selectedDay] || AVAILABLE_DAYS[0]).date} {selectedTime}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-white/60 uppercase block mb-1.5">
                        PSEUDO IN-GAME &amp; TAG * :
                      </label>
                      <input
                        type="text"
                        placeholder="ex: Poulpy#0001 ou TenZ#NA1"
                        value={inGameName}
                        onChange={(e) => setInGameName(e.target.value)}
                        className="w-full bg-black border border-white/15 px-4 py-3 text-xs text-white font-mono outline-none focus:border-[#FF7582]"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/60 uppercase block mb-1.5">
                        IDENTIFIANT DISCORD * :
                      </label>
                      <input
                        type="text"
                        placeholder="ex: poulpy_coach"
                        value={discordId}
                        onChange={(e) => setDiscordId(e.target.value)}
                        className="w-full bg-black border border-white/15 px-4 py-3 text-xs text-white font-mono outline-none focus:border-[#FF7582]"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/60 uppercase block mb-1.5">
                        DISCIPLINE / TITRE :
                      </label>
                      <select
                        value={game}
                        onChange={(e) => setGame(e.target.value)}
                        className="w-full bg-black border border-white/15 px-4 py-3 text-xs text-white font-mono outline-none focus:border-[#FF7582]"
                      >
                        <option value="Valorant">VALORANT (RIOT GAMES)</option>
                        <option value="Apex Legends">APEX LEGENDS (EA)</option>
                        <option value="Aim Specialist">AIMLABS / KOVAAK&apos;S (VOLTAIC)</option>
                        <option value="Overwatch 2">OVERWATCH 2 (BLIZZARD)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-white/60 uppercase block mb-1.5">
                        RANG ACTUEL &amp; PEAK :
                      </label>
                      <input
                        type="text"
                        placeholder="ex: Diamant 2 (Peak Ascendant 1)"
                        value={currentRank}
                        onChange={(e) => setCurrentRank(e.target.value)}
                        className="w-full bg-black border border-white/15 px-4 py-3 text-xs text-white font-mono outline-none focus:border-[#FF7582]"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/60 uppercase block mb-1.5">
                        OBJECTIFS PRIORITAIRES / BLOCAGES ACTUELS :
                      </label>
                      <textarea
                        rows={4}
                        placeholder="ex: Je perds tous mes duels de clutch en défense. Je veux stabiliser mon crosshair placement et comprendre mes timings de prise d'info."
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        className="w-full bg-black border border-white/15 px-4 py-3 text-xs text-white font-mono outline-none focus:border-[#FF7582] resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="btn-cyber-ghost flex items-center gap-2 py-3 px-6 text-xs uppercase"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>MODIFIER LE CRÉNEAU</span>
                  </button>
                  <button
                    disabled={!discordId.trim()}
                    onClick={handleNextStep}
                    className="btn-cyber-primary flex items-center gap-2 py-3 px-8 text-xs font-bold uppercase disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>CONFIRMER LA RÉSERVATION</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: CONFIRMATION */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="py-10 text-center space-y-6 max-w-xl mx-auto"
              >
                <div className="w-16 h-16 border-2 border-[#FF7582] bg-[#FF7582]/10 flex items-center justify-center mx-auto text-[#FF7582] shadow-[0_0_30px_rgba(255,117,130,0.35)]">
                  <Check className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="data-badge data-badge-acid">ORDRE DE MISSION VALIDÉ // {confirmedMissionId}</span>
                  <h3 className="text-3xl sm:text-4xl font-display text-white tracking-wider">
                    CRÉNEAU TACTIQUE VERROUILLÉ
                  </h3>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Ton briefing est enregistré dans le système. Poulpy t&apos;enverra l&apos;invitation privée sur Discord pour initier la séance dans le salon vocal dédié.
                  </p>
                </div>

                {/* Recap Box */}
                <div className="p-6 bg-black border border-[#FF7582]/40 text-left space-y-3 text-xs">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/50">PROTOCOLE :</span>
                    <span className="text-white font-bold">{activePlan.name} ({activePlan.price})</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/50">HORAIRE :</span>
                    <span className="text-[#FF7582] font-bold">{(AVAILABLE_DAYS[selectedDay] || AVAILABLE_DAYS[0]).full} à {selectedTime}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/50">JOUEUR / DISCORD :</span>
                    <span className="text-white">{inGameName || "Non spécifié"} ({discordId})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">DISCIPLINE &amp; RANG :</span>
                    <span className="text-white">{game} // {currentRank}</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="https://discord.gg"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-cyber-primary py-3 px-8 text-xs font-bold uppercase inline-flex items-center gap-2"
                  >
                    <span>REJOINDRE LE DISCORD SÉCURISÉ</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <button
                    onClick={handleReset}
                    className="btn-cyber-ghost py-3 px-6 text-xs uppercase"
                  >
                    NOUVELLE RÉSERVATION
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
