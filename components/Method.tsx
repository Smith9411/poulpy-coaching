'use client';

import { motion } from 'framer-motion';
import { Search, Target, Dumbbell, TrendingUp } from 'lucide-react';

export default function Method() {
  const steps = [
    {
      number: '01',
      icon: Search,
      title: 'Analyse',
      subtitle: 'Diagnostic complet de ton gameplay',
      description: 'Nous étudions tes statistiques, ta sensibilité, ton matériel, et ta mentalité pour comprendre ton profil de joueur.',
    },
    {
      number: '02',
      icon: Target,
      title: 'Identification',
      subtitle: 'Ciblage précis des axes d\'amélioration',
      description: 'Isolation des 2 à 3 facteurs bloquants majeurs qui limitent réellement ta progression en ce moment.',
    },
    {
      number: '03',
      icon: Dumbbell,
      title: 'Travail & Routines',
      subtitle: 'Entraînement guidé & Exercices pratiques',
      description: 'Mise en place de routines d\'aim sur-mesure, de drills mécaniques adaptés et d\'exercices de lecture de jeu.',
    },
    {
      number: '04',
      icon: TrendingUp,
      title: 'Progression & Suivi',
      subtitle: 'Mesure continue & Montée en rang',
      description: 'Évaluation de la montée en compétences à chaque étape. Ajustement du plan et maintien de la motivation.',
    },
  ];

  return (
    <section id="methode" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block glass px-4 py-2 rounded-full mb-4">
            <span className="text-sm text-purple-400 font-medium">PROCESSUS D'ACCOMPAGNEMENT</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Une méthode. Pas de <span className="text-gradient">recette magique.</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Un processus structuré en 4 étapes clés pour garantir une progression constante et mesurable sur le long terme.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-dark rounded-2xl p-6 hover:bg-white/10 transition-all group relative overflow-hidden"
            >
              {/* Background number */}
              <div className="absolute top-4 right-4 text-6xl font-bold text-white/5 group-hover:text-white/10 transition-colors">
                {step.number}
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl font-bold text-purple-400">{step.number}</span>
                  <div className="w-12 h-12 rounded-xl glass flex items-center justify-center group-hover:scale-110 transition-transform">
                    <step.icon size={24} className="text-cyan-400" />
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-purple-400 mb-3">{step.subtitle}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
