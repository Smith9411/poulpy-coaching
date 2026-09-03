'use client';

import { Shield, ArrowLeft, Save, RotateCcw, Globe, Mail, Shield as ShieldIcon, Palette } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useRef, useState } from 'react';

export default function AdminSettings() {
  const { user, isLoading: authLoading } = useAuth();
  const [saved, setSaved] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        { label: 'Nom du site', type: 'text', value: 'Poulpy Coaching' },
        { label: 'Description', type: 'textarea', value: "Coaching compétitif pour joueurs Valorant, Apex Legends et passionnés d'aim." },
        { label: 'Email de contact', type: 'email', value: 'poulpy.coaching@gmail.com' },
        { label: 'URL Discord', type: 'url', value: 'https://discord.gg/rJMg3ZZRkp' },
      ]
    },
    {
      title: 'Sécurité',
      icon: ShieldIcon,
      color: 'text-red-400',
      fields: [
        { label: 'Authentification à deux facteurs', type: 'toggle', value: false },
        { label: 'Session durée (heures)', type: 'number', value: 24 },
        { label: 'Tentatives de connexion max', type: 'number', value: 5 },
        { label: 'Verrouillage IP après échecs', type: 'toggle', value: true },
      ]
    },
    {
      title: 'Apparence',
      icon: Palette,
      color: 'text-cyan-400',
      fields: [
        { label: 'Couleur primaire', type: 'color', value: '#c22a2e' },
        { label: 'Couleur secondaire', type: 'color', value: '#3a4b8f' },
        { label: 'Animations activées', type: 'toggle', value: true },
      ]
    },
    {
      title: 'Notifications',
      icon: Mail,
      color: 'text-yellow-400',
      fields: [
        { label: 'Email nouvelles inscriptions', type: 'toggle', value: true },
        { label: 'Email nouvelles réservations', type: 'toggle', value: true },
        { label: 'Email paiements', type: 'toggle', value: true },
        { label: 'Webhook Discord', type: 'text', value: '' },
      ]
    },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaved(false), 3000);
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
            Paramètres enregistrés avec succès !
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
                    <label className="text-sm font-medium text-gray-300">{field.label}</label>
                    {field.type === 'toggle' ? (
                      <button
                        type="button"
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          field.value ? 'bg-purple-600' : 'bg-white/10'
                        }`}
                        role="switch"
                        aria-checked={Boolean(field.value)}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            field.value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    ) : field.type === 'color' ? (
                      <input
                        type="color"
                        defaultValue={String(field.value)}
                        className="w-12 h-12 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                      />
                    ) : field.type === 'textarea' ? (
                      <textarea
                        defaultValue={String(field.value)}
                        rows={3}
                        className="w-full rounded-xl bg-white/5 border border-white/10 text-inherit placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all px-4 py-3"
                      />
                    ) : (
                      <input
                        type={field.type}
                        defaultValue={String(field.value)}
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