'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, FileText, Printer, Loader2, AlertCircle,
  Sparkles, Calendar, MessageSquare, Film
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import SheetMarkdownPreview from '@/components/admin/SheetMarkdownPreview';

export default function StudentMySheetPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [title, setTitle] = useState('Ma Fiche de Suivi');
  const [content, setContent] = useState('');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSheet = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Non authentifié');

      const res = await fetch(`/api/admin/coaching/sheet/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Erreur chargement de la fiche');
      }

      const data = await res.json();
      if (data.sheet) {
        setTitle(data.sheet.title || 'Ma Fiche de Suivi & Objectifs');
        setContent(data.sheet.content || '');
        if (data.sheet.updated_at) {
          setUpdatedAt(data.sheet.updated_at);
        }
      }
    } catch (err: unknown) {
      console.error('Erreur chargement fiche élève:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchSheet();
    }
  }, [user?.id, fetchSheet]);

  if (authLoading || (isLoading && user)) {
    return (
      <main className="min-h-screen page-bg py-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Chargement de ta fiche personnalisée...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen page-bg py-24 flex items-center justify-center px-4">
        <div className="glass p-8 rounded-2xl max-w-md text-center border border-purple-500/30">
          <AlertCircle size={48} className="text-purple-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Connexion requise</h1>
          <p className="text-gray-400 mb-6">Connecte-toi pour accéder à ta fiche de coaching personnalisée.</p>
          <Link href="/auth" className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium inline-block">
            Se connecter
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen page-bg py-20 pb-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation retour */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4 print:hidden">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            Retour au profil
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/profile/coaching"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-xs sm:text-sm font-medium transition-colors"
            >
              <MessageSquare size={15} />
              Chat avec le coach
            </Link>
            <Link
              href="/profile/vod"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 text-xs sm:text-sm font-medium transition-colors"
            >
              <Film size={15} />
              Mes clips VOD
            </Link>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg glass hover:bg-white/10 text-gray-300 text-xs sm:text-sm transition-colors"
            >
              <Printer size={15} />
              Imprimer / PDF
            </button>
          </div>
        </div>

        {/* En-tête de la fiche */}
        <div className="glass-dark rounded-2xl p-6 sm:p-8 mb-8 border border-white/10 shadow-xl print:border-none print:shadow-none print:p-0">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 glass px-3 py-1 rounded-full mb-3 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                <Sparkles size={13} />
                Fiche Personnalisée de Coaching
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
                {title}
              </h1>
              <p className="text-gray-400 text-sm">
                Rédigée et mise à jour par ton coach Poulpy
              </p>
            </div>

            {updatedAt && (
              <div className="text-xs text-gray-500 flex items-center gap-1.5 font-mono print:text-gray-600">
                <Calendar size={13} />
                Dernière mise à jour : {new Date(updatedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm flex items-center gap-2 print:hidden">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Contenu de la fiche */}
        <div className="glass-dark rounded-2xl p-6 sm:p-10 border border-white/10 shadow-2xl bg-black/40 min-h-[400px] print:bg-transparent print:border-none print:shadow-none print:p-0">
          {content.trim() ? (
            <SheetMarkdownPreview content={content} />
          ) : (
            <div className="py-20 text-center">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-300 mb-2">
                Ta fiche de suivi est en cours de préparation
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                Ton coach Poulpy prépare ta routine personnalisée, tes objectifs et tes axes d'amélioration. Reviens après ta première séance !
              </p>
              <Link
                href="/profile/coaching"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition-colors"
              >
                <MessageSquare size={16} />
                Envoyer un message au coach
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
