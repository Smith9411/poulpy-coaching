"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import DecryptedText from "./DecryptedText";
import { Menu, X, ArrowUpRight, User, Bell, Check, Film, Calendar, Zap, Shield, LogOut, ChevronDown, LayoutDashboard } from "lucide-react";
import AuthModal from "./AuthModal";
import { useAuth } from "@/context/AuthContext";

interface CyberNavbarProps {
  onOpenBooking?: () => void;
}

export default function CyberNavbar({ onOpenBooking }: CyberNavbarProps) {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeSection, setActiveSection] = useState<string>("");
  const notifsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollToPlugin);
    }

    const handleScroll = () => {
      // 100% transparent on Hero
      if (window.scrollY < 200) {
        setScrolled(false);
        setActiveSection("");
        return;
      }

      const coachingEl = document.getElementById("coaching");
      if (coachingEl) {
        const rect = coachingEl.getBoundingClientRect();
        setScrolled(rect.top <= 80);
      } else {
        setScrolled(window.scrollY > 400);
      }

      // Check if user is near the very bottom of the document
      const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 80;

      if (isAtBottom) {
        setActiveSection("faq");
        return;
      }

      // Robust BoundingClientRect Scrollspy
      const sections = [
        { id: "coaching", linkId: "coaching" },
        { id: "games", linkId: "games" },
        { id: "methodology", linkId: "methodology" },
        { id: "booking", linkId: "booking" },
        { id: "avis", linkId: "avis" },
        { id: "apropos", linkId: "apropos" },
        { id: "media", linkId: "apropos" },
        { id: "faq", linkId: "faq" },
      ];

      const detectionLine = 140; // 140px below the top of viewport
      let detected = "";

      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= detectionLine && rect.bottom > detectionLine) {
            detected = s.linkId;
            break;
          }
        }
      }

      if (detected) {
        setActiveSection(detected);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    const handleClickOutside = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) {
        setNotifsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setMobileOpen(false);

    if (href === "#hero" || href === "#") {
      setActiveSection("");
      gsap.to(window, {
        scrollTo: { y: 0, autoKill: false },
        duration: 1.2,
        ease: "power3.inOut",
      });
      return;
    }

    const targetId = href.replace("#", "");
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      const navOffset = 70;
      const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - navOffset;
      const distance = Math.abs(targetTop - window.scrollY);
      // Durée cinématique proportionnelle à la distance (0.9s → 1.8s)
      const duration = Math.min(1.8, Math.max(0.9, distance / 3200));

      gsap.to(window, {
        scrollTo: { y: targetTop, autoKill: false },
        duration,
        ease: "power3.inOut",
        overwrite: "auto",
      });
    } else {
      window.location.href = `/${href}`;
    }
  };

  const navLinks = [
    { label: "POURQUOI POULPY", href: "#coaching", id: "coaching" },
    { label: "JEUX", href: "#games", id: "games" },
    { label: "MÉTHODE", href: "#methodology", id: "methodology" },
    { label: "RÉSERVER", href: "#booking", id: "booking" },
    { label: "AVIS", href: "#avis", id: "avis" },
    { label: "À PROPOS", href: "#apropos", id: "apropos" },
    { label: "FAQ", href: "#faq", id: "faq" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "py-3 bg-black/95 backdrop-blur-md border-b border-[rgba(255,117,130,0.2)] shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
            : "py-6 bg-transparent border-b border-transparent shadow-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-4">
          {/* Typographic Brand Logo */}
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, "#hero")}
            className="flex items-center gap-3 group flex-shrink-0"
          >
            <div className="flex items-center gap-2 font-mono">
              <span className="w-2.5 h-2.5 bg-[#FF7582] shadow-[0_0_10px_#FF7582] inline-block animate-pulse" />
              <span className="text-xl font-display text-white group-hover:text-[#FF7582] transition-colors duration-150 tracking-widest font-bold">
                POULPY<span className="text-[#FF7582]">.</span>
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links — Direct, Clean & Smooth with Sliding Active Square */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 font-mono text-[11px] relative">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;

              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative px-2.5 py-1.5 transition-colors flex items-center gap-1.5 tracking-wider uppercase font-semibold ${
                    isActive
                      ? "text-[#FF7582]"
                      : "text-white/70 hover:text-[#FF7582] hover:bg-white/5"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="cyber-nav-active-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      className="absolute inset-0 border border-[#FF7582]/60 bg-[#FF7582]/10 shadow-[0_0_12px_rgba(255,117,130,0.25)] pointer-events-none"
                    />
                  )}
                  {isActive && <span className="w-1.5 h-1.5 bg-[#FF7582] animate-pulse relative z-10" />}
                  <span className="relative z-10">{link.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Action Row: Notifications + Connexion + Réserver CTA */}
          <div className="hidden sm:flex items-center gap-3 pr-10 lg:pr-12">
            {/* Notification Bell with Dropdown */}
            <div className="relative" ref={notifsRef}>
              <button
                onClick={() => setNotifsOpen(!notifsOpen)}
                className="relative p-2 text-white/70 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                title="Notifications Système"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF7582] rounded-full animate-ping" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF7582] rounded-full" />
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {notifsOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-[#090c10] border border-[#FF7582]/40 shadow-[0_10px_40px_rgba(0,0,0,0.9)] p-4 space-y-3 font-mono text-xs z-50">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="text-[10px] text-[#FF7582] font-bold tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#FF7582] animate-pulse" />
                      NOTIFICATIONS // {unreadCount} NOUVELLES
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => setUnreadCount(0)}
                        className="text-[10px] text-white/50 hover:text-white underline cursor-pointer"
                      >
                        TOUT VU
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    <div className="p-2.5 bg-black/60 border border-white/5 space-y-1 hover:border-[#8FAFD4]/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#8FAFD4] font-bold flex items-center gap-1">
                          <Film className="w-3 h-3" /> ANALYSE VOD PRÊTE
                        </span>
                        <span className="text-[9px] text-white/40">IL Y A 2H</span>
                      </div>
                      <p className="text-[11px] text-white/80 leading-snug">
                        Poulpy a annoté votre dernière VOD sur Ascent (3 axes d'amélioration prioritaires).
                      </p>
                    </div>

                    <div className="p-2.5 bg-black/60 border border-white/5 space-y-1 hover:border-[#A4DE87]/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#A4DE87] font-bold flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> SÉANCE CONFIRMÉE
                        </span>
                        <span className="text-[9px] text-white/40">HIER</span>
                      </div>
                      <p className="text-[11px] text-white/80 leading-snug">
                        Votre créneau de Coaching PRO du 15 Septembre à 18h00 est validé.
                      </p>
                    </div>

                    <div className="p-2.5 bg-black/60 border border-white/5 space-y-1 hover:border-[#FF7582]/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#FF7582] font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3" /> ROUTINE AIMLABS
                        </span>
                        <span className="text-[9px] text-white/40">IL Y A 2J</span>
                      </div>
                      <p className="text-[11px] text-white/80 leading-snug">
                        Nouvelle routine micro-flicks 20 min ajoutée à votre dossier d'entraînement.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Connexion Dropdown */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 text-xs font-mono tracking-wider text-white hover:text-[#FF7582] transition-colors py-1 px-1 cursor-pointer group"
                >
                  <div className="w-8 h-8 bg-[#FF7582]/15 border border-[#FF7582]/50 text-[#FF7582] text-xs font-bold flex items-center justify-center overflow-hidden shadow-[0_0_10px_rgba(255,117,130,0.2)]">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      user.initial || user.username[0]?.toUpperCase() || "P"
                    )}
                  </div>
                  <span className="font-semibold text-white group-hover:text-[#FF7582] transition-colors truncate max-w-[110px]">
                    {user.username}
                  </span>
                  {user.isAdmin && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#FF7582] text-black">ADMIN</span>
                  )}
                  <ChevronDown className="w-3 h-3 text-white/50 group-hover:text-white transition-colors" />
                </button>

                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-60 bg-[#090c10] border border-[#FF7582]/40 shadow-[0_10px_40px_rgba(0,0,0,0.9)] p-2 space-y-1 font-mono text-xs z-50">
                    <div className="p-2.5 border-b border-white/10 mb-1 bg-black/40">
                      <div className="text-[10px] text-white/40 uppercase">CONNECTÉ EN TANT QUE</div>
                      <div className="text-white font-bold truncate">{user.username}</div>
                      <div className="text-[10px] text-white/50 truncate">{user.email}</div>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full p-2 hover:bg-white/5 text-white/90 hover:text-[#FF7582] flex items-center gap-2.5 transition-colors font-medium"
                    >
                      <User className="w-3.5 h-3.5 text-[#FF7582]" />
                      <span>MON PROFIL</span>
                    </Link>
                    <Link
                      href="/coaching"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full p-2 hover:bg-white/5 text-white/80 hover:text-white flex items-center gap-2.5 transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#8FAFD4]" />
                      <span>ESPACE ÉLÈVE</span>
                    </Link>
                    <Link
                      href="/coaching/sheet"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full p-2 hover:bg-white/5 text-white/80 hover:text-white flex items-center gap-2.5 transition-colors"
                    >
                      <Film className="w-3.5 h-3.5 text-[#A4DE87]" />
                      <span>FICHES & SUIVI</span>
                    </Link>
                    {user.isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full p-2 hover:bg-[#FF7582]/10 text-[#FF7582] flex items-center gap-2.5 transition-colors font-bold"
                      >
                        <Shield className="w-3.5 h-3.5 text-[#FF7582]" />
                        <span>PANNEAU ADMIN</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full p-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 flex items-center gap-2.5 transition-colors text-left border-t border-white/10 mt-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>DÉCONNEXION</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="flex items-center gap-1.5 text-xs font-mono tracking-wider text-white/70 hover:text-white transition-colors py-2 px-2 cursor-pointer group"
                title="Accès Espace Membre"
              >
                <User className="w-3.5 h-3.5 text-[#8FAFD4] group-hover:scale-110 transition-transform" />
                <span className="font-medium tracking-widest">CONNEXION</span>
              </button>
            )}

            {/* Prominent CTA Button */}
            <button
              onClick={() => {
                if (onOpenBooking) {
                  onOpenBooking();
                } else {
                  window.location.href = "/#booking";
                }
              }}
              className="btn-cyber-primary text-xs py-2 px-4 font-bold"
            >
              <span>RÉSERVER</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Actions & Hamburger */}
          <div className="flex lg:hidden items-center gap-1.5 pr-10">
            <button
              onClick={() => setNotifsOpen(!notifsOpen)}
              className="p-2 text-white/80 hover:text-white relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#FF7582] rounded-full" />
              )}
            </button>
            {user ? (
              <Link
                href="/coaching"
                className="p-2 text-white/80 hover:text-white"
                title="Espace Membre"
              >
                <div className="w-5 h-5 bg-[#FF7582]/20 border border-[#FF7582]/40 text-[#FF7582] text-[10px] font-bold flex items-center justify-center">
                  {user.initial || user.username[0]?.toUpperCase() || "P"}
                </div>
              </Link>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="p-2 text-white/80 hover:text-white"
                title="Connexion"
              >
                <User className="w-4 h-4 text-[#8FAFD4]" />
              </button>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 border border-white/20 text-white"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-[#060606] border-b border-white/15 px-6 py-6 font-mono text-sm space-y-3">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`block py-1.5 uppercase tracking-wider text-xs transition-colors flex items-center gap-2 ${
                    isActive ? "text-[#FF7582] font-bold" : "text-white/80 hover:text-[#FF7582]"
                  }`}
                >
                  {isActive && <span className="w-1.5 h-1.5 bg-[#FF7582]" />}
                  <span>{link.label}</span>
                </a>
              );
            })}

            <div className="pt-4 border-t border-white/10 space-y-2">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setAuthOpen(true);
                }}
                className="w-full py-2.5 text-xs text-white/80 hover:text-white uppercase font-bold tracking-wider flex items-center justify-center gap-2"
              >
                <User className="w-3.5 h-3.5 text-[#8FAFD4]" />
                <span>ESPACE MEMBRE // CONNEXION</span>
              </button>

              <button
                onClick={() => {
                  setMobileOpen(false);
                  if (onOpenBooking) {
                    onOpenBooking();
                  } else {
                    window.location.href = "/#booking";
                  }
                }}
                className="btn-cyber-primary w-full justify-center text-xs py-3"
              >
                <span>RÉSERVER UN CRÉNEAU</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Interactive Auth Modal */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
