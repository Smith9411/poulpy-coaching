"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Shield, Users, Calendar, MessageSquare, BarChart2, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const adminLinks = [
    { href: "/admin", label: "DASHBOARD", icon: Shield },
    { href: "/admin/bookings", label: "RÉSERVATIONS", icon: Calendar },
    { href: "/admin/students", label: "ÉLÈVES", icon: Users },
    { href: "/admin/coaching", label: "COACHING & VOD", icon: MessageSquare },
    { href: "/admin/stats", label: "STATISTIQUES", icon: BarChart2 },
    { href: "/admin/settings", label: "PARAMÈTRES", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#07090D] text-white font-mono flex flex-col">
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#090c10]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Left: Back to Home + Brand */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 py-1.5 px-3 bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-white hover:text-[#FF7582] transition-colors"
              title="Retourner sur le site principal"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="font-bold">RETOUR AU SITE</span>
            </Link>

            <div className="h-4 w-px bg-white/15 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#FF7582] animate-pulse" />
              <span className="text-xs font-bold tracking-wider text-white">
                POULPY <span className="text-[#FF7582]">// ADMIN CENTER</span>
              </span>
            </div>
          </div>

          {/* Center: Admin Sub-navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 flex items-center gap-1.5 transition-all ${
                    isActive
                      ? "bg-[#FF7582] text-black font-bold shadow-[0_0_10px_rgba(255,117,130,0.3)]"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: User status & Logout */}
          <div className="flex items-center gap-3 text-xs">
            {user && (
              <span className="text-white/60 hidden sm:inline">
                Connecté : <span className="text-white font-bold">{user.username}</span>
              </span>
            )}
            <button
              onClick={() => logout()}
              className="py-1 px-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>DÉCONNEXION</span>
            </button>
          </div>
        </div>

        {/* Mobile Admin Sub-nav */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto pt-3 border-t border-white/5 mt-2 scrollbar-none">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2.5 py-1 text-[11px] whitespace-nowrap flex items-center gap-1 transition-all ${
                  isActive
                    ? "bg-[#FF7582] text-black font-bold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Admin Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        {children}
      </div>
    </div>
  );
}
