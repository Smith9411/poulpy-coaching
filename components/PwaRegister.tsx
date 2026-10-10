'use client';

import { Bell, Check, Download, Smartphone, Sparkles, X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { notifyAdminSiteUpdate, requestNotificationPermission, sendNotification, clearAppBadge } from '@/lib/notifications';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PwaRegister() {
  const { user } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const hasCheckedVersionRef = useRef(false);

  // Fonction pour vérifier la version du serveur et notifier l'admin si mise à jour
  const checkForSiteUpdate = async () => {
    try {
      const res = await fetch('/api/version', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const currentVersion = data.version;
      const lastKnownVersion = localStorage.getItem('poulpy_last_known_version');

      if (lastKnownVersion && currentVersion && lastKnownVersion !== currentVersion) {
        localStorage.setItem('poulpy_last_known_version', currentVersion);
        if (user?.isAdmin) {
          console.log('[PWA] Nouvelle mise à jour détectée, envoi notification admin...');
          notifyAdminSiteUpdate();
        }
      } else if (currentVersion && !lastKnownVersion) {
        localStorage.setItem('poulpy_last_known_version', currentVersion);
      }
    } catch {
      // Ignoré en cas d'absence de réseau
    }
  };

  useEffect(() => {
    // Nettoyer proprement les anciens Service Workers résiduels pour éviter les conflits de cache
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister();
        }
      }).catch(() => {});
    }

    // Check notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Vérification immédiate de mise à jour au montage
    if (!hasCheckedVersionRef.current) {
      hasCheckedVersionRef.current = true;
      checkForSiteUpdate();
    }

    // Re-vérifier lors du retour sur l'onglet + effacer la pastille rouge
    const handleFocus = () => {
      checkForSiteUpdate();
      clearAppBadge();
    };
    window.addEventListener('focus', handleFocus);
    clearAppBadge();

    // Vérification périodique toutes les 60 secondes pour les admins connectés
    const intervalId = setInterval(() => {
      if (user?.isAdmin) {
        checkForSiteUpdate();
      }
    }, 60000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, [user?.isAdmin]);

  // Capture BeforeInstallPrompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check if user previously dismissed banner
      const isDismissed = localStorage.getItem('poulpy_pwa_dismissed');
      if (!isDismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If already installed (standalone mode), hide banner
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem('poulpy_pwa_dismissed', 'true');
  };

  const handleEnableNotifications = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
      sendNotification({
        title: 'Notifications activées ! 🐙',
        body: 'Tu seras notifié en temps réel des mises à jour du site.',
        tag: 'notif-admin-ready',
      });
    }
  };

  return (
    <>
      {/* Install PWA Prompt Banner */}
      {showInstallBanner && deferredPrompt && (
        <aside
          aria-label="Installation de l'application"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="glass-dark border border-purple-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 shadow-md border border-white/10">
              <img src="/icons/icon-192x192.png" alt="Poulpy Coaching" className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-white text-sm">Installer l'application Poulpy</h5>
              <p className="text-xs text-gray-300 truncate">
                Accès instantané et suivi mobile fluide
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs shadow-md hover:shadow-purple-500/30 flex items-center gap-1.5 transition-all"
              >
                <Download size={14} />
                <span>Installer</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Push Notification Optional Quick Enable */}
      {notificationPermission === 'default' && (
        <div id="pwa-notification-helper" className="hidden" onClick={handleEnableNotifications}>
          <Bell size={16} />
        </div>
      )}
    </>
  );
}
