'use client';

import Link from 'next/link';
import { LogOut, User, Shield, BarChart2, Settings, UserPlus, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

interface NavLink {
  href: string;
  label: string;
  id: string;
}

interface NavbarMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: NavLink[];
  activeSection: string;
}

export default function NavbarMobileMenu({
  isOpen,
  onClose,
  navLinks,
  activeSection,
}: NavbarMobileMenuProps) {
  const { user, logout } = useAuth();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="lg:hidden border-t border-white/10 bg-gray-950/95 backdrop-blur-xl overflow-hidden"
        >
          <div className="px-4 py-6 space-y-4 max-h-[85vh] overflow-y-auto">
            {/* Profil connecté mobile */}
            {user && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      user.initial
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{user.username}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    {user.isAdmin && (
                      <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-bold bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-black">
                        ADMIN
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs">
                  <Link
                    href="/profile"
                    onClick={onClose}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 font-medium flex items-center justify-center gap-1.5"
                  >
                    <User size={13} /> Mon profil
                  </Link>
                  <Link
                    href="/profile/coaching"
                    onClick={onClose}
                    className="p-2 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 font-medium flex items-center justify-center gap-1.5"
                  >
                    💬 Mon chat
                  </Link>
                </div>
              </div>
            )}

            {/* Navigation links */}
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`block px-4 py-2.5 rounded-xl text-base font-medium transition-all ${
                    activeSection === link.id
                      ? 'text-white bg-purple-600/20 border border-purple-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Admin menu mobile */}
            {user?.isAdmin && (
              <div className="pt-3 border-t border-white/10 space-y-1">
                <p className="px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Administration
                </p>
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                >
                  <Shield size={16} /> Panneau Admin
                </Link>
                <Link
                  href="/admin/coaching"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                >
                  <User size={16} /> Gestion Coaching
                </Link>
                <Link
                  href="/admin/stats"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                >
                  <BarChart2 size={16} /> Statistiques
                </Link>
                <Link
                  href="/admin/settings"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                >
                  <Settings size={16} /> Paramètres
                </Link>
              </div>
            )}

            {/* Actions bas de menu */}
            <div className="pt-4 border-t border-white/10">
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 font-semibold hover:bg-red-500/20 transition-all text-sm"
                >
                  <LogOut size={16} />
                  Déconnexion
                </button>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/auth"
                    onClick={onClose}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all text-sm"
                  >
                    Connexion / Inscription
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
