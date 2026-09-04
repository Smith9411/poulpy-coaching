'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Edit2,
  Gamepad2,
  Loader2,
  Mail,
  MessageSquare,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  User,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { CoachingBooking, CoachingSlot } from '@/components/booking/types';

// Horaires de coaching par défaut
const DEFAULT_HOURS = [
  '10:00',
  '11:30',
  '14:00',
  '15:30',
  '17:00',
  '18:30',
  '20:00',
  '21:30',
];

const DAYS_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const DAYS_FULL = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTHS_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function AdminBookingsPage() {
  const { user, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'slots' | 'bookings'>('slots');

  // État des créneaux
  const [weekOffset, setWeekOffset] = useState(0); // 0 = cette semaine, 1 = semaine prochaine, etc.
  const [slotsData, setSlotsData] = useState<CoachingSlot[]>([]);
  const [existingBookings, setExistingBookings] = useState<CoachingBooking[]>([]);
  const [localSlotStates, setLocalSlotStates] = useState<Record<string, boolean>>({}); // key = `${date}_${time}` -> is_active
  const [isSavingSlots, setIsSavingSlots] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [customHourInput, setCustomHourInput] = useState('');
  const [availableHours, setAvailableHours] = useState<string[]>(DEFAULT_HOURS);

  // État des réservations
  const [bookingsList, setBookingsList] = useState<CoachingBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Modal de report de date
  const [rescheduleBooking, setRescheduleBooking] = useState<CoachingBooking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // Modal d'annulation de séance stylisé
  const [cancelModalBooking, setCancelModalBooking] = useState<CoachingBooking | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');

  // Toast message
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  // Calcul des 7 jours de la semaine courante (du Lundi au Dimanche)
  const getWeekDates = useCallback((offsetWeeks: number) => {
    const today = new Date();
    // Jour de la semaine (0 = Dimanche, 1 = Lundi...)
    const currentDay = today.getDay();
    // Décalage pour obtenir le Lundi de la semaine (si Dimanche=0, reculer de 6 jours)
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday + offsetWeeks * 7);

    const weekDays: Array<{ fullDate: string; dateStr: string; dayName: string; dayNumber: number; isPast: boolean }> = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);

      const dateIso = d.toISOString().split('T')[0];
      const todayIso = today.toISOString().split('T')[0];

      weekDays.push({
        fullDate: dateIso,
        dateStr: `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`,
        dayName: DAYS_FULL[d.getDay()],
        dayNumber: d.getDate(),
        isPast: dateIso < todayIso,
      });
    }

    return weekDays;
  }, []);

  const currentWeekDates = getWeekDates(weekOffset);
  const startDateStr = currentWeekDates[0]?.fullDate;
  const endDateStr = currentWeekDates[6]?.fullDate;

  // Charger les créneaux pour la semaine sélectionnée
  const fetchSlots = useCallback(async () => {
    if (!startDateStr || !endDateStr) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch(
        `/api/bookings/slots?admin=true&startDate=${startDateStr}&endDate=${endDateStr}`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: 'no-store',
        }
      );

      if (!res.ok) return;
      const data = await res.json();
      const slots: CoachingSlot[] = data.slots || [];
      const bookings: CoachingBooking[] = data.bookings || [];

      setSlotsData(slots);
      setExistingBookings(bookings);

      // Initialiser le dictionnaire local
      const newMap: Record<string, boolean> = {};
      slots.forEach((s) => {
        newMap[`${s.date}_${s.start_time}`] = s.is_active;
      });
      setLocalSlotStates(newMap);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Erreur chargement slots admin:', err);
    }
  }, [startDateStr, endDateStr]);

  // Charger la liste des réservations
  const fetchBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch('/api/admin/bookings', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: 'no-store',
      });

      if (!res.ok) return;
      const data = await res.json();
      setBookingsList(data.bookings || []);

      // Marquer automatiquement les réservations comme lues par l'admin
      fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'mark_all_read' }),
      }).catch(() => {});
    } catch (err) {
      console.error('Erreur chargement bookings list:', err);
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchSlots();
      fetchBookings();
    }
  }, [user?.isAdmin, fetchSlots, fetchBookings]);

  // Basculer l'état d'un créneau individuel
  const toggleSlot = (date: string, time: string) => {
    const key = `${date}_${time}`;
    setLocalSlotStates((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setHasUnsavedChanges(true);
  };

  // Actions de masse sur un jour donné
  const setDaySlots = (date: string, active: boolean) => {
    setLocalSlotStates((prev) => {
      const next = { ...prev };
      availableHours.forEach((time) => {
        next[`${date}_${time}`] = active;
      });
      return next;
    });
    setHasUnsavedChanges(true);
  };

  // Actions de masse sur toute la semaine affichée
  const setAllWeekSlots = (active: boolean) => {
    setLocalSlotStates((prev) => {
      const next = { ...prev };
      currentWeekDates.forEach((day) => {
        if (!day.isPast) {
          availableHours.forEach((time) => {
            next[`${day.fullDate}_${time}`] = active;
          });
        }
      });
      return next;
    });
    setHasUnsavedChanges(true);
  };

  // Ouvrir uniquement après-midis (14h-18h)
  const setAfternoonOnly = () => {
    setLocalSlotStates((prev) => {
      const next = { ...prev };
      currentWeekDates.forEach((day) => {
        if (!day.isPast) {
          availableHours.forEach((time) => {
            const hour = parseInt(time.split(':')[0], 10);
            next[`${day.fullDate}_${time}`] = hour >= 14 && hour < 18;
          });
        }
      });
      return next;
    });
    setHasUnsavedChanges(true);
  };

  // Ouvrir uniquement soirées (18h-22h)
  const setEveningOnly = () => {
    setLocalSlotStates((prev) => {
      const next = { ...prev };
      currentWeekDates.forEach((day) => {
        if (!day.isPast) {
          availableHours.forEach((time) => {
            const hour = parseInt(time.split(':')[0], 10);
            next[`${day.fullDate}_${time}`] = hour >= 18 && hour <= 22;
          });
        }
      });
      return next;
    });
    setHasUnsavedChanges(true);
  };

  // Ajouter un horaire personnalisé
  const handleAddCustomHour = () => {
    const trimmed = customHourInput.trim();
    if (!trimmed || !/^\d{1,2}:\d{2}$/.test(trimmed)) {
      showToast('error', 'Format horaire invalide (ex: 16:00)');
      return;
    }
    const parts = trimmed.split(':');
    const formatted = `${parts[0].padStart(2, '0')}:${parts[1]}`;
    if (!availableHours.includes(formatted)) {
      const updated = [...availableHours, formatted].sort();
      setAvailableHours(updated);
      setCustomHourInput('');
      showToast('success', `Horaire ${formatted} ajouté aux options.`);
    } else {
      showToast('error', 'Cet horaire existe déjà.');
    }
  };

  // Enregistrer les créneaux dans Supabase
  const handleSaveSlots = async () => {
    setIsSavingSlots(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const slotsToSave: Array<{ date: string; start_time: string; is_active: boolean }> = [];

      currentWeekDates.forEach((day) => {
        availableHours.forEach((time) => {
          const key = `${day.fullDate}_${time}`;
          const isActive = Boolean(localSlotStates[key]);
          slotsToSave.push({
            date: day.fullDate,
            start_time: time,
            is_active: isActive,
          });
        });
      });

      const res = await fetch('/api/bookings/slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ slots: slotsToSave }),
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.error || 'Erreur sauvegarde');
      }

      showToast('success', 'Disponibilités enregistrées avec succès !');
      setHasUnsavedChanges(false);
      fetchSlots();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur de sauvegarde';
      showToast('error', msg);
    } finally {
      setIsSavingSlots(false);
    }
  };

  // Action Admin : Confirmer l'annulation d'une réservation (depuis le modal stylisé)
  const handleConfirmCancelBooking = async () => {
    if (!cancelModalBooking) return;
    const booking = cancelModalBooking;
    setActionLoadingId(booking.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          action: 'cancel',
          adminNotes: cancelReasonInput.trim() || 'Annulée par le coach depuis le panneau admin.',
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Erreur annulation');

      showToast('success', `Réservation de ${booking.student_name} annulée et créneau libéré.`);
      setCancelModalBooking(null);
      fetchBookings();
      fetchSlots();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur';
      showToast('error', msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action Admin : Terminer une session
  const handleCompleteBooking = async (bookingId: string) => {
    setActionLoadingId(bookingId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          bookingId,
          action: 'complete',
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Erreur validation');

      showToast('success', 'Séance marquée comme terminée ! Créneau libéré.');
      fetchBookings();
      fetchSlots();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur';
      showToast('error', msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action Admin : Valider le report de séance
  const handleConfirmReschedule = async () => {
    if (!rescheduleBooking || !rescheduleDate || !rescheduleTime) {
      showToast('error', 'Sélectionne une nouvelle date et une heure.');
      return;
    }
    setActionLoadingId(rescheduleBooking.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          bookingId: rescheduleBooking.id,
          action: 'reschedule',
          newDate: rescheduleDate,
          newTime: rescheduleTime,
          adminNotes: `Reportée au ${rescheduleDate} à ${rescheduleTime}.`,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Erreur lors du report');

      showToast('success', `Séance reportée au ${rescheduleDate} à ${rescheduleTime} avec succès.`);
      setRescheduleBooking(null);
      fetchBookings();
      fetchSlots();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur';
      showToast('error', msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtrage des réservations
  const filteredBookings = bookingsList.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.student_name.toLowerCase().includes(q);
      const matchEmail = b.student_email.toLowerCase().includes(q);
      const matchDiscord = b.student_discord.toLowerCase().includes(q);
      const matchGame = b.game.toLowerCase().includes(q);
      return matchName || matchEmail || matchDiscord || matchGame;
    }
    return true;
  });

  if (authLoading) {
    return (
      <main className="min-h-screen page-bg py-24 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
      </main>
    );
  }

  if (!user || !user.isAdmin) {
    return (
      <main className="min-h-screen page-bg py-24 flex items-center justify-center">
        <div className="card p-8 rounded-2xl text-center max-w-md">
          <Shield size={48} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Accès refusé</h2>
          <p className="text-sm text-gray-400 mb-4">Cette section est réservée à l'administrateur.</p>
          <Link href="/" className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-bold">
            Retour à l'accueil
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen page-bg py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl glass hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              title="Retour au Panneau Admin"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                  ADMIN COACHING
                </span>
                <span className="text-xs text-gray-400">• Sans paiement</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Planning & Réservations
              </h1>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center p-1 rounded-2xl glass border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('slots')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'slots'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CalendarIcon size={16} />
              <span>1. Disponibilités (Cases à cocher)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all relative ${
                activeTab === 'bookings'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock size={16} />
              <span>2. Réservations ({bookingsList.length})</span>
              {bookingsList.some((b) => !b.read_by_admin) && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toast && (
          <div
            className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg transition-all animate-in fade-in ${
              toast.type === 'success'
                ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                : 'bg-red-500/20 border border-red-500/40 text-red-300'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
            <span>{toast.text}</span>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {/* ONGLET 1 : CONFIGURATION DES CRÉNEAUX ET DISPONIBILITÉS                   */}
        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'slots' && (
          <div className="space-y-6">
            {/* Quick Actions & Navigation Bar */}
            <div className="glass-dark p-4 sm:p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Week selector */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWeekOffset((prev) => Math.max(0, prev - 1))}
                    disabled={weekOffset === 0}
                    className="p-2 rounded-xl glass hover:bg-white/10 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Semaine précédente"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="text-center px-3">
                    <span className="text-xs text-gray-400 block font-medium">Semaine affichée</span>
                    <span className="text-sm sm:text-base font-extrabold text-white">
                      {currentWeekDates[0]?.dateStr} au {currentWeekDates[6]?.dateStr}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setWeekOffset((prev) => prev + 1)}
                    disabled={weekOffset >= 3}
                    className="p-2 rounded-xl glass hover:bg-white/10 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Semaine suivante"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {weekOffset > 0 && (
                    <button
                      type="button"
                      onClick={() => setWeekOffset(0)}
                      className="px-2.5 py-1 text-xs rounded-lg glass text-purple-400 hover:text-white"
                    >
                      Aujourd'hui
                    </button>
                  )}
                </div>

                {/* Save button & status */}
                <div className="flex items-center gap-3">
                  {hasUnsavedChanges && (
                    <span className="text-xs text-amber-400 font-semibold flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Modifications non enregistrées
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveSlots}
                    disabled={isSavingSlots}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm shadow-md hover:shadow-cyan-500/30 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isSavingSlots ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    <span>Enregistrer les disponibilités</span>
                  </button>
                </div>
              </div>

              {/* Bulk Quick Fill Actions */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="text-gray-400 font-semibold">Actions rapides pour la semaine :</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={setAfternoonOnly}
                    className="px-2.5 py-1.5 rounded-lg glass hover:bg-white/10 text-amber-300 font-medium transition-colors"
                  >
                    ☀️ Ouvrir 14h-18h
                  </button>
                  <button
                    type="button"
                    onClick={setEveningOnly}
                    className="px-2.5 py-1.5 rounded-lg glass hover:bg-white/10 text-indigo-300 font-medium transition-colors"
                  >
                    🌙 Ouvrir 18h-22h
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllWeekSlots(true)}
                    className="px-2.5 py-1.5 rounded-lg glass hover:bg-white/10 text-green-300 font-medium transition-colors"
                  >
                    ✅ Tout ouvrir
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllWeekSlots(false)}
                    className="px-2.5 py-1.5 rounded-lg glass hover:bg-white/10 text-red-300 font-medium transition-colors"
                  >
                    ❌ Tout fermer
                  </button>
                </div>
              </div>

              {/* Add custom time slot */}
              <div className="pt-3 border-t border-white/5 flex items-center gap-2 text-xs flex-wrap">
                <span className="text-gray-400">Ajouter un créneau horaire personnalisé :</span>
                <input
                  type="text"
                  placeholder="Ex: 16:00"
                  value={customHourInput}
                  onChange={(e) => setCustomHourInput(e.target.value)}
                  className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white w-24 text-center focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomHour}
                  className="px-3 py-1 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 font-medium hover:bg-purple-600/50"
                >
                  + Ajouter
                </button>
              </div>
            </div>

            {/* Calendar Week Grid with Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {currentWeekDates.map((day) => {
                const dayBookings = existingBookings.filter((b) => b.booking_date === day.fullDate);
                const activeCount = availableHours.filter((t) => localSlotStates[`${day.fullDate}_${t}`]).length;

                return (
                  <div
                    key={day.fullDate}
                    className={`card rounded-2xl p-3.5 flex flex-col justify-between border transition-all ${
                      day.isPast
                        ? 'opacity-40 bg-white/[0.02] border-white/5'
                        : 'border-white/10 hover:border-purple-500/30'
                    }`}
                  >
                    {/* Day Column Header */}
                    <div className="border-b border-white/10 pb-2.5 mb-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                          {day.dayName.slice(0, 3)}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">{day.dateStr}</span>
                      </div>

                      {/* Day count & Quick toggles */}
                      <div className="flex items-center justify-between mt-2 pt-1 text-[11px]">
                        <span className={`font-semibold ${activeCount > 0 ? 'text-cyan-400' : 'text-gray-500'}`}>
                          {activeCount} ouvert{activeCount > 1 ? 's' : ''}
                        </span>
                        {!day.isPast && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setDaySlots(day.fullDate, true)}
                              className="text-[10px] text-green-400 hover:underline"
                            >
                              Tous
                            </button>
                            <span className="text-gray-600">•</span>
                            <button
                              type="button"
                              onClick={() => setDaySlots(day.fullDate, false)}
                              className="text-[10px] text-red-400 hover:underline"
                            >
                              Aucun
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Slots List for this day */}
                    <div className="space-y-1.5 flex-1">
                      {availableHours.map((time) => {
                        const key = `${day.fullDate}_${time}`;
                        const isChecked = Boolean(localSlotStates[key]);
                        const bookingOnSlot = dayBookings.find((b) => b.booking_time === time);

                        if (bookingOnSlot) {
                          // Créneau réservé par un élève
                          return (
                            <div
                              key={key}
                              className="p-2 rounded-xl bg-orange-500/15 border border-orange-500/40 text-orange-200 text-xs flex flex-col gap-0.5"
                              title={`Réservé par ${bookingOnSlot.student_name}`}
                            >
                              <div className="flex items-center justify-between font-bold">
                                <span>{time}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-500/30 text-orange-300">
                                  Réservé
                                </span>
                              </div>
                              <span className="text-[11px] truncate text-white font-medium">
                                👤 {bookingOnSlot.student_name}
                              </span>
                              <span className="text-[10px] text-gray-300 truncate">
                                {bookingOnSlot.plan_name}
                              </span>
                            </div>
                          );
                        }

                        return (
                          <label
                            key={key}
                            className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold cursor-pointer select-none transition-all border ${
                              isChecked
                                ? 'bg-gradient-to-r from-purple-600/30 to-cyan-500/20 border-cyan-400/60 text-white shadow-sm'
                                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSlot(day.fullDate, time)}
                                className="w-3.5 h-3.5 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 bg-gray-800 cursor-pointer"
                              />
                              <span>{time}</span>
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                isChecked ? 'text-cyan-300 bg-cyan-500/20' : 'text-gray-500'
                              }`}
                            >
                              {isChecked ? 'Dispo' : 'Fermé'}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {/* ONGLET 2 : GESTION DES RÉSERVATIONS D'ÉLÈVES                              */}
        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Filters Bar */}
            <div className="glass-dark p-4 sm:p-5 rounded-2xl border border-white/10 flex items-center justify-between flex-wrap gap-4">
              {/* Search input */}
              <div className="relative flex-1 min-w-[240px]">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email, Discord ou jeu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Status Filter buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {([
                  { id: 'all', label: 'Toutes', count: bookingsList.length },
                  { id: 'confirmed', label: 'Confirmées', count: bookingsList.filter((b) => b.status === 'confirmed').length },
                  { id: 'rescheduled', label: 'Reportées', count: bookingsList.filter((b) => b.status === 'rescheduled').length },
                  { id: 'completed', label: 'Terminées', count: bookingsList.filter((b) => b.status === 'completed').length },
                  { id: 'cancelled', label: 'Annulées', count: bookingsList.filter((b) => b.status === 'cancelled').length },
                ] as const).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      statusFilter === tab.id
                        ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] leading-none ${
                        statusFilter === tab.id
                          ? 'bg-white/25 text-white font-black'
                          : 'bg-white/5 text-gray-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => { fetchBookings(); fetchSlots(); }}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="Actualiser"
                >
                  <RefreshCw size={16} className={bookingsLoading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Bookings List */}
            {bookingsLoading ? (
              <div className="py-20 text-center">
                <Loader2 size={32} className="animate-spin text-purple-500 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Chargement des réservations...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="card rounded-2xl p-12 text-center text-gray-400">
                <Clock size={40} className="mx-auto mb-3 opacity-40" />
                <h3 className="text-lg font-bold text-white mb-1">Aucune réservation trouvée</h3>
                <p className="text-xs text-gray-400">
                  {statusFilter !== 'all'
                    ? 'Aucune séance ne correspond au filtre sélectionné.'
                    : 'Les réservations faites par les élèves s\'afficheront ici en direct.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBookings.map((b) => {
                  const isActionLoading = actionLoadingId === b.id;

                  return (
                    <div
                      key={b.id}
                      className={`card rounded-2xl p-5 border flex flex-col justify-between space-y-4 transition-colors duration-200 ${
                        b.status === 'confirmed'
                          ? 'border-cyan-500/30 hover:border-cyan-400'
                          : b.status === 'rescheduled'
                          ? 'border-purple-500/40 hover:border-purple-400'
                          : b.status === 'completed'
                          ? 'border-green-500/20 opacity-75'
                          : 'border-red-500/20 opacity-60'
                      }`}
                    >
                      {/* Header with Plan and Status */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                            {b.plan_name}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              b.status === 'confirmed'
                                ? 'bg-green-500/20 text-green-300'
                                : b.status === 'rescheduled'
                                ? 'bg-purple-500/20 text-purple-300'
                                : b.status === 'completed'
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {b.status === 'confirmed' && 'Confirmée'}
                            {b.status === 'rescheduled' && 'Reportée'}
                            {b.status === 'completed' && 'Terminée'}
                            {b.status === 'cancelled' && 'Annulée'}
                          </span>
                        </div>

                        {/* Date & Time Highlight */}
                        <div className="flex items-center gap-2 text-white font-extrabold text-base mb-1">
                          <CalendarIcon size={16} className="text-cyan-400" />
                          <span>
                            {new Date(b.booking_date).toLocaleDateString('fr-FR', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}{' '}
                            à {b.booking_time}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-2">
                          <span>{b.plan_duration}</span>
                          <span>•</span>
                          <span className="text-purple-300 font-bold">{b.plan_price}</span>
                        </div>
                      </div>

                      {/* Student Info */}
                      <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/5 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Élève :</span>
                          <span className="font-bold text-white flex items-center gap-1">
                            <User size={12} className="text-purple-400" />
                            {b.student_name}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Discord :</span>
                          <div className="flex items-center gap-1 text-cyan-300 font-mono font-semibold">
                            <MessageSquare size={12} />
                            <span>{b.student_discord}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(b.student_discord);
                                showToast('success', `Discord de ${b.student_name} copié !`);
                              }}
                              className="p-1 hover:text-white"
                              title="Copier"
                            >
                              <Copy size={11} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Jeu :</span>
                          <span className="font-semibold text-white flex items-center gap-1">
                            <Gamepad2 size={12} className="text-amber-400" />
                            {b.game}
                          </span>
                        </div>

                        {b.notes && (
                          <div className="pt-2 border-t border-white/5">
                            <span className="text-[10px] text-gray-400 block mb-0.5">Objectifs :</span>
                            <p className="text-gray-300 italic text-[11px] line-clamp-2">"{b.notes}"</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                        {b.status !== 'cancelled' && b.status !== 'completed' && (
                          <>
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => {
                                setRescheduleBooking(b);
                                setRescheduleDate(b.booking_date);
                                setRescheduleTime(b.booking_time);
                              }}
                              className="flex-1 py-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-xs font-semibold text-purple-300 hover:bg-purple-500/30 hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Edit2 size={13} />
                              <span>Reporter</span>
                            </button>

                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handleCompleteBooking(b.id)}
                              className="p-1.5 rounded-lg bg-green-500/15 border border-green-500/30 text-xs font-semibold text-green-400 hover:bg-green-500/30 transition-colors cursor-pointer"
                              title="Marquer comme terminée (libère le créneau du planning)"
                            >
                              <CheckCircle2 size={15} />
                            </button>

                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => {
                                setCancelModalBooking(b);
                                setCancelReasonInput('Annulée par le coach depuis le panneau admin.');
                              }}
                              className="p-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-xs font-semibold text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer"
                              title="Annuler la séance (libère le créneau et retire du profil élève)"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}

                        {(b.status === 'cancelled' || b.status === 'completed') && (
                          <span className="text-xs text-gray-400 font-medium italic w-full text-center py-1">
                            Séance {b.status === 'completed' ? '✓ Effectuée & Terminée' : '✕ Annulée'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {/* MODAL DE REPORT DE DATE DE SÉANCE                                         */}
        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {rescheduleBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="glass-dark border border-purple-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-purple-400" />
                  <h3 className="font-bold text-white text-lg">Reporter la session</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setRescheduleBooking(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="text-xs text-gray-300">
                Tu modifies la séance de <strong className="text-white">{rescheduleBooking.student_name}</strong>{' '}
                ({rescheduleBooking.plan_name}). L'ancien créneau sera automatiquement libéré.
              </div>

              {/* Input Nouvelle Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Nouvelle date (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Input Nouvelle Heure */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Nouvelle heure
                </label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  {availableHours.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setRescheduleBooking(null)}
                  className="px-4 py-2 rounded-xl glass text-xs text-gray-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReschedule}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs shadow-md"
                >
                  Confirmer le report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {/* MODAL D'ANNULATION DE SÉANCE                                             */}
        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {cancelModalBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <div className="glass-dark border border-red-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl shadow-red-500/10 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                    <Trash2 size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Annuler la réservation</h3>
                    <p className="text-[11px] text-gray-400">Cette action libérera le créneau</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCancelModalBooking(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Élève :</span>
                  <span className="font-semibold text-white">{cancelModalBooking.student_name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Formule :</span>
                  <span className="font-medium text-purple-300">{cancelModalBooking.plan_name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Date et heure :</span>
                  <span className="font-medium text-white">
                    {cancelModalBooking.booking_date} à {cancelModalBooking.booking_time}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Motif ou message pour l'élève (optionnel)
                </label>
                <input
                  type="text"
                  value={cancelReasonInput}
                  onChange={(e) => setCancelReasonInput(e.target.value)}
                  placeholder="Ex: Imprévu, reprogrammation nécessaire..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500 placeholder-gray-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-2">
                <span className="shrink-0 text-sm">⚠️</span>
                <span>L'élève recevra une alerte sur son profil et le créneau sera de nouveau disponible à la réservation.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={actionLoadingId === cancelModalBooking.id}
                  onClick={() => setCancelModalBooking(null)}
                  className="px-4 py-2.5 rounded-xl glass text-xs font-semibold text-gray-400 hover:text-white transition-colors"
                >
                  Garder la séance
                </button>
                <button
                  type="button"
                  disabled={actionLoadingId === cancelModalBooking.id}
                  onClick={handleConfirmCancelBooking}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-500/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {actionLoadingId === cancelModalBooking.id ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Annulation...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>Confirmer l'annulation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
