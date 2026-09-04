'use client';

import { motion } from 'framer-motion';
import { Target, Flame, CheckCircle2, Sparkles } from 'lucide-react';

export default function Games() {
  const games = [
    {
      title: 'VALORANT',
      subtitle: 'FPS Tactique 5v5',
      description: 'Perfectionnement complet : placement de viseur, micro-flicks, gestion des compétences, lecture du jeu adverse et communication clutch.',
      badge: 'COMPÉTITIF',
      badgeColor: 'text-red-400 border-red-400/30 bg-red-500/10',
      icon: Target,
      iconColor: 'from-red-600 to-rose-400',
      features: [
        'Aim, Micro-flicks & Crosshair placement',
        'Movement & Peeking techniques (deadzoning, jiggle)',
        'Game Sense & Prise de décision sous pression',
        'Positionnement tactique & Map control',
        'Gestion de l\'économie & Scénarios clutch',
        'Routine d\'aim & Analyse approfondie de VOD',
      ],
    },
    {
      title: 'APEX LEGENDS',
      subtitle: 'Battle Royale Rapide',
      description: 'Domine tes duels et tes rotations : fluidité mécanique, tracking haute vitesse, mobilité avancée et prise de décision sous forte pression.',
      badge: 'HAUTE INTENSITÉ',
      badgeColor: 'text-orange-400 border-orange-400/30 bg-orange-500/10',
      icon: Flame,
      iconColor: 'from-orange-600 to-amber-400',
      features: [
        'Aim, Smooth & Reactive Tracking (KovaaK\'s / Aim Lab)',
        'Movement avancé (Tap-strafe, Wall-bounce, Superglide)',
        'Positionnement & Contrôle du High Ground',
        'Fight Selection & Gestion des 3rd parties',
        'Communication & Leadership IGL en squad',
        'Routines d\'échauffement & Analyse de VOD',
      ],
    },
  ];

  return (
    <section id="jeux" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-4 border border-purple-500/30">
            <Sparkles size={16} className="text-purple-400" />
            <span className="text-sm text-purple-300 font-medium tracking-wide">SPÉCIALITÉS DU COACHING</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Choisis ton terrain <span className="text-gradient">de jeu.</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Un accompagnement sur-mesure sur Valorant et Apex Legends, avec perfectionnement mécanique et aim training directement intégrés dans chaque séance.
          </p>
        </motion.div>

        {/* Games Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {games.map((game, index) => (
            <motion.div
              key={game.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: index * 0.12, ease: 'easeOut' }}
              className="glass-dark rounded-2xl p-8 sm:p-10 border border-white/10 hover:border-purple-500/40 hover:bg-white/[0.04] transition-colors duration-300 group relative flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${game.iconColor} flex items-center justify-center group-hover:scale-110 shadow-lg shadow-black/40 transition-transform`}>
                    <game.icon size={28} className="text-white" />
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-lg border font-semibold ${game.badgeColor}`}>
                    {game.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-3xl font-bold mb-2 tracking-tight">{game.title}</h3>
                <p className="text-sm text-gray-400 mb-4 font-mono">{game.subtitle}</p>

                {/* Description */}
                <p className="text-gray-300 mb-8 leading-relaxed">{game.description}</p>

                {/* Features */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
                    Programme du coaching :
                  </p>
                  <div className="space-y-3">
                    {game.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2.5">
                        <CheckCircle2 size={16} className={`mt-0.5 flex-shrink-0 ${game.badgeColor.split(' ')[0]}`} />
                        <span className="text-sm text-gray-300 leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
