"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Lock, Mail, User as UserIcon, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function DiscordIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

export function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register, signInWithGoogle, signInWithDiscord } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
        onClose();
      } else {
        const res = await register(email, username, password);
        if (res.needsEmailConfirmation) {
          setSuccessMsg("Un email de confirmation vous a été envoyé. Veuillez valider votre compte.");
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue lors de l'authentification.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "discord") => {
    setError(null);
    setLoading(true);
    try {
      if (provider === "google") await signInWithGoogle();
      if (provider === "discord") await signInWithDiscord();
    } catch (err: any) {
      setError(err?.message || `Erreur de connexion via ${provider}.`);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md bg-[#121117] border border-white/10 shadow-[0_20px_70px_rgba(0,0,0,0.95)] p-6 sm:p-8 space-y-6 rounded-3xl overflow-hidden"
      >
        {/* Subtle Ambient Top Border Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#CA1C30]/50 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] text-[#CA1C30] tracking-widest uppercase flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 bg-[#CA1C30] animate-pulse rounded-full" />
              PORTAIL // ESPACE MEMBRE
            </span>
            <h3 className="text-xl sm:text-2xl font-display text-[#F5F4F0] tracking-wider">
              {mode === "login" ? "CONNEXION" : "CRÉATION DE COMPTE"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 border border-white/10 text-white/50 hover:text-white hover:border-[#CA1C30] transition-colors cursor-pointer rounded-xl bg-white/5"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switch Tabs with Smooth Sliding Pill */}
        <div className="relative grid grid-cols-2 p-1 bg-[#0B0A0D] border border-white/10 rounded-2xl text-xs">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(null); }}
            className={`relative z-10 py-2.5 text-center font-bold tracking-wider transition-colors duration-200 cursor-pointer rounded-xl ${
              mode === "login" ? "text-black" : "text-[#F5F4F0]/60 hover:text-white"
            }`}
          >
            {mode === "login" && (
              <motion.div
                layoutId="auth-mode-pill"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                className="absolute inset-0 bg-[#CA1C30] rounded-xl shadow-[0_0_15px_rgba(202,28,48,0.4)] z-[-1]"
              />
            )}
            SE CONNECTER
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(null); }}
            className={`relative z-10 py-2.5 text-center font-bold tracking-wider transition-colors duration-200 cursor-pointer rounded-xl ${
              mode === "register" ? "text-black" : "text-[#F5F4F0]/60 hover:text-white"
            }`}
          >
            {mode === "register" && (
              <motion.div
                layoutId="auth-mode-pill"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                className="absolute inset-0 bg-[#CA1C30] rounded-xl shadow-[0_0_15px_rgba(202,28,48,0.4)] z-[-1]"
              />
            )}
            CRÉER UN COMPTE
          </button>
        </div>

        {/* Error / Success Feedback */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-xs text-red-400 rounded-xl"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2 text-xs text-emerald-400 rounded-xl"
          >
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {/* OAuth Buttons (Google & Discord) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleOAuth("google")}
            disabled={loading}
            className="py-2.5 px-3 bg-[#1A1822] hover:bg-[#221f2d] border border-white/10 hover:border-white/30 text-[#F5F4F0] flex items-center justify-center gap-2 text-xs font-semibold tracking-wider transition-all duration-200 disabled:opacity-50 cursor-pointer rounded-xl active:scale-95"
          >
            <GoogleIcon className="w-4 h-4 shrink-0" />
            <span>GOOGLE</span>
          </button>
          <button
            type="button"
            onClick={() => handleOAuth("discord")}
            disabled={loading}
            className="py-2.5 px-3 bg-[#5865F2]/15 hover:bg-[#5865F2]/25 border border-[#5865F2]/30 hover:border-[#5865F2]/60 text-white flex items-center justify-center gap-2 text-xs font-semibold tracking-wider transition-all duration-200 disabled:opacity-50 cursor-pointer rounded-xl active:scale-95"
          >
            <DiscordIcon className="w-4 h-4 text-[#5865F2] shrink-0" />
            <span>DISCORD</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] text-[#F5F4F0]/40 tracking-widest uppercase font-semibold">
            OU VIA EMAIL
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Form with Smooth Animated Transition */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === "login" ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "login" ? 10 : -10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="space-y-3.5"
            >
              {mode === "register" && (
                <div className="space-y-1">
                  <label className="text-[10px] text-[#F5F4F0]/60 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                    <UserIcon className="w-3 h-3 text-[#00B4A0]" />
                    Pseudo Joueur
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ex: PoulpyViper"
                    className="w-full p-2.5 bg-[#0B0A0D] border border-white/10 text-xs text-[#F5F4F0] placeholder-white/25 focus:border-[#00B4A0] focus:outline-none transition-colors rounded-xl"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] text-[#F5F4F0]/60 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                  <Mail className="w-3 h-3 text-[#CA1C30]" />
                  Adresse Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="joueur@domaine.com"
                  className="w-full p-2.5 bg-[#0B0A0D] border border-white/10 text-xs text-[#F5F4F0] placeholder-white/25 focus:border-[#CA1C30] focus:outline-none transition-colors rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#F5F4F0]/60 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                  <Lock className="w-3 h-3 text-[#00B4A0]" />
                  Mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full p-2.5 bg-[#0B0A0D] border border-white/10 text-xs text-[#F5F4F0] placeholder-white/25 focus:border-[#00B4A0] focus:outline-none transition-colors rounded-xl"
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Submit Button with Signature Cyber Skew Reveal Animation */}
          <button
            type="submit"
            disabled={loading}
            className="btn-cyber-primary w-full py-3 text-xs font-bold tracking-wider flex items-center justify-center mt-3 cursor-pointer rounded-xl"
          >
            <span>
              {loading
                ? "TRAITEMENT EN COURS..."
                : mode === "login"
                ? "SE CONNECTER"
                : "CONFIRMER L'INSCRIPTION"}
            </span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
