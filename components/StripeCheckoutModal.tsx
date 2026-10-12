'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ShieldCheck } from 'lucide-react';
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
  planName,
  planPrice,
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

        {/* Boîte Modale Élégante Poulpy */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-xl z-10 flex flex-col my-auto bg-[#0E1015] border border-white/15 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden max-h-[92vh]"
        >
          {/* En-tête avec Logo Poulpy et Bouton Fermer */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-[#14161D] border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/10 p-1 flex items-center justify-center shrink-0">
                <img
                  src="/poulpy-octopus.png"
                  alt="Poulpy Coaching"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-display font-bold text-white tracking-wider">
                    POULPY COACHING
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00B4A0] animate-pulse" />
                </div>
                <span className="text-[11px] font-mono text-white/50 truncate max-w-[240px] sm:max-w-xs">
                  {planName || 'Coaching E-sport'}{planPrice ? ` · ${planPrice}` : ''}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/40 hover:text-[#CA1C30] hover:bg-[#CA1C30]/15 transition-colors cursor-pointer shrink-0"
              title="Fermer et retourner au formulaire"
            >
              <X size={18} />
            </button>
          </div>

          {/* Module Stripe bord à bord — sans cadre parasite */}
          <div className="relative flex-1 overflow-y-auto bg-white min-h-[460px]">
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#14161D] z-20 text-white/60">
                <Loader2 className="w-8 h-8 animate-spin text-[#CA1C30]" />
                <span className="text-xs font-mono">Connexion sécurisée à Stripe...</span>
              </div>
            )}

            {error ? (
              <div className="py-16 px-6 text-center text-red-400 space-y-4 font-mono text-xs bg-[#14161D]">
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
                className="w-full min-h-[460px]"
              />
            )}
          </div>

          {/* Pied de page discret : Paiement chiffré sans box de vignette */}
          <div className="px-4 py-2.5 bg-[#14161D] border-t border-white/10 flex items-center justify-center gap-1.5 text-[11px] font-mono text-white/40 shrink-0">
            <ShieldCheck size={13} className="text-[#00B4A0]" />
            <span>Paiement chiffré SSL 256 bits · Stripe Checkout</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
