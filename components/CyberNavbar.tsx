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

interface RealNotificationItem {
  id: string;
  type: "message" | "annotation" | "booking" | "clip";
  title: string;
  description: string;
  timeAgo: string;
  href: string;
}

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
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  
  // Real notifications state
  const [realNotifs, setRealNotifs] = useState<RealNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loadingNotifs, setLoadingNotifs] = useState<boolean>(false);

  const notifsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch real notifications from Supabase
  const fetchRealNotifications = async () => {
    if (!user) {
      setRealNotifs([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoadingNotifs(true);
      let { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      if (session.expires_at && new Date(session.expires_at * 1000) <= new Date()) {
        const { data: r } = await supabase.auth.refreshSession();
        session = r.session ?? session;
        if (!session?.access_token) return;
      }

      const endpoint = user.isAdmin
        ? "/api/notifications/admin-summary"
        : "/api/notifications/student-summary";

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) return;
      const data = await res.json();

      const items: RealNotificationItem[] = [];

      if (user.isAdmin) {
        // Admin notifications
        if (data.unreadMessages && Array.isArray(data.unreadMessages)) {
          data.unreadMessages.forEach((m: { studentId: string; studentName: string; count: number; lastMessage: string }) => {
            items.push({
              id: `msg-${m.studentId}`,
              type: "message",
              title: `MESSAGE DE ${m.studentName.toUpperCase()}`,
              description: m.lastMessage || `${m.count} nouveau(x) message(s)`,
              timeAgo: "RÉCENT",
              href: `/admin/coaching/${m.studentId}`,
            });
          });
        }
        if (data.pendingClips && Array.isArray(data.pendingClips)) {
          data.pendingClips.forEach((c: { id: string; studentName: string; title: string }) => {
            items.push({
              id: `clip-${c.id}`,
              type: "clip",
              title: "NOUVEAU CLIP VOD À REVOIR",
              description: `${c.studentName} : ${c.title}`,
              timeAgo: "EN ATTENTE",
              href: "/admin/coaching",
            });
          });
        }
        setUnreadCount(data.totalCount || items.length);
      } else {
        // Student notifications
        if (data.unreadMsgCount && data.unreadMsgCount > 0) {
          items.push({
            id: "student-msgs",
            type: "message",
            title: "NOUVEAU MESSAGE DU COACH",
            description: data.lastMsg?.message || `Vous avez ${data.unreadMsgCount} nouveau(x) message(s) de Poulpy.`,
            timeAgo: "RÉCENT",
            href: "/profile/coaching",
          });
        }
        if (data.newAnnotationsCount && data.newAnnotationsCount > 0) {
          items.push({
            id: "student-annot",
            type: "annotation",
            title: "ANNOTATION SUR VOTRE VOD",
            description: data.lastAnnotation?.content || "Poulpy a annoté un de vos clips.",
            timeAgo: "RÉCENT",
            href: "/profile/vod",
          });
        }
        if (data.bookingAlerts && Array.isArray(data.bookingAlerts)) {
          data.bookingAlerts.forEach((b: { id: string; status: string; planName: string; bookingDate: string; bookingTime: string }) => {
            items.push({
              id: `booking-${b.id}`,
              type: "booking",
              title: b.status === "cancelled" ? "SÉANCE ANNULÉE" : "SÉANCE REPLANIFIÉE",
              description: `${b.planName} du ${b.bookingDate} à ${b.bookingTime}`,
              timeAgo: "IMPORTANT",
              href: "/profile",
            });
          });
        }
        setUnreadCount(data.totalUnread || items.length);
      }

      setRealNotifs(items);
    } catch {
      // silently fail
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchRealNotifications();
    const interval = setInterval(fetchRealNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

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
        { id: "games", linkId: "games" },
        { id: "methodology", linkId: "methodology" },
        { id: "booking", linkId: "booking" },
        { id: "avis", linkId: "avis" },
        { id: "apropos", linkId: "apropos" },
        { id: "media", linkId: "apropos" },
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
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) {
        setNotifsOpen(false);
      }
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
    { label: "JEUX & RANKS", href: "#games", id: "games" },
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

          {/* Desktop Navigation Links */}
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

          {/* Action Row: Notifications + ThemeToggle + Connexion + Réserver CTA */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Theme Toggle (Light / Dark) */}
            <ThemeToggle className="text-white/70 hover:text-white" />

            {/* Notification Bell with Dropdown (REAL NOTIFICATIONS ONLY) */}
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
                      NOTIFICATIONS // {unreadCount} {unreadCount > 1 ? "NOUVELLES" : "NOUVELLE"}
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
                    {!user ? (
                      <div className="py-6 text-center text-white/40 space-y-2">
                        <Bell className="w-6 h-6 text-white/20 mx-auto" />
                        <div className="text-xs font-bold text-white/70">NON CONNECTÉ</div>
                        <p className="text-[10px] text-white/40">Connectez-vous pour voir vos notifications.</p>
                        <button
                          onClick={() => {
                            setNotifsOpen(false);
                            setAuthOpen(true);
                          }}
                          className="btn-cyber-primary py-1.5 px-4 text-[10px] mt-1 inline-block"
                        >
                          SE CONNECTER
                        </button>
                      </div>
                    ) : realNotifs.length === 0 ? (
                      <div className="py-6 text-center text-white/40 space-y-1.5">
                        <CheckCircle2 className="w-6 h-6 text-[#A4DE87]/40 mx-auto" />
                        <div className="text-xs font-bold text-white/70">AUCUNE NOTIFICATION</div>
                        <p className="text-[10px] text-white/30">Toutes vos notifications sont à jour.</p>
                      </div>
                    ) : (
                      realNotifs.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => setNotifsOpen(false)}
                          className="block p-2.5 bg-black/60 border border-white/5 space-y-1 hover:border-[#FF7582]/40 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-[#FF7582] font-bold flex items-center gap-1">
                              {item.type === "message" ? (
                                <MessageSquare className="w-3 h-3" />
                              ) : item.type === "annotation" ? (
                                <Film className="w-3 h-3" />
                              ) : (
                                <Calendar className="w-3 h-3" />
                              )}
                              {item.title}
                            </span>
                            <span className="text-[9px] text-white/40">{item.timeAgo}</span>
                          </div>
                          <p className="text-[11px] text-white/80 leading-snug">
                            {item.description}
                          </p>
                        </Link>
                      ))
                    )}
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
                      href="/profile/coaching"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full p-2 hover:bg-white/5 text-white/80 hover:text-white flex items-center gap-2.5 transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#8FAFD4]" />
                      <span>ESPACE ÉLÈVE</span>
                    </Link>
                    <Link
                      href="/profile/sheet"
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
                      onClick={async () => {
                        setUserMenuOpen(false);
                        await logout();
                      }}
                      className="w-full p-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 flex items-center gap-2.5 transition-colors border-t border-white/10 mt-1 cursor-pointer"
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
                className="text-xs font-mono text-white/80 hover:text-white transition-colors py-2 px-3 border border-white/15 hover:border-white/40 cursor-pointer uppercase tracking-wider"
              >
                CONNEXION
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
              className="btn-cyber-primary py-2 px-4 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <span>RÉSERVER</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Actions: ThemeToggle + Hamburger Button */}
          <div className="flex sm:hidden items-center gap-2">
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
              className="sm:hidden bg-[#06080A]/95 border-b border-white/10 backdrop-blur-lg px-6 py-6 space-y-4 font-mono text-xs overflow-hidden"
            >
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="block py-2 text-white/80 hover:text-[#FF7582] transition-colors uppercase tracking-wider font-semibold border-b border-white/5"
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
