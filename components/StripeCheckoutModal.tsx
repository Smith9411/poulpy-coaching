'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { loadStripe, StripeEmbeddedCheckout } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

interface StripeCheckoutModalProps {
  isOpen: boolean;
  clientSecret: string | null;
  planName?: string;
  planPrice?: string;
  onClose: () => void;
}

export default function StripeCheckoutModal({
  isOpen,
  clientSecret,
  onClose,
}: StripeCheckoutModalProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const checkoutInstanceRef = useRef<StripeEmbeddedCheckout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    if (!isOpen || !clientSecret) {
      if (checkoutInstanceRef.current) {
        checkoutInstanceRef.current.destroy();
        checkoutInstanceRef.current = null;
      }
      setLoading(true);
      setError(null);
      return;
    }

    const initCheckout = async () => {
      setLoading(true);
      setError(null);
      try {
        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error('Impossible de charger le module de paiement Stripe.');
        }

        if (isCancelled) return;

        // Détruire l'ancienne instance si elle existe
        if (checkoutInstanceRef.current) {
          checkoutInstanceRef.current.destroy();
          checkoutInstanceRef.current = null;
        }

        const stripeAny = stripe as any;
        const initCheckoutFn = stripeAny.createEmbeddedCheckoutPage || stripeAny.initEmbeddedCheckout;
        if (!initCheckoutFn) {
          throw new Error('Méthode Embedded Checkout non disponible sur cette version de Stripe.');
        }

        const embeddedCheckout: StripeEmbeddedCheckout = await initCheckoutFn.call(stripe, {
          clientSecret,
        });

        if (isCancelled) {
          embeddedCheckout.destroy();
          return;
        }

        checkoutInstanceRef.current = embeddedCheckout;

        if (containerRef.current) {
          embeddedCheckout.mount(containerRef.current);
        }
        setLoading(false);
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Erreur chargement Embedded Checkout:', err);
          setError(err?.message || 'Erreur lors du chargement du module de paiement sécurisé.');
          setLoading(false);
        }
      }
    };

    initCheckout();

    return () => {
      isCancelled = true;
      if (checkoutInstanceRef.current) {
        checkoutInstanceRef.current.destroy();
        checkoutInstanceRef.current = null;
      }
    };
  }, [isOpen, clientSecret]);

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-mono">
        {/* Backdrop sombre flouté */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Conteneur 100% épuré — ZÉRO boîte grise ni double bordure autour de Stripe */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-lg z-10 flex flex-col my-auto"
        >
          {/* Bouton FERMER propre flottant au-dessus */}
          <div className="w-full flex justify-end mb-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 hover:bg-[#CA1C30]/25 text-white/70 hover:text-[#CA1C30] border border-white/20 transition-all text-xs cursor-pointer backdrop-blur-md shadow-lg"
              title="Fermer et retourner au formulaire"
            >
              <X size={15} />
              <span className="text-[11px] font-mono tracking-wider">FERMER</span>
            </button>
          </div>

          {/* Module Stripe pur */}
          <div className="relative w-full rounded-2xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.9)] min-h-[460px]">
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#181A20] z-20 text-white/50 rounded-2xl">
                <Loader2 className="w-8 h-8 animate-spin text-[#CA1C30]" />
                <span className="text-xs font-mono">Connexion sécurisée à Stripe...</span>
              </div>
            )}

            {error ? (
              <div className="py-16 px-6 text-center text-red-400 space-y-4 font-mono text-xs bg-[#181A20] rounded-2xl border border-white/10">
                <p>{error}</p>
                <button
                  onClick={onClose}
                  className="btn-cyber-primary py-2 px-5 text-xs font-mono"
                >
                  RETOURNER AU FORMULAIRE
                </button>
              </div>
            ) : (
              <div
                ref={containerRef}
                id="stripe-checkout-container"
                className="w-full min-h-[460px] rounded-2xl overflow-hidden"
              />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
