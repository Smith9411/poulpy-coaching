'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowRight, MessageSquarePlus, Trash2, Check, X, Loader2, Shield, User as UserIcon, MessageSquare, Send, ChevronDown, Edit3, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Select from '@/components/Select';
import CyberNavbar from '@/components/CyberNavbar';
import AuthModal from '@/components/AuthModal';

interface Review {
  id: string;
  name: string;
  game: string;
  rank: string;
  text: string;
  rating: number;
  user_id?: string;
  created_at: string;
  updated_at?: string;
  admin_response?: string;
  admin_response_at?: string;
  featured?: boolean;
}

const EDIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

const GAME_OPTIONS = [
  'Valorant',
  'Apex Legends',
  'Autre',
];

const GAME_LABELS: Record<string, string> = {
  valorant: 'Valorant',
  apex: 'Apex Legends',
  aim: 'Autre',
};

function formatGameName(game: string): string {
  return GAME_LABELS[game?.toLowerCase()] ?? game ?? '';
}

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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userAvatars, setUserAvatars] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Sorting states
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'rating'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Admin response states
  const [respondingToId, setRespondingToId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  
  // Expanded response states
  const [expandedResponseId, setExpandedResponseId] = useState<string | null>(null);

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editHoverRating, setEditHoverRating] = useState(0);
  const [editRank, setEditRank] = useState('');
  const [editGame, setEditGame] = useState('Valorant');
  const [editRankType, setEditRankType] = useState<'rank' | 'progression'>('rank');
  const [editRankFrom, setEditRankFrom] = useState('');
  const [editRankTo, setEditRankTo] = useState('');
  const [editCustomRank, setEditCustomRank] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Tick pour rafraîchir les compteurs d'édition toutes les 30s
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(interval);
  }, []);

  // Helper : peut-on encore éditer cet avis (owner + < 5 min) ?
  const canEdit = (review: Review): boolean => {
    if (!user) return false;
    if (user.isAdmin) return true;
    if (review.user_id !== user.id) return false;
    const created = new Date(review.created_at).getTime();
    return Date.now() - created < EDIT_WINDOW_MS;
  };

  const editTimeRemaining = (review: Review): number => {
    const created = new Date(review.created_at).getTime();
    return Math.max(0, EDIT_WINDOW_MS - (Date.now() - created));
  };

  const formatRemaining = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
      if (editScrollTimeoutRef.current) clearTimeout(editScrollTimeoutRef.current);
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
    if (!['Valorant', 'Apex Legends', 'Autre'].includes(game)) {
      showStatus('error', 'Jeu invalide.');
      return;
    }

    let finalRank = 'Membre Poulpy';
    if (game === 'Autre') {
      finalRank = customRank.trim() || 'Membre Poulpy';
    } else if (rankType === 'rank') {
      finalRank = rank.trim() || 'Membre Poulpy';
    } else {
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
      let { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();
        if (refreshErr || !refreshData.session) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        session = refreshData.session;
      }

      const token = session?.access_token;
      if (!token) throw new Error('Vous devez être connecté pour publier un avis.');

      const gameNormalized = game === 'Valorant' ? 'valorant' : game === 'Apex Legends' ? 'apex' : 'aim';

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: user.username,
          game: gameNormalized,
          rank: finalRank,
          rating,
          text: text.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Erreur lors de l'envoi");

      setReviews((prev) => [data.review, ...prev]);

      setText('');
      setRank('');
      setRankFrom('');
      setRankTo('');
      setCustomRank('');
      setRating(5);
      setHoverRating(0);

      showStatus('success', 'Ton avis a été publié avec succès ! Merci pour ton retour.');

      requestAnimationFrame(() => {
        setIsFormOpen(false);
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la publication';
      showStatus('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    setIsSubmitting(true);
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
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (review: Review) => {
    setEditingId(review.id);
    setEditText(review.text);
    setEditRating(review.rating);
    setEditHoverRating(0);
    setEditGame(
      review.game === 'valorant' ? 'Valorant' :
      review.game === 'apex' ? 'Apex Legends' : 'Autre'
    );

    setEditRank('');
    setEditRankFrom('');
    setEditRankTo('');
    setEditCustomRank('');

    if (review.game === 'aim' || review.game === 'Autre') {
      setEditCustomRank(review.rank);
      setEditRankType('rank');
    } else if (review.rank.includes('→')) {
      const parts = review.rank.split('→').map((s) => s.trim());
      setEditRankFrom(parts[0] || '');
      setEditRankTo(parts[1] || '');
      setEditRankType('progression');
    } else {
      setEditRank(review.rank);
      setEditRankType('rank');
    }

    if (editScrollTimeoutRef.current) {
      clearTimeout(editScrollTimeoutRef.current);
    }
    editScrollTimeoutRef.current = setTimeout(() => {
      const el = document.getElementById(`review-${review.id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      editScrollTimeoutRef.current = null;
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditRating(5);
    setEditHoverRating(0);
    setEditRank('');
    setEditGame('Valorant');
    setEditRankType('rank');
    setEditRankFrom('');
    setEditRankTo('');
    setEditCustomRank('');
  };

  const handleSubmitEdit = async (reviewId: string) => {
    const trimmedText = editText.trim();
    if (!trimmedText) {
      showStatus('error', "Merci d'écrire un message pour ton avis.");
      return;
    }
    if (trimmedText.length > 2000) {
      showStatus('error', "L'avis ne doit pas dépasser 2000 caractères.");
      return;
    }

    setIsSubmittingEdit(true);
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

      const gameNormalized =
        editGame === 'Valorant' ? 'valorant' :
        editGame === 'Apex Legends' ? 'apex' : 'aim';

      let finalRank = 'Membre Poulpy';
      if (editGame === 'Autre') {
        finalRank = editCustomRank.trim() || 'Membre Poulpy';
      } else if (editRankType === 'rank') {
        finalRank = editRank.trim() || 'Membre Poulpy';
      } else {
        if (editRankFrom.trim() && editRankTo.trim()) {
          finalRank = `${editRankFrom.trim()} → ${editRankTo.trim()}`;
        } else if (editRankFrom.trim()) {
          finalRank = editRankFrom.trim();
        } else if (editRankTo.trim()) {
          finalRank = editRankTo.trim();
        }
      }

      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: reviewId,
          text: trimmedText,
          rating: editRating,
          rank: finalRank,
          game: gameNormalized,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || `Erreur serveur (${res.status})`);
      }

      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, ...data.review } : r)));
      showStatus('success', 'Avis mis à jour avec succès !');
      handleCancelEdit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la modification';
      showStatus('error', msg);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleAdminResponse = async (reviewId: string) => {
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

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Erreur serveur');

      setReviews((prev) => prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              admin_response: data.response ?? r.admin_response,
              admin_response_at: data.response_at ?? r.admin_response_at,
            }
          : r
      ));

      showStatus('success', 'Réponse publiée avec succès !');
      setResponseText('');
      setRespondingToId(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la publication';
      showStatus('error', msg);
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(null);

  const handleToggleFeatured = async (reviewId: string, nextFeatured: boolean) => {
    if (!user?.isAdmin) return;
    setTogglingFeaturedId(reviewId);
    try {
      let { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        const { data: r } = await supabase.auth.refreshSession();
        session = r.session;
      }
      if (!session?.access_token) throw new Error("Session expirée. Veuillez vous reconnecter.");

      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: reviewId, featured: nextFeatured }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Erreur lors de la mise à jour");

      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, featured: nextFeatured } : r))
      );

      showStatus(
        'success',
        nextFeatured
          ? "★ Avis ajouté sur la page d'accueil !"
          : "Avis retiré de la page d'accueil."
      );
    } catch (err: any) {
      showStatus('error', err.message || "Erreur lors de la mise à jour");
    } finally {
      setTogglingFeaturedId(null);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  const distinctGames = new Set(reviews.map((r) => r.game)).size;

  return (
    <main className="min-h-screen bg-[#07090D] text-white selection:bg-[#FF7582] selection:text-black pt-28 pb-20 font-mono relative z-10">
      <CyberNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back navigation & Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-mono text-[#8FAFD4] hover:text-white transition-colors uppercase tracking-wider"
            >
              <ArrowLeft size={14} />
              <span>RETOUR À L'ACCUEIL</span>
            </Link>
            <span className="text-white/20">/</span>
            <span className="data-badge data-badge-acid">REGISTRE DE RETOURS</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <h1 className="text-4xl sm:text-6xl font-display uppercase tracking-wider text-white">
                ILS ONT JOUÉ. <span className="text-[#FF7582]">ILS ONT PROGRESSÉ.</span>
              </h1>
              <p className="text-xs sm:text-sm text-white/60 max-w-2xl mt-2 tracking-wide">
                Retours vérifiés et statistiques de progression des élèves coachés par Poulpy.
              </p>
            </div>

            {/* Action CTA */}
            <div>
              {user ? (
                <button
                  onClick={() => setIsFormOpen(!isFormOpen)}
                  className="btn-cyber-primary text-xs cursor-pointer"
                >
                  <MessageSquarePlus size={16} />
                  <span>{isFormOpen ? 'FERMER LE FORMULAIRE' : 'RÉDIGER UN AVIS'}</span>
                </button>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="btn-cyber-primary text-xs cursor-pointer"
                >
                  <UserIcon size={16} />
                  <span>SE CONNECTER POUR LAISSER UN AVIS</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status toast */}
        {statusMsg && (
          <div
            className={`max-w-2xl mx-auto mb-8 p-3 text-xs font-mono flex items-center gap-2 border ${
              statusMsg.type === 'success'
                ? 'bg-[#A4DE87]/10 border-[#A4DE87]/40 text-[#A4DE87]'
                : 'bg-[#FF7582]/10 border-[#FF7582]/40 text-[#FF7582]'
            }`}
          >
            {statusMsg.type === 'success' ? <Check size={16} /> : <X size={16} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Admin Moderation Notice */}
        {user?.isAdmin && (
          <div className="max-w-7xl mx-auto mb-8 p-3 bg-[#FF7582]/10 border border-[#FF7582]/30 text-white text-xs flex items-center justify-between gap-4 font-mono">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[#FF7582] flex-shrink-0" />
              <span>
                <strong className="text-[#FF7582]">MODE MODÉRATION ADMIN ACTIF :</strong> Vous pouvez éditer ou supprimer n&apos;importe quel avis et publier des réponses officielles.
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
              className="overflow-hidden max-w-3xl mx-auto mb-16"
            >
              <form onSubmit={handleSubmitReview} className="reticle-box p-6 sm:p-8 bg-[#090c10] border border-[#FF7582]/40">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 bg-[#FF7582] animate-pulse" />
                    <h3 className="text-xl font-display uppercase tracking-wider text-white">
                      RÉDIGER TON RETOUR D'EXPÉRIENCE
                    </h3>
                  </div>
                  <span className="text-[10px] text-white/40 uppercase">FORMULAIRE ÉLÈVE</span>
                </div>

                <div className="space-y-5 text-xs">
                  {/* Pseudo */}
                  <div>
                    <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-2">
                      PSEUDO AFFICHÉ
                    </label>
                    <input
                      type="text"
                      value={user.username}
                      disabled
                      className="w-full px-4 py-2.5 bg-black/60 border border-white/10 text-white/40 cursor-not-allowed text-xs font-mono"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Game selection */}
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider">
                        DISCIPLINE / JEU
                      </label>
                      <Select
                        value={game}
                        onChange={(v) => {
                          setGame(v);
                          setRank('');
                          setRankFrom('');
                          setRankTo('');
                          setCustomRank('');
                        }}
                        options={GAME_OPTIONS.map((g) => ({ value: g, label: g }))}
                        accent="purple"
                      />
                    </div>

                    {/* Rank Type Selector */}
                    {game !== 'Autre' && (
                      <div>
                        <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-2">
                          TYPE D'INDICATION
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setRankType('rank')}
                            className={`flex-1 px-3 py-2 text-xs font-bold uppercase transition-all cursor-pointer ${
                              rankType === 'rank'
                                ? 'bg-[#FF7582] text-black'
                                : 'bg-black/60 text-white/60 hover:text-white border border-white/10'
                            }`}
                          >
                            Rang Actuel
                          </button>
                          <button
                            type="button"
                            onClick={() => setRankType('progression')}
                            className={`flex-1 px-3 py-2 text-xs font-bold uppercase transition-all cursor-pointer ${
                              rankType === 'progression'
                                ? 'bg-[#FF7582] text-black'
                                : 'bg-black/60 text-white/60 hover:text-white border border-white/10'
                            }`}
                          >
                            Progression
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Custom rank input */}
                  {game === 'Autre' && (
                    <div>
                      <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-2">
                        RANG / NIVEAU ATTEINT
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Top 500 Aimlab / Master 1200 LP"
                        value={customRank}
                        onChange={(e) => setCustomRank(e.target.value)}
                        className="w-full px-4 py-2.5 bg-black/60 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-[#FF7582]"
                      />
                    </div>
                  )}

                  {/* Rank Input - Single field */}
                  {game !== 'Autre' && rankType === 'rank' && (
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider">
                        RANG ACTUEL
                      </label>
                      <Select
                        value={rank}
                        onChange={setRank}
                        options={[
                          { value: '', label: '— SÉLECTIONNER RANG —' },
                          ...(game === 'Valorant' ? VALORANT_RANKS : APEX_RANKS).map((r) => ({
                            value: r,
                            label: r,
                          })),
                        ]}
                        accent="red"
                      />
                    </div>
                  )}

                  {/* Progression Inputs */}
                  {game !== 'Autre' && rankType === 'progression' && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider">
                          RANG INITIAL (DÉPART)
                        </label>
                        <Select
                          value={rankFrom}
                          onChange={setRankFrom}
                          options={[
                            { value: '', label: '— DÉPART —' },
                            ...(game === 'Valorant' ? VALORANT_RANKS : APEX_RANKS).map((r) => ({
                              value: r,
                              label: r,
                            })),
                          ]}
                          accent="red"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider">
                          RANG ATTEINT (ARRIVÉE)
                        </label>
                        <Select
                          value={rankTo}
                          onChange={setRankTo}
                          options={[
                            { value: '', label: '— ARRIVÉE —' },
                            ...(game === 'Valorant' ? VALORANT_RANKS : APEX_RANKS).map((r) => ({
                              value: r,
                              label: r,
                            })),
                          ]}
                          accent="cyan"
                        />
                      </div>
                    </div>
                  )}

                  {/* Rating with clickable stars */}
                  <div>
                    <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-2">
                      NOTE GLOBALE ({rating}/5 ÉTOILES)
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 cursor-pointer transition-transform hover:scale-110"
                        >
                          <Star
                            size={24}
                            className={`${
                              (hoverRating || rating) >= star
                                ? 'fill-[#FF7582] text-[#FF7582]'
                                : 'text-white/20'
                            } transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment Textarea */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider">
                      DÉBRIEF DU COACHING & RÉSULTATS
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Décris l'impact du coaching : mécanique, placement du crosshair, mental, communication..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      maxLength={2000}
                      className="w-full px-4 py-3 bg-black/60 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-[#FF7582] resize-none font-mono"
                    />
                    <div className="flex items-center justify-between text-[10px] text-white/40">
                      <span>TEXTE BRUT</span>
                      <span>{text.length} / 2000</span>
                    </div>
                  </div>

                  {/* Submit buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="btn-cyber-ghost text-xs py-2 px-4"
                    >
                      <X size={14} />
                      <span>ANNULER</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-cyber-primary text-xs py-2 px-5 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>PUBLICATION EN COURS...</span>
                        </>
                      ) : (
                        <>
                          <Check size={14} />
                          <span>TRANSMETTRE MON AVIS</span>
                        </>
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
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 py-3 px-4 bg-[#090c10] border border-white/10 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="text-white/40 uppercase tracking-wider">TRIER PAR :</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setSortBy('date')}
                  className={`px-3 py-1 text-xs font-bold uppercase transition-all cursor-pointer ${
                    sortBy === 'date'
                      ? 'bg-[#FF7582] text-black'
                      : 'bg-black/60 text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  Date
                </button>
                <button
                  onClick={() => setSortBy('name')}
                  className={`px-3 py-1 text-xs font-bold uppercase transition-all cursor-pointer ${
                    sortBy === 'name'
                      ? 'bg-[#FF7582] text-black'
                      : 'bg-black/60 text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  Nom
                </button>
                <button
                  onClick={() => setSortBy('rating')}
                  className={`px-3 py-1 text-xs font-bold uppercase transition-all cursor-pointer ${
                    sortBy === 'rating'
                      ? 'bg-[#FF7582] text-black'
                      : 'bg-black/60 text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  Note
                </button>
              </div>
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-1 bg-black/60 border border-white/10 text-white/70 hover:text-white text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>ORDRE :</span>
              <span className="text-[#FF7582] font-bold">{sortOrder === 'asc' ? '↑ CROISSANT' : '↓ DÉCROISSANT'}</span>
            </button>
          </div>
        )}

        {/* Testimonials Grid */}
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-[#FF7582] border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-xs text-white/50 tracking-wider">CHARGEMENT DE LA BASE D'AVIS...</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
            {reviews.map((testimonial) => (
              <article
                id={`review-${testimonial.id}`}
                key={testimonial.id}
                className="reticle-box bg-[#090c10] border border-white/10 hover:border-[#FF7582]/40 p-6 flex flex-col justify-between transition-colors relative"
              >
                <div>
                  {/* Top: Stars + Owner/Admin Actions */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} size={15} className="fill-[#FF7582] text-[#FF7582]" />
                        ))}
                      </div>
                      {testimonial.featured && (
                        <span className="data-badge data-badge-acid text-[9px]">
                          ★ SUR L&apos;ACCUEIL
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      {/* Admin Toggle Featured Button */}
                      {user?.isAdmin && (
                        <button
                          onClick={() => handleToggleFeatured(testimonial.id, !testimonial.featured)}
                          disabled={togglingFeaturedId === testimonial.id}
                          title={testimonial.featured ? "Retirer de la page d'accueil" : "Afficher sur la page d'accueil (défilement en direct)"}
                          className={`px-2 py-0.5 text-[10px] font-bold font-mono border transition-all cursor-pointer ${
                            testimonial.featured
                              ? "bg-[#FF7582] text-black border-[#FF7582] shadow-[0_0_10px_rgba(255,117,130,0.4)]"
                              : "bg-black/80 text-white/60 hover:text-white border-white/20 hover:border-[#FF7582]/60 hover:bg-[#FF7582]/10"
                          }`}
                        >
                          <span>{testimonial.featured ? "★ SUR L'ACCUEIL" : "+ ACCUEIL"}</span>
                        </button>
                      )}

                      {user && (user.id === testimonial.user_id || user.isAdmin) && (
                        <>
                          {editingId !== testimonial.id && canEdit(testimonial) && (
                            <button
                              onClick={() => handleStartEdit(testimonial)}
                              title={user.isAdmin && testimonial.user_id !== user.id ? 'Modifier (Admin)' : 'Modifier (5 min)'}
                              className="p-1 text-white/40 hover:text-[#8FAFD4] transition-colors cursor-pointer"
                            >
                              <Edit3 size={14} />
                            </button>
                          )}

                          {confirmDeleteId === testimonial.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteReview(testimonial.id)}
                                className="px-2 py-0.5 text-[10px] bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/40 font-bold"
                              >
                                SUPPRIMER
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-1.5 py-0.5 text-[10px] bg-white/5 text-white/50 hover:text-white"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(testimonial.id)}
                              title={user.isAdmin && testimonial.user_id !== user.id ? 'Supprimer (Admin)' : 'Supprimer votre avis'}
                              className="p-1 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Owner badge + countdown */}
                  {user && testimonial.user_id === user.id && !user.isAdmin && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="data-badge data-badge-laser text-[9px]">
                        VOTRE AVIS
                      </span>
                      {canEdit(testimonial) && (
                        <span className="text-[10px] text-[#FF7582] flex items-center gap-1">
                          <Clock size={10} />
                          {formatRemaining(editTimeRemaining(testimonial))}
                        </span>
                      )}
                      {testimonial.updated_at && testimonial.updated_at !== testimonial.created_at && (
                        <span className="text-[9px] text-white/30 italic">modifié</span>
                      )}
                    </div>
                  )}

                  {/* Quote */}
                  <blockquote className="text-xs text-white/80 leading-relaxed tracking-wide mb-6">
                    &ldquo;{testimonial.text}&rdquo;
                  </blockquote>
                </div>

                {/* Author Info */}
                <div>
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {testimonial.user_id && userAvatars[testimonial.user_id] ? (
                        <div className="w-8 h-8 overflow-hidden border border-[#FF7582]/40">
                          <img
                            src={userAvatars[testimonial.user_id]}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-[#FF7582]/15 border border-[#FF7582]/40 flex items-center justify-center text-[#FF7582] font-bold text-xs font-mono">
                          {testimonial.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-xs text-white tracking-wider">{testimonial.name}</div>
                        <div className="text-[10px] text-[#8FAFD4] uppercase">{formatGameName(testimonial.game)}</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className="text-[10px] px-2 py-0.5 bg-black/60 border border-white/15 text-white/70 font-mono">
                        {testimonial.rank}
                      </div>
                      <div className="text-[9px] text-white/40">
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
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <button
                        onClick={() => setExpandedResponseId(
                          expandedResponseId === testimonial.id ? null : testimonial.id
                        )}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-black/60 border border-[#8FAFD4]/40 text-[#8FAFD4] hover:bg-[#8FAFD4]/10 text-xs font-mono transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <Shield size={13} className="text-[#8FAFD4]" />
                          <span className="uppercase text-[10px] tracking-wider font-bold">RÉPONSE DU COACH POULPY</span>
                        </span>
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-200 ${expandedResponseId === testimonial.id ? 'rotate-180 text-[#8FAFD4]' : ''}`}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {expandedResponseId === testimonial.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 p-3 bg-black/80 border-l-2 border-[#8FAFD4] text-xs font-mono">
                              <p className="text-white/80 leading-relaxed whitespace-pre-wrap text-[11px]">
                                {testimonial.admin_response}
                              </p>
                              {testimonial.admin_response_at && (
                                <div className="text-[9px] text-white/30 mt-2">
                                  Publié le {new Date(testimonial.admin_response_at).toLocaleDateString('fr-FR')}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : user?.isAdmin && (
                    <div className="mt-4 pt-3 border-t border-white/10">
                      {respondingToId === testimonial.id ? (
                        <div className="p-3 bg-black/80 border border-white/15">
                          <textarea
                            rows={3}
                            placeholder="Rédiger votre réponse officielle..."
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            className="w-full p-2 bg-black border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#FF7582] mb-2 font-mono"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setRespondingToId(null);
                                setResponseText('');
                              }}
                              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white/60 text-xs"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={() => handleAdminResponse(testimonial.id)}
                              disabled={isSubmittingResponse}
                              className="btn-cyber-primary text-xs py-1 px-3"
                            >
                              {isSubmittingResponse ? 'Envoi...' : 'Publier'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRespondingToId(testimonial.id)}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[10px] uppercase font-mono tracking-wider transition-colors cursor-pointer border border-white/10"
                        >
                          <MessageSquare size={13} />
                          <span>Répondre à cet avis (Admin)</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Inline Edit Form */}
                  {editingId === testimonial.id && (
                    <div className="mt-4 p-4 bg-black/90 border border-[#FF7582]/40">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                        <span className="text-[10px] text-[#FF7582] font-bold uppercase tracking-wider">
                          MODIFICATION DE L'AVIS
                        </span>
                        <span className="text-[9px] text-white/40">
                          {formatRemaining(editTimeRemaining(testimonial))} restants
                        </span>
                      </div>

                      <div className="space-y-3 text-xs">
                        <textarea
                          rows={3}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          maxLength={2000}
                          className="w-full p-2 bg-black border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#FF7582] resize-none font-mono"
                        />

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setEditRating(star)}
                                onMouseEnter={() => setEditHoverRating(star)}
                                onMouseLeave={() => setEditHoverRating(0)}
                                className="p-0.5 cursor-pointer"
                              >
                                <Star
                                  size={16}
                                  className={`${
                                    (editHoverRating || editRating) >= star
                                      ? 'fill-[#FF7582] text-[#FF7582]'
                                      : 'text-white/20'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              disabled={isSubmittingEdit}
                              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white/60 text-xs"
                            >
                              Annuler
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSubmitEdit(testimonial.id)}
                              disabled={isSubmittingEdit || !editText.trim()}
                              className="btn-cyber-primary text-xs py-1 px-3"
                            >
                              {isSubmittingEdit ? 'Enregistrement...' : 'Sauvegarder'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16 max-w-5xl mx-auto">
          <div className="reticle-box p-5 bg-[#090c10] border border-white/10 text-center">
            <div className="text-3xl sm:text-4xl font-display text-[#FF7582] tracking-wider">
              {reviews.length}+
            </div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Avis Vérifiés</div>
          </div>
          <div className="reticle-box p-5 bg-[#090c10] border border-white/10 text-center">
            <div className="text-3xl sm:text-4xl font-display text-[#8FAFD4] tracking-wider">
              {avgRating}/5
            </div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Note Moyenne</div>
          </div>
          <div className="reticle-box p-5 bg-[#090c10] border border-white/10 text-center">
            <div className="text-3xl sm:text-4xl font-display text-[#A4DE87] tracking-wider">
              100%
            </div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Satisfaction</div>
          </div>
          <div className="reticle-box p-5 bg-[#090c10] border border-white/10 text-center">
            <div className="text-3xl sm:text-4xl font-display text-white tracking-wider">
              {distinctGames}
            </div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Disciplines</div>
          </div>
        </div>

        {/* Back to home / CTA */}
        <div className="text-center pt-8 border-t border-white/10">
          <Link
            href="/"
            className="btn-cyber-ghost text-xs"
          >
            <ArrowRight size={16} className="-rotate-90" />
            <span>RETOUR À L'ACCUEIL POULPY</span>
          </Link>
          <p className="text-xs text-white/40 mt-3 font-mono">
            Prêt à faire bondir ton rang ? Réserve ta session d'analyse et de coaching.
          </p>
        </div>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </main>
  );
}
