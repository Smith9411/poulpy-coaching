'use client';

import Link from 'next/link';
import { Shield, ArrowLeft, User, Search, MessageSquare, RefreshCw, Loader2, Mail, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback } from 'react';

interface StudentRow {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  avatarUrl?: string | null;
  initial: string;
}

export default function AdminCoaching() {
  const { user, isLoading: authLoading } = useAuth();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const studentsData = profiles
        .filter((p: any) => !p.is_admin)
        .map((p: any) => ({
          id: p.id,
          username: p.username,
          email: p.email || '',
          isAdmin: p.is_admin,
          createdAt: p.created_at,
          avatarUrl: p.avatar_url,
          initial: p.username.charAt(0).toUpperCase(),
        }));

      setStudents(studentsData);
    } catch (error) {
      console.error('Erreur chargement étudiants:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchStudents();
    }
  }, [user, fetchStudents]);

  const filteredStudents = students.filter(student =>
    student.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              onClick={fetchStudents}
              className="inline-flex items-center gap-2 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              Actualiser
            </button>
          </div>
        </div>

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
            {filteredStudents.map((student) => (
              <Link
                key={student.id}
                href={`/admin/coaching/${student.id}`}
                className="card rounded-xl p-6 hover:bg-white/5 transition-all group cursor-pointer border border-white/5 hover:border-purple-500/30"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  {student.avatarUrl ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500/30 flex-shrink-0">
                      <img
                        src={student.avatarUrl}
                        alt={student.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {student.initial}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg mb-1 truncate">{student.username}</div>
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
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                      <MessageSquare size={18} className="text-purple-400" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
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
