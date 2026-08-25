'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Award } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6"
            >
              <Zap size={16} className="text-purple-400" />
              <span className="text-sm">Coach pour Atheris Esport • MNK Specialist</span>
            </motion.div>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Passe au<br />
              niveau <span className="text-gradient">supérieur.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-300 mb-4">
              Coaching individuel haut de gamme sur{' '}
              <span className="text-purple-400 font-semibold">Valorant</span> (Immortal 2 #5000),{' '}
              <span className="text-orange-400 font-semibold">Apex Legends</span> (3x pick #450 S24) et{' '}
              <span className="text-cyan-400 font-semibold">Aim Training</span> (KovaaK's)
            </p>
            <p className="text-lg text-gray-400 mb-8">
              par <span className="text-white font-semibold">Poulpy</span>.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="#booking"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl text-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105 text-center"
              >
                Réserver une session →
              </Link>
              <Link
                href="#coaching"
                className="px-8 py-4 glass rounded-xl text-lg font-semibold hover:bg-white/10 transition-all text-center"
              >
                Découvrir le coaching
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center">
                  V
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-600 to-orange-400 flex items-center justify-center">
                  A
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600 to-cyan-400 flex items-center justify-center">
                  K
                </div>
              </div>
              <div className="text-gray-400">
                <span className="text-white font-semibold">+100 joueurs</span> accompagnés
              </div>
            </div>
          </motion.div>

          {/* Right side - Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="glass-dark rounded-2xl p-8 border-2 border-purple-500/20 relative overflow-hidden">
              {/* Gradient overlay */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-600/30 to-cyan-500/30 blur-3xl pointer-events-none" />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center relative overflow-hidden">
                      <img
                        src="/poulpy-profile.png"
                        alt="Poulpy"
                        className="w-full h-full object-cover"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a0a0f] shadow-lg shadow-green-500/50"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">POULPY</h3>
                      <p className="text-sm text-purple-400">ATHERIS COACH</p>
                      <p className="text-xs text-gray-400">20 ans • MNK • Immortal 2 & 3x pick #450</p>
                    </div>
                  </div>
                  <div className="glass px-3 py-1 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs font-semibold text-green-400">DISPONIBLE</span>
                    </div>
                  </div>
                </div>

                {/* Stats bars */}
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-cyan-400" />
                        <span className="text-sm font-medium">KovaaK's Aim Trainer</span>
                      </div>
                      <span className="text-sm font-bold text-cyan-400">VT Jade Confirmed</span>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '92%' }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Shield size={16} className="text-purple-400" />
                        <span className="text-sm font-medium">Valorant Peak Rank</span>
                      </div>
                      <span className="text-sm font-bold text-purple-400">Immortal 2</span>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '87%' }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Zap size={16} className="text-orange-400" />
                        <span className="text-sm font-medium">Apex Legends Rank</span>
                      </div>
                      <span className="text-sm font-bold text-orange-400">3x pick #450 (S24)</span>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '95%' }}
                        transition={{ duration: 1, delay: 0.9 }}
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-400"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-yellow-400" />
                        <span className="text-sm font-medium">Overwatch 2 Rank</span>
                      </div>
                      <span className="text-sm font-bold text-yellow-400">Grandmaster</span>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '88%' }}
                        transition={{ duration: 1, delay: 1.1 }}
                        className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.3 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="glass px-4 py-3 rounded-xl flex items-center gap-3 group"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <motion.div
                    animate={{ rotate: [0, 2, -2, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center"
                  >
                    <Award size={20} />
                  </motion.div>
                  <div>
                    <div className="text-sm font-semibold">MNK Specialist</div>
                    <div className="text-xs text-gray-400">Mouse & Keyboard Expert</div>
                  </div>
                </motion.div>

                {/* Atheris Badge */}
                <div className="mt-4 flex items-center justify-center">
                  <div className="glass px-4 py-2 rounded-lg border border-yellow-500/30">
                    <div className="flex items-center gap-2">
                      <Award size={16} className="text-yellow-400" />
                      <span className="text-sm font-semibold">Atheris Esport</span>
                      <span className="text-xs text-gray-400">Official Team Coach</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
