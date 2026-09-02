'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle2, ArrowRight, User, MessageSquare, Shield, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function Booking() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: choose plan, 2: choose slot, 3: confirm

  const plans = [
    {
      id: 'session',
      name: 'SESSION DÉCOUVERTE',
      price: '29€',
      duration: '30 min',
      description: 'Idéal pour un premier diagnostic rapide',
      features: ['Analyse VOD express (15 min)', '3 axes d\'amélioration prioritaires', 'Routine aim de base (5 exercices)', 'Compte-rendu écrit'],
      color: 'from-purple-600 to-purple-400',
      popular: false,
    },
    {
      id: 'pro',
      name: 'COACHING PRO',
      price: '49€',
      duration: '60 min',
      description: 'Le standard pour progresser durablement',
      features: ['Analyse VOD complète (30 min)', 'Coaching live en jeu (30 min)', 'Travail aim personnalisé', 'Plan de progression 4 semaines', 'Suivi Discord 7j/7'],
      color: 'from-cyan-600 to-blue-500',
      popular: true,
    },
    {
      id: 'performance',
      name: 'PERFORMANCE MAX',
      price: '89€',
      duration: '90 min',
      description: 'Pour les objectifs ambitieux (rank up, tournois)',
      features: ['Tout le pack PRO', 'VOD review approfondie (45 min)', 'Session live complète (45 min)', 'Aim training avancé KovaaK\'s', 'Plan personnalisé 8 semaines', 'Préparation mentale', 'Disponibilité prioritaire'],
      color: 'from-purple-600 via-cyan-500 to-blue-500',
      popular: false,
    },
  ];

  // Generate time slots for the next 2 weeks
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    for (let i = 1; i <= 14; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);

      // Skip some days randomly for realism
      if (i % 3 === 0 && i !== 7 && i !== 14) continue;

      const dayName = days[date.getDay()];
      const dayNum = date.getDate();
      const monthName = months[date.getMonth()];

      const timeSlots = [
        '14:00', '15:30', '17:00', '18:30', '20:00', '21:30'
      ].filter(() => Math.random() > 0.3); // Some slots already taken

      if (timeSlots.length > 0) {
        slots.push({
          date: `${dayName} ${dayNum} ${monthName}`,
          dayIndex: i,
          slots: timeSlots.map(time => ({
            time,
            available: Math.random() > 0.2,
            id: `${date.toISOString().split('T')[0]}-${time}`,
          })),
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setStep(2);
  };

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId);
    setStep(3);
  };

  const resetBooking = () => {
    setSelectedPlan(null);
    setSelectedSlot(null);
    setStep(1);
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  return (
    <section id="booking" className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-2 mb-12"
        >
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              initial={{ scale: 0.8 }}
              animate={{ scale: step >= s ? 1 : 0.8 }}
              transition={{ delay: s * 0.1 }}
              className="flex items-center gap-2"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step >= s
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white'
                    : 'glass-dark text-gray-500'
                }`}
              >
                {step > s ? <CheckCircle2 size={18} /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`hidden md:block w-16 h-0.5 rounded transition-all ${
                    step > s ? 'bg-gradient-to-r from-purple-600 to-cyan-500' : 'bg-white/10'
                  }`}
                />
              )}
            </motion.div>
          ))}
          <div className="hidden md:flex flex-col items-center ml-2">
            <span className="text-xs text-gray-500">Choisir</span>
            <span className="text-xs text-gray-500">Créneau</span>
            <span className="text-xs text-gray-500">Confirmer</span>
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-block glass px-4 py-2 rounded-full mb-4">
            <span className="text-sm text-purple-400 font-medium">RÉSERVATION</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Réserve ton <span className="text-gradient">coaching.</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Choisis ta formule, ton créneau, c'est tout. Confirmation instantanée sur Discord.
          </p>
        </motion.div>

        {/* Step 1: Choose Plan */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative glass-dark rounded-2xl p-8 transition-colors hover:bg-white/5 flex flex-col ${
                  plan.popular ? 'border-2 border-purple-500/50 scale-105' : ''
                } cursor-pointer`}
                onClick={() => handlePlanSelect(plan.id)}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-cyan-500 px-4 py-1 rounded-full flex items-center gap-2">
                      <Sparkles size={14} />
                      <span className="text-xs font-bold">LE PLUS CHOISI</span>
                    </div>
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-5xl font-bold bg-gradient-to-r text-transparent bg-clip-text"
                    style={{ background: plan.color }}>
                    {plan.price}
                  </span>
                  <span className="text-gray-400 ml-2">/ {plan.duration}</span>
                </div>

                {/* Duration visual */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                  <Clock size={18} />
                  <span>{plan.duration} de session</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: plan.color }}>
                        <CheckCircle2 size={12} className="text-white" />
                      </div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Select button - aligned at bottom */}
                <button
                  onClick={(e) => { e.stopPropagation(); handlePlanSelect(plan.id); }}
                  className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-500 hover:shadow-lg hover:shadow-purple-500/50 text-white'
                      : 'glass hover:bg-white/10 text-gray-300 hover:text-white'
                  }`}
                >
                  Choisir cette formule
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Step 2: Choose Time Slot */}
        {step === 2 && selectedPlanData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Plan summary */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-dark rounded-2xl p-6 mb-8 max-w-5xl mx-auto"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ background: selectedPlanData.color }}>
                    <User size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedPlanData.name}</h3>
                    <p className="text-gray-400">{selectedPlanData.duration} • {selectedPlanData.price}</p>
                  </div>
                </div>
                <button
                  onClick={resetBooking}
                  className="glass px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <ArrowRight size={16} className="-rotate-90" />
                  Changer
                </button>
              </div>
            </motion.div>

            {/* Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl mx-auto"
            >
              <div className="glass-dark rounded-2xl p-6 overflow-x-auto">
                <div className="min-w-[800px]">
                  {timeSlots.map((day, dayIndex) => (
                    <motion.div
                      key={day.date}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: dayIndex * 0.05 }}
                      className="mb-8 last:mb-0"
                    >
                      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/5">
                        <div className="w-12 h-12 rounded-xl glass flex items-center justify-center flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #7c3aed/20, #06b6d4/20)' }}>
                          <Calendar size={22} className="text-purple-400" />
                        </div>
                        <div>
                          <div className="text-lg font-bold">{day.date}</div>
                          <div className="text-sm text-gray-400">
                            {day.slots.filter(s => s.available).length} créneaux dispo sur {day.slots.length}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {day.slots.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => slot.available && handleSlotSelect(slot.id)}
                            disabled={!slot.available}
                            className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                              slot.available
                                ? 'glass hover:bg-purple-500/20 hover:border-purple-500/50 text-white border border-white/10'
                                : 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-lg glass border border-white/10" />
                  <span>Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-lg bg-white/5 border border-white/5" />
                  <span>Complet</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500" />
                  <span>Sélectionné</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && selectedPlanData && selectedSlot && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <div className="glass-dark rounded-2xl p-8 sm:p-12 text-center">
              {/* Success animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
              >
                <CheckCircle2 size={32} className="text-white" />
              </motion.div>

              <h3 className="text-3xl font-bold mb-2">Créneau réservé !</h3>
              <p className="text-gray-400 mb-8">Ta session est confirmée. Prochaines étapes :</p>

              {/* Details */}
              <div className="space-y-4 mb-8 text-left">
                <div className="glass p-4 rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: selectedPlanData.color }}>
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">{selectedPlanData.name}</div>
                    <div className="text-sm text-gray-400">{selectedPlanData.duration} • {selectedPlanData.price}</div>
                  </div>
                </div>

                <div className="glass p-4 rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-500/20">
                    <Calendar size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <div className="font-semibold">{selectedSlot.split('-')[0]}</div>
                    <div className="text-sm text-gray-400">{selectedSlot.split('-')[1]} (heure locale)</div>
                  </div>
                </div>

                <div className="glass p-4 rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-cyan-500/20">
                    <MessageSquare size={20} className="text-cyan-400" />
                  </div>
                  <div>
                    <div className="font-semibold">Confirmation Discord</div>
                    <div className="text-sm text-gray-400">Rejoins le serveur : discord.gg/poulpy-coaching</div>
                  </div>
                </div>
              </div>

              {/* What happens next */}
              <div className="glass p-6 rounded-xl mb-8 text-left border border-purple-500/20">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-green-400" />
                  Ce qui se passe maintenant
                </h4>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-purple-400">1</span>
                    </div>
                    <span>Tu reçois un DM Discord de Poulpy sous 2h pour confirmer</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-purple-400">2</span>
                    </div>
                    <span>Envoi tes VOD/replays si tu en as (optionnel mais recommandé)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-purple-400">3</span>
                    </div>
                    <span>Jour J : connecte-toi 5 min avant sur le vocal Discord</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-purple-400">4</span>
                    </div>
                    <span>C'est parti ! 🚀</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={resetBooking}
                  className="px-8 py-3 glass rounded-xl font-semibold hover:bg-white/10 transition-all"
                >
                  Réserver une autre session
                </button>
                <a
                  href="https://discord.gg/poulpy-coaching"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare size={20} />
                  Rejoindre le Discord
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}