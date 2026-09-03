'use client';

import Link from 'next/link';
import { Shield, ArrowLeft, User, Mail, Calendar, MessageSquare, Send, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';

interface Message {
  id: string;
  message: string;
  message_type: string;
  created_at: string;
  read_at: string | null;
  sender_id: string;
  student_username?: string;
}

interface StudentProfile {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  avatarUrl?: string | null;
  initial: string;
  favoriteGame?: 'valorant' | 'apex' | null;
  valorantRank?: string | null;
  apexRank?: string | null;
}

export default function StudentCoachingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const params = useParams();
  const studentId = params.studentId as string;

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'progression' | 'feedback' | 'tip'>('progression');
  const [error, setError] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showConfirmClear) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isClearing) setShowConfirmClear(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [showConfirmClear, isClearing]);

  const fetchStudentData = useCallback(async (markAsRead = false) => {
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Non authentifié');

      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Erreur chargement');
      }
      const data = await res.json();
      const profile = (data.users || []).find((u: { id: string }) => u.id === studentId);

      if (!profile) {
        setError('Étudiant non trouvé');
        return;
      }

      setStudent({
        id: profile.id,
        username: profile.username,
        email: profile.email || '',
        isAdmin: profile.isAdmin,
        createdAt: profile.createdAt,
        avatarUrl: profile.avatarUrl,
        initial: profile.initial,
        favoriteGame: profile.favoriteGame,
        valorantRank: profile.valorantRank,
        apexRank: profile.apexRank,
      });

      const { data: messagesData } = await supabase
        .from('coaching_messages')
        .select('id, message, message_type, created_at, read_at, sender_id, student_id, admin_id')
        .eq('student_id', studentId)
        .order('created_at', { ascending: true });

      const formatted = (messagesData || []).map((m: Message) => ({
        ...m,
        student_username: profile.username,
      }));
      setMessages(formatted);

      if (markAsRead && user?.id) {
        const unread = formatted.filter((m) => !m.read_at && m.sender_id !== user.id);
        if (unread.length > 0) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            await fetch('/api/coaching/mark-read', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ studentId }),
            });
          }
        }
      }
    } catch (err) {
      console.error('Erreur chargement données:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  }, [studentId, user?.id]);

  useEffect(() => {
    if (user?.isAdmin && studentId) fetchStudentData(true);
  }, [user, studentId, fetchStudentData]);

  useEffect(() => {
    if (!user?.id || !studentId) return;
    const interval = setInterval(() => fetchStudentData(false), 8000);
    return () => clearInterval(interval);
  }, [studentId, user?.id, fetchStudentData]);

  // Marquer les messages non lus comme lus quand l'admin quitte la page
  useEffect(() => {
    return () => {
      if (!user?.id || !studentId) return;
      supabase.auth.getSession().then(({ data }) => {
        const token = data.session?.access_token;
        if (!token) return;
        fetch('/api/coaching/mark-read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ studentId }),
          keepalive: true,
        }).catch(() => {});
      });
    };
  }, [studentId, user?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || !user?.id) return;
    if (trimmed.length > 2000) {
      setError('Le message ne doit pas dépasser 2000 caractères.');
      return;
    }

    setIsSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Non authentifié');

      const res = await fetch('/api/coaching/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId,
          message: newMessage.trim(),
          messageType,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Erreur envoi');
      setNewMessage('');
      await fetchStudentData(false);
    } catch (err) {
      console.error('Erreur envoi message:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
    } finally {
      setIsSending(false);
    }
  };

  const handleClearConversation = async () => {
    if (!studentId) return;
    setIsClearing(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Non authentifié');

      const res = await fetch(`/api/admin/coaching/clear/${studentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Erreur suppression');

      setShowConfirmClear(false);
      setMessages([]);
    } catch (err) {
      console.error('Erreur clear conversation:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setIsClearing(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Accès refusé</h1>
          <p className="text-gray-400">Cette page est réservée aux administrateurs.</p>
        </div>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Erreur</h1>
          <p className="text-gray-400">{error}</p>
          <Link href="/admin/coaching" className="inline-flex items-center gap-2 mt-4 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft size={18} />
            Retour
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen page-bg py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/admin/coaching" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft size={20} />
            Retour aux étudiants
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Chat avec {student?.username}</h1>
              <p className="text-gray-400 flex items-center gap-2">
                <Mail size={14} /> {student?.email} · Inscrit le {student && new Date(student.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
            {!showConfirmClear ? (
              <button
                type="button"
                onClick={() => setShowConfirmClear(true)}
                disabled={messages.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Supprimer définitivement tous les messages de cette conversation"
              >
                <Trash2 size={16} />
                Vider la conversation
              </button>
            ) : (
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Confirmation de suppression de la conversation"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30"
              >
                <span className="text-sm text-red-300">Confirmer la suppression ?</span>
                <button
                  type="button"
                  onClick={handleClearConversation}
                  disabled={isClearing}
                  className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  {isClearing ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  Oui, tout supprimer
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmClear(false)}
                  disabled={isClearing}
                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Jeux & Rang */}
        {student && (student.valorantRank || student.apexRank) && (
          <div className="card rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-3">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Jeux & rang</span>
            {student.valorantRank && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-sm font-medium">
                🔫 Valorant · <span className="font-bold">{student.valorantRank}</span>
              </span>
            )}
            {student.apexRank && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-sm font-medium">
                ⚡ Apex Legends · <span className="font-bold">{student.apexRank}</span>
              </span>
            )}
            {!student.valorantRank && !student.apexRank && (
              <span className="text-sm text-gray-500 italic">Aucun rang renseigné</span>
            )}
          </div>
        )}

        <div className="card rounded-2xl overflow-hidden flex flex-col h-[70vh]">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageSquare size={48} className="mb-4 opacity-30" />
                <p>Aucun message. Démarre la conversation.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender_id === user.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        isMine
                          ? 'bg-gradient-to-br from-purple-600 to-cyan-500 text-white'
                          : 'bg-white/5 border border-white/10 text-gray-200'
                      }`}
                    >
                      {!isMine && (
                        <div className="text-xs font-semibold text-purple-400 mb-1">{student?.username}</div>
                      )}
                      {isMine && msg.message_type !== 'student' && (
                        <div className="text-xs font-semibold text-white/80 mb-1">{msg.message_type}</div>
                      )}
                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                      <div className={`text-[10px] mt-1 ${isMine ? 'text-white/70' : 'text-gray-500'}`}>
                        {new Date(msg.created_at).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSendMessage} className="border-t border-white/10 p-4 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écris un message à l'élève..."
              disabled={isSending}
              maxLength={2000}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-inherit placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="px-5 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/40 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}