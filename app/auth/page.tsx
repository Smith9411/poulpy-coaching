'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export default function Auth() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        await register(email, username, password);
        setSuccess('Inscription réussie ! Redirection...');
        setTimeout(() => window.location.href = '/', 1000);
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
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0a0a0f] py-20">
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
            className="glass-dark rounded-2xl p-8"
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
                      className="w-full pl-10 pr-4 py-3 glass rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                      placeholder="Ton pseudo (ex: Poulpy)"
                      autoComplete="username"
                      disabled={isLoading}
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
                    className="w-full pl-10 pr-4 py-3 glass rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
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
                    className="w-full pl-10 pr-12 py-3 glass rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
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
                disabled={isLoading}
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

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#0a0a0f] text-gray-500">Ou</span>
              </div>
            </div>

            {/* Discord link */}
            <a
              href="https://discord.gg/rJMg3ZZRkp"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 glass rounded-xl border border-purple-500/30 hover:bg-purple-500/10 transition-all group"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-purple-400 group-hover:text-purple-300">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.675 4.37a.067.067 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.083.083 0 0 0 .031.057 19.9 19.9 0 0 0 5.992 4.087.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 1 .106-.017c3.597 1.74 7.703 1.74 11.3 0a.077.077 0 0 1 .107.017 13.108 13.108 0 0 0 1.227 1.994.077.077 0 0 0 .083.028c3.356-1.2 6.433-3.818 8.439-7.444a.071.071 0 0 0-.032-.057A17.28 17.28 0 0 0 20.317 4.37ZM12 17.98c-2.824 0-5.313-.915-7.078-2.414.382-.17.778-.36 1.179-.57.155-.078.311-.156.467-.233a4.32 4.32 0 0 1 .924-.748 4.674 4.674 0 0 0 1.562-.81 4.56 4.56 0 0 0 1.823-.245 4.526 4.526 0 0 0 1.823.245 4.736 4.736 0 0 0 1.562.81 4.299 4.299 0 0 1 .924.748c.156.077.312.155.467.233.401.21.797.4.1.175.59 1.499-2.079 2.414-4.897 2.414Zm1.066-6.644c0 .928-.673 1.73-1.56 1.73-.835 0-1.56-.802-1.56-1.73s.725-1.73 1.56-1.73c.887 0 1.56.802 1.56 1.73Zm-4.406.844c0 .717.44 1.32 1.037 1.32.55 0 1.01-.53 1.045-1.211h-2.082c.035.68.53 1.21 1.045 1.21Zm9.382-.844c0 .928-.673 1.73-1.56 1.73-.835 0-1.56-.802-1.56-1.73s.725-1.73 1.56-1.73c.887 0 1.56.802 1.56 1.73Z"/>
              </svg>
              <span className="font-medium">Continuer avec Discord</span>
            </a>
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
              className="inline-flex items-center gap-2 px-6 py-3 glass rounded-xl font-semibold hover:bg-white/10 transition-all group"
            >
              <ArrowRight size={20} className="-rotate-90 group-hover:-translate-x-1 transition-transform" />
              Retour à l'accueil
            </Link>
          </motion.div>
        </div>
      </main>
    </>
  );
}