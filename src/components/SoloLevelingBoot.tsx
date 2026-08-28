'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Teko, Rajdhani, Noto_Sans_KR } from 'next/font/google';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { useHydrated } from '@/hooks/useHydrated';

interface SoloLevelingBootProps {
  onComplete: () => void;
}

// Display font for the giant "SOLO / LEVELING" wordmark.
const displayFont = Teko({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
});

// System / HUD font for labels, the typewriter log and status line.
const systemFont = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// Korean accent used on the System stamps ("각성" — awakening).
// No `subsets` here: Noto Sans KR has no selectable "korean" subset name in
// next/font, and 'latin' alone drops the Korean glyphs. Omitting subsets +
// preload:false pulls the full face (incl. Korean) without a build error.
const koreanFont = Noto_Sans_KR({
  weight: ['500', '700'],
  display: 'swap',
  preload: false,
});

// reveal transition 1s cubic-bezier(.78,0,.2,1) — from the reference.
const PANEL_EASE = [0.78, 0, 0.2, 1] as const;

// Timing contract: HUD frame draws in, types, then panels part at REVEAL_MS
// (frame reverse-collapses), overlay finishes at FINISH_MS.
const REVEAL_MS = 1300;
const FINISH_MS = 2600;
const REDUCED_FINISH_MS = 700;

/**
 * Matrix-style glyph rain, painted on a canvas so it never triggers React
 * re-renders. Purely decorative and skipped entirely under reduced motion.
 */
function MatrixRain({ active, light }: { active: boolean; light: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const glyphs = 'アイウエオカキクケコサシスセソ0123456789ABCDEF각성길드던전';
    const cellSize = 16;
    let width = 0;
    let height = 0;
    let columns = 0;
    let drops: number[] = [];
    let raf = 0;
    let last = 0;

    const blue = light ? 'rgba(60, 200, 255, 0.92)' : 'rgba(60, 200, 255, 0.85)';
    const purple = light ? 'rgba(150, 93, 255, 0.9)' : 'rgba(150, 93, 255, 0.78)';
    const fade = light ? 'rgba(8, 10, 28, 0.16)' : 'rgba(2, 3, 10, 0.22)';

    const resize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      columns = Math.ceil(width / cellSize);
      drops = new Array(columns)
        .fill(0)
        .map(() => Math.floor((Math.random() * -height) / cellSize));
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = (time: number) => {
      raf = window.requestAnimationFrame(draw);
      if (time - last < 55) {
        return;
      }
      last = time;

      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${cellSize}px monospace`;

      for (let i = 0; i < columns; i += 1) {
        const char = glyphs[Math.floor(Math.random() * glyphs.length)];
        const x = i * cellSize;
        const y = drops[i] * cellSize;
        ctx.fillStyle = i % 3 === 0 ? blue : purple;
        ctx.fillText(char, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 1;
      }
    };

    raf = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [active, light]);

  return <canvas ref={canvasRef} aria-hidden="true" className="sl-matrix absolute inset-0 h-full w-full" />;
}

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
 * Short full-screen route boot: a Solo Leveling "shadow-wipe" gate. Two jagged
 * panels sit closed over the viewport, a System card types itself in, then the
 * panels slide apart (the shadow wipe) before the overlay fades and unmounts.
 */
export default function SoloLevelingBoot({ onComplete }: SoloLevelingBootProps) {
  const t = useTranslations('boot');
  const [revealed, setRevealed] = useState(false);
  const [visible, setVisible] = useState(true);
  const reduceMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const mounted = useHydrated();
  // Treat as DARK until mounted so SSR/first paint stays on the dark palette
  // and never mismatches (even if ssr:false or system theme is later enabled).
  const isLight = mounted && resolvedTheme === 'light';

  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const typed = useTypewriter(t('authLine'), visible, Boolean(reduceMotion));

  useEffect(() => {
    // revealed/visible already initialise to false/true via useState, so no
    // synchronous reset is needed here (that triggers react-hooks/set-state-in-effect).
    let audio: HTMLAudioElement | null = null;
    const timers: number[] = [];

    const finish = () => {
      setVisible(false);
      onCompleteRef.current();
    };

    if (reduceMotion) {
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

      // Mirrors the original intro: reveal at ~520 ms, remove at ~1900 ms.
      timers.push(window.setTimeout(finish, FINISH_MS));
    }

    return () => {
      timers.forEach(window.clearTimeout);

      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [reduceMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="solo-leveling-intro"
          role="status"
          aria-label={t('statusAria')}
          aria-live="polite"
          className={`${systemFont.className} sl-intro ${isLight ? 'sl-theme-light' : ''} fixed inset-0 z-[9999] overflow-hidden text-white`}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.08 : 0.28 }}
        >
          <motion.div
            aria-hidden="true"
            className="sl-backdrop absolute inset-0"
            animate={{ opacity: revealed ? 0 : 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.72, delay: revealed ? 0.28 : 0 }}
          >
            <MatrixRain active={!reduceMotion} light={isLight} />
          </motion.div>

          <motion.div
            aria-hidden="true"
            className="sl-panel sl-panel-top absolute left-[-6vw] top-[-4vh] h-[58vh] w-[112vw]"
            animate={{ y: revealed ? '-112%' : '0%' }}
            transition={{ duration: reduceMotion ? 0 : 1, ease: PANEL_EASE }}
          >
            <div className="sl-panel-runes" />
            <div className="sl-panel-fractures" />
          </motion.div>

          <motion.div
            aria-hidden="true"
            className="sl-panel sl-panel-bottom absolute bottom-[-4vh] left-[-6vw] h-[58vh] w-[112vw]"
            animate={{ y: revealed ? '112%' : '0%' }}
            transition={{ duration: reduceMotion ? 0 : 1, ease: PANEL_EASE }}
          >
            <div className="sl-panel-runes sl-panel-runes-reverse" />
            <div className="sl-panel-fractures sl-panel-fractures-reverse" />
          </motion.div>

          <div className="sl-intro-card absolute inset-0 z-10 grid place-items-center px-5">
            {/* HUD frame: draws in as a line → box (LO's `hud` keyframe), then
                reverse-collapses box → line on close. */}
            <motion.div
              className="sl-glass-shell sl-hud-frame w-[min(590px,86vw)] -skew-x-[4deg]"
              style={{ transformOrigin: 'center' }}
              initial={reduceMotion ? false : { scaleX: 0, scaleY: 0, opacity: 0 }}
              animate={
                reduceMotion
                  ? { scaleX: 1, scaleY: 1, opacity: 1 }
                  : revealed
                    ? { scaleX: [1, 1, 0], scaleY: [1, 0, 0], opacity: [1, 1, 0] }
                    : { scaleX: [0, 1, 1], scaleY: [0, 0, 1], opacity: 1 }
              }
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: revealed ? 0.55 : 0.8, ease: PANEL_EASE, times: [0, 0.5, 1] }
              }
            >
              <motion.div
                className="sl-glass relative overflow-hidden px-6 py-7 text-center sm:px-10 sm:py-9"
                animate={{ opacity: reduceMotion ? 1 : revealed ? 0 : 1 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.32,
                  delay: reduceMotion ? 0 : revealed ? 0 : 0.55,
                }}
              >
                <div aria-hidden="true" className="sl-scan absolute inset-0" />
                <div aria-hidden="true" className="sl-corner sl-corner-tl" />
                <div aria-hidden="true" className="sl-corner sl-corner-tr" />
                <div aria-hidden="true" className="sl-corner sl-corner-bl" />
                <div aria-hidden="true" className="sl-corner sl-corner-br" />

                <p className="sl-system-label mb-3 flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[0.34em] sm:text-[10px]">
                  <span>{t('authorization')}</span>
                  <span className={`${koreanFont.className} sl-kr`}>각성</span>
                </p>

                <h1
                  className={`${displayFont.className} sl-title relative m-0 uppercase`}
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

          <style jsx>{`
            .sl-intro {
              pointer-events: none;
              isolation: isolate;
              /* Theme accents — purple + blue, shared by dark & light. */
              --sl-purple: #6f32ff;
              --sl-purple-hot: #965dff;
              --sl-blue: #3cc8ff;
            }

            .sl-backdrop {
              background:
                radial-gradient(circle at 50% 49%, rgba(60, 200, 255, 0.16), transparent 30%),
                radial-gradient(circle at 50% 60%, rgba(111, 50, 255, 0.18), transparent 42%),
                #04030b;
            }

            .sl-theme-light .sl-backdrop {
              background:
                radial-gradient(circle at 50% 49%, rgba(60, 200, 255, 0.24), transparent 32%),
                radial-gradient(circle at 50% 60%, rgba(111, 50, 255, 0.26), transparent 44%),
                #0a0b23;
            }

            .sl-matrix {
              opacity: 0.5;
              mix-blend-mode: screen;
            }

            .sl-theme-light .sl-matrix {
              opacity: 0.62;
            }

            .sl-panel {
              z-index: 5;
              overflow: hidden;
              background:
                radial-gradient(circle at 21% 28%, rgba(219, 236, 255, 0.19) 0 1px, transparent 2px),
                radial-gradient(circle at 74% 63%, rgba(115, 178, 255, 0.14) 0 1px, transparent 2px),
                linear-gradient(108deg, #090711 0%, #160c2e 34%, #3b1682 68%, #120923 100%);
              background-size: 19px 19px, 23px 23px, auto;
              box-shadow:
                0 0 90px rgba(111, 50, 255, 0.38),
                inset 0 0 90px rgba(1, 5, 20, 0.62);
            }

            .sl-panel::before {
              content: '';
              position: absolute;
              inset: 0;
              background:
                linear-gradient(104deg, transparent 0 43%, rgba(105, 210, 255, 0.22) 43.25%, transparent 43.7%),
                linear-gradient(72deg, transparent 0 61%, rgba(170, 122, 255, 0.18) 61.25%, transparent 61.65%),
                repeating-linear-gradient(117deg, transparent 0 22px, rgba(195, 221, 255, 0.055) 23px, transparent 24px 48px);
              mix-blend-mode: screen;
            }

            .sl-panel::after {
              content: '';
              position: absolute;
              inset: 0;
              background: radial-gradient(circle at center, transparent 42%, rgba(0, 0, 0, 0.42) 100%);
            }

            .sl-panel-top {
              clip-path: polygon(
                0 0,
                100% 0,
                100% 86%,
                92% 91%,
                82% 84%,
                71% 94%,
                58% 87%,
                46% 96%,
                32% 86%,
                18% 94%,
                0 88%
              );
            }

            .sl-panel-bottom {
              clip-path: polygon(
                0 12%,
                13% 5%,
                26% 15%,
                39% 6%,
                51% 14%,
                64% 4%,
                76% 13%,
                90% 6%,
                100% 15%,
                100% 100%,
                0 100%
              );
            }

            .sl-panel-runes {
              position: absolute;
              inset: -20%;
              opacity: 0.34;
              background-image:
                linear-gradient(90deg, transparent 49.55%, rgba(98, 199, 255, 0.22) 50%, transparent 50.45%),
                linear-gradient(0deg, transparent 49.55%, rgba(130, 109, 255, 0.16) 50%, transparent 50.45%),
                radial-gradient(circle, transparent 57%, rgba(168, 132, 255, 0.25) 57.6%, transparent 58.4%);
              background-size: 124px 124px, 124px 124px, 236px 236px;
              animation: sl-rune-drift 8s linear infinite;
            }

            .sl-panel-runes-reverse {
              animation-direction: reverse;
            }

            .sl-panel-fractures {
              position: absolute;
              inset: 0;
              opacity: 0.42;
              background:
                linear-gradient(118deg, transparent 0 19%, rgba(174, 226, 255, 0.28) 19.2%, transparent 19.55%),
                linear-gradient(67deg, transparent 0 77%, rgba(174, 135, 255, 0.25) 77.2%, transparent 77.55%);
              filter: drop-shadow(0 0 8px rgba(99, 190, 255, 0.6));
            }

            .sl-panel-fractures-reverse {
              transform: scaleX(-1);
            }

            .sl-glass-shell {
              filter: drop-shadow(0 25px 70px rgba(0, 0, 0, 0.62));
            }

            /* Bright neon edge so the flat line (scaleY ~0) reads as a HUD scan
               bar while the frame draws in and reverse-collapses out. */
            .sl-hud-frame {
              will-change: transform, opacity;
              box-shadow:
                0 0 22px rgba(60, 200, 255, 0.55),
                0 0 44px rgba(111, 50, 255, 0.4);
              border-radius: 10px;
            }

            .sl-glass {
              border: 1px solid rgba(181, 218, 255, 0.38);
              background:
                linear-gradient(135deg, rgba(37, 67, 133, 0.15), transparent 37%),
                linear-gradient(315deg, rgba(119, 74, 215, 0.18), transparent 43%),
                rgba(3, 7, 22, 0.68);
              box-shadow:
                0 0 0 1px rgba(89, 154, 255, 0.08),
                0 0 58px rgba(79, 85, 228, 0.28),
                inset 0 0 60px rgba(27, 55, 119, 0.24);
              backdrop-filter: blur(18px) saturate(1.25);
              clip-path: polygon(0 0, 95% 0, 100% 12%, 100% 100%, 5% 100%, 0 88%);
            }

            .sl-theme-light .sl-glass {
              background:
                linear-gradient(135deg, rgba(60, 200, 255, 0.16), transparent 37%),
                linear-gradient(315deg, rgba(150, 93, 255, 0.2), transparent 43%),
                rgba(6, 10, 32, 0.6);
            }

            .sl-scan {
              opacity: 0.35;
              background:
                linear-gradient(100deg, transparent 0 38%, rgba(106, 210, 255, 0.13) 39%, transparent 40% 72%, rgba(154, 105, 255, 0.1) 73%, transparent 74%),
                repeating-linear-gradient(to bottom, transparent 0 4px, rgba(112, 161, 255, 0.035) 5px, transparent 6px);
              animation: sl-scan-shift 2.8s linear infinite;
            }

            .sl-corner {
              position: absolute;
              width: 28px;
              height: 28px;
              border-color: rgba(122, 190, 255, 0.86);
              filter: drop-shadow(0 0 7px rgba(97, 176, 255, 0.8));
            }

            .sl-corner-tl {
              left: 8px;
              top: 8px;
              border-left: 2px solid;
              border-top: 2px solid;
            }

            .sl-corner-tr {
              right: 8px;
              top: 8px;
              border-right: 2px solid;
              border-top: 2px solid;
            }

            .sl-corner-bl {
              bottom: 8px;
              left: 8px;
              border-bottom: 2px solid;
              border-left: 2px solid;
            }

            .sl-corner-br {
              right: 8px;
              bottom: 8px;
              border-right: 2px solid;
              border-bottom: 2px solid;
            }

            .sl-system-label {
              color: rgba(123, 207, 255, 0.74);
              text-shadow: 0 0 12px rgba(86, 179, 255, 0.45);
            }

            .sl-kr {
              color: var(--sl-blue);
              letter-spacing: 0.1em;
              text-shadow: 0 0 12px rgba(60, 200, 255, 0.55);
            }

            .sl-title {
              font-style: italic;
              font-size: clamp(4rem, 11vw, 8.6rem);
              line-height: 0.72;
              letter-spacing: -0.035em;
              text-shadow: 0 8px 28px rgba(0, 0, 0, 0.88);
            }

            .sl-title::after {
              content: '';
              position: absolute;
              left: 7%;
              right: 3%;
              top: 54%;
              height: 2px;
              background: linear-gradient(90deg, transparent, rgba(116, 205, 255, 0.86), rgba(160, 111, 255, 0.85), transparent);
              box-shadow: 0 0 15px rgba(112, 179, 255, 0.85);
              transform: skewX(-24deg) rotate(-3deg);
            }

            .sl-title-solo {
              color: #eef6ff;
              -webkit-text-stroke: 1px rgba(160, 204, 255, 0.18);
            }

            .sl-title-leveling {
              margin-top: 0.04em;
              color: transparent;
              background: linear-gradient(90deg, var(--sl-blue) 0%, #b7d8ff 31%, var(--sl-purple-hot) 68%, #d7c8ff 100%);
              background-clip: text;
              -webkit-background-clip: text;
              filter: drop-shadow(0 0 15px rgba(107, 103, 255, 0.55));
            }

            .sl-divider {
              background: linear-gradient(90deg, transparent, rgba(104, 201, 255, 0.82), rgba(142, 104, 255, 0.82), transparent);
              box-shadow: 0 0 11px rgba(96, 170, 255, 0.55);
            }

            .sl-typeline {
              color: rgba(231, 239, 255, 0.82);
              text-shadow: 0 0 13px rgba(114, 98, 255, 0.48);
              min-height: 1.2em;
            }

            .sl-cursor {
              display: inline-block;
              width: 0.62em;
              height: 1.05em;
              margin-left: 0.15em;
              vertical-align: -0.16em;
              background: var(--sl-blue);
              box-shadow: 0 0 10px rgba(60, 200, 255, 0.85);
              animation: sl-blink 0.9s steps(1) infinite;
            }

            .sl-status-dot {
              width: 5px;
              height: 5px;
              border-radius: 999px;
              background: #83d9ff;
              box-shadow: 0 0 10px rgba(92, 199, 255, 0.95);
              animation: sl-pulse 1.1s ease-in-out infinite;
            }

            .sl-status-line {
              width: clamp(22px, 7vw, 48px);
              height: 1px;
              background: linear-gradient(90deg, transparent, rgba(110, 202, 255, 0.55));
            }

            .sl-status-line-reverse {
              transform: scaleX(-1);
            }

            .sl-status-code {
              color: rgba(146, 193, 235, 0.58);
            }

            @keyframes sl-rune-drift {
              to {
                background-position: 124px 124px, -124px 124px, 236px -236px;
              }
            }

            @keyframes sl-scan-shift {
              from {
                background-position: -220px 0, 0 0;
              }
              to {
                background-position: 420px 0, 0 0;
              }
            }

            @keyframes sl-pulse {
              50% {
                opacity: 0.36;
                transform: scale(0.72);
              }
            }

            @keyframes sl-blink {
              50% {
                opacity: 0;
              }
            }

            @media (max-width: 640px) {
              .sl-glass {
                clip-path: polygon(0 0, 92% 0, 100% 9%, 100% 100%, 8% 100%, 0 91%);
              }

              .sl-title::after {
                left: 3%;
                right: 0;
              }
            }

            @media (prefers-reduced-motion: reduce) {
              .sl-panel-runes,
              .sl-scan,
              .sl-status-dot,
              .sl-cursor {
                animation: none;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
