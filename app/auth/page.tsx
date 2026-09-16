'use client';

import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2, ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import CyberNavbar from '@/components/CyberNavbar';
import CornerBrackets from '@/components/CornerBrackets';

// Logo Google officiel
function GoogleLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#EA4335" d="M12 5c1.58 0 2.99.55 4.1 1.62l3.07-3.07C17.3 1.8 14.85 1 12 1 7.5 1 3.66 3.56 1.76 7.29l3.66 2.84C6.3 7.42 8.9 5 12 5z" />
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.88c2.17-2 3.71-4.96 3.71-8.7z" />
      <path fill="#FBBC05" d="M5.42 14.87c-.24-.71-.38-1.47-.38-2.27s.14-1.56.38-2.27L1.76 7.49C.64 9.72 0 12 0 14.6s.64 4.88 1.76 7.11l3.66-2.84z" />
      <path fill="#34A853" d="M12 23.6c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.88c-1.07.72-2.44 1.15-4.22 1.15-3.1 0-5.7-2.42-6.58-5.63L1.76 16.17C3.66 19.9 7.5 23.6 12 23.6z" />
    </svg>
  );
}

// Logo Discord officiel
function DiscordLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

export default function AuthPage() {
  const { login, register, signInWithGoogle, signInWithDiscord } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isDiscordLoading, setIsDiscordLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue lors de la connexion Google.');
      setIsGoogleLoading(false);
    }
  };

  const handleDiscordSignIn = async () => {
    setError('');
    setSuccess('');
    setIsDiscordLoading(true);
    try {
      await signInWithDiscord();
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue lors de la connexion Discord.');
      setIsDiscordLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        setSuccess('Connexion réussie ! Redirection en cours...');
        setTimeout(() => {
          window.location.href = '/';
        }, 800);
      } else {
        const { needsEmailConfirmation } = await register(email, username, password);
        if (needsEmailConfirmation) {
          setSuccess('Compte créé ! Vérifiez votre boîte mail pour confirmer votre adresse, puis connectez-vous.');
          setIsLogin(true);
        } else {
          setSuccess('Inscription réussie ! Redirection...');
          setTimeout(() => {
            window.location.href = '/';
          }, 800);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setUsername('');
  };

  return (
    <main className="min-h-screen bg-[#07090D] text-white selection:bg-[#FF7582] selection:text-black pt-28 pb-20 font-mono relative z-10">
      <CyberNavbar />

      <div className="max-w-xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#8FAFD4] hover:text-white transition-colors uppercase tracking-wider"
          >
            <ArrowLeft size={14} />
            <span>RETOUR À L'ACCUEIL</span>
          </Link>
          <span className="text-white/20">/</span>
          <span className="data-badge data-badge-laser">ESPACE MEMBRE</span>
        </div>

        {/* Main Cyber Box */}
        <div className="reticle-box p-6 sm:p-10 bg-[#090c10] border border-[#FF7582]/40 relative shadow-[0_0_60px_rgba(0,0,0,0.95)]">
          <CornerBrackets color="coral" />

          {/* Header */}
          <div className="border-b border-white/10 pb-5 mb-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 bg-[#FF7582] shadow-[0_0_10px_#FF7582] animate-pulse" />
                <span className="text-xs text-white/50 tracking-widest uppercase">
                  MODULE D'AUTHENTIFICATION // {isLogin ? '01_LOGIN' : '02_REGISTER'}
                </span>
              </div>
              <span className="text-[10px] text-[#FF7582] font-bold tracking-wider">
                SSL 256-BIT ENCRYPTED
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-display uppercase tracking-wider text-white">
              {isLogin ? (
                <>ACCÉDER AU <span className="text-[#FF7582]">QG ÉLÈVE</span></>
              ) : (
                <>CRÉER TON <span className="text-[#FF7582]">DOSSIER JOUEUR</span></>
              )}
            </h1>
            <p className="text-xs text-white/60 leading-relaxed">
              {isLogin
                ? 'Identifie-toi pour consulter tes analyses de VOD, tes créneaux et tes fiches tactiques.'
                : 'Rejoins le collectif d\'entraînement et commence ton ascension compétitive.'}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              type="button"
              onClick={() => {
                if (!isLogin) toggleMode();
              }}
              className={`py-2 text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                isLogin
                  ? 'bg-[#FF7582] text-black border-[#FF7582] shadow-[0_0_15px_rgba(255,117,130,0.35)]'
                  : 'bg-black/60 text-white/50 border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              CONNEXION
            </button>
            <button
              type="button"
              onClick={() => {
                if (isLogin) toggleMode();
              }}
              className={`py-2 text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                !isLogin
                  ? 'bg-[#FF7582] text-black border-[#FF7582] shadow-[0_0_15px_rgba(255,117,130,0.35)]'
                  : 'bg-black/60 text-white/50 border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              INSCRIPTION
            </button>
          </div>

          {/* Error & Success Feedback Alerts */}
          {error && (
            <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/40 text-red-400 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-3.5 bg-[#A4DE87]/10 border border-[#A4DE87]/40 text-[#A4DE87] text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#A4DE87]" />
              <span>{success}</span>
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={handleDiscordSignIn}
              disabled={isLoading || isGoogleLoading || isDiscordLoading}
              className="py-3 px-4 bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold uppercase tracking-wider border border-[#5865F2]/50 flex items-center justify-center gap-2.5 shadow-[0_0_15px_rgba(88,101,242,0.25)] transition-all cursor-pointer disabled:opacity-50"
            >
              <DiscordLogo className="w-4 h-4" />
              <span>{isDiscordLoading ? 'LIAISON...' : 'AVEC DISCORD'}</span>
            </button>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading || isDiscordLoading}
              className="py-3 px-4 bg-white hover:bg-gray-100 text-black text-xs font-bold uppercase tracking-wider border border-white/20 flex items-center justify-center gap-2.5 shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all cursor-pointer disabled:opacity-50"
            >
              <GoogleLogo className="w-4 h-4" />
              <span>{isGoogleLoading ? 'LIAISON...' : 'AVEC GOOGLE'}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-6">
            <div className="w-full border-t border-white/10" />
            <span className="absolute bg-[#090c10] px-3 text-[10px] text-white/40 uppercase tracking-widest">
              OU VIA IDENTIFIANTS
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {!isLogin && (
              <div>
                <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1.5">
                  PSEUDO DE JOUEUR <span className="text-[#FF7582]">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={!isLogin}
                    placeholder="Ex: TenZ_94"
                    className="w-full pl-9 pr-3 py-2.5 bg-black/60 border border-white/15 text-white placeholder-white/30 focus:border-[#FF7582] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1.5">
                ADRESSE EMAIL <span className="text-[#FF7582]">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="nom@exemple.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-black/60 border border-white/15 text-white placeholder-white/30 focus:border-[#FF7582] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1.5">
                MOT DE PASSE <span className="text-[#FF7582]">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-black/60 border border-white/15 text-white placeholder-white/30 focus:border-[#FF7582] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading || isDiscordLoading}
              className="btn-cyber-primary w-full justify-center text-xs py-3 mt-4 disabled:opacity-50 cursor-pointer"
            >
              <span>
                {isLoading
                  ? 'COMMUNICATION SÉCURISÉE...'
                  : isLogin
                  ? 'SE CONNECTER AU QG'
                  : 'CRÉER MON COMPTE'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center text-[10px] text-white/40">
            {isLogin ? (
              <span>
                Pas encore de dossier chez Poulpy ?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-[#FF7582] hover:underline font-bold cursor-pointer"
                >
                  Créer un compte
                </button>
              </span>
            ) : (
              <span>
                Déjà inscrit ?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-[#FF7582] hover:underline font-bold cursor-pointer"
                >
                  Se connecter
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}