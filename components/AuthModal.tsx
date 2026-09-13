"use client";

import React, { useState } from "react";
import { X, ShieldCheck, ArrowRight, Lock, Mail, User as UserIcon, AlertTriangle } from "lucide-react";
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
        fill="#EA4335"
        d="M12 5c1.58 0 2.99.55 4.1 1.62l3.07-3.07C17.3 1.8 14.85 1 12 1 7.5 1 3.66 3.56 1.76 7.29l3.66 2.84C6.3 7.42 8.9 5 12 5z"
      />
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.88c2.17-2 3.71-4.96 3.71-8.7z"
      />
      <path
        fill="#FBBC05"
        d="M5.42 14.87c-.24-.71-.38-1.47-.38-2.27s.14-1.56.38-2.27L1.76 7.49C.64 9.72 0 12 0 14.6s.64 4.88 1.76 7.11l3.66-2.84z"
      />
      <path
        fill="#34A853"
        d="M12 23.6c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.88c-1.07.72-2.44 1.15-4.22 1.15-3.1 0-5.7-2.42-6.58-5.63L1.76 16.17C3.66 19.9 7.5 23.6 12 23.6z"
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-md bg-[#090c10] border border-[#FF7582]/40 shadow-[0_0_50px_rgba(0,0,0,0.9)] p-6 sm:p-8 space-y-6">
        {/* Corner Reticle Accents */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#FF7582]" />
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#FF7582]" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#FF7582]" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#FF7582]" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] text-[#FF7582] tracking-widest uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#FF7582] animate-pulse" />
              PORTAIL ÉLÈVE // V2.4
            </span>
            <h3 className="text-xl sm:text-2xl font-display text-white tracking-wider">
              {mode === "login" ? "CONNEXION MEMBRE" : "CRÉATION DE COMPTE"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-white/15 text-white/60 hover:text-white hover:border-[#FF7582] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 gap-2 border border-white/10 p-1 bg-black/50 text-xs">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(null); }}
            className={`py-2 text-center transition-all ${
              mode === "login"
                ? "bg-[#FF7582] text-black font-bold shadow-[0_0_10px_rgba(255,117,130,0.3)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            SE CONNECTER
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(null); }}
            className={`py-2 text-center transition-all ${
              mode === "register"
                ? "bg-[#FF7582] text-black font-bold shadow-[0_0_10px_rgba(255,117,130,0.3)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            CRÉER UN COMPTE
          </button>
        </div>

        {/* Error / Success Feedback */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-xs text-red-400">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* OAuth Buttons (Google & Discord) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleOAuth("google")}
            disabled={loading}
            className="py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/15 text-white flex items-center justify-center gap-2 text-xs font-semibold tracking-wider transition-colors disabled:opacity-50"
          >
            <GoogleIcon className="w-4 h-4" />
            <span>GOOGLE</span>
          </button>
          <button
            type="button"
            onClick={() => handleOAuth("discord")}
            disabled={loading}
            className="py-2.5 px-3 bg-[#5865F2]/20 hover:bg-[#5865F2]/35 border border-[#5865F2]/40 text-white flex items-center justify-center gap-2 text-xs font-semibold tracking-wider transition-colors disabled:opacity-50"
          >
            <DiscordIcon className="w-4 h-4 text-[#5865F2]" />
            <span>DISCORD</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] text-white/40 tracking-widest uppercase">
            OU VIA EMAIL
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "register" && (
            <div className="space-y-1">
              <label className="text-[10px] text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                <UserIcon className="w-3 h-3 text-[#A4DE87]" />
                Pseudo Joueur
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: PoulpyViper"
                className="w-full p-2.5 bg-black border border-white/15 text-xs text-white placeholder-white/25 focus:border-[#A4DE87] focus:outline-none transition-colors"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] text-white/60 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-[#FF7582]" />
              Adresse Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="joueur@domaine.com"
              className="w-full p-2.5 bg-black border border-white/15 text-xs text-white placeholder-white/25 focus:border-[#FF7582] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-white/60 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-[#8FAFD4]" />
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full p-2.5 bg-black border border-white/15 text-xs text-white placeholder-white/25 focus:border-[#8FAFD4] focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-cyber-primary w-full py-3 text-xs font-bold tracking-wider flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span>TRAITEMENT EN COURS...</span>
            ) : (
              <>
                <span>{mode === "login" ? "SE CONNECTER" : "CONFIRMER L'INSCRIPTION"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="p-3 bg-black/60 border border-white/5 flex items-start gap-2.5 text-[10px] text-white/50 leading-normal">
          <span className="text-[#A4DE87] font-bold">ACCÈS :</span>
          <span>
            L'espace élève débloque le calendrier de coaching, le suivi VOD en continu et les fiches KovaaK's.
          </span>
        </div>
      </div>
    </div>
  );
}

