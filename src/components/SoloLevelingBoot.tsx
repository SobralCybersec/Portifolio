'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

interface SoloLevelingBootProps {
  onComplete: () => void;
}

type Phase = 'idle' | 'lines' | 'open' | 'hold' | 'closing' | 'done';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function SoloLevelingBoot({ onComplete }: SoloLevelingBootProps) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const { theme } = useTheme();

  const primary = theme === 'light' ? '#3b82f6' : '#6366f1';
  const accent  = theme === 'light' ? '#1d4ed8' : '#3b82f6';
  const bg      = theme === 'light' ? '#ffffff'  : '#010510';
  const cardBg  = theme === 'light' ? 'rgba(255,255,255,0.96)' : 'rgba(1,6,20,0.96)';

  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    setMounted(true);

    (async () => {
      await sleep(100);
      setPhase('lines');
      await sleep(700);
      setPhase('open');
      // Play notification sound when card opens
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

  // Always render during SSR and initial mount
  const shouldRender = !mounted || phase !== 'done';

  const linesExpanded = phase === 'open' || phase === 'hold' || phase === 'closing';
  const cardVisible   = phase === 'open' || phase === 'hold';
  const footerVisible = phase === 'open' || phase === 'hold';

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          key="boot"
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ background: bg }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* bg layers */}
          <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse 100% 60% at 50% 110%, rgba(0,60,180,0.18) 0%, transparent 65%), radial-gradient(ellipse 60% 40% at 80% 10%, rgba(0,30,100,0.12) 0%, transparent 60%)` }} />
          <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `linear-gradient(90deg,${primary}99 1px,transparent 1px),linear-gradient(0deg,${primary}99 1px,transparent 1px)`, backgroundSize: '60px 60px' }} />
          <div className="pointer-events-none absolute inset-0" style={{ background: `repeating-linear-gradient(to bottom,transparent 0px,transparent 3px,${primary}0a 3px,${primary}0a 4px)` }} />

          {/* scene */}
          <div className="relative flex w-[min(92vw,480px)] flex-col items-center">

            {/* top line */}
            <motion.div
              className="rounded-full"
              style={{ height: 2, background: `${primary}cc`, originX: 0.5 }}
              animate={{ width: linesExpanded ? '100%' : 3, opacity: phase === 'idle' ? 0 : phase === 'done' ? 0 : 1 }}
              transition={{ duration: linesExpanded ? 0.7 : 0.45, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* card */}
            <motion.div
              className="w-full overflow-hidden rounded-[2px]"
              style={{
                border: `1px solid ${primary}59`,
                background: cardBg,
                boxShadow: `0 0 0 1px ${primary}33, 0 0 40px ${primary}1f, inset 0 0 80px rgba(0,30,100,0.35)`,
              }}
              animate={{
                clipPath: cardVisible
                  ? 'inset(0% 0% 0% 0% round 2px)'
                  : 'inset(46% 0% 46% 0% round 2px)',
                opacity: cardVisible ? 1 : 0,
                scale: cardVisible ? 1 : 0.96,
              }}
              initial={{ clipPath: 'inset(46% 0% 46% 0% round 2px)', opacity: 0, scale: 0.96 }}
              transition={{ duration: cardVisible ? 0.75 : 0.65, ease: cardVisible ? [0.16, 1, 0.3, 1] : [0.7, 0, 1, 1] }}
            >
              {/* scanline */}
              <motion.div
                className="pointer-events-none absolute left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg,transparent,${primary}b3,transparent)` }}
                animate={{ top: ['-2px', '100%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />

              {/* edge glows */}
              {(['top','bottom'] as const).map((side) => (
                <div key={side} className={`absolute ${side === 'top' ? '-top-px' : '-bottom-px'} left-[10%] right-[10%] h-px`}
                  style={{ background: `linear-gradient(90deg,transparent,${accent},${primary},${accent},transparent)`, animation: 'edgepulse 2.5s ease-in-out infinite' }} />
              ))}
              {(['left','right'] as const).map((side) => (
                <div key={side} className={`absolute ${side === 'left' ? '-left-px' : '-right-px'} top-[10%] bottom-[10%] w-px`}
                  style={{ background: `linear-gradient(180deg,transparent,${accent},${primary},${accent},transparent)`, animation: 'edgepulse 2.5s ease-in-out infinite' }} />
              ))}

              {/* corners */}
              {[
                { pos: '-top-[3px] -left-[3px]',   bw: '2px 0 0 2px',   dot: '-top-px -left-px'   },
                { pos: '-top-[3px] -right-[3px]',  bw: '2px 2px 0 0',   dot: '-top-px -right-px'  },
                { pos: '-bottom-[3px] -left-[3px]', bw: '0 0 2px 2px',  dot: '-bottom-px -left-px' },
                { pos: '-bottom-[3px] -right-[3px]',bw: '0 2px 2px 0',  dot: '-bottom-px -right-px'},
              ].map((c, i) => (
                <div key={i} className={`absolute ${c.pos} h-5 w-5`} style={{ borderStyle: 'solid', borderWidth: c.bw, borderColor: accent }}>
                  <div className={`absolute ${c.dot} h-1.5 w-1.5`} style={{ background: accent, boxShadow: `0 0 10px 3px ${accent}e6` }} />
                </div>
              ))}

              {/* header row */}
              <div className="relative flex items-center border-b" style={{ borderColor: `${primary}4d` }}>
                <div className="absolute -bottom-px left-0 right-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${accent}e6,transparent)` }} />
                <div className="flex h-[60px] w-[60px] flex-shrink-0 items-center justify-center border-r" style={{ borderColor: `${primary}4d`, background: 'rgba(0,40,100,0.3)' }}>
                  <motion.div
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2"
                    style={{ borderColor: accent, boxShadow: `0 0 12px ${accent}b3, inset 0 0 10px ${accent}26` }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <span className="font-black text-base leading-none" style={{ fontFamily: 'Orbitron,monospace', color: accent, textShadow: `0 0 10px ${accent}` }}>!</span>
                  </motion.div>
                </div>
                <div className="relative mx-[14px] my-2.5 flex flex-1 items-center border px-4 py-2" style={{ borderColor: `${primary}40`, background: 'rgba(0,30,80,0.2)' }}>
                  <div className="absolute -bottom-px -left-px -top-px w-[3px]" style={{ background: accent, boxShadow: `0 0 8px ${accent}cc` }} />
                  <div className="absolute -bottom-px -right-px -top-px w-[3px]" style={{ background: accent, boxShadow: `0 0 8px ${accent}cc` }} />
                  <span className="font-black uppercase leading-none tracking-[6px]" style={{ fontFamily: 'Orbitron,monospace', fontSize: 14, color: '#e0f4ff', textShadow: `0 0 8px ${accent}e6, 0 0 20px ${primary}99` }}>
                    SYSTEM NOTIFICATION
                  </span>
                </div>
              </div>

              {/* body */}
              <div className="px-7 pb-5 pt-6">
                <p className="mb-4 text-center text-[15px] font-medium tracking-[1.5px]" style={{ fontFamily: 'Rajdhani,sans-serif', color: 'rgba(180,220,255,0.8)' }}>
                  Your job has changed
                </p>

                {/* from */}
                <div className="relative mb-1 overflow-hidden border px-5 py-2 text-center" style={{ borderColor: `${primary}66`, background: 'rgba(0,10,30,0.8)' }}>
                  <div className="absolute inset-0" style={{ background: `linear-gradient(90deg,transparent,${primary}14,transparent)` }} />
                  <div className="absolute bottom-0 left-0 top-0 w-[3px]" style={{ background: `${primary}80` }} />
                  <div className="absolute bottom-0 right-0 top-0 w-[3px]" style={{ background: `${primary}80` }} />
                  <span className="relative font-semibold tracking-[3px]" style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 16, color: 'rgba(160,210,255,0.8)' }}>
                    [ Necromancer ]
                  </span>
                </div>

                {/* arrows */}
                <div className="flex flex-col items-center gap-0 py-2.5">
                  {[0, 0.15, 0.3].map((delay, i) => (
                    <motion.div
                      key={i}
                      className="h-3 w-6"
                      style={{ clipPath: 'polygon(0 0,50% 100%,100% 0)', background: '#a855f7', opacity: i === 0 ? 0.5 : i === 1 ? 0.75 : 1 }}
                      animate={{ 
                        boxShadow: [
                          '0 0 10px rgba(168,85,247,0.6), 0 0 20px rgba(168,85,247,0.4)',
                          '0 0 20px rgba(168,85,247,1), 0 0 40px rgba(168,85,247,0.8)',
                          '0 0 10px rgba(168,85,247,0.6), 0 0 20px rgba(168,85,247,0.4)'
                        ],
                        filter: ['brightness(0.8)', 'brightness(1.5)', 'brightness(0.8)'] 
                      }}
                      transition={{ duration: 1.4, repeat: Infinity, delay }}
                    />
                  ))}
                </div>

                {/* to */}
                <motion.div 
                  className="relative overflow-hidden border px-5 py-3 text-center" 
                  style={{ borderColor: 'rgba(168,85,247,0.5)', background: 'rgba(10,0,20,0.9)' }}
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(168,85,247,0.2), inset 0 0 30px rgba(168,85,247,0.08)',
                      '0 0 40px rgba(168,85,247,0.5), inset 0 0 50px rgba(168,85,247,0.15)',
                      '0 0 20px rgba(168,85,247,0.2), inset 0 0 30px rgba(168,85,247,0.08)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <motion.div 
                    className="absolute inset-0" 
                    style={{ background: 'linear-gradient(90deg,transparent,rgba(168,85,247,0.1),transparent)' }} 
                    animate={{ x: ['-100%', '200%'] }} 
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} 
                  />
                  {[
                    { pos: '-top-px -left-px',   bw: '2px 0 0 2px'  },
                    { pos: '-top-px -right-px',  bw: '2px 2px 0 0'  },
                    { pos: '-bottom-px -left-px', bw: '0 0 2px 2px' },
                    { pos: '-bottom-px -right-px',bw: '0 2px 2px 0' },
                  ].map((t, i) => (
                    <motion.div 
                      key={i} 
                      className={`absolute ${t.pos} h-2 w-2`} 
                      style={{ borderStyle: 'solid', borderWidth: t.bw, borderColor: '#a855f7' }}
                      animate={{
                        boxShadow: [
                          '0 0 6px rgba(168,85,247,0.6)',
                          '0 0 12px rgba(168,85,247,1)',
                          '0 0 6px rgba(168,85,247,0.6)'
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                  <motion.div 
                    className="absolute bottom-0 left-0 top-0 w-[3px]" 
                    style={{ background: 'linear-gradient(180deg,transparent,#a855f7,transparent)' }}
                    animate={{
                      boxShadow: [
                        '0 0 10px rgba(168,85,247,0.6)',
                        '0 0 20px rgba(168,85,247,1)',
                        '0 0 10px rgba(168,85,247,0.6)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div 
                    className="absolute bottom-0 right-0 top-0 w-[3px]" 
                    style={{ background: 'linear-gradient(180deg,transparent,#a855f7,transparent)' }}
                    animate={{
                      boxShadow: [
                        '0 0 10px rgba(168,85,247,0.6)',
                        '0 0 20px rgba(168,85,247,1)',
                        '0 0 10px rgba(168,85,247,0.6)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.span
                    className="relative font-bold tracking-[4px]"
                    style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 22, color: '#a855f7' }}
                    animate={{ 
                      textShadow: [
                        '0 0 8px rgba(168,85,247,1), 0 0 20px rgba(168,85,247,0.8), 0 0 40px rgba(168,85,247,0.5)',
                        '0 0 16px rgba(168,85,247,1), 0 0 40px rgba(168,85,247,1), 0 0 80px rgba(168,85,247,0.8)',
                        '0 0 8px rgba(168,85,247,1), 0 0 20px rgba(168,85,247,0.8), 0 0 40px rgba(168,85,247,0.5)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    [ Shadow Monarch ]
                  </motion.span>
                </motion.div>
              </div>

              {/* footer row */}
              <div className="flex items-center justify-between border-t px-[18px] py-2" style={{ borderColor: `${primary}33`, background: 'rgba(0,10,30,0.4)' }}>
                <span className="leading-none tracking-[2px]" style={{ fontFamily: 'Orbitron,monospace', fontSize: 7, color: `${primary}66` }}>
                  
                </span>
                <div className="flex items-center gap-1.5">
                  {[0, 0.3, 0.6].map((delay, i) => (
                    <motion.div key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 6px ${accent}cc` }} animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }} transition={{ duration: 1.5, repeat: Infinity, delay }} />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* bottom line */}
            <motion.div
              className="rounded-full"
              style={{ height: 2, background: `${primary}cc`, originX: 0.5 }}
              animate={{ width: linesExpanded ? '100%' : 3, opacity: phase === 'idle' ? 0 : phase === 'done' ? 0 : 1 }}
              transition={{ duration: linesExpanded ? 0.7 : 0.45, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {/* footer label */}
          <motion.div
            className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2"
            animate={{ opacity: footerVisible ? 1 : 0 }}
            transition={{ duration: 0.35 }}
          >
            <span className="uppercase tracking-[5px]" style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, color: `${primary}73` }}>
              shadow monarch protocol
            </span>
          </motion.div>

          <style jsx>{`
            @keyframes edgepulse { 0%,100%{opacity:0.55} 50%{opacity:1} }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
