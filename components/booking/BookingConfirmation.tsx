'use client';

import { motion } from 'framer-motion';
import { Check, ExternalLink } from 'lucide-react';
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="py-4 text-center space-y-6 max-w-2xl mx-auto font-mono"
    >
      {/* Ticket Container */}
      <div className="bg-[#181720] border border-white/15 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        {/* Top Green Status Bar */}
        <div className="bg-[#00B4A0]/20 px-5 sm:px-7 py-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#00B4A0]/20">
          <div className="flex items-center gap-2 text-[#00B4A0] text-xs font-bold tracking-wider uppercase">
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>SÉANCE CONFIRMÉE • POULPY COACHING</span>
          </div>
          <span className="text-xs font-bold text-[#F5F4F0] uppercase tracking-wider">
            {slotLabel}
          </span>
        </div>

        {/* Ticket Info Grid (2x2) */}
        <div className="p-6 sm:p-7 grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
          <div>
            <span className="text-[10px] text-[#F5F4F0]/45 uppercase tracking-wider block mb-1">
              FORMULE SÉLECTIONNÉE
            </span>
            <span className="text-sm sm:text-base font-bold text-[#F5F4F0] block">
              {plan.name} ({plan.price})
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#F5F4F0]/45 uppercase tracking-wider block mb-1">
              CRÉNEAU HORAIRE
            </span>
            <span className="text-sm sm:text-base font-bold text-[#00B4A0] block">
              {slotLabel}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#F5F4F0]/45 uppercase tracking-wider block mb-1">
              COMPTE DISCORD
            </span>
            <span className="text-sm sm:text-base font-bold text-[#F5F4F0] block">
              {formData.discord || '—'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#F5F4F0]/45 uppercase tracking-wider block mb-1">
              RIOT ID / PSEUDO JEU
            </span>
            <span className="text-sm sm:text-base font-bold text-[#CA1C30] block">
              {formData.riotId || '—'}
            </span>
          </div>
        </div>

        {/* Dashed Perforation Line */}
        <div className="border-t-2 border-dashed border-[#CA1C30]/60" />

        {/* Bottom Half: Mandatory Discord Zone */}
        <div className="bg-[#CA1C30]/[0.08] p-6 sm:p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center px-4 py-1 bg-[#CA1C30] text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-[0_0_15px_rgba(202,28,48,0.4)]">
            PRÉSENCE SUR LE DISCORD OBLIGATOIRE
          </div>

          <h3 className="text-lg sm:text-xl font-display text-[#F5F4F0] tracking-wider uppercase">
            REJOINS LE SERVEUR POUR DÉBLOQUER TA SÉANCE
          </h3>

          <p className="text-xs text-[#F5F4F0]/75 leading-relaxed max-w-lg mx-auto">
            Tant que tu n&apos;es pas sur le serveur Discord, la session ne peut pas être effectuée. Le vocal et le partage d&apos;écran avec Poulpy se déroulent uniquement dessus.
          </p>

          <div className="pt-1">
            <a
              href="https://discord.gg/BC24FH4xpd"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto sm:min-w-[380px] py-3.5 px-8 bg-[#CA1C30] hover:bg-[#CA1C30]/90 text-white font-display text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-[0_0_25px_rgba(202,28,48,0.35)]"
            >
              <span>REJOINDRE LE SERVEUR DISCORD OFFICIEL</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="pt-1 flex justify-center">
        <button
          onClick={onReset}
          className="btn-cyber-ghost py-2.5 px-6 text-xs uppercase cursor-pointer"
        >
          RÉSERVER UNE AUTRE SESSION
        </button>
      </div>
    </motion.div>
  );
}
