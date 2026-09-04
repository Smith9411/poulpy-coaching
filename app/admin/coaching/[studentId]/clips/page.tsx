'use client';

import Link from 'next/link';
import {
  Shield, ArrowLeft, Film, Loader2, AlertCircle, Trash2,
  Plus, ExternalLink, ChevronDown, ChevronUp, Send, X, Clock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  parseVideoUrl, providerLabel, providerColor,
  annotationStyle, formatTimestamp, ANNOTATION_CATEGORIES,
  type AnnotationCategory,
} from '@/lib/vod-utils';

interface VodClip {
  id: string;
  student_id: string;
  url: string;
  title: string;
  game: string;
  description: string | null;
  submitted_at: string;
}

interface VodAnnotation {
  id: string;
  clip_id: string;
  admin_id: string;
  timestamp_sec: number | null;
  category: AnnotationCategory;
  content: string;
  created_at: string;
}

interface StudentProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  initial: string;
}

// ─── Mini player / embed inline ─────────────────────────────────────────────
function ClipEmbed({ url }: { url: string }) {
  const parsed = parseVideoUrl(url);
  if (!parsed) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 text-blue-400 hover:underline text-sm">
        <ExternalLink size={14} />
        Ouvrir le lien
      </a>
    );
  }

  const colorMap: Record<string, string> = {
    red: 'border-red-500/40',
    purple: 'border-purple-500/40',
    yellow: 'border-yellow-500/40',
    gray: 'border-white/20',
  };
  const borderColor = colorMap[providerColor(parsed.provider)] ?? 'border-white/20';

  return (
    <div className={`rounded-xl overflow-hidden border ${borderColor} aspect-video w-full`}>
      <iframe
        src={parsed.embedUrl}
        className="w-full h-full"
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture"
        loading="lazy"
        title={`Embed ${providerLabel(parsed.provider)}`}
      />
    </div>
  );
}

// ─── Carte d'un clip ──────────────────────────────────────────────────────────
function ClipCard({
  clip,
  token,
  onDeleted,
}: {
  clip: VodClip;
  token: string;
  onDeleted: (clipId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [annotations, setAnnotations] = useState<VodAnnotation[]>([]);
  const [loadingAnnotations, setLoadingAnnotations] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Formulaire annotation
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<AnnotationCategory>('general');
  const [newTimestampRaw, setNewTimestampRaw] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [formError, setFormError] = useState('');

  const parsed = parseVideoUrl(clip.url);
  const gameLabel: Record<string, string> = {
    valorant: '🔫 Valorant',
    apex: '⚡ Apex',
    aim: '🎯 Aim',
  };

  const fetchAnnotations = useCallback(async () => {
    setLoadingAnnotations(true);
    try {
      const res = await fetch(`/api/vod/annotations?clipId=${clip.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const data = await res.json();
      setAnnotations(data.annotations || []);
    } catch {
      // silently fail
    } finally {
      setLoadingAnnotations(false);
    }
  }, [clip.id, token]);

  useEffect(() => {
    if (expanded) fetchAnnotations();
  }, [expanded, fetchAnnotations]);

  // Convertit mm:ss ou nombre brut en secondes
  function parseTimestamp(raw: string): number | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10);
    const parts = trimmed.split(':');
    if (parts.length === 2) {
      const m = parseInt(parts[0], 10);
      const s = parseInt(parts[1], 10);
      if (!isNaN(m) && !isNaN(s)) return m * 60 + s;
    }
    return null;
  }

  const handleAddAnnotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const trimmed = newContent.trim();
    if (!trimmed) return;

    const tsec = parseTimestamp(newTimestampRaw);
    if (newTimestampRaw.trim() && tsec === null) {
      setFormError('Format de timestamp invalide. Utilise mm:ss ou un nombre de secondes.');
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch('/api/vod/annotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clipId: clip.id,
          content: trimmed,
          category: newCategory,
          timestampSec: tsec,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Erreur');
      setNewContent('');
      setNewTimestampRaw('');
      setNewCategory('general');
      await fetchAnnotations();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteAnnotation = async (annotationId: string) => {
    try {
      const res = await fetch(`/api/vod/annotations?annotationId=${annotationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAnnotations(prev => prev.filter(a => a.id !== annotationId));
      }
    } catch {
      // silently fail
    }
  };

  const handleDeleteClip = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/vod/clips?clipId=${clip.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        onDeleted(clip.id);
      }
    } catch {
      // silently fail
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const colorBadge: Record<string, string> = {
    red: 'bg-red-500/10 border-red-500/30 text-red-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    gray: 'bg-white/5 border-white/10 text-gray-400',
  };

  return (
    <div className="card rounded-2xl overflow-hidden border border-white/5">
      {/* Header du clip */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-bold text-white truncate">{clip.title}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
                {gameLabel[clip.game] || clip.game}
              </span>
              {parsed && (
                <span className={`text-xs px-2 py-0.5 rounded-full border ${colorBadge[providerColor(parsed.provider)]}`}>
                  {providerLabel(parsed.provider)}
                </span>
              )}
            </div>
            {clip.description && (
              <p className="text-sm text-gray-400 mt-1">{clip.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Soumis le {new Date(clip.submitted_at).toLocaleDateString('fr-FR', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={clip.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink size={15} />
            </a>
            {!showConfirmDelete ? (
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                title="Supprimer ce clip"
              >
                <Trash2 size={15} />
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleDeleteClip}
                  disabled={isDeleting}
                  className="px-2 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  Confirmer
                </button>
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setShowEmbed(v => !v)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 text-sm font-medium transition-colors"
          >
            <Film size={14} />
            {showEmbed ? 'Masquer la vidéo' : 'Voir la vidéo'}
          </button>
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-sm font-medium transition-colors"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Annotations
            {annotations.length > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] font-bold">
                {annotations.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Embed vidéo */}
      {showEmbed && (
        <div className="px-5 pb-4">
          <ClipEmbed url={clip.url} />
        </div>
      )}

      {/* Section annotations */}
      {expanded && (
        <div className="border-t border-white/5 p-5 space-y-4">
          {loadingAnnotations ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : annotations.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Aucune annotation pour ce clip.</p>
          ) : (
            <div className="space-y-3">
              {annotations.map(ann => {
                const style = annotationStyle(ann.category);
                const colorStyles: Record<string, string> = {
                  green: 'border-green-500/30 bg-green-500/5',
                  red: 'border-red-500/30 bg-red-500/5',
                  orange: 'border-orange-500/30 bg-orange-500/5',
                  blue: 'border-blue-500/30 bg-blue-500/5',
                };
                const borderBg = colorStyles[style.color] ?? 'border-white/10 bg-white/5';
                return (
                  <div key={ann.id} className={`rounded-xl p-3 border ${borderBg}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-semibold">{style.label}</span>
                          {ann.timestamp_sec !== null && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">
                              <Clock size={10} />
                              {formatTimestamp(ann.timestamp_sec)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-200 whitespace-pre-wrap">{ann.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(ann.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteAnnotation(ann.id)}
                        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                        title="Supprimer cette annotation"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Formulaire d'ajout d'annotation */}
          <form onSubmit={handleAddAnnotation} className="space-y-3 pt-2 border-t border-white/5">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Ajouter une annotation</p>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Catégorie</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as AnnotationCategory)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-inherit text-sm focus:outline-none focus:border-purple-500"
                >
                  {ANNOTATION_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Timestamp (optionnel)</label>
                <input
                  type="text"
                  value={newTimestampRaw}
                  onChange={e => setNewTimestampRaw(e.target.value)}
                  placeholder="ex: 1:23 ou 83"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-inherit placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <textarea
              value={newContent}
              onChange={e => setNewContent(e.target.value.slice(0, 1000))}
              placeholder="Ton commentaire sur ce moment de la vidéo..."
              rows={3}
              maxLength={1000}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-inherit placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500 resize-none"
            />

            {formError && (
              <p className="text-xs text-red-400">{formError}</p>
            )}

            <div className="flex items-center justify-between">
              <span className={`text-xs ${newContent.length >= 950 ? 'text-orange-400' : 'text-gray-500'}`}>
                {newContent.length} / 1000
              </span>
              <button
                type="submit"
                disabled={isSending || !newContent.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg text-sm font-semibold text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
              >
                {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Envoyer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function StudentClipsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const params = useParams();
  const studentId = params.studentId as string;

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [clips, setClips] = useState<VodClip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const tok = session?.access_token;
      if (!tok) throw new Error('Non authentifié');
      setToken(tok);

      // Charger profil étudiant
      const profileRes = await fetch(`/api/admin/users?userId=${encodeURIComponent(studentId)}`, {
        headers: { Authorization: `Bearer ${tok}` },
        cache: 'no-store',
      });
      if (!profileRes.ok) throw new Error('Erreur chargement profil');
      const profileData = await profileRes.json();
      const profile = (profileData.users || []).find((u: { id: string }) => u.id === studentId);
      if (!profile) throw new Error('Étudiant non trouvé');
      setStudent({
        id: profile.id,
        username: profile.username,
        email: profile.email || '',
        avatarUrl: profile.avatarUrl,
        initial: profile.initial,
      });

      // Charger clips
      const clipsRes = await fetch(`/api/vod/clips?studentId=${encodeURIComponent(studentId)}`, {
        headers: { Authorization: `Bearer ${tok}` },
        cache: 'no-store',
      });
      if (!clipsRes.ok) {
        const d = await clipsRes.json().catch(() => ({}));
        throw new Error(d.error || 'Erreur chargement clips');
      }
      const clipsData = await clipsRes.json();
      setClips(clipsData.clips || []);

      // Marquer les clips de cet élève comme vus par le coach
      fetch('/api/vod/clips/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tok}`,
        },
        body: JSON.stringify({ studentId }),
      }).catch(() => {});
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (user?.isAdmin && studentId) fetchData();
  }, [user, studentId, fetchData]);

  const handleClipDeleted = (clipId: string) => {
    setClips(prev => prev.filter(c => c.id !== clipId));
  };

  if (authLoading || isLoading) {
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

  if (error && !student) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">{error}</p>
          <Link href="/admin/coaching" className="inline-flex items-center gap-2 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft size={18} />
            Retour
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen page-bg py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/admin/coaching"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              Retour
            </Link>
            <span className="text-gray-600">/</span>
            <Link
              href={`/admin/coaching/${studentId}`}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Chat
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {student?.avatarUrl ? (
              <img src={student.avatarUrl} alt={student?.username} className="w-12 h-12 rounded-full object-cover border-2 border-orange-500/30" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold text-lg">
                {student?.initial}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Film className="text-orange-400" size={28} />
                Clips VOD — {student?.username}
              </h1>
              <p className="text-gray-400 text-sm">{student?.email}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {clips.length === 0 ? (
          <div className="card rounded-2xl p-16 text-center">
            <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Aucun clip soumis</h2>
            <p className="text-gray-400 text-sm">
              {student?.username} n&apos;a pas encore soumis de clip VOD.<br />
              L&apos;élève peut en ajouter depuis son profil.
            </p>
            <div className="mt-6 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 text-orange-300 text-sm">
              <Plus size={14} className="inline mr-1" />
              Les clips sont soumis par l&apos;élève depuis <strong>/profile/vod</strong>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-400 text-sm">
                {clips.length} clip{clips.length > 1 ? 's' : ''} soumis
              </p>
            </div>
            {clips.map(clip => (
              <ClipCard
                key={clip.id}
                clip={clip}
                token={token}
                onDeleted={handleClipDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
