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
import CyberNavbar from '@/components/CyberNavbar';
import CyberFooter from '@/components/CyberFooter';

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
      <div className="min-h-screen bg-[#0B0A0D] py-24 flex items-center justify-center font-mono">
        <div className="text-center">
          <Loader2 size={36} className="animate-spin text-[#CA1C30] mx-auto mb-4" />
          <p className="text-xs uppercase tracking-wider text-white/50">Chargement de ta fiche personnalisée...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0A0D] py-24 flex items-center justify-center px-4 font-mono">
        <div className="reticle-box bg-[#121117] border border-white/10 p-8 max-w-md text-center">
          <AlertCircle size={44} className="text-[#CA1C30] mx-auto mb-4" />
          <h1 className="text-xl font-bold font-display uppercase tracking-wider mb-2 text-white">CONNEXION REQUISE</h1>
          <p className="text-xs text-white/50 mb-6">Connecte-toi pour accéder à ta fiche de coaching personnalisée.</p>
          <Link href="/auth" className="btn-cyber-primary text-xs py-2.5 px-6">
            SE CONNECTER
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0A0D] text-white flex flex-col font-mono">
      <CyberNavbar />

      <main className="flex-1 py-28 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Navigation retour & tabs */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4 print:hidden">
            <Link
              href="/profile"
              className="btn-cyber-ghost text-xs py-1.5 px-3 flex items-center gap-2"
            >
              <ArrowLeft size={14} />
              <span>RETOUR AU PROFIL</span>
            </Link>

            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href="/profile/coaching"
                className="px-3 py-1.5 bg-[#00B4A0]/15 hover:bg-[#00B4A0]/25 text-[#00B4A0] border border-[#00B4A0]/30 text-xs font-bold uppercase transition-colors flex items-center gap-1.5"
              >
                <MessageSquare size={13} />
                <span>CHAT AVEC LE COACH</span>
              </Link>
              <Link
                href="/profile/vod"
                className="px-3 py-1.5 bg-[#CA1C30]/15 hover:bg-[#CA1C30]/25 text-[#CA1C30] border border-[#CA1C30]/30 text-xs font-bold uppercase transition-colors flex items-center gap-1.5"
              >
                <Film size={13} />
                <span>MES CLIPS VOD</span>
              </Link>
              <button
                onClick={() => window.print()}
                className="btn-cyber-ghost text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={13} />
                <span>IMPRIMER / PDF</span>
              </button>
            </div>
          </div>

          {/* En-tête de la fiche */}
          <div className="reticle-box bg-[#121117] border border-white/10 p-6 sm:p-8 mb-8 shadow-xl print:border-none print:shadow-none print:p-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 mb-3 border border-[#00B4A0]/30 bg-[#00B4A0]/10 text-[#00B4A0] text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles size={12} />
                  <span>FICHE PERSONNALISÉE DE COACHING</span>
                </div>
                <h1 className="text-xl sm:text-3xl font-display uppercase tracking-wider text-white mb-2">
                  {title}
                </h1>
                <p className="text-xs text-white/50">
                  Rédigée et mise à jour par ton coach Poulpy
                </p>
              </div>

              {updatedAt && (
                <div className="text-xs text-white/40 flex items-center gap-1.5 print:text-black">
                  <Calendar size={13} className="text-[#00B4A0]" />
                  <span>Dernière mise à jour : {new Date(updatedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 print:hidden">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Contenu de la fiche */}
          <div className="reticle-box bg-[#121117] border border-white/10 p-6 sm:p-10 shadow-2xl min-h-[400px] print:bg-transparent print:border-none print:shadow-none print:p-0">
            {content.trim() ? (
              <SheetMarkdownPreview content={content} />
            ) : (
              <div className="py-20 text-center">
                <FileText className="w-14 h-14 text-white/20 mx-auto mb-4" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2 font-display">
                  FICHE DE SUIVI EN COURS DE PRÉPARATION
                </h3>
                <p className="text-white/40 text-xs max-w-md mx-auto mb-6">
                  Ton coach Poulpy prépare ta routine personnalisée, tes objectifs et tes axes d'amélioration. Reviens après ta première séance !
                </p>
                <Link
                  href="/profile/coaching"
                  className="btn-cyber-primary text-xs py-2.5 px-6 inline-flex items-center gap-2"
                >
                  <MessageSquare size={14} />
                  <span>ÉCHANGER AVEC LE COACH</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <CyberFooter />
    </div>
  );
}
