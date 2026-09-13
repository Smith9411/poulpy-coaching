"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [isLight, setIsLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasLight = document.documentElement.classList.contains("light");
    setIsLight(hasLight);
  }, []);

  const toggleTheme = () => {
    const next = !isLight;
    setIsLight(next);
    const root = document.documentElement;

    root.classList.add("theme-transition");
    root.classList.toggle("light", next);

    try {
      localStorage.setItem("poulpy_theme", next ? "light" : "dark");
    } catch {}

    window.setTimeout(() => root.classList.remove("theme-transition"), 400);
  };

  if (!mounted) {
    return (
      <div className={`fixed top-4 right-4 sm:top-5 sm:right-6 z-[70] p-2 text-white/40 ${className}`}>
        <Moon className="w-5 h-5" />
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isLight ? "Basculer en mode sombre" : "Basculer en mode clair"}
      title={isLight ? "Mode Sombre" : "Mode Clair"}
      className={`fixed top-4 right-4 sm:top-5 sm:right-6 z-[70] p-2 transition-all duration-300 group cursor-pointer focus:outline-none ${className}`}
    >
      {isLight ? (
        <Sun className="w-5 h-5 text-[#8A5A44] hover:text-[#C85045] hover:rotate-45 hover:scale-110 transition-all duration-300 drop-shadow-sm" />
      ) : (
        <Moon className="w-5 h-5 text-white/70 hover:text-[#8FAFD4] hover:-rotate-12 hover:scale-110 transition-all duration-300 drop-shadow-[0_0_8px_rgba(143,175,212,0.5)]" />
      )}
    </button>
  );
}
