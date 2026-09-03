'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowRight, MessageSquarePlus, Trash2, Check, X, Loader2, Shield, User as UserIcon, MessageSquare, Send } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface Review {
  id: string;
  name: string;
  game: string;
  rank: string;
  text: string;
  rating: number;
  user_id?: string;
  created_at: string;
  admin_response?: string;
  admin_response_at?: string;
}

const GAME_OPTIONS = [
  'Valorant',
  'Apex Legends',
  'Autre',
];

const VALORANT_RANKS = [
  'Iron 1', 'Iron 2', 'Iron 3',
  'Bronze 1', 'Bronze 2', 'Bronze 3',
  'Silver 1', 'Silver 2', 'Silver 3',
  'Gold 1', 'Gold 2', 'Gold 3',
  'Platinum 1', 'Platinum 2', 'Platinum 3',
  'Diamond 1', 'Diamond 2', 'Diamond 3',
  'Ascendant 1', 'Ascendant 2', 'Ascendant 3',
  'Immortal 1', 'Immortal 2', 'Immortal 3',
  'Radiant',
];

const APEX_RANKS = [
  'Rookie',
  'Bronze',
  'Silver',
  'Gold',
  'Platinum',
  'Diamond',
  'Master',
  'Predator',
];

export default function Avis() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userAvatars, setUserAvatars] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Sorting states
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'rating'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Admin response states
  const [respondingToId, setRespondingToId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  
  // Expanded response states
  const [expandedResponseId, setExpandedResponseId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  // Form state
  const [game, setGame] = useState('Valorant');
  const [rankType, setRankType] = useState<'rank' | 'progression'>('rank');
  const [rank, setRank] = useState('');
  const [rankFrom, setRankFrom] = useState('');
  const [rankTo, setRankTo] = useState('');
  const [customRank, setCustomRank] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    statusTimerRef.current = setTimeout(() => setStatusMsg(null), 3500);
  };

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reviews?sortBy=${sortBy}&sortOrder=${sortOrder}`);
      const data = await res.json();
      if (data.reviews) {
        setReviews(data.reviews);

        // Fetch avatars for users with user_id
        const avatarMap: Record<string, string> = {};
        const userIds = data.reviews.filter((r: Review) => r.user_id).map((r: Review) => r.user_id);

        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, avatar_url')
            .in('id', userIds);

          if (profiles) {
            profiles.forEach((profile: any) => {
              if (profile.avatar_url) {
                avatarMap[profile.id] = profile.avatar_url;
              }
            });
          }
        }

        setUserAvatars(avatarMap);
      }
    } catch {
      // Ignorer
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, sortOrder]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const trimmedText = text.trim();
    if (!trimmedText) {
      showStatus('error', "Merci d'écrire un message pour ton avis.");
      return;
    }
    if (trimmedText.length > 2000) {
      showStatus('error', "L'avis ne doit pas dépasser 2000 caractères.");
      return;
    }
    if (!['valorant', 'apex', 'aim'].includes(game)) {
      showStatus('error', 'Jeu invalide.');
      return;
    }

    // Calculate rank value based on type and game
    let finalRank = 'Membre Poulpy';
    if (game === 'Autre') {
      finalRank = customRank.trim() || 'Membre Poulpy';
    } else if (rankType === 'rank') {
      finalRank = rank.trim() || 'Membre Poulpy';
    } else {
      // Progression mode: from -> to
      if (rankFrom.trim() && rankTo.trim()) {
        finalRank = `${rankFrom.trim()} → ${rankTo.trim()}`;
      } else if (rankFrom.trim()) {
        finalRank = rankFrom.trim();
      } else if (rankTo.trim()) {
        finalRank = rankTo.trim();
      }
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.username,
          game,
          rank: finalRank,
          rating,
          text: text.trim(),
          userId: user.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Erreur lors de l'envoi");

      setReviews((prev) => [data.review, ...prev]);
      showStatus('success', 'Ton avis a été publié avec succès ! Merci pour ton retour.');
      setText('');
      setRank('');
      setRankFrom('');
      setRankTo('');
      setCustomRank('');
      setIsFormOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la publication';
      showStatus('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Non authentifié');

      const res = await fetch(`/api/reviews?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Erreur');

      setReviews((prev) => prev.filter((r) => r.id !== id));
      showStatus('success', "L'avis a été supprimé.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur de suppression';
      showStatus('error', msg);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleAdminResponse = async (reviewId: string) => {
    console.log('handleAdminResponse appelé pour:', reviewId);
    
    if (!responseText.trim()) {
      showStatus('error', 'Veuillez écrire une réponse.');
      return;
    }
    
    if (responseText.trim().length > 1000) {
      showStatus('error', 'La réponse ne doit pas dépasser 1000 caractères.');
      return;
    }

    setIsSubmittingResponse(true);
    try {
      console.log('Récupération session...');
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      console.log('Token:', token ? 'Présent' : 'Absent', 'User:', session?.user?.id);
      
      if (!token) throw new Error('Non authentifié');

      console.log('Envoi requête API...');
      const res = await fetch('/api/reviews/respond', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reviewId,
          response: responseText.trim(),
        }),
      });

      console.log('Réponse API reçue, status:', res.status);
      const data = await res.json();
      console.log('Données API:', data);
      
      if (!res.ok || data.error) throw new Error(data.error || 'Erreur');

      setReviews((prev) => prev.map((r) => 
        r.id === reviewId 
          ? { ...r, admin_response: data.response, admin_response_at: data.response_at }
          : r
      ));
      
      showStatus('success', 'Réponse publiée avec succès !');
      setResponseText('');
      setRespondingToId(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la publication';
      console.error('Erreur handleAdminResponse:', err);
      showStatus('error', msg);
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  const distinctGames = new Set(reviews.map((r) => r.game)).size;

  return (
    <main className="min-h-screen page-bg py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block glass px-4 py-2 rounded-full mb-4">
            <span className="text-sm text-purple-400 font-medium">AVIS & TÉMOIGNAGES</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Ils ont joué. Ils ont <span className="text-gradient">progressé.</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Tous les retours authentiques des joueurs accompagnés en coaching.
          </p>

          {/* Action CTA */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {user ? (
              <button
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/40 transition-all hover:scale-105 cursor-pointer"
              >
                <MessageSquarePlus size={20} />
                {isFormOpen ? 'Fermer le formulaire' : 'Laisser un avis'}
              </button>
            ) : (
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/40 transition-all hover:scale-105"
              >
                <UserIcon size={18} />
                Se connecter pour laisser un avis
              </Link>
            )}
          </div>
        </div>

        {/* Status toast */}
        {statusMsg && (
          <div
            className={`max-w-2xl mx-auto mb-8 p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : 'bg-red-500/20 border border-red-500/30 text-red-400'
            }`}
          >
            {statusMsg.type === 'success' ? <Check size={18} /> : <X size={18} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Admin Moderation Notice */}
        {user?.isAdmin && (
          <div className="max-w-4xl mx-auto mb-8 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-purple-400 flex-shrink-0" />
              <span>
                <strong>Mode Administrateur actif :</strong> vous pouvez modérer et supprimer n&apos;importe quel avis avec l&apos;icône corbeille.
              </span>
            </div>
          </div>
        )}

        {/* Add Review Form */}
        <AnimatePresence>
          {isFormOpen && user && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden max-w-2xl mx-auto mb-16"
            >
              <form onSubmit={handleSubmitReview} className="card rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <MessageSquarePlus size={24} className="text-purple-400" />
                  Rédiger ton avis
                </h3>

                <div className="space-y-5">
                  {/* Pseudo (auto-filled from user profile) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nom / Pseudo affiché
                    </label>
                    <input
                      type="text"
                      value={user.username}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Game selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Jeu concerné
                      </label>
                      <select
                        value={game}
                        onChange={(e) => {
                          setGame(e.target.value);
                          setRank('');
                          setRankFrom('');
                          setRankTo('');
                          setCustomRank('');
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-inherit focus:outline-none focus:border-purple-500"
                      >
                        {GAME_OPTIONS.map((g) => (
                          <option key={g} value={g} className="bg-[#13161e] text-white">
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Rank Type Selector - Only for Valorant and Apex */}
                    {game !== 'Autre' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Type de renseignement
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setRankType('rank')}
                            className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                              rankType === 'rank'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                          >
                            Rang actuel
                          </button>
                          <button
                            type="button"
                            onClick={() => setRankType('progression')}
                            className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                              rankType === 'progression'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                          >
                            Progression
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Custom rank input for "Autre" */}
                  {game === 'Autre' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Rang / Niveau
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Master 1000 points"
                        value={customRank}
                        onChange={(e) => setCustomRank(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-inherit placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  )}

                  {/* Rank Input - Single field for rank mode (Valorant/Apex) */}
                  {game !== 'Autre' && rankType === 'rank' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Rang actuel
                      </label>
                      <select
                        value={rank}
                        onChange={(e) => setRank(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-inherit focus:outline-none focus:border-purple-500"
                      >
                        <option value="" className="bg-[#13161e] text-white">
                          Sélectionne ton rang
                        </option>
                        {(game === 'Valorant' ? VALORANT_RANKS : APEX_RANKS).map((r) => (
                          <option key={r} value={r} className="bg-[#13161e] text-white">
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Progression Inputs - Two fields for progression mode (Valorant/Apex) */}
                  {game !== 'Autre' && rankType === 'progression' && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Rang de départ
                        </label>
                        <select
                          value={rankFrom}
                          onChange={(e) => setRankFrom(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-inherit focus:outline-none focus:border-purple-500"
                        >
                          <option value="" className="bg-[#13161e] text-white">
                            Départ
                          </option>
                          {(game === 'Valorant' ? VALORANT_RANKS : APEX_RANKS).map((r) => (
                            <option key={r} value={r} className="bg-[#13161e] text-white">
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Rang d'arrivée
                        </label>
                        <select
                          value={rankTo}
                          onChange={(e) => setRankTo(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-inherit focus:outline-none focus:border-purple-500"
                        >
                          <option value="" className="bg-[#13161e] text-white">
                            Arrivée
                          </option>
                          {(game === 'Valorant' ? VALORANT_RANKS : APEX_RANKS).map((r) => (
                            <option key={r} value={r} className="bg-[#13161e] text-white">
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Rating with clickable stars */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Note ({rating}/5 étoiles)
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 hover:scale-125 transition-transform"
                        >
                          <Star
                            size={28}
                            className={`${
                              (hoverRating || rating) >= star
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-600'
                            } transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment Textarea */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ton retour d&apos;expérience
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Comment s'est passée ta session ? Quels aspects de ton jeu ont progressé ?"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-inherit placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Submit buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/40 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Publication...
                        </>
                      ) : (
                        'Publier mon avis'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sort Controls */}
        {!isLoading && reviews.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Trier par :</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('date')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    sortBy === 'date'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Date
                </button>
                <button
                  onClick={() => setSortBy('name')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    sortBy === 'name'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Nom
                </button>
                <button
                  onClick={() => setSortBy('rating')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    sortBy === 'rating'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Note
                </button>
              </div>
            </div>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 text-sm font-medium transition-all"
            >
              {sortOrder === 'asc' ? '↑ Croissant' : '↓ Décroissant'}
            </button>
          </div>
        )}

        {/* Testimonials Grid */}
        {isLoading ? (
          <div className="p-20 text-center">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Chargement des avis...</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
            {reviews.map((testimonial) => (
              <article
                key={testimonial.id}
                className="card rounded-2xl p-8 hover:bg-white/5 transition-all group flex flex-col justify-between relative"
              >
                <div>
                  {/* Top: Stars + Admin Delete Button */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    {/* Admin Delete Action */}
                    {user?.isAdmin && (
                      <div>
                        {confirmDeleteId === testimonial.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteReview(testimonial.id)}
                              className="px-2 py-1 text-xs rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors font-medium"
                            >
                              Supprimer
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 text-xs rounded-lg bg-white/5 text-gray-400 hover:bg-white/10"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(testimonial.id)}
                            title="Supprimer cet avis (Admin)"
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-base text-gray-200 mb-8 leading-relaxed">
                    &ldquo;{testimonial.text}&rdquo;
                  </blockquote>
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    {testimonial.user_id && userAvatars[testimonial.user_id] ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500/30">
                        <img
                          src={userAvatars[testimonial.user_id]}
                          alt={testimonial.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                        {testimonial.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-base mb-0.5">{testimonial.name}</div>
                      <div className="text-purple-400 text-xs font-medium">{testimonial.game}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-gray-400">
                      {testimonial.rank}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(testimonial.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {/* Admin Response Section */}
                {testimonial.admin_response ? (
                  <div className="mt-4">
                    <button
                      onClick={() => setExpandedResponseId(
                        expandedResponseId === testimonial.id ? null : testimonial.id
                      )}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 text-sm font-medium transition-colors"
                    >
                      <Shield size={16} />
                      {expandedResponseId === testimonial.id 
                        ? 'Masquer la réponse de Poulpy' 
                        : 'Voir la réponse de Poulpy'}
                    </button>
                    <AnimatePresence>
                      {expandedResponseId === testimonial.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Shield size={16} className="text-purple-400" />
                            <span className="text-xs font-medium text-purple-400">Réponse de l&apos;équipe Poulpy</span>
                          </div>
                          <p className="text-sm text-gray-300">{testimonial.admin_response}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : user?.isAdmin && (
                  <div className="mt-4">
                    {respondingToId === testimonial.id ? (
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <textarea
                          rows={3}
                          placeholder="Votre réponse..."
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-inherit placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm mb-3"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setRespondingToId(null);
                              setResponseText('');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 text-sm transition-colors"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={() => handleAdminResponse(testimonial.id)}
                            disabled={isSubmittingResponse}
                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-600 rounded-lg text-white text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                          >
                            {isSubmittingResponse ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                Envoi...
                              </>
                            ) : (
                              <>
                                <Send size={14} />
                                Répondre
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRespondingToId(testimonial.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 text-sm font-medium transition-colors"
                      >
                        <MessageSquare size={16} />
                        Répondre à cet avis
                      </button>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16 max-w-4xl mx-auto">
          <div className="card rounded-xl p-6 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {reviews.length}+
            </div>
            <div className="text-xs text-gray-400">Avis vérifiés</div>
          </div>
          <div className="card rounded-xl p-6 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              {avgRating}/5
            </div>
            <div className="text-xs text-gray-400">Note moyenne</div>
          </div>
          <div className="card rounded-xl p-6 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              100%
            </div>
            <div className="text-xs text-gray-400">Satisfaction</div>
          </div>
          <div className="card rounded-xl p-6 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              {distinctGames}
            </div>
            <div className="text-xs text-gray-400">Jeux couverts</div>
          </div>
        </div>

        {/* Back to home / CTA */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 card rounded-xl font-semibold hover:bg-white/10 transition-all group"
          >
            <ArrowRight size={20} className="-rotate-90 group-hover:-translate-x-1 transition-transform" />
            Retour à l&apos;accueil
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            Prêt à progresser toi aussi ? Rejoins le Discord pour réserver ta session.
          </p>
        </div>
      </div>
    </main>
  );
}