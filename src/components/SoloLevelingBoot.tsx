'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Orbitron, Rajdhani, Teko } from 'next/font/google';

interface SoloLevelingBootProps {
  onComplete: () => void;
}

type Phase = 'idle' | 'seal' | 'opening' | 'hold' | 'closing' | 'done';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  display: 'swap',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const teko = Teko({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
});

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

const PANEL_EASE = [0.78, 0, 0.2, 1] as const;
const UI_EASE = [0.16, 1, 0.3, 1] as const;

export default function SoloLevelingBoot({ onComplete }: SoloLevelingBootProps) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const ran = useRef(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    setMounted(true);

    let cancelled = false;
    let audio: HTMLAudioElement | null = null;

    const run = async () => {
      if (reduceMotion) {
        setPhase('hold');
        await sleep(900);
        if (!cancelled) setPhase('done');
        return;
      }

      await sleep(120);
      if (cancelled) return;
      setPhase('seal');

      await sleep(620);
      if (cancelled) return;
      setPhase('opening');

      audio = new Audio('/sounds/pop.mov');
      audio.volume = 0.75;
      void audio.play().catch(() => undefined);

      await sleep(1100);
      if (cancelled) return;
      setPhase('hold');

      await sleep(3150);
      if (cancelled) return;
      setPhase('closing');

      await sleep(850);
      if (!cancelled) setPhase('done');
    };

    void run();

    return () => {
      cancelled = true;
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (phase === 'done') onComplete();
  }, [phase, onComplete]);

  const shouldRender = !mounted || phase !== 'done';
  const panelsOpened = phase === 'opening' || phase === 'hold' || phase === 'closing';
  const notificationVisible = phase === 'opening' || phase === 'hold';
  const sealVisible = phase === 'seal' || phase === 'opening';

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          key="solo-leveling-boot"
          role="dialog"
          aria-label="Shadow Monarch system initialization"
          aria-live="polite"
          className={`${rajdhani.className} fixed inset-0 z-[9999] overflow-hidden bg-[#02020a] text-white`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'brightness(1.7) blur(10px)' }}
          transition={{ duration: reduceMotion ? 0.1 : 0.45 }}
        >
          {/* Ambient world */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_54%,rgba(119,58,255,0.19),transparent_31%),radial-gradient(circle_at_18%_18%,rgba(0,174,255,0.1),transparent_26%),linear-gradient(180deg,#02020a_0%,#06091a_58%,#020207_100%)]" />
          <div className="sl-grid pointer-events-none absolute inset-0 opacity-25" />
          <div className="sl-scanlines pointer-events-none absolute inset-0 opacity-40" />
          <div className="sl-vignette pointer-events-none absolute inset-0" />

          {/* Shadow particles */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 26 }).map((_, index) => {
              const left = `${(index * 37) % 101}%`;
              const delay = (index % 9) * 0.23;
              const duration = 3.6 + (index % 7) * 0.42;
              const size = 2 + (index % 4);

              return (
                <motion.span
                  key={index}
                  className="absolute bottom-[-8%] rounded-full bg-[#8b5cff]"
                  style={{
                    left,
                    width: size,
                    height: size,
                    boxShadow: '0 0 12px rgba(139,92,255,.9)',
                  }}
                  animate={
                    reduceMotion
                      ? { opacity: 0.25 }
                      : {
                          y: ['0vh', '-112vh'],
                          x: [0, index % 2 === 0 ? 20 : -18, 0],
                          opacity: [0, 0.85, 0],
                          scale: [0.4, 1.1, 0.2],
                        }
                  }
                  transition={{ duration, repeat: Infinity, delay, ease: 'linear' }}
                />
              );
            })}
          </div>

          {/* Bleach-inspired split intro, rebuilt as a Solo Leveling shadow gate */}
          <motion.div
            aria-hidden="true"
            className="sl-gate-panel sl-gate-panel-top pointer-events-none absolute left-[-6vw] top-[-4vh] z-20 h-[58vh] w-[112vw]"
            animate={{ y: panelsOpened ? '-116%' : '0%' }}
            transition={{ duration: reduceMotion ? 0 : 1.05, ease: PANEL_EASE }}
          >
            <div className="sl-gate-runes sl-gate-runes-top" />
          </motion.div>

          <motion.div
            aria-hidden="true"
            className="sl-gate-panel sl-gate-panel-bottom pointer-events-none absolute bottom-[-4vh] left-[-6vw] z-20 h-[58vh] w-[112vw]"
            animate={{ y: panelsOpened ? '116%' : '0%' }}
            transition={{ duration: reduceMotion ? 0 : 1.05, ease: PANEL_EASE }}
          >
            <div className="sl-gate-runes sl-gate-runes-bottom" />
          </motion.div>

          {/* Central awakening seal */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 z-30 h-[min(46vw,230px)] w-[min(46vw,230px)] -translate-x-1/2 -translate-y-1/2"
            animate={{
              opacity: sealVisible ? 1 : 0,
              scale: sealVisible ? 1 : 0.72,
              rotate: reduceMotion ? 0 : [0, 24, 48],
            }}
            transition={{
              opacity: { duration: 0.32 },
              scale: { duration: 0.65, ease: UI_EASE },
              rotate: { duration: 6, repeat: Infinity, ease: 'linear' },
            }}
          >
            <div className="sl-seal-ring absolute inset-0 rounded-full" />
            <div className="sl-seal-ring sl-seal-ring-inner absolute inset-[14%] rounded-full" />
            <div className="absolute inset-[31%] rotate-45 border border-[#a879ff]/80 shadow-[0_0_35px_rgba(145,89,255,0.72)]" />
            <div className="absolute inset-0 grid place-items-center">
              <span className={`${teko.className} text-[clamp(2.4rem,8vw,4.6rem)] font-semibold leading-none tracking-[0.08em] text-[#d9c9ff] drop-shadow-[0_0_18px_rgba(146,88,255,1)]`}>
                ARISE
              </span>
            </div>
          </motion.div>

          {/* System notification */}
          <div className="absolute inset-0 z-40 flex items-center justify-center px-4 py-8">
            <motion.section
              className="sl-system-card relative w-[min(92vw,620px)] overflow-hidden border border-[#8b5cff]/45 bg-[rgba(3,5,18,0.78)] px-5 py-5 backdrop-blur-2xl sm:px-8 sm:py-7"
              initial={{ opacity: 0, scale: 0.92, clipPath: 'inset(49% 0 49% 0)' }}
              animate={{
                opacity: notificationVisible ? 1 : 0,
                scale: notificationVisible ? 1 : 0.94,
                y: notificationVisible ? 0 : phase === 'closing' ? -24 : 0,
                clipPath: notificationVisible
                  ? 'inset(0% 0 0% 0% round 2px)'
                  : 'inset(49% 0 49% 0 round 2px)',
              }}
              transition={{ duration: reduceMotion ? 0 : 0.72, ease: UI_EASE }}
            >
              <div className="sl-card-sheen pointer-events-none absolute inset-0" />
              <motion.div
                className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#61d8ff,#a967ff,transparent)]"
                animate={reduceMotion ? undefined : { y: [0, 420] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'linear' }}
              />

              {[
                'left-[-1px] top-[-1px] border-l-2 border-t-2',
                'right-[-1px] top-[-1px] border-r-2 border-t-2',
                'bottom-[-1px] left-[-1px] border-b-2 border-l-2',
                'bottom-[-1px] right-[-1px] border-b-2 border-r-2',
              ].map((position) => (
                <span
                  key={position}
                  className={`absolute h-8 w-8 border-[#9f6cff] ${position}`}
                  style={{ filter: 'drop-shadow(0 0 8px rgba(159,108,255,.85))' }}
                />
              ))}

              <header className="relative flex items-center gap-4 border-b border-[#7d5cff]/30 pb-4">
                <motion.div
                  className="grid h-14 w-14 shrink-0 place-items-center border border-[#6bdcff]/65 bg-[rgba(7,20,52,0.65)]"
                  style={{ clipPath: 'polygon(14% 0,100% 0,100% 72%,74% 100%,0 100%,0 18%)' }}
                  animate={reduceMotion ? undefined : { boxShadow: ['0 0 14px rgba(80,207,255,.25)', '0 0 32px rgba(126,86,255,.7)', '0 0 14px rgba(80,207,255,.25)'] }}
                  transition={{ duration: 2.1, repeat: Infinity }}
                >
                  <span className={`${orbitron.className} text-2xl font-black text-[#9d75ff] drop-shadow-[0_0_12px_rgba(157,117,255,1)]`}>
                    !
                  </span>
                </motion.div>

                <div className="min-w-0 flex-1">
                  <p className={`${orbitron.className} truncate text-[10px] font-semibold uppercase tracking-[0.34em] text-[#61d8ff]/75 sm:text-xs`}>
                    Player-exclusive interface
                  </p>
                  <h1 className={`${teko.className} mt-1 text-[clamp(2rem,8vw,4rem)] font-semibold uppercase leading-[0.82] tracking-[0.05em] text-white drop-shadow-[0_0_18px_rgba(114,87,255,.82)]`}>
                    System Notification
                  </h1>
                </div>
              </header>

              <div className="relative py-6 text-center sm:py-7">
                <p className={`${rajdhani.className} text-sm font-semibold uppercase tracking-[0.18em] text-[#b8c9ee]/70 sm:text-base`}>
                  Class advancement completed
                </p>

                <div className="mt-5 grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
                  <div className="sl-rank-card border border-[#4f83c9]/35 bg-[#061025]/75 px-4 py-3">
                    <span className={`${orbitron.className} block text-[8px] uppercase tracking-[0.28em] text-[#6bdcff]/55`}>
                      Previous class
                    </span>
                    <strong className={`${rajdhani.className} mt-1 block text-xl font-bold uppercase tracking-[0.14em] text-[#bad8ff]/75`}>
                      Necromancer
                    </strong>
                  </div>

                  <div className="flex justify-center gap-1 sm:flex-col">
                    {[0, 0.15, 0.3].map((delay, index) => (
                      <motion.span
                        key={delay}
                        className="h-3 w-6 bg-[#a765ff] sm:h-4 sm:w-7"
                        style={{
                          clipPath: index < 3 ? 'polygon(0 0,50% 100%,100% 0)' : undefined,
                          transform: 'rotate(-90deg)',
                        }}
                        animate={reduceMotion ? undefined : { opacity: [0.28, 1, 0.28], filter: ['brightness(.8)', 'brightness(1.8)', 'brightness(.8)'] }}
                        transition={{ duration: 1.35, repeat: Infinity, delay }}
                      />
                    ))}
                  </div>

                  <motion.div
                    className="sl-rank-card relative overflow-hidden border border-[#a765ff]/65 bg-[#100620]/85 px-4 py-3"
                    animate={reduceMotion ? undefined : { boxShadow: ['0 0 20px rgba(167,101,255,.18)', '0 0 44px rgba(167,101,255,.48)', '0 0 20px rgba(167,101,255,.18)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-[linear-gradient(100deg,transparent,rgba(174,116,255,0.18),transparent)]"
                      animate={reduceMotion ? undefined : { x: ['-120%', '180%'] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
                    />
                    <span className={`${orbitron.className} relative block text-[8px] uppercase tracking-[0.28em] text-[#c7a9ff]/65`}>
                      Advanced class
                    </span>
                    <strong className={`${teko.className} relative mt-1 block text-[clamp(1.9rem,7vw,3rem)] font-semibold uppercase leading-none tracking-[0.08em] text-[#b783ff] drop-shadow-[0_0_15px_rgba(178,119,255,.95)]`}>
                      Shadow Monarch
                    </strong>
                  </motion.div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-3 text-[#8ea6d5]/55">
                  <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#7b5cff]" />
                  <span className={`${orbitron.className} text-[8px] uppercase tracking-[0.34em] sm:text-[9px]`}>
                    Authority acknowledged
                  </span>
                  <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#7b5cff]" />
                </div>
              </div>

              <footer className="relative flex items-center justify-between border-t border-[#7d5cff]/25 pt-4">
                <span className={`${orbitron.className} text-[7px] uppercase tracking-[0.25em] text-[#6bdcff]/40 sm:text-[8px]`}>
                  Player ID · Sung Jinwoo
                </span>
                <div className="flex items-center gap-1.5">
                  {[0, 0.28, 0.56].map((delay) => (
                    <motion.span
                      key={delay}
                      className="h-1.5 w-1.5 rounded-full bg-[#a765ff] shadow-[0_0_8px_rgba(167,101,255,.95)]"
                      animate={reduceMotion ? undefined : { opacity: [0.2, 1, 0.2], scale: [0.8, 1.15, 0.8] }}
                      transition={{ duration: 1.4, repeat: Infinity, delay }}
                    />
                  ))}
                </div>
              </footer>
            </motion.section>
          </div>

          <motion.div
            className={`${orbitron.className} pointer-events-none absolute bottom-5 left-1/2 z-40 -translate-x-1/2 whitespace-nowrap text-[8px] uppercase tracking-[0.42em] text-[#8a74cf]/55 sm:text-[9px]`}
            animate={{ opacity: notificationVisible ? 1 : 0 }}
            transition={{ duration: 0.35 }}
          >
            Shadow Monarch protocol · awakening sequence
          </motion.div>

          <style jsx>{`
            .sl-grid {
              background-image:
                linear-gradient(90deg, rgba(108, 93, 255, 0.08) 1px, transparent 1px),
                linear-gradient(0deg, rgba(57, 194, 255, 0.06) 1px, transparent 1px);
              background-size: 68px 68px;
              transform: perspective(650px) rotateX(63deg) translateY(46%);
              transform-origin: center bottom;
            }

            .sl-scanlines {
              background: repeating-linear-gradient(
                to bottom,
                transparent 0,
                transparent 3px,
                rgba(111, 82, 255, 0.035) 3px,
                rgba(111, 82, 255, 0.035) 4px
              );
            }

            .sl-vignette {
              background:
                radial-gradient(circle at center, transparent 30%, rgba(0, 0, 0, 0.34) 73%, rgba(0, 0, 0, 0.88) 100%),
                linear-gradient(90deg, rgba(0, 0, 0, 0.52), transparent 22%, transparent 78%, rgba(0, 0, 0, 0.52));
            }

            .sl-gate-panel {
              background:
                radial-gradient(circle at 22% 28%, rgba(121, 83, 255, 0.35) 0 1px, transparent 2px),
                repeating-linear-gradient(117deg, transparent 0 23px, rgba(178, 143, 255, 0.08) 24px, transparent 25px 47px),
                linear-gradient(112deg, #09041d, #34106d 42%, #6331c9 69%, #100629);
              background-size: 19px 19px, auto, auto;
              box-shadow: 0 0 120px rgba(126, 76, 255, 0.45);
            }

            .sl-gate-panel-top {
              clip-path: polygon(0 0, 100% 0, 100% 86%, 92% 92%, 82% 84%, 71% 95%, 58% 86%, 45% 96%, 31% 86%, 17% 94%, 0 87%);
            }

            .sl-gate-panel-bottom {
              clip-path: polygon(0 13%, 12% 5%, 25% 15%, 39% 6%, 52% 15%, 65% 4%, 78% 14%, 90% 6%, 100% 15%, 100% 100%, 0 100%);
            }

            .sl-gate-runes {
              position: absolute;
              inset: 0;
              opacity: 0.28;
              background-image:
                linear-gradient(90deg, transparent 49.5%, rgba(126, 224, 255, 0.22) 50%, transparent 50.5%),
                radial-gradient(circle, transparent 58%, rgba(176, 127, 255, 0.22) 59%, transparent 60%);
              background-size: 132px 132px, 230px 230px;
              animation: gateDrift 9s linear infinite;
            }

            .sl-gate-runes-bottom {
              animation-direction: reverse;
            }

            .sl-seal-ring {
              border: 1px solid rgba(169, 121, 255, 0.74);
              box-shadow:
                0 0 22px rgba(128, 78, 255, 0.5),
                inset 0 0 22px rgba(128, 78, 255, 0.36);
              background:
                repeating-conic-gradient(from 0deg, rgba(176, 130, 255, 0.82) 0 1deg, transparent 1deg 13deg),
                radial-gradient(circle, transparent 60%, rgba(94, 213, 255, 0.09) 61%, transparent 64%);
              mask: radial-gradient(circle, transparent 0 57%, #000 58% 66%, transparent 67%);
            }

            .sl-seal-ring-inner {
              opacity: 0.78;
              animation: counterSpin 6s linear infinite;
            }

            .sl-system-card {
              box-shadow:
                0 0 0 1px rgba(95, 214, 255, 0.08),
                0 0 60px rgba(109, 70, 255, 0.26),
                inset 0 0 100px rgba(19, 25, 73, 0.64);
              clip-path: polygon(0 0, 96% 0, 100% 8%, 100% 100%, 4% 100%, 0 92%);
            }

            .sl-card-sheen {
              background:
                linear-gradient(115deg, transparent 0 34%, rgba(112, 219, 255, 0.05) 35%, transparent 36% 65%, rgba(160, 103, 255, 0.07) 66%, transparent 67%),
                repeating-linear-gradient(135deg, transparent 0 28px, rgba(146, 99, 255, 0.035) 29px, transparent 30px 58px);
            }

            .sl-rank-card {
              clip-path: polygon(0 0, 94% 0, 100% 20%, 100% 100%, 6% 100%, 0 80%);
            }

            @keyframes gateDrift {
              to { background-position: 132px 132px, -230px 230px; }
            }

            @keyframes counterSpin {
              to { transform: rotate(-360deg); }
            }

            @media (max-width: 640px) {
              .sl-system-card {
                clip-path: polygon(0 0, 93% 0, 100% 6%, 100% 100%, 7% 100%, 0 94%);
              }
            }

            @media (prefers-reduced-motion: reduce) {
              .sl-gate-runes,
              .sl-seal-ring-inner {
                animation: none;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
