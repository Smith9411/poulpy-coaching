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
    selected: 'border-[#CA1C30]/60 bg-[#CA1C30]/15 text-[#CA1C30]',
    itemHover: 'hover:bg-[#CA1C30]/15 hover:text-[#CA1C30]',
    ring: 'focus-within:border-[#CA1C30]',
    dot: 'bg-[#CA1C30]',
  },
  red: {
    selected: 'border-[#CA1C30]/60 bg-[#CA1C30]/15 text-[#CA1C30]',
    itemHover: 'hover:bg-[#CA1C30]/15 hover:text-[#CA1C30]',
    ring: 'focus-within:border-[#CA1C30]',
    dot: 'bg-[#CA1C30]',
  },
  orange: {
    selected: 'border-[#00B4A0]/60 bg-[#00B4A0]/15 text-[#00B4A0]',
    itemHover: 'hover:bg-[#00B4A0]/15 hover:text-[#00B4A0]',
    ring: 'focus-within:border-[#00B4A0]',
    dot: 'bg-[#00B4A0]',
  },
  cyan: {
    selected: 'border-[#F5F4F0]/60 bg-[#F5F4F0]/15 text-[#F5F4F0]',
    itemHover: 'hover:bg-[#F5F4F0]/15 hover:text-[#F5F4F0]',
    ring: 'focus-within:border-[#F5F4F0]',
    dot: 'bg-[#F5F4F0]',
  },
};

export default function Select({ value, onChange, options, placeholder = 'Sélectionner...', accent = 'purple', disabled }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const colors = ACCENT_MAP[accent] || ACCENT_MAP.purple;

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
    <div ref={wrapperRef} className={`relative ${colors.ring} font-mono text-xs transition-all`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((v) => !v)}
        disabled={disabled}
        className={`w-full px-4 py-3 bg-[#102A2C] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
          value ? colors.selected : 'border-white/15 text-white/60 hover:border-white/30'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="truncate font-semibold tracking-wider">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-white/50 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#CA1C30]' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 top-full z-[100] max-h-64 overflow-y-auto bg-[#102A2C] border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.9)] mt-1"
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
                  className={`w-full px-4 py-2.5 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer text-xs ${
                    isSelected ? colors.selected : `text-white/80 ${colors.itemHover}`
                  }`}
                >
                  <span className="truncate tracking-wide">{opt.label}</span>
                  {isSelected && (
                    <span className={`w-1.5 h-1.5 ${colors.dot} shrink-0`} />
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