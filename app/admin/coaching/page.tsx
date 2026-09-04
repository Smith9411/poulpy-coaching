'use client';

import Link from 'next/link';
import { Shield, ArrowLeft, User, Search, MessageSquare, RefreshCw, Loader2, Mail, Calendar, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback, useMemo } from 'react';

interface StudentRow {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  avatarUrl?: string | null;
  initial: string;
  unreadCount: number;
}

export default function AdminCoaching() {
  const { user, isLoading: authLoading } = useAuth();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const fetchStudents = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Non authentifié');

      const [usersRes, unreadRes] = await Promise.all([
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', signal }),
        fetch('/api/admin/coaching/unread-count', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', signal }),
      ]);

      if (signal?.aborted) return;

      if (!usersRes.ok) {
        const errData = await usersRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Erreur chargement utilisateurs');
      }
      const usersData = await usersRes.json();
      const profiles = (usersData.users || []).filter((u: { isAdmin: boolean }) => !u.isAdmin);

      let unreadCounts: Record<string, number> = {};
      if (unreadRes.ok) {
        const data = await unreadRes.json();
        unreadCounts = data.counts || {};
      }

      if (signal?.aborted) return;

      const studentsData = profiles.map((p: { id: string; username: string; email: string; createdAt: string; avatarUrl: string | null; initial: string }) => ({
        id: p.id,
        username: p.username,
        email: p.email,
        isAdmin: false,
        createdAt: p.createdAt,
        avatarUrl: p.avatarUrl,
        initial: p.initial,
        unreadCount: unreadCounts[p.id] || 0,
      }));

      setStudents(studentsData);
      setError('');
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') return;
      console.error('Erreur chargement étudiants:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.isAdmin) return;
    const controller = new AbortController();
    fetchStudents(controller.signal);
    const interval = setInterval(() => fetchStudents(), 15000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [user, fetchStudents]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return students
      .filter(student =>
        student.username.toLowerCase().includes(q) ||
        student.email.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        if (b.unreadCount !== a.unreadCount) return b.unreadCount - a.unreadCount;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [students, searchQuery]);

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
          <p className="text-gray-400">Cette page est réservée aux administrateurs.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen page-bg py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Retour au panneau admin
          </Link>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Gestion du Coaching</h1>
              <p className="text-gray-400">Gérez la progression de vos étudiants</p>
            </div>
            <button
              onClick={() => fetchStudents()}
              className="inline-flex items-center gap-2 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              Actualiser
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un étudiant (pseudo ou email)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-inherit placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Students Grid */}
        {isLoading ? (
          <div className="p-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-gray-400">Chargement des étudiants...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20">
            <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              {searchQuery ? 'Aucun étudiant trouvé' : 'Aucun étudiant inscrit'}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredStudents.map((student) => {
              const hasUnread = student.unreadCount > 0;
              return (
                <Link
                  key={student.id}
                  href={`/admin/coaching/${student.id}`}
                  className={`card rounded-xl p-6 transition-all group cursor-pointer border ${
                    hasUnread
                      ? 'border-cyan-500/40 bg-cyan-500/5 hover:border-cyan-500/60 shadow-[0_0_0_1px_rgba(34,211,238,0.15),0_8px_24px_-8px_rgba(34,211,238,0.35)]'
                      : 'border-white/5 hover:border-purple-500/30 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {student.avatarUrl ? (
                        <div className={`w-12 h-12 rounded-full overflow-hidden border-2 flex-shrink-0 ${hasUnread ? 'border-cyan-400' : 'border-purple-500/30'}`}>
                          <img
                            src={student.avatarUrl}
                            alt={student.username}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold flex-shrink-0 ${hasUnread ? 'from-cyan-500 to-blue-500' : 'from-purple-500 to-cyan-500'}`}>
                          {student.initial}
                        </div>
                      )}
                      {hasUnread && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500 text-white text-[10px] font-bold ring-2 ring-page animate-pulse">
                          {student.unreadCount > 9 ? '9+' : student.unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold text-lg truncate ${hasUnread ? 'text-white' : ''}`}>
                          {student.username}
                        </span>
                        {hasUnread && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-semibold uppercase tracking-wide">
                            <Bell size={10} />
                            Nouveau
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400 flex items-center gap-2 mb-2">
                        <Mail size={14} />
                        <span className="truncate">{student.email}</span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <Calendar size={12} />
                        <span>
                          Inscrit le {new Date(student.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>

                    {/* Message Icon */}
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        hasUnread ? 'bg-cyan-500/20 group-hover:bg-cyan-500/30' : 'bg-purple-500/20 group-hover:bg-purple-500/30'
                      }`}>
                        <MessageSquare size={18} className={hasUnread ? 'text-cyan-300' : 'text-purple-400'} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card rounded-xl p-6 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {students.length}
            </div>
            <div className="text-xs text-gray-400">Étudiants actifs</div>
          </div>
          <div className="card rounded-xl p-6 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {students.filter(s => s.avatarUrl).length}
            </div>
            <div className="text-xs text-gray-400">Avec photo de profil</div>
          </div>
        </div>
      </div>
    </main>
  );
}
