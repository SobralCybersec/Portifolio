'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { useHydrated } from '@/hooks/browser/useHydrated';
import { SOLO_LEVELING_BOOT_STYLES } from './solo-leveling-boot-styles';
import MatrixRain from './MatrixRain';

interface SoloLevelingBootProps {
  onComplete: () => void;
}

// HUD reveal transition 1s cubic-bezier(.78,0,.2,1) — from the reference.
const HUD_EASE = [0.78, 0, 0.2, 1] as const;

// Timing contract: HUD frame draws in, types, then panels part at REVEAL_MS
// (frame reverse-collapses), overlay finishes at FINISH_MS.
const REVEAL_MS = 600;
const FINISH_MS = 1200;
const REDUCED_FINISH_MS = 700;

/**
 * Typewriter that reveals `text` one character at a time once `start` is true.
 * Under reduced motion it fills in immediately (via a 0ms timer so no state is
 * set synchronously inside the effect body — react-hooks/set-state-in-effect).
 */
function useTypewriter(text: string, start: boolean, reduceMotion: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) {
      return;
    }

    if (reduceMotion) {
      const id = window.setTimeout(() => setCount(text.length), 0);
      return () => window.clearTimeout(id);
    }

    // Pace so the line finishes just before the gate opens.
    const speed = Math.max(18, Math.floor((REVEAL_MS - 60) / text.length));
    const id = window.setInterval(() => {
      setCount((current) => {
        if (current >= text.length) {
          window.clearInterval(id);
          return current;
        }
        return current + 1;
      });
    }, speed);

    return () => window.clearInterval(id);
  }, [text, start, reduceMotion]);

  return text.slice(0, count);
}

/**
 * Short full-screen route boot: a centered System card types itself in, then
 * collapses before the overlay fades and unmounts.
 */
export default function SoloLevelingBoot({ onComplete }: SoloLevelingBootProps) {
  const t = useTranslations('boot');
  const [revealed, setRevealed] = useState(false);
  const [visible, setVisible] = useState(true);
  const reduceMotion = useReducedMotion();
  const shouldReduceMotion = reduceMotion === true;
  const { resolvedTheme } = useTheme();
  const mounted = useHydrated();
  // Treat as DARK until mounted so SSR/first paint stays on the dark palette
  // and never mismatches (even if ssr:false or system theme is later enabled).
  const isLight = mounted && resolvedTheme === 'light';

  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const typed = useTypewriter(t('authLine'), visible, shouldReduceMotion);

  useEffect(() => {
    // revealed/visible already initialise to false/true via useState, so no
    // synchronous reset is needed here (that triggers react-hooks/set-state-in-effect).
    let audio: HTMLAudioElement | null = null;
    const timers: number[] = [];

    const finish = () => {
      if (completedRef.current) {
        return;
      }

      completedRef.current = true;
      setVisible(false);
      onCompleteRef.current();
    };

    if (shouldReduceMotion) {
      timers.push(window.setTimeout(finish, REDUCED_FINISH_MS));
    } else {
      timers.push(
        window.setTimeout(() => {
          setRevealed(true);

          audio = new Audio('/sounds/pop.mov');
          audio.volume = 0.65;
          void audio.play().catch(() => undefined);
        }, REVEAL_MS),
      );

      // Keep intro short so it does not delay first meaningful paint.
      timers.push(window.setTimeout(finish, FINISH_MS));
    }

    return () => {
      timers.forEach(window.clearTimeout);

      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [shouldReduceMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="solo-leveling-intro"
          role="status"
          aria-label={t('statusAria')}
          aria-live="polite"
          className={`sl-intro ${isLight ? 'sl-theme-light' : ''} fixed inset-0 z-[9999] overflow-hidden text-white`}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.08 : 0.28 }}
        >
          <motion.div
            aria-hidden="true"
            className="sl-backdrop absolute inset-0"
            style={{ background: 'transparent' }}
            animate={{ opacity: revealed ? 0 : 1 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.72, delay: revealed ? 0.28 : 0 }}
          >
            <MatrixRain active={!shouldReduceMotion} light={isLight} />
          </motion.div>

          <div className="sl-intro-card absolute inset-0 z-10 grid place-items-center px-5">
            {/* HUD frame: draws in as a line → box (LO's `hud` keyframe), then
                reverse-collapses box → line on close. */}
            <motion.div
              className="sl-glass-shell sl-hud-frame w-[min(590px,86vw)] -skew-x-[4deg]"
              style={{ transformOrigin: 'center' }}
              initial={shouldReduceMotion ? false : { scaleX: 0, scaleY: 0, opacity: 0 }}
              animate={
                shouldReduceMotion
                  ? { scaleX: 1, scaleY: 1, opacity: 1 }
                  : revealed
                    ? { scaleX: [1, 1, 0], scaleY: [1, 0, 0], opacity: [1, 1, 0] }
                    : { scaleX: [0, 1, 1], scaleY: [0, 0, 1], opacity: 1 }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                    : { duration: revealed ? 0.55 : 0.8, ease: HUD_EASE, times: [0, 0.5, 1] }
              }
            >
              <motion.div
                className="sl-glass relative overflow-hidden px-6 py-7 text-center sm:px-10 sm:py-9"
                animate={{ opacity: shouldReduceMotion ? 1 : revealed ? 0 : 1 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.32,
                  delay: shouldReduceMotion ? 0 : revealed ? 0 : 0.55,
                }}
              >
                <div aria-hidden="true" className="sl-scan absolute inset-0" />
                <div aria-hidden="true" className="sl-corner sl-corner-tl" />
                <div aria-hidden="true" className="sl-corner sl-corner-tr" />
                <div aria-hidden="true" className="sl-corner sl-corner-bl" />
                <div aria-hidden="true" className="sl-corner sl-corner-br" />

                <p className="sl-system-label mb-3 flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[0.34em] sm:text-[10px]">
                  <span>{t('authorization')}</span>
                  <span className="sl-kr">각성</span>
                </p>

                <h1
                  className="sl-title relative m-0 uppercase"
                >
                  <span className="sl-title-solo block">Solo</span>
                  <span className="sl-title-leveling block">Leveling</span>
                </h1>

                <div className="sl-divider mx-auto my-4 h-px w-[min(330px,72%)]" />

                <p className="sl-typeline m-0 font-mono text-[10px] font-bold uppercase tracking-[0.32em] sm:text-xs">
                  <span className="sl-typeline-text">{typed}</span>
                  <span className="sl-cursor" aria-hidden="true" />
                </p>

                <div className="mt-4 flex items-center justify-center gap-2" aria-hidden="true">
                  <span className="sl-status-dot" />
                  <span className="sl-status-line" />
                  <span className="sl-status-code text-[8px] font-medium tracking-[0.28em] sm:text-[9px]">
                    {t('systemOnline')}
                  </span>
                  <span className="sl-status-line sl-status-line-reverse" />
                  <span className="sl-status-dot" />
                </div>
              </motion.div>
            </motion.div>
          </div>

          <style jsx>{SOLO_LEVELING_BOOT_STYLES}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
