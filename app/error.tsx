'use client';

import { useEffect, useState } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [details, setDetails] = useState<string>('');

  useEffect(() => {
    console.error('[ErrorBoundary caught error]:', error);
    setDetails(error?.stack || error?.message || String(error));
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0B0A0D] text-[#F5F4F0] flex flex-col items-center justify-center p-6 text-center font-mono">
      <div className="w-16 h-16 rounded-full bg-[#CA1C30]/20 border border-[#CA1C30] flex items-center justify-center text-[#CA1C30] text-2xl font-bold mb-4 animate-pulse">
        !
      </div>
      <h2 className="text-xl font-bold mb-2 tracking-wider">ERREUR D'AFFICHAGE DÉTECTÉE</h2>
      <p className="text-xs text-white/60 mb-4 max-w-md">
        Une erreur s'est produite lors de l'affichage de cette page :
      </p>

      <div className="max-w-2xl w-full bg-black/80 border border-red-500/40 rounded-xl p-4 text-left font-mono text-xs text-red-300 overflow-auto my-3 max-h-60">
        <div className="font-bold text-red-400 mb-1">{error?.name || 'Error'}: {error?.message}</div>
        {error?.digest && <div className="text-gray-400 text-[10px] mb-2">Digest: {error.digest}</div>}
        {details && <pre className="text-[11px] text-gray-300 whitespace-pre-wrap">{details}</pre>}
      </div>

      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 bg-[#CA1C30] hover:bg-[#a81425] text-white text-xs font-bold uppercase rounded-full transition-all cursor-pointer shadow-[0_0_20px_rgba(202,28,48,0.4)]"
        >
          RÉESSAYER
        </button>
        <button
          onClick={() => {
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then((r) => r.forEach(x => x.unregister()));
            }
            if ('caches' in window) {
              caches.keys().then((k) => k.forEach(x => caches.delete(x)));
            }
            window.location.reload();
          }}
          className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase rounded-full transition-all cursor-pointer"
        >
          VIDER LE CACHE ET RECHARGER
        </button>
      </div>
    </div>
  );
}
