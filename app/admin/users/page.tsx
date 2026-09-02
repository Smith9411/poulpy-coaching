'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, ArrowLeft, User, Mail, Search, ShieldOff, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback } from 'react';

interface ProfileRow {
  id: string;
  username: string | null;
  email: string | null;
  is_admin: boolean | null;
  created_at: string | null;
}

interface UserRow {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  initial: string;
}

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'username' | 'email' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email, is_admin, created_at');
    if (error) {
      setLoadError(
        error.message.includes('recursion')
          ? "Impossible de lire les profils : le correctif SQL des politiques RLS n'a pas encore été appliqué dans Supabase."
          : error.message
      );
      setUsers([]);
    } else {
      setUsers(
        (data as ProfileRow[]).map((p) => ({
          id: p.id,
          username: p.username || p.email?.split('@')[0] || 'Joueur',
          email: p.email || '—',
          isAdmin: p.is_admin === true,
          createdAt: p.created_at || '',
          initial: (p.username || p.email?.[0] || 'J').charAt(0).toUpperCase(),
        }))
      );
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchUsers();
    }
  }, [user?.isAdmin, fetchUsers]);

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
            <p className="text-gray-400 mb-8">Tu n'as pas les permissions d'administrateur.</p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              Retour à l'admin
            </Link>
          </motion.div>
        </main>
      </>
    );
  }

  const toggleAdmin = async (u: UserRow) => {
    setBusyId(u.id);
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: !u.isAdmin })
      .eq('id', u.id);
    if (error) {
      setLoadError(error.message.includes('recursion')
        ? "Modification impossible : applique d'abord le correctif SQL des politiques RLS dans Supabase."
        : error.message);
    } else {
      setUsers((prev) => prev.map((p) => (p.id === u.id ? { ...p, isAdmin: !p.isAdmin } : p)));
    }
    setBusyId(null);
  };

  const handleSort = (field: 'username' | 'email' | 'createdAt') => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredUsers = users
    .filter(
      (u) =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Inconnu';
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0a0a0f] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
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
              <span className="text-sm text-purple-400 font-medium">UTILISATEURS</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Gestion des <span className="text-gradient">utilisateurs</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              Comptes enregistrés sur la plateforme, synchronisés en direct avec la base de données
            </p>
          </motion.div>

          {loadError && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm flex items-start gap-3"
            >
              <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
              <span>{loadError}</span>
            </motion.div>
          )}

          {/* Search & Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-dark rounded-2xl p-6 mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 size-5" />
                <input
                  type="text"
                  placeholder="Rechercher par pseudo ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full glass rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all px-12 py-3 pr-4"
                />
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>{users.length} utilisateur{users.length > 1 ? 's' : ''} au total</span>
                <span className="text-green-400">{users.filter((u) => u.isAdmin).length} admin</span>
                <span className="text-blue-400">{users.filter((u) => !u.isAdmin).length} membres</span>
              </div>
            </div>
          </motion.div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-dark rounded-2xl overflow-hidden"
          >
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Chargement des utilisateurs...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <User size={64} className="mx-auto mb-6 text-gray-600" />
                <h3 className="text-xl font-bold mb-2">Aucun utilisateur</h3>
                <p className="text-gray-400">{searchQuery ? 'Aucun résultat pour cette recherche' : 'Aucun utilisateur enregistré pour le moment'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort('username')}>
                        <div className="flex items-center gap-2">
                          Utilisateur
                          {sortBy === 'username' && (sortOrder === 'asc' ? <span>↑</span> : <span>↓</span>)}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort('email')}>
                        <div className="flex items-center gap-2">
                          <Mail size={12} />
                          Email
                          {sortBy === 'email' && (sortOrder === 'asc' ? <span>↑</span> : <span>↓</span>)}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort('createdAt')}>
                        <div className="flex items-center gap-2">
                          Inscrit le
                          {sortBy === 'createdAt' && (sortOrder === 'asc' ? <span>↑</span> : <span>↓</span>)}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Rôle</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((u, index) => (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                              {u.initial}
                            </div>
                            <p className="font-medium text-white">{u.username}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-300">{u.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-400">{formatDate(u.createdAt)}</p>
                        </td>
                        <td className="px-6 py-4">
                          {u.isAdmin ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-black">
                              <Shield size={10} />
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300">
                              <User size={10} />
                              Membre
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {u.email !== user.email && (
                              <button
                                onClick={() => toggleAdmin(u)}
                                disabled={busyId === u.id}
                                title={u.isAdmin ? 'Retirer le rôle admin' : 'Promouvoir admin'}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white disabled:opacity-50"
                              >
                                {u.isAdmin ? <ShieldOff size={18} /> : <ShieldCheck size={18} />}
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </>
  );
}
