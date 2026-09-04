'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import BookingConfirmation from './booking/BookingConfirmation';
import BookingFormStep from './booking/BookingFormStep';
import BookingPlansStep from './booking/BookingPlansStep';
import BookingSlotsStep, { SelectedSlotDetails } from './booking/BookingSlotsStep';
import { BookingFormData, Plan } from './booking/types';

const PLANS: Plan[] = [
  {
    id: 'session',
    name: 'SESSION DÉCOUVERTE',
    price: '29€',
    duration: '30 min',
    description: 'Idéal pour un premier diagnostic rapide et précis',
    features: [
      'Analyse VOD express (15 min)',
      '3 axes d\'amélioration prioritaires',
      'Routine aim de base (5 exercices)',
      'Compte-rendu écrit',
    ],
    color: 'linear-gradient(135deg, #9333ea, #a855f7)',
    popular: false,
  },
  {
    id: 'pro',
    name: 'COACHING PRO',
    price: '49€',
    duration: '60 min',
    description: 'Le standard pour progresser durablement et monter de rank',
    features: [
      'Analyse VOD complète (30 min)',
      'Coaching live en jeu (30 min)',
      'Travail aim & positionnement personnalisé',
      'Plan de progression 4 semaines',
      'Suivi Discord 7j/7',
    ],
    color: 'linear-gradient(135deg, #0891b2, #3b82f6)',
    popular: true,
  },
  {
    id: 'performance',
    name: 'PERFORMANCE MAX',
    price: '89€',
    duration: '90 min',
    description: 'Pour les compétiteurs et objectifs ambitieux (rank up, tournois)',
    features: [
      'Tout le pack PRO inclus',
      'VOD review approfondie (45 min)',
      'Session live complète (45 min)',
      'Aim training avancé KovaaK\'s & Aimlabs',
      'Plan personnalisé 8 semaines',
      'Préparation mentale & clutch',
      'Disponibilité prioritaire',
    ],
    color: 'linear-gradient(135deg, #9333ea, #06b6d4)',
    popular: false,
  },
];

const STEPS = [
  { id: 1, label: 'Formule' },
  { id: 2, label: 'Créneau' },
  { id: 3, label: 'Infos' },
  { id: 4, label: 'Confirmé' },
];

export default function Booking() {
  const [step, setStep] = useState(1);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedSlotDetails, setSelectedSlotDetails] = useState<SelectedSlotDetails | null>(null);
  const [slotLabel, setSlotLabel] = useState<string>('');
  const [formData, setFormData] = useState<BookingFormData | null>(null);

  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId) || null;

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setStep(2);
  };

  const handleSelectSlot = (details: SelectedSlotDetails) => {
    setSelectedSlot(details.slotId || `${details.bookingDate}-${details.bookingTime}`);
    setSlotLabel(details.slotLabel);
    setSelectedSlotDetails(details);
    setStep(3);
  };

  const handleFormSubmit = (data: BookingFormData) => {
    setFormData(data);
    setStep(4);
  };

  const handleReset = () => {
    setSelectedPlanId(null);
    setSelectedSlot(null);
    setSelectedSlotDetails(null);
    setSlotLabel('');
    setFormData(null);
    setStep(1);
  };

  return (
    <section id="booking" className="py-16 sm:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          {STEPS.map((s) => (
            <div key={s.id} className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                disabled={step < s.id || step === 4}
                onClick={() => {
                  if (step > s.id && step !== 4) {
                    setStep(s.id);
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  step === s.id
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md shadow-purple-500/30'
                    : step > s.id
                    ? 'glass text-green-400 border border-green-500/30'
                    : 'glass text-gray-500 opacity-60'
                }`}
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs">
                  {step > s.id ? <CheckCircle2 size={14} className="text-green-400" /> : s.id}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {s.id < STEPS.length && (
                <div
                  className={`w-4 sm:w-8 h-0.5 rounded transition-all ${
                    step > s.id ? 'bg-gradient-to-r from-purple-500 to-cyan-400' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Section Header (only visible on steps 1-3) */}
        {step < 4 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-12"
          >
            <div className="inline-block glass px-4 py-1.5 rounded-full mb-3 border border-purple-500/20">
              <span className="text-xs text-purple-400 font-bold tracking-wider uppercase">
                Réservation express
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-3">
              Réserve ton <span className="text-gradient">coaching personnalisé</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
              Sélectionne ta formule, réserve un créneau en 30 secondes et reçois ta confirmation.
            </p>
          </motion.div>
        )}

        {/* Step 1: Plans */}
        {step === 1 && (
          <BookingPlansStep
            plans={PLANS}
            selectedPlan={selectedPlanId}
            onSelectPlan={handleSelectPlan}
          />
        )}

        {/* Step 2: Slots */}
        {step === 2 && selectedPlan && (
          <BookingSlotsStep
            plan={selectedPlan}
            selectedSlot={selectedSlot}
            onSelectSlot={handleSelectSlot}
            onBack={() => setStep(1)}
          />
        )}

        {/* Step 3: Form */}
        {step === 3 && selectedPlan && (
          <BookingFormStep
            plan={selectedPlan}
            slotLabel={slotLabel}
            selectedSlotDetails={selectedSlotDetails}
            onSubmit={handleFormSubmit}
            onBack={() => setStep(2)}
          />
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && selectedPlan && formData && (
          <BookingConfirmation
            plan={selectedPlan}
            slotLabel={slotLabel}
            formData={formData}
            onReset={handleReset}
          />
        )}
      </div>
    </section>
  );
}