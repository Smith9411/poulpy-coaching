"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Calendar, Clock, User, Shield, ChevronRight, ChevronLeft, ArrowRight, Send, Loader2, AlertCircle } from "lucide-react";
import DecryptedText from "./DecryptedText";
import CornerBrackets from "./CornerBrackets";
import { useAuth } from "@/context/AuthContext";
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

interface RawSlot {
  id: string;
  date: string;
  start_time: string;
  is_active: boolean;
  is_booked: boolean;
}

interface DayOption {
  dayName: string;
  dayNumber: number;
  monthName: string;
  dateIso: string;
  fullDateLabel: string;
  slots: Array<{
    id?: string;
    time: string;
    available: boolean;
    isBooked: boolean;
    isActive: boolean;
  }>;
  availableCount: number;
}

const DAYS_SHORT = ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"];
const DAYS_FULL = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const MONTHS_SHORT = ["JANV", "FÉVR", "MARS", "AVR", "MAI", "JUIN", "JUIL", "AOÛT", "SEPT", "OCT", "NOV", "DÉC"];
const MONTHS_FULL = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const STANDARD_HOURS = ["10:00", "11:30", "14:00", "15:30", "17:00", "18:30", "20:00", "21:30"];

export default function Booking() {
  const { user } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");

  // Slots data
  const [dbSlots, setDbSlots] = useState<RawSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(true);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Form fields
  const [studentName, setStudentName] = useState<string>("");
  const [studentEmail, setStudentEmail] = useState<string>("");
  const [studentDiscord, setStudentDiscord] = useState<string>("");
  const [game, setGame] = useState<string>("Valorant");
  const [currentRank, setCurrentRank] = useState<string>("Diamant 2");
  const [objective, setObjective] = useState<string>("");

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedMissionId, setConfirmedMissionId] = useState<string>("");

  // Auto-fill form from user context
  useEffect(() => {
    if (user) {
      if (user.username && !studentName) setStudentName(user.username);
      if (user.email && !studentEmail) setStudentEmail(user.email);
    }
  }, [user, studentName, studentEmail]);

  // Fetch real open slots from API
  const fetchSlots = async () => {
    setLoadingSlots(true);
    try {
      const res = await fetch("/api/bookings/slots", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setDbSlots(data.slots || []);
      }
    } catch (err) {
      console.warn("Erreur fetch slots:", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  // Compute 14 upcoming days
  const daysList: DayOption[] = useMemo(() => {
    const list: DayOption[] = [];
    const baseDate = new Date();

    const slotsByDate = new Map<string, RawSlot[]>();
    dbSlots.forEach((s) => {
      const arr = slotsByDate.get(s.date) || [];
      arr.push(s);
      slotsByDate.set(s.date, arr);
    });

    for (let i = 1; i <= 14; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);

      const dateIso = d.toISOString().split("T")[0];
      const dayOfWeek = d.getDay();
      const dayName = DAYS_SHORT[dayOfWeek];
      const dayFull = DAYS_FULL[dayOfWeek];
      const dayNum = d.getDate();
      const monthShort = MONTHS_SHORT[d.getMonth()];
      const monthFull = MONTHS_FULL[d.getMonth()];
      const fullDateLabel = `${dayFull} ${dayNum} ${monthFull}`;

      const dayDbSlots = slotsByDate.get(dateIso) || [];

      // Si le coach a configuré des créneaux dans coaching_slots pour ce jour
      let slotItems: Array<{ id?: string; time: string; available: boolean; isBooked: boolean; isActive: boolean }> = [];

      if (dayDbSlots.length > 0) {
        slotItems = dayDbSlots.map((s) => ({
          id: s.id,
          time: s.start_time,
          available: Boolean(s.is_active && !s.is_booked),
          isBooked: Boolean(s.is_booked),
          isActive: Boolean(s.is_active),
        }));
        slotItems.sort((a, b) => a.time.localeCompare(b.time));
      } else {
        // Le coach n'a pas configuré ce jour -> tout est indisponible (aucun créneau ouvert)
        slotItems = STANDARD_HOURS.map((h) => ({
          time: h,
          available: false,
          isBooked: false,
          isActive: false,
        }));
      }

      const availableCount = slotItems.filter((s) => s.available).length;

      list.push({
        dayName,
        dayNumber: dayNum,
        monthName: monthShort,
        dateIso,
        fullDateLabel,
        slots: slotItems,
        availableCount,
      });
    }

    return list;
  }, [dbSlots]);

  const activePlan = PLANS.find((p) => p.id === selectedPlan) || PLANS[1];
  const currentDay = daysList[selectedDayIndex] || daysList[0];

  const handleSelectSlot = (slot: { id?: string; time: string; available: boolean }) => {
    if (!slot.available) return;
    setSelectedSlotId(slot.id || null);
    setSelectedTime(slot.time);
  };

  const handleNextStep = async () => {
    if (step === 2) {
      if (!selectedTime) {
        setSubmitError("Veuillez sélectionner un créneau horaire disponible.");
        return;
      }
      setSubmitError(null);
      setStep(3);
    } else if (step === 3) {
      // Validate Step 3
      if (!studentDiscord.trim()) {
        setSubmitError("L'identifiant Discord est requis pour initier le salon vocal.");
        return;
      }
      if (!studentEmail.trim()) {
        setSubmitError("L'adresse email est requise pour la confirmation.");
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const randomCode = Math.floor(1000 + Math.random() * 9000);
        const missionId = `PLP-${randomCode}-OP`;

        let token: string | undefined;
        try {
          const { data: { session } } = await supabase.auth.getSession();
          token = session?.access_token;
        } catch {}

        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch("/api/bookings/create", {
          method: "POST",
          headers,
          body: JSON.stringify({
            slotId: selectedSlotId,
            bookingDate: currentDay.dateIso,
            bookingTime: selectedTime,
            planId: activePlan.id,
            planName: activePlan.name,
            planPrice: activePlan.price,
            planDuration: activePlan.duration,
            studentName: studentName.trim() || studentDiscord.trim(),
            studentEmail: studentEmail.trim(),
            studentDiscord: studentDiscord.trim(),
            game: `${game} (${currentRank})`,
            notes: objective.trim(),
          }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error || "Erreur lors de la réservation");
        }

        setConfirmedMissionId(missionId);
        setStep(4);
        fetchSlots(); // Refresh slot states
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erreur lors de la réservation";
        setSubmitError(msg);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedTime("");
    setSelectedSlotId(null);
    setObjective("");
    setSubmitError(null);
  };

  return (
    <section id="booking" className="py-32 px-6 sm:px-12 lg:px-16 bg-[#07090D] border-t border-[rgba(255,255,255,0.08)] font-mono relative z-20">
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
              Verrouille ton créneau tactique avec Poulpy. Sélectionne ta formule, consulte les créneaux disponibles en direct et transmets tes informations.
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
                  className={`px-3.5 py-1.5 text-xs font-bold border transition-all ${
                    isDone ? "cursor-pointer" : ""
                  } ${
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

            {/* STEP 2: CRÉNEAU SELECTION (DYNAMIC SLOTS FROM DATABASE) */}
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
                    ÉTAPE 02 : VERROUILLAGE DU CALENDRIER // CRÉNEAUX EN DIRECT
                  </div>
                  <span className="text-xs text-[#FF7582] font-bold tracking-wider">FORMULE: {activePlan.name}</span>
                </div>

                <div className="space-y-6">
                  {/* Days Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-white/70 block uppercase font-bold tracking-wider">
                        1. SÉLECTIONNER UN JOUR (14 PROCHAINS JOURS) :
                      </label>
                      {loadingSlots && (
                        <div className="flex items-center gap-1.5 text-xs text-[#8FAFD4]">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Actualisation...</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 -mx-2 px-2 scrollbar-thin">
                      {daysList.map((d, index) => {
                        const isDaySelected = selectedDayIndex === index;
                        const hasAvailable = d.availableCount > 0;

                        return (
                          <div
                            key={d.dateIso}
                            onClick={() => {
                              setSelectedDayIndex(index);
                              setSelectedTime("");
                              setSelectedSlotId(null);
                            }}
                            className={`flex-shrink-0 w-24 sm:w-28 p-3 border text-center cursor-pointer transition-all flex flex-col justify-between ${
                              isDaySelected
                                ? "border-[#FF7582] bg-[#FF7582]/15 text-white shadow-[0_0_15px_rgba(255,117,130,0.3)] ring-1 ring-[#FF7582]"
                                : "border-white/15 bg-black/60 hover:border-white/40 text-white"
                            }`}
                          >
                            <div>
                              <div className="text-[10px] text-white/50 uppercase tracking-wider font-bold">{d.dayName}</div>
                              <div className="text-lg font-display tracking-wider">{d.dayNumber} {d.monthName}</div>
                            </div>

                            <div className="mt-2">
                              {hasAvailable ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#A4DE87]/15 border border-[#A4DE87]/40 text-[#A4DE87] uppercase block">
                                  {d.availableCount} dispo
                                </span>
                              ) : (
                                <span className="text-[9px] font-medium px-1.5 py-0.5 bg-white/5 border border-white/10 text-white/30 uppercase block">
                                  Complet
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slots Section for Selected Day */}
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-white/70 block uppercase font-bold tracking-wider">
                        2. SÉLECTIONNER L&apos;HORAIRE POUR LE {currentDay.fullDateLabel.toUpperCase()} :
                      </label>
                      <span className="text-xs text-white/40 font-mono">FUSEAU : PARIS (UTC+1)</span>
                    </div>

                    {currentDay.availableCount === 0 ? (
                      <div className="p-8 bg-black/80 border border-white/10 text-center space-y-2">
                        <Clock className="w-8 h-8 text-white/30 mx-auto mb-1" />
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                          AUCUN CRÉNEAU DISPONIBLE POUR CETTE DATE
                        </h4>
                        <p className="text-xs text-white/50 max-w-md mx-auto">
                          Le coach n&apos;a pas ouvert de disponibilités pour ce jour ou tous les créneaux ont déjà été réservés. Choisis un autre jour dans la liste ci-dessus !
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-3">
                        {currentDay.slots.map((s) => {
                          const isTimeSelected = selectedTime === s.time;
                          const isAvailable = s.available;

                          return (
                            <button
                              key={s.time}
                              type="button"
                              disabled={!isAvailable}
                              onClick={() => handleSelectSlot(s)}
                              className={`p-4 border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                                !isAvailable
                                  ? "border-white/5 bg-white/[0.02] text-white/30 cursor-not-allowed line-through opacity-40"
                                  : isTimeSelected
                                  ? "border-[#FF7582] bg-[#FF7582] text-black font-bold shadow-[0_0_20px_rgba(255,117,130,0.4)] cursor-pointer"
                                  : "border-white/15 bg-black/60 hover:border-[#FF7582]/60 text-white cursor-pointer"
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-base font-display tracking-wider">{s.time}</span>
                              </div>

                              <span className={`text-[9px] uppercase font-bold tracking-widest ${
                                isTimeSelected ? "text-black" : isAvailable ? "text-[#A4DE87]" : "text-white/20"
                              }`}>
                                {isTimeSelected ? "SÉLECTIONNÉ" : isAvailable ? "DISPONIBLE" : "INDISPONIBLE"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Legend */}
                    <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-[11px] text-white/50 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#A4DE87]" />
                        <span>DISPONIBLE</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#FF7582]" />
                        <span>SÉLECTIONNÉ</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-white/20" />
                        <span className="line-through">INDISPONIBLE / COMPLET</span>
                      </div>
                    </div>
                  </div>

                  {/* Selected Summary Badge */}
                  {selectedTime && (
                    <div className="p-4 bg-black border border-[#FF7582]/40 flex items-center justify-between text-xs animate-in fade-in">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-[#FF7582]" />
                        <span>
                          CRÉNEAU SÉLECTIONNÉ : <strong className="text-white">{currentDay.fullDateLabel} à {selectedTime}</strong>
                        </span>
                      </div>
                      <span className="text-[#A4DE87] font-bold">[ CRÉNEAU VALIDÉ ]</span>
                    </div>
                  )}

                  {submitError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="btn-cyber-ghost flex items-center gap-2 py-3 px-6 text-xs uppercase cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>RETOUR FORMULES</span>
                  </button>
                  <button
                    disabled={!selectedTime}
                    onClick={handleNextStep}
                    className="btn-cyber-primary flex items-center gap-2 py-3 px-8 text-xs font-bold uppercase disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
                  <div className="text-xs text-white/50 uppercase tracking-wider font-bold">
                    ÉTAPE 03 : PROFIL JOUEUR &amp; DOSSIER TACTIQUE
                  </div>
                  <span className="text-xs text-[#FF7582] font-bold">
                    {activePlan.name} // {currentDay.fullDateLabel} à {selectedTime}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-white/70 uppercase block mb-1.5 font-bold">
                        NOM / PSEUDO JOUEUR :
                      </label>
                      <input
                        type="text"
                        placeholder="ex: Alex ou PoulpyFan"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full bg-black border border-white/15 px-4 py-3 text-xs text-white font-mono outline-none focus:border-[#FF7582]"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/70 uppercase block mb-1.5 font-bold">
                        EMAIL DE CONFIRMATION * :
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="ex: ton.email@gmail.com"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        className="w-full bg-black border border-white/15 px-4 py-3 text-xs text-white font-mono outline-none focus:border-[#FF7582]"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/70 uppercase block mb-1.5 font-bold">
                        IDENTIFIANT DISCORD * :
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ex: poulpy_esport ou Alex#1234"
                        value={studentDiscord}
                        onChange={(e) => setStudentDiscord(e.target.value)}
                        className="w-full bg-black border border-white/15 px-4 py-3 text-xs text-white font-mono outline-none focus:border-[#FF7582]"
                      />
                      <span className="text-[10px] text-white/40 block mt-1">
                        Indispensable pour le salon vocal de coaching.
                      </span>
                    </div>

                    <div>
                      <label className="text-xs text-white/70 uppercase block mb-1.5 font-bold">
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
                      <label className="text-xs text-white/70 uppercase block mb-1.5 font-bold">
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
                      <label className="text-xs text-white/70 uppercase block mb-1.5 font-bold">
                        OBJECTIFS PRIORITAIRES / ATTENTES DU COACHING :
                      </label>
                      <textarea
                        rows={5}
                        placeholder="ex: Je perds tous mes duels de clutch en défense. Je veux stabiliser mon crosshair placement et comprendre mes timings de prise d'info."
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        className="w-full bg-black border border-white/15 px-4 py-3 text-xs text-white font-mono outline-none focus:border-[#FF7582] resize-none"
                      />
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="btn-cyber-ghost flex items-center gap-2 py-3 px-6 text-xs uppercase cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>MODIFIER LE CRÉNEAU</span>
                  </button>
                  <button
                    disabled={!studentDiscord.trim() || !studentEmail.trim() || isSubmitting}
                    onClick={handleNextStep}
                    className="btn-cyber-primary flex items-center gap-2 py-3 px-8 text-xs font-bold uppercase disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>ENREGISTREMENT...</span>
                      </>
                    ) : (
                      <>
                        <span>CONFIRMER LA RÉSERVATION</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
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
                    Ton dossier est enregistré dans la base de données. Poulpy te contactera sur Discord pour débuter la séance dans le salon vocal dédié.
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
                    <span className="text-[#FF7582] font-bold">{currentDay.fullDateLabel} à {selectedTime}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/50">JOUEUR / DISCORD :</span>
                    <span className="text-white">{studentName || "Non spécifié"} ({studentDiscord})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">DISCIPLINE &amp; RANG :</span>
                    <span className="text-white">{game} // {currentRank}</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="https://discord.gg/rJMg3ZZRkp"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-cyber-primary py-3 px-8 text-xs font-bold uppercase inline-flex items-center gap-2"
                  >
                    <span>REJOINDRE LE DISCORD DU COACH</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <button
                    onClick={handleReset}
                    className="btn-cyber-ghost py-3 px-6 text-xs uppercase cursor-pointer"
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
