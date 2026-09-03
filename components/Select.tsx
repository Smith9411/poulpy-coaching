'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  accent?: 'purple' | 'red' | 'orange' | 'cyan';
  disabled?: boolean;
}

const ACCENT_MAP = {
  purple: {
    selected: 'border-purple-500/60 bg-purple-500/15 text-purple-200',
    itemHover: 'hover:bg-purple-500/15',
    ring: 'focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/30',
    dot: 'bg-purple-400',
  },
  red: {
    selected: 'border-red-500/60 bg-red-500/15 text-red-200',
    itemHover: 'hover:bg-red-500/15',
    ring: 'focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/30',
    dot: 'bg-red-400',
  },
  orange: {
    selected: 'border-orange-500/60 bg-orange-500/15 text-orange-200',
    itemHover: 'hover:bg-orange-500/15',
    ring: 'focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/30',
    dot: 'bg-orange-400',
  },
  cyan: {
    selected: 'border-cyan-500/60 bg-cyan-500/15 text-cyan-200',
    itemHover: 'hover:bg-cyan-500/15',
    ring: 'focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/30',
    dot: 'bg-cyan-400',
  },
};

export default function Select({ value, onChange, options, placeholder = 'Sélectionner...', accent = 'purple', disabled }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const colors = ACCENT_MAP[accent];

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className={`relative ${colors.ring} rounded-xl transition-all`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((v) => !v)}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-left flex items-center justify-between gap-2 transition-all ${
          value ? colors.selected : 'border-white/10 text-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
      >
        <span className="truncate font-medium">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 top-full z-[100] max-h-64 overflow-y-auto bg-gray-900/95 backdrop-blur-xl border border-t-0 border-white/10 rounded-b-xl shadow-2xl"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left flex items-center justify-between gap-2 transition-colors ${
                    isSelected ? colors.selected : `text-gray-200 ${colors.itemHover}`
                  }`}
                >
                  <span className="truncate text-sm">{opt.label}</span>
                  {isSelected && (
                    <span className={`w-2 h-2 rounded-full ${colors.dot} shrink-0`} />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}