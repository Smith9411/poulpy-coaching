'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

export default function Pricing() {
  const plans = [
    {
      name: 'SESSION',
      price: '29',
      duration: '30 minutes',
      features: [
        'Analyse rapide',
        'Conseils personnalisés',
        'Exercices ciblés',
      ],
      popular: false,
    },
    {
      name: 'PRO',
      price: '49',
      duration: '60 minutes',
      features: [
        'Analyse complète',
        'Coaching personnalisé',
        'Travail d\'aim',
        'Analyse de gameplay',
        'Plan de progression',
      ],
      popular: true,
    },
    {
      name: 'PERFORMANCE',
      price: '89',
      duration: '90 minutes',
      features: [
        'Analyse approfondie',
        'Coaching complet',
        'VOD review',
        'Aim training',
        'Plan personnalisé',
        'Suivi de progression',
      ],
      popular: false,
    },
  ];

  return (
    <section id="tarifs" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Choisis ton <span className="text-gradient">coaching.</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Des sessions adaptées à tous les niveaux et tous les objectifs.
          </p>
        </motion.div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative glass-dark rounded-2xl p-8 hover:bg-white/5 transition-all ${
                plan.popular ? 'border-2 border-purple-500/50 scale-105' : ''
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-600 to-cyan-500 px-4 py-1 rounded-full flex items-center gap-2">
                    <Sparkles size={14} />
                    <span className="text-xs font-bold">POPULAIRE</span>
                  </div>
                </div>
              )}

              {/* Plan name */}
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>

              {/* Price */}
              <div className="mb-4">
                <span className="text-5xl font-bold">{plan.price}€</span>
              </div>

              {/* Duration */}
              <p className="text-gray-400 mb-6">{plan.duration}</p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check size={20} className="text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <a
                href="#booking"
                className={`block w-full text-center px-6 py-3 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-500 hover:shadow-lg hover:shadow-purple-500/50'
                    : 'glass hover:bg-white/10'
                }`}
              >
                Choisir
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
