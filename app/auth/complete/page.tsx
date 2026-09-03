'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { User, Check, X, AtSign, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const USERNAME_MIN = 2;
const USERNAME_MAX = 20;
// Lettres (accents inclus), chiffres, espace, tiret, underscore, point
const USERNAME_REGEX = /^[a-zA-Z0-9À-ÿ_.\- ]+$/;

type Availability = 'idle' | 'checking' | 'available' | 'taken';

export default function CompleteProfile() {
  const { user, isLoading: authLoading, updateUsername, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Availability>('idle');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trimmed = username.trim();
  const isFormatValid =
    trimmed.length >= USERNAME_MIN &&
    trimmed.length <= USERNAME_MAX &&
    USERNAME_REGEX.test(trimmed);

  // Gardes : pas de session → /auth ; pseudo déjà choisi → accueil
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.replace('/auth');
    } else if (!authLoading && user && !user.needsUsername && !isSubmitting) {
      window.location.replace('/');
    }
  }, [authLoading, user, isSubmitting]);

  // Suggestions de pseudo : préfixe email + nom Google (full_name / name)
  useEffect(() => {
    if (!user) return;
    supabase.auth.getSession().then(({ data }) => {
      const meta = (data.session?.user.user_metadata || {}) as Record<string, unknown>;
      const emailPrefix = user.email.split('@')[0] || '';
      const googleName = [meta.full_name, meta.name].find(
        (v): v is string => typeof v === 'string' && v.trim() !== ''
      );
      const sanitize = (value: string) =>
        value.replace(/\s+/g, ' ').trim().slice(0, USERNAME_MAX);
      const candidates = [sanitize(emailPrefix), googleName ? sanitize(googleName) : ''];
      const unique = Array.from(new Set(candidates.filter((c) => c.length >= USERNAME_MIN)));
      setSuggestions(unique.slice(0, 3));
    });
  }, [user]);

  // Vérification de dispo du pseudo (debounce) — fetch annulable.
  // Les setState vivent dans le timer : jamais sur le chemin synchrone de l'effet.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    // invalide → retour à idle immédiat (timer 0) ; valide → debounce avant le fetch
    const delay = isFormatValid && user ? 450 : 0;
    debounceRef.current = setTimeout(async () => {
      if (!isFormatValid || !user) {
        setAvailability('idle');
        return;
      }
      setAvailability('checking');
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error('Non authentifié');
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(trimmed)}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const result = await res.json();
        setAvailability(result.available ? 'available' : 'taken');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          // API indisponible : on ne bloque pas l'inscription
          setAvailability('available');
        }
      }
    }, delay);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [trimmed, isFormatValid, user]);

  // Cleanup du timer de redirection
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!isFormatValid) {
      setError(`Le pseudo doit faire entre ${USERNAME_MIN} et ${USERNAME_MAX} caractères.`);
      return;
    }
    if (availability === 'taken') {
      setError('Ce pseudo est déjà pris, choisis-en un autre.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUsername(trimmed);
      setSuccess('Pseudo enregistré ! Redirection...');
      redirectTimerRef.current = setTimeout(() => window.location.replace('/'), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <main className="min-h-screen page-bg py-24 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const statusIcon =
    availability === 'checking' ? (
      <Loader2 size={18} className="animate-spin text-gray-500" />
    ) : availability === 'available' ? (
      <Check size={18} className="text-green-400" />
    ) : availability === 'taken' ? (
      <X size={18} className="text-red-400" />
    ) : null;

  const statusText: Record<Availability, string> = {
    idle: isFormatValid ? '' : `${USERNAME_MIN} à ${USERNAME_MAX} caractères — lettres, chiffres, - _ .`,
    checking: 'Vérification de la disponibilité...',
    available: 'Pseudo disponible !',
    taken: 'Ce pseudo est déjà pris.',
  };

  const canSubmit =
    isFormatValid && availability === 'available' && !isSubmitting && !success;

  return (
    <main className="min-h-screen page-bg py-24 relative overflow-hidden">
      {/* Halos décoratifs aux couleurs de la marque */}
      <div className="absolute -top-24 left-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-block glass px-4 py-2 rounded-full mb-6">
            <span className="text-sm text-purple-400 font-medium flex items-center gap-2">
              <Sparkles size={14} />
              DERNIÈRE ÉTAPE
            </span>
          </div>

          {/* Avatar Google avec anneau dégradé */}
          <div className="inline-block p-[3px] rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 mb-5">
            <div className="w-20 h-20 rounded-full bg-[#13161e] flex items-center justify-center overflow-hidden">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-3xl font-bold text-gradient">{user.initial}</span>
              )}
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-3">Bienvenue !</h1>
          <p className="text-gray-400">
            Ton compte Google est connecté. Choisis ton pseudo pour rejoindre la communauté.
          </p>
          <p className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-1.5">
            <AtSign size={14} />
            {user.email}
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="card rounded-2xl p-8"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm flex items-center gap-2"
            >
              <Check size={16} />
              <span>{success}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Ton pseudo de joueur
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                  required
                  maxLength={USERNAME_MAX + 10}
                  className="w-full pl-10 pr-11 py-3.5 rounded-xl bg-white/5 border border-white/10 text-inherit placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                  placeholder="Ton pseudo (ex: Poulpy)"
                  autoComplete="username"
                  disabled={isSubmitting}
                />
                {statusIcon && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">{statusIcon}</span>
                )}
              </div>
              <p
                className={`mt-2 text-xs ${
                  availability === 'taken'
                    ? 'text-red-400'
                    : availability === 'available'
                      ? 'text-green-400'
                      : 'text-gray-500'
                }`}
                aria-live="polite"
              >
                {statusText[availability]}
              </p>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Suggestions :</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setUsername(s)}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 rounded-full glass text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Enregistrement...
                </>
              ) : (
                'Confirmer mon pseudo'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            Ce pseudo identifie ton profil auprès de ton coach.
          </p>
        </motion.div>

        {/* Changer de compte */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <button
            onClick={() => logout().then(() => window.location.replace('/auth'))}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Ce n&apos;est pas le bon compte ? Se déconnecter
          </button>
        </motion.div>
      </div>
    </main>
  );
}
