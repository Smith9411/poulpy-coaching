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
import CyberNavbar from '@/components/CyberNavbar';
import CyberFooter from '@/components/CyberFooter';

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
        const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshed?.session?.access_token) {
          setSessionExpired(true);
          throw new Error('Session expirée, reconnecte-toi.');
        }
        session = refreshed.session;
      }

      const res = await fetch(`/api/coaching/messages?studentId=${user.id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: 'no-store',
      });

      if (res.status === 401) {
        setSessionExpired(true);
        throw new Error('Session expirée, reconnecte-toi.');
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur serveur (${res.status})`);
      }

      const data = await res.json().catch(() => ({ messages: [] }));
      setMessages(data.messages || []);
      setError('');
      setSessionExpired(false);

      if (markAsRead) {
        fetch('/api/coaching/mark-read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ studentId: user.id }),
        }).catch((err) => console.error('Erreur mark-read:', err));
      }
    } catch (err) {
      console.error('Erreur fetch messages:', err);
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    setIsLoading(true);
    fetchMessages(true);

    const interval = setInterval(() => {
      fetchMessages(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [user?.id, fetchMessages]);

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
        setRecordingSeconds((s) => {
          if (s >= 300) {
            stopAndSendRecording();
            return 300;
          }
          return s + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Erreur accès micro:', err);
      setError('Impossible d\'accéder au micro. Vérifie les autorisations de ton navigateur.');
    }
  };

  const cancelRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    audioChunksRef.current = [];
  };

  const stopAndSendRecording = async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setIsSending(true);

    setTimeout(async () => {
      try {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];

        if (audioBlob.size < 1000) {
          setError('Enregistrement trop court.');
          setIsSending(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        let token = session?.access_token;
        if (!token) throw new Error('Non authentifié');

        const audioFile = new File([audioBlob], `vocal_${Date.now()}.webm`, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', audioFile);

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
            studentId: user!.id,
            message: '🎙️ Note vocale',
            attachmentUrl: uploadData.url,
            attachmentType: 'audio',
          }),
        });

        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || 'Erreur envoi');

        fetchMessages(false);
      } catch (err) {
        console.error('Erreur envoi vocal:', err);
        setError(err instanceof Error ? err.message : 'Erreur envoi du vocal');
      } finally {
        setIsSending(false);
      }
    }, 300);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed && !selectedFile) return;

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
      fetchMessages(false);
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
      <div className="min-h-screen bg-[#0B0A0D] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#CA1C30]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0A0D] flex items-center justify-center px-4 font-mono">
        <div className="text-center reticle-box bg-[#121117] border border-white/10 p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-[#CA1C30] mx-auto mb-4" />
          <h1 className="text-xl font-bold font-display uppercase tracking-wider mb-2 text-white">CONNEXION REQUISE</h1>
          <p className="text-xs text-white/50 mb-6">Connecte-toi pour échanger en direct avec ton coach.</p>
          <Link href="/auth" className="btn-cyber-primary text-xs py-2.5 px-6">
            SE CONNECTER
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0A0D] cyber-grid text-[#F5F4F0] flex flex-col font-mono relative overflow-hidden">
      {/* Ambient Cyber Light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#00B4A0]/10 via-[#CA1C30]/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <CyberNavbar />

      {/* Lightbox zoom image */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomedImage(null)}
        >
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
          <img
            src={zoomedImage}
            alt="Plein écran"
            className="max-h-[90vh] max-w-[90vw] object-contain border border-white/20"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <main className="flex-1 py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <Link href="/profile" className="btn-cyber-ghost text-xs py-1.5 px-3 flex items-center gap-2">
                <ArrowLeft size={14} />
                <span>RETOUR AU PROFIL</span>
              </Link>
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href="/profile/sheet"
                  className="px-3 py-1.5 bg-[#00B4A0]/15 hover:bg-[#00B4A0]/25 text-[#00B4A0] border border-[#00B4A0]/30 text-xs font-bold uppercase transition-colors"
                >
                  📋 FICHE DE SUIVI
                </Link>
                <Link
                  href="/profile/vod"
                  className="px-3 py-1.5 bg-[#CA1C30]/15 hover:bg-[#CA1C30]/25 text-[#CA1C30] border border-[#CA1C30]/30 text-xs font-bold uppercase transition-colors"
                >
                  🎬 MES CLIPS VOD
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#CA1C30]/15 border border-[#CA1C30]/30 flex items-center justify-center text-[#CA1C30]">
                <MessageSquare size={20} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-wider text-white">
                  CANAL DIRECT // <span className="text-[#CA1C30]">COACH POULPY</span>
                </h1>
                <p className="text-xs text-white/50">Échange technique, analyses et suivi de progression</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Chat Container */}
          <div className="reticle-box bg-[#121117] border border-white/10 flex flex-col h-[70vh] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            {/* Messages Area */}
            <div
              ref={scrollRef}
              role="log"
              aria-live="polite"
              aria-relevant="additions"
              aria-label="Messages du chat"
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-[#CA1C30]" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/40 text-center">
                  <MessageSquare size={44} className="mb-3 opacity-20 text-[#CA1C30]" />
                  <p className="text-xs uppercase tracking-wider font-bold">AUCUN MESSAGE ACTUELLEMENT</p>
                  <p className="text-[11px] text-white/30 mt-1">Pose tes questions ou partage tes axes de travail à ton coach !</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender_id === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] p-4 border transition-all ${
                          isMine
                            ? 'bg-[#CA1C30]/15 border-[#CA1C30]/40 text-white shadow-[0_0_15px_rgba(202,28,48,0.1)]'
                            : 'bg-black/60 border-[#00B4A0]/30 text-white shadow-[0_0_15px_rgba(0,180,160,0.1)]'
                        }`}
                      >
                        {!isMine && (
                          <div className="text-[10px] font-bold text-[#00B4A0] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-[#00B4A0]" />
                            <span>{msg.admin_name || 'COACH POULPY'}</span>
                          </div>
                        )}

                        {/* Media attachment */}
                        {msg.attachment_url && (
                          <div className="mb-2">
                            {msg.attachment_type === 'image' && (
                              <img
                                src={msg.attachment_url}
                                alt="Capture"
                                onClick={() => setZoomedImage(msg.attachment_url!)}
                                className="max-h-72 max-w-full object-contain cursor-pointer border border-white/10 hover:border-white/40 transition-colors"
                              />
                            )}
                            {msg.attachment_type === 'video' && (
                              <video
                                src={msg.attachment_url}
                                controls
                                playsInline
                                className="max-h-80 max-w-full bg-black border border-white/10"
                              />
                            )}
                            {msg.attachment_type === 'audio' && (
                              <AudioMessagePlayer src={msg.attachment_url} isMine={isMine} />
                            )}
                          </div>
                        )}

                        {/* Text */}
                        {msg.message && (!msg.attachment_url || !['🎙️ Note vocale', '🎬 Extrait vidéo', '📷 Photo / Capture'].includes(msg.message)) && (
                          <p className="whitespace-pre-wrap break-words text-xs sm:text-sm leading-relaxed">{msg.message}</p>
                        )}

                        <div className={`text-[9px] mt-2 flex items-center justify-between gap-2 border-t pt-1.5 ${isMine ? 'border-[#CA1C30]/20 text-white/50' : 'border-white/10 text-white/40'}`}>
                          <span>
                            {new Date(msg.created_at).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMine && (
                            <span className="font-bold">
                              {msg.read_at ? '✓ LU' : '• ENVOYÉ'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Bar */}
            <div className="border-t border-white/10 p-3 bg-black/60">
              {/* Selected Media Preview */}
              {selectedFile && (
                <div className="mb-2 p-2 bg-[#121117] border border-white/15 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {selectedFile.type === 'image' ? (
                      <img src={selectedFile.previewUrl} alt="Preview" className="w-10 h-10 object-cover border border-white/10" />
                    ) : (
                      <video src={selectedFile.previewUrl} className="w-10 h-10 object-cover bg-black border border-white/10" />
                    )}
                    <div className="min-w-0 font-mono">
                      <p className="text-xs font-bold text-white truncate">{selectedFile.file.name}</p>
                      <p className="text-[10px] text-white/50">{Math.round(selectedFile.file.size / 1024)} Ko · {selectedFile.type}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeSelectedFile}
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Recording State */}
              {isRecording ? (
                <div className="flex items-center justify-between gap-3 px-3 py-2 bg-red-500/10 border border-red-500/30">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 bg-red-500 animate-ping" />
                    <span className="text-xs font-bold text-red-400">ENREGISTREMENT VOCAL...</span>
                    <span className="text-xs text-red-300 font-mono">
                      {formatRecordTime(recordingSeconds)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="btn-cyber-ghost text-xs py-1 px-3"
                    >
                      ANNULER
                    </button>
                    <button
                      type="button"
                      onClick={stopAndSendRecording}
                      className="btn-cyber-primary text-xs py-1 px-3 flex items-center gap-1.5"
                    >
                      <Send size={12} />
                      <span>ENVOYER</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Attachment button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSending || sessionExpired}
                    title="Joindre une image ou un extrait vidéo"
                    className="p-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <Paperclip size={16} />
                  </button>

                  {/* Voice recording button */}
                  <button
                    type="button"
                    onClick={startRecording}
                    disabled={isSending || sessionExpired}
                    title="Enregistrer une note vocale"
                    className="p-2.5 bg-[#CA1C30]/10 hover:bg-[#CA1C30]/20 text-[#CA1C30] border border-[#CA1C30]/30 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <Mic size={16} />
                  </button>

                  {/* Text input */}
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={sessionExpired ? 'Session expirée — reconnecte-toi pour envoyer un message' : selectedFile ? "Ajoute un commentaire (optionnel)..." : 'Transmettre une consigne ou une question...'}
                    disabled={isSending || sessionExpired}
                    maxLength={2000}
                    className="flex-1 px-3.5 py-2.5 bg-black border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-[#CA1C30] disabled:opacity-50 text-xs font-mono"
                  />

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isSending || (!newMessage.trim() && !selectedFile) || sessionExpired}
                    className="btn-cyber-primary text-xs py-2.5 px-4 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {isSending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    <span className="hidden sm:inline">ENVOYER</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <CyberFooter />
    </div>
  );
}