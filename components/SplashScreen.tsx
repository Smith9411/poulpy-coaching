'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function SplashScreen() {
  const { isLoading: authLoading } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Si l'écran d'ouverture a déjà été affiché durant cette session d'onglet, on ne le rejoue pas
    const hasShown = sessionStorage.getItem('poulpy_splash_shown');
    if (hasShown) {
      setIsVisible(false);
      return;
    }

    // Durée minimale d'apparition (700ms) pour garantir l'effet splash d'application native
    // sans bloquer l'utilisateur
    const minTimer = setTimeout(() => {
      if (!authLoading) {
        triggerFadeOut();
      }
    }, 700);

    return () => clearTimeout(minTimer);
  }, [authLoading]);

  // Si l'authentification termine après le timer minimal
  useEffect(() => {
    if (!authLoading && isVisible && !isFadingOut) {
      triggerFadeOut();
    }
  }, [authLoading, isVisible, isFadingOut]);

  const triggerFadeOut = () => {
    setIsFadingOut(true);
    sessionStorage.setItem('poulpy_splash_shown', 'true');
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
    }, 450); // durée du fade-out CSS
    return () => clearTimeout(exitTimer);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#07090E] transition-all duration-450 ease-out select-none ${
        isFadingOut
          ? 'opacity-0 scale-105 pointer-events-none'
          : 'opacity-100 scale-100 pointer-events-auto'
      }`}
      aria-hidden={isFadingOut}
    >
      {/* Halo néon d'ambiance en arrière-plan */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-purple-600/35 via-pink-500/25 to-cyan-500/35 blur-3xl animate-pulse pointer-events-none" />

      {/* Conteneur Logo avec Lueur Néon */}
      <div className="relative flex flex-col items-center">
        {/* Lueur néon intense concentrée directement derrière le logo */}
        <div className="absolute inset-0 -m-4 rounded-3xl bg-gradient-to-br from-purple-500/60 via-pink-500/40 to-cyan-400/60 blur-xl opacity-80 animate-pulse pointer-events-none" />

        {/* L'icône du poulpe dans son squircle */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.7),0_0_80px_rgba(6,182,212,0.4)] border border-white/20 animate-bounce-subtle">
          <img
            src="/icons/icon-512x512.png"
            alt="Poulpy Logo"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Titre avec point néon */}
        <div className="mt-6 flex items-center gap-1.5">
          <span className="text-2xl sm:text-3xl font-black tracking-wider text-white">
            POULPY
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 shadow-[0_0_12px_rgba(168,85,247,1)]" />
        </div>

        {/* Barre de chargement néon stylisée */}
        <div className="mt-4 w-32 sm:w-40 h-1 bg-white/10 rounded-full overflow-hidden relative">
          <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-purple-400 to-cyan-400 rounded-full animate-shimmer" />
        </div>
      </div>

      <style jsx>{`
        @keyframes bounceSubtle {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-4px) scale(1.02);
          }
        }
        @keyframes shimmer {
          0% {
            left: -50%;
          }
          100% {
            left: 100%;
          }
        }
        .animate-bounce-subtle {
          animation: bounceSubtle 2.2s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
