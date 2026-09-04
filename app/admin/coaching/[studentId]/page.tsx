'use client';

import Link from 'next/link';
import {
  Shield, ArrowLeft, User, Mail, Calendar, MessageSquare, Send,
  Loader2, AlertCircle, Trash2, Paperclip, Mic, X, Square, Play, Pause
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import AudioMessagePlayer from '@/components/AudioMessagePlayer';
import SocialLinks from '@/components/SocialLinks';

interface Message {
  id: string;
  message: string;
  message_type: string;
  created_at: string;
  read_at: string | null;
  sender_id: string;
  student_username?: string;
  attachment_url?: string | null;
  attachment_type?: 'image' | 'video' | 'audio' | null;
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
  discord?: string | null;
  twitch?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
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

      const res = await fetch(`/api/admin/users?userId=${encodeURIComponent(studentId)}`, {
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
        discord: profile.discord,
        twitch: profile.twitch,
        youtube: profile.youtube,
        tiktok: profile.tiktok,
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
          const { data: { session: s } } = await supabase.auth.getSession();
          if (s?.access_token) {
            await fetch('/api/coaching/mark-read', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${s.access_token}`,
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

  // Supabase Realtime : réception instantanée des messages
  useEffect(() => {
    if (!studentId) return;

    const channel = supabase
      .channel(`coaching_admin_chat_${studentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'coaching_messages',
          filter: `student_id=eq.${studentId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, { ...newMsg, student_username: student?.username }];
          });

          // Si le message vient de l'élève, marquer lu
          if (newMsg.sender_id !== user?.id) {
            supabase.auth.getSession().then(({ data }) => {
              if (data.session?.access_token) {
                fetch('/api/coaching/mark-read', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${data.session.access_token}`,
                  },
                  body: JSON.stringify({ studentId }),
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
  }, [studentId, student?.username, user?.id]);

  // Polling discret de secours (toutes les 25s)
  useEffect(() => {
    if (!user?.id || !studentId) return;
    const interval = setInterval(() => fetchStudentData(false), 25000);
    return () => clearInterval(interval);
  }, [studentId, user?.id, fetchStudentData]);

  // Marquer lu en quittant
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

  // Gestion de la sélection de fichier (image ou clip)
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

  // Gestion de l'enregistrement audio
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
        const file = new File([audioBlob], `note-vocale-${Date.now()}.webm`, { type: 'audio/webm' });

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
          throw new Error(uploadData.error || 'Erreur upload vocal');
        }

        const res = await fetch('/api/coaching/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentId,
            message: '',
            messageType,
            attachmentUrl: uploadData.url,
            attachmentType: 'audio',
          }),
        });

        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || 'Erreur envoi vocal');
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

  const handleSendMessage = async (e: React.FormEvent) => {
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
      const token = session?.access_token;
      if (!token) throw new Error('Non authentifié');

      let attachmentUrl: string | undefined = undefined;
      let attachmentType: 'image' | 'video' | undefined = undefined;

      // Upload du média si sélectionné
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
          studentId,
          message: trimmed,
          messageType,
          attachmentUrl,
          attachmentType,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Erreur envoi');

      setNewMessage('');
      removeSelectedFile();
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
      if (!res.ok || data.error) throw new Error(data.error || 'Erreur');
      setMessages([]);
      setShowConfirmClear(false);
    } catch (err) {
      console.error('Erreur purge conversation:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setIsClearing(false);
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
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <Link href="/admin/coaching" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
              Retour au coaching
            </Link>
            <Link
              href={`/admin/coaching/${studentId}/clips`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 text-xs font-semibold transition-colors"
            >
              🎬 Voir les clips VOD de l&apos;élève
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Chat avec {student?.username}</h1>
              <p className="text-gray-400 flex items-center gap-2 text-sm">
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

        {/* Jeux, Rang & Réseaux */}
        {student && (
          <div className="card rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {(student.valorantRank || student.apexRank) && (
                <>
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
                </>
              )}
            </div>

            {/* Réseaux sociaux de l'élève */}
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-gray-500 font-semibold hidden sm:inline">Réseaux :</span>
              <SocialLinks
                socials={{
                  discord: student.discord,
                  twitch: student.twitch,
                  youtube: student.youtube,
                  tiktok: student.tiktok,
                }}
                compact
              />
            </div>
          </div>
        )}

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
            aria-label="Messages du chat avec l'élève"
            className="flex-1 overflow-y-auto p-6 space-y-4"
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageSquare size={48} className="mb-4 opacity-30" />
                <p>Aucun message. Démarre la conversation.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender_id === user?.id;
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
                        <div className="text-xs font-semibold text-purple-400 mb-1">{student?.username}</div>
                      )}
                      {isMine && msg.message_type !== 'student' && (
                        <div className="text-xs font-semibold text-white/80 mb-1">{msg.message_type}</div>
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

                      {/* Texte du message */}
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
                            {msg.read_at ? '· Lu' : '· Envoyé'}
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
            {/* Type selector (Admin only) */}
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="text-[11px] text-gray-400 font-medium">Type de retour :</span>
              <div className="flex gap-1">
                {(['progression', 'feedback', 'tip'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setMessageType(t)}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize transition-all ${
                      messageType === t
                        ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                        : 'bg-white/5 text-gray-400 hover:text-white border border-transparent'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Prévisualisation média attaché */}
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

            {/* Mode enregistrement vocal en cours */}
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
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
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
                  disabled={isSending}
                  title="Joindre une image ou un extrait vidéo"
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/10 disabled:opacity-50"
                >
                  <Paperclip size={18} />
                </button>

                {/* Bouton micro note vocale */}
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={isSending}
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
                  placeholder={selectedFile ? "Ajoute un commentaire (optionnel)..." : "Écris un message à l'élève..."}
                  disabled={isSending}
                  maxLength={2000}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-inherit placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50 text-sm"
                />

                {/* Bouton envoyer */}
                <button
                  type="submit"
                  disabled={isSending || (!newMessage.trim() && !selectedFile)}
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