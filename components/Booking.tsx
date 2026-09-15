"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Calendar, Clock, User, Shield, ChevronRight, ChevronLeft, ArrowRight, Send, Loader2, AlertCircle, Crosshair, MessageCircle, ExternalLink } from "lucide-react";
import DecryptedText from "./DecryptedText";
import CornerBrackets from "./CornerBrackets";
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

// Custom hook for 3D card tilt & spotlight
function useCardTilt() {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    const rotX = ((y - rect.height / 2) / (rect.height / 2)) * -4.5;
    const rotY = ((x - rect.width / 2) / (rect.width / 2)) * 4.5;

    setRotate({ x: rotX, y: rotY });
    setMousePos({ x: percentX, y: percentY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return { rotate, mousePos, isHovered, handleMouseMove, handleMouseEnter, handleMouseLeave };
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
    <section id="booking" className="py-20 px-6 sm:px-12 lg:px-16 bg-[#07090D] border-t border-[rgba(255,255,255,0.08)] font-mono relative z-20">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <span className="data-badge data-badge-laser">
              <DecryptedText text="MODULE DE RÉSERVATION" />
            </span>
            <h2 className="text-3xl sm:text-5xl font-display text-white tracking-wider">
              RÉSERVE TON <span className="text-[#FF7582]">COACHING</span>
            </h2>
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
                  className={`px-3 py-1 text-xs font-bold border transition-all ${
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
            {/* ======================================================== */}
            {/* STEP 1: EXACT PNG LAYOUT + DYNAMIC 3D TILT MOTION */}
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
                {/* Step Subheader matching PNG */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="text-xs text-white/80 uppercase tracking-wider font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#FF7582]" />
                    ÉTAPE 01 : SÉLECTION DU PROTOCOLE D&apos;ENTRAÎNEMENT
                  </div>
                  <span className="text-xs text-[#FF7582] font-bold tracking-wider">3 FORMULES DISPONIBLES</span>
                </div>

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
                        scale: proTilt.isHovered ? 1.004 : 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 280,
                        damping: 22,
                      }}
                      style={{ transformStyle: "preserve-3d" }}
                      className={`relative h-full p-7 flex flex-col justify-between transition-colors duration-200 border overflow-hidden select-none ${
                        selectedPlan === "pro"
                          ? "bg-[#0c0f15] border-[#FF7582] shadow-[0_0_35px_rgba(255,117,130,0.25)] ring-1 ring-[#FF7582]"
                          : proTilt.isHovered
                          ? "bg-[#0c0f15] border-[#FF7582]/60 shadow-[0_0_25px_rgba(255,117,130,0.15)]"
                          : "bg-[#090C12] border-white/15 hover:border-white/30"
                      }`}
                    >
                      {/* Corner Brackets */}
                      <CornerBrackets color="coral" />

                      {/* Dynamic Spotlight Follower */}
                      {proTilt.isHovered && (
                        <div
                          className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                          style={{
                            background: `radial-gradient(circle 280px at ${proTilt.mousePos.x}% ${proTilt.mousePos.y}%, rgba(255, 117, 130, 0.16), transparent 80%)`,
                          }}
                        />
                      )}

                      <div className="space-y-5 relative z-10" style={{ transform: "translateZ(8px)" }}>
                        {/* Top Badges */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                          <span className="bg-[#FF7582] text-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                            FORMULE DE RÉFÉRENCE
                          </span>
                          <span className="text-xs text-white/70 tracking-widest font-mono">
                            {proIsPack ? "PACK 5 SÉANCES + 2 OFFERTES" : "DURÉE : 1H - 1H30"}
                          </span>
                        </div>

                        {/* Title & Interactive Price Selector */}
                        <div>
                          <span className="text-[10px] text-white/40 uppercase tracking-widest block font-mono">
                            COACHING INDIVIDUEL COMPLET
                          </span>
                          <h3 className="text-3xl sm:text-4xl font-display text-white tracking-wider mt-1">
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
                              className={`p-3 border text-left transition-all relative ${
                                !proIsPack && selectedPlan === "pro"
                                  ? "border-[#FF7582] bg-[#FF7582]/15 text-white shadow-[0_0_15px_rgba(255,117,130,0.25)] ring-1 ring-[#FF7582]"
                                  : "border-white/10 bg-black/40 text-white/50 hover:border-white/30 hover:text-white/80"
                              }`}
                            >
                              <div className="flex items-baseline justify-between">
                                <span className={`text-2xl sm:text-3xl font-display ${!proIsPack && selectedPlan === "pro" ? "text-[#FF7582]" : "text-white"}`}>
                                  10 €
                                </span>
                                <span className={`text-[9px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.5 border ${
                                  !proIsPack && selectedPlan === "pro"
                                    ? "border-[#FF7582]/40 bg-[#FF7582]/20 text-[#FF7582]"
                                    : "border-white/10 text-white/40"
                                }`}>
                                  À L'UNITÉ
                                </span>
                              </div>
                              <div className="text-[11px] font-mono text-white/70 mt-1">
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
                              className={`p-3 border text-left transition-all relative overflow-hidden ${
                                proIsPack && selectedPlan === "pro"
                                  ? "border-[#FF7582] bg-[#FF7582]/15 text-white shadow-[0_0_15px_rgba(255,117,130,0.25)] ring-1 ring-[#FF7582]"
                                  : "border-white/10 bg-black/40 text-white/50 hover:border-white/30 hover:text-white/80"
                              }`}
                            >
                              <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[8px] font-bold bg-[#FF7582] text-black uppercase tracking-wider">
                                +2 GRATUITES
                              </div>
                              <div className="flex items-baseline justify-between">
                                <span className={`text-2xl sm:text-3xl font-display ${proIsPack && selectedPlan === "pro" ? "text-[#FF7582]" : "text-white"}`}>
                                  50 €
                                </span>
                                <span className={`text-[9px] font-mono uppercase font-bold tracking-wider mr-16 px-1.5 py-0.5 border ${
                                  proIsPack && selectedPlan === "pro"
                                    ? "border-[#FF7582]/40 bg-[#FF7582]/20 text-[#FF7582]"
                                    : "border-white/10 text-white/40"
                                }`}>
                                  PACK BUNDLE
                                </span>
                              </div>
                              <div className="text-[11px] font-mono text-white/70 mt-1">
                                5 séances + 2 offertes (7 au total)
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-white/70 leading-relaxed max-w-xl">
                          Analyse tracker, diagnostic mécanique puis VOD review avec protocoles à mettre en place pour progresser (fiche technique de suivi Notion).
                        </p>

                        {/* Features Matrix (2 columns of dark boxes) */}
                        <div className="space-y-2 pt-1">
                          <span className="text-[10px] text-white/40 uppercase tracking-widest block font-mono">
                            CONTENU DU PROTOCOLE :
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {[
                              "Analyse tracker & statistiques",
                              "Diagnostic mécanique & viseur",
                              "VOD review & correction en vocal",
                              "Protocoles & fiches techniques Notion",
                              "Suivi Discord & progression continue",
                            ].map((feat, i) => (
                              <div key={i} className="p-2.5 bg-black/70 border border-white/5 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-[#FF7582] shrink-0" />
                                <span className="text-white/80 text-[11px] leading-tight">{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Footer note */}
                      <div className="pt-4 mt-5 border-t border-white/10 text-[10px] text-white/40 font-mono flex items-center justify-between relative z-10">
                        <span>Idéal pour débloquer un palier de ranked tenace</span>
                        <span className={`font-bold uppercase tracking-wider text-[11px] ${
                          selectedPlan === "pro" ? "text-[#FF7582]" : "text-white/30"
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
                          scale: sessionTilt.isHovered ? 1.004 : 1,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 280,
                          damping: 22,
                        }}
                        style={{ transformStyle: "preserve-3d" }}
                        className={`relative h-full p-5 flex flex-col justify-between transition-colors duration-200 border overflow-hidden select-none ${
                          selectedPlan === "session"
                            ? "bg-[#0c0f15] border-[#A4DE87] shadow-[0_0_25px_rgba(164,222,135,0.2)] ring-1 ring-[#A4DE87]"
                            : sessionTilt.isHovered
                            ? "bg-[#0c0f15] border-[#A4DE87]/50 shadow-[0_0_20px_rgba(164,222,135,0.1)]"
                            : "bg-[#090C12] border-white/15 hover:border-white/30"
                        }`}
                      >
                        {sessionTilt.isHovered && (
                          <div
                            className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                            style={{
                              background: `radial-gradient(circle 200px at ${sessionTilt.mousePos.x}% ${sessionTilt.mousePos.y}%, rgba(164, 222, 135, 0.1), transparent 80%)`,
                            }}
                          />
                        )}

                        <div className="space-y-3 relative z-10" style={{ transform: "translateZ(6px)" }}>
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="bg-[#A4DE87]/15 text-[#A4DE87] text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest border border-[#A4DE87]/30">
                              OFFRE UNIQUE (1X)
                            </span>
                            <span className="text-[11px] text-white/50 tracking-wider font-mono">
                              45 MIN - 1H
                            </span>
                          </div>

                          <div>
                            <h4 className="text-xl font-display text-white tracking-wider">
                              SESSION DIAGNOSTIC
                            </h4>
                            <div className="flex items-baseline gap-2 mt-0.5">
                              <span className="text-2xl font-display text-[#A4DE87]">
                                0 €
                              </span>
                              <span className="text-[10px] font-mono text-[#A4DE87] font-bold tracking-wider">
                                GRATUIT // EN STREAM
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] text-white/60 leading-snug">
                            VOD review avec analyse des erreurs, review réalisée en Stream. Pas de méthode d'entraînement ni diagnostic long terme. Analyse d'une game sur un personnage.
                          </p>

                          <div className="space-y-1 pt-1 text-[11px] text-white/70">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-[#A4DE87] shrink-0" />
                              <span>VOD review d'une game (1 personnage)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-[#A4DE87] shrink-0" />
                              <span>Analyse chirurgicale des erreurs</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-[#A4DE87] shrink-0" />
                              <span>Review réalisée en direct en Stream</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-[#A4DE87] shrink-0" />
                              <span>Disponible 1 seule fois par élève</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 text-right relative z-10">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            selectedPlan === "session" ? "text-[#A4DE87]" : "text-white/30"
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
                          scale: perfTilt.isHovered ? 1.004 : 1,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 280,
                          damping: 22,
                        }}
                        style={{ transformStyle: "preserve-3d" }}
                        className={`relative h-full p-5 flex flex-col justify-between transition-colors duration-200 border overflow-hidden select-none ${
                          selectedPlan === "performance"
                            ? "bg-[#0c0f15] border-[#8FAFD4] shadow-[0_0_25px_rgba(143,175,212,0.25)] ring-1 ring-[#8FAFD4]"
                            : perfTilt.isHovered
                            ? "bg-[#0c0f15] border-[#8FAFD4]/60 shadow-[0_0_20px_rgba(143,175,212,0.15)]"
                            : "bg-[#090C12] border-white/15 hover:border-white/30"
                        }`}
                      >
                        {perfTilt.isHovered && (
                          <div
                            className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                            style={{
                              background: `radial-gradient(circle 200px at ${perfTilt.mousePos.x}% ${perfTilt.mousePos.y}%, rgba(143, 175, 212, 0.15), transparent 80%)`,
                            }}
                          />
                        )}

                        <div className="space-y-3 relative z-10" style={{ transform: "translateZ(6px)" }}>
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="bg-[#8FAFD4]/20 text-[#8FAFD4] text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest">
                              AXE COMPÉTITION & TEAM
                            </span>
                            <span className="text-[11px] text-[#8FAFD4] tracking-wider font-mono">
                              {perfIsPack ? "PACK 3 + 1 OFFERTE" : "1H30 - 2H"}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-xl font-display text-white tracking-wider">
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
                                className={`p-2 border text-left transition-all ${
                                  !perfIsPack && selectedPlan === "performance"
                                    ? "border-[#8FAFD4] bg-[#8FAFD4]/15 text-white shadow-[0_0_12px_rgba(143,175,212,0.25)] ring-1 ring-[#8FAFD4]"
                                    : "border-white/10 bg-black/40 text-white/50 hover:border-white/30 hover:text-white/80"
                                }`}
                              >
                                <div className="flex items-baseline justify-between">
                                  <span className={`text-xl font-display ${!perfIsPack && selectedPlan === "performance" ? "text-[#8FAFD4]" : "text-white"}`}>
                                    20 €
                                  </span>
                                  <span className="text-[8px] font-mono uppercase tracking-wider text-white/40">À L'UNITÉ</span>
                                </div>
                                <div className="text-[10px] font-mono text-white/70">1 séance (1h30-2h)</div>
                              </button>

                              {/* Option 2: Pack 60€ */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPlan("performance");
                                  setPerfIsPack(true);
                                }}
                                className={`p-2 border text-left transition-all relative overflow-hidden ${
                                  perfIsPack && selectedPlan === "performance"
                                    ? "border-[#8FAFD4] bg-[#8FAFD4]/15 text-white shadow-[0_0_12px_rgba(143,175,212,0.25)] ring-1 ring-[#8FAFD4]"
                                    : "border-white/10 bg-black/40 text-white/50 hover:border-white/30 hover:text-white/80"
                                }`}
                              >
                                <div className="absolute top-0.5 right-1 px-1 py-0.2 text-[7px] font-bold bg-[#8FAFD4] text-black uppercase tracking-wider">
                                  +1 OFFERTE
                                </div>
                                <div className="flex items-baseline justify-between">
                                  <span className={`text-xl font-display ${perfIsPack && selectedPlan === "performance" ? "text-[#8FAFD4]" : "text-white"}`}>
                                    60 €
                                  </span>
                                  <span className="text-[8px] font-mono uppercase tracking-wider text-white/40 mr-10">PACK 3+1</span>
                                </div>
                                <div className="text-[10px] font-mono text-white/70">4 séances au total</div>
                              </button>
                            </div>
                          </div>

                          <p className="text-[11px] text-white/60 leading-snug">
                            Coaching axé évolution compétitive, développement du pool d'agents, points tactiques hors-ranked et VOD de pracc (fiche technique avancée).
                          </p>

                          <div className="space-y-1 pt-1 text-[11px] text-white/70">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-[#8FAFD4] shrink-0" />
                              <span>Évolution compétitive & pool d'agents</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-[#8FAFD4] shrink-0" />
                              <span>VOD de pracc & points tactiques team</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-[#8FAFD4] shrink-0" />
                              <span>Fiche technique avancée de suivi</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 text-right relative z-10">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            selectedPlan === "performance" ? "text-[#8FAFD4]" : "text-white/30"
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

                {!user && (
                  <div className="p-4 bg-[#FF7582]/10 border border-[#FF7582]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-[#FF7582] shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white uppercase tracking-wider">
                          COMPTE ÉLÈVE REQUIS POUR RÉSERVER
                        </div>
                        <p className="text-[11px] text-white/70 mt-0.5">
                          Vous devez être connecté pour bloquer votre créneau et accéder à votre suivi personnalisé.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAuthModalOpen(true)}
                      className="btn-cyber-primary py-2 px-5 text-xs font-bold shrink-0 text-center cursor-pointer"
                    >
                      <span>SE CONNECTER / S'INSCRIRE</span>
                    </button>
                  </div>
                )}

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

                {/* Discord CTA with IMPORTANT badge */}
                <div className="relative p-5 bg-[#0c0f15] border border-[#FF7582] shadow-[0_0_25px_rgba(255,117,130,0.2)] text-left">
                  {/* Badge matching the pack badges */}
                  <div className="absolute top-2 right-2 px-2 py-0.5 text-[9px] font-bold bg-[#FF7582] text-black uppercase tracking-wider shadow-[0_0_10px_rgba(255,117,130,0.5)]">
                    IMPORTANT !
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                    <div className="space-y-1 pr-0 sm:pr-4">
                      <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#FF7582] animate-pulse" />
                        <span>REJOINDRE LE SERVEUR DISCORD</span>
                      </div>
                      <p className="text-[11px] text-white/70 leading-relaxed">
                        Le salon vocal et le partage d'écran de coaching se déroulent exclusivement sur le serveur Discord de Poulpy.
                      </p>
                    </div>

                    <a
                      href="https://discord.gg/rJMg3ZZRkp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-cyber-primary flex items-center justify-center gap-2 py-3 px-6 text-xs font-bold uppercase tracking-wider shrink-0 cursor-pointer shadow-[0_0_20px_rgba(255,117,130,0.3)]"
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
