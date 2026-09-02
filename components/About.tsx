'use client';

import { motion } from 'framer-motion';
import { Target, Heart, Shield, MessageCircle, Tv } from 'lucide-react';

export default function About() {
  const values = [
    {
      icon: Target,
      title: 'Précision chirurgicale',
      desc: 'Chaque conseil est ciblé, mesurable, applicable immédiatement. Pas de fluff, que de l\'actionnable.',
      color: 'text-purple-400',
    },
    {
      icon: Heart,
      title: 'Humain avant tout',
      desc: 'Écoute, bienveillance, adaptation. Ton mental compte autant que ta mécanique. On avance à ton rythme.',
      color: 'text-pink-400',
    },
    {
      icon: Shield,
      title: 'Intégrité totale',
      desc: 'Pas de raccourcis, pas de cheat, pas de boosting. Progression réelle, mérite, respect du jeu et des autres.',
      color: 'text-green-400',
    },
  ];

  return (
    <section id="apropos" className="py-20 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-600/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-600/10 to-transparent rounded-full blur-3xl" />
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
            <span className="text-sm text-purple-400 font-medium">À PROPOS</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Derrière <span className="text-gradient">POULPY.</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            20 ans. Passionné. Exigeant. Ton coach pour de vrai.
          </p>
        </motion.div>

        {/* Profile Card with real photo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto mb-20"
        >
          <div className="glass-dark rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-purple-500/20">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/5 via-transparent to-transparent" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-600/10 to-transparent rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center lg:items-start">
              {/* Photo */}
              <div className="relative flex-shrink-0">
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-4 border-purple-500/50 relative">
                  <img
                    src="/poulpy-profile.png"
                    alt="Poulpy - Coach Gaming"
                    className="w-full h-full object-cover"
                  />
                  {/* Online indicator */}
                  <div className="absolute bottom-4 right-4 w-6 h-6 bg-green-500 rounded-full border-4 border-[#0a0a0f] animate-pulse" />
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-purple-600/30 to-cyan-500/30 rounded-full blur-2xl" />
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-full blur-2xl" />
              </div>

              {/* Info */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-4 flex-wrap">
                  <h3 className="text-3xl sm:text-4xl font-bold">POULPY</h3>
                  <div className="glass px-3 py-1 rounded-full">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs font-semibold text-green-400">DISPONIBLE</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-6 text-sm">
                  <span className="text-purple-400 font-medium">20 ans</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-orange-400 font-medium">MNK Specialist</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-cyan-400 font-medium">Immortal 2 Valorant</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-yellow-400 font-medium">3x Pick #450 Apex S24</span>
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed max-w-xl">
                  Coach officiel <span className="font-semibold text-yellow-400">Atheris Esport</span>.
                  J'ai commencé comme toi : frustré de stagner, perdu dans les conseils contradictoires.
                  J'ai passé 6 ans à décortiquer la mécanique pure, le game sense, la prise de décision.
                  Aujourd'hui, je te transmets ce qui marche vraiment. Sans filtre.
                </p>

                {/* Quick stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Joueurs coachés', value: '150+' },
                    { label: 'Taux succès', value: '87%' },
                    { label: 'Heures coaching', value: '800+' },
                    { label: 'Ans expérience', value: '6+' },
                  ].map((stat) => (
                    <div key={stat.label} className="glass px-4 py-3 rounded-xl">
                      <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Social links */}
                <div className="flex items-center justify-center lg:justify-center gap-3 max-w-md mx-auto">
                  <a
                    href="https://discord.gg/rJMg3ZZRkp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass px-4 py-2 rounded-lg hover:bg-white/10 transition-all flex items-center gap-2 text-sm"
                  >
                    <MessageCircle size={16} className="text-purple-400" />
                    Discord
                  </a>
                  <a
                    href="https://www.twitch.tv/ccs_poulpy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass px-4 py-2 rounded-lg hover:bg-white/10 transition-all flex items-center gap-2 text-sm"
                  >
                    <Tv size={16} className="text-purple-600" />
                    Twitch
                  </a>
                  <a
                    href="https://www.youtube.com/@Poulpy_C"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass px-4 py-2 rounded-lg hover:bg-white/10 transition-all flex items-center gap-2 text-sm"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-red-500"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    YouTube
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mb-20"
        >
          <h3 className="text-2xl font-bold text-center mb-12">Mes valeurs</h3>
          <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-dark rounded-2xl p-6 hover:bg-white/5 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ background: `linear-gradient(135deg, ${value.color}/20, ${value.color}/10)` }}
                >
                  <value.icon size={24} className={value.color} />
                </div>
                <h4 className="text-xl font-bold mb-2">{value.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}