"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import {
  Menu,
  X,
  User,
  Shield,
  LogOut,
  Calendar,
  MessageSquare,
  Film,
  Zap,
  ArrowRight,
  ChevronDown,
  Bell,
  LayoutDashboard,
  ExternalLink,
  CheckCircle2
} from "lucide-react";
import DecryptedText from "./DecryptedText";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import AuthModal from "./AuthModal";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";

export default function CyberNavbar({
  onOpenBooking,
}: {
  onOpenBooking?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";

  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(!isHomePage);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollToPlugin);
    }

    const handleScroll = () => {
      // Solid/blur background active as soon as scrolling starts (> 30px), or always solid on subpages
      const isScrolled = isHomePage ? window.scrollY > 30 : true;
      setScrolled(isScrolled);

      if (!isHomePage || window.scrollY < 120) {
        setActiveSection("");
        return;
      }

      const sections = [
        { id: "coaching", linkId: "coaching" },
        { id: "apropos", linkId: "apropos" },
        { id: "games", linkId: "games" },
        { id: "methodology", linkId: "methodology" },
        { id: "booking", linkId: "booking" },
        { id: "avis", linkId: "avis" },
        { id: "media", linkId: "media" },
        { id: "faq", linkId: "faq" },
      ];

      const detectionLine = 160;
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

      setActiveSection(detected);
    };

    let ticking = false;
    const onScrollThrottled = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", onScrollThrottled, { passive: true });
    window.addEventListener("resize", onScrollThrottled, { passive: true });

    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", onScrollThrottled);
      window.removeEventListener("resize", onScrollThrottled);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isHomePage]);

  // Smooth scroll to target hash on homepage arrival
  useEffect(() => {
    if (!isHomePage) return;
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.replace("#", "");
      const target = document.getElementById(hash);
      if (target) {
        const timer = setTimeout(() => {
          const navOffset = 70;
          const targetTop = target.getBoundingClientRect().top + window.scrollY - navOffset;
          gsap.to(window, {
            scrollTo: { y: targetTop, autoKill: false },
            duration: 1.2,
            ease: "power3.inOut",
          });
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, [isHomePage, pathname]);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setMobileOpen(false);

    if (!isHomePage) {
      if (href === "#hero" || href === "#" || href === "/") {
        router.push("/");
      } else {
        router.push(`/${href}`);
      }
      return;
    }

    if (href === "#hero" || href === "#") {
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
      const duration = Math.min(1.8, Math.max(0.9, distance / 3200));

      gsap.to(window, {
        scrollTo: { y: targetTop, autoKill: false },
        duration,
        ease: "power3.inOut",
        overwrite: "auto",
      });
    }
  };

  const navLinks = [
    { label: "POURQUOI POULPY", href: "#coaching", id: "coaching" },
    { label: "À PROPOS", href: "#apropos", id: "apropos" },
    { label: "PÔLES D'EXCELLENCE", href: "#games", id: "games" },
    { label: "MÉTHODE", href: "#methodology", id: "methodology" },
    { label: "RÉSERVER", href: "#booking", id: "booking" },
    { label: "AVIS", href: "#avis", id: "avis" },
    { label: "VOD", href: "#media", id: "media" },
    { label: "FAQ", href: "#faq", id: "faq" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "py-3 bg-black/95 backdrop-blur-md border-b border-transparent shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
            : "py-6 bg-transparent border-b border-transparent shadow-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 xl:gap-4 flex-nowrap">
          {/* Typographic Brand Logo */}
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, "#hero")}
            className="flex items-center gap-3 group flex-shrink-0"
          >
            <div className="flex items-center gap-2 font-mono">
              <span className="text-xl font-display text-[#F5F4F0] group-hover:text-[#CA1C30] transition-colors duration-150 tracking-widest font-bold">
                POULPY
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links — strictly on a single line */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 2xl:gap-2 font-mono text-[9.5px] xl:text-[10.5px] 2xl:text-[11px] relative flex-shrink-0 whitespace-nowrap">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;

              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative px-1.5 xl:px-2 py-1 transition-colors tracking-wider uppercase font-semibold whitespace-nowrap ${
                    isActive
                      ? "text-[#CA1C30]"
                      : "text-white/70 hover:text-[#CA1C30]"
                  }`}
                >
                  <span className="relative z-10 whitespace-nowrap">{link.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Action Row: Notifications + ThemeToggle + Connexion + Réserver CTA */}
          <div className="hidden sm:flex items-center gap-2 xl:gap-2.5 flex-shrink-0">
            {/* Theme Toggle (Light / Dark) */}
            <ThemeToggle className="text-white/70 hover:text-white" />

            {/* Unified Realtime Notification Bell */}
            <NotificationBell theme="cyber" />

            {/* User Profile / Connexion Dropdown */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 text-xs font-mono tracking-wider text-[#F5F4F0] hover:text-[#CA1C30] transition-colors py-1 px-1 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#CA1C30]/15 border border-[#CA1C30]/50 text-[#CA1C30] text-xs font-bold flex items-center justify-center overflow-hidden shadow-[0_0_10px_rgba(202,28,48,0.2)]">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      user.initial || user.username[0]?.toUpperCase() || "P"
                    )}
                  </div>
                  <span className="font-semibold text-[#F5F4F0] group-hover:text-[#CA1C30] transition-colors truncate max-w-[110px]">
                    {user.username}
                  </span>
                  {user.isAdmin && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#CA1C30] text-white">ADMIN</span>
                  )}
                  <ChevronDown className="w-3 h-3 text-[#F5F4F0]/50 group-hover:text-white transition-colors" />
                </button>

                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-60 bg-[#121117] border border-[#CA1C30]/40 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] p-2 space-y-1 font-mono text-xs z-50 overflow-hidden">
                    <div className="p-2.5 border-b border-white/10 mb-1 bg-[#1A1822] rounded-xl">
                      <div className="text-[10px] text-[#F5F4F0]/40 uppercase">CONNECTÉ EN TANT QUE</div>
                      <div className="text-[#F5F4F0] font-bold truncate">{user.username}</div>
                      <div className="text-[10px] text-[#F5F4F0]/50 truncate">{user.email}</div>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full p-2 rounded-lg hover:bg-white/5 text-[#F5F4F0]/90 hover:text-[#CA1C30] flex items-center gap-2.5 transition-colors font-medium"
                    >
                      <User className="w-3.5 h-3.5 text-[#CA1C30]" />
                      <span>MON PROFIL</span>
                    </Link>
                    <Link
                      href="/profile/coaching"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full p-2 rounded-lg hover:bg-white/5 text-[#F5F4F0]/80 hover:text-white flex items-center gap-2.5 transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#00B4A0]" />
                      <span>ESPACE ÉLÈVE</span>
                    </Link>
                    <Link
                      href="/profile/sheet"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full p-2 rounded-lg hover:bg-white/5 text-[#F5F4F0]/80 hover:text-white flex items-center gap-2.5 transition-colors"
                    >
                      <Film className="w-3.5 h-3.5 text-[#00B4A0]" />
                      <span>FICHES & SUIVI</span>
                    </Link>
                    {user.isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full p-2 rounded-lg hover:bg-[#CA1C30]/10 text-[#CA1C30] flex items-center gap-2.5 transition-colors font-bold"
                      >
                        <Shield className="w-3.5 h-3.5 text-[#CA1C30]" />
                        <span>PANNEAU ADMIN</span>
                      </Link>
                    )}
                    <button
                      onClick={async () => {
                        setUserMenuOpen(false);
                        await logout();
                      }}
                      className="w-full p-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 flex items-center gap-2.5 transition-colors border-t border-white/10 mt-1 cursor-pointer"
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
                className="btn-cyber-ghost text-xs py-2 px-4 uppercase tracking-wider cursor-pointer"
              >
                <span>CONNEXION</span>
              </button>
            )}

            {/* Réserver Direct Action Button */}
            <button
              onClick={() => {
                if (onOpenBooking) {
                  onOpenBooking();
                } else if (!isHomePage) {
                  router.push("/#booking");
                } else {
                  const el = document.getElementById("booking");
                  if (el) {
                    const navOffset = 70;
                    const targetTop = el.getBoundingClientRect().top + window.scrollY - navOffset;
                    gsap.to(window, {
                      scrollTo: { y: targetTop, autoKill: false },
                      duration: 1.2,
                      ease: "power3.inOut",
                    });
                  }
                }
              }}
              className="btn-cyber-primary rounded-full py-2 px-4 xl:px-5 text-[10.5px] xl:text-[11px] font-bold uppercase tracking-wider flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(202,28,48,0.3)] whitespace-nowrap shrink-0"
            >
              <span>RÉSERVER</span>
            </button>
          </div>

          {/* Mobile Actions: NotificationBell + ThemeToggle + Hamburger Button */}
          <div className="flex sm:hidden items-center gap-1.5">
            <NotificationBell theme="cyber" />
            <ThemeToggle className="p-2 text-white/80 hover:text-white border border-white/20" />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-white/80 hover:text-white border border-white/20"
              aria-label="Menu Mobile"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="sm:hidden bg-[#121117]/95 border-b border-white/10 backdrop-blur-lg px-6 py-6 space-y-4 font-mono text-xs overflow-hidden"
            >
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="block py-2 text-[#F5F4F0]/80 hover:text-[#CA1C30] transition-colors uppercase tracking-wider font-semibold border-b border-white/5"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="pt-2 flex flex-col gap-3">
                {user ? (
                  <div className="space-y-2">
                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="btn-cyber-ghost w-full py-2.5 text-center block"
                    >
                      MON PROFIL ({user.username})
                    </Link>
                    {user.isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="btn-cyber-primary w-full py-2.5 text-center block"
                      >
                        PANNEAU ADMIN
                      </Link>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      setAuthOpen(true);
                    }}
                    className="btn-cyber-ghost w-full py-2.5 text-center cursor-pointer uppercase"
                  >
                    SE CONNECTER
                  </button>
                )}

                <button
                  onClick={() => {
                    setMobileOpen(false);
                    if (onOpenBooking) {
                      onOpenBooking();
                    } else if (!isHomePage) {
                      router.push("/#booking");
                    } else {
                      const el = document.getElementById("booking");
                      if (el) {
                        const navOffset = 70;
                        const targetTop = el.getBoundingClientRect().top + window.scrollY - navOffset;
                        gsap.to(window, {
                          scrollTo: { y: targetTop, autoKill: false },
                          duration: 1.2,
                          ease: "power3.inOut",
                        });
                      }
                    }
                  }}
                  className="btn-cyber-primary w-full py-3 text-center uppercase cursor-pointer font-bold tracking-wider"
                >
                  RÉSERVER UN CRÉNEAU
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
