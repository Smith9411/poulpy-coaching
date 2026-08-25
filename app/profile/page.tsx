'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { User, Mail, Settings, LogOut, Shield, Clock, Award } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#0a0a0f] py-20 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center glass-dark rounded-2xl p-12 max-w-md mx-auto px-4"
          >
            <User size={64} className="mx-auto mb-6 text-gray-500" />
            <h1 className="text-3xl font-bold mb-4">Non connecté</h1>
            <p className="text-gray-400 mb-8">Connecte-toi pour accéder à ton espace personnel.</p>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              Se connecter
              <Award size={20} />
            </Link>
          </motion.div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0a0a0f] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="inline-block glass px-4 py-2 rounded-full mb-4">
              <span className="text-sm text-purple-400 font-medium">ESPACE PERSONNEL</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Bienvenue, <span className="text-gradient">{user.username}</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              Ton espace personnel pour suivre ta progression, gérer tes sessions et plus encore.
            </p>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-dark rounded-2xl p-8 mb-12"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-4xl font-bold text-white">
                  {user.initial}
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-[#0a0a0f] flex items-center justify-center">
                  <Shield size={16} className="text-white" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-3xl font-bold mb-2">{user.username}</h2>
                <p className="text-purple-400 font-medium mb-4">Membre Poulpy Coaching</p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Mail size={18} className="text-gray-500" />
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                className="flex items-center gap-2 px-6 py-3 glass rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-500/10 border border-white/5 transition-all"
              >
                <LogOut size={18} />
                Déconnexion
              </button>
            </div>
          </motion.div>

          {/* Stats / Upcoming sections placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid sm:grid-cols-3 gap-6 mb-12"
          >
            <div className="glass-dark rounded-2xl p-6 text-center hover:bg-white/5 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Clock size={24} className="text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Sessions à venir</h3>
              <p className="text-gray-400 text-sm mb-4">Aucune session planifiée</p>
              <Link
                href="/#booking"
                className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
              >
                Réserver
                <Award size={14} />
              </Link>
            </div>

            <div className="glass-dark rounded-2xl p-6 text-center hover:bg-white/5 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Award size={24} className="text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Progression</h3>
              <p className="text-gray-400 text-sm mb-4">Suivi de tes rangs</p>
              <span className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
                Bientôt disponible
              </span>
            </div>

            <div className="glass-dark rounded-2xl p-6 text-center hover:bg-white/5 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-600 to-purple-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Settings size={24} className="text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Paramètres</h3>
              <p className="text-gray-400 text-sm mb-4">Gérer ton compte</p>
              <span className="inline-flex items-center gap-1 text-pink-400 hover:text-pink-300 text-sm font-medium transition-colors">
                Bientôt disponible
              </span>
            </div>
          </motion.div>

          {/* Info section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="glass-dark rounded-2xl p-8"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Shield size={24} className="text-purple-400" />
              À propos de cet espace
            </h3>
            <div className="space-y-4 text-gray-300">
              <p>Cet espace personnel est en cours de développement. Bientôt, tu pourras :</p>
              <ul className="space-y-3 pl-6 list-disc">
                <li>Voir l'historique de tes sessions de coaching</li>
                <li>Suivre ta progression de rang (Valorant, Apex, Aim)</li>
                <li>Accéder à tes VOD review et analyses</li>
                <li>Gérer tes créneaux de réservation</li>
                <li>Modifier tes préférences et notifications</li>
                <li>Télécharger tes plans d'entraînement personnalisés</li>
              </ul>
              <p className="text-sm text-gray-500 pt-4 border-t border-white/5">
                Pour toute question, rejoins le <a href="https://discord.gg/rJMg3ZZRkp" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">Discord</a>.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}