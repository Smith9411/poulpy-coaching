'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, ArrowLeft, User, Mail, Search, ShieldOff, ShieldCheck, AlertTriangle, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
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
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email, is_admin, created_at')
      .order('created_at', { ascending: false });

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
    if (user?.isAdmin) fetchUsers();
  }, [user?.isAdmin, fetchUsers]);

  if (!user || !user.isAdmin) {
    return (
      <main className="min-h-screen page-bg py-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center card rounded-2xl p-12 max-w-md mx-auto px-4"
        >
          <Shield size={64} className="mx-auto mb-6 text-gray-500" />
          <h1 className="text-3xl font-bold mb-4">Accès refusé</h1>
          <p className="text-gray-400 mb-8">Tu n&apos;as pas les permissions d&apos;administrateur.</p>
          <Link href="/admin" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
            Retour à l&apos;admin
          </Link>
        </motion.div>
      </main>
    );
  }

  const toggleAdmin = async (u: UserRow) => {
    setBusyId(u.id);
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: !u.isAdmin })
      .eq('id', u.id);
    if (error) {
      setLoadError(error.message);
    } else {
      setUsers((prev) => prev.map((p) => (p.id === u.id ? { ...p, isAdmin: !p.isAdmin } : p)));
      showSuccess(`${u.username} est maintenant ${!u.isAdmin ? 'admin' : 'membre'}`);
    }
    setBusyId(null);
  };

  const deleteUser = async (u: UserRow) => {
    setBusyId(u.id);
    const { error } = await supabase.from('profiles').delete().eq('id', u.id);
    if (error) {
      setLoadError(error.message);
    } else {
      setUsers((prev) => prev.filter((p) => p.id !== u.id));
      showSuccess(`${u.username} a été supprimé`);
    }
    setConfirmDelete(null);
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
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return 'Inconnu'; }
  };

  const SortIcon = ({ field }: { field: string }) =>
    sortBy === field ? <span className="text-purple-400">{sortOrder === 'asc' ? '↑' : '↓'}</span> : <span className="text-gray-600">↕</span>;

  return (
    <main className="min-h-screen page-bg py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12">
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
              Tous les comptes enregistrés sur la plateforme — synchronisés en direct
            </p>
          </motion.div>

          {/* Alerts */}
          {loadError && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm flex items-start gap-3"
            >
              <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
              <span>{loadError}</span>
            </motion.div>
          )}
          {successMsg && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm flex items-center gap-3"
            >
              <Shield size={18} />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* Search & Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card rounded-2xl p-6 mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 size-5" />
                <input
                  type="text"
                  placeholder="Rechercher par pseudo ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 text-inherit placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all pl-12 pr-4 py-3"
                />
              </div>
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <span className="text-gray-400">{users.length} utilisateur{users.length > 1 ? 's' : ''}</span>
                <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 font-medium">
                  {users.filter((u) => u.isAdmin).length} admin{users.filter((u) => u.isAdmin).length > 1 ? 's' : ''}
                </span>
                <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 font-medium">
                  {users.filter((u) => !u.isAdmin).length} membre{users.filter((u) => !u.isAdmin).length > 1 ? 's' : ''}
                </span>
                <button onClick={fetchUsers} title="Actualiser" className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="card rounded-2xl overflow-hidden"
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
                <p className="text-gray-400">{searchQuery ? 'Aucun résultat pour cette recherche' : 'Aucun utilisateur enregistré'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('username')}>
                        <div className="flex items-center gap-2">Utilisateur <SortIcon field="username" /></div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('email')}>
                        <div className="flex items-center gap-2"><Mail size={12} />Email <SortIcon field="email" /></div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors hidden md:table-cell" onClick={() => handleSort('createdAt')}>
                        <div className="flex items-center gap-2">Inscrit le <SortIcon field="createdAt" /></div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Rôle</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((u, index) => (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.03 * index }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        {/* Avatar + pseudo */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {u.initial}
                            </div>
                            <div>
                              <p className="font-medium">{u.username}</p>
                              {u.isAdmin && (
                                <span className="text-xs text-yellow-400 font-medium">Administrateur</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4">
                          <p className="text-gray-300 text-sm">{u.email}</p>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 hidden md:table-cell">
                          <p className="text-gray-400 text-sm">{formatDate(u.createdAt)}</p>
                        </td>

                        {/* Badge rôle */}
                        <td className="px-6 py-4">
                          {u.isAdmin ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-black">
                              <Shield size={10} />Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300">
                              <User size={10} />Membre
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            {/* Toggle admin — désactivé pour soi-même */}
                            {u.email !== user.email && (
                              <button
                                onClick={() => toggleAdmin(u)}
                                disabled={busyId === u.id}
                                title={u.isAdmin ? 'Retirer le rôle admin' : 'Promouvoir admin'}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white disabled:opacity-40"
                              >
                                {busyId === u.id
                                  ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  : u.isAdmin ? <ShieldOff size={16} /> : <ShieldCheck size={16} />
                                }
                              </button>
                            )}

                            {/* Supprimer — désactivé pour soi-même */}
                            {u.email !== user.email && (
                              confirmDelete === u.id ? (
                                <div className="flex items-center gap-1 ml-1">
                                  <button
                                    onClick={() => deleteUser(u)}
                                    disabled={busyId === u.id}
                                    className="px-2 py-1 text-xs rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors disabled:opacity-40"
                                  >
                                    Confirmer
                                  </button>
                                  <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="px-2 py-1 text-xs rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
                                  >
                                    Annuler
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDelete(u.id)}
                                  title="Supprimer le compte"
                                  className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-gray-500 hover:text-red-400"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )
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

          {/* Légende */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="text-xs text-gray-500 text-center mt-4"
          >
            Les données sont lues en direct depuis Supabase · Cliquer sur une colonne pour trier
          </motion.p>

        </div>
      </main>
  );
}
