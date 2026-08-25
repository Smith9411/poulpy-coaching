'use client';

import { motion } from 'framer-motion';
import { Shield, ArrowLeft, TrendingUp, Users, DollarSign, Clock } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export default function AdminStats() {
  const { user } = useAuth();

  if (!user || !user.isAdmin) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#0a0a0f] py-20 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center glass-dark rounded-2xl p-12 max-w-md mx-auto px-4"
          >
            <Shield size={64} className="mx-auto mb-6 text-gray-500" />
            <h1 className="text-3xl font-bold mb-4">Accès refusé</h1>
            <Link href="/admin" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
              Retour à l'admin
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <Link href="/admin" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
              <ArrowLeft size={20} />
              Retour admin
            </Link>
            <div className="inline-block glass px-4 py-2 rounded-full mb-4">
              <span className="text-sm text-cyan-400 font-medium">STATISTIQUES</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Statistiques <span className="text-gradient">globales</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              Vue d'ensemble des métriques de la plateforme
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <div className="glass-dark rounded-2xl p-6 hover:bg-white/5 transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total utilisateurs</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">0</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center">
                  <Users size={24} className="text-white" />
                </div>
              </div>
            </div>

            <div className="glass-dark rounded-2xl p-6 hover:bg-white/5 transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Sessions ce mois</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">0</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-400 flex items-center justify-center">
                  <Clock size={24} className="text-white" />
                </div>
              </div>
            </div>

            <div className="glass-dark rounded-2xl p-6 hover:bg-white/5 transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Revenus mensuels</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">0€</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-600 to-emerald-400 flex items-center justify-center">
                  <DollarSign size={24} className="text-white" />
                </div>
              </div>
            </div>

            <div className="glass-dark rounded-2xl p-6 hover:bg-white/5 transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Taux satisfaction</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">0%</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-600 to-orange-400 flex items-center justify-center">
                  <TrendingUp size={24} className="text-white" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Charts placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-dark rounded-2xl p-8"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <TrendingUp size={24} className="text-cyan-400" />
              Graphiques (À venir)
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="glass rounded-xl p-8 text-center">
                <p className="text-gray-400 mb-4">Inscriptions quotidiennes</p>
                <div className="h-48 flex items-center justify-center">
                  <TrendingUp size={48} className="text-gray-600" />
                </div>
              </div>
              <div className="glass rounded-xl p-8 text-center">
                <p className="text-gray-400 mb-4">Répartition par jeu</p>
                <div className="h-48 flex items-center justify-center">
                  <Shield size={48} className="text-gray-600" />
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6 text-center">
              Les graphiques seront implémentés avec une vraie base de données
            </p>
          </motion.div>
        </div>
      </main>
    </>
  );
}