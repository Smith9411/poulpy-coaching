'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, Gamepad2, Mail, MessageSquare, Send, Sparkles, User as UserIcon, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { BookingFormData, Plan } from './types';
import { SelectedSlotDetails } from './BookingSlotsStep';
import Select, { SelectOption } from '@/components/Select';

interface BookingFormStepProps {
  plan: Plan;
  slotLabel: string;
  selectedSlotDetails?: SelectedSlotDetails | null;
  onSubmit: (formData: BookingFormData) => void;
  onBack: () => void;
}

const GAME_OPTIONS: SelectOption[] = [
  { value: 'Valorant', label: '🔫 Valorant' },
  { value: 'Apex Legends', label: '⚡ Apex Legends' },
];

export default function BookingFormStep({
  plan,
  slotLabel,
  selectedSlotDetails,
  onSubmit,
  onBack,
}: BookingFormStepProps) {
  const { user } = useAuth();

  const [formData, setFormData] = useState<BookingFormData>({
    name: user?.username || '',
    email: user?.email || '',
    discord: '',
    game: 'Valorant',
    notes: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.username || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Merci de renseigner ton pseudo ou nom.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Merci de fournir un email valide.');
      return;
    }
    if (!formData.discord.trim()) {
      setError('Ton pseudo Discord est obligatoire pour que Poulpy te contacte.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          slotId: selectedSlotDetails?.slotId,
          bookingDate: selectedSlotDetails?.bookingDate,
          bookingTime: selectedSlotDetails?.bookingTime,
          planId: plan.id,
          planName: plan.name,
          planPrice: plan.price,
          planDuration: plan.duration,
          studentName: formData.name,
          studentEmail: formData.email,
          studentDiscord: formData.discord,
          game: formData.game,
          notes: formData.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Erreur lors de la réservation.');
      }

      onSubmit(formData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inattendue.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Recap Banner */}
      <div className="glass-dark border border-purple-500/30 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
              {plan.name}
            </span>
            <span className="text-sm font-bold text-white">{plan.price}</span>
          </div>
          <p className="text-sm text-gray-300 mt-1">
            Créneau choisi : <strong className="text-cyan-400">{slotLabel}</strong>
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="glass px-3.5 py-1.5 rounded-xl text-xs text-gray-300 hover:text-white transition-all flex items-center gap-1.5"
        >
          <ChevronLeft size={16} />
          Modifier le créneau
        </button>
      </div>

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="glass-dark rounded-2xl p-6 sm:p-8 border border-white/10 space-y-5">
        <div className="flex items-center gap-2.5 mb-2">
          <Sparkles size={20} className="text-purple-400" />
          <h3 className="text-lg font-bold text-white">Tes informations pour la session</h3>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-xs sm:text-sm p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Row Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Pseudo ou Prénom <span className="text-purple-400">*</span>
            </label>
            <div className="relative">
              <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Poulpy, Alex..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Email <span className="text-purple-400">*</span>
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ton.email@exemple.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Discord handle */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Pseudo Discord <span className="text-cyan-400">*</span> (Ex: poulpy_off)
          </label>
          <div className="relative">
            <MessageSquare size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
            <input
              type="text"
              required
              value={formData.discord}
              onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
              placeholder="Ton identifiant Discord pour l'invitation vocale"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">
            Poulpy t'ajoutera pour la session vocale et le suivi personnalisé.
          </span>
        </div>

        {/* Game selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
            <Gamepad2 size={15} className="text-purple-400" />
            <span>Jeu pour la session</span>
            <span className="text-purple-400">*</span>
          </label>
          <Select
            value={formData.game}
            onChange={(val) => setFormData({ ...formData, game: val })}
            options={GAME_OPTIONS}
            accent="purple"
            placeholder="Choisis ton jeu..."
          />
        </div>

        {/* Notes / Goals */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Objectifs ou points à travailler (facultatif)
          </label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Ex: Mon aim est irrégulier, je bloque en Platine 3, review VOD sur Ascent..."
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none"
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-cyan-500 to-blue-500 text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Enregistrement de ta séance...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Valider ma réservation instantanée</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
