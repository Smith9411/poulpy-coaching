'use client';

import Link from 'next/link';
import {
  Shield, ArrowLeft, User, Search, MessageSquare, RefreshCw,
  Loader2, Mail, Calendar, Bell, Film, Sparkles, FileText, CheckCircle2,
  Clock, Check, Copy
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback, useMemo } from 'react';

interface StudentRow {
  id: string;
  username: string;
  email: string;
  discord?: string | null;
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
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [copiedDiscordId, setCopiedDiscordId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string>('');
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

      const studentsData = profiles.map((p: {
        id: string;
        username: string;
        email: string;
        createdAt: string;
        avatarUrl: string | null;
        initial: string;
        inCoaching?: boolean;
        discord?: string | null;
      }) => ({
        id: p.id,
        username: p.username,
        email: p.email,
        discord: p.discord || null,
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

  const toggleCoachingStatus = async (studentId: string, currentStatus: boolean, studentName: string) => {
    setTogglingId(studentId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Non authentifié');

      const nextStatus = !currentStatus;
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: studentId, inCoaching: nextStatus }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Erreur lors de la mise à jour');
      }

      setStudents(prev =>
        prev.map(s => (s.id === studentId ? { ...s, inCoaching: nextStatus } : s))
      );

      if (!nextStatus) {
        setSuccessNotice(
          `Coaching terminé pour ${studentName}. L'élève est maintenant archivé dans l'Historique sans rien supprimer (fiche élève, clips et messages conservés).`
        );
      } else {
        setSuccessNotice(`${studentName} est maintenant réactivé en coaching actuel.`);
      }

      setTimeout(() => setSuccessNotice(''), 6000);
    } catch (err) {
      console.error('Erreur toggle coaching:', err);
      setError(err instanceof Error ? err.message : 'Erreur de mise à jour du statut coaching');
    } finally {
      setTogglingId(null);
    }
  };

  const { coachedStudents, historyStudents } = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const list = students
      .filter(student =>
        student.username.toLowerCase().includes(q) ||
        student.email.toLowerCase().includes(q) ||
        (student.discord && student.discord.toLowerCase().includes(q))
      )
      .sort((a, b) => {
        if (b.unreadCount !== a.unreadCount) return b.unreadCount - a.unreadCount;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

    return {
      coachedStudents: list.filter(s => s.inCoaching),
      historyStudents: list.filter(s => !s.inCoaching),
    };
  }, [students, searchQuery]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0B0A0D] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#CA1C30]" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-[#0B0A0D] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Accès refusé</h1>
          <p className="text-gray-400">Cette page est réservée aux administrateurs.</p>
        </div>
      </div>
    );
  }

  const renderStudentCard = (student: StudentRow, isActiveTab: boolean) => {
    const hasUnread = student.unreadCount > 0;
    const isToggling = togglingId === student.id;
    const displayName = student.discord || student.username;
    const displayInitial = (displayName || '?').charAt(0).toUpperCase();

    return (
      <div
        key={student.id}
        className={`reticle-box p-5 border transition-all ${
          hasUnread
            ? 'border-[#00B4A0]/40 bg-[#00B4A0]/5 shadow-[0_0_0_1px_rgba(34,211,238,0.15),0_8px_24px_-8px_rgba(34,211,238,0.35)]'
            : isActiveTab
            ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50 shadow-[0_4px_20px_-8px_rgba(16,185,129,0.15)]'
            : 'border-white/5 bg-white/[0.01] hover:border-white/20'
        }`}
      >
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {student.avatarUrl ? (
              <div className={`w-12 h-12 overflow-hidden border-2 flex-shrink-0 ${
                hasUnread
                  ? 'border-[#00B4A0]'
                  : isActiveTab
                  ? 'border-emerald-400'
                  : 'border-white/20'
              }`}>
                <img
                  src={student.avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className={`w-12 h-12 flex items-center justify-center font-bold font-display shrink-0 ${
                hasUnread
                  ? 'bg-[#00B4A0] text-black'
                  : isActiveTab
                  ? 'bg-[#00B4A0]/20 text-[#00B4A0] border border-[#00B4A0]/40'
                  : 'bg-white/10 text-gray-300 border border-white/20'
              }`}>
                {displayInitial}
              </div>
            )}
            {hasUnread && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 bg-[#00B4A0] text-white text-[10px] font-bold ring-2 ring-page animate-pulse">
                {student.unreadCount > 9 ? '9+' : student.unreadCount}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className={`font-bold text-lg truncate ${hasUnread ? 'text-white' : ''}`}>
                  {displayName}
                </span>
                {student.discord && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigator.clipboard.writeText(student.discord!);
                      setCopiedDiscordId(student.id);
                      setTimeout(() => setCopiedDiscordId(null), 2000);
                    }}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#5865F2]/15 border border-[#5865F2]/30 text-[#5865F2] hover:bg-[#5865F2]/30 hover:text-white transition-colors cursor-pointer"
                    title="Copier le pseudo Discord de l'élève"
                  >
                    <MessageSquare size={11} className="shrink-0" />
                    <span>Discord</span>
                    {copiedDiscordId === student.id ? (
                      <Check size={11} className="text-emerald-400" />
                    ) : (
                      <Copy size={10} className="opacity-70" />
                    )}
                  </button>
                )}
                {student.inCoaching ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold">
                    <Sparkles size={10} />
                    Coaching en cours
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 border border-white/15 text-gray-400 text-[10px] font-semibold">
                    <Clock size={10} />
                    Coaching terminé / Archivé
                  </span>
                )}
                {hasUnread && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#00B4A0]/15 border border-[#00B4A0]/30 text-[#00B4A0]/80 text-[10px] font-semibold uppercase tracking-wide">
                    <Bell size={10} />
                    Nouveau
                  </span>
                )}
              </div>
              <Link
                href={`/admin/coaching/${student.id}/sheet`}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#00B4A0]/15 hover:bg-[#00B4A0]/25 text-[#00B4A0] border border-[#00B4A0]/30 text-xs font-medium transition-colors ml-auto shadow-sm hover:scale-[1.02]"
                title="Consulter et éditer la fiche perso de l'élève (toujours conservée)"
              >
                <FileText size={13} />
                <span>Fiche perso</span>
              </Link>
            </div>
            <div className="text-sm text-gray-400 flex items-center gap-2 mb-1 flex-wrap">
              <Mail size={14} className="shrink-0" />
              <span className="truncate">{student.email}</span>
              {student.discord && student.username && student.username.toLowerCase() !== student.discord.toLowerCase() && (
                <span className="text-xs text-gray-500">
                  · pseudo site : <span className="text-gray-400 font-medium">{student.username}</span>
                </span>
              )}
            </div>
            {!student.discord && (
              <div className="flex items-center gap-1.5 text-xs font-mono text-gray-500 mb-1">
                <MessageSquare size={12} className="text-gray-600 shrink-0" />
                <span className="italic text-[11px]">Discord non renseigné</span>
              </div>
            )}
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <Calendar size={12} />
              <span>
                Inscrit le {new Date(student.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Link
              href={`/admin/coaching/${student.id}`}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                hasUnread
                  ? 'bg-[#00B4A0]/20 hover:bg-[#00B4A0]/30 text-[#00B4A0]/80 border border-[#00B4A0]/30'
                  : 'bg-[#CA1C30]/10 hover:bg-[#CA1C30]/20 text-[#CA1C30] border border-[#CA1C30]/20'
              }`}
            >
              <MessageSquare size={15} />
              Chat
              {hasUnread && (
                <span className="ml-auto inline-flex items-center justify-center w-4 h-4 bg-[#00B4A0] text-white text-[9px] font-bold">
                  {student.unreadCount > 9 ? '9+' : student.unreadCount}
                </span>
              )}
            </Link>
            <Link
              href={`/admin/coaching/${student.id}/clips`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20"
            >
              <Film size={15} />
              Clips VOD
            </Link>
          </div>

          {/* Quick status toggle button (Terminer ou Réactiver sans rien supprimer) */}
          <div>
            {student.inCoaching ? (
              <button
                type="button"
                disabled={isToggling}
                onClick={() => toggleCoachingStatus(student.id, true, displayName)}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-mono font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 transition-colors cursor-pointer disabled:opacity-50"
                title="Marquer le coaching comme terminé : l'élève sort des coachings en cours, mais sa fiche et son historique restent conservés intacts."
              >
                {isToggling ? (
                  <Loader2 size={13} className="animate-spin text-gray-400" />
                ) : (
                  <CheckCircle2 size={13} className="text-gray-400" />
                )}
                <span>Terminer le coaching (archiver)</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isToggling}
                onClick={() => toggleCoachingStatus(student.id, false, displayName)}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-mono font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors cursor-pointer disabled:opacity-50"
                title="Remettre cet élève dans la liste des coachings en cours."
              >
                {isToggling ? (
                  <Loader2 size={13} className="animate-spin text-emerald-400" />
                ) : (
                  <Sparkles size={13} className="text-emerald-400" />
                )}
                <span>Réactiver en coaching en cours</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const displayedList = activeTab === 'active' ? coachedStudents : historyStudents;

  return (
    <main className="min-h-screen bg-[#0B0A0D] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors font-mono text-xs"
          >
            <ArrowLeft size={16} />
            RETOUR AU PANNEAU ADMIN
          </Link>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-display font-bold text-white tracking-wider mb-2">
                GESTION DU COACHING
              </h1>
              <p className="text-gray-400 text-sm font-sans">
                Suis tes élèves en coaching actif, accède à leurs fiches et gère les échanges
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/users"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all text-xs font-mono font-bold uppercase tracking-wider"
              >
                <Sparkles size={14} />
                Tous les utilisateurs
              </Link>
              <button
                onClick={() => fetchStudents()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors text-xs font-mono font-bold uppercase tracking-wider cursor-pointer"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Success Notice / Notification */}
        {successNotice && (
          <div className="mb-6 p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between gap-3 animate-fade-in font-sans">
            <div className="flex items-center gap-2.5">
              <Check size={18} className="text-emerald-400 shrink-0" />
              <span>{successNotice}</span>
            </div>
            <button
              onClick={() => setSuccessNotice('')}
              className="text-emerald-400 hover:text-white text-xs font-mono cursor-pointer"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-sans">
            {error}
          </div>
        )}

        {/* Tabs & Search Row */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            {/* Filter Tabs: En cours vs Historique */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('active')}
                className={`px-5 py-2.5 text-xs font-mono font-bold uppercase rounded-full transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'active'
                    ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${activeTab === 'active' ? 'bg-black' : 'bg-emerald-400'}`} />
                <span>Coachings en cours</span>
                <span className={`px-2 py-0.2 rounded-full text-[10px] ${
                  activeTab === 'active' ? 'bg-black/25 text-black' : 'bg-white/10 text-white/80'
                }`}>
                  {coachedStudents.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-5 py-2.5 text-xs font-mono font-bold uppercase rounded-full transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'history'
                    ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Clock size={13} />
                <span>Historique / Anciens élèves</span>
                <span className={`px-2 py-0.2 rounded-full text-[10px] ${
                  activeTab === 'history' ? 'bg-black/25 text-black' : 'bg-white/10 text-white/80'
                }`}>
                  {historyStudents.length}
                </span>
              </button>
            </div>

            <div className="text-xs font-mono text-gray-500">
              {activeTab === 'active'
                ? `${coachedStudents.length} élève(s) actuellement en suivi`
                : `${historyStudents.length} ancien(s) élève(s) archivé(s) (fiches conservées)`}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={
                activeTab === 'active'
                  ? 'Rechercher un élève en coaching actif (pseudo ou email)...'
                  : 'Rechercher dans l\'historique des élèves (pseudo ou email)...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 text-inherit placeholder-gray-500 focus:outline-none focus:border-[#CA1C30] text-sm font-sans"
            />
          </div>
        </div>

        {/* Loading / Empty States */}
        {isLoading ? (
          <div className="p-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#CA1C30] mx-auto mb-4" />
            <p className="text-gray-400 text-sm font-mono">Chargement des étudiants...</p>
          </div>
        ) : displayedList.length === 0 ? (
          <div className="text-center py-16 reticle-box border border-white/10 bg-white/[0.01]">
            <User className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-200 font-semibold text-base font-display">
              {searchQuery
                ? 'Aucun élève trouvé pour cette recherche'
                : activeTab === 'active'
                ? 'Aucun élève actuellement en coaching'
                : 'Aucun élève dans l\'historique'}
            </p>
            <p className="text-gray-500 text-xs mt-1.5 max-w-md mx-auto font-sans leading-relaxed">
              {searchQuery
                ? 'Essaie avec un autre pseudo ou email.'
                : activeTab === 'active'
                ? 'Dès qu\'un élève réserve un coaching ou que tu l\'actives, il apparaîtra ici. Tu peux aussi réactiver un ancien élève depuis l\'onglet Historique.'
                : 'Les élèves dont le coaching est terminé apparaîtront ici. Toutes leurs fiches et VODs restent consultables à tout moment.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayedList.map(student => renderStudentCard(student, activeTab === 'active'))}
            </div>
          </div>
        )}

        {/* Stats footer */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="reticle-box p-5 text-center border border-emerald-500/20 bg-emerald-500/5">
            <div className="text-3xl font-bold font-display text-emerald-400">
              {students.filter(s => s.inCoaching).length}
            </div>
            <div className="text-xs text-gray-400 mt-1 font-mono">En coaching actuel</div>
          </div>
          <div className="reticle-box p-5 text-center border border-white/10 bg-white/[0.02]">
            <div className="text-3xl font-bold font-display text-gray-300">
              {students.filter(s => !s.inCoaching).length}
            </div>
            <div className="text-xs text-gray-400 mt-1 font-mono">Anciens élèves / Inactifs</div>
          </div>
          <div className="reticle-box p-5 text-center border border-cyan-500/20 bg-cyan-500/5">
            <div className="text-3xl font-bold font-display text-[#00B4A0]">
              {students.reduce((acc, s) => acc + s.unreadCount, 0)}
            </div>
            <div className="text-xs text-gray-400 mt-1 font-mono">Messages non lus</div>
          </div>
          <div className="reticle-box p-5 text-center border border-[#CA1C30]/20 bg-[#CA1C30]/5">
            <div className="text-3xl font-bold font-display text-[#CA1C30]">
              {students.length}
            </div>
            <div className="text-xs text-gray-400 mt-1 font-mono">Total comptes inscrits</div>
          </div>
        </div>
      </div>
    </main>
  );
}
