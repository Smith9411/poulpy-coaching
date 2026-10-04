'use client';

import { useEffect, useRef, useState } from 'react';
import { User, Check, X, AtSign, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import CyberNavbar from '@/components/CyberNavbar';
import CyberFooter from '@/components/CyberFooter';

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
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

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
          setAvailability('available');
        }
      }
    }, delay);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [trimmed, isFormatValid, user]);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormatValid || availability !== 'available' || isSubmitting) return;

    setError('');
    setIsSubmitting(true);
    try {
      await updateUsername(trimmed);
      setSuccess('Pseudo enregistré ! Redirection vers le QG...');
      redirectTimerRef.current = setTimeout(() => {
        window.location.replace('/');
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(msg);
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <main className="min-h-screen bg-[#0B0A0D] py-24 flex items-center justify-center font-mono">
        <Loader2 className="w-10 h-10 animate-spin text-[#CA1C30]" />
      </main>
    );
  }

  const statusIcon =
    availability === 'checking' ? (
      <Loader2 size={16} className="animate-spin text-white/40" />
    ) : availability === 'available' ? (
      <Check size={16} className="text-[#00B4A0]" />
    ) : availability === 'taken' ? (
      <X size={16} className="text-[#CA1C30]" />
    ) : null;

  const statusText: Record<Availability, string> = {
    idle: isFormatValid ? '' : `${USERNAME_MIN} à ${USERNAME_MAX} car. — lettres, chiffres, - _ .`,
    checking: 'Vérification de la disponibilité...',
    available: 'Pseudo disponible !',
    taken: 'Ce pseudo est déjà pris.',
  };

  const canSubmit = isFormatValid && availability === 'available' && !isSubmitting && !success;

  return (
    <div className="min-h-screen bg-[#0B0A0D] text-white selection:bg-[#CA1C30] selection:text-black font-mono flex flex-col justify-between">
      <CyberNavbar />

      <main className="flex-1 flex items-center justify-center px-4 py-28 relative">
        <div className="max-w-md w-full">
          <div className="reticle-box p-6 sm:p-10 bg-[#121117] border border-white/10 rounded-2xl relative shadow-[0_0_60px_rgba(0,0,0,0.95)]">

            {/* Header */}
            <div className="border-b border-white/10 pb-5 mb-6 text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-[10px] text-[#00B4A0] tracking-widest uppercase">
                <span className="w-1.5 h-1.5 bg-[#00B4A0] animate-pulse" />
                DERNIÈRE ÉTAPE // INITIALISATION DU JOUEUR
              </div>

              {/* Avatar Google */}
              <div className="w-20 h-20 mx-auto border-2 border-[#CA1C30]/40 p-1 bg-black/60 relative">
                <div className="w-full h-full bg-[#121117] flex items-center justify-center overflow-hidden">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold font-display text-white">{user.initial}</span>
                  )}
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wider text-white">
                CHOISIS TON <span className="text-[#CA1C30]">PSEUDO</span>
              </h1>
              <p className="text-xs text-white/60 leading-relaxed">
                Ton compte Google est validé. Définis ton identifiant pour tes fiches et tes sessions.
              </p>
              <p className="text-[11px] text-white/40 flex items-center justify-center gap-1.5 font-mono">
                <AtSign size={13} />
                {user.email}
              </p>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-3 bg-[#00B4A0]/10 border border-[#00B4A0]/30 text-[#00B4A0] text-xs flex items-center gap-2">
                <Check size={15} />
                <span>{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                  PSEUDO DE JOUEUR
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                    required
                    maxLength={USERNAME_MAX + 10}
                    className="w-full pl-9 pr-9 py-3 bg-black/60 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#CA1C30] transition-colors"
                    placeholder="Ex: Poulpy, Neo, Valkyrie"
                    autoComplete="username"
                    disabled={isSubmitting}
                  />
                  {statusIcon && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">{statusIcon}</span>
                  )}
                </div>
                <p
                  className={`mt-1.5 text-[11px] ${
                    availability === 'taken'
                      ? 'text-[#CA1C30]'
                      : availability === 'available'
                        ? 'text-[#00B4A0]'
                        : 'text-white/40'
                  }`}
                  aria-live="polite"
                >
                  {statusText[availability]}
                </p>
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider mb-2">Suggestions :</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setUsername(s)}
                        disabled={isSubmitting}
                        className="px-2.5 py-1 bg-white/5 border border-white/15 hover:border-white/40 hover:bg-white/10 text-xs text-white/80 transition-colors disabled:opacity-50 cursor-pointer"
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
                className="btn-cyber-primary w-full py-3.5 flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ENREGISTREMENT...</span>
                  </>
                ) : (
                  <>
                    <span>CONFIRMER MON IDENTITÉ</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            {/* Logout button */}
            <div className="text-center mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => logout().then(() => window.location.replace('/auth'))}
                className="text-[11px] text-white/40 hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
              >
                Ce n'est pas le bon compte ? Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </main>

      <CyberFooter />
    </div>
  );
}
