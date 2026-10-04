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

function formatRank(rankStr?: string): string {
  if (!rankStr) return '';
  return rankStr.replace(/->/g, '➔').replace(/→/g, '➔');
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
          text: trimmedText,
          rating,
          rank: finalRank,
          game: gameNormalized,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || `Erreur serveur (${res.status})`);
      }

      setReviews((prev) => [data.review, ...prev]);
      setText('');
      setRank('');
      setRankFrom('');
      setRankTo('');
      setCustomRank('');
      setRating(5);
      setIsFormOpen(false);
      showStatus('success', 'Ton avis a été publié avec succès !');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la publication';
      showStatus('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      let { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        const { data: r } = await supabase.auth.refreshSession();
        session = r.session;
      }
      if (!session?.access_token) throw new Error('Session expirée.');

      const res = await fetch(`/api/reviews?id=${encodeURIComponent(reviewId)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Erreur lors de la suppression');

      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setConfirmDeleteId(null);
      showStatus('success', 'Avis supprimé avec succès.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      showStatus('error', msg);
    }
  };

  const handleStartEdit = (review: Review) => {
    setEditingId(review.id);
    setEditText(review.text);
    setEditRating(review.rating);
    setEditHoverRating(0);

    const gameMapped = review.game === 'valorant' ? 'Valorant' : review.game === 'apex' ? 'Apex Legends' : 'Autre';
    setEditGame(gameMapped);

    if (review.rank.includes('→')) {
      const parts = review.rank.split('→').map((s) => s.trim());
      setEditRankType('progression');
      setEditRankFrom(parts[0] || '');
      setEditRankTo(parts[1] || '');
      setEditRank('');
      setEditCustomRank('');
    } else if (gameMapped === 'Autre') {
      setEditRankType('rank');
      setEditCustomRank(review.rank);
      setEditRank('');
    } else {
      setEditRankType('rank');
      setEditRank(review.rank);
      setEditCustomRank('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditRating(5);
  };

  const handleSubmitEdit = async (reviewId: string) => {
    const trimmedText = editText.trim();
    if (!trimmedText) {
      showStatus('error', "Merci d'écrire un message.");
      return;
    }

    setIsSubmittingEdit(true);
    try {
      let { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        const { data: r } = await supabase.auth.refreshSession();
        session = r.session;
      }
      const token = session?.access_token;
      if (!token) throw new Error('Session expirée.');

      const gameNormalized = editGame === 'Valorant' ? 'valorant' : editGame === 'Apex Legends' ? 'apex' : 'aim';

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
        const { data: r } = await supabase.auth.refreshSession();
        session = r.session;
      }
      const token = session?.access_token;
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

  return (
    <main className="min-h-screen bg-[#0A1C1D] text-[#F5F4F0] selection:bg-[#CA1C30] selection:text-[#0A1C1D] pt-28 pb-24 font-mono relative z-10 overflow-x-hidden">
      <CyberNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Header with Navigation & Section Title */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-mono text-[#00B4A0] hover:text-white transition-colors uppercase tracking-wider"
            >
              <ArrowLeft size={14} />
              <span>RETOUR À L&apos;ACCUEIL</span>
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-xs text-[#F5F4F0]/40 uppercase tracking-wider">REGISTRE DES AVIS</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl font-display uppercase tracking-wider text-[#F5F4F0]">
                RÉSULTATS DES <span className="text-[#00B4A0]">ÉLÈVES</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#F5F4F0]/60 max-w-2xl leading-relaxed font-sans">
                Retours d&apos;expérience vérifiés et progression de rang après accompagnement par Coach Poulpy.
              </p>
            </div>

            {/* Action CTA Button */}
            <div>
              {user ? (
                <button
                  onClick={() => setIsFormOpen(!isFormOpen)}
                  className="btn-cyber-primary text-xs py-3 px-6 cursor-pointer inline-flex items-center gap-2 shadow-[0_0_20px_rgba(202,28,48,0.25)]"
                >
                  <MessageSquarePlus size={16} />
                  <span>{isFormOpen ? 'FERMER LE FORMULAIRE' : 'RÉDIGER UN AVIS'}</span>
                </button>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="btn-cyber-primary text-xs py-3 px-6 cursor-pointer inline-flex items-center gap-2 shadow-[0_0_20px_rgba(202,28,48,0.25)]"
                >
                  <UserIcon size={16} />
                  <span>SE CONNECTER POUR DÉPOSER UN AVIS</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Toast */}
        {statusMsg && (
          <div
            className={`max-w-2xl mx-auto p-4 text-xs font-mono flex items-center gap-3 rounded-2xl border ${
              statusMsg.type === 'success'
                ? 'bg-[#00B4A0]/10 border-[#00B4A0]/40 text-[#00B4A0]'
                : 'bg-[#CA1C30]/10 border-[#CA1C30]/40 text-[#CA1C30]'
            }`}
          >
            {statusMsg.type === 'success' ? <Check size={16} /> : <X size={16} />}
            <span className="font-bold">{statusMsg.text}</span>
          </div>
        )}

        {/* Admin Moderation Notice */}
        {user?.isAdmin && (
          <div className="p-4 bg-[#CA1C30]/10 border border-[#CA1C30]/30 rounded-2xl text-white text-xs flex items-center justify-between gap-4 font-mono">
            <div className="flex items-center gap-2.5">
              <Shield size={16} className="text-[#CA1C30] flex-shrink-0" />
              <span>
                <strong className="text-[#CA1C30]">MODE MODÉRATION ADMIN ACTIF :</strong> Vous pouvez épingler les avis sur l&apos;accueil, éditer, supprimer ou publier une réponse officielle.
              </span>
            </div>
          </div>
        )}

        {/* Add Review Form (With fully rounded corners and seamless bottom) */}
        <AnimatePresence>
          {isFormOpen && user && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="max-w-3xl mx-auto rounded-3xl overflow-hidden"
            >
              <form onSubmit={handleSubmitReview} className="p-8 sm:p-10 bg-[#121417]/95 backdrop-blur-xl rounded-3xl space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#CA1C30] shadow-[0_0_10px_#CA1C30]" />
                    <h3 className="text-xl font-display uppercase tracking-wider text-white">
                      RÉDIGER TON RETOUR D&apos;EXPÉRIENCE
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#00B4A0] uppercase font-bold tracking-wider">FORMULAIRE ÉLÈVE</span>
                </div>

                <div className="space-y-5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-[#F5F4F0]/70 uppercase tracking-wider mb-2">
                      PSEUDO AFFICHÉ
                    </label>
                    <input
                      type="text"
                      value={user.username}
                      disabled
                      className="w-full px-4 py-3 bg-[#1A1822] rounded-xl text-white/40 cursor-not-allowed text-xs font-mono border border-white/5"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-[#F5F4F0]/70 uppercase tracking-wider">
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
                        accent="red"
                      />
                    </div>

                    {game !== 'Autre' && (
                      <div>
                        <label className="block text-[11px] font-bold text-[#F5F4F0]/70 uppercase tracking-wider mb-2">
                          TYPE D&apos;INDICATION
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setRankType('rank')}
                            className={`flex-1 px-3 py-2.5 text-xs font-bold uppercase transition-all cursor-pointer rounded-xl ${
                              rankType === 'rank'
                                ? 'bg-[#CA1C30] text-black shadow-[0_0_10px_rgba(202,28,48,0.4)]'
                                : 'bg-[#1A1822] text-[#F5F4F0]/60 hover:text-white border border-white/5'
                            }`}
                          >
                            Rang Actuel
                          </button>
                          <button
                            type="button"
                            onClick={() => setRankType('progression')}
                            className={`flex-1 px-3 py-2.5 text-xs font-bold uppercase transition-all cursor-pointer rounded-xl ${
                              rankType === 'progression'
                                ? 'bg-[#CA1C30] text-black shadow-[0_0_10px_rgba(202,28,48,0.4)]'
                                : 'bg-[#1A1822] text-[#F5F4F0]/60 hover:text-white border border-white/5'
                            }`}
                          >
                            Progression
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {game === 'Autre' && (
                    <div>
                      <label className="block text-[11px] font-bold text-[#F5F4F0]/70 uppercase tracking-wider mb-2">
                        RANG / NIVEAU ATTEINT
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Top 500 Aimlab / Master 1200 LP"
                        value={customRank}
                        onChange={(e) => setCustomRank(e.target.value)}
                        className="w-full px-4 py-3 bg-[#1A1822] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#CA1C30]"
                      />
                    </div>
                  )}

                  {game !== 'Autre' && rankType === 'rank' && (
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-[#F5F4F0]/70 uppercase tracking-wider">
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

                  {game !== 'Autre' && rankType === 'progression' && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-[#F5F4F0]/70 uppercase tracking-wider">
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
                        <label className="block text-[11px] font-bold text-[#F5F4F0]/70 uppercase tracking-wider">
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

                  <div>
                    <label className="block text-[11px] font-bold text-[#F5F4F0]/70 uppercase tracking-wider mb-2">
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
                                ? 'fill-[#00B4A0] text-[#00B4A0]'
                                : 'text-white/20'
                            } transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-[#F5F4F0]/70 uppercase tracking-wider">
                      DÉBRIEF DU COACHING &amp; RÉSULTATS
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Décris l'impact du coaching : mécanique, placement du crosshair, mental, communication..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      maxLength={2000}
                      className="w-full px-4 py-3 bg-[#1A1822] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#CA1C30] resize-none font-sans"
                    />
                    <div className="flex items-center justify-between text-[10px] text-white/40">
                      <span>TEXTE BRUT</span>
                      <span>{text.length} / 2000</span>
                    </div>
                  </div>

                  {/* Submit buttons area fully rounded */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="btn-cyber-ghost text-xs py-2.5 px-5"
                    >
                      <X size={14} />
                      <span>ANNULER</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-cyber-primary text-xs py-2.5 px-6 disabled:opacity-50"
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

        {/* Clean Sort Controls (Épuré, sans conteneur lourd ni boutons de jeux) */}
        {!isLoading && reviews.length > 0 && (
          <div className="flex items-center justify-end gap-3 text-xs pt-2">
            <span className="text-[#F5F4F0]/40 uppercase text-[11px] font-bold tracking-wider">TRIER PAR :</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSortBy('date')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  sortBy === 'date'
                    ? 'bg-[#CA1C30] text-black shadow-[0_0_10px_rgba(202,28,48,0.4)]'
                    : 'bg-[#121417] text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                Date
              </button>
              <button
                onClick={() => setSortBy('rating')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  sortBy === 'rating'
                    ? 'bg-[#CA1C30] text-black shadow-[0_0_10px_rgba(202,28,48,0.4)]'
                    : 'bg-[#121417] text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                Note
              </button>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-1.5 bg-[#121417] text-xs text-[#00B4A0] hover:text-[#CA1C30] font-bold rounded-xl cursor-pointer hover:bg-white/10 transition-colors ml-1"
              >
                {sortOrder === 'asc' ? '↑ CROISSANT' : '↓ DÉCROISSANT'}
              </button>
            </div>
          </div>
        )}

        {/* Testimonials Grid (Sans pastilles rouges à côté des jeux) */}
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-[#CA1C30] border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-xs text-white/50 tracking-wider">CHARGEMENT DES AVIS ÉLÈVES...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((testimonial) => (
              <article
                id={`review-${testimonial.id}`}
                key={testimonial.id}
                className="p-7 sm:p-8 bg-[#121417]/95 backdrop-blur-xl rounded-3xl flex flex-col justify-between space-y-6 shadow-[0_15px_40px_rgba(0,0,0,0.7)] select-none group"
              >
                <div className="space-y-5">
                  
                  {/* Top Header inside Card (Clean, Sans pastille rouge à côté du nom de jeu) */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-[11px] font-mono tracking-wider text-[#F5F4F0]/60 uppercase font-bold">
                      {formatGameName(testimonial.game)}
                    </span>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5 text-[#00B4A0]">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} size={14} className="fill-current" />
                        ))}
                      </div>

                      {/* Admin/Owner Actions */}
                      {user && (user.id === testimonial.user_id || user.isAdmin) && (
                        <div className="flex items-center gap-1 ml-2">
                          {user.isAdmin && (
                            <button
                              onClick={() => handleToggleFeatured(testimonial.id, !testimonial.featured)}
                              disabled={togglingFeaturedId === testimonial.id}
                              title={testimonial.featured ? "Retirer de l'accueil" : "Mettre à l'accueil"}
                              className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                                testimonial.featured
                                  ? 'bg-[#CA1C30] text-black shadow-[0_0_8px_rgba(202,28,48,0.5)]'
                                  : 'bg-[#1A1822] text-white/50 hover:text-white'
                              }`}
                            >
                              ★
                            </button>
                          )}

                          {editingId !== testimonial.id && canEdit(testimonial) && (
                            <button
                              onClick={() => handleStartEdit(testimonial)}
                              className="p-1 text-white/40 hover:text-[#00B4A0] transition-colors cursor-pointer"
                            >
                              <Edit3 size={13} />
                            </button>
                          )}

                          {confirmDeleteId === testimonial.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteReview(testimonial.id)}
                                className="px-1.5 py-0.5 text-[9px] bg-red-500/20 text-red-400 font-bold rounded"
                              >
                                SUPPR
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-1 text-[9px] text-white/50"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(testimonial.id)}
                              className="p-1 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Student Name & Rank */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xl font-display font-bold text-[#F5F4F0] tracking-wider">{testimonial.name}</h4>
                      {testimonial.featured && (
                        <span className="px-2 py-0.5 bg-[#CA1C30]/15 text-[#CA1C30] border border-[#CA1C30]/30 rounded-md text-[9px] font-bold">
                          ACCUEIL
                        </span>
                      )}
                    </div>
                    {testimonial.rank && (
                      <p className="text-xs font-mono font-bold text-[#00B4A0]">
                        {formatRank(testimonial.rank)}
                      </p>
                    )}
                  </div>

                  {/* Testimonial Quote */}
                  <p className="text-sm text-[#F5F4F0]/85 leading-relaxed font-sans italic whitespace-pre-wrap">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                </div>

                {/* Footer Section: Date & Coach debrief */}
                <div className="space-y-3 pt-4">
                  <div className="text-[10px] text-[#F5F4F0]/30 font-mono">
                    Publié le {new Date(testimonial.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>

                  {/* Admin Response */}
                  {testimonial.admin_response ? (
                    <div className="p-3.5 bg-[#181622] border-l-2 border-[#CA1C30] rounded-r-2xl">
                      <p className="text-xs text-[#F5F4F0]/90 font-sans italic leading-relaxed">
                        <strong className="text-[#CA1C30] font-bold not-italic font-mono mr-1.5">Poulpy :</strong>
                        &ldquo;{testimonial.admin_response}&rdquo;
                      </p>
                    </div>
                  ) : user?.isAdmin && (
                    <div>
                      {respondingToId === testimonial.id ? (
                        <div className="p-3 bg-[#181622] rounded-xl space-y-2">
                          <textarea
                            rows={2}
                            placeholder="Rédiger la réponse officielle..."
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            className="w-full p-2 bg-black/60 rounded-lg text-xs text-white focus:outline-none focus:border-[#CA1C30] font-sans"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setRespondingToId(null);
                                setResponseText('');
                              }}
                              className="px-2 py-1 text-xs text-white/50"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={() => handleAdminResponse(testimonial.id)}
                              disabled={isSubmittingResponse}
                              className="btn-cyber-primary text-xs py-1 px-3"
                            >
                              Publier
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRespondingToId(testimonial.id)}
                          className="text-[10px] text-[#00B4A0] hover:text-white uppercase font-bold tracking-wider cursor-pointer"
                        >
                          + Répondre à cet avis (Admin)
                        </button>
                      )}
                    </div>
                  )}

                  {/* Inline Edit Form */}
                  {editingId === testimonial.id && (
                    <div className="p-4 bg-black/90 border border-[#CA1C30]/40 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between text-[10px] text-[#CA1C30] font-bold uppercase">
                        <span>Modification</span>
                        <span>{formatRemaining(editTimeRemaining(testimonial))} restants</span>
                      </div>
                      <textarea
                        rows={3}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        maxLength={2000}
                        className="w-full p-2 bg-[#1A1822] rounded-lg text-xs text-white focus:outline-none focus:border-[#CA1C30] font-sans"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setEditRating(star)}
                              className="p-0.5 cursor-pointer text-[#00B4A0]"
                            >
                              <Star
                                size={14}
                                className={editRating >= star ? 'fill-current' : 'text-white/20'}
                              />
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-2.5 py-1 text-xs text-white/50"
                          >
                            Annuler
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubmitEdit(testimonial.id)}
                            disabled={isSubmittingEdit || !editText.trim()}
                            className="btn-cyber-primary text-xs py-1 px-3"
                          >
                            Enregistrer
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Bottom CTA to return to Home or Book */}
        <div className="text-center pt-8 border-t border-white/10 space-y-4">
          <Link
            href="/"
            className="btn-cyber-primary px-8 py-3.5 text-xs font-bold font-mono tracking-wider cursor-pointer inline-flex items-center gap-2"
          >
            <span>RETOUR À L&apos;ACCUEIL &amp; RÉSERVER UN COACHING</span>
            <ArrowRight size={14} className="text-black" />
          </Link>
          <p className="text-xs text-[#F5F4F0]/40 font-mono">
            Analyse chirurgicale, VOD review et progression de rang garantie avec Coach Poulpy.
          </p>
        </div>

      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </main>
  );
}
