'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, ShieldCheck, Loader2 } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const checkoutInstanceRef = useRef<StripeEmbeddedCheckout | null>(null);

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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop sombre flouté */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window Cyberpunk */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-[#0D0F12] border border-white/10 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden z-10 flex flex-col my-auto max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#121418]/90">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#CA1C30]/15 border border-[#CA1C30]/30 flex items-center justify-center text-[#CA1C30]">
                <Lock size={15} />
              </div>
              <div>
                <h3 className="text-sm font-display font-bold text-white tracking-wider flex items-center gap-2">
                  <span>PAIEMENT SÉCURISÉ</span>
                  {planPrice && (
                    <span className="text-xs px-2 py-0.5 rounded bg-[#00B4A0]/20 text-[#00B4A0] border border-[#00B4A0]/30 font-mono">
                      {planPrice}
                    </span>
                  )}
                </h3>
                <p className="text-[11px] font-mono text-white/50">
                  {planName || 'Coaching E-sport officiel Poulpy'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Fermer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="relative p-4 sm:p-6 flex-1 overflow-y-auto bg-[#0D0F12] min-h-[480px]">
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0D0F12] z-20 text-white/50">
                <Loader2 className="w-8 h-8 animate-spin text-[#CA1C30]" />
                <span className="text-xs font-mono">Initialisation du terminal Stripe...</span>
              </div>
            )}

            {error ? (
              <div className="py-12 text-center text-red-400 space-y-3 font-mono text-xs">
                <p>{error}</p>
                <button
                  onClick={onClose}
                  className="btn-cyber-primary py-2 px-4 text-xs font-mono"
                >
                  RETOUR
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
          <div className="px-6 py-3 border-t border-white/5 bg-[#121418]/60 flex items-center justify-between text-[10px] font-mono text-white/40">
            <div className="flex items-center gap-1.5 text-[#00B4A0]">
              <ShieldCheck size={13} />
              <span>Chiffrement SSL 256 bits Stripe</span>
            </div>
            <span>Apple Pay · Google Pay · Cartes Bancaires</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
