'use client';

import Link from 'next/link';
import {
  Film, ArrowLeft, Plus, ExternalLink, Loader2, X,
  ChevronDown, ChevronUp, Clock, AlertCircle, Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback } from 'react';
import {
  parseVideoUrl, providerLabel, providerColor,
  annotationStyle, formatTimestamp,
  type AnnotationCategory,
} from '@/lib/vod-utils';

const VALID_GAMES = [
  { value: 'valorant', label: '🔫 Valorant' },
  { value: 'apex',     label: '⚡ Apex Legends' },
  { value: 'aim',      label: '🎯 Aim Training' },
];

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

// ─── Embed miniature ──────────────────────────────────────────────────────────
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
  return (
    <div className="rounded-xl overflow-hidden border border-white/10 aspect-video w-full">
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

// ─── Carte clip (vue élève) ───────────────────────────────────────────────────
function ClipCard({ clip, token }: { clip: VodClip; token: string }) {
  const [expanded, setExpanded] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [annotations, setAnnotations] = useState<VodAnnotation[]>([]);
  const [loading, setLoading] = useState(false);

  const parsed = parseVideoUrl(clip.url);
  const gameLabel: Record<string, string> = {
    valorant: '🔫 Valorant',
    apex: '⚡ Apex',
    aim: '🎯 Aim',
  };

  const colorBadge: Record<string, string> = {
    red: 'bg-red-500/10 border-red-500/30 text-red-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    gray: 'bg-white/5 border-white/10 text-gray-400',
  };

  const fetchAnnotations = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
    }
  }, [clip.id, token]);

  useEffect(() => {
    if (expanded) fetchAnnotations();
  }, [expanded, fetchAnnotations]);

  const hasAnnotations = annotations.length > 0;

  return (
    <div className="card rounded-2xl overflow-hidden border border-white/5">
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
              })}
            </p>
          </div>
          <a
            href={clip.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Ouvrir dans un nouvel onglet"
          >
            <ExternalLink size={15} />
          </a>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setShowEmbed(v => !v)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 text-sm font-medium transition-colors"
          >
            <Film size={14} />
            {showEmbed ? 'Masquer' : 'Voir la vidéo'}
          </button>
          <button
            onClick={() => setExpanded(v => !v)}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
              hasAnnotations || expanded
                ? 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/20'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 border-white/10'
            }`}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Feedback coach
            {hasAnnotations && !expanded && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] font-bold">
                {annotations.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {showEmbed && (
        <div className="px-5 pb-4">
          <ClipEmbed url={clip.url} />
        </div>
      )}

      {expanded && (
        <div className="border-t border-white/5 p-5">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">
            Commentaires de ton coach
          </p>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : annotations.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Ton coach n&apos;a pas encore laissé de commentaire sur ce clip.
              </p>
            </div>
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
                  <div key={ann.id} className={`rounded-xl p-4 border ${borderBg}`}>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-sm font-semibold">{style.label}</span>
                      {ann.timestamp_sec !== null && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">
                          <Clock size={10} />
                          {formatTimestamp(ann.timestamp_sec)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{ann.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(ann.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function ProfileVodPage() {
  const { user, isLoading: authLoading } = useAuth();

  const [clips, setClips] = useState<VodClip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Formulaire de soumission
  const [showForm, setShowForm] = useState(false);
  const [formUrl, setFormUrl] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formGame, setFormGame] = useState('valorant');
  const [formDesc, setFormDesc] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urlPreview, setUrlPreview] = useState<ReturnType<typeof parseVideoUrl>>(null);

  // Preview live de l'URL
  useEffect(() => {
    if (formUrl.trim()) {
      setUrlPreview(parseVideoUrl(formUrl));
    } else {
      setUrlPreview(null);
    }
  }, [formUrl]);

  const fetchClips = useCallback(async () => {
    if (!user) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const tok = session?.access_token;
      if (!tok) throw new Error('Non authentifié');
      setToken(tok);

      const res = await fetch(`/api/vod/clips?studentId=${user.id}`, {
        headers: { Authorization: `Bearer ${tok}` },
        cache: 'no-store',
      });
      const data = await res.json();
      setClips(data.clips || []);

      // Marquer les annotations sur ses clips comme lues
      fetch('/api/vod/annotations/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tok}`,
        },
      }).catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) fetchClips();
    else if (!authLoading && !user) setIsLoading(false);
  }, [authLoading, user, fetchClips]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const parsed = parseVideoUrl(formUrl);
    if (!parsed) {
      setFormError('URL non reconnue. Formats acceptés : YouTube, Twitch (clip ou VOD), Medal.tv');
      return;
    }
    if (!formTitle.trim()) {
      setFormError('Le titre est obligatoire.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const tok = session?.access_token;
      if (!tok) throw new Error('Non authentifié');

      const res = await fetch('/api/vod/clips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tok}`,
        },
        body: JSON.stringify({
          url: formUrl.trim(),
          title: formTitle.trim(),
          game: formGame,
          description: formDesc.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Erreur');

      setClips(prev => [data.clip, ...prev]);
      setFormUrl('');
      setFormTitle('');
      setFormGame('valorant');
      setFormDesc('');
      setShowForm(false);
      setSuccessMsg('Clip soumis avec succès !');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorBadge: Record<string, string> = {
    red: 'bg-red-500/10 border-red-500/30 text-red-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    gray: 'bg-white/5 border-white/10 text-gray-400',
  };

  if (authLoading || isLoading) {
    return (
      <main className="min-h-screen page-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen page-bg flex items-center justify-center">
        <div className="text-center card rounded-2xl p-12 max-w-md mx-auto">
          <Film size={48} className="mx-auto mb-4 text-gray-500" />
          <h1 className="text-2xl font-bold mb-2">Connexion requise</h1>
          <p className="text-gray-400 mb-6">Connecte-toi pour accéder à tes clips VOD.</p>
          <Link href="/auth" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold hover:shadow-lg transition-all">
            Se connecter
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen page-bg py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Retour au profil
          </Link>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Film className="text-orange-400" size={28} />
                Mes clips VOD
              </h1>
              <p className="text-gray-400 mt-1">
                Soumets tes clips pour que ton coach les analyse et laisse des annotations.
              </p>
            </div>
            <button
              onClick={() => { setShowForm(v => !v); setFormError(''); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-orange-500/30 transition-all text-sm"
            >
              {showForm ? <X size={16} /> : <Plus size={16} />}
              {showForm ? 'Annuler' : 'Ajouter un clip'}
            </button>
          </div>
        </div>

        {/* Toast succès */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm flex items-center gap-2">
            <Check size={16} />
            {successMsg}
          </div>
        )}

        {/* Formulaire de soumission */}
        {showForm && (
          <div className="card rounded-2xl p-6 mb-8 border border-orange-500/20">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Plus size={18} className="text-orange-400" />
              Soumettre un clip
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* URL */}
              <div>
                <label className="block text-sm text-gray-300 mb-1.5 font-medium">
                  Lien de la vidéo <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={formUrl}
                  onChange={e => setFormUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... ou clips.twitch.tv/... ou medal.tv/..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-inherit placeholder-gray-600 focus:outline-none focus:border-orange-500 text-sm"
                />
                {/* Feedback URL */}
                {formUrl.trim() && (
                  <div className="mt-2 flex items-center gap-2">
                    {urlPreview ? (
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${colorBadge[providerColor(urlPreview.provider)]}`}>
                        ✓ {providerLabel(urlPreview.provider)} détecté
                      </span>
                    ) : (
                      <span className="text-xs text-red-400">
                        ✗ URL non reconnue (YouTube, Twitch clip/VOD, Medal.tv uniquement)
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Titre */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5 font-medium">
                    Titre <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value.slice(0, 120))}
                    placeholder="Ex: Game winning ace sur Ascent"
                    maxLength={120}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-inherit placeholder-gray-600 focus:outline-none focus:border-orange-500 text-sm"
                  />
                </div>

                {/* Jeu */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5 font-medium">Jeu</label>
                  <select
                    value={formGame}
                    onChange={e => setFormGame(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-inherit focus:outline-none focus:border-orange-500 text-sm"
                  >
                    {VALID_GAMES.map(g => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-300 mb-1.5 font-medium">
                  Description <span className="text-gray-500">(optionnel)</span>
                </label>
                <textarea
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value.slice(0, 500))}
                  placeholder="Décris la situation, ce que tu voudrais que ton coach analyse..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-inherit placeholder-gray-600 focus:outline-none focus:border-orange-500 resize-none text-sm"
                />
                <div className="text-right text-xs text-gray-500 mt-1">{formDesc.length} / 500</div>
              </div>

              {formError && (
                <p className="text-sm text-red-400">{formError}</p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !formUrl.trim() || !formTitle.trim() || !urlPreview}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 text-sm"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Soumettre le clip
                </button>
              </div>
            </form>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Liste des clips */}
        {clips.length === 0 ? (
          <div className="card rounded-2xl p-16 text-center">
            <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Aucun clip soumis</h2>
            <p className="text-gray-400 text-sm mb-6">
              Soumet un clip YouTube, Twitch ou Medal.tv pour que ton coach puisse l&apos;analyser.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl font-semibold text-white hover:shadow-lg transition-all text-sm"
            >
              <Plus size={16} />
              Ajouter mon premier clip
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              {clips.length} clip{clips.length > 1 ? 's' : ''} soumis
            </p>
            {clips.map(clip => (
              <ClipCard key={clip.id} clip={clip} token={token} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
