'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const MAX_ATTEMPTS = 25; // 25 × 400ms ≈ 10s max d'attente de session
const POLL_INTERVAL_MS = 400;

// Retour OAuth Google : Supabase renvoie la session dans l'URL (#access_token=...),
// détectée automatiquement par supabase-js (detectSessionInUrl).
// On attend la session puis on redirige : pseudo manquant → /auth/complete, sinon /.
export default function AuthCallback() {
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const checkSession = async () => {
      if (cancelled) return;
      try {
        const { data } = await supabase.auth.getSession();

        // Supabase peut renvoyer une erreur OAuth dans la query (?error=...) ou le hash
        const url = new URL(window.location.href);
        const urlError = url.searchParams.get('error_description') || url.hash.match(/error_description=([^&]+)/)?.[1];
        if (urlError) {
          setError(decodeURIComponent(urlError.replace(/\+/g, ' ')));
          return;
        }

        if (data.session) {
          const meta = data.session.user.user_metadata || {};
          let hasUsername = typeof meta.username === 'string' && meta.username.trim() !== '';
          if (!hasUsername) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', data.session.user.id)
              .single();
            hasUsername = typeof profile?.username === 'string' && profile.username.trim() !== '';
          }
          if (cancelled) return;
          window.location.replace(hasUsername ? '/' : '/auth/complete');
          return;
        }
      } catch {
        // session pas encore prête : on retente
      }
      attempts += 1;
      if (attempts >= MAX_ATTEMPTS) {
        if (!cancelled) setError("La connexion a pris trop de temps. Réessaie depuis la page de connexion.");
        return;
      }
      timerRef.current = setTimeout(checkSession, POLL_INTERVAL_MS);
    };

    checkSession();

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <main className="min-h-screen page-bg py-24 flex items-center justify-center px-4">
      {error ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card rounded-2xl p-10 max-w-md w-full text-center"
        >
          <AlertCircle size={48} className="mx-auto mb-6 text-purple-400" />
          <h1 className="text-2xl font-bold mb-3">Connexion Google échouée</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <Link
            href="/auth"
            className="inline-flex items-center justify-center w-full py-3.5 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            Retour à la connexion
          </Link>
        </motion.div>
      ) : (
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h1 className="text-xl font-semibold text-gray-200">Connexion avec Google...</h1>
          <p className="text-gray-500 mt-2">Un instant, on te redirige.</p>
        </div>
      )}
    </main>
  );
}
