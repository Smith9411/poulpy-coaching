'use client';

import { motion } from 'framer-motion';
import { Target, Brain, Crosshair, TrendingUp, Search, Crosshair as Target2, Dumbbell, BarChart3 } from 'lucide-react';

export default function WhyPoulpy() {
  const features = [
    {
      icon: Target,
      title: 'Analyse précise',
      description: 'Analyse chirurgicale de tes parties et identification des erreurs subtiles qui limitent actuellement ta progression en ranked.',
      badge: 'Gameplay VOD',
    },
    {
      icon: Brain,
      title: 'Game Sense',
      description: 'Apprends à décoder les intentions ennemies, anticiper les rotations et prendre les décisions optimales dans le feu de l\'action.',
      badge: 'Prise de décision',
    },
    {
      icon: Crosshair,
      title: 'Aim & Mécaniques',
      description: 'Programme sur-mesure axé sur la régularité et la précision du tracking, le placement du viseur et la stabilité physique.',
      badge: 'Mécanique pure',
    },
    {
      icon: TrendingUp,
      title: 'Progression mesurable',
      description: 'Un accompagnement rigoureux basé sur tes objectifs réels, avec suivi statistique et plans d\'action écrits.',
      badge: 'Résultats',
    },
  ];

  return (
    <section id="coaching" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block glass px-4 py-2 rounded-full mb-4">
            <span className="text-sm text-purple-400 font-medium">LA VALEUR AJOUTÉE</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Pourquoi choisir <span className="text-gradient">Poulpy</span> ?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Un coaching axé sur la compréhension réelle de ton jeu. Pas de théories vagues, mais une méthode pragmatique et personnalisée.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-dark rounded-2xl p-6 hover:bg-white/10 transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon size={24} />
                </div>
                <span className="text-xs glass px-2 py-1 rounded-lg">{feature.badge}</span>
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
