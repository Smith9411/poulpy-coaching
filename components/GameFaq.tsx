"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export interface FaqItem {
  q: string;
  a: string;
}

export default function GameFaq({
  title = "VALORANT",
  faqs,
}: {
  title?: string;
  faqs: FaqItem[];
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="mt-24 sm:mt-28 w-full text-left font-mono border-t border-white/10 pt-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <h2 className="text-2xl sm:text-3xl font-display text-[#F5F4F0] tracking-wider uppercase">
          FOIRE AUX <span className="text-[#CA1C30]">QUESTIONS</span>
        </h2>
        <span className="text-xs text-[#F5F4F0]/50 uppercase tracking-widest font-mono">
          {title} COACHING
        </span>
      </div>

      <div className="divide-y divide-white/10 border-b border-white/10">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="group transition-colors">
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full py-6 sm:py-7 text-left flex items-start justify-between gap-6 select-none cursor-pointer"
                aria-expanded={isOpen}
              >
                <div className="flex items-baseline gap-4 sm:gap-6">
                  <span className="text-xs sm:text-sm font-mono font-bold text-[#CA1C30] shrink-0 tracking-widest">
                    0{idx + 1}
                  </span>
                  <h3
                    className={`text-base sm:text-lg md:text-xl font-display font-medium tracking-wide transition-colors ${
                      isOpen
                        ? "text-[#F5F4F0]"
                        : "text-[#F5F4F0]/80 group-hover:text-white"
                    }`}
                  >
                    {faq.q}
                  </h3>
                </div>

                <div className="pt-1 shrink-0">
                  <Plus
                    className={`w-5 h-5 transition-transform duration-300 ease-out ${
                      isOpen
                        ? "rotate-45 text-[#CA1C30]"
                        : "text-white/40 group-hover:text-white"
                    }`}
                  />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    key="open"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pl-8 sm:pl-12 pr-6 pb-6 sm:pb-7 text-xs sm:text-sm text-[#F5F4F0]/70 font-sans leading-relaxed max-w-3xl">
                      {faq.a}
                    </div>
                  </motion.div>
                ) : (
                  <div key="closed" className="sr-only">
                    {faq.a}
                  </div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          href="/"
          className="btn-cyber-primary px-8 py-3.5 font-bold text-xs tracking-wider"
        >
          <span>DÉCOUVRIR LE SITE COMPLET</span>
        </Link>
      </div>
    </section>
  );
}
