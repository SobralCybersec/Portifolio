'use client';

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export interface ExpertiseGroup {
  title: string;
  items: string[];
  background?: string;
  portrait?: string;
}

interface InteractiveExpertiseGridProps {
  groups: ExpertiseGroup[];
  moduleLabel?: string;
}

function DeferredDecorativeImage({
  src,
  sizes,
  className,
  wrapperClassName,
}: {
  src: string;
  sizes: string;
  className: string;
  wrapperClassName: string;
}) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px' },
    );

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={wrapperRef} className={wrapperClassName} aria-hidden="true">
      {visible && (
        <Image
          src={src}
          alt=""
          fill
          unoptimized
          sizes={sizes}
          className={className}
        />
      )}
    </span>
  );
}

function ExpertiseCard({ group, index, moduleLabel }: { group: ExpertiseGroup; index: number; moduleLabel: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springX = useSpring(tiltX, { stiffness: 220, damping: 24 });
  const springY = useSpring(tiltY, { stiffness: 220, damping: 24 });
  const rotateX = useTransform(springY, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [6, -6]);
  const rotateY = useTransform(springX, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-6, 6]);
  const spotlight = useMotionTemplate`radial-gradient(220px circle at ${pointerX}% ${pointerY}%, rgba(168,85,247,0.17), transparent 72%)`;

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || event.pointerType === 'touch' || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    pointerX.set((x / rect.width) * 100);
    pointerY.set((y / rect.height) * 100);
    tiltX.set(x / rect.width - 0.5);
    tiltY.set(y / rect.height - 0.5);
  };

  const resetPointer = () => {
    pointerX.set(50);
    pointerY.set(50);
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <motion.article
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      style={{ rotateX, rotateY, backgroundImage: spotlight, transformPerspective: 900 }}
      className="group relative min-h-64 overflow-hidden border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-colors duration-300 hover:border-[var(--theme-primary)] md:p-8"
    >
      {group.background && (
        <DeferredDecorativeImage
          src={group.background}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="theme-ambient-media pointer-events-none absolute inset-0 z-0 object-cover opacity-20 mix-blend-screen transition duration-700 group-hover:scale-105 group-hover:opacity-30"
          wrapperClassName="pointer-events-none absolute inset-0 z-0"
        />
      )}
      {group.portrait && (
        <DeferredDecorativeImage
          src={group.portrait}
          sizes="220px"
          className="theme-portrait-media pointer-events-none absolute inset-y-0 right-0 left-auto z-0 w-2/5 object-contain object-right-bottom opacity-20 mix-blend-screen transition duration-700 group-hover:scale-105 group-hover:opacity-30"
          wrapperClassName="pointer-events-none absolute inset-y-0 right-0 left-auto z-0 w-2/5"
        />
      )}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-[var(--bg-card)]/[0.94] via-[var(--bg-card)]/[0.82] to-transparent" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-[var(--theme-primary)]/[0.06] via-transparent to-[var(--theme-accent)]/[0.06] opacity-60" />
      <div className="relative z-10 flex h-full flex-col justify-between gap-10">
        <div className="flex items-start justify-between gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--theme-primary)]">
            0{index + 1} {moduleLabel}
          </span>
          <ArrowUpRight className="h-5 w-5 text-[var(--text-muted)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[var(--theme-primary)]" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-[var(--font-solo-heading)] text-xl font-semibold uppercase tracking-[0.12em] text-[var(--text-primary)] md:text-2xl">
            {group.title}
          </h3>
          <div className="mt-5 flex flex-wrap gap-2">
            {group.items.map((item) => (
              <span key={item} className="border border-[var(--theme-primary)]/25 bg-[var(--theme-primary)]/[0.07] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] transition-colors duration-300 group-hover:text-[var(--text-primary)]">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function InteractiveExpertiseGrid({ groups, moduleLabel = '/ module' }: InteractiveExpertiseGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2" style={{ perspective: '1200px' }}>
      {groups.map((group, index) => (
        <ExpertiseCard key={group.title} group={group} index={index} moduleLabel={moduleLabel} />
      ))}
    </div>
  );
}
