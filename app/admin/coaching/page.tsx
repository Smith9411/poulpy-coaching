'use client';

import Link from 'next/link';
import {
  Shield, ArrowLeft, User, Search, MessageSquare, RefreshCw,
  Loader2, Mail, Calendar, Bell, Film, Sparkles, Users
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback, useMemo } from 'react';

interface StudentRow {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  inCoaching: boolean;
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

      const studentsData = profiles.map((p: { id: string; username: string; email: string; createdAt: string; avatarUrl: string | null; initial: string; inCoaching?: boolean }) => ({
        id: p.id,
        username: p.username,
        email: p.email,
        isAdmin: false,
        inCoaching: p.inCoaching === true,
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

  const { coachedStudents, regularStudents } = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const list = students
      .filter(student =>
        student.username.toLowerCase().includes(q) ||
        student.email.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        if (b.unreadCount !== a.unreadCount) return b.unreadCount - a.unreadCount;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

    return {
      coachedStudents: list.filter(s => s.inCoaching),
      regularStudents: list.filter(s => !s.inCoaching),
    };
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

  const renderStudentCard = (student: StudentRow, isCoachedSection: boolean) => {
    const hasUnread = student.unreadCount > 0;
    return (
      <div
        key={student.id}
        className={`card rounded-xl p-5 border transition-all ${
          hasUnread
            ? 'border-cyan-500/40 bg-cyan-500/5 shadow-[0_0_0_1px_rgba(34,211,238,0.15),0_8px_24px_-8px_rgba(34,211,238,0.35)]'
            : isCoachedSection
            ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50 shadow-[0_4px_20px_-8px_rgba(16,185,129,0.15)]'
            : 'border-white/5 hover:border-purple-500/20'
        }`}
      >
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {student.avatarUrl ? (
              <div className={`w-12 h-12 rounded-full overflow-hidden border-2 flex-shrink-0 ${
                hasUnread
                  ? 'border-cyan-400'
                  : isCoachedSection
                  ? 'border-emerald-400'
                  : 'border-purple-500/30'
              }`}>
                <img
                  src={student.avatarUrl}
                  alt={student.username}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold flex-shrink-0 ${
                hasUnread
                  ? 'from-cyan-500 to-blue-500'
                  : isCoachedSection
                  ? 'from-emerald-500 to-teal-500'
                  : 'from-purple-500 to-cyan-500'
              }`}>
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
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`font-bold text-lg truncate ${hasUnread ? 'text-white' : ''}`}>
                {student.username}
              </span>
              {student.inCoaching && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold">
                  <Sparkles size={10} />
                  Coaching actuel
                </span>
              )}
              {hasUnread && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-semibold uppercase tracking-wide">
                  <Bell size={10} />
                  Nouveau
                </span>
              )}
            </div>
            <div className="text-sm text-gray-400 flex items-center gap-2 mb-1">
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
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            href={`/admin/coaching/${student.id}`}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              hasUnread
                ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30'
                : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20'
            }`}
          >
            <MessageSquare size={15} />
            Chat
            {hasUnread && (
              <span className="ml-auto inline-flex items-center justify-center w-4 h-4 rounded-full bg-cyan-500 text-white text-[9px] font-bold">
                {student.unreadCount > 9 ? '9+' : student.unreadCount}
              </span>
            )}
          </Link>
          <Link
            href={`/admin/coaching/${student.id}/clips`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20"
          >
            <Film size={15} />
            Clips VOD
          </Link>
        </div>
      </div>
    );
  };

  const totalResults = coachedStudents.length + regularStudents.length;

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
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold mb-2">Gestion du Coaching</h1>
              <p className="text-gray-400">Suis tes élèves en coaching actif et gère les échanges</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/users"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all text-sm font-medium"
              >
                <Sparkles size={16} />
                Gérer les attributions coaching
              </Link>
              <button
                onClick={() => fetchStudents()}
                className="inline-flex items-center gap-2 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors text-sm"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="mb-8">
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

        {/* Loading / Empty States */}
        {isLoading ? (
          <div className="p-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-gray-400">Chargement des étudiants...</p>
          </div>
        ) : totalResults === 0 ? (
          <div className="text-center py-20 card rounded-2xl">
            <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-300 font-semibold text-lg">
              {searchQuery ? 'Aucun étudiant trouvé' : 'Aucun étudiant inscrit'}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {searchQuery ? 'Essaie avec un autre pseudo ou email' : 'Les élèves apparaîtront ici dès leur inscription'}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* SECTION 1 : ÉLÈVES EN COACHING ACTUEL */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    Élèves en coaching actuel
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {coachedStudents.length}
                    </span>
                  </h2>
                </div>
              </div>

              {coachedStudents.length === 0 ? (
                <div className="card rounded-2xl p-8 text-center border border-white/5 bg-white/[0.02]">
                  <Sparkles className="w-10 h-10 text-emerald-400/60 mx-auto mb-2" />
                  <p className="text-gray-300 font-medium">Aucun élève en coaching actuel</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Tu peux basculer un élève en coaching avec le bouton &quot;En coaching&quot; dans la page{' '}
                    <Link href="/admin/users" className="text-purple-400 hover:underline">
                      Gérer les utilisateurs
                    </Link>.
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {coachedStudents.map(student => renderStudentCard(student, true))}
                </div>
              )}
            </div>

            {/* SECTION 2 : AUTRES ÉLÈVES */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-3 h-3 rounded-full bg-gray-500" />
                <h2 className="text-xl font-bold text-gray-200 flex items-center gap-2">
                  Autres élèves
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-gray-400 border border-white/10">
                    {regularStudents.length}
                  </span>
                </h2>
              </div>

              {regularStudents.length === 0 ? (
                <div className="card rounded-2xl p-6 text-center border border-white/5 text-gray-500 text-sm">
                  Aucun autre élève trouvé.
                </div>
              ) : (
                <div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {regularStudents.map(student => renderStudentCard(student, false))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card rounded-xl p-5 text-center border border-emerald-500/20 bg-emerald-500/5">
            <div className="text-3xl font-bold text-emerald-400">
              {students.filter(s => s.inCoaching).length}
            </div>
            <div className="text-xs text-gray-400 mt-1">En coaching actuel</div>
          </div>
          <div className="card rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-gray-300">
              {students.filter(s => !s.inCoaching).length}
            </div>
            <div className="text-xs text-gray-400 mt-1">Autres élèves</div>
          </div>
          <div className="card rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-cyan-400">
              {students.reduce((acc, s) => acc + s.unreadCount, 0)}
            </div>
            <div className="text-xs text-gray-400 mt-1">Messages non lus</div>
          </div>
          <div className="card rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-purple-400">
              {students.length}
            </div>
            <div className="text-xs text-gray-400 mt-1">Total élèves</div>
          </div>
        </div>
      </div>
    </main>
  );
}
