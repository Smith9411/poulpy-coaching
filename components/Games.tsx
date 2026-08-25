'use client';

import { motion } from 'framer-motion';
import { Target, Flame, Crosshair, CheckCircle2 } from 'lucide-react';

export default function Games() {
  const games = [
    {
      title: 'VALORANT',
      subtitle: 'FPS Tactique 5v5',
      description: 'Analyse en profondeur de ton placement de viseur, ta gestion des compétences, la lecture du jeu adverse et la communication clutch.',
      badge: 'COMPÉTITIF',
      badgeColor: 'text-red-400 border-red-400/30',
      icon: Target,
      iconColor: 'from-red-600 to-red-400',
      features: [
        'Aim & Crosshair placement',
        'Movement & Peeking techniques',
        'Game Sense & Decision making',
        'Positionnement & Map control',
        'Gestion de l\'économie & Clutch',
        'Analyse approfondie de VOD',
      ],
      buttonText: 'Voir le coaching Valorant →',
      buttonHref: '#jeux',
    },
    {
      title: 'APEX LEGENDS',
      subtitle: 'Battle Royale Rapide',
      description: 'Perfectionne tes duels rapprochés, ta mobilité avancée (tap-strafe, wall-bounce), la prise de décision sous pression et la rotation de squad.',
      badge: 'HAUTE INTENSITÉ',
      badgeColor: 'text-orange-400 border-orange-400/30',
      icon: Flame,
      iconColor: 'from-orange-600 to-orange-400',
      features: [
        'Aim & Smooth Tracking',
        'Movement avancé (Tap-strafe, Wall-bounce)',
        'Positionnement & High Ground control',
        'Fight Selection & 3rd Party management',
        'Communication & IGL Decision',
        'Rotation & Zone optimale',
      ],
      buttonText: 'Voir le coaching Apex →',
      buttonHref: '#jeux',
    },
    {
      title: 'AIM TRAINING',
      subtitle: 'Perfectionnement mécanique',
      description: 'Développe une mémoire musculaire infaillible et une constance maximale grâce à des routines ciblées sur KovaaK\'s ou Aim Lab.',
      badge: 'UNIVERSEL',
      badgeColor: 'text-cyan-400 border-cyan-400/30',
      icon: Crosshair,
      iconColor: 'from-cyan-600 to-cyan-400',
      features: [
        'Flicking & Micro-corrections',
        'Precise & Reactive Tracking',
        'Target Switching à grande vitesse',
        'Temps de réaction & Readiness',
        'Analyse de posture & Sensibilité DPI',
        'Routine d\'échauffement sur-mesure',
      ],
      buttonText: 'Voir l\'aim training →',
      buttonHref: '#jeux',
    },
  ];

  return (
    <section id="jeux" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block glass px-4 py-2 rounded-full mb-4">
            <span className="text-sm text-purple-400 font-medium">SPÉCIALITÉS</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Choisis ton terrain <span className="text-gradient">de jeu.</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Un coaching personnalisé et parfaitement adapté à la compétition.
          </p>
        </motion.div>

        {/* Games Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {games.map((game, index) => (
            <motion.div
              key={game.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="glass-dark rounded-2xl p-8 hover:bg-white/5 transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${game.iconColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <game.icon size={28} />
                </div>
                <span className={`text-xs glass px-3 py-1 rounded-lg border ${game.badgeColor}`}>
                  {game.badge}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-3xl font-bold mb-2">{game.title}</h3>
              <p className="text-sm text-gray-400 mb-4 font-mono">{game.subtitle}</p>

              {/* Description */}
              <p className="text-gray-300 mb-6 leading-relaxed">{game.description}</p>

              {/* Features */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                  Programme du coaching :
                </p>
                <div className="space-y-2">
                  {game.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className={`mt-0.5 flex-shrink-0 ${game.badgeColor.split(' ')[0]}`} />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Button */}
              <a
                href={game.buttonHref}
                className={`block w-full text-center px-6 py-3 glass rounded-xl font-semibold hover:bg-gradient-to-br ${game.iconColor} hover:shadow-lg transition-all`}
              >
                {game.buttonText}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
