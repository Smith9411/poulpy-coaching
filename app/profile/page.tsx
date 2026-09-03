'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { User, Mail, Settings, LogOut, Shield, Clock, Award, Camera, Trash2, Edit2, Check, X, Loader2, MessageSquare, Quote } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState, useRef, useEffect } from 'react';
import FavoriteGames from '@/components/FavoriteGames';

export default function Profile() {
  const { user, logout, updateAvatar, updateUsername, updateBio, isLoading: authLoading } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState('');
  const [isSavingBio, setIsSavingBio] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    statusTimerRef.current = setTimeout(() => setStatusMsg(null), 3500);
  };

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  if (authLoading) {
    return (
      <main className="min-h-screen page-bg py-24 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen page-bg py-24 flex items-center justify-center">
        <div className="text-center card rounded-2xl p-12 max-w-md mx-auto px-4">
          <User size={64} className="mx-auto mb-6 text-gray-500" />
          <h1 className="text-3xl font-bold mb-4">Non connecté</h1>
          <p className="text-gray-400 mb-8">Connecte-toi pour accéder à ton espace personnel.</p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            Se connecter
            <Award size={20} />
          </Link>
        </div>
      </main>
    );
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showStatus('error', 'Le fichier doit être une image (PNG, JPG, WEBP, GIF).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showStatus('error', "L'image ne doit pas dépasser 2 Mo.");
      return;
    }

    setIsUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Non authentifié');

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/avatar/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.error || "Erreur lors de l'envoi");
      }

      await updateAvatar(result.url);
      showStatus('success', 'Photo de profil mise à jour avec succès !');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du téléchargement';
      showStatus('error', msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user.avatarUrl) return;
    setIsUploading(true);
    try {
      await updateAvatar(null);
      showStatus('success', 'Photo de profil retirée.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur';
      showStatus('error', msg);
    } finally {
      setIsUploading(false);
    }
  };

const handleSaveUsername = async () => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === user.username) {
      setIsEditingName(false);
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 30) {
      showStatus('error', 'Le pseudo doit contenir entre 2 et 30 caractères.');
      return;
    }
    if (!/^[a-zA-Z0-9_\-À-ÿ ]+$/.test(trimmed)) {
      showStatus('error', 'Le pseudo contient des caractères non autorisés.');
      return;
    }
    setIsSavingName(true);
    try {
      await updateUsername(trimmed);
      showStatus('success', 'Pseudo mis à jour avec succès !');
      setIsEditingName(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur';
      showStatus('error', msg);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSaveBio = async () => {
    const trimmed = bioDraft.trim();
    const current = (user.bio || '').trim();
    if (trimmed === current) {
      setIsEditingBio(false);
      return;
    }
    if (trimmed.length > 280) {
      showStatus('error', 'La bio ne doit pas dépasser 280 caractères.');
      return;
    }
    setIsSavingBio(true);
    try {
      await updateBio(trimmed);
      showStatus('success', trimmed ? 'Bio mise à jour avec succès !' : 'Bio supprimée.');
      setIsEditingBio(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur';
      showStatus('error', msg);
    } finally {
      setIsSavingBio(false);
    }
  };

  return (
    <main className="min-h-screen page-bg py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12">
          <div className="inline-block glass px-4 py-2 rounded-full mb-4">
            <span className="text-sm text-purple-400 font-medium">ESPACE PERSONNEL</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Bienvenue, <span className="text-gradient">{user.username}</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Ton espace personnel pour gérer ton profil, ta progression et tes sessions.
          </p>
        </div>

        {/* Status Toast */}
        {statusMsg && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : 'bg-red-500/20 border border-red-500/30 text-red-400'
            }`}
          >
            {statusMsg.type === 'success' ? <Check size={18} /> : <X size={18} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="card rounded-2xl p-8 mb-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">

            {/* Avatar with Custom Upload */}
            <div className="relative group">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-4xl font-bold text-white overflow-hidden cursor-pointer relative shadow-lg group-hover:ring-4 group-hover:ring-purple-500/40 transition-all"
                title="Cliquer pour changer de photo"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  user.initial
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs gap-1">
                  {isUploading ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <>
                      <Camera size={24} />
                      <span>Changer</span>
                    </>
                  )}
                </div>
              </div>

              {/* Status badge */}
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-page flex items-center justify-center" title="Compte vérifié">
                <Shield size={16} className="text-white" />
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                disabled={isUploading}
              />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-inherit text-xl font-bold focus:outline-none focus:border-purple-500"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveUsername}
                      disabled={isSavingName}
                      className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      title="Enregistrer"
                    >
                      {isSavingName ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10"
                      title="Annuler"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold">{user.username}</h2>
                    <button
                      onClick={() => {
                        setNewName(user.username);
                        setIsEditingName(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                      title="Modifier mon pseudo"
                    >
                      <Edit2 size={16} />
                    </button>
                  </>
                )}
              </div>

              <p className="text-purple-400 font-medium mb-4">
                {user.isAdmin ? '👑 Administrateur Poulpy Coaching' : 'Membre Poulpy Coaching'}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <Mail size={16} className="text-gray-500" />
                  <span>{user.email}</span>
                </div>
              </div>

              {/* Photo controls */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-300 transition-colors disabled:opacity-50"
                >
                  <Camera size={14} />
                  {user.avatarUrl ? 'Changer la photo' : 'Ajouter une photo'}
                </button>
                {user.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-xs font-medium text-red-400 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    Supprimer la photo
                  </button>
                )}
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-6 py-3 glass rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-500/10 border border-white/5 transition-all"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Bio */}
        <div className="card rounded-2xl p-8 mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
                <Quote size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Ma bio</h3>
                <p className="text-xs text-gray-500">Visible par l&apos;équipe de coaching</p>
              </div>
            </div>
            {!isEditingBio && (
              <button
                type="button"
                onClick={() => {
                  setBioDraft(user.bio || '');
                  setIsEditingBio(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-300 transition-colors"
                title={user.bio ? 'Modifier ma bio' : 'Ajouter une bio'}
              >
                <Edit2 size={14} />
                {user.bio ? 'Modifier' : 'Ajouter'}
              </button>
            )}
          </div>

          {isEditingBio ? (
            <div>
              <textarea
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value.slice(0, 280))}
                placeholder="Présente-toi en quelques lignes : ton jeu principal, ton rang, tes objectifs, ce que tu attends du coaching…"
                rows={4}
                maxLength={280}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-inherit placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                autoFocus
              />
              <div className="flex items-center justify-between mt-3">
                <span className={`text-xs ${bioDraft.length >= 260 ? 'text-orange-400' : 'text-gray-500'}`}>
                  {bioDraft.length} / 280
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingBio(false)}
                    disabled={isSavingBio}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-300 transition-colors disabled:opacity-50"
                  >
                    <X size={14} />
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBio}
                    disabled={isSavingBio}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-xs font-medium text-green-400 transition-colors disabled:opacity-50"
                  >
                    {isSavingBio ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          ) : user.bio ? (
            <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{user.bio}</p>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Aucune bio pour l&apos;instant. Ajoute quelques lignes pour que ton coach puisse mieux te connaître.
            </p>
          )}
        </div>

        {/* Favorite Games */}
        {!user.isAdmin && (
          <div className="mb-12">
            <FavoriteGames />
          </div>
        )}

        {/* Stats / Upcoming sections */}
        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          <Link
            href="/profile/coaching"
            className="card rounded-2xl p-6 text-center hover:bg-white/5 transition-all group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare size={24} className="text-white" />
            </div>
            <h3 className="font-bold mb-1">Messages Coaching</h3>
            <p className="text-sm text-gray-400">Retours de ton coach</p>
          </Link>
          <div className="card rounded-2xl p-6 text-center hover:bg-white/5 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Clock size={24} className="text-white" />
            </div>
            <h3 className="font-bold text-lg mb-2">Sessions à venir</h3>
            <p className="text-gray-400 text-sm mb-4">Aucune session planifiée</p>
            <Link
              href="/#booking"
              className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
            >
              Réserver
              <Award size={14} />
            </Link>
          </div>

          <div className="card rounded-2xl p-6 text-center hover:bg-white/5 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Award size={24} className="text-white" />
            </div>
            <h3 className="font-bold text-lg mb-2">Progression</h3>
            <p className="text-gray-400 text-sm mb-4">Suivi de tes rangs</p>
            <span className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
              Bientôt disponible
            </span>
          </div>

          <div className="card rounded-2xl p-6 text-center hover:bg-white/5 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-600 to-purple-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Settings size={24} className="text-white" />
            </div>
            <h3 className="font-bold text-lg mb-2">Paramètres</h3>
            <p className="text-gray-400 text-sm mb-4">Gérer ton compte</p>
            <span className="inline-flex items-center gap-1 text-pink-400 hover:text-pink-300 text-sm font-medium transition-colors">
              Bientôt disponible
            </span>
          </div>
        </div>

        {/* Info section */}
        <div className="card rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <Shield size={24} className="text-purple-400" />
            À propos de cet espace
          </h3>
          <div className="space-y-4 text-gray-300">
            <p>Cet espace personnel te permet de gérer ton profil et suivre tes coachings :</p>
            <ul className="space-y-3 pl-6 list-disc">
              <li>Photo de profil personnalisée et modification de pseudo instantanée</li>
              <li>Voir l&apos;historique de tes sessions de coaching</li>
              <li>Suivre ta progression de rang (Valorant, Apex, Aim)</li>
              <li>Accéder à tes VOD review et analyses</li>
              <li>Gérer tes créneaux de réservation</li>
            </ul>
            <p className="text-sm text-gray-500 pt-4 border-t border-white/5">
              Pour toute question, rejoins le <a href="https://discord.gg/rJMg3ZZRkp" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">Discord</a>.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}