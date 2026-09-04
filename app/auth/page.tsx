'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

// Logo Google officiel (brand guidelines — ne pas recolorer)
function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

// Logo Discord officiel (brand guidelines)
function DiscordLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 127.14 96.36" aria-hidden="true">
      <path
        fill="#fff"
        d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"
      />
    </svg>
  );
}

export default function Auth() {
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
      // En cas de succès, le navigateur quitte la page vers Google.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsGoogleLoading(false);
    }
  };

  const handleDiscordSignIn = async () => {
    setError('');
    setSuccess('');
    setIsDiscordLoading(true);
    try {
      await signInWithDiscord();
      // En cas de succès, le navigateur quitte la page vers Discord.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
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
        setSuccess('Connexion réussie ! Redirection...');
        setTimeout(() => window.location.href = '/', 1000);
      } else {
        const { needsEmailConfirmation } = await register(email, username, password);
        if (needsEmailConfirmation) {
          setSuccess('Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse, puis connecte-toi.');
          setIsLogin(true);
        } else {
          setSuccess('Inscription réussie ! Redirection...');
          setTimeout(() => window.location.href = '/', 1000);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
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
    <main className="min-h-screen page-bg py-24">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="inline-block glass px-4 py-2 rounded-full mb-4">
              <span className="text-sm text-purple-400 font-medium">
                {isLogin ? 'CONNEXION' : 'INSCRIPTION'}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              {isLogin ? 'Bienvenue de retour' : 'Crée ton compte'}
            </h1>
            <p className="text-gray-400">
              {isLogin
                ? 'Connecte-toi pour accéder à ton espace personnel'
                : 'Rejoins la communauté Poulpy Coaching'}
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card rounded-2xl p-8"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm flex items-center gap-2"
              >
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm flex items-center gap-2"
              >
                <CheckCircle2 size={16} />
                <span>{success}</span>
              </motion.div>
            )}

            {/* Boutons OAuth : Google + Discord */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isGoogleLoading || isDiscordLoading}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1 py-3.5 rounded-xl bg-white text-[#1f1f1f] font-semibold flex items-center justify-center gap-2.5 border border-white/10 hover:bg-gray-100 hover:shadow-lg hover:shadow-black/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isGoogleLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-[#1f1f1f]" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-sm">Connexion...</span>
                  </>
                ) : (
                  <>
                    <GoogleLogo />
                    <span className="text-sm">Google</span>
                  </>
                )}
              </motion.button>

              <motion.button
                type="button"
                onClick={handleDiscordSignIn}
                disabled={isLoading || isGoogleLoading || isDiscordLoading}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="flex-1 py-3.5 rounded-xl bg-[#5865F2] text-white font-semibold flex items-center justify-center gap-2.5 border border-[#5865F2]/60 hover:bg-[#4752c4] hover:shadow-lg hover:shadow-[#5865F2]/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isDiscordLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-sm">Connexion...</span>
                  </>
                ) : (
                  <>
                    <DiscordLogo />
                    <span className="text-sm">Discord</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Séparateur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="my-6 flex items-center gap-4"
              role="separator"
              aria-label="ou continuer par email"
            >
              <span className="flex-1 h-px bg-white/10" />
              <span className="text-sm text-gray-500 uppercase tracking-wider">ou par email</span>
              <span className="flex-1 h-px bg-white/10" />
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                    Pseudo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required={!isLogin}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-inherit placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                      placeholder="Ton pseudo (ex: Poulpy)"
                      autoComplete="username"
                      disabled={isLoading || isGoogleLoading}
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-inherit placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                    placeholder="ton@email.com"
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-inherit placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                    placeholder="••••••••"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {isLogin ? 'Connexion...' : 'Inscription...'}
                  </>
                ) : (
                  <>
                    {isLogin ? 'Se connecter' : 'S\'inscrire'}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            {/* Toggle mode */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 text-center text-gray-400"
            >
              {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
              <button
                onClick={toggleMode}
                className="ml-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                {isLogin ? 'S\'inscrire' : 'Se connecter'}
              </button>
            </motion.p>
          </motion.div>

          {/* Back to home */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-8"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 card rounded-xl font-semibold hover:bg-white/10 transition-all group"
            >
              <ArrowRight size={20} className="-rotate-90 group-hover:-translate-x-1 transition-transform" />
              Retour à l&apos;accueil
            </Link>
          </motion.div>
        </div>
      </main>
  );
}