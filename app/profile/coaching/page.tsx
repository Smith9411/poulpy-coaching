'use client';

import { MessageSquare, Calendar, Check, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useCallback } from 'react';

interface Message {
  id: string;
  message: string;
  message_type: string;
  created_at: string;
  read_at: string | null;
  admin_name: string;
}

export default function StudentCoachingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMessages = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError('');
    try {
      // Get the session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('Non authentifié');
      }

      const res = await fetch('/api/student/messages', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok || data.error) throw new Error(data.error || 'Erreur de chargement');

      // Get admin names
      const adminIds = data.messages?.map((m: any) => m.admin_id) || [];
      const adminNamesResponse = await fetch('/api/admin/users');
      const usersData = await adminNamesResponse.json();
      const adminMap = new Map(
        usersData.users?.map((u: any) => [u.id, u.username]) || []
      );

      const formattedMessages = (data.messages || []).map((m: any) => ({
        id: m.id,
        message: m.message,
        message_type: m.message_type,
        created_at: m.created_at,
        read_at: m.read_at,
        admin_name: adminMap.get(m.admin_id) || 'Coach',
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      setError('Erreur lors du chargement des messages');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user, fetchMessages]);

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
          <p className="text-gray-400">Connecte-toi pour voir tes messages de coaching.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen page-bg py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <MessageSquare className="text-purple-400" />
            Messages de Coaching
          </h1>
          <p className="text-gray-400">Retours et conseils de ton coach</p>
        </div>

        {/* Messages */}
        {isLoading ? (
          <div className="p-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-gray-400">Chargement des messages...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-400">{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">Aucun message de coaching pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`card rounded-xl p-6 border transition-all ${
                  !msg.read_at
                    ? 'border-purple-500/30 bg-purple-500/5'
                    : 'border-white/5 bg-white/5'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                      {msg.admin_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-purple-400">{msg.admin_name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(msg.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                      {msg.message_type}
                    </span>
                    {msg.read_at && (
                      <div className="text-green-400" title="Lu">
                        <Check size={16} />
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-gray-200 leading-relaxed">{msg.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
