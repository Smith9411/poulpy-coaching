'use client';

import { Shield, ArrowLeft, TrendingUp, Users, DollarSign, Clock } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function AdminStats() {
  const { user, isLoading: authLoading } = useAuth();
  const [userCount, setUserCount] = useState<number | null>(null);
  const [adminCount, setAdminCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.isAdmin) return;
    supabase.from('profiles').select('id', { count: 'exact', head: true }).then(({ count }) => setUserCount(count ?? 0));
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_admin', true).then(({ count }) => setAdminCount(count ?? 0));
  }, [user?.isAdmin]);

  if (authLoading) {
    return (
      <main className="min-h-screen page-bg py-24 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!user || !user.isAdmin) {
    return (
      <main className="min-h-screen page-bg py-24 flex items-center justify-center">
        <div className="text-center card rounded-2xl p-12 max-w-md mx-auto px-4">
          <Shield size={64} className="mx-auto mb-6 text-gray-500" />
          <h1 className="text-3xl font-bold mb-4">Accès refusé</h1>
          <Link href="/admin" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
            Retour à l&apos;admin
          </Link>
        </div>
      </main>
    );
  }

  const stats = [
    { label: 'Total utilisateurs', value: userCount === null ? '…' : String(userCount), gradient: 'from-purple-600 to-purple-400', icon: Users },
    { label: 'Sessions ce mois', value: '0', gradient: 'from-cyan-600 to-blue-400', icon: Clock },
    { label: 'Revenus mensuels', value: '0 €', gradient: 'from-green-600 to-emerald-400', icon: DollarSign },
    { label: 'Taux satisfaction', value: '0 %', gradient: 'from-yellow-600 to-orange-400', icon: TrendingUp },
  ];

  return (
    <main className="min-h-screen page-bg py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-12">
          <Link href="/admin" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft size={20} />
            Retour admin
          </Link>
          <div>
            <div className="inline-block glass px-4 py-2 rounded-full mb-4">
              <span className="text-sm text-cyan-400 font-medium">STATISTIQUES</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Statistiques <span className="text-gradient">globales</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">Vue d&apos;ensemble des métriques de la plateforme</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((s) => (
            <div
              key={s.label}
              className="card rounded-2xl p-6 hover:bg-white/5 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{s.label}</p>
                  <p className="text-4xl font-bold text-gradient">{s.value}</p>
                </div>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center`}>
                  <s.icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Résumé utilisateurs */}
        <div className="card rounded-2xl p-6 mb-12">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Users size={20} className="text-purple-400" />
            Répartition des comptes
          </h3>
          <div className="flex flex-wrap gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gradient">{userCount ?? '…'}</p>
              <p className="text-sm text-gray-400 mt-1">Total inscrits</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-400">{adminCount ?? '…'}</p>
              <p className="text-sm text-gray-400 mt-1">Administrateurs</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-400">
                {userCount !== null && adminCount !== null ? userCount - adminCount : '…'}
              </p>
              <p className="text-sm text-gray-400 mt-1">Membres</p>
            </div>
          </div>
        </div>

        {/* Charts placeholder */}
        <div className="card rounded-2xl p-8">
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
          <p className="text-sm text-gray-500 mt-6 text-center">Les graphiques détaillés seront ajoutés prochainement</p>
        </div>

      </div>
    </main>
  );
}