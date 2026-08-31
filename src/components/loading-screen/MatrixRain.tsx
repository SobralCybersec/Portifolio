'use client';

import { useEffect, useRef } from 'react';

/**
 * Matrix-style glyph rain, painted on a canvas so it never triggers React
 * re-renders. Purely decorative and skipped entirely under reduced motion.
 */
interface MatrixRainProps {
  active: boolean;
  light: boolean;
}

export default function MatrixRain(props: MatrixRainProps) {
  const { active, light } = props;
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
