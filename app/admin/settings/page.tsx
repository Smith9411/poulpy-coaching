'use client';

import { Shield, ArrowLeft, Save, RotateCcw, Globe, AlertTriangle, CheckCircle2, ExternalLink, MessageCircle, Mail, FileText, Type } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

const YoutubeIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const TwitchIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
  </svg>
);

const DEFAULTS = {
  siteName: 'Poulpy Coaching',
  description: "Coaching compétitif pour joueurs Valorant, Apex Legends et passionnés d'aim.",
  contactEmail: 'poulpy.coaching@gmail.com',
  discordUrl: 'https://discord.gg/rJMg3ZZRkp',
  youtubeUrl: 'https://www.youtube.com/watch?v=4gfWbGCA5q0',
  twitchUrl: 'https://www.twitch.tv/poulpy_coaching',
} as const;

type FormData = {
  siteName: string;
  description: string;
  contactEmail: string;
  discordUrl: string;
  youtubeUrl: string;
  twitchUrl: string;
};
type Status = { type: 'success' | 'error'; text: string } | null;

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    let videoId: string | null = null;

    if (u.hostname.includes('youtube.com')) {
      videoId = u.searchParams.get('v');
    } else if (u.hostname === 'youtu.be') {
      videoId = u.pathname.slice(1);
    }

    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
}

function getTwitchChannel(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!u.hostname.includes('twitch.tv')) return null;
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return null;
    return parts[parts.length - 1];
  } catch {
    return null;
  }
}

function isValidUrl(value: string): boolean {
  if (!value) return true;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function AdminSettings() {
  const { user, isLoading: authLoading } = useAuth();
  const [status, setStatus] = useState<Status>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tableMissing, setTableMissing] = useState(false);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [formData, setFormData] = useState<FormData>({ ...DEFAULTS });

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatus({ type, text });
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    statusTimerRef.current = setTimeout(() => setStatus(null), 5000);
  };

  // Fetch settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();

        if (data.warning) {
          setTableMissing(true);
        }

        if (data.settings && Object.keys(data.settings).length > 0) {
          setFormData({
            siteName: data.settings.site_name || DEFAULTS.siteName,
            description: data.settings.description || DEFAULTS.description,
            contactEmail: data.settings.contact_email || DEFAULTS.contactEmail,
            discordUrl: data.settings.discord_url || DEFAULTS.discordUrl,
            youtubeUrl: data.settings.youtube_url || DEFAULTS.youtubeUrl,
            twitchUrl: data.settings.twitch_url || DEFAULTS.twitchUrl,
          });
        }
      } catch (error) {
        console.error('Erreur chargement settings:', error);
        showStatus('error', 'Impossible de charger les paramètres.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  if (authLoading || isLoading) {
    return (
      <main className="min-h-screen page-bg py-24 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!user || !user.isAdmin) {
    return (
      <main className="min-h-screen page-bg py-24 flex items-center justify-center">
        <div className="text-center card rounded-2xl p-12 max-w-md mx-auto px-4">
          <Shield size={64} className="mx-auto mb-6 text-gray-500" />
          <h1 className="text-3xl font-bold mb-4">Accès refusé</h1>
          <p className="text-gray-400 mb-8">Tu n&apos;as pas les permissions d&apos;administrateur.</p>
          <Link href="/admin" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
            Retour à l&apos;admin
          </Link>
        </div>
      </main>
    );
  }

  const youtubeEmbed = getYouTubeEmbedUrl(formData.youtubeUrl);
  const twitchChannel = getTwitchChannel(formData.twitchUrl);

  const urlErrors = {
    discord: formData.discordUrl && !isValidUrl(formData.discordUrl) ? 'URL invalide' : '',
    youtube: formData.youtubeUrl && !isValidUrl(formData.youtubeUrl) ? 'URL invalide' : '',
    twitch: formData.twitchUrl && !isValidUrl(formData.twitchUrl) ? 'URL invalide' : '',
    email: formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail) ? 'Email invalide' : '',
  };

  const hasErrors = Object.values(urlErrors).some((e) => e);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasErrors) {
      showStatus('error', 'Corrige les URLs invalides avant de sauvegarder.');
      return;
    }

    setIsSaving(true);
    try {
      let { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();
        if (refreshErr || !refreshData.session) {
          throw new Error('Session expirée, reconnectez-vous.');
        }
        session = refreshData.session;
      }

      const token = session.access_token;
      if (!token) throw new Error('Session expirée, reconnectez-vous.');

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          settings: {
            site_name: formData.siteName.trim(),
            description: formData.description.trim(),
            contact_email: formData.contactEmail.trim(),
            discord_url: formData.discordUrl.trim(),
            youtube_url: formData.youtubeUrl.trim(),
            twitch_url: formData.twitchUrl.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        if (data.error?.includes('table') && data.error?.includes('settings')) {
          setTableMissing(true);
        }
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      setTableMissing(false);
      showStatus('success', `${data.updated} paramètre${data.updated > 1 ? 's' : ''} enregistré${data.updated > 1 ? 's' : ''} avec succès !`);

      // Déclencher un événement pour que les composants (About, Hero, etc.) rechargent
      window.dispatchEvent(new CustomEvent('settings-updated', { detail: data }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
      showStatus('error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({ ...DEFAULTS });
    showStatus('success', 'Formulaire réinitialisé aux valeurs par défaut.');
  };

  const fields = [
    {
      section: 'Identité du site',
      icon: Type,
      color: 'text-purple-400',
      items: [
        {
          key: 'siteName' as const,
          label: 'Nom du site',
          type: 'text',
          icon: Type,
          tooltip: 'Nom affiché dans l\'en-tête du site',
          placeholder: DEFAULTS.siteName,
        },
        {
          key: 'description' as const,
          label: 'Description',
          type: 'textarea',
          icon: FileText,
          tooltip: 'Description courte du site pour les moteurs de recherche',
          placeholder: DEFAULTS.description,
        },
        {
          key: 'contactEmail' as const,
          label: 'Email de contact',
          type: 'email',
          icon: Mail,
          tooltip: 'Email public pour les demandes de contact',
          placeholder: DEFAULTS.contactEmail,
          error: urlErrors.email,
        },
      ],
    },
    {
      section: 'Réseaux sociaux & médias',
      icon: Globe,
      color: 'text-cyan-400',
      items: [
        {
          key: 'discordUrl' as const,
          label: 'URL Discord',
          type: 'url',
          icon: MessageCircle,
          tooltip: 'Lien d\'invitation vers le serveur Discord',
          placeholder: DEFAULTS.discordUrl,
          error: urlErrors.discord,
        },
        {
          key: 'youtubeUrl' as const,
          label: 'Lien vidéo YouTube',
          type: 'url',
          icon: YoutubeIcon,
          tooltip: 'URL YouTube (ex: https://www.youtube.com/watch?v=XXXXX ou youtu.be/XXXXX)',
          placeholder: DEFAULTS.youtubeUrl,
          error: urlErrors.youtube,
        },
        {
          key: 'twitchUrl' as const,
          label: 'Lien chaîne Twitch',
          type: 'url',
          icon: TwitchIcon,
          tooltip: 'URL de la chaîne Twitch (ex: https://www.twitch.tv/nom_chaine)',
          placeholder: DEFAULTS.twitchUrl,
          error: urlErrors.twitch,
        },
      ],
    },
  ];

  return (
    <main className="min-h-screen page-bg py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <Link href="/admin" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft size={20} />
            Retour admin
          </Link>
          <div>
            <div className="inline-block glass px-4 py-2 rounded-full mb-4">
              <span className="text-sm text-yellow-400 font-medium">PARAMÈTRES</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Paramètres <span className="text-gradient">du site</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              Configuration globale de la plateforme Poulpy Coaching. Les changements sont sauvegardés en base et s&apos;appliquent immédiatement sur tout le site.
            </p>
          </div>
        </div>

        {tableMissing && (
          <div className="mb-6 p-5 rounded-xl bg-orange-500/10 border border-orange-500/40 text-orange-200">
            <div className="flex items-start gap-3">
              <AlertTriangle size={22} className="text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1 text-orange-300">Table Supabase manquante</h3>
                <p className="text-sm text-orange-200/80 mb-3">
                  La table <code className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-100">settings</code> n&apos;existe pas encore dans ta base Supabase.
                  Les paramètres ne peuvent pas être sauvegardés tant qu&apos;elle n&apos;est pas créée.
                </p>
                <p className="text-sm text-orange-200/80">
                  <strong>Étapes :</strong>
                </p>
                <ol className="text-sm text-orange-200/80 list-decimal list-inside mt-1 space-y-1">
                  <li>Ouvre le <strong>SQL Editor</strong> dans ton dashboard Supabase</li>
                  <li>Copie-colle le contenu du fichier <code className="px-1 py-0.5 rounded bg-orange-500/20">create-settings-table.sql</code></li>
                  <li>Exécute le script, puis reviens ici sauvegarder</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {status && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
              status.type === 'success'
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : 'bg-red-500/20 border border-red-500/30 text-red-400'
            }`}
          >
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{status.text}</span>
          </div>
        )}

        <form className="space-y-8" onSubmit={handleSave}>
          {fields.map((section) => (
            <div key={section.section} className="card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <section.icon size={20} className={section.color} />
                </div>
                <h3 className="text-xl font-bold">{section.section}</h3>
              </div>

              <div className="space-y-5">
                {section.items.map((field) => {
                  const FieldIcon = field.icon;
                  return (
                    <div key={field.key} className="grid sm:grid-cols-[220px_1fr] gap-4 items-start">
                      <div className="flex items-center gap-2 pt-3">
                        <FieldIcon size={16} className="text-gray-400 flex-shrink-0" />
                        <label className="text-sm font-medium text-gray-300">
                          {field.label}
                        </label>
                      </div>
                      <div>
                        {field.type === 'textarea' ? (
                          <textarea
                            value={formData[field.key]}
                            onChange={(e) => updateField(field.key, e.target.value)}
                            rows={3}
                            placeholder={field.placeholder}
                            className={`w-full rounded-xl bg-white/5 border text-inherit placeholder-gray-500 focus:outline-none focus:ring-1 transition-all px-4 py-3 ${
                              field.error
                                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50'
                                : 'border-white/10 focus:border-purple-500/50 focus:ring-purple-500/50'
                            }`}
                          />
                        ) : (
                          <input
                            type={field.type}
                            value={formData[field.key]}
                            onChange={(e) => updateField(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className={`w-full rounded-xl bg-white/5 border text-inherit placeholder-gray-500 focus:outline-none focus:ring-1 transition-all px-4 py-3 ${
                              field.error
                                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50'
                                : 'border-white/10 focus:border-purple-500/50 focus:ring-purple-500/50'
                            }`}
                          />
                        )}
                        {field.error && (
                          <p className="text-xs text-red-400 mt-1.5">{field.error}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Live Preview */}
          <div className="card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <ExternalLink size={20} className="text-green-400" />
              </div>
              <h3 className="text-xl font-bold">Aperçu en temps réel</h3>
            </div>
            <p className="text-sm text-gray-400 mb-5">
              Voici comment les liens apparaîtront sur le site après sauvegarde.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* YouTube preview */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <YoutubeIcon size={18} />
                  <span className="font-semibold text-sm">YouTube</span>
                </div>
                {youtubeEmbed ? (
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                    <iframe
                      src={youtubeEmbed}
                      title="Aperçu YouTube"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full rounded-lg bg-black/40 flex items-center justify-center text-gray-500 text-xs">
                    Aucune vidéo détectée (URL YouTube invalide)
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2 truncate">{formData.youtubeUrl || DEFAULTS.youtubeUrl}</p>
              </div>

              {/* Twitch preview */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TwitchIcon size={18} />
                  <span className="font-semibold text-sm">Twitch</span>
                </div>
                {twitchChannel ? (
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                    <iframe
                      src={`https://player.twitch.tv/?channel=${twitchChannel}&parent=localhost`}
                      title="Aperçu Twitch"
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full rounded-lg bg-black/40 flex items-center justify-center text-gray-500 text-xs">
                    Aucune chaîne détectée (URL Twitch invalide)
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2 truncate">{formData.twitchUrl || DEFAULTS.twitchUrl}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/5">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 card rounded-xl font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <RotateCcw size={18} />
              Réinitialiser
            </button>
            <button
              type="submit"
              disabled={isSaving || hasErrors || tableMissing}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Sauvegarder
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}