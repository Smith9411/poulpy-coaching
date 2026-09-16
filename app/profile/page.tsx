'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { User, Mail, Settings, LogOut, Shield, Clock, Award, Camera, Trash2, Edit2, Check, X, Loader2, MessageSquare, Quote, Film, Calendar, Gamepad2, AlertCircle, FileText, ArrowLeft, ArrowRight, Layers, Sparkles, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState, useRef, useEffect, useMemo } from 'react';
import FavoriteGames from '@/components/FavoriteGames';
import SocialLinks from '@/components/SocialLinks';
import { CoachingBooking } from '@/components/booking/types';
import CyberNavbar from '@/components/CyberNavbar';

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
  }>;
  availableCount: number;
}

interface PackSessionItem {
  number: number;
  title: string;
  isBooked: boolean;
  bookingId?: string;
  bookingDate?: string;
  bookingTime?: string;
  status?: string;
  game?: string;
}

interface PackSummary {
  hasActivePack: boolean;
  packType: 'pro' | 'performance';
  packName: string;
  totalSessions: number;
  bookedSessions: number;
  remainingSessions: number;
  nextSessionNumber: number;
  sessions: PackSessionItem[];
}

const DAYS_SHORT = ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"];
const DAYS_FULL = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const MONTHS_SHORT = ["JANV", "FÉVR", "MARS", "AVR", "MAI", "JUIN", "JUIL", "AOÛT", "SEPT", "OCT", "NOV", "DÉC"];
const MONTHS_FULL = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const STANDARD_HOURS = ["10:00", "11:30", "14:00", "15:30", "17:00", "18:30", "20:00", "21:30"];

const MAGIC_BYTES: Record<string, number[]> = {
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/gif': [0x47, 0x49, 0x46, 0x38],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
};

async function verifyImageMagicBytes(file: File): Promise<boolean> {
  const header = await file.slice(0, 8).arrayBuffer();
  const bytes = new Uint8Array(header);
  for (const [mime, signature] of Object.entries(MAGIC_BYTES)) {
    if (signature.every((b, i) => bytes[i] === b)) {
      return file.type === mime;
    }
  }
  return false;
}

export default function Profile() {
  const { user, logout, updateAvatar, updateUsername, updateBio, isLoading: authLoading } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState('');
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [studentBookings, setStudentBookings] = useState<CoachingBooking[]>([]);
  const [studentAlerts, setStudentAlerts] = useState<Array<{
    id: string;
    status: 'rescheduled' | 'cancelled';
    plan_name: string;
    booking_date: string;
    booking_time: string;
    admin_notes: string | null;
    updated_at: string;
  }>>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [packSummary, setPackSummary] = useState<PackSummary | null>(null);

  // Pack Slot Booking States
  const [showPackBooking, setShowPackBooking] = useState(false);
  const [packSlots, setPackSlots] = useState<RawSlot[]>([]);
  const [loadingPackSlots, setLoadingPackSlots] = useState(false);
  const [selectedPackDayIndex, setSelectedPackDayIndex] = useState(0);
  const [selectedPackSlotId, setSelectedPackSlotId] = useState<string | null>(null);
  const [selectedPackTime, setSelectedPackTime] = useState<string>('');
  const [packGame, setPackGame] = useState<string>('Valorant');
  const [packNotes, setPackNotes] = useState<string>('');
  const [isBookingPackSession, setIsBookingPackSession] = useState(false);
  const [packBookingError, setPackBookingError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    statusTimerRef.current = setTimeout(() => setStatusMsg(null), 4000);
  };

  const dismissAlert = async (bookingId: string) => {
    setStudentAlerts(prev => prev.filter(a => a.id !== bookingId));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        await fetch('/api/notifications/student-summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ bookingId }),
        });
      }
    } catch {}
  };

  // Charger les créneaux disponibles pour le pack
  const fetchPackSlots = async () => {
    setLoadingPackSlots(true);
    try {
      const res = await fetch('/api/bookings/slots', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setPackSlots(data.slots || []);
      }
    } catch (err) {
      console.warn('Erreur chargement slots pack:', err);
    } finally {
      setLoadingPackSlots(false);
    }
  };

  useEffect(() => {
    if (showPackBooking && packSlots.length === 0) {
      fetchPackSlots();
    }
  }, [showPackBooking, packSlots.length]);

  // Compute 14 upcoming days for Pack booking
  const packDaysList: DayOption[] = useMemo(() => {
    const list: DayOption[] = [];
    const baseDate = new Date();

    const slotsByDate = new Map<string, RawSlot[]>();
    packSlots.forEach((s) => {
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

      let slotItems: Array<{ id?: string; time: string; available: boolean }> = [];

      if (dayDbSlots.length > 0) {
        slotItems = dayDbSlots
          .filter((s) => s.is_active && !s.is_booked)
          .map((s) => ({
            id: s.id,
            time: s.start_time,
            available: true,
          }));
        slotItems.sort((a, b) => a.time.localeCompare(b.time));
      } else {
        slotItems = STANDARD_HOURS.map((h) => ({
          time: h,
          available: false,
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
  }, [packSlots]);

  // Confirmer la réservation gratuite de la séance du pack
  const handleConfirmPackSession = async () => {
    if (!selectedPackTime) {
      setPackBookingError('Veuillez sélectionner un créneau horaire disponible.');
      return;
    }
    const currentDay = packDaysList[selectedPackDayIndex];
    if (!currentDay) return;

    setIsBookingPackSession(true);
    setPackBookingError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      const res = await fetch('/api/bookings/pack-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          slotId: selectedPackSlotId,
          bookingDate: currentDay.dateIso,
          bookingTime: selectedPackTime,
          game: packGame,
          notes: packNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Erreur lors de la réservation de votre séance de pack.');
      }

      showStatus('success', `Séance ${data.sessionNumber}/${data.totalSessions} réservée avec succès pour le ${currentDay.fullDateLabel} à ${selectedPackTime} !`);
      setShowPackBooking(false);
      setSelectedPackTime('');
      setSelectedPackSlotId(null);
      setPackNotes('');
      fetchPackSlots();
      loadBookings();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la réservation';
      setPackBookingError(msg);
    } finally {
      setIsBookingPackSession(false);
    }
  };

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  // Charger les réservations de l'élève
  const loadBookings = async () => {
    setBookingsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch('/api/bookings/student', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: 'no-store',
      });
      if (!res.ok) return;
      const data = await res.json();
      setStudentBookings(data.bookings || []);
      setStudentAlerts(data.alerts || []);
      if (data.packSummary) {
        setPackSummary(data.packSummary);
      }
    } catch (err) {
      console.error('Erreur chargement bookings profil:', err);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadBookings();
  }, [user]);

  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#07090D] flex items-center justify-center font-mono">
        <div className="w-8 h-8 border-2 border-[#FF7582] border-t-transparent animate-spin" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#07090D] text-white flex items-center justify-center font-mono px-4">
        <CyberNavbar />
        <div className="text-center reticle-box bg-[#090c10] border border-white/10 p-12 max-w-md mx-auto">
          <User size={48} className="mx-auto mb-4 text-white/30" />
          <h1 className="text-2xl font-display uppercase tracking-wider mb-2">ACCÈS NON AUTHENTIFIÉ</h1>
          <p className="text-xs text-white/60 mb-6">Connecte-toi pour accéder à ton espace personnel et ton suivi.</p>
          <Link
            href="/auth"
            className="btn-cyber-primary text-xs w-full justify-center"
          >
            <span>SE CONNECTER</span>
            <Award size={14} />
          </Link>
        </div>
      </main>
    );
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showStatus('error', 'Le fichier doit être une image (PNG, JPG, WEBP, GIF).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showStatus('error', "L'image ne doit pas dépasser 2 Mo.");
      return;
    }

    const isValidImage = await verifyImageMagicBytes(file);
    if (!isValidImage) {
      showStatus('error', "Le fichier n'est pas une image valide.");
      return;
    }

    setIsUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Non authentifié');

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/avatar/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.error || "Erreur lors de l'envoi");
      }

      await updateAvatar(result.url);
      showStatus('success', 'Photo de profil mise à jour avec succès !');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du téléchargement';
      showStatus('error', msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user.avatarUrl) return;
    setIsUploading(true);
    try {
      await updateAvatar(null);
      showStatus('success', 'Photo de profil retirée.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur';
      showStatus('error', msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveUsername = async () => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === user.username) {
      setIsEditingName(false);
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 30) {
      showStatus('error', 'Le pseudo doit contenir entre 2 et 30 caractères.');
      return;
    }
    if (!/^[a-zA-Z0-9_-À-ÿ ]+$/.test(trimmed)) {
      showStatus('error', 'Le pseudo contient des caractères non autorisés.');
      return;
    }
    setIsSavingName(true);
    try {
      await updateUsername(trimmed);
      showStatus('success', 'Pseudo mis à jour avec succès !');
      setIsEditingName(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur';
      showStatus('error', msg);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSaveBio = async () => {
    const trimmed = bioDraft.trim();
    const current = (user.bio || '').trim();
    if (trimmed === current) {
      setIsEditingBio(false);
      return;
    }
    if (trimmed.length > 280) {
      showStatus('error', 'La bio ne doit pas dépasser 280 caractères.');
      return;
    }
    setIsSavingBio(true);
    try {
      await updateBio(trimmed);
      showStatus('success', trimmed ? 'Bio mise à jour avec succès !' : 'Bio supprimée.');
      setIsEditingBio(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur';
      showStatus('error', msg);
    } finally {
      setIsSavingBio(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#07090D] text-white selection:bg-[#FF7582] selection:text-black pt-28 pb-20 font-mono relative z-10">
      <CyberNavbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8FAFD4] hover:text-white transition-colors uppercase tracking-wider"
            >
              <ArrowLeft size={13} />
              <span>RETOUR AU SITE</span>
            </Link>
            <span className="text-white/20">/</span>
            <span className="data-badge data-badge-laser">ESPACE PERSONNEL</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display uppercase tracking-wider text-white">
            BIENVENUE, <span className="text-[#FF7582]">{user.username}</span>
          </h1>
          <p className="text-xs text-white/60 mt-1 tracking-wide">
            Espace de gestion de compte, sessions réservées et suivi e-sport.
          </p>
        </div>

        {/* Status Toast */}
        {statusMsg && (
          <div
            className={`mb-6 p-3 text-xs font-mono flex items-center gap-2 border ${
              statusMsg.type === 'success'
                ? 'bg-[#A4DE87]/10 border-[#A4DE87]/40 text-[#A4DE87]'
                : 'bg-[#FF7582]/10 border-[#FF7582]/40 text-[#FF7582]'
            }`}
          >
            {statusMsg.type === 'success' ? <Check size={16} /> : <X size={16} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Alerts */}
        {studentAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`mb-6 p-4 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs ${
              alert.status === 'cancelled'
                ? 'bg-red-500/10 border-red-500/30 text-red-200'
                : 'bg-[#FF7582]/10 border-[#FF7582]/30 text-white'
            }`}
          >
            <div className="space-y-1">
              <p className="font-bold text-sm">
                {alert.status === 'cancelled'
                  ? `⚠️ Séance de coaching annulée (${alert.plan_name})`
                  : `📅 Séance de coaching reportée (${alert.plan_name})`}
              </p>
              <p className="text-xs text-white/70">
                {alert.status === 'cancelled' ? (
                  <>La séance prévue le <strong className="text-white">{new Date(alert.booking_date).toLocaleDateString('fr-FR')} à {alert.booking_time}</strong> a été annulée.</>
                ) : (
                  <>Nouvelle date retenue : <strong className="text-white">{new Date(alert.booking_date).toLocaleDateString('fr-FR')} à {alert.booking_time}</strong>.</>
                )}
              </p>
              {alert.admin_notes && (
                <p className="text-[11px] italic text-white/50">
                  Message du coach : &laquo; {alert.admin_notes} &raquo;
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => dismissAlert(alert.id)}
              className="btn-cyber-ghost text-xs py-1.5 px-3 shrink-0"
            >
              COMPRIS
            </button>
          </div>
        ))}

        {/* Profile Card */}
        <div className="reticle-box bg-[#090c10] border border-white/10 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

            {/* Avatar */}
            <div className="relative group">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 sm:w-28 sm:h-28 bg-[#FF7582]/15 border border-[#FF7582]/40 flex items-center justify-center text-3xl font-bold text-[#FF7582] overflow-hidden cursor-pointer relative shadow-[0_0_15px_rgba(255,117,130,0.15)] group-hover:border-[#FF7582] transition-colors"
                title="Cliquer pour changer de photo"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  user.initial
                )}

                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] gap-1 font-mono">
                  {isUploading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Camera size={18} />
                      <span>MODIFIER</span>
                    </>
                  )}
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                disabled={isUploading}
              />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="px-2.5 py-1 bg-black border border-white/20 text-white text-lg font-bold font-mono focus:border-[#FF7582]"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveUsername}
                      disabled={isSavingName}
                      className="p-1.5 bg-[#A4DE87]/20 text-[#A4DE87] border border-[#A4DE87]/40 text-xs"
                      title="Enregistrer"
                    >
                      {isSavingName ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="p-1.5 bg-white/5 text-white/50 hover:text-white text-xs"
                      title="Annuler"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold font-display tracking-wider uppercase text-white">{user.username}</h2>
                    <button
                      onClick={() => {
                        setNewName(user.username);
                        setIsEditingName(true);
                      }}
                      className="p-1 text-white/40 hover:text-white transition-colors cursor-pointer"
                      title="Modifier mon pseudo"
                    >
                      <Edit2 size={14} />
                    </button>
                  </>
                )}
              </div>

              <div className="mb-3">
                {user.isAdmin ? (
                  <span className="data-badge data-badge-acid text-[10px]">ADMINISTRATEUR POULPY</span>
                ) : (
                  <span className="data-badge data-badge-laser text-[10px]">MEMBRE POULPY COACHING</span>
                )}
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-white/60 text-xs mb-4">
                <Mail size={13} className="text-[#8FAFD4]" />
                <span>{user.email}</span>
              </div>

              {/* Photo controls */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="btn-cyber-ghost text-[10px] py-1 px-2.5 disabled:opacity-50"
                >
                  <Camera size={12} />
                  <span>{user.avatarUrl ? 'CHANGER PHOTO' : 'AJOUTER PHOTO'}</span>
                </button>
                {user.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={isUploading}
                    className="px-2.5 py-1 text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors font-mono disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 size={12} className="inline mr-1" />
                    SUPPRIMER
                  </button>
                )}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="btn-cyber-ghost text-xs py-2 px-4 hover:border-red-500 hover:text-red-400 cursor-pointer"
            >
              <LogOut size={14} />
              <span>DÉCONNEXION</span>
            </button>
          </div>
        </div>

        {/* Bio */}
        <div className="reticle-box bg-[#090c10] border border-white/10 p-6 mb-8">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Quote size={16} className="text-[#FF7582]" />
              <h3 className="font-bold text-sm uppercase tracking-wider text-white">MA BIO // PRÉSENTATION</h3>
            </div>
            {!isEditingBio && (
              <button
                type="button"
                onClick={() => {
                  setBioDraft(user.bio || '');
                  setIsEditingBio(true);
                }}
                className="text-[10px] text-[#8FAFD4] hover:text-white uppercase font-bold tracking-wider cursor-pointer"
              >
                {user.bio ? '[ MODIFIER ]' : '[ AJOUTER ]'}
              </button>
            )}
          </div>

          {isEditingBio ? (
            <div>
              <textarea
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value.slice(0, 280))}
                placeholder="Présente ton niveau de jeu, ton rang actuel et tes objectifs e-sport..."
                rows={4}
                maxLength={280}
                className="w-full p-3 bg-black border border-white/20 text-white placeholder-white/30 text-xs focus:border-[#FF7582] resize-none font-mono"
                autoFocus
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-white/40">{bioDraft.length} / 280</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingBio(false)}
                    disabled={isSavingBio}
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white/60 text-xs"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBio}
                    disabled={isSavingBio}
                    className="btn-cyber-primary text-xs py-1 px-3"
                  >
                    {isSavingBio ? 'Enregistrement...' : 'Sauvegarder'}
                  </button>
                </div>
              </div>
            </div>
          ) : user.bio ? (
            <p className="text-xs text-white/80 whitespace-pre-wrap leading-relaxed">{user.bio}</p>
          ) : (
            <p className="text-xs text-white/40 italic">
              Aucune bio renseignée. Ajoute quelques lignes pour que Poulpy adapte ses sessions à tes attentes.
            </p>
          )}
        </div>

        {/* Social Links */}
        <div className="mb-8">
          <SocialLinks editable />
        </div>

        {/* Favorite Games */}
        {!user.isAdmin && (
          <div className="mb-8">
            <FavoriteGames />
          </div>
        )}

        {/* ======================================================== */}
        {/* PACK SÉANCES ACTIF // GESTION & RÉSERVATION DES CRÉNEAUX */}
        {/* Disparaît automatiquement dès que toutes les séances sont réservées */}
        {/* ======================================================== */}
        {packSummary && packSummary.hasActivePack && packSummary.remainingSessions > 0 && (
          <div className="reticle-box bg-[#090C12] border-2 border-[#FF7582] shadow-[0_0_35px_rgba(255,117,130,0.2)] p-6 sm:p-8 mb-8 relative overflow-hidden">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="bg-[#FF7582] text-black text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest">
                    PACK SÉANCES ACTIF
                  </span>
                  <span className="text-[10px] text-[#A4DE87] font-bold tracking-wider font-mono border border-[#A4DE87]/30 bg-[#A4DE87]/10 px-2 py-0.5">
                    {packSummary.remainingSessions} SÉANCE(S) RESTANTE(S) À PLANIFIER
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display text-white tracking-wider">
                  {packSummary.packName.toUpperCase()}
                </h2>
                <p className="text-xs text-white/60 mt-0.5 font-mono">
                  Sélectionne un créneau horaire pour bloquer gratuitement ta prochaine séance (Séance {packSummary.nextSessionNumber}/{packSummary.totalSessions}).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPackBooking(!showPackBooking)}
                className="btn-cyber-primary text-xs py-2.5 px-5 shrink-0 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(255,117,130,0.3)]"
              >
                <Calendar size={14} />
                <span>{showPackBooking ? 'MASQUER LE CALENDRIER' : `RÉSERVER SÉANCE ${packSummary.nextSessionNumber}/${packSummary.totalSessions}`}</span>
              </button>
            </div>

            {/* Progress Grid of Pack Sessions */}
            <div className="space-y-2 mb-6">
              <div className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
                AVANCEMENT DU PROTOCOLE DU PACK ({packSummary.bookedSessions} / {packSummary.totalSessions} SÉANCES RÉSERVÉES) :
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {packSummary.sessions.map((s) => (
                  <div
                    key={s.number}
                    className={`p-3 border text-center font-mono transition-all flex flex-col justify-between ${
                      s.isBooked
                        ? 'border-[#A4DE87]/40 bg-[#A4DE87]/10 text-white shadow-[0_0_10px_rgba(164,222,135,0.1)]'
                        : s.number === packSummary.nextSessionNumber
                        ? 'border-[#FF7582] bg-[#FF7582]/15 text-white ring-1 ring-[#FF7582] shadow-[0_0_15px_rgba(255,117,130,0.25)]'
                        : 'border-white/10 bg-black/40 text-white/40'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold tracking-wider">
                      SÉANCE {s.number}
                    </div>

                    {s.isBooked ? (
                      <div className="mt-1 space-y-0.5">
                        <span className="text-[8px] text-[#A4DE87] font-bold block">[ RÉSERVÉE ]</span>
                        <span className="text-[10px] text-white/80 block font-bold truncate">
                          {new Date(s.bookingDate!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} à {s.bookingTime}
                        </span>
                      </div>
                    ) : s.number === packSummary.nextSessionNumber ? (
                      <div className="mt-1">
                        <span className="text-[8px] text-[#FF7582] font-bold block animate-pulse">À RÉSERVER</span>
                        <span className="text-[10px] text-white font-bold block">0 € INCLUS</span>
                      </div>
                    ) : (
                      <div className="mt-1">
                        <span className="text-[8px] text-white/30 block">EN ATTENTE</span>
                        <span className="text-[10px] text-white/30 block">Inclus</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Embedded Slot Selector for Next Session */}
            {showPackBooking && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-6 border-t border-white/10 space-y-5"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/80 uppercase font-bold tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#FF7582]" />
                    <span>PLANIFICATION DE LA SÉANCE {packSummary.nextSessionNumber} / {packSummary.totalSessions}</span>
                  </div>
                  {loadingPackSlots && (
                    <div className="flex items-center gap-1.5 text-xs text-[#8FAFD4]">
                      <Loader2 size={13} className="animate-spin" />
                      <span>Actualisation des créneaux...</span>
                    </div>
                  )}
                </div>

                {/* Days Selector */}
                <div className="space-y-2">
                  <label className="text-[11px] text-white/70 block uppercase font-bold tracking-wider">
                    1. CHOISIR LE JOUR :
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {packDaysList.map((d, index) => {
                      const isSelected = selectedPackDayIndex === index;
                      return (
                        <div
                          key={d.dateIso}
                          onClick={() => {
                            setSelectedPackDayIndex(index);
                            setSelectedPackTime('');
                            setSelectedPackSlotId(null);
                          }}
                          className={`flex-shrink-0 w-24 p-2.5 border text-center cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#FF7582] bg-[#FF7582]/20 text-white shadow-[0_0_12px_rgba(255,117,130,0.3)] ring-1 ring-[#FF7582]'
                              : 'border-white/10 bg-black/60 hover:border-white/30 text-white/70'
                          }`}
                        >
                          <div className="text-[9px] uppercase font-bold text-white/50">{d.dayName}</div>
                          <div className="text-base font-display">{d.dayNumber} {d.monthName}</div>
                          <div className="mt-1">
                            {d.availableCount > 0 ? (
                              <span className="text-[8px] font-bold px-1 py-0.2 bg-[#A4DE87]/15 border border-[#A4DE87]/30 text-[#A4DE87] uppercase block">
                                {d.availableCount} dispo
                              </span>
                            ) : (
                              <span className="text-[8px] font-medium px-1 py-0.2 bg-white/5 text-white/30 uppercase block">
                                Complet
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Slots Grid */}
                <div className="space-y-2">
                  <label className="text-[11px] text-white/70 block uppercase font-bold tracking-wider">
                    2. SÉLECTIONNER L'HEURE (CRÉNEAU) :
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                    {packDaysList[selectedPackDayIndex]?.slots.map((slot) => {
                      const isSelected = selectedPackTime === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => {
                            if (slot.available) {
                              setSelectedPackTime(slot.time);
                              setSelectedPackSlotId(slot.id || null);
                            }
                          }}
                          className={`p-2.5 border text-center font-mono transition-all text-xs ${
                            isSelected
                              ? 'border-[#FF7582] bg-[#FF7582] text-black font-bold shadow-[0_0_15px_rgba(255,117,130,0.4)] cursor-pointer'
                              : slot.available
                              ? 'border-[#A4DE87]/40 bg-black/60 hover:border-[#A4DE87] text-white cursor-pointer'
                              : 'border-white/5 bg-black/20 text-white/20 cursor-not-allowed opacity-40'
                          }`}
                        >
                          <div className="font-bold">{slot.time}</div>
                          <div className={`text-[8px] font-bold uppercase mt-0.5 ${isSelected ? 'text-black' : slot.available ? 'text-[#A4DE87]' : 'text-white/20'}`}>
                            {isSelected ? 'CHOISI' : slot.available ? 'LIBRE' : 'OCCUPÉ'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Game & Notes Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-[10px] text-white/70 block uppercase font-bold tracking-wider mb-1">
                      JEU DE LA SÉANCE :
                    </label>
                    <select
                      value={packGame}
                      onChange={(e) => setPackGame(e.target.value)}
                      className="w-full bg-black border border-white/20 p-2.5 text-xs text-white focus:border-[#FF7582] focus:outline-none"
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
                    <label className="text-[10px] text-white/70 block uppercase font-bold tracking-wider mb-1">
                      NOTES / OBJECTIFS SPÉCIFIQUES :
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Analyse VOD sur Bind, travail de l'aim..."
                      value={packNotes}
                      onChange={(e) => setPackNotes(e.target.value)}
                      className="w-full bg-black border border-white/20 p-2.5 text-xs text-white placeholder-white/30 focus:border-[#FF7582] focus:outline-none"
                    />
                  </div>
                </div>

                {packBookingError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{packBookingError}</span>
                  </div>
                )}

                {/* Confirm Action Button */}
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-white/70 font-mono">
                    {selectedPackTime ? (
                      <span>
                        Créneau sélectionné : <strong className="text-white">{packDaysList[selectedPackDayIndex]?.fullDateLabel} à {selectedPackTime}</strong> (0 € - Inclus Pack)
                      </span>
                    ) : (
                      <span className="text-white/40">Veuillez choisir un créneau ci-dessus</span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!selectedPackTime || isBookingPackSession}
                    onClick={handleConfirmPackSession}
                    className="btn-cyber-primary py-3 px-7 text-xs font-bold uppercase disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                  >
                    {isBookingPackSession ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>VERROUILLAGE EN COURS...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>VALIDER LA SÉANCE {packSummary.nextSessionNumber}/{packSummary.totalSessions} (0 €)</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Active Coaching Bookings */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
            <h2 className="text-lg font-display uppercase tracking-wider text-white flex items-center gap-2">
              <Calendar size={18} className="text-[#8FAFD4]" />
              <span>SÉANCES DE COACHING RÉSERVÉES</span>
            </h2>
            <Link
              href="/#booking"
              className="text-xs text-[#FF7582] hover:underline font-bold"
            >
              + RÉSERVER UN NOUVEAU CRÉNEAU
            </Link>
          </div>

          {bookingsLoading ? (
            <div className="reticle-box bg-[#090c10] border border-white/10 p-8 text-center">
              <div className="w-6 h-6 border-2 border-[#FF7582] border-t-transparent animate-spin mx-auto mb-2" />
              <p className="text-xs text-white/50">Chargement de tes réservations...</p>
            </div>
          ) : studentBookings.length === 0 ? (
            <div className="reticle-box bg-[#090c10] border border-white/10 p-8 text-center">
              <Clock size={32} className="mx-auto mb-3 text-white/30" />
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-1">AUCUNE SESSION PROGRAMMÉE</p>
              <p className="text-xs text-white/50 mb-4 max-w-md mx-auto">
                Choisis ta formule pour bloquer ton créneau et démarrer ton entraînement d&apos;élite.
              </p>
              <Link
                href="/#booking"
                className="btn-cyber-primary text-xs"
              >
                <span>CHOISIR UN CRÉNEAU DISPONIBLE</span>
                <Award size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentBookings.map((b) => (
                <div
                  key={b.id}
                  className="reticle-box bg-[#090c10] border border-white/15 hover:border-[#FF7582]/50 transition-colors p-5 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="data-badge data-badge-laser text-[9px]">
                        {b.plan_name}
                      </span>
                      <span
                        className={`data-badge text-[9px] ${
                          b.status === 'completed'
                            ? 'border-white/20 bg-white/10 text-white/60'
                            : b.status === 'rescheduled'
                            ? 'data-badge-acid'
                            : 'data-badge-laser'
                        }`}
                      >
                        {b.status === 'completed' ? 'TERMINÉE' : b.status === 'rescheduled' ? 'REPORTÉE' : 'CONFIRMÉE'}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <Calendar size={15} className="text-[#8FAFD4]" />
                      <span>
                        {new Date(b.booking_date).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}{' '}
                        à {b.booking_time}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 mt-1">
                      {b.plan_duration} • Discipline : <span className="text-[#FF7582] font-bold">{b.game}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
                    <span className="text-white/50 text-[11px]">
                      Discord : <strong className="text-white">{b.student_discord}</strong>
                    </span>
                    <a
                      href="https://discord.gg/rJMg3ZZRkp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-[#8FAFD4]/10 border border-[#8FAFD4]/30 text-[#8FAFD4] hover:text-white text-[10px] font-bold uppercase"
                    >
                      DISCORD
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Access Modules */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/profile/coaching"
            className="reticle-box bg-[#090c10] border border-white/10 hover:border-[#8FAFD4] p-5 text-center transition-colors group cursor-pointer"
          >
            <MessageSquare size={22} className="text-[#8FAFD4] mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-xs uppercase tracking-wider mb-0.5">MESSAGES COACH</h3>
            <p className="text-[10px] text-white/50">Retours & feed-back</p>
          </Link>

          <Link
            href="/profile/vod"
            className="reticle-box bg-[#090c10] border border-white/10 hover:border-[#FF7582] p-5 text-center transition-colors group cursor-pointer"
          >
            <Film size={22} className="text-[#FF7582] mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-xs uppercase tracking-wider mb-0.5">CLIPS VOD</h3>
            <p className="text-[10px] text-white/50">Analyses de replays</p>
          </Link>

          <Link
            href="/#booking"
            className="reticle-box bg-[#090c10] border border-white/10 hover:border-[#A4DE87] p-5 text-center transition-colors group cursor-pointer"
          >
            <Clock size={22} className="text-[#A4DE87] mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-xs uppercase tracking-wider mb-0.5">SESSIONS</h3>
            <p className="text-[10px] text-white/50">
              {studentBookings.length > 0
                ? `${studentBookings.length} planifiée(s)`
                : 'Réserver'}
            </p>
          </Link>

          <Link
            href="/profile/sheet"
            className="reticle-box bg-[#090c10] border border-white/10 hover:border-white p-5 text-center transition-colors group cursor-pointer"
          >
            <FileText size={22} className="text-white mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-xs uppercase tracking-wider mb-0.5">FICHE PERSO</h3>
            <p className="text-[10px] text-white/50">Objectifs & axes</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
