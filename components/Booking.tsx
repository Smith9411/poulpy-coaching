"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Calendar, Clock, User, Shield, ChevronRight, ChevronLeft, ArrowRight, Send, Loader2, AlertCircle, Crosshair, Sparkles } from "lucide-react";
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
    name: "SESSION FLASH",
    duration: "30 MIN",
    price: "29 €",
    description: "Idéal pour un premier diagnostic rapide et précis de ton gameplay.",
    features: ["Analyse rapide de gameplay", "Conseils personnalisés immédiats", "Exercices ciblés de recalibrage", "Compte-rendu écrit"],
  },
  {
    id: "pro",
    name: "COACHING PRO",
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

// Compact 3D Tilt HUD Plan Card Component
function TiltPlanCard({
  plan,
  isSelected,
  onSelect,
}: {
  plan: PlanOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const isAcid = plan.id === "pro";
  const isSlate = plan.id === "performance";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    const rotX = ((y - rect.height / 2) / (rect.height / 2)) * -8;
    const rotY = ((x - rect.width / 2) / (rect.width / 2)) * 8;

    setRotate({ x: rotX, y: rotY });
    setMousePos({ x: percentX, y: percentY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
      className="perspective-1000 h-full cursor-pointer"
      style={{ perspective: "1000px" }}
    >
      <motion.div
        animate={{
          rotateX: rotate.x,
          rotateY: rotate.y,
          scale: isHovered ? 1.01 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        style={{ transformStyle: "preserve-3d" }}
        className={`relative h-full reticle-box flex flex-col justify-between overflow-hidden transition-colors duration-200 select-none p-5 sm:p-6 space-y-4 ${
          isSelected
            ? isAcid
              ? "bg-[#FF7582]/10 border-[#FF7582] shadow-[0_0_30px_rgba(255,117,130,0.25)] ring-1 ring-[#FF7582]"
              : isSlate
              ? "bg-[#8FAFD4]/10 border-[#8FAFD4] shadow-[0_0_30px_rgba(143,175,212,0.25)] ring-1 ring-[#8FAFD4]"
              : "bg-white/10 border-white shadow-[0_0_30px_rgba(255,255,255,0.2)] ring-1 ring-white"
            : isHovered
            ? isAcid
              ? "border-[#FF7582]/70 shadow-[0_0_20px_rgba(255,117,130,0.15)] bg-[#0d1017]"
              : isSlate
              ? "border-[#8FAFD4]/70 shadow-[0_0_20px_rgba(143,175,212,0.15)] bg-[#0d1017]"
              : "border-white/40 bg-[#0d1017]"
            : "bg-[#090C12] border-white/15"
        }`}
      >
        {/* Corner Brackets / Encoches */}
        <CornerBrackets color={isSlate ? "slate" : "coral"} />

        {/* Dynamic Specular Light Follower (Spotlight) */}
        {isHovered && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-200"
            style={{
              background: `radial-gradient(circle 200px at ${mousePos.x}% ${mousePos.y}%, ${
                isAcid
                  ? "rgba(255, 117, 130, 0.15)"
                  : isSlate
                  ? "rgba(143, 175, 212, 0.15)"
                  : "rgba(255, 255, 255, 0.08)"
              }, transparent 80%)`,
            }}
          />
        )}

        {/* Popular / Recommended Badge */}
        {plan.popular && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#FF7582] text-black">
            RECOMMANDE
          </div>
        )}

        {/* Content */}
        <div className="space-y-3.5 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono">
              FORMULE {plan.duration}
            </span>
            <div className={`w-2 h-2 rounded-full ${isSelected ? (isAcid ? "bg-[#FF7582]" : isSlate ? "bg-[#8FAFD4]" : "bg-white") : "bg-white/20"}`} />
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-display text-white tracking-wider">
              {plan.name}
            </h3>

            {/* Price without any glitch or extra clutter */}
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-3xl font-display ${isAcid ? "text-[#FF7582]" : isSlate ? "text-[#8FAFD4]" : "text-white"}`}>
                {plan.price}
              </span>
              <span className="text-[10px] text-white/40 font-mono uppercase">/ SÉANCE</span>
            </div>
          </div>

          <p className="text-[11px] text-white/60 leading-relaxed line-clamp-2">
            {plan.description}
          </p>

          <div className="space-y-1.5 pt-2.5 border-t border-white/10">
            {plan.features.map((feat, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-white/80">
                <span className={`w-1 h-1 shrink-0 ${isAcid ? "bg-[#FF7582]" : isSlate ? "bg-[#8FAFD4]" : "bg-white/50"}`} />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card Footer Button Indicator */}
        <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
          <span className="text-[10px] text-white/40">
            {plan.id === "pro" ? "Le choix favori des élèves" : plan.id === "performance" ? "Programme intensif" : "Audit rapide"}
          </span>
          <div className={`flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider ${
            isSelected ? (isAcid ? "text-[#FF7582]" : isSlate ? "text-[#8FAFD4]" : "text-white") : "text-white/40"
          }`}>
            <span>{isSelected ? "SÉLECTIONNÉ" : "CHOISIR"}</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

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
        fetchSlots();
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
    <section id="booking" className="py-20 px-6 sm:px-12 lg:px-16 bg-[#07090D] border-t border-[rgba(255,255,255,0.08)] font-mono relative z-20">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <span className="data-badge data-badge-laser">
              <DecryptedText text="MODULE DE RÉSERVATION" />
            </span>
            <h2 className="text-3xl sm:text-5xl font-display text-white tracking-wider">
              RÉSERVE TON <span className="text-[#FF7582]">COACHING</span>
            </h2>
            <p className="text-xs text-white/50 max-w-2xl leading-relaxed">
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
                  className={`px-3 py-1.5 text-xs font-bold border transition-all ${
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
        <div className="reticle-box p-6 sm:p-8 bg-[#090c10] border border-white/20 relative shadow-[0_0_50px_rgba(0,0,0,0.9)]">
          <AnimatePresence mode="wait" initial={false}>
            {/* STEP 1: FORMULE SELECTION (COMPACT 3 COLUMNS SIDE BY SIDE) */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <div className="text-xs text-white/70 uppercase tracking-wider font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#FF7582]" />
                    ÉTAPE 01 : SÉLECTION DU PROTOCOLE D&apos;ENTRAÎNEMENT
                  </div>
                  <span className="text-xs text-[#FF7582] font-bold tracking-wider">3 FORMULES DISPONIBLES</span>
                </div>

                {/* 3 cards in 3 equal columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                  {PLANS.map((plan) => (
                    <TiltPlanCard
                      key={plan.id}
                      plan={plan}
                      isSelected={selectedPlan === plan.id}
                      onSelect={() => setSelectedPlan(plan.id)}
                    />
                  ))}
                </div>

                {/* Bottom Action Bar */}
                <div className="pt-5 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs text-white/60">
                    SÉLECTION : <strong className="text-white font-mono">{activePlan.name} ({activePlan.price} - {activePlan.duration})</strong>
                  </span>
                  <button
                    onClick={handleNextStep}
                    className="btn-cyber-primary flex items-center gap-2 py-3 px-8 text-xs font-bold uppercase tracking-wider w-full sm:w-auto justify-center cursor-pointer"
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
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <div className="text-xs text-white/70 uppercase tracking-wider font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#FF7582]" />
                    ÉTAPE 02 : VERROUILLAGE DU CALENDRIER // CRÉNEAUX EN DIRECT
                  </div>
                  <span className="text-xs text-[#FF7582] font-bold tracking-wider">FORMULE: {activePlan.name}</span>
                </div>

                <div className="space-y-5">
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
                  <div className="space-y-3 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-white/70 block uppercase font-bold tracking-wider">
                        2. SÉLECTIONNER L&apos;HORAIRE POUR LE {currentDay.fullDateLabel.toUpperCase()} :
                      </label>
                      <span className="text-xs text-white/40 font-mono">FUSEAU : PARIS (UTC+1)</span>
                    </div>

                    {currentDay.availableCount === 0 ? (
                      <div className="p-6 bg-black/80 border border-white/10 text-center space-y-2">
                        <Clock className="w-7 h-7 text-white/30 mx-auto mb-1" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          AUCUN CRÉNEAU DISPONIBLE POUR CETTE DATE
                        </h4>
                        <p className="text-xs text-white/50 max-w-md mx-auto">
                          Le coach n&apos;a pas ouvert de disponibilités pour ce jour ou tous les créneaux ont déjà été réservés.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-2.5">
                        {currentDay.slots.map((s) => {
                          const isTimeSelected = selectedTime === s.time;
                          const isAvailable = s.available;

                          return (
                            <button
                              key={s.time}
                              type="button"
                              disabled={!isAvailable}
                              onClick={() => handleSelectSlot(s)}
                              className={`p-3 border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                                !isAvailable
                                  ? "border-white/5 bg-white/[0.02] text-white/30 cursor-not-allowed line-through opacity-40"
                                  : isTimeSelected
                                  ? "border-[#FF7582] bg-[#FF7582] text-black font-bold shadow-[0_0_20px_rgba(255,117,130,0.4)] cursor-pointer"
                                  : "border-white/15 bg-black/60 hover:border-[#FF7582]/60 text-white cursor-pointer"
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-sm font-display tracking-wider">{s.time}</span>
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
                    <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-[10px] text-white/50 font-mono">
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
                    <div className="p-3 bg-black border border-[#FF7582]/40 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-[#FF7582]" />
                        <span>
                          CRÉNEAU SÉLECTIONNÉ : <strong className="text-white">{currentDay.fullDateLabel} à {selectedTime}</strong>
                        </span>
                      </div>
                      <span className="text-[#A4DE87] font-bold text-[11px]">[ CRÉNEAU VALIDÉ ]</span>
                    </div>
                  )}

                  {submitError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="btn-cyber-ghost flex items-center gap-2 py-2.5 px-5 text-xs uppercase cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>RETOUR FORMULES</span>
                  </button>
                  <button
                    disabled={!selectedTime}
                    onClick={handleNextStep}
                    className="btn-cyber-primary flex items-center gap-2 py-2.5 px-6 text-xs font-bold uppercase disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>RENSEIGNER MON PROFIL</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: INFOS ÉLÈVE */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <div className="text-xs text-white/70 uppercase tracking-wider font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#FF7582]" />
                    ÉTAPE 03 : DOSSIER DU JOUEUR // BRIEF TACTIQUE
                  </div>
                  <span className="text-xs text-[#FF7582] font-bold tracking-wider">
                    {activePlan.name} • {selectedTime}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] text-white/70 block uppercase font-bold tracking-wider mb-1.5">
                        PSEUDO / PRÉNOM :
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: TenZ ou Thomas"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full bg-black/60 border border-white/20 p-3 text-xs text-white placeholder-white/30 focus:border-[#FF7582] focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-white/70 block uppercase font-bold tracking-wider mb-1.5">
                        IDENTIFIANT DISCORD <span className="text-[#FF7582]">*</span> :
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: poulpy_94 ou monpseudo#1234"
                        value={studentDiscord}
                        onChange={(e) => setStudentDiscord(e.target.value)}
                        className="w-full bg-black/60 border border-white/20 p-3 text-xs text-white placeholder-white/30 focus:border-[#FF7582] focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-white/70 block uppercase font-bold tracking-wider mb-1.5">
                        ADRESSE EMAIL <span className="text-[#FF7582]">*</span> :
                      </label>
                      <input
                        type="email"
                        placeholder="Ex: contact@email.com"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        className="w-full bg-black/60 border border-white/20 p-3 text-xs text-white placeholder-white/30 focus:border-[#FF7582] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-white/70 block uppercase font-bold tracking-wider mb-1.5">
                          JEU :
                        </label>
                        <select
                          value={game}
                          onChange={(e) => setGame(e.target.value)}
                          className="w-full bg-black/60 border border-white/20 p-3 text-xs text-white focus:border-[#FF7582] focus:outline-none transition-colors"
                        >
                          <option value="Valorant">Valorant</option>
                          <option value="CS2">Counter-Strike 2</option>
                          <option value="Overwatch 2">Overwatch 2</option>
                          <option value="Apex Legends">Apex Legends</option>
                          <option value="Fortnite">Fortnite</option>
                          <option value="Autre">Autre FPS</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-white/70 block uppercase font-bold tracking-wider mb-1.5">
                          RANG ACTUEL :
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Diamant 2, Ascendant 1"
                          value={currentRank}
                          onChange={(e) => setCurrentRank(e.target.value)}
                          className="w-full bg-black/60 border border-white/20 p-3 text-xs text-white placeholder-white/30 focus:border-[#FF7582] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-white/70 block uppercase font-bold tracking-wider mb-1.5">
                        OBJECTIFS / BLOCAGES PRINCIPAUX :
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Ex: Difficulté à monter au-delà de Diamant, perte de duels en 1v1, problème de crosshair placement..."
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        className="w-full bg-black/60 border border-white/20 p-3 text-xs text-white placeholder-white/30 focus:border-[#FF7582] focus:outline-none transition-colors resize-none"
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

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="btn-cyber-ghost flex items-center gap-2 py-2.5 px-5 text-xs uppercase cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>RETOUR CRÉNEAU</span>
                  </button>
                  <button
                    disabled={isSubmitting}
                    onClick={handleNextStep}
                    className="btn-cyber-primary flex items-center gap-2 py-2.5 px-7 text-xs font-bold uppercase disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>VERROUILLAGE EN COURS...</span>
                      </>
                    ) : (
                      <>
                        <span>CONFIRMER LA SESSION</span>
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
                transition={{ duration: 0.2 }}
                className="py-6 text-center space-y-6 max-w-xl mx-auto"
              >
                <div className="w-16 h-16 bg-[#A4DE87]/15 border border-[#A4DE87] text-[#A4DE87] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(164,222,135,0.3)]">
                  <Check className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-[#A4DE87] font-bold tracking-widest uppercase block">
                    CRÉNEAU VERROUILLÉ AVEC SUCCÈS
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-display text-white tracking-wider">
                    ORDRE DE MISSION : {confirmedMissionId}
                  </h3>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Ta session <strong className="text-white">{activePlan.name}</strong> du <strong className="text-white">{currentDay.fullDateLabel} à {selectedTime}</strong> a été enregistrée. Poulpy te contactera sur Discord (<strong className="text-[#8FAFD4]">{studentDiscord}</strong>) avant le début de la séance.
                  </p>
                </div>

                <div className="p-4 bg-black/60 border border-white/10 text-left text-xs space-y-2">
                  <div className="flex justify-between border-b border-white/5 pb-1.5">
                    <span className="text-white/50">Formule :</span>
                    <span className="text-white font-bold">{activePlan.name} ({activePlan.price})</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1.5">
                    <span className="text-white/50">Date & Heure :</span>
                    <span className="text-white font-bold">{currentDay.fullDateLabel} à {selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Contact Discord :</span>
                    <span className="text-[#FF7582] font-bold">{studentDiscord}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-center">
                  <button
                    onClick={handleReset}
                    className="btn-cyber-ghost py-2.5 px-6 text-xs uppercase cursor-pointer"
                  >
                    RÉSERVER UNE AUTRE SESSION
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
