'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface StudentSummary {
  totalCount: number;
  unreadMsgCount: number;
  newAnnotationsCount: number;
  lastMsg: { message: string; createdAt: string } | null;
  lastAnnotation: { clipTitle: string; content: string; createdAt: string } | null;
}

export function useStudentNotifications(userId: string | undefined) {
  const [summary, setSummary] = useState<StudentSummary | null>(null);

  useEffect(() => {
    if (!userId) {
      setSummary(null);
      return;
    }
    let cancelled = false;

    const fetchSummary = async () => {
      try {
        let { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        if (session.expires_at && new Date(session.expires_at * 1000) <= new Date()) {
          const { data: r } = await supabase.auth.refreshSession();
          session = r.session ?? session;
          if (!session?.access_token) return;
        }
        const res = await fetch('/api/notifications/student-summary', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setSummary(data);
      } catch {
        /* fail silently */
      }
    };

    fetchSummary();
    const interval = setInterval(fetchSummary, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [userId]);

  return summary;
}

export default function StudentNotificationsBell({ href }: { href?: string }) {
  const { user } = useAuth();
  const summary = useStudentNotifications(user?.id);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const totalCount = summary?.totalCount ?? 0;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setIsOpen(v => !v)}
        className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
        aria-label={`Notifications${totalCount > 0 ? ` (${totalCount})` : ''}`}
        aria-expanded={isOpen}
      >
        <Bell size={20} className="text-gray-300" />
        {totalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute right-0 top-full mt-2 w-80 bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <p className="font-semibold text-white">Notifications</p>
              {totalCount > 0 && (
                <span className="text-xs text-gray-400">{totalCount} non lu{totalCount > 1 ? 's' : ''}</span>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
              {totalCount === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  <Bell size={28} className="mx-auto mb-2 opacity-40" />
                  Aucun message pour le moment
                </div>
              ) : (
                <>
                  {/* Messages coach non lus */}
                  {(summary?.unreadMsgCount ?? 0) > 0 && summary?.lastMsg && (
                    <Link
                      href={href || '/profile/coaching'}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 hover:bg-white/5 transition-colors bg-purple-500/5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          🐙
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-white">Ton coach</p>
                            <span className="text-[10px] text-gray-500 shrink-0">
                              {new Date(summary.lastMsg.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                          <p className="text-xs text-white mt-0.5 line-clamp-2">{summary.lastMsg.message}</p>
                          <p className="text-[10px] text-purple-400 mt-0.5">
                            💬 {summary.unreadMsgCount} message{summary.unreadMsgCount > 1 ? 's' : ''} non lu{summary.unreadMsgCount > 1 ? 's' : ''}
                          </p>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0 mt-2" />
                      </div>
                    </Link>
                  )}

                  {/* Nouvelles annotations VOD */}
                  {(summary?.newAnnotationsCount ?? 0) > 0 && summary?.lastAnnotation && (
                    <Link
                      href="/profile/vod"
                      onClick={() => {
                        setIsOpen(false);
                        supabase.auth.getSession().then(({ data }) => {
                          if (data.session?.access_token) {
                            fetch('/api/vod/annotations/mark-read', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${data.session.access_token}`,
                              },
                            }).catch(() => {});
                          }
                        });
                      }}
                      className="block px-4 py-3 hover:bg-white/5 transition-colors bg-orange-500/5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          🎬
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-white truncate">Ton coach a analysé un clip</p>
                            <span className="text-[10px] text-gray-500 shrink-0">
                              {new Date(summary.lastAnnotation.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                          <p className="text-xs text-orange-300 mt-0.5 line-clamp-1">📎 {summary.lastAnnotation.clipTitle}</p>
                          <p className="text-[10px] text-orange-400 mt-0.5">
                            {summary.newAnnotationsCount} annotation{summary.newAnnotationsCount > 1 ? 's' : ''} cette semaine
                          </p>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-2" />
                      </div>
                    </Link>
                  )}
                </>
              )}
            </div>

            <Link
              href="/profile/coaching"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-center text-sm font-semibold text-purple-400 hover:bg-purple-500/10 transition-colors border-t border-white/10"
            >
              Ouvrir le chat coaching →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
