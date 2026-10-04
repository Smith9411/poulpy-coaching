'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import CyberNavbar from '@/components/CyberNavbar';
import CyberFooter from '@/components/CyberFooter';

const MAX_ATTEMPTS = 25; // 25 × 400ms ≈ 10s max d'attente de session
const POLL_INTERVAL_MS = 400;

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
        if (!cancelled) setError("La synchronisation a pris trop de temps. Réessaie depuis la page de connexion.");
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
    <div className="min-h-screen bg-[#0B0A0D] text-white selection:bg-[#CA1C30] selection:text-black font-mono flex flex-col justify-between">
      <CyberNavbar />

      <main className="flex-1 flex items-center justify-center px-4 py-28 relative">
        <div className="max-w-md w-full">
          <div className="reticle-box p-8 bg-[#121117] border border-white/10 rounded-2xl relative shadow-[0_0_60px_rgba(0,0,0,0.9)] text-center">

            {error ? (
              <div className="space-y-6">
                <div className="w-12 h-12 bg-[#CA1C30]/10 border border-[#CA1C30]/40 flex items-center justify-center mx-auto text-[#CA1C30]">
                  <AlertCircle size={28} />
                </div>
                <div>
                  <span className="text-[10px] text-[#CA1C30] font-bold tracking-widest uppercase block mb-1">
                    ERREUR D'AUTHENTIFICATION // STATUS_FAILED
                  </span>
                  <h1 className="text-xl font-display uppercase tracking-wider text-white">
                    Échec de la connexion
                  </h1>
                  <p className="text-xs text-white/60 mt-2 leading-relaxed">
                    {error}
                  </p>
                </div>
                <Link
                  href="/auth"
                  className="btn-cyber-primary w-full py-3 inline-flex items-center justify-center gap-2 text-xs"
                >
                  <ArrowLeft size={14} />
                  <span>RETOUR À LA CONNEXION</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-6 py-4">
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 border-2 border-[#CA1C30]/20 rounded-full" />
                  <Loader2 className="w-10 h-10 animate-spin text-[#CA1C30]" />
                </div>
                <div>
                  <span className="text-[10px] text-[#00B4A0] font-bold tracking-widest uppercase block mb-1">
                    SYNCHRONISATION EN COURS // SECURE_HANDSHAKE
                  </span>
                  <h1 className="text-2xl font-display uppercase tracking-wider text-white">
                    Connexion validée
                  </h1>
                  <p className="text-xs text-white/50 mt-2">
                    Vérification du profil et initialisation de la session...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <CyberFooter />
    </div>
  );
}
