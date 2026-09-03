'use client';

import { Shield, ArrowLeft, Save, RotateCcw, Globe, Tv, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useRef, useState } from 'react';

const YoutubeIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.016 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function AdminSettings() {
  const { user, isLoading: authLoading } = useAuth();
  const [saved, setSaved] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // State for form fields
  const [formData, setFormData] = useState({
    siteName: 'Poulpy Coaching',
    description: "Coaching compétitif pour joueurs Valorant, Apex Legends et passionnés d'aim.",
    contactEmail: 'poulpy.coaching@gmail.com',
    discordUrl: 'https://discord.gg/rJMg3ZZRkp',
    youtubeUrl: 'https://www.youtube.com/watch?v=4gfWbGCA5q0',
    twitchUrl: 'https://www.twitch.tv/poulpy_coaching',
  });

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  if (authLoading) {
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

  const settingsSections = [
    {
      title: 'Général',
      icon: Globe,
      color: 'text-purple-400',
      fields: [
        { 
          label: 'Nom du site', 
          type: 'text', 
          value: formData.siteName,
          onChange: (value: string) => setFormData(prev => ({ ...prev, siteName: value })),
          tooltip: 'Nom affiché dans l\'en-tête du site'
        },
        { 
          label: 'Description', 
          type: 'textarea', 
          value: formData.description,
          onChange: (value: string) => setFormData(prev => ({ ...prev, description: value })),
          tooltip: 'Description courte du site pour les moteurs de recherche'
        },
        { 
          label: 'Email de contact', 
          type: 'email', 
          value: formData.contactEmail,
          onChange: (value: string) => setFormData(prev => ({ ...prev, contactEmail: value })),
          tooltip: 'Email public pour les demandes de contact'
        },
        { 
          label: 'URL Discord', 
          type: 'url', 
          value: formData.discordUrl,
          onChange: (value: string) => setFormData(prev => ({ ...prev, discordUrl: value })),
          tooltip: 'Lien d\'invitation vers le serveur Discord'
        },
        { 
          label: 'Lien vidéo YouTube', 
          type: 'url', 
          value: formData.youtubeUrl,
          onChange: (value: string) => setFormData(prev => ({ ...prev, youtubeUrl: value })),
          tooltip: 'URL de la vidéo YouTube à afficher dans la section À propos'
        },
        { 
          label: 'Lien chaîne Twitch', 
          type: 'url', 
          value: formData.twitchUrl,
          onChange: (value: string) => setFormData(prev => ({ ...prev, twitchUrl: value })),
          tooltip: 'URL de la chaîne Twitch à afficher dans la section À propos'
        },
      ]
    },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save to Supabase settings table
    console.log('Settings to save:', formData);
    setSaved(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setFormData({
      siteName: 'Poulpy Coaching',
      description: "Coaching compétitif pour joueurs Valorant, Apex Legends et passionnés d'aim.",
      contactEmail: 'poulpy.coaching@gmail.com',
      discordUrl: 'https://discord.gg/rJMg3ZZRkp',
      youtubeUrl: 'https://www.youtube.com/watch?v=4gfWbGCA5q0',
      twitchUrl: 'https://www.twitch.tv/poulpy_coaching',
    });
  };

  return (
    <main className="min-h-screen page-bg py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
              Configuration globale de la plateforme Poulpy Coaching
            </p>
          </div>
        </div>

        {saved && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium">
            Paramètres enregistrés avec succès ! (Note: Sauvegarde en mémoire locale uniquement pour le moment)
          </div>
        )}

        <form
          className="space-y-8"
          onSubmit={handleSave}
        >
          {settingsSections.map((section) => (
            <div
              key={section.title}
              className="card rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <section.icon size={20} className={section.color} />
                </div>
                <h3 className="text-xl font-bold">{section.title}</h3>
              </div>

              <div className="space-y-4">
                {section.fields.map((field) => (
                  <div key={field.label} className="grid sm:grid-cols-[200px_1fr] gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-300">{field.label}</label>
                      {field.tooltip && (
                        <div className="relative group">
                          <HelpCircle size={14} className="text-gray-500 cursor-help" />
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 rounded-lg bg-gray-900 border border-white/10 text-xs text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            {field.tooltip}
                          </div>
                        </div>
                      )}
                    </div>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={String(field.value)}
                        onChange={(e) => field.onChange(e.target.value)}
                        rows={3}
                        className="w-full rounded-xl bg-white/5 border border-white/10 text-inherit placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all px-4 py-3"
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={String(field.value)}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-full rounded-xl bg-white/5 border border-white/10 text-inherit placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all px-4 py-3"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

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
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
            >
              <Save size={18} />
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}