'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { Plan } from './types';

interface BookingPlansStepProps {
  plans: Plan[];
  selectedPlan: string | null;
  onSelectPlan: (planId: string) => void;
}

export default function BookingPlansStep({
  plans,
  selectedPlan,
  onSelectPlan,
}: BookingPlansStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
    >
      {plans.map((plan, index) => {
        const isSelected = selectedPlan === plan.id;
        return (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className={`relative glass-dark rounded-2xl p-6 sm:p-8 transition-all flex flex-col cursor-pointer border ${
              isSelected
                ? 'border-cyan-400 bg-cyan-950/20 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                : plan.popular
                ? 'border-purple-500/60 hover:border-purple-400 hover:scale-[1.01]'
                : 'border-white/10 hover:border-white/20 hover:bg-white/5'
            }`}
            onClick={() => onSelectPlan(plan.id)}
          >
            {/* Popular badge */}
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-600 to-cyan-500 px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-md shadow-purple-500/30">
                  <Sparkles size={13} className="text-white" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                    Le plus choisi
                  </span>
                </div>
              </div>
            )}

            {/* Plan header */}
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-1.5 text-white">{plan.name}</h3>
              <p className="text-gray-400 text-xs sm:text-sm">{plan.description}</p>
            </div>

            {/* Price */}
            <div className="mb-4 flex items-baseline">
              <span
                className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r text-transparent bg-clip-text"
                style={{ background: plan.color }}
              >
                {plan.price}
              </span>
              <span className="text-gray-400 ml-2 text-sm">/ {plan.duration}</span>
            </div>

            {/* Duration visual */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-5">
              <Clock size={16} className="text-purple-400" />
              <span>{plan.duration} de session intensive</span>
            </div>

            {/* Features list */}
            <ul className="space-y-2.5 mb-6 flex-1 text-xs sm:text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: plan.color }}
                  >
                    <CheckCircle2 size={11} className="text-white" />
                  </div>
                  <span className="text-gray-300 leading-snug">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectPlan(plan.id);
              }}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                plan.popular || isSelected
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 hover:shadow-lg hover:shadow-purple-500/40 text-white font-bold'
                  : 'glass hover:bg-white/10 text-gray-200 hover:text-white border border-white/10'
              }`}
            >
              <span>Choisir ce pack</span>
              <ArrowRight size={16} />
            </button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
