// Système de notifications Poulpy Coaching
// Préparé pour les fonctionnalités futures (messages, rappels de séance, reviews VOD)
// et actif dès maintenant pour les mises à jour admin ("Site update")

export interface NotificationPayload {
  title: string;
  body: string;
  tag?: string;
  icon?: string;
  badge?: string;
  url?: string;
  renotify?: boolean;
}

/**
 * Demande la permission pour les notifications du navigateur/smartphone
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('[Notification] Erreur demande permission:', err);
    return 'denied';
  }
}

/**
 * Envoie une notification via le Service Worker (ou fallback Notification native)
 * Supporte le paramètre 'tag' pour remplacer automatiquement les notifications existantes.
 */
export async function sendNotification(payload: NotificationPayload): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  const icon = payload.icon || '/icons/icon-192x192.png';
  const badge = payload.badge || '/icons/icon-192x192.png';

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      const options: NotificationOptions & { renotify?: boolean } = {
        body: payload.body,
        icon,
        badge,
        tag: payload.tag,
        renotify: payload.renotify ?? Boolean(payload.tag),
        data: { url: payload.url || '/' },
      };
      await reg.showNotification(payload.title, options as NotificationOptions);
      return true;
    }
  } catch (err) {
    console.warn('[Notification] Service Worker showNotification fallback:', err);
  }

  // Fallback si SW non prêt
  try {
    new Notification(payload.title, {
      body: payload.body,
      icon,
      badge,
      tag: payload.tag,
      data: { url: payload.url || '/' },
    });
    return true;
  } catch (err) {
    console.warn('[Notification] Native Notification constructor failed:', err);
    return false;
  }
}

/**
 * Notification exclusive Admin pour chaque mise à jour du site ("Site update").
 * Le tag 'site-update' garantit que si une notification d'update existe déjà, elle est remplacée.
 */
export async function notifyAdminSiteUpdate(updateDetails?: string): Promise<boolean> {
  return sendNotification({
    title: 'Site update',
    body: updateDetails || 'Le site a été mis à jour avec de nouveaux changements.',
    tag: 'site-update',
    renotify: true,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    url: '/',
  });
}

// -------------------------------------------------------------
// Préréglages pour les notifications futures
// -------------------------------------------------------------

/**
 * [Futur] Notification lors d'un nouveau message de coaching
 */
export async function notifyCoachingMessage(senderName: string, snippet: string, studentId?: string): Promise<boolean> {
  return sendNotification({
    title: `Nouveau message de ${senderName}`,
    body: snippet,
    tag: `chat-${studentId || 'coaching'}`,
    renotify: true,
    url: studentId ? `/admin/coaching/${studentId}` : '/profile/coaching',
  });
}

/**
 * [Futur] Notification de rappel de session de coaching
 */
export async function notifySessionReminder(timeText: string): Promise<boolean> {
  return sendNotification({
    title: 'Rappel Coaching Poulpy 🐙',
    body: `Ta session de coaching commence dans ${timeText}. Sois prêt !`,
    tag: 'session-reminder',
    renotify: true,
    url: '/profile/coaching',
  });
}

/**
 * [Futur] Notification pour une review VOD terminée
 */
export async function notifyVodReady(vodTitle: string): Promise<boolean> {
  return sendNotification({
    title: 'Analyse VOD disponible !',
    body: `Poulpy a terminé l'analyse de : "${vodTitle}".`,
    tag: 'vod-ready',
    renotify: true,
    url: '/profile/vod',
  });
}
