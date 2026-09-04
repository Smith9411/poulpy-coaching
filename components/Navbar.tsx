'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User, LogOut, ChevronDown, Settings, Shield, BarChart2, Bell, UserPlus, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import ThemeToggle from './ThemeToggle';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminUnreadMsg {
  type: 'message';
  studentId: string;
  studentName: string;
  count: number;
  lastMessage: string;
  lastAt: string;
}

interface AdminPendingClip {
  type: 'clip';
  clipId: string;
  studentId: string;
  studentName: string;
  title: string;
  submittedAt: string;
}

interface AdminUnreadBooking {
  bookingId: string;
  studentName: string;
  planName: string;
  bookingDate: string;
  bookingTime: string;
  game: string;
  createdAt: string;
}

interface AdminSummary {
  totalCount: number;
  totalUnread: number;
  totalClips: number;
  totalBookings?: number;
  unreadMessages: AdminUnreadMsg[];
  pendingClips: AdminPendingClip[];
  unreadBookings?: AdminUnreadBooking[];
}

export interface StudentBookingAlert {
  id: string;
  status: 'rescheduled' | 'cancelled';
  planName: string;
  bookingDate: string;
  bookingTime: string;
  adminNotes: string | null;
  updatedAt: string;
}

interface StudentSummary {
  totalCount: number;
  unreadMsgCount: number;
  newAnnotationsCount: number;
  bookingAlertsCount?: number;
  bookingAlerts?: StudentBookingAlert[];
  lastMsg: { message: string; createdAt: string } | null;
  lastAnnotation: { clipTitle: string; content: string; createdAt: string } | null;
}

// ─── Hook admin ───────────────────────────────────────────────────────────────
function useAdminNotifications(userId: string | undefined) {
  const [summary, setSummary] = useState<AdminSummary | null>(null);

  useEffect(() => {
    if (!userId) { setSummary(null); return; }
    let cancelled = false;

    const fetch_ = async () => {
      try {
        let { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        if (session.expires_at && new Date(session.expires_at * 1000) <= new Date()) {
          const { data: r } = await supabase.auth.refreshSession();
          session = r.session ?? session;
          if (!session?.access_token) return;
        }
        const res = await fetch('/api/notifications/admin-summary', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setSummary(data);
      } catch { /* silently fail */ }
    };

    fetch_();
    const interval = setInterval(fetch_, 10000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [userId]);

  return summary;
}

// ─── Hook élève ───────────────────────────────────────────────────────────────
function useStudentNotifications(userId: string | undefined) {
  const [summary, setSummary] = useState<StudentSummary | null>(null);

  useEffect(() => {
    if (!userId) { setSummary(null); return; }
    let cancelled = false;

    const fetch_ = async () => {
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
      } catch { /* silently fail */ }
    };

    fetch_();
    const interval = setInterval(fetch_, 10000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [userId]);

  return summary;
}

// ─── Cloche Admin ─────────────────────────────────────────────────────────────
function AdminNotificationsBell() {
  const { user } = useAuth();
  const summary = useAdminNotifications(user?.id);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const totalCount = summary?.totalCount ?? 0;
  const unreadMessages = summary?.unreadMessages ?? [];
  const pendingClips = summary?.pendingClips ?? [];

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
            className="absolute right-0 top-full mt-2 w-80 bg-gray-900/90 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <p className="font-semibold text-white">Notifications</p>
              {totalCount > 0 && (
                <span className="text-xs text-gray-400">{totalCount} en attente</span>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {totalCount === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  <Bell size={28} className="mx-auto mb-2 opacity-40" />
                  Tout est à jour
                </div>
              ) : (
                <>
                  {/* Messages non lus par élève */}
                  {unreadMessages.map(item => (
                    <Link
                      key={`msg-${item.studentId}`}
                      href={`/admin/coaching/${item.studentId}`}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors bg-cyan-500/5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {item.studentName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-white truncate">{item.studentName}</p>
                            <span className="text-[10px] text-gray-500 shrink-0">
                              {new Date(item.lastAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                          <p className="text-xs text-white mt-0.5 line-clamp-1">{item.lastMessage}</p>
                          <p className="text-[10px] text-cyan-400 mt-0.5">
                            💬 {item.count} message{item.count > 1 ? 's' : ''} non lu{item.count > 1 ? 's' : ''}
                          </p>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0 mt-2" />
                      </div>
                    </Link>
                  ))}

                  {/* Clips sans annotation */}
                  {pendingClips.map(item => (
                    <Link
                      key={`clip-${item.clipId}`}
                      href={`/admin/coaching/${item.studentId}/clips`}
                      onClick={() => {
                        setIsOpen(false);
                        supabase.auth.getSession().then(({ data }) => {
                          if (data.session?.access_token) {
                            fetch('/api/vod/clips/mark-read', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${data.session.access_token}`,
                              },
                              body: JSON.stringify({ studentId: item.studentId }),
                            }).catch(() => {});
                          }
                        });
                      }}
                      className="block px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors bg-orange-500/5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          🎬
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-white truncate">{item.studentName}</p>
                            <span className="text-[10px] text-gray-500 shrink-0">
                              {new Date(item.submittedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                          <p className="text-xs text-orange-300 mt-0.5 line-clamp-1">📎 {item.title}</p>
                          <p className="text-[10px] text-orange-400 mt-0.5">Clip en attente d&apos;analyse</p>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-2" />
                      </div>
                    </Link>
                  ))}

                  {/* Nouvelles réservations en attente */}
                  {(summary?.unreadBookings || []).map(item => (
                    <Link
                      key={`booking-${item.bookingId}`}
                      href="/admin/bookings"
                      onClick={() => {
                        setIsOpen(false);
                        supabase.auth.getSession().then(({ data }) => {
                          if (data.session?.access_token) {
                            fetch('/api/admin/bookings', {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${data.session.access_token}`,
                              },
                              body: JSON.stringify({ action: 'mark_read', bookingId: item.bookingId }),
                            }).catch(() => {});
                          }
                        });
                      }}
                      className="block px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors bg-purple-500/10"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          📅
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-white truncate">{item.studentName}</p>
                            <span className="text-[10px] text-gray-400 shrink-0">
                              {new Date(item.bookingDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                          <p className="text-xs text-purple-300 mt-0.5 line-clamp-1">
                            {item.planName} • {item.bookingTime} ({item.game})
                          </p>
                          <p className="text-[10px] text-cyan-400 mt-0.5 font-medium">Nouvelle réservation</p>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0 mt-2" />
                      </div>
                    </Link>
                  ))}
                </>
              )}
            </div>

            <Link
              href="/admin/coaching"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-center text-sm font-semibold text-purple-400 hover:bg-purple-500/10 transition-colors border-t border-white/10"
            >
              Voir toutes les conversations →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Cloche Élève ─────────────────────────────────────────────────────────────
function StudentNotificationsBell({ href }: { href: string }) {
  const { user } = useAuth();
  const summary = useStudentNotifications(user?.id);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
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
            className="absolute right-0 top-full mt-2 w-80 bg-gray-900/90 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <p className="font-semibold text-white">Notifications</p>
              {totalCount > 0 && (
                <span className="text-xs text-gray-400">{totalCount} non lu{totalCount > 1 ? 's' : ''}</span>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
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
                      href="/profile/coaching"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors bg-purple-500/5"
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
                      className="block px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors bg-orange-500/5"
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

                  {/* Alertes réservations déplacées ou annulées */}
                  {(summary?.bookingAlerts || []).map(alert => (
                    <Link
                      key={`alert-${alert.id}`}
                      href="/profile"
                      onClick={() => {
                        setIsOpen(false);
                        supabase.auth.getSession().then(({ data }) => {
                          if (data.session?.access_token) {
                            fetch('/api/notifications/student-summary', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${data.session.access_token}`,
                              },
                              body: JSON.stringify({ bookingId: alert.id }),
                            }).catch(() => {});
                          }
                        });
                      }}
                      className={`block px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                        alert.status === 'cancelled' ? 'bg-red-500/10' : 'bg-amber-500/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          alert.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {alert.status === 'cancelled' ? '✕' : '📅'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-white">
                              {alert.status === 'cancelled' ? 'Séance annulée' : 'Séance déplacée'}
                            </p>
                            <span className="text-[10px] text-gray-400 shrink-0">
                              {new Date(alert.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-300 mt-0.5 line-clamp-1">
                            {alert.planName} • {new Date(alert.bookingDate).toLocaleDateString('fr-FR')} à {alert.bookingTime}
                          </p>
                          {alert.adminNotes && (
                            <p className="text-[11px] text-amber-300/90 mt-1 italic line-clamp-1">
                              &laquo; {alert.adminNotes} &raquo;
                            </p>
                          )}
                        </div>
                        <span className={`w-2 h-2 rounded-full shrink-0 mt-2 ${alert.status === 'cancelled' ? 'bg-red-400' : 'bg-amber-400'}`} />
                      </div>
                    </Link>
                  ))}
                </>
              )}
            </div>

            <Link
              href={href}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-center text-sm font-semibold text-purple-400 hover:bg-purple-500/10 transition-colors border-t border-white/10"
            >
              Accéder au chat →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  // Ferme le menu mobile à chaque changement de route
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [pathname]);

  // Réinitialise la section active quand on quitte la homepage
  useEffect(() => {
    if (!isHomePage) {
      setActiveSection('');
    }
  }, [isHomePage]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for active section highlight
  // Dépend de isHomePage : se ré-attache chaque fois qu'on revient sur la homepage
  // car les éléments DOM des sections sont recréés à chaque navigation.
  useEffect(() => {
    if (!isHomePage) return;

    const sections = ['coaching', 'jeux', 'methode', 'progression', 'booking', 'tarifs', 'avis', 'apropos', 'faq'];
    const observers: IntersectionObserver[] = [];

    // Petit délai pour laisser Next.js finir le rendu des sections
    const timeout = setTimeout(() => {
      sections.forEach((sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  setActiveSection(sectionId);
                }
              });
            },
            { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
          );
          observer.observe(element);
          observers.push(observer);
        }
      });
    }, 50);

    return () => {
      clearTimeout(timeout);
      observers.forEach((obs) => obs.disconnect());
    };
  }, [isHomePage]);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isProfileMenuOpen && !(e.target as HTMLElement).closest('.profile-menu')) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  const navLinks = [
    { href: '/#coaching', label: 'Coaching', id: 'coaching' },
    { href: '/#jeux', label: 'Jeux', id: 'jeux' },
    { href: '/#methode', label: 'Méthode', id: 'methode' },
    { href: '/#progression', label: 'Progression', id: 'progression' },
    { href: '/#tarifs', label: 'Tarifs', id: 'tarifs' },
    { href: '/#booking', label: 'Réserver', id: 'booking' },
    { href: '/#avis', label: 'Avis', id: 'avis' },
    { href: '/#apropos', label: 'À propos', id: 'apropos' },
    { href: '/#faq', label: 'FAQ', id: 'faq' },
  ];

  if (isLoading) {
    return (
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 bg-transparent"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-2xl">
                🐙
              </div>
              <span className="text-xl font-bold tracking-tight">POULPY<span className="text-purple-400">.</span></span>
            </Link>
            <div className="hidden lg:flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
              <div className="w-32 h-10 rounded-lg bg-white/10 animate-pulse" />
            </div>
          </div>
        </div>
      </motion.nav>
    );
  }

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 duration-300 ${
          isScrolled ? 'nav-scrolled' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              href="/"
              onClick={() => { if (isHomePage) window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center gap-3 group shrink-0"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🐙
              </div>
              <span className="text-xl font-bold tracking-tight">
                POULPY<span className="text-purple-400">.</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 mx-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeSection === link.id
                      ? 'text-white bg-white/10 shadow-lg shadow-purple-500/20'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side - Theme toggle + Auth or User Menu */}
            <div className="hidden lg:flex items-center gap-4">
              <ThemeToggle />
              {user && (
                user.isAdmin
                  ? <AdminNotificationsBell />
                  : <StudentNotificationsBell href="/profile/coaching" />
              )}
              {user ? (
                <div className="relative profile-menu">
                  {/* Profile Button */}
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition-all group"
                    aria-label="Menu utilisateur"
                    aria-expanded={isProfileMenuOpen}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        user.initial
                      )}
                    </div>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-gray-900/90 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-white/5">
                          <p className="font-semibold text-white">{user.username}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                          {user.isAdmin && (
                            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-black">
                              ADMIN
                            </span>
                          )}
                        </div>
                        {user.needsUsername && (
                          <Link
                            href="/auth/complete"
                            className="flex items-center gap-3 px-4 py-3 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors border-b border-white/5"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <UserPlus size={18} />
                            Choisis ton pseudo →
                          </Link>
                        )}
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <User size={18} />
                          Mon profil
                        </Link>
                        {user.isAdmin && (
                          <>
                            <hr className="my-2 border-white/10" />
                            <Link
                              href="/admin"
                              className="flex items-center gap-3 px-4 py-3 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              <Shield size={18} />
                              Panneau Admin
                            </Link>
                            <Link
                              href="/admin/bookings"
                              className="flex items-center gap-3 px-4 py-3 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              <Calendar size={18} />
                              Planning & Réservations
                            </Link>
                            <Link
                              href="/admin/stats"
                              className="flex items-center gap-3 px-4 py-3 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              <BarChart2 size={18} />
                              Statistiques
                            </Link>
                            <Link
                              href="/admin/settings"
                              className="flex items-center gap-3 px-4 py-3 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 transition-colors"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              <Settings size={18} />
                              Paramètres
                            </Link>
                          </>
                        )}
                        <button
                          onClick={() => { logout(); setIsProfileMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                        >
                          <LogOut size={18} />
                          Déconnexion
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    <User size={18} />
                    Connexion
                  </Link>
                  <Link
                    href="/#booking"
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105 whitespace-nowrap"
                  >
                    Réserver une session →
                  </Link>
                </>
              )}
            </div>

            {/* Mobile: theme toggle + menu button */}
            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle />
              {user && (
                user.isAdmin
                  ? <AdminNotificationsBell />
                  : <StudentNotificationsBell href="/profile/coaching" />
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed inset-0 z-50 lg:hidden flex flex-col bg-[#13161e] mobile-drawer"
          >
            {/* Mobile Header with Logo, ThemeToggle and Close button */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-white/10 shrink-0 mobile-drawer-header">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-xl">
                  🐙
                </div>
                <span className="text-xl font-bold tracking-tight text-white">
                  POULPY<span className="text-purple-400">.</span>
                </span>
              </Link>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl glass hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                  aria-label="Fermer le menu"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Scrollable Drawer Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 pb-28 overscroll-contain space-y-6">
              {/* User Section */}
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3.5 p-3.5 glass rounded-2xl border border-white/10">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold text-base overflow-hidden shrink-0">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        user.initial
                      )}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white truncate text-sm">{user.username}</p>
                        {user.isAdmin && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-black">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>

                  {user.needsUsername && (
                    <Link
                      href="/auth/complete"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 glass rounded-xl border border-purple-500/30 text-xs font-medium text-purple-400"
                    >
                      <UserPlus size={16} />
                      <span>Choisis ton pseudo →</span>
                    </Link>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl text-xs font-bold text-white shadow-md"
                    >
                      <User size={15} />
                      <span>Mon profil</span>
                    </Link>
                    <button
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 glass rounded-xl border border-white/10 text-xs font-semibold text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut size={15} />
                      <span>Déconnexion</span>
                    </button>
                  </div>

                  {user.isAdmin && (
                    <div className="space-y-1.5 pt-3 border-t border-white/10">
                      <span className="text-[11px] font-bold tracking-wider uppercase text-gray-400 px-1 block">
                        Administration
                      </span>
                      <Link
                        href="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 py-2.5 px-3.5 glass rounded-xl text-xs font-medium text-purple-300"
                      >
                        <Shield size={16} />
                        <span>Panneau Admin</span>
                      </Link>
                      <Link
                        href="/admin/bookings"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 py-2.5 px-3.5 glass rounded-xl text-xs font-medium text-cyan-300"
                      >
                        <Calendar size={16} />
                        <span>Planning & Réservations</span>
                      </Link>
                      <Link
                        href="/admin/stats"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 py-2.5 px-3.5 glass rounded-xl text-xs font-medium text-cyan-300"
                      >
                        <BarChart2 size={16} />
                        <span>Statistiques</span>
                      </Link>
                      <Link
                        href="/admin/settings"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 py-2.5 px-3.5 glass rounded-xl text-xs font-medium text-yellow-300"
                      >
                        <Settings size={16} />
                        <span>Paramètres</span>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  <Link
                    href="/#booking"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl text-sm font-bold text-center text-white shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Réserver une session</span>
                    <span>→</span>
                  </Link>
                  <Link
                    href="/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-2.5 px-4 glass rounded-xl text-sm font-semibold text-center text-gray-300 hover:text-white border border-white/10 flex items-center justify-center gap-2"
                  >
                    <User size={16} />
                    <span>Connexion / S'inscrire</span>
                  </Link>
                </div>
              )}

              {/* Navigation Links */}
              <div className="pt-3 border-t border-white/10 space-y-1">
                <span className="text-[11px] font-bold tracking-wider uppercase text-gray-400 px-1 block mb-2">
                  Navigation
                </span>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between py-3 px-3.5 rounded-xl text-base font-semibold transition-colors ${
                      activeSection === link.id
                        ? 'bg-gradient-to-r from-purple-600/30 to-cyan-500/20 text-white border border-purple-500/40'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{link.label}</span>
                    <span className="text-xs text-gray-500">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}