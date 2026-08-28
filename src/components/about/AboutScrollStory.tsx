'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

export interface AboutStoryItem {
  label: string;
  title: string;
  body: string;
  signal: string;
  detail: string;
  image?: string;
}

interface AboutScrollStoryProps {
  items: AboutStoryItem[];
  sectionLabel: string;
  prompt: string;
  traceLabel?: string;
}

/** Pinned story sequence adapted from PersonalBlog's ScrollTrigger panels. */
export default function AboutScrollStory({ items, sectionLabel, prompt, traceLabel = 'SCROLL / TRACE / BUILD' }: AboutScrollStoryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const cards = cardRefs.current.filter((card): card is HTMLElement => Boolean(card));
    const progress = progressRef.current;
    if (!section || !progress || cards.length === 0) return;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      gsap.set(cards, { clearProps: 'all', autoAlpha: 1 });
      gsap.set(progress, { scaleY: 1 });
      return;
    }

    const isMobile = window.matchMedia?.('(max-width: 767px)').matches;
    const context = gsap.context(() => {
      gsap.set(cards, { autoAlpha: 0, y: isMobile ? 42 : 72, x: 0, rotateY: 0, scale: 0.96 });
      gsap.set(cards[0], { autoAlpha: 1, y: 0, scale: 1 });
      gsap.set(progress, { scaleY: 0 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top+=80',
          end: 'bottom top+=80',
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      cards.forEach((card, index) => {
        // Give every panel a full read beat before the next panel takes over.
        const position = index * 2.2;
        if (index > 0) {
          timeline.to(cards[index - 1], {
            autoAlpha: 0.18,
            y: -48,
            scale: 0.94,
            duration: 1.05,
            ease: 'power2.inOut',
          }, position);
        }
        timeline.to(card, {
          autoAlpha: 1,
          y: 0,
          rotateY: 0,
          scale: 1,
          duration: 1.05,
          ease: 'power3.out',
        }, position);

        timeline.to(card, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: index === cards.length - 1 ? 2.2 : 1.15,
          ease: 'none',
        }, position + 1.05);
      });

      timeline.to(progress, { scaleY: 1, duration: timeline.duration(), ease: 'none' }, 0);
    }, section);

    return () => context.revert();
  }, [items.length]);

  const updateSpotlight = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch') return;
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
    target.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
  };

  return (
    <section ref={sectionRef} className="relative min-h-[340vh]" aria-label={sectionLabel}>
      <div className="sticky top-20 flex min-h-[calc(100vh-5rem)] items-center py-12 md:py-16">
        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.28fr)_minmax(0,1fr)] lg:gap-16">
          <div className="flex flex-col justify-between gap-8 lg:min-h-[min(68vh,680px)]">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--theme-primary)]">{sectionLabel}</p>
              <div className="mt-5 flex items-center gap-3 text-[var(--text-muted)]">
                <ArrowDown className="h-4 w-4 animate-bounce" aria-hidden="true" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em]">{prompt}</span>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative h-44 w-px bg-[var(--border)]">
                <div ref={progressRef} className="absolute inset-x-0 top-0 h-full origin-top bg-[var(--theme-primary)] shadow-[0_0_18px_var(--theme-primary)]" />
              </div>
              <p className="mt-4 max-w-[150px] font-mono text-[9px] uppercase leading-relaxed tracking-[0.15em] text-[var(--text-muted)]">
                {traceLabel}
              </p>
            </div>
          </div>

          <div className="relative h-[min(68vh,680px)] min-h-[460px]" style={{ perspective: '1200px' }}>
            {items.map((item, index) => (
              <article
                key={item.label}
                ref={(element) => { cardRefs.current[index] = element; }}
                onPointerMove={updateSpotlight}
                className="about-story-card group absolute inset-0 overflow-hidden border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.16)] [background-image:radial-gradient(320px_circle_at_var(--spot-x,50%)_var(--spot-y,50%),rgba(168,85,247,0.12),transparent_72%)] md:p-10"
              >
                {item.image && (
                  <div className="theme-story-media pointer-events-none absolute inset-y-0 right-0 z-0 w-[70%] opacity-25 mix-blend-screen transition-transform duration-700 group-hover:scale-105 md:w-[58%] md:opacity-30">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 75vw, 45vw"
                      className="object-contain object-right-bottom"
                    />
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(120deg,rgba(168,85,247,0.08),transparent_36%,transparent_68%,rgba(59,130,246,0.06))]" />
                <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-[var(--bg-card)] via-[var(--bg-card)]/[0.92] to-transparent" />
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--theme-primary)]">{item.label}</span>
                    <ArrowUpRight className="h-5 w-5 text-[var(--text-muted)]" aria-hidden="true" />
                  </div>
                  <div className="py-8">
                    <h3 className="max-w-3xl font-[var(--font-eternal)] text-4xl font-bold uppercase tracking-[0.06em] text-[var(--text-primary)] md:text-6xl">
                      {item.title}
                    </h3>
                    <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--text-muted)] md:text-lg">{item.body}</p>
                  </div>
                  <div className="grid gap-4 border-t border-[var(--border)] pt-5 sm:grid-cols-[0.8fr_1.2fr]">
                    <span className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--theme-accent)]">{item.signal}</span>
                    <span className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-[var(--text-muted)]">{item.detail}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
