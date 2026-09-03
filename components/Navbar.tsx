'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, User, LogOut, ChevronDown, Settings, Shield, BarChart2, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import ThemeToggle from './ThemeToggle';

interface NotificationItem {
  id: string;
  message: string;
  created_at: string;
  sender_id: string;
  sender_name: string;
  student_id: string;
  is_mine: boolean;
  is_unread: boolean;
}

function useUnreadNotifications(userId: string | undefined, isAdmin: boolean) {
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      return;
    }

    let cancelled = false;

    const fetchItems = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) {
          if (!cancelled) setItems([]);
          return;
        }

        const res = await fetch('/api/notifications/unread', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Erreur notifs');
        const data = await res.json();
        if (cancelled) return;
        setItems(data.items || []);
      } catch (err) {
        console.error('Erreur notifs:', err);
      }
    };

    fetchItems();
    const interval = setInterval(fetchItems, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [userId, isAdmin]);

  return items;
}

function NotificationsBell({ href }: { href: string }) {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin ?? false;
  const items = useUnreadNotifications(user?.id, isAdmin);
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

  const unreadCount = items.filter((i) => i.is_unread).length;

  // Pour l'admin : grouper par conversation (un élève = une ligne avec son dernier message non lu)
  const groupedByStudent = isAdmin
    ? (() => {
        const map = new Map<string, NotificationItem>();
        for (const item of items) {
          const existing = map.get(item.student_id);
          if (!existing || new Date(item.created_at) > new Date(existing.created_at)) {
            map.set(item.student_id, item);
          }
        }
        return Array.from(map.values());
      })()
    : items;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}
        aria-expanded={isOpen}
      >
        <Bell size={20} className="text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
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
              <p className="font-semibold text-white">
                {isAdmin ? 'Conversations non lues' : 'Derniers messages'}
              </p>
              {unreadCount > 0 && (
                <span className="text-xs text-gray-400">{unreadCount} non lu{unreadCount > 1 ? 's' : ''}</span>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {groupedByStudent.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  <Bell size={28} className="mx-auto mb-2 opacity-40" />
                  Aucun message pour le moment
                </div>
              ) : (
                groupedByStudent.map((item) => (
                  <Link
                    key={item.student_id}
                    href={isAdmin ? `/admin/coaching/${item.student_id}` : href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                      item.is_unread ? 'bg-purple-500/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {item.sender_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-white truncate">{item.sender_name}</p>
                          <span className="text-[10px] text-gray-500 shrink-0">
                            {new Date(item.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 line-clamp-2 ${item.is_unread ? 'text-white' : 'text-gray-400'}`}>
                          {item.message}
                        </p>
                      </div>
                      {item.is_unread && (
                        <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0 mt-2" aria-label="Non lu" />
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>

            {!isAdmin && (
              <Link
                href={href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-center text-sm font-semibold text-purple-400 hover:bg-purple-500/10 transition-colors border-t border-white/10"
              >
                Accéder au chat →
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin/coaching"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-center text-sm font-semibold text-purple-400 hover:bg-purple-500/10 transition-colors border-t border-white/10"
              >
                Voir toutes les conversations →
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('coaching');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for active section highlight
  useEffect(() => {
    const sections = ['coaching', 'jeux', 'methode', 'progression', 'booking', 'tarifs', 'avis', 'apropos', 'faq'];
    const observers: IntersectionObserver[] = [];

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

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

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
            <Link href="/" className="flex items-center gap-3 group shrink-0">
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
              {user && <NotificationsBell href={user.isAdmin ? '/admin/coaching' : '/profile/coaching'} />}
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
              {user && <NotificationsBell href={user.isAdmin ? '/admin/coaching' : '/profile/coaching'} />}
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
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl">
              <div className="flex flex-col items-center justify-center h-full gap-6 px-8">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`text-2xl font-semibold hover:text-white transition-colors ${
                        activeSection === link.id ? 'text-gradient' : 'text-gray-300'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navLinks.length * 0.05 }}
                  className="flex flex-col gap-4 mt-8 w-full max-w-xs"
                >
                  {user ? (
                    <>
                      <div className="flex items-center gap-4 px-6 py-3 glass rounded-lg border border-white/10">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            user.initial
                          )}
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-white">{user.username}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                          {user.isAdmin && (
                            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-black">
                              ADMIN
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg text-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                      >
                        <User size={20} />
                        Mon profil
                      </Link>
                      {user.isAdmin && (
                        <>
                          <Link
                            href="/admin"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-center gap-2 px-6 py-3 glass rounded-lg border border-purple-500/30 text-lg font-medium text-purple-400 hover:bg-purple-500/10 transition-all"
                          >
                            <Shield size={20} />
                            Panneau Admin
                          </Link>
                          <Link
                            href="/admin/stats"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-center gap-2 px-6 py-3 glass rounded-lg border border-cyan-500/30 text-lg font-medium text-cyan-400 hover:bg-cyan-500/10 transition-all"
                          >
                            <BarChart2 size={20} />
                            Statistiques
                          </Link>
                          <Link
                            href="/admin/settings"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-center gap-2 px-6 py-3 glass rounded-lg border border-yellow-500/30 text-lg font-medium text-yellow-400 hover:bg-yellow-500/10 transition-all"
                          >
                            <Settings size={20} />
                            Paramètres
                          </Link>
                        </>
                      )}
                      <button
                        onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                        className="flex items-center justify-center gap-2 px-6 py-3 glass rounded-lg border border-white/10 text-lg font-medium text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <LogOut size={20} />
                        Déconnexion
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 px-6 py-3 glass rounded-lg border border-white/10 text-lg font-medium text-gray-300 hover:bg-white/5 transition-all"
                      >
                        <User size={20} />
                        Connexion / S'inscrire
                      </Link>
                      <Link
                        href="/#booking"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg text-lg font-semibold text-center hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                      >
                        Réserver une session →
                      </Link>
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}