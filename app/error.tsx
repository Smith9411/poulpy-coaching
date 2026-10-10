'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[ErrorBoundary caught error]:', error);
    // Auto reload on chunk / service-worker load error
    if (
      typeof window !== 'undefined' &&
      (error?.name === 'ChunkLoadError' ||
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('turbopack'))
    ) {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) reg.unregister();
        });
      }
      if ('caches' in window) {
        caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
      }
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0B0A0D] text-[#F5F4F0] flex flex-col items-center justify-center p-6 text-center font-mono">
      <div className="w-16 h-16 rounded-full bg-[#CA1C30]/20 border border-[#CA1C30] flex items-center justify-center text-[#CA1C30] text-2xl font-bold mb-4 animate-pulse">
        !
      </div>
      <h2 className="text-xl font-bold mb-2 tracking-wider">MISE À JOUR DÉTECTÉE</h2>
      <p className="text-xs text-white/60 mb-6 max-w-md">
        Une nouvelle version de Poulpy Coaching est disponible. Cliquez ci-dessous pour actualiser.
      </p>
      <button
        onClick={() => {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
              for (const reg of registrations) reg.unregister();
            });
          }
          if ('caches' in window) {
            caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
          }
          window.location.reload();
        }}
        className="px-6 py-2.5 bg-[#CA1C30] hover:bg-[#a81425] text-white text-xs font-bold uppercase rounded-full transition-all cursor-pointer shadow-[0_0_20px_rgba(202,28,48,0.4)]"
      >
        ACTUALISER LA PAGE
      </button>
    </div>
  );
}
