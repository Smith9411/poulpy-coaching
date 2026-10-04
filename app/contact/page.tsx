'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MessageCircle, ArrowRight, Mail, Globe, MapPin, ArrowLeft, Shield } from 'lucide-react';
import CyberNavbar from '@/components/CyberNavbar';
import CyberFooter from '@/components/CyberFooter';

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#0B0A0D] text-white flex flex-col font-mono">
      <CyberNavbar />

      <main className="flex-1 py-28 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-block px-3 py-1 mb-4 border border-[#CA1C30]/40 bg-[#CA1C30]/10 text-[#CA1C30] text-[11px] font-bold tracking-widest uppercase">
              // CANAUX OFFICIELS & CONTACT
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white mb-4 uppercase">
              ENTRER EN <span className="text-[#CA1C30]">CONTACT</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/50 max-w-xl mx-auto leading-relaxed">
              Pour préparer ton accompagnement, planifier un coaching sur-mesure ou poser tes questions directement à Poulpy.
            </p>
          </motion.div>

          {/* Discord CTA - Main Priority */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-10"
          >
            <div className="reticle-box bg-[#121117] border border-[#5865F2]/40 p-8 sm:p-12 relative overflow-hidden shadow-[0_0_30px_rgba(88,101,242,0.15)] text-center">
              <div className="relative z-10 flex flex-col items-center gap-5">
                <div className="w-16 h-16 bg-[#5865F2]/15 border border-[#5865F2]/40 flex items-center justify-center text-[#7289da]">
                  <MessageCircle size={32} />
                </div>

                <div>
                  <div className="text-[10px] text-[#00B4A0] uppercase font-bold tracking-widest mb-1">
                    CANAL DE RÉFÉRENCE
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold uppercase tracking-wider text-white mb-2">
                    SERVEUR DISCORD POULPY
                  </h2>
                  <p className="text-xs sm:text-sm text-white/60 max-w-md mx-auto">
                    Le hub central : réservations en direct, annonces des créneaux, salons d'entraînement et échanges élèves.
                  </p>
                </div>

                <a
                  href="https://discord.gg/rJMg3ZZRkp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-cyber-primary text-xs sm:text-sm py-3.5 px-8 inline-flex items-center gap-3 cursor-pointer shadow-[0_0_20px_rgba(202,28,48,0.3)]"
                >
                  <MessageCircle size={18} />
                  <span>REJOINDRE LE DISCORD OFFICIEL</span>
                  <ArrowRight size={18} />
                </a>

                <p className="text-[10px] text-white/40 tracking-wider uppercase">
                  Invitation permanente active • Communauté compétitive Valorant & Apex
                </p>
              </div>
            </div>
          </motion.div>

          {/* Other contact methods */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid sm:grid-cols-3 gap-4 mb-12"
          >
            {/* Email */}
            <div className="reticle-box bg-[#121117] border border-white/10 p-6 text-center hover:border-[#CA1C30]/50 transition-colors">
              <div className="w-11 h-11 bg-[#CA1C30]/15 border border-[#CA1C30]/30 flex items-center justify-center text-[#CA1C30] mx-auto mb-4">
                <Mail size={20} />
              </div>
              <h3 className="font-bold font-display uppercase tracking-wider text-sm text-white mb-1">EMAIL PRO</h3>
              <p className="text-[11px] text-white/40 mb-3">
                Partenariats, structures & demandes business
              </p>
              <a
                href="mailto:poulpy.coaching@gmail.com"
                className="text-xs text-[#00B4A0] hover:text-white font-bold transition-colors break-all"
              >
                poulpy.coaching@gmail.com
              </a>
            </div>

            {/* Réseaux */}
            <div className="reticle-box bg-[#121117] border border-white/10 p-6 text-center hover:border-[#00B4A0]/50 transition-colors">
              <div className="w-11 h-11 bg-[#00B4A0]/15 border border-[#00B4A0]/30 flex items-center justify-center text-[#00B4A0] mx-auto mb-4">
                <Globe size={20} />
              </div>
              <h3 className="font-bold font-display uppercase tracking-wider text-sm text-white mb-1">STREAMS & TIPS</h3>
              <p className="text-[11px] text-white/40 mb-3">
                VODs, clips et gameplay en direct
              </p>
              <div className="flex items-center justify-center gap-3 text-white/60">
                <a
                  href="https://www.twitch.tv/ccs_poulpy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-white/5 hover:bg-[#9146FF]/20 hover:text-[#a970ff] border border-white/10 transition-colors"
                  aria-label="Twitch"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>
                </a>
                <a
                  href="https://www.youtube.com/@Poulpy_C"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-white/5 hover:bg-red-500/20 hover:text-red-400 border border-white/10 transition-colors"
                  aria-label="YouTube"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a
                  href="https://www.tiktok.com/@poulpy_ccs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-white/5 hover:bg-white/20 hover:text-white border border-white/10 transition-colors"
                  aria-label="TikTok"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.48 6.3 6.3 0 0 0 1.86-4.47v-6.9a8.16 8.16 0 0 0 4.91 1.63v-3.71z"/></svg>
                </a>
              </div>
            </div>

            {/* Localisation */}
            <div className="reticle-box bg-[#121117] border border-white/10 p-6 text-center hover:border-white/30 transition-colors">
              <div className="w-11 h-11 bg-white/5 border border-white/15 flex items-center justify-center text-white mx-auto mb-4">
                <MapPin size={20} />
              </div>
              <h3 className="font-bold font-display uppercase tracking-wider text-sm text-white mb-1">FUSEAU HORAIRE</h3>
              <p className="text-[11px] text-white/40 mb-2">
                France (CET / CEST)
              </p>
              <span className="text-[10px] text-[#00B4A0] font-bold uppercase tracking-wider">
                SESSIONS : 14H00 — 23H00
              </span>
            </div>
          </motion.div>

          {/* Back button */}
          <div className="text-center">
            <Link
              href="/"
              className="btn-cyber-ghost text-xs py-2 px-6 inline-flex items-center gap-2"
            >
              <ArrowLeft size={14} />
              <span>RETOURNER SUR LE SITE</span>
            </Link>
          </div>
        </div>
      </main>

      <CyberFooter />
    </div>
  );
}