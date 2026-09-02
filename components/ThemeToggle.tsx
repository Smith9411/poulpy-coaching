'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    setIsLight(document.documentElement.classList.contains('light'));
  }, []);

  const toggle = () => {
    const next = !isLight;
    setIsLight(next);
    const root = document.documentElement;
    // Transition douce : la classe est retirée après l'animation
    root.classList.add('theme-transition');
    root.classList.toggle('light', next);
    try {
      localStorage.setItem('poulpy_theme', next ? 'light' : 'dark');
    } catch {}
    window.setTimeout(() => root.classList.remove('theme-transition'), 450);
  };

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? 'Activer le thème sombre' : 'Activer le thème clair'}
      title={isLight ? 'Thème sombre' : 'Thème clair'}
      className={`p-2.5 rounded-lg glass hover:bg-white/10 transition-colors text-gray-300 hover:text-white ${className}`}
    >
      {isLight ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
