'use client';

import { Bell, Download, Smartphone, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Check for SW updates
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] Nouvelle version prête.');
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn('[PWA] Enregistrement SW échoué:', err);
        });

      // Check notification permission
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    }

    // 2. Capture BeforeInstallPrompt
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

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification('Notifications activées !', {
          body: 'Tu seras notifié en temps réel pour tes messages et sessions de coaching.',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
        });
      }
    } catch (e) {
      console.warn('Erreur permission notification:', e);
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

      {/* Push Notification Optional Quick Enable (only shown in coaching view or if supported & default) */}
      {notificationPermission === 'default' && (
        <div id="pwa-notification-helper" className="hidden" onClick={requestNotificationPermission}>
          <Bell size={16} />
        </div>
      )}
    </>
  );
}
