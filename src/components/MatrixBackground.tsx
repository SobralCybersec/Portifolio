'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Permanent cmatrix-style glyph rain, painted on a canvas so it never triggers
 * React re-renders. Sits behind everything and outlives the boot overlay — this
 * is the "cmatrix permanence" the page keeps once SoloLevelingBoot unmounts.
 * Skipped entirely under reduced motion.
 */
export default function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
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

    const blue = 'rgba(60, 200, 255, 0.85)';
    const purple = 'rgba(150, 93, 255, 0.78)';
    const fade = 'rgba(2, 3, 10, 0.22)';

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
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
  }, [reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -3,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.28,
        mixBlendMode: 'screen',
      }}
    />
  );
}
