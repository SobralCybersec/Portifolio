'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TokyoGhoulBootProps {
  onComplete: () => void;
}

type Phase = 'idle' | 'lines' | 'open' | 'hold' | 'closing' | 'done';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function TokyoGhoulBoot({ onComplete }: TokyoGhoulBootProps) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const ran = useRef(false);

  // Tokyo Ghoul palette — deep crimson on near-black
  const red    = '#cc0000';
  const redDim = '#aa0000';
  const bg     = '#0a0000';
  const cardBg = 'rgba(8,0,0,0.97)';

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    setMounted(true);

    (async () => {
      await sleep(100);
      setPhase('lines');
      await sleep(700);
      setPhase('open');
      const audio = new Audio('/sounds/pop.mov');
      audio.volume = 1.0;
      audio.play().catch(() => {});
      await sleep(4150);
      setPhase('closing');
      await sleep(700);
      setPhase('done');
    })();
  }, []);

  useEffect(() => {
    if (phase === 'done') onComplete();
  }, [phase, onComplete]);

  const shouldRender    = !mounted || phase !== 'done';
  const linesExpanded   = phase === 'open' || phase === 'hold' || phase === 'closing';
  const cardVisible     = phase === 'open' || phase === 'hold';
  const footerVisible   = phase === 'open' || phase === 'hold';

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          key="tg-boot"
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ background: bg }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Background layers */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 100% 60% at 50% 110%, rgba(120,0,0,0.15) 0%, transparent 65%),
                radial-gradient(ellipse 60% 40% at 80% 10%, rgba(80,0,0,0.1) 0%, transparent 60%)
              `,
            }}
          />
          {/* Film-grain noise */}
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.2'/%3E%3C/svg%3E")`,
            }}
          />
          {/* Scanlines */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, ${red}08 3px, ${red}08 4px)`,
            }}
          />
          {/* Vignette */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)' }}
          />

          {/* Scene */}
          <div className="relative flex w-[min(92vw,460px)] flex-col items-center">

            {/* Top line */}
            <motion.div
              className="rounded-full"
              style={{
                height: 1,
                background: `linear-gradient(90deg, transparent, ${red}, #ff2200, ${red}, transparent)`,
                boxShadow: `0 0 8px ${red}99`,
                originX: 0.5,
              }}
              animate={{
                width: linesExpanded ? '100%' : 3,
                opacity: phase === 'idle' ? 0 : phase === 'done' ? 0 : 1,
              }}
              transition={{ duration: linesExpanded ? 0.7 : 0.45, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Card */}
            <motion.div
              className="w-full overflow-hidden"
              style={{
                border: `1px solid ${red}44`,
                background: cardBg,
                boxShadow: `0 0 0 1px ${red}22, 0 0 40px ${red}18, inset 0 0 80px rgba(50,0,0,0.4)`,
                borderRadius: 1,
              }}
              animate={{
                clipPath: cardVisible
                  ? 'inset(0% 0% 0% 0% round 1px)'
                  : 'inset(48% 0% 48% 0% round 1px)',
                opacity: cardVisible ? 1 : 0,
                scale:   cardVisible ? 1 : 0.97,
              }}
              initial={{ clipPath: 'inset(48% 0% 48% 0% round 1px)', opacity: 0, scale: 0.97 }}
              transition={{
                duration: cardVisible ? 0.75 : 0.65,
                ease: cardVisible ? [0.16, 1, 0.3, 1] : [0.7, 0, 1, 1],
              }}
            >
              {/* Scan beam */}
              <motion.div
                className="pointer-events-none absolute left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${red}88, transparent)` }}
                animate={{ top: ['-2px', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />

              {/* Corner pieces */}
              {[
                { pos: '-top-[2px] -left-[2px]',    bw: '2px 0 0 2px', dot: '-top-px -left-px'    },
                { pos: '-top-[2px] -right-[2px]',   bw: '2px 2px 0 0', dot: '-top-px -right-px'   },
                { pos: '-bottom-[2px] -left-[2px]',  bw: '0 0 2px 2px', dot: '-bottom-px -left-px'  },
                { pos: '-bottom-[2px] -right-[2px]', bw: '0 2px 2px 0', dot: '-bottom-px -right-px' },
              ].map((c, i) => (
                <div key={i} className={`absolute ${c.pos} h-[18px] w-[18px]`}
                  style={{ borderStyle: 'solid', borderWidth: c.bw, borderColor: redDim }}>
                  <div className={`absolute ${c.dot} h-[5px] w-[5px]`}
                    style={{ background: red, boxShadow: `0 0 8px 2px ${red}cc` }} />
                </div>
              ))}

              {/* ── Header ── */}
              <div className="relative flex items-center border-b" style={{ borderColor: `${red}33` }}>
                <div className="absolute -bottom-px left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${red}bb, transparent)` }} />

                {/* Kakugan icon */}
                <div
                  className="flex h-[58px] w-[58px] flex-shrink-0 items-center justify-center border-r"
                  style={{ borderColor: `${red}33`, background: 'rgba(40,0,0,0.5)' }}
                >
                  <motion.div
                    className="relative flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 overflow-hidden"
                    style={{
                      borderColor: red,
                      background: 'radial-gradient(circle at 40% 35%, #3a0000, #0a0000)',
                    }}
                    animate={{ boxShadow: [
                      `0 0 10px ${red}aa, inset 0 0 8px #aa000033`,
                      `0 0 22px ${red}ee, inset 0 0 16px #cc000055`,
                      `0 0 10px ${red}aa, inset 0 0 8px #aa000033`,
                    ]}}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {/* Pupil */}
                    <div className="absolute h-[10px] w-[10px] rounded-full"
                      style={{ background: red, boxShadow: `0 0 8px #ff0000, 0 0 16px ${red}` }} />
                    {/* Sheen */}
                    <div className="absolute inset-0 rounded-full"
                      style={{ background: 'radial-gradient(ellipse at 30% 25%, rgba(180,0,0,0.3), transparent 60%)' }} />
                  </motion.div>
                </div>

                {/* Title */}
                <div
                  className="relative mx-3 my-2.5 flex flex-1 items-center border px-4 py-2"
                  style={{ borderColor: `${red}33`, background: 'rgba(20,0,0,0.3)' }}
                >
                  <div className="absolute -bottom-px -left-px -top-px w-[2px]"
                    style={{ background: redDim, boxShadow: `0 0 6px ${red}bb` }} />
                  <div className="absolute -bottom-px -right-px -top-px w-[2px]"
                    style={{ background: redDim, boxShadow: `0 0 6px ${red}bb` }} />
                  <span
                    className="font-black uppercase leading-none"
                    style={{
                      fontFamily: 'Cinzel, Georgia, serif',
                      fontSize: 11,
                      letterSpacing: '5px',
                      color: '#e8c0c0',
                      textShadow: `0 0 8px ${red}cc`,
                    }}
                  >
                    System Notification
                  </span>
                </div>
              </div>

              {/* ── Body ── */}
              <div className="px-6 pb-4 pt-5">
                <p
                  className="mb-4 text-center"
                  style={{
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: 12,
                    letterSpacing: '2px',
                    color: 'rgba(200,140,140,0.75)',
                  }}
                >
                  Your nature has changed
                </p>

                {/* From box */}
                <div
                  className="relative px-5 py-2 text-center"
                  style={{ border: `1px solid ${red}44`, background: 'rgba(10,0,0,0.8)' }}
                >
                  <div className="absolute bottom-0 left-0 top-0 w-[2px]" style={{ background: `${red}66` }} />
                  <div className="absolute bottom-0 right-0 top-0 w-[2px]" style={{ background: `${red}66` }} />
                  <span
                    style={{
                      fontFamily: 'Cinzel, Georgia, serif',
                      fontSize: 14,
                      letterSpacing: '3px',
                      color: 'rgba(180,120,120,0.85)',
                    }}
                  >
                    [ Human ]
                  </span>
                </div>

                {/* Arrows */}
                <div className="flex flex-col items-center gap-0 py-2.5">
                  {[0, 0.18, 0.36].map((delay, i) => (
                    <motion.div
                      key={i}
                      className="h-2.5 w-5"
                      style={{
                        clipPath: 'polygon(0 0,50% 100%,100% 0)',
                        background: red,
                        opacity: i === 0 ? 0.4 : i === 1 ? 0.7 : 1,
                      }}
                      animate={{ filter: ['brightness(0.8)', 'brightness(1.8)', 'brightness(0.8)'] }}
                      transition={{ duration: 1.4, repeat: Infinity, delay }}
                    />
                  ))}
                </div>

                {/* To box */}
                <motion.div
                  className="relative overflow-hidden px-5 py-3 text-center"
                  style={{ border: '1px solid rgba(180,0,0,0.55)', background: 'rgba(12,0,0,0.92)' }}
                  animate={{ boxShadow: [
                    '0 0 20px rgba(180,0,0,0.2), inset 0 0 30px rgba(120,0,0,0.08)',
                    '0 0 40px rgba(200,0,0,0.5), inset 0 0 50px rgba(140,0,0,0.18)',
                    '0 0 20px rgba(180,0,0,0.2), inset 0 0 30px rgba(120,0,0,0.08)',
                  ]}}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {/* Sweep shimmer */}
                  <motion.div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(90deg,transparent,rgba(180,0,0,0.1),transparent)' }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                  {/* Corner accents */}
                  {[
                    { pos: '-top-px -left-px',    bw: '2px 0 0 2px'   },
                    { pos: '-top-px -right-px',   bw: '2px 2px 0 0'   },
                    { pos: '-bottom-px -left-px',  bw: '0 0 2px 2px'  },
                    { pos: '-bottom-px -right-px', bw: '0 2px 2px 0'  },
                  ].map((t, i) => (
                    <motion.div
                      key={i}
                      className={`absolute ${t.pos} h-2 w-2`}
                      style={{ borderStyle: 'solid', borderWidth: t.bw, borderColor: red }}
                      animate={{ boxShadow: [
                        `0 0 6px rgba(180,0,0,0.6)`,
                        `0 0 12px rgba(220,0,0,1)`,
                        `0 0 6px rgba(180,0,0,0.6)`,
                      ]}}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                  {/* Side glows */}
                  {(['left','right'] as const).map((side) => (
                    <motion.div
                      key={side}
                      className={`absolute bottom-0 ${side === 'left' ? 'left-0' : 'right-0'} top-0 w-[2px]`}
                      style={{ background: 'linear-gradient(180deg,transparent,#cc0000,transparent)' }}
                      animate={{ boxShadow: [
                        '0 0 8px rgba(180,0,0,0.6)',
                        '0 0 18px rgba(220,0,0,1)',
                        '0 0 8px rgba(180,0,0,0.6)',
                      ]}}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  ))}
                  {/* Label */}
                  <motion.span
                    className="relative font-black"
                    style={{
                      fontFamily: 'Cinzel, Georgia, serif',
                      fontSize: 20,
                      letterSpacing: '3px',
                      color: red,
                    }}
                    animate={{ textShadow: [
                      `0 0 8px rgba(200,0,0,1), 0 0 20px rgba(180,0,0,0.7), 0 0 40px rgba(140,0,0,0.4)`,
                      `0 0 16px rgba(220,0,0,1), 0 0 40px rgba(200,0,0,1), 0 0 80px rgba(160,0,0,0.7)`,
                      `0 0 8px rgba(200,0,0,1), 0 0 20px rgba(180,0,0,0.7), 0 0 40px rgba(140,0,0,0.4)`,
                    ]}}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    [ One-Eyed Ghoul ]
                  </motion.span>
                </motion.div>

                {/* Flavour text */}
                <p
                  className="mt-2.5 text-center"
                  style={{
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: 9,
                    letterSpacing: '3px',
                    color: 'rgba(160,60,60,0.5)',
                  }}
                >
                  — kakuhou awakened — rc cells active —
                </p>
              </div>

              {/* ── Footer ── */}
              <div
                className="flex items-center justify-between border-t px-4 py-1.5"
                style={{ borderColor: `${red}22`, background: 'rgba(6,0,0,0.5)' }}
              >
                <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 7, letterSpacing: '2px', color: `${redDim}80` }}>
                  CCG-REC / CLASS-S / PRIORITY-OMEGA
                </span>
                <div className="flex items-center gap-1.5">
                  {[0, 0.3, 0.6].map((delay, i) => (
                    <motion.div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: redDim, boxShadow: `0 0 5px ${redDim}cc` }}
                      animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Bottom line */}
            <motion.div
              className="rounded-full"
              style={{
                height: 1,
                background: `linear-gradient(90deg, transparent, ${red}, #ff2200, ${red}, transparent)`,
                boxShadow: `0 0 8px ${red}99`,
                originX: 0.5,
              }}
              animate={{
                width: linesExpanded ? '100%' : 3,
                opacity: phase === 'idle' ? 0 : phase === 'done' ? 0 : 1,
              }}
              transition={{ duration: linesExpanded ? 0.7 : 0.45, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {/* Footer label */}
          <motion.div
            className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2"
            animate={{ opacity: footerVisible ? 1 : 0 }}
            transition={{ duration: 0.35 }}
          >
            <span
              className="uppercase"
              style={{
                fontFamily: 'ui-monospace,monospace',
                fontSize: 8,
                letterSpacing: '5px',
                color: 'rgba(140,0,0,0.55)',
              }}
            >
              kaneki ken awakening protocol
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}