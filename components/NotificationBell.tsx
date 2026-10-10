"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  MessageSquare,
  Film,
  Calendar,
  CheckCircle2,
  CheckCheck,
  X,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export interface NotificationItem {
  id: string;
  type: "message" | "annotation" | "booking" | "clip";
  title: string;
  description: string;
  timeAgo: string;
  href: string;
  rawId?: string;
  studentId?: string;
}

interface NotificationBellProps {
  className?: string;
  buttonClassName?: string;
  align?: "left" | "right";
  theme?: "cyber" | "default";
}

export default function NotificationBell({
  className = "",
  buttonClassName = "",
  align = "right",
  theme = "cyber",
}: NotificationBellProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [markingAll, setMarkingAll] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setItems([]);
      setUnreadCount(0);
      return;
    }

    try {
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
        cache: "no-store",
      });

      if (!res.ok) return;
      const data = await res.json();
      const notifList: NotificationItem[] = [];

      if (user.isAdmin) {
        // 1. Messages élèves non lus
        if (Array.isArray(data.unreadMessages)) {
          data.unreadMessages.forEach((m: {
            studentId: string;
            studentName: string;
            count: number;
            lastMessage: string;
            lastAt: string;
          }) => {
            notifList.push({
              id: `msg-${m.studentId}`,
              type: "message",
              title: `MESSAGE DE ${(m.studentName || "ÉLÈVE").toUpperCase()}`,
              description: m.lastMessage || `${m.count} nouveau(x) message(s)`,
              timeAgo: formatTimeAgo(m.lastAt),
              href: `/admin/coaching/${m.studentId}`,
              studentId: m.studentId,
            });
          });
        }

        // 2. Clips VOD en attente
        if (Array.isArray(data.pendingClips)) {
          data.pendingClips.forEach((c: {
            clipId: string;
            studentId: string;
            studentName: string;
            title: string;
            submittedAt: string;
          }) => {
            notifList.push({
              id: `clip-${c.clipId}`,
              type: "clip",
              title: "NOUVEAU CLIP VOD À REVOIR",
              description: `${c.studentName || "Élève"} : ${c.title || "Clip"}`,
              timeAgo: formatTimeAgo(c.submittedAt),
              href: `/admin/coaching/${c.studentId}/clips`,
              rawId: c.clipId,
              studentId: c.studentId,
            });
          });
        }

        // 3. Nouvelles réservations reçues (Fix pour le Coach)
        if (Array.isArray(data.unreadBookings)) {
          data.unreadBookings.forEach((b: {
            bookingId: string;
            studentName: string;
            planName: string;
            bookingDate: string;
            bookingTime: string;
            game: string;
            createdAt: string;
          }) => {
            notifList.push({
              id: `booking-${b.bookingId}`,
              type: "booking",
              title: `RÉSERVATION • ${(b.game || "COACHING").toUpperCase()}`,
              description: `${b.studentName || "Élève"} — ${b.planName || "Séance"} le ${b.bookingDate || ""} à ${b.bookingTime || ""}`,
              timeAgo: formatTimeAgo(b.createdAt),
              href: "/admin/bookings",
              rawId: b.bookingId,
            });
          });
        }

        setUnreadCount(typeof data.totalCount === "number" ? data.totalCount : notifList.length);
      } else {
        // 1. Messages non lus du coach
        if (data.unreadMsgCount && data.unreadMsgCount > 0) {
          notifList.push({
            id: "student-msgs",
            type: "message",
            title: "NOUVEAU MESSAGE DU COACH",
            description: data.lastMsg?.message || `Vous avez ${data.unreadMsgCount} nouveau(x) message(s) de Poulpy.`,
            timeAgo: data.lastMsg?.createdAt ? formatTimeAgo(data.lastMsg.createdAt) : "RÉCENT",
            href: "/profile/coaching",
          });
        }

        // 2. Annotations VOD reçues
        if (data.newAnnotationsCount && data.newAnnotationsCount > 0) {
          notifList.push({
            id: "student-annot",
            type: "annotation",
            title: "ANNOTATION SUR VOTRE VOD",
            description: data.lastAnnotation?.content
              ? `"${data.lastAnnotation.clipTitle}" : ${data.lastAnnotation.content}`
              : "Poulpy a annoté un de vos clips.",
            timeAgo: data.lastAnnotation?.createdAt ? formatTimeAgo(data.lastAnnotation.createdAt) : "RÉCENT",
            href: "/profile/vod",
          });
        }

        // 3. Alertes sur séances de coaching
        if (Array.isArray(data.bookingAlerts)) {
          data.bookingAlerts.forEach((b: {
            id: string;
            status: string;
            planName: string;
            bookingDate: string;
            bookingTime: string;
            updatedAt: string;
          }) => {
            notifList.push({
              id: `booking-${b.id}`,
              type: "booking",
              title: b.status === "cancelled" ? "SÉANCE ANNULÉE" : "SÉANCE REPLANIFIÉE",
              description: `${b.planName} du ${b.bookingDate} à ${b.bookingTime}`,
              timeAgo: formatTimeAgo(b.updatedAt),
              href: "/profile",
              rawId: b.id,
            });
          });
        }

        setUnreadCount(typeof data.totalCount === "number" ? data.totalCount : notifList.length);
      }

      setItems(notifList);
    } catch (err) {
      console.warn("[NotificationBell] Erreur fetch:", err);
    }
  }, [user]);

  // Initial fetch + Supabase Realtime synchronization
  useEffect(() => {
    fetchNotifications();

    if (!user) return;

    // Supabase Realtime Channel
    const channelName = `realtime_notifs_${user.id}_${Math.random().toString(36).slice(2, 7)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "coaching_messages" },
        () => fetchNotifications()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "coaching_bookings" },
        () => fetchNotifications()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vod_clips" },
        () => fetchNotifications()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vod_annotations" },
        () => fetchNotifications()
      )
      .subscribe();

    // Fallback polling léger (30 secondes)
    const interval = setInterval(fetchNotifications, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Marquer un élément individuel comme lu au clic
  const handleItemClick = async (item: NotificationItem) => {
    setIsOpen(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const endpoint = user?.isAdmin
        ? "/api/notifications/admin-summary"
        : "/api/notifications/student-summary";

      if (user?.isAdmin) {
        if (item.type === "booking" && item.rawId) {
          await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ bookingId: item.rawId }),
          });
        } else if (item.type === "clip" && item.rawId) {
          await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ clipId: item.rawId }),
          });
        } else if (item.type === "message" && item.studentId) {
          await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ studentId: item.studentId }),
          });
        }
      } else {
        if (item.type === "booking" && item.rawId) {
          await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ bookingId: item.rawId }),
          });
        } else if (item.type === "message") {
          await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ action: "mark_messages" }),
          });
        } else if (item.type === "annotation") {
          await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ action: "mark_annotations" }),
          });
        }
      }

      // Rafraîchir immédiatement
      fetchNotifications();
    } catch {
      // Ignorer
    }
  };

  // Marquer toutes les notifications comme lues
  const handleMarkAllRead = async () => {
    if (markingAll || unreadCount === 0) return;

    try {
      setMarkingAll(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const endpoint = user?.isAdmin
        ? "/api/notifications/admin-summary"
        : "/api/notifications/student-summary";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: "mark_all_read" }),
      });

      if (res.ok) {
        setUnreadCount(0);
        setItems([]);
      }
    } catch (err) {
      console.error("[NotificationBell] Erreur mark all read:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  if (!user) return null;

  const isCyber = theme === "cyber";

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* Bouton Cloche */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} non lues)` : ""}`}
        className={`relative p-2.5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
          isCyber
            ? "text-[#F5F4F0]/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#CA1C30]/40"
            : "text-gray-300 hover:text-white hover:bg-white/5"
        } ${buttonClassName}`}
      >
        <Bell className="w-4 h-4" />

        {/* Pastille Rouge Pulsante */}
        {unreadCount > 0 && (
          <>
            <span
              className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${
                isCyber ? "bg-[#CA1C30]" : "bg-red-500"
              } animate-ping`}
            />
            <span
              className={`absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full ${
                isCyber ? "bg-[#CA1C30]" : "bg-red-500"
              } text-white text-[9px] font-bold font-mono flex items-center justify-center shadow-lg`}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </>
        )}
      </button>

      {/* Menu Déroulant */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`absolute top-full mt-2 w-80 sm:w-88 z-50 rounded-2xl border p-4 space-y-3 font-mono shadow-2xl backdrop-blur-xl ${
              align === "left" ? "left-0" : "right-0"
            } ${
              isCyber
                ? "bg-[#121117]/95 border-[#CA1C30]/30 shadow-[0_12px_45px_rgba(0,0,0,0.95)] text-[#F5F4F0]"
                : "bg-gray-900/95 border-white/10 shadow-2xl text-white"
            }`}
          >
            {/* Header du panneau */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span
                className={`text-[10px] font-bold tracking-wider flex items-center gap-1.5 ${
                  isCyber ? "text-[#CA1C30]" : "text-cyan-400"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    isCyber ? "bg-[#CA1C30]" : "bg-cyan-400"
                  }`}
                />
                NOTIFICATIONS // {unreadCount}{" "}
                {unreadCount > 1 ? "NON LUES" : "NON LUE"}
              </span>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={markingAll}
                  className="text-[10px] text-white/50 hover:text-white flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                  title="Tout marquer comme lu"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>{markingAll ? "..." : "TOUT VU"}</span>
                </button>
              )}
            </div>

            {/* Liste des Notifications */}
            <div className="space-y-2 max-h-76 overflow-y-auto pr-1">
              {!user ? (
                <div className="py-8 text-center text-white/40 space-y-2">
                  <Bell className="w-6 h-6 text-white/20 mx-auto" />
                  <div className="text-xs font-bold text-white/70">NON CONNECTÉ</div>
                  <p className="text-[10px] text-white/40">Connectez-vous pour voir vos notifications.</p>
                  <Link
                    href="/auth"
                    onClick={() => setIsOpen(false)}
                    className="inline-block mt-2 py-1.5 px-4 text-[10px] font-bold uppercase rounded-lg bg-[#CA1C30] text-white hover:bg-[#CA1C30]/80 transition-colors"
                  >
                    Se connecter
                  </Link>
                </div>
              ) : items.length === 0 ? (
                <div className="py-8 text-center text-white/40 space-y-2">
                  <CheckCircle2 className="w-6 h-6 text-[#00B4A0]/60 mx-auto" />
                  <div className="text-xs font-bold text-white/80">AUCUNE NOTIFICATION</div>
                  <p className="text-[10px] text-white/40">Vous êtes totalement à jour.</p>
                </div>
              ) : (
                items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => handleItemClick(item)}
                    className={`block p-3 rounded-xl border transition-all group ${
                      isCyber
                        ? "bg-[#1A1822] border-white/5 hover:border-[#CA1C30]/50 hover:bg-[#201D2C]"
                        : "bg-white/[0.04] border-white/5 hover:border-cyan-500/40 hover:bg-white/[0.08]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold flex items-center gap-1.5 truncate ${
                          item.type === "booking"
                            ? "text-[#00B4A0]"
                            : item.type === "clip"
                            ? "text-orange-400"
                            : isCyber
                            ? "text-[#CA1C30]"
                            : "text-purple-400"
                        }`}
                      >
                        {item.type === "message" ? (
                          <MessageSquare className="w-3 h-3 shrink-0" />
                        ) : item.type === "clip" || item.type === "annotation" ? (
                          <Film className="w-3 h-3 shrink-0" />
                        ) : (
                          <Calendar className="w-3 h-3 shrink-0" />
                        )}
                        <span className="truncate">{item.title}</span>
                      </span>
                      <span className="text-[9px] text-white/40 shrink-0 font-sans">
                        {item.timeAgo}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/80 leading-snug mt-1 font-sans line-clamp-2 group-hover:text-white transition-colors">
                      {item.description}
                    </p>
                  </Link>
                ))
              )}
            </div>

            {/* Footer avec lien direct */}
            {user && (
              <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[10px] text-white/50">
                <span>Poulpy Coaching System</span>
                <Link
                  href={user.isAdmin ? "/admin/coaching" : "/profile/coaching"}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-1 font-bold hover:underline ${
                    isCyber ? "text-[#CA1C30]" : "text-cyan-400"
                  }`}
                >
                  <span>{user.isAdmin ? "Espace Coach" : "Messagerie"}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Fonction utilitaire pour formater la date/heure relative
function formatTimeAgo(dateString?: string): string {
  if (!dateString) return "RÉCENT";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 2) return "À L'INSTANT";
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return "HIER";
    if (diffDays < 7) return `${diffDays}j`;

    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  } catch {
    return "RÉCENT";
  }
}
