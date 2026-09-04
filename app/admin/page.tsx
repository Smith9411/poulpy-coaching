'use client';

import { Shield, Users, DollarSign, BarChart2, Settings, LogOut, Mail, Award, MessageSquare, Zap, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [userCount, setUserCount] = useState<number | null>(null);
  const [bookingCount, setBookingCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.isAdmin) return;
    const controller = new AbortController();
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) return;

        // Count users
        const res = await fetch('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!controller.signal.aborted && res.ok) {
          const data = await res.json();
          const nonAdminCount = (data.users || []).filter((u: { isAdmin: boolean }) => !u.isAdmin).length;
          setUserCount(nonAdminCount);
        }

        // Count bookings
        const bookingsRes = await fetch('/api/admin/bookings', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!controller.signal.aborted && bookingsRes.ok) {
          const bData = await bookingsRes.json();
          setBookingCount(bData.stats?.confirmedCount ?? 0);
        }
      } catch (err) {
        if ((err as { name?: string })?.name === 'AbortError') return;
        console.error('Erreur chargement admin stats:', err);
      }
    })();
    return () => controller.abort();
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
          <p className="text-gray-400 mb-8">Tu n&apos;as pas les permissions d&apos;administrateur.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    );
  }

  const stats = [
    { label: 'Utilisateurs', value: userCount === null ? '…' : String(userCount), icon: Users, gradient: 'from-purple-600 to-purple-400' },
    { label: 'Sessions réservées', value: bookingCount === null ? '…' : String(bookingCount), icon: Calendar, gradient: 'from-cyan-600 to-cyan-400' },
    { label: 'Revenus', value: '0 €', icon: DollarSign, gradient: 'from-green-600 to-green-400' },
    { label: 'Taux conversion', value: '0 %', icon: BarChart2, gradient: 'from-yellow-600 to-yellow-400' },
  ];

  const quickActions = [
    { label: 'Planning & Réservations', href: '/admin/bookings', icon: Calendar, cls: 'border-cyan-500/40 hover:bg-cyan-500/10 text-cyan-400' },
    { label: 'Rangs élèves', href: '/admin/students', icon: Zap, cls: 'border-orange-500/30 hover:bg-orange-500/10 text-orange-400' },
    { label: 'Gérer utilisateurs', href: '/admin/users', icon: Users, cls: 'border-purple-500/30 hover:bg-purple-500/10 text-purple-400' },
    { label: 'Gérer coaching', href: '/admin/coaching', icon: MessageSquare, cls: 'border-green-500/30 hover:bg-green-500/10 text-green-400' },
    { label: 'Voir statistiques', href: '/admin/stats', icon: BarChart2, cls: 'border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400' },
    { label: 'Paramètres site', href: '/admin/settings', icon: Settings, cls: 'border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-400' },
    { label: 'Déconnexion', href: '#', icon: LogOut, cls: 'border-red-500/30 hover:bg-red-500/10 text-red-400', onClick: logout },
  ];

  return (
    <main className="min-h-screen page-bg py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12">
          <div className="inline-block glass px-4 py-2 rounded-full mb-4">
            <span className="text-sm text-purple-400 font-medium">PANNEAU ADMIN</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Tableau de bord <span className="text-gradient">administrateur</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Gestion complète de la plateforme Poulpy Coaching
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="card rounded-2xl p-6 hover:bg-white/5 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                  <stat.icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Actions rapides</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => { if (action.onClick) action.onClick(); else window.location.href = action.href; }}
                className={`card border rounded-xl p-6 text-left transition-all group flex flex-col items-start gap-4 ${action.cls}`}
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <action.icon size={24} />
                </div>
                <span className="font-semibold">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="card rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <Shield size={24} className="text-purple-400" />
            Informations
          </h3>
          <div className="grid sm:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Mail size={18} className="text-purple-400" />
                Compte admin
              </h4>
              <p className="text-sm">Email : {user.email}</p>
              <p className="text-sm">Pseudo : {user.username}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Award size={18} className="text-yellow-400" />
                Permissions
              </h4>
              <ul className="space-y-1 text-sm">
                <li>• Accès panneau admin</li>
                <li>• Gestion utilisateurs</li>
                <li>• Statistiques globales</li>
                <li>• Configuration site</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}