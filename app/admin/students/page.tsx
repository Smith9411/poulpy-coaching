'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Shield, Loader2, Search, MessageSquare, ChevronRight } from 'lucide-react';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  avatarUrl?: string | null;
  initial: string;
  favoriteGame?: 'valorant' | 'apex' | null;
  valorantRank?: string | null;
  apexRank?: string | null;
}

export default function AdminStudentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [gameFilter, setGameFilter] = useState<'all' | 'valorant' | 'apex'>('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (!res.ok) throw new Error('Erreur chargement');
        const data = await res.json();
        setUsers((data.users || []).filter((u: AdminUser) => !u.isAdmin));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur');
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.isAdmin) fetchUsers();
  }, [user?.isAdmin]);

  if (authLoading) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Accès refusé</h1>
          <p className="text-gray-400">Réservé aux administrateurs.</p>
        </div>
      </div>
    );
  }

  const filtered = users.filter((u) => {
    if (search && !u.username.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (gameFilter === 'valorant' && !u.valorantRank) return false;
    if (gameFilter === 'apex' && !u.apexRank) return false;
    return true;
  });

  const valorantCount = users.filter((u) => u.valorantRank).length;
  const apexCount = users.filter((u) => u.apexRank).length;

  return (
    <main className="min-h-screen page-bg py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/admin" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft size={20} />
            Retour admin
          </Link>
          <h1 className="text-3xl font-bold mb-2">Rangs des élèves</h1>
          <p className="text-gray-400">Vue d'ensemble des élèves et de leurs rangs</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="card rounded-xl p-5">
            <div className="text-sm text-gray-400 mb-1">Total élèves</div>
            <div className="text-3xl font-bold">{users.length}</div>
          </div>
          <div className="card rounded-xl p-5">
            <div className="text-sm text-gray-400 mb-1">Joueurs Valorant</div>
            <div className="text-3xl font-bold text-red-400">🔫 {valorantCount}</div>
          </div>
          <div className="card rounded-xl p-5">
            <div className="text-sm text-gray-400 mb-1">Joueurs Apex</div>
            <div className="text-3xl font-bold text-orange-400">⚡ {apexCount}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un élève..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-inherit placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex gap-2">
            {([
              { value: 'all', label: 'Tous' },
              { value: 'valorant', label: '🔫 Valorant' },
              { value: 'apex', label: '⚡ Apex' },
            ] as const).map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setGameFilter(f.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  gameFilter === f.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-400">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Aucun élève {search ? 'correspondant à la recherche' : 'pour ce filtre'}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 text-left text-gray-400 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 font-semibold">Élève</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">🔫 Valorant</th>
                    <th className="px-4 py-3 font-semibold">⚡ Apex</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                            ) : (
                              u.initial
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              {u.username}
                              {u.favoriteGame === 'valorant' && <span className="text-xs">🔫</span>}
                              {u.favoriteGame === 'apex' && <span className="text-xs">⚡</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{u.email}</td>
                      <td className="px-4 py-3">
                        {u.valorantRank ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-medium">
                            {u.valorantRank}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {u.apexRank ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-medium">
                            {u.apexRank}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/coaching/${u.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-sm font-medium transition-colors"
                        >
                          <MessageSquare size={14} />
                          Chatter
                          <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}