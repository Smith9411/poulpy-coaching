/**
 * vod-utils.ts
 * Parse et normalise les URLs de clips vidéo pour YouTube, Twitch et Medal.tv.
 * Génère les URLs d'embed et de thumbnail correspondantes.
 */

export type VideoProvider = 'youtube' | 'twitch_clip' | 'twitch_vod' | 'medal' | 'unknown';

export interface ParsedVideo {
  provider: VideoProvider;
  /** ID de la vidéo / clip côté fournisseur */
  videoId: string;
  /** URL d'embed à utiliser dans une <iframe> */
  embedUrl: string;
  /** URL de la miniature (peut être vide si non disponible) */
  thumbnailUrl: string;
  /** URL de la page d'origine normalisée */
  originalUrl: string;
}

/**
 * Tente d'extraire les informations de lecture depuis une URL de clip.
 * Retourne null si l'URL n'est pas reconnue.
 */
export function parseVideoUrl(rawUrl: string): ParsedVideo | null {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, '');

  // ─── YouTube ────────────────────────────────────────────────────────────────
  // Formats supportés :
  //   https://www.youtube.com/watch?v=VIDEO_ID
  //   https://youtu.be/VIDEO_ID
  //   https://www.youtube.com/shorts/VIDEO_ID
  //   https://www.youtube.com/embed/VIDEO_ID
  if (host === 'youtube.com' || host === 'youtu.be') {
    let videoId: string | null = null;

    if (host === 'youtu.be') {
      videoId = url.pathname.replace(/^\//, '').split('/')[0] || null;
    } else {
      videoId =
        url.searchParams.get('v') ||
        (url.pathname.startsWith('/shorts/') || url.pathname.startsWith('/embed/')
          ? url.pathname.split('/').pop() || null
          : null);
    }

    if (!videoId) return null;

    return {
      provider: 'youtube',
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      originalUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };
  }

  // ─── Twitch Clips ────────────────────────────────────────────────────────────
  // Format : https://clips.twitch.tv/CLIP_SLUG
  //          https://www.twitch.tv/CHANNEL/clip/CLIP_SLUG
  if (host === 'clips.twitch.tv') {
    const slug = url.pathname.replace(/^\//, '').split('/')[0];
    if (!slug) return null;
    return {
      provider: 'twitch_clip',
      videoId: slug,
      embedUrl: `https://clips.twitch.tv/embed?clip=${slug}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}`,
      thumbnailUrl: '',
      originalUrl: `https://clips.twitch.tv/${slug}`,
    };
  }

  if (host === 'twitch.tv') {
    const parts = url.pathname.split('/').filter(Boolean);
    // /channel/clip/SLUG
    if (parts[1] === 'clip' && parts[2]) {
      const slug = parts[2];
      return {
        provider: 'twitch_clip',
        videoId: slug,
        embedUrl: `https://clips.twitch.tv/embed?clip=${slug}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}`,
        thumbnailUrl: '',
        originalUrl: `https://clips.twitch.tv/${slug}`,
      };
    }
    // /videos/VIDEO_ID (VOD)
    if (parts[0] === 'videos' && parts[1]) {
      const vodId = parts[1];
      return {
        provider: 'twitch_vod',
        videoId: vodId,
        embedUrl: `https://player.twitch.tv/?video=${vodId}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}&autoplay=false`,
        thumbnailUrl: '',
        originalUrl: `https://www.twitch.tv/videos/${vodId}`,
      };
    }
    return null;
  }

  // ─── Medal.tv ────────────────────────────────────────────────────────────────
  // Format : https://medal.tv/games/GAME/clips/CLIP_ID
  //          https://medal.tv/clips/CLIP_ID
  if (host === 'medal.tv') {
    const parts = url.pathname.split('/').filter(Boolean);
    // /games/GAME/clips/CLIP_ID  ou  /clips/CLIP_ID
    const clipIndex = parts.indexOf('clips');
    const clipId = clipIndex !== -1 ? parts[clipIndex + 1] : null;
    if (!clipId) return null;
    return {
      provider: 'medal',
      videoId: clipId,
      // Medal supporte l'embed via une iframe sur leur domaine
      embedUrl: `https://medal.tv/clip-embed/${clipId}`,
      thumbnailUrl: '',
      originalUrl: rawUrl.trim(),
    };
  }

  return null;
}

/**
 * Retourne le label affichable du fournisseur.
 */
export function providerLabel(provider: VideoProvider): string {
  switch (provider) {
    case 'youtube': return 'YouTube';
    case 'twitch_clip': return 'Twitch Clip';
    case 'twitch_vod': return 'Twitch VOD';
    case 'medal': return 'Medal.tv';
    default: return 'Lien externe';
  }
}

/**
 * Retourne la couleur Tailwind associée au fournisseur.
 */
export function providerColor(provider: VideoProvider): string {
  switch (provider) {
    case 'youtube': return 'red';
    case 'twitch_clip':
    case 'twitch_vod': return 'purple';
    case 'medal': return 'yellow';
    default: return 'gray';
  }
}

/** Catégories d'annotations */
export const ANNOTATION_CATEGORIES = [
  { value: 'point_fort',   label: '✅ Point fort',      color: 'green'  },
  { value: 'erreur',       label: '❌ Erreur',           color: 'red'    },
  { value: 'axe_travail',  label: '🎯 Axe de travail',  color: 'orange' },
  { value: 'general',      label: '📝 Général',          color: 'blue'   },
] as const;

export type AnnotationCategory = typeof ANNOTATION_CATEGORIES[number]['value'];

export function annotationStyle(category: AnnotationCategory) {
  return ANNOTATION_CATEGORIES.find(c => c.value === category) ?? ANNOTATION_CATEGORIES[3];
}

/**
 * Formate un nombre de secondes en mm:ss pour l'affichage.
 */
export function formatTimestamp(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
