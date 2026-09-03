'use client';

import { MessageSquare, Send, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

interface Message {
  id: string;
  message: string;
  message_type: string;
  created_at: string;
  read_at: string | null;
  sender_id: string;
  admin_name?: string;
}

export default function StudentCoachingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async (markAsRead = true) => {
    if (!user?.id) return;

    try {
      let { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setSessionExpired(true);
        throw new Error('Non authentifié');
      }

      if (session.expires_at && new Date(session.expires_at * 1000) <= new Date()) {
        const { data: refreshed } = await supabase.auth.refreshSession();
        session = refreshed.session ?? session;
        if (!session?.access_token || (session.expires_at && new Date(session.expires_at * 1000) <= new Date())) {
          setSessionExpired(true);
          throw new Error('Session expirée, reconnecte-toi.');
        }
      }

      const res = await fetch('/api/student/messages', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Erreur de chargement');

      const adminIds = (data.messages || []).map((m: Message) => m.sender_id).filter(Boolean);
      const uniqueAdminIds = Array.from(new Set(adminIds));
      const adminMap = new Map<string, string>();

      if (uniqueAdminIds.length > 0) {
        const { data: admins } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', uniqueAdminIds);
        admins?.forEach((a) => adminMap.set(a.id, a.username));
      }

      const formatted = (data.messages || []).map((m: Message) => ({
        ...m,
        admin_name: adminMap.get(m.sender_id) || 'Coach',
      }));
      setMessages(formatted);

      if (markAsRead) {
        const unread = formatted.filter((m: Message) => !m.read_at && m.sender_id !== user.id);
        if (unread.length > 0) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            await fetch('/api/coaching/mark-read', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ studentId: user.id }),
            });
          }
        }
      }
    } catch (err) {
      console.error('Erreur chargement messages:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) fetchMessages();
  }, [user, fetchMessages]);

  // Marque les messages non lus comme lus quand l'élève quitte la page
  useEffect(() => {
    return () => {
      if (!user?.id) return;
      supabase.auth.getSession().then(({ data }) => {
        const token = data.session?.access_token;
        const uid = data.session?.user.id;
        if (!token || !uid) return;
        fetch('/api/coaching/mark-read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ studentId: uid }),
          keepalive: true,
        }).catch(() => {});
      });
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || sessionExpired) return;
    const interval = setInterval(() => fetchMessages(false), 8000);
    return () => clearInterval(interval);
  }, [user?.id, fetchMessages, sessionExpired]);

  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!isLoading && scrollRef.current) {
      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      });
    }
  }, [isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.id) return;
    setIsSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let token = session?.access_token;
      if (!token) throw new Error('Non authentifié');

      if (session!.expires_at && new Date(session!.expires_at * 1000) <= new Date()) {
        const { data: refreshed } = await supabase.auth.refreshSession();
        token = refreshed.session?.access_token ?? token;
        if (!token) {
          setSessionExpired(true);
          throw new Error('Session expirée, reconnecte-toi.');
        }
      }

      const res = await fetch('/api/coaching/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId: user.id,
          message: newMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Erreur envoi');
      setNewMessage('');
      await fetchMessages(false);
    } catch (err) {
      console.error('Erreur envoi:', err);
      setError(err instanceof Error ? err.message : 'Erreur envoi');
    } finally {
      setIsSending(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Non connecté</h1>
          <p className="text-gray-400">Connecte-toi pour discuter avec ton coach.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen page-bg py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/profile" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft size={20} />
            Retour au profil
          </Link>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <MessageSquare className="text-purple-400" />
            Chat avec ton coach
          </h1>
          <p className="text-gray-400">Échange en direct avec ton coach Poulpy</p>
        </div>

        <div className="card rounded-2xl overflow-hidden flex flex-col h-[70vh]">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-red-400">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageSquare size={48} className="mb-4 opacity-30" />
                <p>Aucun message pour le moment. Démarre la conversation !</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender_id === user.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        isMine
                          ? 'bg-gradient-to-br from-purple-600 to-cyan-500 text-white'
                          : 'bg-white/5 border border-white/10 text-gray-200'
                      }`}
                    >
                      {!isMine && (
                        <div className="text-xs font-semibold text-purple-400 mb-1">{msg.admin_name}</div>
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

          <form onSubmit={handleSend} className="border-t border-white/10 p-4 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={sessionExpired ? 'Session expirée — reconnecte-toi pour envoyer un message' : 'Écris un message à ton coach...'}
              disabled={isSending || sessionExpired}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-inherit placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim() || sessionExpired}
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