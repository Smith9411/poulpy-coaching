'use client';

import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Avis() {
  const testimonials = [
    {
      name: 'Smith94',
      game: 'Valorant',
      rank: 'Platine → Ascendant 3',
      text: 'Incroyable progression ! Je suis passé de Platine à Ascendant 3 en quelques semaines. Le coaching de Poulpy sur le game sense et la prise de décision en clutch a tout changé. Il voit des choses que personne d\'autre ne voit. Vraiment le meilleur investissement pour mon jeu.',
      rating: 5,
    },
    {
      name: 'Alex',
      game: 'Valorant',
      rank: 'Gold → Diamant',
      text: 'En 3 sessions, j\'ai enfin compris pourquoi je bloquais en ranked. Poulpy m\'a aidé à corriger mon placement et ma prise de décision.',
      rating: 5,
    },
    {
      name: 'Sarah',
      game: 'Apex Legends',
      rank: 'Platine → Master',
      text: 'Le coaching le plus précis que j\'ai eu. Les conseils sur le movement et le tracking ont totalement changé mon jeu.',
      rating: 5,
    },
    {
      name: 'Maxime',
      game: 'Aim Training',
      rank: 'Silver → Platinum Voltaic',
      text: 'Mes scores Kovaak\'s ont explosé en 1 mois. La routine personnalisée fait toute la différence.',
      rating: 5,
    },
    {
      name: 'Thomas',
      game: 'Valorant',
      rank: 'Platine → Immortal',
      text: 'Poulpy ne se contente pas de pointer les erreurs, il explique le pourquoi et donne des solutions concrètes.',
      rating: 5,
    },
  ];

  return (
    <>
      <main className="min-h-screen bg-[#0a0a0f] dark:bg-[#0a0a0f] py-20" style={{backgroundColor: 'var(--page-bg, #0a0a0f)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block glass px-4 py-2 rounded-full mb-4">
            <span className="text-sm text-purple-400 font-medium">AVIS</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Ils ont joué. Ils ont <span className="text-gradient">progressé.</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Tous les retours de joueurs accompagnés. Pas de filtre, que du réel.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-16"
        >
          {testimonials.map((testimonial, index) => (
            <motion.article
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className="glass-dark rounded-2xl p-8 hover:bg-white/5 transition-all group"
            >
              {/* Stars */}
              <div className="flex justify-start gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-lg text-gray-200 mb-8 leading-relaxed">
                "{testimonial.text}"
              </blockquote>

              {/* Author */}
              <div>
                <div className="font-bold text-lg mb-1">{testimonial.name}</div>
                <div className="text-purple-400 font-medium mb-1">{testimonial.game}</div>
                <div className="text-sm text-gray-400">{testimonial.rank}</div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16 max-w-4xl mx-auto"
        >
          <div className="glass rounded-xl p-6 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {testimonials.length}+
            </div>
            <div className="text-xs text-gray-400">Avis vérifiés</div>
          </div>
          <div className="glass rounded-xl p-6 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              5.0/5
            </div>
            <div className="text-xs text-gray-400">Note moyenne</div>
          </div>
          <div className="glass rounded-xl p-6 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              100%
            </div>
            <div className="text-xs text-gray-400">Satisfaction</div>
          </div>
          <div className="glass rounded-xl p-6 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              3/3
            </div>
            <div className="text-xs text-gray-400">Jeux couverts</div>
          </div>
        </motion.div>

        {/* Back to home / CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 glass rounded-xl font-semibold hover:bg-white/10 transition-all group"
          >
            <ArrowRight size={20} className="-rotate-90 group-hover:-translate-x-1 transition-transform" />
            Retour à l'accueil
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            Prêt à progresser toi aussi ? Rejoins le Discord pour réserver ta session.
          </p>
        </motion.div>
      </div>
    </main>
    </>
  );
}