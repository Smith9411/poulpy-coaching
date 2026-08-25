'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Target, BarChart3, Clock, Award, Flame, Sparkles } from 'lucide-react';

// Custom icons
const Crosshair = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="22" y1="12" x2="18" y2="12" />
    <line x1="6" y1="12" x2="2" y2="12" />
    <line x1="12" y1="6" x2="12" y2="2" />
    <line x1="12" y1="22" x2="12" y2="18" />
  </svg>
);

const Brain = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 5a3 3 0 1 0-3 3c0 1.5 1 2.5 2 3.5A5.5 5.5 0 0 0 5 15c0 2.5 2 4.5 5 4.5s5-2 5-4.5a5.5 5.5 0 0 0-4-5.5c1-1 2-2 2-3.5a3 3 0 1 0-3-3z" />
  </svg>
);

export default function Progression() {
  const stats = [
    { label: 'Joueurs accompagnés', value: '+150', icon: Award, color: 'text-yellow-400', bg: 'from-yellow-500/20 to-yellow-400/20' },
    { label: 'Taux de progression', value: '87%', icon: TrendingUp, color: 'text-green-400', bg: 'from-green-500/20 to-green-400/20' },
    { label: 'Sessions délivrées', value: '+500', icon: Target, color: 'text-purple-400', bg: 'from-purple-500/20 to-purple-400/20' },
    { label: 'Heures de coaching', value: '+800h', icon: Clock, color: 'text-cyan-400', bg: 'from-cyan-500/20 to-cyan-400/20' },
  ];

  const progressionSteps = [
    {
      week: 'Semaine 1-2',
      title: 'Diagnostic & Fondations',
      description: 'Analyse complète du gameplay, réglages sensibilité, setup matériel, identification des 3 axes prioritaires.',
      metrics: ['VOD Review complète', 'Setup optimal validé', 'Plan d\'action écrit'],
      color: 'from-purple-500 to-cyan-500',
      icon: Target,
    },
    {
      week: 'Semaine 3-6',
      title: 'Construction Mécanique',
      description: 'Routines aim quotidiennes, drills de placement, micro-corrections, travail de la constance.',
      metrics: ['Routine KovaaK\'s personnalisée', 'Tracking +40%', 'Flick consistency +35%'],
      color: 'from-cyan-500 to-blue-500',
      icon: Crosshair,
    },
    {
      week: 'Mois 2-3',
      title: 'Game Sense & Décision',
      description: 'Lecture de jeu avancée, anticipation rotations, gestion économie, clutch factor, communication.',
      metrics: ['Winrate +25%', 'Clutch rate x2', 'Decision making score +30%'],
      color: 'from-blue-500 to-indigo-500',
      icon: Brain,
    },
    {
      week: 'Mois 3+',
      title: 'Performance & Maintien',
      description: 'Montée en rang stable, préparation tournois, mental game, autonomie complète sur l\'entraînement.',
      metrics: ['Rank up garanti', 'Autonomie entraînement', 'Mental fortifié'],
      color: 'from-indigo-500 to-purple-500',
      icon: TrendingUp,
    },
  ];

  return (
    <section id="progression" className="py-20 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-600/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-600/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block glass px-4 py-2 rounded-full mb-4">
            <span className="text-sm text-purple-400 font-medium">SUIVI DE PROGRESSION</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ta progression <span className="text-gradient">visualisée & mesurée.</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Chaque étape est quantifiée. Pas de ressenti, des données. Tu vois exactement où tu en es et où tu vas.
          </p>
        </motion.div>

        {/* Key Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-dark rounded-2xl p-6 text-center group hover:bg-white/5 transition-all"
            >
              <div className={`w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center ${stat.bg}`}>
                <stat.icon size={28} className={stat.color} />
              </div>
              <div className="text-4xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Progression Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          {/* Vertical line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/30 via-cyan-500/30 to-purple-500/30 -translate-x-1/2" />

          <div className="space-y-12">
            {progressionSteps.map((step, index) => (
              <motion.div
                key={step.week}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className={`relative lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-12 lg:text-right' : 'lg:pl-12 lg:ml-auto'}`}
              >
                {/* Dot on timeline */}
                <div className="hidden lg:block absolute top-8 w-4 h-4 rounded-full border-4 border-[#0a0a0f] z-10"
                  style={{
                    left: index % 2 === 0 ? 'calc(50% - 2px)' : 'calc(50% - 2px)',
                    background: `linear-gradient(135deg, ${step.color.split(' to ')[0]}, ${step.color.split(' to ')[1]})`,
                  }}
                />

                <div className="glass-dark rounded-2xl p-6 sm:p-8 hover:bg-white/5 transition-all relative">
                  {/* Week badge */}
                  <div className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${step.color.split(' to ')[0]}, ${step.color.split(' to ')[1]})` }}
                  >
                    {step.week}
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `linear-gradient(135deg, ${step.color.split(' to ')[0]}/20, ${step.color.split(' to ')[1]}/20)` }}
                  >
                    <step.icon size={28} style={{ color: step.color.split(' to ')[0] }} />
                  </div>

                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">{step.description}</p>

                  {/* Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {step.metrics.map((metric, mIndex) => (
                      <motion.div
                        key={metric}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + mIndex * 0.1 }}
                        className="glass px-4 py-3 rounded-xl text-center"
                      >
                        <Sparkles size={16} className="mx-auto mb-1 text-purple-400" />
                        <p className="text-sm font-medium text-gray-200">{metric}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="glass-dark rounded-2xl p-8 sm:p-12 max-w-3xl mx-auto border border-purple-500/30">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Prêt à <span className="text-gradient">démarrer ton suivi</span> ?
            </h3>
            <p className="text-gray-300 mb-6">
              Rejoins les 150+ joueurs qui ont déjà franchi le cap. Première session diagnostic offerte pour établir ton plan.
            </p>
            <a
              href="#booking"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl text-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105"
            >
              <Flame size={22} />
              Commencer mon suivi
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}