'use client';

import { useState } from 'react';
import { Check, Copy, Edit2, ExternalLink, Globe, Loader2, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export interface SocialLinksData {
  discord?: string | null;
  twitch?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
}

// Brand SVG Icons
export function DiscordIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

export function TwitchIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
    </svg>
  );
}

export function YoutubeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.016 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export function TiktokIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.48 6.3 6.3 0 0 0 1.86-4.47v-6.9a8.16 8.16 0 0 0 4.91 1.63v-3.71z"/>
    </svg>
  );
}

// Helpers to format links
export function formatSocialUrl(platform: 'twitch' | 'youtube' | 'tiktok', val: string): string {
  const trimmed = val.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;

  if (platform === 'twitch') {
    const handle = trimmed.replace(/^twitch\.tv\//i, '').replace(/^@/, '');
    return `https://twitch.tv/${handle}`;
  }
  if (platform === 'youtube') {
    const handle = trimmed.replace(/^youtube\.com\//i, '');
    return `https://youtube.com/${handle.startsWith('@') ? handle : '@' + handle}`;
  }
  if (platform === 'tiktok') {
    const handle = trimmed.replace(/^tiktok\.com\//i, '').replace(/^@/, '');
    return `https://tiktok.com/@${handle}`;
  }
  return trimmed;
}

export function formatSocialDisplay(platform: 'discord' | 'twitch' | 'youtube' | 'tiktok', val: string): string {
  const trimmed = val.trim();
  if (platform === 'twitch') {
    return trimmed.replace(/^https?:\/\/(www\.)?twitch\.tv\//i, '').replace(/^@/, '');
  }
  if (platform === 'youtube') {
    return trimmed.replace(/^https?:\/\/(www\.)?youtube\.com\//i, '');
  }
  if (platform === 'tiktok') {
    const clean = trimmed.replace(/^https?:\/\/(www\.)?tiktok\.com\/@?/i, '').replace(/^@/, '');
    return `@${clean}`;
  }
  return trimmed;
}

interface SocialLinksProps {
  socials?: SocialLinksData | null;
  editable?: boolean;
  compact?: boolean;
  onUpdateSuccess?: () => void;
}

export default function SocialLinks({
  socials: initialSocials,
  editable = false,
  compact = false,
  onUpdateSuccess,
}: SocialLinksProps) {
  const { user, updateSocials } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Active data source: passed prop or current logged user
  const currentSocials: SocialLinksData = initialSocials || {
    discord: user?.discord || null,
    twitch: user?.twitch || null,
    youtube: user?.youtube || null,
    tiktok: user?.tiktok || null,
  };

  const [draft, setDraft] = useState<SocialLinksData>({
    discord: currentSocials.discord || '',
    twitch: currentSocials.twitch || '',
    youtube: currentSocials.youtube || '',
    tiktok: currentSocials.tiktok || '',
  });

  const handleCopyDiscord = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedField('discord');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleOpenEdit = () => {
    setDraft({
      discord: currentSocials.discord || '',
      twitch: currentSocials.twitch || '',
      youtube: currentSocials.youtube || '',
      tiktok: currentSocials.tiktok || '',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSocials({
        discord: draft.discord?.trim() || null,
        twitch: draft.twitch?.trim() || null,
        youtube: draft.youtube?.trim() || null,
        tiktok: draft.tiktok?.trim() || null,
      });
      setIsEditing(false);
      onUpdateSuccess?.();
    } catch (err) {
      console.error('Erreur enregistrement réseaux:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const hasAnySocial =
    Boolean(currentSocials.discord?.trim()) ||
    Boolean(currentSocials.twitch?.trim()) ||
    Boolean(currentSocials.youtube?.trim()) ||
    Boolean(currentSocials.tiktok?.trim());

  // Compact Pill Row (for Coach / Admin views)
  if (compact) {
    if (!hasAnySocial) {
      return (
        <span className="text-xs text-gray-500 italic">Aucun réseau renseigné</span>
      );
    }

    return (
      <div className="flex flex-wrap items-center gap-2">
        {currentSocials.discord && (
          <button
            type="button"
            onClick={() => handleCopyDiscord(currentSocials.discord!)}
            title="Cliquer pour copier l'identifiant Discord"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#5865F2]/15 hover:bg-[#5865F2]/25 text-[#7289da] border border-[#5865F2]/30 text-xs font-medium transition-colors"
          >
            <DiscordIcon className="w-3.5 h-3.5" />
            <span>{currentSocials.discord}</span>
            {copiedField === 'discord' ? (
              <Check size={12} className="text-green-400" />
            ) : (
              <Copy size={11} className="opacity-60" />
            )}
          </button>
        )}

        {currentSocials.twitch && (
          <a
            href={formatSocialUrl('twitch', currentSocials.twitch)}
            target="_blank"
            rel="noopener noreferrer"
            title="Ouvrir la chaîne Twitch"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#9146FF]/15 hover:bg-[#9146FF]/25 text-[#a970ff] border border-[#9146FF]/30 text-xs font-medium transition-colors"
          >
            <TwitchIcon className="w-3.5 h-3.5" />
            <span>{formatSocialDisplay('twitch', currentSocials.twitch)}</span>
            <ExternalLink size={11} className="opacity-60" />
          </a>
        )}

        {currentSocials.youtube && (
          <a
            href={formatSocialUrl('youtube', currentSocials.youtube)}
            target="_blank"
            rel="noopener noreferrer"
            title="Ouvrir la chaîne YouTube"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FF0000]/15 hover:bg-[#FF0000]/25 text-[#ff4e4e] border border-[#FF0000]/30 text-xs font-medium transition-colors"
          >
            <YoutubeIcon className="w-3.5 h-3.5" />
            <span>{formatSocialDisplay('youtube', currentSocials.youtube)}</span>
            <ExternalLink size={11} className="opacity-60" />
          </a>
        )}

        {currentSocials.tiktok && (
          <a
            href={formatSocialUrl('tiktok', currentSocials.tiktok)}
            target="_blank"
            rel="noopener noreferrer"
            title="Ouvrir le compte TikTok"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-colors"
          >
            <TiktokIcon className="w-3.5 h-3.5" />
            <span>{formatSocialDisplay('tiktok', currentSocials.tiktok)}</span>
            <ExternalLink size={11} className="opacity-60" />
          </a>
        )}
      </div>
    );
  }

  // Full Minimalist Card (for Student Profile)
  return (
    <div className="card rounded-2xl p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center shadow-md">
            <Globe size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Mes réseaux</h3>
            <p className="text-xs text-gray-400">Pour échanger avec ton coach et partager tes replays</p>
          </div>
        </div>

        {editable && !isEditing && (
          <button
            type="button"
            onClick={handleOpenEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-300 transition-colors"
          >
            <Edit2 size={13} />
            <span>{hasAnySocial ? 'Modifier' : 'Ajouter'}</span>
          </button>
        )}
      </div>

      {/* Editing Form */}
      {isEditing ? (
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Discord */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                <span className="text-[#7289da]"><DiscordIcon className="w-3.5 h-3.5" /></span>
                <span>Discord</span>
              </label>
              <input
                type="text"
                value={draft.discord || ''}
                onChange={(e) => setDraft({ ...draft, discord: e.target.value })}
                placeholder="Ex: poulpy ou alex#1234"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-[#5865F2] transition-colors"
              />
            </div>

            {/* Twitch */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                <span className="text-[#a970ff]"><TwitchIcon className="w-3.5 h-3.5" /></span>
                <span>Twitch</span>
              </label>
              <input
                type="text"
                value={draft.twitch || ''}
                onChange={(e) => setDraft({ ...draft, twitch: e.target.value })}
                placeholder="Ex: twitch.tv/monpseudo ou monpseudo"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-[#9146FF] transition-colors"
              />
            </div>

            {/* YouTube */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                <span className="text-[#ff4e4e]"><YoutubeIcon className="w-3.5 h-3.5" /></span>
                <span>YouTube</span>
              </label>
              <input
                type="text"
                value={draft.youtube || ''}
                onChange={(e) => setDraft({ ...draft, youtube: e.target.value })}
                placeholder="Ex: @machaine ou youtube.com/@machaine"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            {/* TikTok */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                <span className="text-cyan-400"><TiktokIcon className="w-3.5 h-3.5" /></span>
                <span>TikTok</span>
              </label>
              <input
                type="text"
                value={draft.tiktok || ''}
                onChange={(e) => setDraft({ ...draft, tiktok: e.target.value })}
                placeholder="Ex: @moncompte ou tiktok.com/@moncompte"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-300 transition-colors disabled:opacity-50"
            >
              <X size={14} />
              <span>Annuler</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs font-bold shadow-md hover:shadow-purple-500/20 transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              <span>Enregistrer</span>
            </button>
          </div>
        </div>
      ) : hasAnySocial ? (
        /* View Mode with badges */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Discord Badge */}
          {currentSocials.discord ? (
            <button
              type="button"
              onClick={() => handleCopyDiscord(currentSocials.discord!)}
              className="flex items-center justify-between p-3 rounded-xl bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/20 text-left transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#5865F2]/20 flex items-center justify-center text-[#7289da] flex-shrink-0">
                  <DiscordIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-gray-400 block uppercase font-semibold">Discord</span>
                  <span className="text-xs sm:text-sm font-semibold text-white truncate block">
                    {currentSocials.discord}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-[#7289da] font-medium flex items-center gap-1 flex-shrink-0 pl-2">
                {copiedField === 'discord' ? (
                  <>
                    <Check size={13} className="text-green-400" />
                    <span className="text-green-400">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} className="opacity-60 group-hover:opacity-100" />
                    <span className="hidden sm:inline">Copier</span>
                  </>
                )}
              </span>
            </button>
          ) : null}

          {/* Twitch Badge */}
          {currentSocials.twitch ? (
            <a
              href={formatSocialUrl('twitch', currentSocials.twitch)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-[#9146FF]/10 hover:bg-[#9146FF]/20 border border-[#9146FF]/20 text-left transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#9146FF]/20 flex items-center justify-center text-[#a970ff] flex-shrink-0">
                  <TwitchIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-gray-400 block uppercase font-semibold">Twitch</span>
                  <span className="text-xs sm:text-sm font-semibold text-white truncate block">
                    {formatSocialDisplay('twitch', currentSocials.twitch)}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-[#a970ff] font-medium flex items-center gap-1 flex-shrink-0 pl-2">
                <span className="hidden sm:inline">Voir</span>
                <ExternalLink size={12} className="opacity-60 group-hover:opacity-100" />
              </span>
            </a>
          ) : null}

          {/* YouTube Badge */}
          {currentSocials.youtube ? (
            <a
              href={formatSocialUrl('youtube', currentSocials.youtube)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-left transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">
                  <YoutubeIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-gray-400 block uppercase font-semibold">YouTube</span>
                  <span className="text-xs sm:text-sm font-semibold text-white truncate block">
                    {formatSocialDisplay('youtube', currentSocials.youtube)}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-red-400 font-medium flex items-center gap-1 flex-shrink-0 pl-2">
                <span className="hidden sm:inline">Voir</span>
                <ExternalLink size={12} className="opacity-60 group-hover:opacity-100" />
              </span>
            </a>
          ) : null}

          {/* TikTok Badge */}
          {currentSocials.tiktok ? (
            <a
              href={formatSocialUrl('tiktok', currentSocials.tiktok)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-left transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300 flex-shrink-0">
                  <TiktokIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-gray-400 block uppercase font-semibold">TikTok</span>
                  <span className="text-xs sm:text-sm font-semibold text-white truncate block">
                    {formatSocialDisplay('tiktok', currentSocials.tiktok)}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-cyan-400 font-medium flex items-center gap-1 flex-shrink-0 pl-2">
                <span className="hidden sm:inline">Voir</span>
                <ExternalLink size={12} className="opacity-60 group-hover:opacity-100" />
              </span>
            </a>
          ) : null}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-4 px-2 border border-dashed border-white/10 rounded-xl">
          <p className="text-xs sm:text-sm text-gray-400 mb-3">
            Aucun réseau renseigné pour l&apos;instant.
          </p>
          {editable && (
            <button
              type="button"
              onClick={handleOpenEdit}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Globe size={13} />
              <span>Renseigner mes réseaux (Discord, Twitch, YouTube, TikTok)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
