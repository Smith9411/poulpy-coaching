'use client';

import {
  MessageSquare, Send, Loader2, AlertCircle, ArrowLeft,
  Paperclip, Mic, X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import AudioMessagePlayer from '@/components/AudioMessagePlayer';

interface Message {
  id: string;
  message: string;
  message_type: string;
  created_at: string;
  read_at: string | null;
  sender_id: string;
  admin_name?: string;
  attachment_url?: string | null;
  attachment_type?: 'image' | 'video' | 'audio' | null;
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

  // Média sélectionné (image ou clip vidéo)
  const [selectedFile, setSelectedFile] = useState<{
    file: File;
    previewUrl: string;
    type: 'image' | 'video';
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Enregistrement vocal
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Zoom lightbox image
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

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
          const { data: { session: s } } = await supabase.auth.getSession();
          if (s?.access_token) {
            await fetch('/api/coaching/mark-read', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${s.access_token}`,
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

  // Supabase Realtime : réception instantanée des messages du coach
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`coaching_student_chat_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'coaching_messages',
          filter: `student_id=eq.${user.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, { ...newMsg, admin_name: 'Coach' }];
          });

          // Si le message vient du coach, marquer lu
          if (newMsg.sender_id !== user.id) {
            supabase.auth.getSession().then(({ data }) => {
              if (data.session?.access_token) {
                fetch('/api/coaching/mark-read', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${data.session.access_token}`,
                  },
                  body: JSON.stringify({ studentId: user.id }),
                }).catch(() => {});
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Polling de secours discret (toutes les 25s)
  useEffect(() => {
    if (!user?.id || sessionExpired) return;
    const interval = setInterval(() => fetchMessages(false), 25000);
    return () => clearInterval(interval);
  }, [user?.id, fetchMessages, sessionExpired]);

  // Marque les messages comme lus en quittant la page
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

  // Gestion sélection média (image / clip)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImg = file.type.startsWith('image/');
    const isVid = file.type.startsWith('video/');

    if (!isImg && !isVid) {
      setError('Format non supporté. Choisis une image (PNG, JPG, WEBP) ou une vidéo (MP4, WEBM).');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedFile({
      file,
      previewUrl,
      type: isImg ? 'image' : 'video',
    });
    setError('');
  };

  const removeSelectedFile = () => {
    if (selectedFile?.previewUrl) URL.revokeObjectURL(selectedFile.previewUrl);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Enregistrement vocal
  const startRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Erreur accès micro:', err);
      setError('Impossible d\'accéder au micro. Vérifie les autorisations de ton navigateur.');
    }
  };

  const cancelRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    audioChunksRef.current = [];
  };

  const stopAndSendRecording = async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

    setIsSending(true);
    setIsRecording(false);

    mediaRecorderRef.current.onstop = async () => {
      try {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], `vocal-${Date.now()}.webm`, { type: 'audio/webm' });

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error('Non authentifié');

        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch('/api/coaching/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || uploadData.error) {
          throw new Error(uploadData.error || 'Erreur upload note vocale');
        }

        const res = await fetch('/api/coaching/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentId: user!.id,
            message: '',
            attachmentUrl: uploadData.url,
            attachmentType: 'audio',
          }),
        });

        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || 'Erreur envoi note vocale');
      } catch (err) {
        console.error('Erreur envoi note vocale:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi de la note vocale');
      } finally {
        setIsSending(false);
        setRecordingSeconds(0);
        audioChunksRef.current = [];
      }
    };

    mediaRecorderRef.current.stop();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed && !selectedFile) return;

    if (trimmed.length > 2000) {
      setError('Le message ne doit pas dépasser 2000 caractères.');
      return;
    }

    setIsSending(true);
    setError('');

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

      let attachmentUrl: string | undefined = undefined;
      let attachmentType: 'image' | 'video' | undefined = undefined;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile.file);

        const uploadRes = await fetch('/api/coaching/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || uploadData.error) {
          throw new Error(uploadData.error || 'Erreur upload du média');
        }

        attachmentUrl = uploadData.url;
        attachmentType = selectedFile.type;
      }

      const res = await fetch('/api/coaching/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId: user!.id,
          message: trimmed,
          attachmentUrl,
          attachmentType,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Erreur envoi');

      setNewMessage('');
      removeSelectedFile();
    } catch (err) {
      console.error('Erreur envoi:', err);
      setError(err instanceof Error ? err.message : 'Erreur envoi');
    } finally {
      setIsSending(false);
    }
  };

  const formatRecordTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
      {/* Lightbox zoom image */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomedImage(null)}
        >
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={24} />
          </button>
          <img
            src={zoomedImage}
            alt="Plein écran"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <Link href="/profile" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
              Retour au profil
            </Link>
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href="/profile/sheet"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-xs font-semibold transition-colors"
              >
                📋 Ma fiche de suivi
              </Link>
              <Link
                href="/profile/vod"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 text-xs font-semibold transition-colors"
              >
                🎬 Voir mes clips VOD
              </Link>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <MessageSquare className="text-purple-400" />
            Chat avec ton coach
          </h1>
          <p className="text-gray-400">Échange en direct avec ton coach Poulpy</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="card rounded-2xl overflow-hidden flex flex-col h-[70vh]">
          {/* Zone des messages */}
          <div
            ref={scrollRef}
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            aria-label="Messages du chat"
            className="flex-1 overflow-y-auto p-6 space-y-4"
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageSquare size={48} className="mb-4 opacity-30" />
                <p>Aucun message. Pose une question à ton coach !</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender_id === user.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-lg ${
                        isMine
                          ? 'bg-gradient-to-br from-purple-600 to-cyan-500 text-white'
                          : 'bg-white/5 border border-white/10 text-gray-200'
                      }`}
                    >
                      {!isMine && (
                        <div className="text-xs font-semibold text-purple-400 mb-1">{msg.admin_name}</div>
                      )}

                      {/* Pièce jointe */}
                      {msg.attachment_url && (
                        <div className="mb-2">
                          {msg.attachment_type === 'image' && (
                            <img
                              src={msg.attachment_url}
                              alt="Capture"
                              onClick={() => setZoomedImage(msg.attachment_url!)}
                              className="max-h-72 max-w-full rounded-xl object-contain cursor-pointer hover:opacity-95 transition-opacity"
                            />
                          )}
                          {msg.attachment_type === 'video' && (
                            <video
                              src={msg.attachment_url}
                              controls
                              playsInline
                              className="max-h-80 max-w-full rounded-xl bg-black"
                            />
                          )}
                          {msg.attachment_type === 'audio' && (
                            <AudioMessagePlayer src={msg.attachment_url} isMine={isMine} />
                          )}
                        </div>
                      )}

                      {/* Texte */}
                      {msg.message && (!msg.attachment_url || !['🎙️ Note vocale', '🎬 Extrait vidéo', '📷 Photo / Capture'].includes(msg.message)) && (
                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{msg.message}</p>
                      )}

                      <div className={`text-[10px] mt-1.5 flex items-center gap-1 ${isMine ? 'text-white/70' : 'text-gray-500'}`}>
                        <span>
                          {new Date(msg.created_at).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isMine && (
                          <span className="ml-1 opacity-80">
                            {msg.read_at ? '· Lu par le coach' : '· Envoyé'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Formulaire d'envoi */}
          <div className="border-t border-white/10 p-3 bg-white/[0.02]">
            {/* Aperçu média sélectionné */}
            {selectedFile && (
              <div className="mb-2 p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {selectedFile.type === 'image' ? (
                    <img src={selectedFile.previewUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <video src={selectedFile.previewUrl} className="w-12 h-12 rounded-lg object-cover bg-black" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{selectedFile.file.name}</p>
                    <p className="text-[10px] text-gray-400">{Math.round(selectedFile.file.size / 1024)} Ko · {selectedFile.type}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeSelectedFile}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Enregistrement vocal en cours */}
            {isRecording ? (
              <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <span className="text-sm font-semibold text-red-300">Enregistrement note vocale...</span>
                  <span className="text-xs font-mono text-red-400 bg-red-500/20 px-2 py-0.5 rounded">
                    {formatRecordTime(recordingSeconds)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cancelRecording}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={stopAndSendRecording}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs font-semibold hover:shadow-md transition-all"
                  >
                    <Send size={12} />
                    Envoyer le vocal
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSend} className="flex items-center gap-2">
                {/* Input file caché */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Bouton trombone Média */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSending || sessionExpired}
                  title="Joindre une image ou un extrait vidéo"
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/10 disabled:opacity-50"
                >
                  <Paperclip size={18} />
                </button>

                {/* Bouton micro note vocale */}
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={isSending || sessionExpired}
                  title="Enregistrer une note vocale"
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-purple-400 hover:text-purple-300 transition-colors border border-white/10 disabled:opacity-50"
                >
                  <Mic size={18} />
                </button>

                {/* Champ texte */}
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={sessionExpired ? 'Session expirée — reconnecte-toi pour envoyer un message' : selectedFile ? "Ajoute un commentaire (optionnel)..." : 'Écris un message à ton coach...'}
                  disabled={isSending || sessionExpired}
                  maxLength={2000}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-inherit placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50 text-sm"
                />

                {/* Bouton envoyer */}
                <button
                  type="submit"
                  disabled={isSending || (!newMessage.trim() && !selectedFile) || sessionExpired}
                  className="px-5 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/40 transition-all disabled:opacity-40 flex items-center gap-2 shrink-0"
                >
                  {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}