'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export interface CapabilityRailItem {
  id: string;
  label: string;
  eyebrow: string;
  items: string[];
  image: string;
}

interface CapabilityRailProps {
  items: CapabilityRailItem[];
}

/** FlowingMenu-inspired capability list with touch-friendly expansion. */
export default function CapabilityRail({ items }: CapabilityRailProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="capability-rail" role="list">
      {items.map((item) => {
        const isActive = activeId === item.id;

        return (
          <div
            key={item.id}
            role="listitem"
            onMouseLeave={() => setActiveId(null)}
            className="relative overflow-hidden border-b border-[var(--border)]"
          >
            <button
              type="button"
              aria-expanded={isActive}
              onClick={() => setActiveId(isActive ? null : item.id)}
              onMouseEnter={() => setActiveId(item.id)}
              onFocus={() => setActiveId(item.id)}
              className="group relative z-10 flex min-h-24 w-full items-center justify-between gap-4 px-4 py-5 text-left transition-colors duration-300 hover:text-[var(--theme-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--theme-primary)] md:px-6"
            >
              <span className="min-w-0">
                <span className="block font-[var(--font-solo-heading)] text-xl font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)] transition-colors duration-300 group-hover:text-[var(--theme-primary)] md:text-2xl">
                  {item.label}
                </span>
                <span className="mt-1 block truncate font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  {item.items.slice(0, 4).join(' / ')}
                </span>
              </span>
              <motion.span
                animate={{ rotate: isActive ? 45 : 0, x: isActive ? -4 : 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
                className="shrink-0 text-[var(--theme-primary)]"
              >
                <ArrowUpRight className="h-5 w-5" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isActive && (
                <motion.div
                  initial={shouldReduceMotion ? false : { y: '100%' }}
                  animate={{ y: 0 }}
                  exit={shouldReduceMotion ? undefined : { y: '100%' }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="pointer-events-none absolute inset-0 z-20 overflow-hidden border border-[var(--theme-primary)]/30 bg-[var(--bg-card)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-primary)]/[0.12] via-transparent to-transparent" />
                  <div className="absolute right-5 top-1/2 h-16 w-16 -translate-y-1/2 opacity-25 transition-opacity duration-500 group-hover:opacity-50 md:right-10 md:h-20 md:w-20">
                    <Image src={item.image} alt="" fill sizes="80px" className="object-contain" />
                  </div>
                  <div className="relative flex h-full items-center justify-between gap-4 px-4 md:px-6">
                    <span>
                      <span className="block font-mono text-[9px] uppercase tracking-[0.24em] text-[var(--theme-primary)]">
                        {item.eyebrow}
                      </span>
                      <span className="mt-2 flex max-w-[min(70vw,720px)] flex-wrap gap-2">
                        {item.items.map((skill) => (
                          <span key={skill} className="border border-[var(--theme-primary)]/30 bg-[var(--theme-primary)]/[0.08] px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--text-primary)]">
                            {skill}
                          </span>
                        ))}
                      </span>
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
