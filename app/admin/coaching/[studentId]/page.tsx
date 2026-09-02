'use client';

import Link from 'next/link';
import { Shield, ArrowLeft, User, Mail, Calendar, MessageSquare, Send, Loader2, AlertCircle } from 'lucide-react';
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchStudentData = useCallback(async (markAsRead = false) => {
    setError('');
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .single();

      if (!profile) {
        setError('Étudiant non trouvé');
        return;
      }

      setStudent({
        id: profile.id,
        username: profile.username,
        email: profile.email || '',
        isAdmin: profile.is_admin,
        createdAt: profile.created_at,
        avatarUrl: profile.avatar_url,
        initial: profile.username.charAt(0).toUpperCase(),
      });

      const { data: messagesData } = await supabase
        .from('coaching_messages')
        .select('*')
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
          await supabase
            .from('coaching_messages')
            .update({ read_at: new Date().toISOString() })
            .in('id', unread.map((m) => m.id));
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
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    queueMicrotask(() => {
      if (cancelled) return;
      channel = supabase
        .channel(`admin-chat-${studentId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'coaching_messages', filter: `student_id=eq.${studentId}` },
          () => fetchStudentData(true)
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [studentId, user?.id, fetchStudentData]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.id) return;

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
    } catch (err) {
      console.error('Erreur envoi message:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
    } finally {
      setIsSending(false);
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
          <h1 className="text-3xl font-bold mb-2">Chat avec {student?.username}</h1>
          <p className="text-gray-400 flex items-center gap-2">
            <Mail size={14} /> {student?.email} · Inscrit le {student && new Date(student.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>

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

          <form onSubmit={handleSendMessage} className="border-t border-white/10 p-4 space-y-3">
            <div className="flex gap-2">
              {[
                { value: 'progression', label: 'Progression' },
                { value: 'feedback', label: 'Feedback' },
                { value: 'tip', label: 'Conseil' },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setMessageType(type.value as 'progression' | 'feedback' | 'tip')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    messageType === type.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écris un message à l'élève..."
                disabled={isSending}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-inherit placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isSending || !newMessage.trim()}
                className="px-5 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/40 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}