'use client';

import Link from 'next/link';
import { Shield, ArrowLeft, User, Mail, Calendar, MessageSquare, Send, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';

interface Message {
  id: string;
  message: string;
  message_type: string;
  created_at: string;
  read_at: string | null;
  admin_name: string;
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

  const fetchStudentData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      // Fetch student profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .single();

      if (profileError) throw profileError;

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

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('coaching_messages')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Get admin names
      const adminIds = messagesData?.map((m: any) => m.admin_id) || [];
      const { data: admins } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', adminIds);

      const adminMap = new Map(admins?.map((a: any) => [a.id, a.username]) || []);

      const formattedMessages = (messagesData || []).map((m: any) => ({
        id: m.id,
        message: m.message,
        message_type: m.message_type,
        created_at: m.created_at,
        read_at: m.read_at,
        admin_name: adminMap.get(m.admin_id) || 'Admin',
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (user?.isAdmin && studentId) {
      fetchStudentData();
    }
  }, [user, studentId, fetchStudentData]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.id) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/admin/coaching/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          adminId: user.id,
          message: newMessage.trim(),
          messageType,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Erreur envoi');

      setNewMessage('');
      fetchStudentData();
    } catch (error) {
      console.error('Erreur envoi message:', error);
      setError('Erreur lors de l\'envoi du message');
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

  if (isLoading) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Erreur</h1>
          <p className="text-gray-400">{error || 'Étudiant non trouvé'}</p>
          <Link
            href="/admin/coaching"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={18} />
            Retour
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen page-bg py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/coaching"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Retour aux étudiants
          </Link>
          <h1 className="text-3xl font-bold mb-2">Profil de {student.username}</h1>
          <p className="text-gray-400">Gérez la progression de cet étudiant</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Student Profile Card */}
          <div className="lg:col-span-1">
            <div className="card rounded-xl p-6 sticky top-24">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                {student.avatarUrl ? (
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500/30 mb-4">
                    <img
                      src={student.avatarUrl}
                      alt={student.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-4xl mb-4">
                    {student.initial}
                  </div>
                )}
                <h2 className="text-2xl font-bold">{student.username}</h2>
                <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                  <Mail size={14} />
                  <span>{student.email}</span>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-3 border-t border-white/5 pt-4">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-gray-300">
                    Inscrit le {new Date(student.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Send Message Form */}
            <div className="card rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MessageSquare size={20} className="text-purple-400" />
                Envoyer un message
              </h3>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type de message
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: 'progression', label: 'Progression' },
                      { value: 'feedback', label: 'Feedback' },
                      { value: 'tip', label: 'Conseil' },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setMessageType(type.value as any)}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          messageType === type.value
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Partagez des conseils, feedback ou progression..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-inherit placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/40 transition-all disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Envoyer
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Messages History */}
            <div className="card rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Historique des messages</h3>
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Aucun message envoyé pour le moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/20 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-purple-400">{msg.admin_name}</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                            {msg.message_type}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-gray-300">{msg.message}</p>
                      {msg.read_at && (
                        <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                          <span>✓ Lu le {new Date(msg.read_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
