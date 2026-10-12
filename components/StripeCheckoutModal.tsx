'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
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
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto pt-20 pb-8 font-mono">
        {/* Backdrop sombre flouté */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window Cyberpunk — Fond carbone adouci */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-[#1E2028] border border-white/20 rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.7)] overflow-hidden z-10 flex flex-col my-auto max-h-[86vh]"
        >
          {/* Header épuré sans vignette */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#252833]">
            <div>
              <h3 className="text-sm font-display font-bold text-white tracking-wider flex items-center gap-2">
                <span>PAIEMENT SÉCURISÉ</span>
                {planPrice && (
                  <span className="text-sm font-mono text-[#00B4A0] font-bold">
                    · {planPrice}
                  </span>
                )}
              </h3>
              <p className="text-[11px] font-mono text-white/50 truncate max-w-[280px] sm:max-w-md mt-0.5">
                {planName || 'Coaching E-sport officiel Poulpy'}
              </p>
            </div>

            {/* Croix de fermeture épurée qui se colore en rouge au survol */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/40 hover:text-[#CA1C30] hover:bg-[#CA1C30]/10 transition-colors cursor-pointer shrink-0"
              title="Fermer et retourner au formulaire"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="relative p-3 sm:p-5 flex-1 overflow-y-auto bg-[#1E2028] min-h-[480px]">
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1E2028] z-20 text-white/50">
                <Loader2 className="w-8 h-8 animate-spin text-[#CA1C30]" />
                <span className="text-xs font-mono">Connexion sécurisée à Stripe...</span>
              </div>
            )}

            {error ? (
              <div className="py-12 text-center text-red-400 space-y-4 font-mono text-xs">
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
                className="w-full min-h-[460px] rounded-xl overflow-hidden"
              />
            )}
          </div>

          {/* Footer Security Badges */}
          <div className="px-5 sm:px-6 py-3 border-t border-white/10 bg-[#252833] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-white/40">
            <div className="flex items-center gap-1.5 text-[#00B4A0]">
              <ShieldCheck size={13} />
              <span>Chiffrement SSL 256 bits · Stripe Checkout</span>
            </div>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white/80 transition-colors underline cursor-pointer text-[10px]"
            >
              Annuler et modifier les informations
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
