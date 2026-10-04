"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Calendar, Clock, User, Shield, ChevronRight, ChevronLeft, ArrowRight, Send, Loader2, AlertCircle, Crosshair, MessageCircle, ExternalLink } from "lucide-react";
import DecryptedText from "./DecryptedText";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import AuthModal from "./AuthModal";

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

// Optimized 3D tilt hook that preserves sharp text rendering
function useCardTilt() {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotX = ((y - rect.height / 2) / (rect.height / 2)) * -3.5;
    const rotY = ((x - rect.width / 2) / (rect.width / 2)) * 3.5;

    setRotate({ x: rotX, y: rotY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return { rotate, isHovered, handleMouseMove, handleMouseEnter, handleMouseLeave };
}

export default function Booking() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");
  const [proIsPack, setProIsPack] = useState<boolean>(false);
  const [perfIsPack, setPerfIsPack] = useState<boolean>(false);

  // Tilt controls for each card
  const proTilt = useCardTilt();
  const sessionTilt = useCardTilt();
  const perfTilt = useCardTilt();

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

  const currentDay = daysList[selectedDayIndex] || daysList[0];

  const planDetails: Record<string, { name: string; price: string; duration: string }> = {
    pro: proIsPack
      ? { name: "COACHING PRO (PACK 5 SÉANCES + 2 OFFERTES)", price: "50 €", duration: "7 SÉANCES (1H-1H30 / SÉANCE)" }
      : { name: "COACHING PRO (RÉFÉRENCE)", price: "10 €", duration: "1H - 1H30" },
    session: { name: "SESSION DIAGNOSTIC (VOD STREAM)", price: "0 € (GRATUIT)", duration: "45 MIN - 1H" },
    performance: perfIsPack
      ? { name: "COACHING COMPÉTITION (PACK 3 SÉANCES + 1 OFFERTE)", price: "60 €", duration: "4 SÉANCES (1H30-2H / SÉANCE)" }
      : { name: "COACHING COMPÉTITION & TEAM", price: "20 €", duration: "1H30 - 2H" },
  };

  const activePlan = planDetails[selectedPlan] || planDetails["pro"];

  const handleSelectSlot = (slot: { id?: string; time: string; available: boolean }) => {
    if (!slot.available) return;
    setSelectedSlotId(slot.id || null);
    setSelectedTime(slot.time);
  };

  const handleNextStep = async () => {
    if (step === 1) {
      setSubmitError(null);
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!selectedTime) {
        setSubmitError("Veuillez sélectionner un créneau horaire disponible.");
        return;
      }
      setSubmitError(null);
      setStep(3);
      return;
    }

    if (step === 3) {
      if (!user) {
        setSubmitError("Vous devez être connecté avec votre compte pour réserver une session de coaching.");
        setAuthModalOpen(true);
        return;
      }
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

        let { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();
          if (refreshErr || !refreshData.session) {
            throw new Error("Session expirée. Veuillez vous reconnecter.");
          }
          session = refreshData.session;
        }

        const token = session?.access_token;
        if (!token) {
          throw new Error("Vous devez être connecté pour réserver une session.");
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const res = await fetch("/api/bookings/create", {
          method: "POST",
          headers,
          body: JSON.stringify({
            slotId: selectedSlotId,
            bookingDate: currentDay.dateIso,
            bookingTime: selectedTime,
            planId: selectedPlan,
            planName: activePlan.name,
            planPrice: activePlan.price,
            planDuration: activePlan.duration,
            studentName: (studentName.trim() || user.username || studentDiscord.trim()),
            studentEmail: (studentEmail.trim() || user.email || ""),
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
    <section id="booking" className="py-14 sm:py-16 px-6 sm:px-12 lg:px-16 bg-transparent font-mono relative z-20">
      {/* Anchor target for #tarifs */}
      <div id="tarifs" className="absolute -top-20 pointer-events-none" />
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-5xl font-display text-[#F5F4F0] tracking-wider">
              RÉSERVE TON <span className="text-[#CA1C30]">COACHING</span>
            </h2>
          </div>

          {/* Stepper Progress Steps — Sleek & Épuré */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono">
            {[
              { id: 1, label: "01. FORMULE" },
              { id: 2, label: "02. CRÉNEAU" },
              { id: 3, label: "03. INFOS" },
              { id: 4, label: "04. STATUT" },
            ].map((s, idx) => {
              const isActive = step === s.id;
              const isDone = step > s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (isDone) setStep(s.id);
                  }}
                  className={`transition-colors font-bold tracking-wider uppercase flex items-center gap-1.5 ${
                    isDone ? "cursor-pointer" : "cursor-default"
                  } ${
                    isActive
                      ? "text-[#CA1C30]"
                      : isDone
                      ? "text-[#F5F4F0]/80 hover:text-[#CA1C30]"
                      : "text-white/30"
                  }`}
                >
                  <span>{s.label}</span>
                  {idx < 3 && <span className="text-white/20 ml-2 font-normal">/</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Step Container (Seamless & Clean without outer background box) */}
        <div className="relative w-full">
          <AnimatePresence mode="wait" initial={false}>
            {/* ======================================================== */}
            {/* STEP 1: 3D INTERACTIVE PRICING CARDS */}
            {/* ======================================================== */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* Main Grid: Left Pro (7 cols) + Right Stacked Satellite cards (5 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* ========================================= */}
                  {/* LEFT CARD: COACHING PRO (7 cols) + 3D TILT */}
                  {/* ========================================= */}
                  <div
                    className="lg:col-span-7 cursor-pointer"
                    style={{ perspective: "1000px" }}
                    onClick={() => setSelectedPlan("pro")}
                    onMouseMove={proTilt.handleMouseMove}
                    onMouseEnter={proTilt.handleMouseEnter}
                    onMouseLeave={proTilt.handleMouseLeave}
                  >
                    <motion.div
                      animate={{
                        rotateX: proTilt.rotate.x,
                        rotateY: proTilt.rotate.y,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 24,
                        mass: 0.5,
                      }}
                      style={{
                        WebkitBackfaceVisibility: "hidden",
                        backfaceVisibility: "hidden",
                        transform: "translate3d(0, 0, 0)",
                        transformStyle: "flat",
                        contain: "paint",
                      }}
                      className={`relative h-full p-6 sm:p-8 flex flex-col justify-between select-none rounded-2xl transition-shadow duration-150 ${
                        selectedPlan === "pro"
                          ? "bg-[#1A1822] shadow-[inset_0_0_0_1px_#CA1C30,0_0_35px_rgba(202,28,48,0.25)]"
                          : proTilt.isHovered
                          ? "bg-[#1A1822] shadow-[inset_0_0_0_1px_rgba(202,28,48,0.6),0_0_25px_rgba(202,28,48,0.15)]"
                          : "bg-[#121117] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)]"
                      }`}
                    >
                      <div className="space-y-5 relative z-10">
                        {/* Top Badges */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                          <span className="bg-[#CA1C30] text-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                            FORMULE DE RÉFÉRENCE
                          </span>
                          <span className="text-xs text-[#F5F4F0]/70 tracking-widest font-mono">
                            {proIsPack ? "PACK 5 SÉANCES + 2 OFFERTES" : "DURÉE : 1H - 1H30"}
                          </span>
                        </div>

                        {/* Title & Interactive Price Selector */}
                        <div>
                          <span className="text-[10px] text-[#F5F4F0]/50 uppercase tracking-widest block font-mono">
                            COACHING INDIVIDUEL COMPLET
                          </span>
                          <h3 className="text-3xl sm:text-4xl font-display text-[#F5F4F0] tracking-wider mt-1">
                            COACHING PRO
                          </h3>

                          {/* Single vs Pack interactive selector */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3.5">
                            {/* Option 1: Single Session 10€ */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPlan("pro");
                                setProIsPack(false);
                              }}
                              className={`p-3 border rounded-xl text-left transition-all relative cursor-pointer ${
                                !proIsPack && selectedPlan === "pro"
                                  ? "border-[#CA1C30] bg-[#CA1C30]/15 text-white shadow-[0_0_15px_rgba(202,28,48,0.25)]"
                                  : "border-white/10 bg-[#0B0A0D]/80 text-[#F5F4F0]/60 hover:border-white/30 hover:text-white"
                              }`}
                            >
                              <div className="flex items-baseline justify-between">
                                <span className={`text-2xl sm:text-3xl font-display ${!proIsPack && selectedPlan === "pro" ? "text-[#CA1C30]" : "text-[#F5F4F0]"}`}>
                                  10 €
                                </span>
                                <span className={`text-[9px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                                  !proIsPack && selectedPlan === "pro"
                                    ? "border-[#CA1C30]/40 bg-[#CA1C30]/20 text-[#CA1C30]"
                                    : "border-white/10 text-[#F5F4F0]/40"
                                }`}>
                                  À L&apos;UNITÉ
                                </span>
                              </div>
                              <div className="text-[11px] font-mono text-[#F5F4F0]/70 mt-1">
                                1 séance complète (1h - 1h30)
                              </div>
                            </button>

                            {/* Option 2: Pack 50€ */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPlan("pro");
                                setProIsPack(true);
                              }}
                              className={`p-3 border rounded-xl text-left transition-all relative overflow-hidden cursor-pointer ${
                                proIsPack && selectedPlan === "pro"
                                  ? "border-[#CA1C30] bg-[#CA1C30]/15 text-white shadow-[0_0_15px_rgba(202,28,48,0.25)]"
                                  : "border-white/10 bg-[#0B0A0D]/80 text-[#F5F4F0]/60 hover:border-white/30 hover:text-white"
                              }`}
                            >
                              <div className="absolute top-1.5 right-1.5 px-2 py-0.5 text-[8px] font-bold rounded-full bg-[#CA1C30] text-black uppercase tracking-wider">
                                +2 GRATUITES
                              </div>
                              <div className="flex items-baseline justify-between">
                                <span className={`text-2xl sm:text-3xl font-display ${proIsPack && selectedPlan === "pro" ? "text-[#CA1C30]" : "text-[#F5F4F0]"}`}>
                                  50 €
                                </span>
                                <span className={`text-[9px] font-mono uppercase font-bold tracking-wider mr-16 px-2 py-0.5 rounded-full border ${
                                  proIsPack && selectedPlan === "pro"
                                    ? "border-[#CA1C30]/40 bg-[#CA1C30]/20 text-[#CA1C30]"
                                    : "border-white/10 text-[#F5F4F0]/40"
                                }`}>
                                  PACK BUNDLE
                                </span>
                              </div>
                              <div className="text-[11px] font-mono text-[#F5F4F0]/70 mt-1">
                                5 séances + 2 offertes (7 au total)
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-[#F5F4F0]/75 leading-relaxed max-w-xl">
                          Diagnostic mécanique, analyse de VOD en direct et plan d&apos;action personnalisé sur Notion avec suivi Discord.
                        </p>

                        {/* Features Matrix (2 columns of dark boxes) */}
                        <div className="space-y-2 pt-1">
                          <span className="text-[10px] text-[#F5F4F0]/50 uppercase tracking-widest block font-mono">
                            CONTENU DU PROTOCOLE :
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {[
                              "Diagnostic mécanique & viseur",
                              "VOD review & correction en vocal",
                              "Fiche technique de suivi Notion",
                              "Suivi Discord & progression continue",
                            ].map((feat, i) => (
                              <div key={i} className="p-2.5 bg-[#0B0A0D] border border-white/5 rounded-xl flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#CA1C30] shrink-0" />
                                <span className="text-[#F5F4F0]/90 text-[11px] leading-tight">{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Footer note */}
                      <div className="pt-4 mt-5 border-t border-white/10 text-[10px] text-[#F5F4F0]/40 font-mono flex items-center justify-between relative z-10">
                        <span>Recommandé pour franchir un palier</span>
                        <span className={`font-bold uppercase tracking-wider text-[11px] ${
                          selectedPlan === "pro" ? "text-[#CA1C30]" : "text-[#F5F4F0]/30"
                        }`}>
                          {selectedPlan === "pro" ? "CHOISI" : "CLIQUE POUR CHOISIR"}
                        </span>
                      </div>
                    </motion.div>
                  </div>

                  {/* ========================================= */}
                  {/* RIGHT COLUMN: 2 SATELLITE CARDS + 3D TILT */}
                  {/* ========================================= */}
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    {/* Top Right: SESSION DIAGNOSTIC */}
                    <div
                      className="flex-1 cursor-pointer"
                      style={{ perspective: "1000px" }}
                      onClick={() => setSelectedPlan("session")}
                      onMouseMove={sessionTilt.handleMouseMove}
                      onMouseEnter={sessionTilt.handleMouseEnter}
                      onMouseLeave={sessionTilt.handleMouseLeave}
                    >
                      <motion.div
                        animate={{
                          rotateX: sessionTilt.rotate.x,
                          rotateY: sessionTilt.rotate.y,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 24,
                          mass: 0.5,
                        }}
                        style={{
                          WebkitBackfaceVisibility: "hidden",
                          backfaceVisibility: "hidden",
                          transform: "translate3d(0, 0, 0)",
                          transformStyle: "flat",
                          contain: "paint",
                        }}
                        className={`relative h-full p-5 flex flex-col justify-between select-none rounded-2xl transition-shadow duration-150 ${
                          selectedPlan === "session"
                            ? "bg-[#1A1822] shadow-[inset_0_0_0_1px_#F5F4F0,0_0_25px_rgba(245,244,240,0.2)]"
                            : sessionTilt.isHovered
                            ? "bg-[#1A1822] shadow-[inset_0_0_0_1px_rgba(245,244,240,0.5),0_0_20px_rgba(245,244,240,0.1)]"
                            : "bg-[#121117] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)]"
                        }`}
                      >
                        <div className="space-y-3 relative z-10">
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="bg-[#F5F4F0]/15 text-[#F5F4F0] text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest border border-[#F5F4F0]/30">
                              OFFRE UNIQUE (1X)
                            </span>
                            <span className="text-[11px] text-[#F5F4F0]/50 tracking-wider font-mono">
                              45 MIN - 1H
                            </span>
                          </div>

                          <div>
                            <h4 className="text-xl font-display text-[#F5F4F0] tracking-wider">
                              SESSION DIAGNOSTIC
                            </h4>
                            <div className="flex items-baseline gap-2 mt-0.5">
                              <span className="text-2xl font-display text-[#F5F4F0]">
                                0 €
                              </span>
                              <span className="text-[10px] font-mono text-[#00B4A0] font-bold tracking-wider">
                                GRATUIT // EN STREAM
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] text-[#F5F4F0]/65 leading-snug">
                            Review VOD en direct sur Twitch pour identifier tes erreurs majeures.
                          </p>

                          <div className="space-y-1 pt-1 text-[11px] text-[#F5F4F0]/70">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-[#F5F4F0] shrink-0" />
                              <span>VOD review d&apos;une partie complète</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-[#F5F4F0] shrink-0" />
                              <span>Identification des erreurs clés</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-[#F5F4F0] shrink-0" />
                              <span>En direct sur Twitch (1x par élève)</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 text-right relative z-10">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            selectedPlan === "session" ? "text-[#F5F4F0]" : "text-white/30"
                          }`}>
                            {selectedPlan === "session" ? "SÉLECTIONNÉ" : "SÉLECTIONNER"}
                          </span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Bottom Right: PERFORMANCE / COMPÉTITION */}
                    <div
                      className="flex-1 cursor-pointer"
                      style={{ perspective: "1000px" }}
                      onClick={() => setSelectedPlan("performance")}
                      onMouseMove={perfTilt.handleMouseMove}
                      onMouseEnter={perfTilt.handleMouseEnter}
                      onMouseLeave={perfTilt.handleMouseLeave}
                    >
                      <motion.div
                        animate={{
                          rotateX: perfTilt.rotate.x,
                          rotateY: perfTilt.rotate.y,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 24,
                          mass: 0.5,
                        }}
                        style={{
                          WebkitBackfaceVisibility: "hidden",
                          backfaceVisibility: "hidden",
                          transform: "translate3d(0, 0, 0)",
                          transformStyle: "flat",
                          contain: "paint",
                        }}
                        className={`relative h-full p-5 flex flex-col justify-between select-none rounded-2xl transition-shadow duration-150 ${
                          selectedPlan === "performance"
                            ? "bg-[#1A1822] shadow-[inset_0_0_0_1px_#00B4A0,0_0_25px_rgba(0,180,160,0.25)]"
                            : perfTilt.isHovered
                            ? "bg-[#1A1822] shadow-[inset_0_0_0_1px_rgba(0,180,160,0.6),0_0_20px_rgba(0,180,160,0.15)]"
                            : "bg-[#121117] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)]"
                        }`}
                      >
                        <div className="space-y-3 relative z-10">
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="bg-[#00B4A0]/20 text-[#00B4A0] text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                              AXE COMPÉTITION & TEAM
                            </span>
                            <span className="text-[11px] text-[#00B4A0] tracking-wider font-mono">
                              {perfIsPack ? "PACK 3 + 1 OFFERTE" : "1H30 - 2H"}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-xl font-display text-[#F5F4F0] tracking-wider">
                              COACHING COMPÉTITION
                            </h4>

                            {/* Single vs Pack interactive selector */}
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {/* Option 1: Single Session 20€ */}
                              <button
                                type="button"
                                onClick={(e) => {
                                   e.stopPropagation();
                                  setSelectedPlan("performance");
                                  setPerfIsPack(false);
                                }}
                                className={`p-2 border rounded-xl text-left transition-all cursor-pointer ${
                                  !perfIsPack && selectedPlan === "performance"
                                    ? "border-[#00B4A0] bg-[#00B4A0]/15 text-white shadow-[0_0_12px_rgba(0,180,160,0.25)]"
                                    : "border-white/10 bg-[#0B0A0D]/80 text-[#F5F4F0]/60 hover:border-white/30 hover:text-white"
                                }`}
                              >
                                <div className="flex items-baseline justify-between">
                                  <span className={`text-xl font-display ${!perfIsPack && selectedPlan === "performance" ? "text-[#00B4A0]" : "text-[#F5F4F0]"}`}>
                                    20 €
                                  </span>
                                  <span className="text-[8px] font-mono uppercase tracking-wider text-white/40">À L&apos;UNITÉ</span>
                                </div>
                                <div className="text-[10px] font-mono text-[#F5F4F0]/70">1 séance (1h30-2h)</div>
                              </button>

                              {/* Option 2: Pack 60€ */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPlan("performance");
                                  setPerfIsPack(true);
                                }}
                                className={`p-2 border rounded-xl text-left transition-all relative overflow-hidden cursor-pointer ${
                                  perfIsPack && selectedPlan === "performance"
                                    ? "border-[#00B4A0] bg-[#00B4A0]/15 text-white shadow-[0_0_12px_rgba(0,180,160,0.25)]"
                                    : "border-white/10 bg-[#0B0A0D]/80 text-[#F5F4F0]/60 hover:border-white/30 hover:text-white"
                                }`}
                              >
                                <div className="absolute top-0.5 right-1 px-1.5 py-0.5 text-[7px] font-bold rounded-full bg-[#00B4A0] text-black uppercase tracking-wider">
                                  +1 OFFERTE
                                </div>
                                <div className="flex items-baseline justify-between">
                                  <span className={`text-xl font-display ${perfIsPack && selectedPlan === "performance" ? "text-[#00B4A0]" : "text-[#F5F4F0]"}`}>
                                    60 €
                                  </span>
                                  <span className="text-[8px] font-mono uppercase tracking-wider text-white/40 mr-10">PACK 3+1</span>
                                </div>
                                <div className="text-[10px] font-mono text-[#F5F4F0]/70">4 séances au total</div>
                              </button>
                            </div>
                          </div>

                          <p className="text-[11px] text-[#F5F4F0]/65 leading-snug">
                            Préparation compétitive, pool d&apos;agents et analyse tactique de praccs.
                          </p>

                          <div className="space-y-1 pt-1 text-[11px] text-[#F5F4F0]/70">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00B4A0] shrink-0" />
                              <span>Vision de jeu compétitive & pool d&apos;agents</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00B4A0] shrink-0" />
                              <span>Analyse de pracc & points tactiques</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00B4A0] shrink-0" />
                              <span>Fiche technique avancée de suivi</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 text-right relative z-10">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            selectedPlan === "performance" ? "text-[#00B4A0]" : "text-[#F5F4F0]/30"
                          }`}>
                            {selectedPlan === "performance" ? "SÉLECTIONNÉ" : "SÉLECTIONNER"}
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs text-[#F5F4F0]/60">
                    SÉLECTION : <strong className="text-[#F5F4F0] font-mono">{activePlan.name} ({activePlan.price} - {activePlan.duration})</strong>
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
                  <div className="text-xs text-[#F5F4F0]/70 uppercase tracking-wider font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#CA1C30]" />
                    ÉTAPE 02 : VERROUILLAGE DU CALENDRIER // CRÉNEAUX EN DIRECT
                  </div>
                  <span className="text-xs text-[#CA1C30] font-bold tracking-wider">FORMULE: {activePlan.name}</span>
                </div>

                <div className="space-y-5">
                  {/* Days Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-[#F5F4F0]/70 block uppercase font-bold tracking-wider">
                        1. SÉLECTIONNER UN JOUR (14 PROCHAINS JOURS) :
                      </label>
                      {loadingSlots && (
                        <div className="flex items-center gap-1.5 text-xs text-[#00B4A0]">
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
                            className={`flex-shrink-0 w-24 sm:w-28 p-3 border text-center cursor-pointer transition-all flex flex-col justify-between rounded-xl ${
                              isDaySelected
                                ? "border-[#CA1C30] bg-[#CA1C30]/15 text-[#F5F4F0] shadow-[0_0_15px_rgba(202, 28, 48,0.3)] ring-1 ring-[#CA1C30]"
                                : "border-white/15 bg-[#1A1822] hover:border-white/40 text-[#F5F4F0]"
                            }`}
                          >
                            <div>
                              <div className="text-[10px] text-[#F5F4F0]/50 uppercase tracking-wider font-bold">{d.dayName}</div>
                              <div className="text-lg font-display tracking-wider">{d.dayNumber} {d.monthName}</div>
                            </div>

                            <div className="mt-2">
                              {hasAvailable ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#00B4A0]/15 border border-[#00B4A0]/40 text-[#00B4A0] uppercase block rounded-md">
                                  {d.availableCount} dispo
                                </span>
                              ) : (
                                <span className="text-[9px] font-medium px-1.5 py-0.5 bg-white/5 border border-white/10 text-white/30 uppercase block rounded-md">
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
                      <label className="text-xs text-[#F5F4F0]/70 block uppercase font-bold tracking-wider">
                        2. SÉLECTIONNER L&apos;HORAIRE POUR LE {currentDay.fullDateLabel.toUpperCase()} :
                      </label>
                      <span className="text-xs text-[#F5F4F0]/40 font-mono">FUSEAU : PARIS (UTC+1)</span>
                    </div>

                    {currentDay.availableCount === 0 ? (
                      <div className="p-6 bg-[#1A1822] border border-white/10 text-center space-y-2 rounded-2xl">
                        <Clock className="w-7 h-7 text-white/30 mx-auto mb-1" />
                        <h4 className="text-xs font-bold text-[#F5F4F0] uppercase tracking-wider">
                          AUCUN CRÉNEAU DISPONIBLE POUR CETTE DATE
                        </h4>
                        <p className="text-xs text-[#F5F4F0]/50 max-w-md mx-auto">
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
                              className={`p-3 border text-center transition-all flex flex-col items-center justify-center gap-1 rounded-xl ${
                                !isAvailable
                                  ? "border-white/5 bg-white/[0.02] text-white/30 cursor-not-allowed line-through opacity-40"
                                  : isTimeSelected
                                  ? "border-[#CA1C30] bg-[#CA1C30] text-black font-bold shadow-[0_0_20px_rgba(202, 28, 48,0.4)] cursor-pointer"
                                  : "border-white/15 bg-[#1A1822] hover:border-[#CA1C30]/60 text-[#F5F4F0] cursor-pointer"
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-sm font-display tracking-wider">{s.time}</span>
                              </div>

                              <span className={`text-[9px] uppercase font-bold tracking-widest ${
                                isTimeSelected ? "text-black" : isAvailable ? "text-[#00B4A0]" : "text-white/20"
                              }`}>
                                {isTimeSelected ? "SÉLECTIONNÉ" : isAvailable ? "DISPONIBLE" : "INDISPONIBLE"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Legend */}
                    <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-[10px] text-[#F5F4F0]/50 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#00B4A0] rounded-full" />
                        <span>DISPONIBLE</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#CA1C30] rounded-full" />
                        <span>SÉLECTIONNÉ</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-white/20 rounded-full" />
                        <span className="line-through">INDISPONIBLE / COMPLET</span>
                      </div>
                    </div>
                  </div>

                  {/* Selected Summary Badge */}
                  {selectedTime && (
                    <div className="p-3 bg-[#1A1822] border border-[#CA1C30]/40 flex items-center justify-between text-xs rounded-xl">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-[#CA1C30]" />
                        <span>
                          CRÉNEAU SÉLECTIONNÉ : <strong className="text-[#F5F4F0]">{currentDay.fullDateLabel} à {selectedTime}</strong>
                        </span>
                      </div>
                      <span className="text-[#00B4A0] font-bold text-[11px]">[ CRÉNEAU VALIDÉ ]</span>
                    </div>
                  )}

                  {submitError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 rounded-xl">
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
                  <div className="text-xs text-[#F5F4F0]/70 uppercase tracking-wider font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#CA1C30]" />
                    ÉTAPE 03 : DOSSIER DU JOUEUR // BRIEF TACTIQUE
                  </div>
                  <span className="text-xs text-[#CA1C30] font-bold tracking-wider">
                    {activePlan.name} • {selectedTime}
                  </span>
                </div>

                {!user && (
                  <div className="p-4 bg-[#CA1C30]/10 border border-[#CA1C30]/40 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-[#CA1C30] shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-[#F5F4F0] uppercase tracking-wider">
                          COMPTE ÉLÈVE REQUIS POUR RÉSERVER
                        </div>
                        <p className="text-[11px] text-[#F5F4F0]/70 mt-0.5">
                          Vous devez être connecté pour bloquer votre créneau et accéder à votre suivi personnalisé.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAuthModalOpen(true)}
                      className="btn-cyber-primary py-2 px-5 text-xs font-bold shrink-0 text-center cursor-pointer"
                    >
                      <span>SE CONNECTER / S&apos;INSCRIRE</span>
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] text-[#F5F4F0]/70 block uppercase font-bold tracking-wider mb-1.5">
                        PSEUDO / PRÉNOM :
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: TenZ ou Thomas"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full bg-[#1A1822] border border-white/20 p-3 text-xs text-[#F5F4F0] placeholder-white/30 focus:border-[#CA1C30] focus:outline-none transition-colors rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#F5F4F0]/70 block uppercase font-bold tracking-wider mb-1.5">
                        IDENTIFIANT DISCORD <span className="text-[#CA1C30]">*</span> :
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: poulpy_94 ou monpseudo#1234"
                        value={studentDiscord}
                        onChange={(e) => setStudentDiscord(e.target.value)}
                        className="w-full bg-[#1A1822] border border-white/20 p-3 text-xs text-[#F5F4F0] placeholder-white/30 focus:border-[#CA1C30] focus:outline-none transition-colors rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#F5F4F0]/70 block uppercase font-bold tracking-wider mb-1.5">
                        ADRESSE EMAIL <span className="text-[#CA1C30]">*</span> :
                      </label>
                      <input
                        type="email"
                        placeholder="Ex: contact@email.com"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        className="w-full bg-[#1A1822] border border-white/20 p-3 text-xs text-[#F5F4F0] placeholder-white/30 focus:border-[#CA1C30] focus:outline-none transition-colors rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-[#F5F4F0]/70 block uppercase font-bold tracking-wider mb-1.5">
                          JEU :
                        </label>
                        <select
                          value={game}
                          onChange={(e) => setGame(e.target.value)}
                          className="w-full bg-[#1A1822] border border-white/20 p-3 text-xs text-[#F5F4F0] focus:border-[#CA1C30] focus:outline-none transition-colors rounded-xl"
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
                        <label className="text-[11px] text-[#F5F4F0]/70 block uppercase font-bold tracking-wider mb-1.5">
                          RANG ACTUEL :
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Diamant 2, Ascendant 1"
                          value={currentRank}
                          onChange={(e) => setCurrentRank(e.target.value)}
                          className="w-full bg-[#1A1822] border border-white/20 p-3 text-xs text-[#F5F4F0] placeholder-white/30 focus:border-[#CA1C30] focus:outline-none transition-colors rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-[#F5F4F0]/70 block uppercase font-bold tracking-wider mb-1.5">
                        OBJECTIFS / BLOCAGES PRINCIPAUX :
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Ex: Difficulté à monter au-delà de Diamant, perte de duels en 1v1, problème de crosshair placement..."
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        className="w-full bg-[#1A1822] border border-white/20 p-3 text-xs text-[#F5F4F0] placeholder-white/30 focus:border-[#CA1C30] focus:outline-none transition-colors resize-none rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 rounded-xl">
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
                  {user ? (
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
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAuthModalOpen(true)}
                      className="btn-cyber-primary flex items-center gap-2 py-2.5 px-7 text-xs font-bold uppercase cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      <span>SE CONNECTER POUR CONFIRMER</span>
                    </button>
                  )}
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
                <div className="w-16 h-16 bg-[#00B4A0]/15 border border-[#00B4A0] text-[#00B4A0] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(0, 180, 160,0.3)] rounded-2xl">
                  <Check className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-[#00B4A0] font-bold tracking-widest uppercase block">
                    CRÉNEAU VERROUILLÉ AVEC SUCCÈS
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-display text-[#F5F4F0] tracking-wider">
                    ORDRE DE MISSION : {confirmedMissionId}
                  </h3>
                  <p className="text-xs text-[#F5F4F0]/60 leading-relaxed">
                    Ta session <strong className="text-[#F5F4F0]">{activePlan.name}</strong> du <strong className="text-[#F5F4F0]">{currentDay.fullDateLabel} à {selectedTime}</strong> a été enregistrée. Poulpy te contactera sur Discord (<strong className="text-[#00B4A0]">{studentDiscord}</strong>) avant le début de la séance.
                  </p>
                </div>

                <div className="p-4 bg-[#1A1822] border border-white/10 text-left text-xs space-y-2 rounded-2xl">
                  <div className="flex justify-between border-b border-white/5 pb-1.5">
                    <span className="text-[#F5F4F0]/50">Formule :</span>
                    <span className="text-[#F5F4F0] font-bold">{activePlan.name} ({activePlan.price})</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1.5">
                    <span className="text-[#F5F4F0]/50">Date & Heure :</span>
                    <span className="text-[#F5F4F0] font-bold">{currentDay.fullDateLabel} à {selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#F5F4F0]/50">Contact Discord :</span>
                    <span className="text-[#CA1C30] font-bold">{studentDiscord}</span>
                  </div>
                </div>

                {/* Discord CTA with IMPORTANT badge */}
                <div className="relative p-5 bg-[#1A1822] border border-[#CA1C30] shadow-[0_0_25px_rgba(202, 28, 48,0.2)] text-left rounded-2xl">
                  {/* Badge matching the pack badges */}
                  <div className="absolute top-2 right-2 px-2 py-0.5 text-[9px] font-bold bg-[#CA1C30] text-black uppercase tracking-wider shadow-[0_0_10px_rgba(202, 28, 48,0.5)] rounded-full">
                    IMPORTANT !
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                    <div className="space-y-1 pr-0 sm:pr-4">
                      <div className="text-xs font-bold text-[#F5F4F0] uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#CA1C30] animate-pulse rounded-full" />
                        <span>REJOINDRE LE SERVEUR DISCORD</span>
                      </div>
                      <p className="text-[11px] text-[#F5F4F0]/70 leading-relaxed">
                        Le salon vocal et le partage d&apos;écran de coaching se déroulent exclusivement sur le serveur Discord de Poulpy.
                      </p>
                    </div>

                    <a
                      href="https://discord.gg/rJMg3ZZRkp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-cyber-primary flex items-center justify-center gap-2 py-3 px-6 text-xs font-bold uppercase tracking-wider shrink-0 cursor-pointer shadow-[0_0_20px_rgba(202, 28, 48,0.3)]"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>REJOINDRE LE DISCORD</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
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

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </section>
  );
}
