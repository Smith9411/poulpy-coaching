'use client';

import { motion } from 'framer-motion';
import { Target, Heart, Shield, MessageCircle, Tv } from 'lucide-react';
import { useState, useEffect } from 'react';

const YoutubeIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.016 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function About() {
  const [activePlatform, setActivePlatform] = useState<'youtube' | 'twitch'>('youtube');
  const [settings, setSettings] = useState({
    youtubeUrl: 'https://www.youtube.com/watch?v=4gfWbGCA5q0',
    twitchUrl: 'https://www.twitch.tv/poulpy_coaching',
    discordUrl: 'https://discord.gg/rJMg3ZZRkp',
  });

  // Fetch settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.settings) {
          setSettings({
            youtubeUrl: data.settings.youtube_url || 'https://www.youtube.com/watch?v=4gfWbGCA5q0',
            twitchUrl: data.settings.twitch_url || 'https://www.twitch.tv/poulpy_coaching',
            discordUrl: data.settings.discord_url || 'https://discord.gg/rJMg3ZZRkp',
          });
        }
      } catch (error) {
        console.error('Erreur chargement settings:', error);
      }
    };

    fetchSettings();

    // Recharger quand l'admin met à jour les settings
    const onSettingsUpdated = () => fetchSettings();
    window.addEventListener('settings-updated', onSettingsUpdated);
    return () => window.removeEventListener('settings-updated', onSettingsUpdated);
  }, []);
  
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
                    href="https://www.twitch.tv/poulpy_coaching"
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
                    <YoutubeIcon size={16} className="text-red-500" />
                    YouTube
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Media Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-20"
        >
          <div className="glass-dark rounded-3xl p-6 sm:p-8 border border-purple-500/20">
            {/* Platform Toggle */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={() => setActivePlatform('youtube')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activePlatform === 'youtube'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <YoutubeIcon size={20} />
                YouTube
              </button>
              <button
                onClick={() => setActivePlatform('twitch')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activePlatform === 'twitch'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Tv size={20} />
                Twitch
              </button>
            </div>

            {/* Content */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              {activePlatform === 'youtube' ? (
                <iframe
                  src={settings.youtubeUrl.replace('watch?v=', 'embed/')}
                  title="Poulpy YouTube"
                  className="absolute top-0 left-0 w-full h-full rounded-xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <iframe
                  src={`https://player.twitch.tv/?channel=${settings.twitchUrl.split('/').pop()}&parent=localhost&parent=poulpy-coaching.vercel.app&parent=www.poulpy-coaching.com`}
                  title="Poulpy Twitch"
                  className="absolute top-0 left-0 w-full h-full rounded-xl"
                  allowFullScreen
                />
              )}
            </div>

            {/* External Link */}
            <div className="mt-4 text-center">
              <a
                href={activePlatform === 'youtube' ? settings.youtubeUrl : settings.twitchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-400 transition-colors"
              >
                {activePlatform === 'youtube' ? (
                  <>
                    <YoutubeIcon size={16} className="text-red-500" />
                    Voir sur YouTube
                  </>
                ) : (
                  <>
                    <Tv size={16} className="text-purple-500" />
                    Voir sur Twitch
                  </>
                )}
              </a>
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