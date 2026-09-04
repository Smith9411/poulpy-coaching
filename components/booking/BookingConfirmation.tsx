'use client';

import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Gamepad2, MessageSquare, Shield, Sparkles, User } from 'lucide-react';
import Link from 'next/link';
import { BookingFormData, Plan } from './types';

interface BookingConfirmationProps {
  plan: Plan;
  slotLabel: string;
  formData: BookingFormData;
  onReset: () => void;
}

export default function BookingConfirmation({
  plan,
  slotLabel,
  formData,
  onReset,
}: BookingConfirmationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <div className="glass-dark border border-purple-500/30 rounded-3xl p-6 sm:p-10 text-center">
        {/* Animated badge */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 14, stiffness: 220, delay: 0.15 }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-lg shadow-cyan-500/30"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
        >
          <CheckCircle2 size={36} className="text-white" />
        </motion.div>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Réservation validée, {formData.name} !
        </h3>
        <p className="text-gray-300 text-sm sm:text-base max-w-md mx-auto mb-6">
          Ton créneau de coaching avec Poulpy est bien enregistré. On se retrouve très vite en session !
        </p>

        {/* Recap Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-left">
          <div className="glass p-3.5 rounded-xl flex items-center gap-3 border border-white/10">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: plan.color }}
            >
              <User size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-sm truncate">{plan.name}</div>
              <div className="text-xs text-gray-400">
                {plan.duration} • {plan.price}
              </div>
            </div>
          </div>

          <div className="glass p-3.5 rounded-xl flex items-center gap-3 border border-white/10">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-purple-500/20 text-purple-400">
              <Calendar size={18} />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-sm truncate">{slotLabel}</div>
              <div className="text-xs text-gray-400">Heure de Paris (CET)</div>
            </div>
          </div>

          <div className="glass p-3.5 rounded-xl flex items-center gap-3 border border-white/10">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-cyan-500/20 text-cyan-400">
              <Gamepad2 size={18} />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-sm truncate">{formData.game}</div>
              <div className="text-xs text-gray-400">Jeu sélectionné</div>
            </div>
          </div>

          <div className="glass p-3.5 rounded-xl flex items-center gap-3 border border-white/10">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-indigo-500/20 text-indigo-400">
              <MessageSquare size={18} />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-sm truncate">{formData.discord}</div>
              <div className="text-xs text-gray-400">Identifiant Discord</div>
            </div>
          </div>
        </div>

        {/* Steps roadmap */}
        <div className="glass p-5 rounded-2xl mb-6 text-left border border-white/10">
          <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
            <Shield size={16} className="text-green-400" />
            Ce qui se passe maintenant :
          </h4>
          <div className="space-y-2.5 text-xs sm:text-sm text-gray-300">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                1
              </span>
              <span>Rejoins le serveur Discord si ce n'est pas encore fait.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                2
              </span>
              <span>Tu recevras une confirmation par message de Poulpy avant la session.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                3
              </span>
              <span>
                Prépare un clip ou une VOD si tu le souhaites pour maximiser ton heure d'entraînement !
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="https://discord.gg/poulpy-coaching"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 font-bold text-sm text-white shadow-lg hover:shadow-purple-500/30 flex items-center justify-center gap-2 transition-all"
          >
            <MessageSquare size={16} />
            <span>Rejoindre le Discord</span>
          </a>

          <Link
            href="/coaching"
            className="w-full sm:w-auto px-6 py-3 rounded-xl glass hover:bg-white/10 font-bold text-sm text-white border border-white/10 flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles size={16} className="text-cyan-400" />
            <span>Espace Coaching & Suivi</span>
          </Link>

          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto px-5 py-3 rounded-xl glass text-xs sm:text-sm text-gray-400 hover:text-white transition-all"
          >
            Nouvelle réservation
          </button>
        </div>
      </div>
    </motion.div>
  );
}
