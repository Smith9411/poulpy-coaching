'use client';

import Link from 'next/link';
import {
  Film, ArrowLeft, Plus, ExternalLink, Loader2, X,
  ChevronDown, ChevronUp, Clock, AlertCircle, Check, MessageSquare, FileText
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback } from 'react';
import {
  parseVideoUrl, providerLabel, providerColor,
  annotationStyle, formatTimestamp,
  type AnnotationCategory,
} from '@/lib/vod-utils';
import CyberNavbar from '@/components/CyberNavbar';
import CyberFooter from '@/components/CyberFooter';

const VALID_GAMES = [
  { value: 'valorant', label: '🔫 Valorant' },
  { value: 'apex',     label: '⚡ Apex Legends' },
  { value: 'aim',      label: '🎯 Aim Training' },
];

const CATEGORY_BADGE_CLASSES: Record<string, string> = {
  green: 'bg-[#00B4A0]/10 border-[#00B4A0]/40 text-[#00B4A0]',
  red: 'bg-[#CA1C30]/10 border-[#CA1C30]/40 text-[#CA1C30]',
  orange: 'bg-amber-500/10 border-amber-500/40 text-amber-400',
  blue: 'bg-white/10 border-white/20 text-white',
};

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
        className="flex items-center gap-2 text-[#00B4A0] hover:underline text-xs font-mono">
        <ExternalLink size={13} />
        Ouvrir le flux vidéo externe
      </a>
    );
  }
  return (
    <div className="border border-white/10 aspect-video w-full bg-black">
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
    valorant: 'VALORANT',
    apex: 'APEX LEGENDS',
    aim: 'AIM LAB / KOVAAKS',
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
    <div className="reticle-box bg-[#121117] border border-white/10 overflow-hidden font-mono">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-bold text-sm text-white truncate uppercase tracking-wider">{clip.title}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#CA1C30]/15 border border-[#CA1C30]/30 text-[#CA1C30]">
                {gameLabel[clip.game] || clip.game.toUpperCase()}
              </span>
              {parsed && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#00B4A0]/15 border border-[#00B4A0]/30 text-[#00B4A0]">
                  {providerLabel(parsed.provider).toUpperCase()}
                </span>
              )}
            </div>
            {clip.description && (
              <p className="text-xs text-white/70 mt-1 leading-relaxed">{clip.description}</p>
            )}
            <p className="text-[10px] text-white/40 mt-1.5">
              Soumis le {new Date(clip.submitted_at).toLocaleDateString('fr-FR', {
                day: '2-digit', month: 'short', year: 'numeric',
              })}
            </p>
          </div>
          <a
            href={clip.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-colors"
            title="Ouvrir dans un nouvel onglet"
          >
            <ExternalLink size={14} />
          </a>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setShowEmbed(v => !v)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#CA1C30]/15 hover:bg-[#CA1C30]/25 text-[#CA1C30] border border-[#CA1C30]/30 text-xs font-bold uppercase transition-colors cursor-pointer"
          >
            <Film size={13} />
            <span>{showEmbed ? 'MASQUER' : 'VOIR LE CLIP'}</span>
          </button>
          <button
            onClick={() => setExpanded(v => !v)}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold uppercase transition-colors border cursor-pointer ${
              hasAnnotations || expanded
                ? 'bg-[#00B4A0]/15 hover:bg-[#00B4A0]/25 text-[#00B4A0] border-[#00B4A0]/30'
                : 'bg-white/5 hover:bg-white/10 text-white/50 border-white/10'
            }`}
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            <span>FEEDBACK COACH</span>
            {hasAnnotations && !expanded && (
              <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.2 bg-[#00B4A0] text-black text-[9px] font-bold">
                {annotations.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {showEmbed && (
        <div className="px-5 pb-5">
          <ClipEmbed url={clip.url} />
        </div>
      )}

      {/* Annotations déroulées */}
      {expanded && (
        <div className="border-t border-white/10 p-5 bg-black/40 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-[#00B4A0]" />
              <span>NOTES DU COACH ({annotations.length})</span>
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-6 text-[#00B4A0]">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : annotations.length === 0 ? (
            <p className="text-xs text-white/40 italic py-2">
              Pas encore d&apos;annotations sur ce clip. Ton coach va bientôt l&apos;examiner !
            </p>
          ) : (
            <div className="space-y-2.5">
              {annotations.map(ann => {
                const style = annotationStyle(ann.category);
                return (
                  <div
                    key={ann.id}
                    className="p-3 bg-[#121117] border border-white/10 flex items-start gap-3"
                  >
                    {ann.timestamp_sec !== null && (
                      <span className="text-[10px] font-mono font-bold text-white bg-white/10 border border-white/20 px-2 py-0.5 shrink-0 flex items-center gap-1">
                        <Clock size={10} />
                        {formatTimestamp(ann.timestamp_sec)}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-bold px-2 py-0.5 uppercase border ${CATEGORY_BADGE_CLASSES[style.color] || 'bg-white/10 border-white/20 text-white'}`}>
                          {style.label}
                        </span>
                        <span className="text-[10px] text-white/40">
                          {new Date(ann.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-white/90 whitespace-pre-wrap leading-relaxed">{ann.content}</p>
                    </div>
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

export default function StudentVodPage() {
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
      setSuccessMsg('Clip soumis avec succès ! Ton coach recevra une notification.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0A0D] flex items-center justify-center font-mono">
        <Loader2 className="w-8 h-8 animate-spin text-[#CA1C30]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0A0D] flex items-center justify-center px-4 font-mono">
        <div className="reticle-box bg-[#121117] border border-white/10 p-8 max-w-md text-center">
          <Film className="w-12 h-12 text-[#CA1C30] mx-auto mb-4" />
          <h1 className="text-xl font-bold font-display uppercase tracking-wider mb-2 text-white">CONNEXION REQUISE</h1>
          <p className="text-xs text-white/50 mb-6">Connecte-toi pour soumettre tes clips et consulter les retours.</p>
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
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <Link href="/profile" className="btn-cyber-ghost text-xs py-1.5 px-3 flex items-center gap-2">
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
                  href="/profile/sheet"
                  className="px-3 py-1.5 bg-[#CA1C30]/15 hover:bg-[#CA1C30]/25 text-[#CA1C30] border border-[#CA1C30]/30 text-xs font-bold uppercase transition-colors flex items-center gap-1.5"
                >
                  <FileText size={13} />
                  <span>FICHE DE SUIVI</span>
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#CA1C30]/15 border border-[#CA1C30]/30 flex items-center justify-center text-[#CA1C30]">
                  <Film size={20} />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-wider text-white">
                    MES CLIPS VOD // <span className="text-[#CA1C30]">ANALYSES</span>
                  </h1>
                  <p className="text-xs text-white/50">Soumets tes actions clés pour un débriefing frame par frame</p>
                </div>
              </div>

              <button
                onClick={() => { setShowForm(v => !v); setFormError(''); }}
                className="btn-cyber-primary text-xs py-2.5 px-5 flex items-center gap-2 cursor-pointer"
              >
                {showForm ? <X size={15} /> : <Plus size={15} />}
                <span>{showForm ? 'ANNULER' : 'SOUMETTRE UN CLIP'}</span>
              </button>
            </div>
          </div>

          {/* Success toast */}
          {successMsg && (
            <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <Check size={15} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submission Form */}
          {showForm && (
            <div className="reticle-box bg-[#121117] border border-[#CA1C30]/40 p-6 mb-8 shadow-[0_0_20px_rgba(202, 28, 48,0.15)]">
              <h2 className="font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2 text-white">
                <Plus size={16} className="text-[#CA1C30]" />
                <span>NOUVEAU CLIP POUR ANALYSE</span>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* URL */}
                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1 uppercase tracking-wider">
                    Lien de la vidéo <span className="text-[#CA1C30]">*</span>
                  </label>
                  <input
                    type="url"
                    value={formUrl}
                    onChange={e => setFormUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... ou clips.twitch.tv/... ou medal.tv/..."
                    className="w-full px-3.5 py-2.5 bg-black border border-white/20 text-white placeholder-white/30 text-xs focus:border-[#CA1C30] focus:outline-none"
                  />
                  {formUrl.trim() && (
                    <div className="mt-2 flex items-center gap-2">
                      {urlPreview ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#00B4A0]/15 border border-[#00B4A0]/30 text-[#00B4A0]">
                          ✓ {providerLabel(urlPreview.provider).toUpperCase()} DÉTECTÉ
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-400">
                          ✗ URL non reconnue (YouTube, Twitch clip/VOD, Medal.tv uniquement)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Titre */}
                  <div>
                    <label className="block text-[11px] font-bold text-white/70 mb-1 uppercase tracking-wider">
                      Titre du clip <span className="text-[#CA1C30]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value.slice(0, 120))}
                      placeholder="Ex: Clutch 1v3 sur Bind A Site"
                      maxLength={120}
                      className="w-full px-3.5 py-2.5 bg-black border border-white/20 text-white placeholder-white/30 text-xs focus:border-[#CA1C30] focus:outline-none"
                    />
                  </div>

                  {/* Jeu */}
                  <div>
                    <label className="block text-[11px] font-bold text-white/70 mb-1 uppercase tracking-wider">
                      Discipline
                    </label>
                    <select
                      value={formGame}
                      onChange={e => setFormGame(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black border border-white/20 text-white text-xs focus:border-[#CA1C30] focus:outline-none"
                    >
                      {VALID_GAMES.map(g => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1 uppercase tracking-wider">
                    Contexte & Question au coach <span className="text-white/40">(optionnel)</span>
                  </label>
                  <textarea
                    value={formDesc}
                    onChange={e => setFormDesc(e.target.value.slice(0, 500))}
                    placeholder="Explique la situation, ton hésitation ou le point précis sur lequel tu souhaites un retour..."
                    rows={3}
                    maxLength={500}
                    className="w-full px-3.5 py-2.5 bg-black border border-white/20 text-white placeholder-white/30 text-xs focus:border-[#CA1C30] focus:outline-none resize-none"
                  />
                  <div className="text-right text-[10px] text-white/40 mt-1">{formDesc.length} / 500</div>
                </div>

                {formError && (
                  <p className="text-xs text-red-400 font-bold">{formError}</p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !formUrl.trim() || !formTitle.trim() || !urlPreview}
                    className="btn-cyber-primary text-xs py-2.5 px-6 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    <span>ENVOYER LE CLIP AU COACH</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Clips List */}
          {clips.length === 0 ? (
            <div className="reticle-box bg-[#121117] border border-white/10 p-16 text-center">
              <Film className="w-14 h-14 text-white/20 mx-auto mb-4" />
              <h2 className="text-lg font-bold font-display uppercase tracking-wider text-white mb-2">AUCUN CLIP SOUMIS</h2>
              <p className="text-white/40 text-xs max-w-md mx-auto mb-6">
                Partage un clip YouTube, Twitch ou Medal.tv pour que ton coach analyse ton placement, ton crosshair placement et tes prises de décision.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-cyber-primary text-xs py-2.5 px-6 inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus size={14} />
                <span>SOUMETTRE MON PREMIER CLIP</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {clips.length} CLIP{clips.length > 1 ? 'S' : ''} RÉPERTORIÉ{clips.length > 1 ? 'S' : ''}
                </span>
              </div>
              {clips.map(clip => (
                <ClipCard key={clip.id} clip={clip} token={token} />
              ))}
            </div>
          )}
        </div>
      </main>

      <CyberFooter />
    </div>
  );
}
