'use client';

import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Gamepad2, MessageSquare, Shield, Sparkles, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { BookingFormData, Plan } from './types';
import CornerBrackets from '@/components/CornerBrackets';

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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto font-mono"
    >
      <div className="reticle-box bg-[#121117] border border-white/10 p-6 sm:p-10 relative text-center shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <CornerBrackets color="coral" />

        {/* Animated Badge */}
        <div className="w-16 h-16 mx-auto mb-5 border-2 border-[#00B4A0] bg-[#00B4A0]/10 flex items-center justify-center text-[#00B4A0] shadow-[0_0_20px_rgba(0,180,160,0.3)]">
          <CheckCircle2 size={32} />
        </div>

        <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 text-[10px] text-[#00B4A0] tracking-widest uppercase mb-3">
          SESSION CONFIRMÉE // STATUS_OK
        </div>

        <h3 className="text-2xl sm:text-4xl font-display uppercase tracking-wider text-white mb-2">
          RÉSERVATION VALIDÉE, <span className="text-[#CA1C30]">{formData.name}</span>
        </h3>
        <p className="text-white/60 text-xs sm:text-sm max-w-md mx-auto mb-8 leading-relaxed">
          Ton créneau de coaching avec Poulpy est bien synchronisé. Prépare-toi pour ta session d'entraînement.
        </p>

        {/* Recap Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left">
          <div className="p-3.5 bg-black/40 border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center shrink-0 bg-[#CA1C30]/20 border border-[#CA1C30]/40 text-[#CA1C30]">
              <User size={16} />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-xs truncate uppercase tracking-wider">{plan.name}</div>
              <div className="text-[11px] text-white/50">
                {plan.duration} • {plan.price}
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-black/40 border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center shrink-0 bg-[#00B4A0]/20 border border-[#00B4A0]/40 text-[#00B4A0]">
              <Calendar size={16} />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-xs truncate uppercase tracking-wider">{slotLabel}</div>
              <div className="text-[11px] text-white/50">Heure de Paris (CET)</div>
            </div>
          </div>

          <div className="p-3.5 bg-black/40 border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center shrink-0 bg-white/5 border border-white/10 text-white">
              <Gamepad2 size={16} />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-xs truncate uppercase tracking-wider">{formData.game}</div>
              <div className="text-[11px] text-white/50">Jeu sélectionné</div>
            </div>
          </div>

          <div className="p-3.5 bg-black/40 border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center shrink-0 bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2]">
              <MessageSquare size={16} />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-xs truncate uppercase tracking-wider">{formData.discord}</div>
              <div className="text-[11px] text-white/50">Identifiant Discord</div>
            </div>
          </div>
        </div>

        {/* Steps roadmap */}
        <div className="p-5 bg-black/40 border border-white/10 mb-8 text-left">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
            <Shield size={14} className="text-[#00B4A0]" />
            PROTOCOLE POST-RÉSERVATION :
          </h4>
          <div className="space-y-3 text-xs text-white/70">
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 bg-[#CA1C30]/20 border border-[#CA1C30]/40 text-[#CA1C30] font-bold flex items-center justify-center shrink-0 text-[10px]">
                01
              </span>
              <span>Rejoins le serveur Discord officiel pour la communication vocale.</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 bg-[#00B4A0]/20 border border-[#00B4A0]/40 text-[#00B4A0] font-bold flex items-center justify-center shrink-0 text-[10px]">
                02
              </span>
              <span>Tu recevras un briefing direct de Poulpy avant le début de la session.</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 bg-white/10 border border-white/20 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                03
              </span>
              <span>Dépose un clip ou une VOD dans ton espace élève pour une analyse millimétrée.</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="https://discord.gg/rJMg3ZZRkp"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cyber-primary w-full sm:w-auto py-3 px-6 text-xs inline-flex items-center justify-center gap-2"
          >
            <MessageSquare size={14} />
            <span>REJOINDRE LE DISCORD</span>
          </a>

          <Link
            href="/profile/coaching"
            className="btn-cyber-ghost w-full sm:w-auto py-3 px-6 text-xs inline-flex items-center justify-center gap-2"
          >
            <Sparkles size={14} className="text-[#00B4A0]" />
            <span>ESPACE SUIVI COACHING</span>
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10">
          <button
            onClick={onReset}
            className="text-[11px] text-white/40 hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
          >
            Réserver un autre créneau
          </button>
        </div>
      </div>
    </motion.div>
  );
}
