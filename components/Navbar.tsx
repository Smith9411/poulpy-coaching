'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from './ThemeToggle';
import AdminNotificationsBell from './navbar/AdminNotificationsBell';
import StudentNotificationsBell from './navbar/StudentNotificationsBell';
import NavbarUserMenu from './navbar/NavbarUserMenu';
import NavbarMobileMenu from './navbar/NavbarMobileMenu';

export default function Navbar() {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('accueil');

  const navLinks = [
    { href: '/', label: 'Accueil', id: 'accueil' },
    { href: '/#apropos', label: 'À propos', id: 'apropos' },
    { href: '/#methode', label: 'Méthode', id: 'methode' },
    { href: '/#tarifs', label: 'Tarifs', id: 'tarifs' },
    { href: '/#booking', label: 'Réserver', id: 'booking' },
    { href: '/#faq', label: 'FAQ', id: 'faq' },
    { href: '/avis', label: 'Avis', id: 'avis' },
    { href: '/contact', label: 'Contact', id: 'contact' },
  ];

  // Gestion du scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = ['accueil', 'apropos', 'methode', 'tarifs', 'booking', 'faq'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-gray-950/85 backdrop-blur-md border-b border-white/10 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shadow-md shadow-purple-500/20">
              🐙
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              POULPY<span className="text-purple-400">.</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 mx-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeSection === link.id
                    ? 'text-white bg-white/10 shadow-sm shadow-purple-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />

            {/* Notification Bell (Role-Based) */}
            {user && (
              user.isAdmin ? (
                <AdminNotificationsBell />
              ) : (
                <StudentNotificationsBell href="/profile/coaching" />
              )
            )}

            {/* User Menu or Auth Button */}
            {user ? (
              <NavbarUserMenu />
            ) : (
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl text-sm font-semibold text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:scale-[1.02]"
              >
                Connexion
                <ArrowRight size={15} />
              </Link>
            )}
          </div>

          {/* Mobile Right Side */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />

            {user && (
              user.isAdmin ? (
                <AdminNotificationsBell />
              ) : (
                <StudentNotificationsBell href="/profile/coaching" />
              )
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-colors border border-white/5"
              aria-label="Menu principal"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <NavbarMobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navLinks={navLinks}
        activeSection={activeSection}
      />
    </nav>
  );
}