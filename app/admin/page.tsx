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
      <main className="min-h-screen bg-[#07090D] py-24 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FF7582] border-t-transparent animate-spin" />
      </main>
    );
  }

  if (!user || !user.isAdmin) {
    return (
      <main className="min-h-screen bg-[#07090D] py-24 flex items-center justify-center">
        <div className="text-center reticle-box p-12 max-w-md mx-auto px-4">
          <Shield size={64} className="mx-auto mb-6 text-gray-500" />
          <h1 className="text-3xl font-bold mb-4">Accès refusé</h1>
          <p className="text-gray-400 mb-8">Tu n&apos;as pas les permissions d&apos;administrateur.</p>
          <Link
            href="/"
            className="btn-cyber-primary"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    );
  }

  const stats = [
    { label: 'Utilisateurs', value: userCount === null ? '…' : String(userCount), icon: Users, gradient: 'from-[#FF7582] to-[#FF7582]/60' },
    { label: 'Sessions réservées', value: bookingCount === null ? '…' : String(bookingCount), icon: Calendar, gradient: 'from-[#8FAFD4] to-[#8FAFD4]/60' },
    { label: 'Revenus', value: '0 €', icon: DollarSign, gradient: 'from-[#A4DE87] to-[#A4DE87]/60' },
    { label: 'Taux conversion', value: '0 %', icon: BarChart2, gradient: 'from-[#FF7582]/80 to-[#FF7582]/40' },
  ];

  const quickActions = [
    { label: 'Planning & Réservations', href: '/admin/bookings', icon: Calendar, cls: 'border-[#8FAFD4]/40 hover:bg-[#8FAFD4]/10 text-[#8FAFD4]' },
    { label: 'Rangs élèves', href: '/admin/students', icon: Zap, cls: 'border-orange-500/30 hover:bg-orange-500/10 text-orange-400' },
    { label: 'Gérer utilisateurs', href: '/admin/users', icon: Users, cls: 'border-[#FF7582]/30 hover:bg-[#FF7582]/10 text-[#FF7582]' },
    { label: 'Gérer coaching', href: '/admin/coaching', icon: MessageSquare, cls: 'border-green-500/30 hover:bg-green-500/10 text-green-400' },
    { label: 'Voir statistiques', href: '/admin/stats', icon: BarChart2, cls: 'border-[#8FAFD4]/30 hover:bg-[#8FAFD4]/10 text-[#8FAFD4]' },
    { label: 'Paramètres site', href: '/admin/settings', icon: Settings, cls: 'border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-400' },
    { label: 'Déconnexion', href: '#', icon: LogOut, cls: 'border-red-500/30 hover:bg-red-500/10 text-red-400', onClick: logout },
  ];

  return (
    <main className="min-h-screen bg-[#07090D] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12">
          <div className="inline-block data-badge data-badge-acid mb-4">
            <span className="text-sm text-[#FF7582] font-medium">PANNEAU ADMIN</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Tableau de bord <span className="text-[#FF7582]">administrateur</span>
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
              className="reticle-box p-6 hover:bg-white/5 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
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
                className={`bg-[#090c10] border border-white/8 border p-6 text-left transition-all group flex flex-col items-start gap-4 ${action.cls}`}
              >
                <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <action.icon size={24} />
                </div>
                <span className="font-semibold">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="reticle-box p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <Shield size={24} className="text-[#FF7582]" />
            Informations
          </h3>
          <div className="grid sm:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Mail size={18} className="text-[#FF7582]" />
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