'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { User, LogOut, ChevronDown, Settings, Shield, BarChart2, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function NavbarUserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!user) return null;

  return (
    <div ref={menuRef} className="relative profile-menu">
      {/* Bouton profil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all group"
        aria-label="Menu utilisateur"
        aria-expanded={isOpen}
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm group-hover:scale-105 transition-transform overflow-hidden shadow-sm">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
          ) : (
            user.initial
          )}
        </div>
        <span className="text-sm font-medium text-gray-200 hidden xl:inline max-w-[100px] truncate">
          {user.username}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Menu déroulant */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute right-0 top-full mt-2 w-60 bg-gray-900/95 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden py-2 z-50"
          >
            {/* Header info utilisateur */}
            <div className="px-4 py-3 border-b border-white/5">
              <p className="font-semibold text-white truncate">{user.username}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
              {user.isAdmin && (
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-black">
                  ADMINISTRATEUR
                </span>
              )}
            </div>

            {user.needsUsername && (
              <Link
                href="/auth/complete"
                className="flex items-center gap-3 px-4 py-2.5 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors border-b border-white/5 font-medium"
                onClick={() => setIsOpen(false)}
              >
                <UserPlus size={16} />
                Choisis ton pseudo →
              </Link>
            )}

            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User size={16} className="text-purple-400" />
              Mon profil
            </Link>

            {user.isAdmin && (
              <>
                <hr className="my-1.5 border-white/5" />
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Shield size={16} />
                  Panneau Admin
                </Link>
                <Link
                  href="/admin/coaching"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={16} />
                  Gestion Coaching
                </Link>
                <Link
                  href="/admin/stats"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <BarChart2 size={16} />
                  Statistiques
                </Link>
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings size={16} />
                  Paramètres
                </Link>
              </>
            )}

            <hr className="my-1.5 border-white/5" />

            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
