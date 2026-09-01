'use client';

import { useRef, useEffect } from 'react';

interface LetterGlitchProps {
  glitchColors?: string[];
  glitchSpeed?: number;
  centerVignette?: boolean;
  outerVignette?: boolean;
  smooth?: boolean;
  characters?: string;
  vignetteColor?: string;
}

/** Allowlist: only accept valid 3- or 6-digit hex colors (CWE-20 / CWE-78). */
const HEX_COLOR_RE = /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/;
const SAFE_RGB_RE = /^\d{1,3},\d{1,3},\d{1,3}$/;

function sanitizeHexColor(color: string, fallback: string): string {
  return HEX_COLOR_RE.test(color) ? color : fallback;
}

function sanitizeRgbTriplet(value: string, fallback: string): string {
  return SAFE_RGB_RE.test(value) ? value : fallback;
}

const LetterGlitch = ({
  glitchColors = ['#2b4539', '#61dca3', '#61b3dc'],
  glitchSpeed = 50,
  centerVignette = false,
  outerVignette = true,
  smooth = true,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789',
  vignetteColor = '0,0,0'
}: LetterGlitchProps) => {
  // Sanitize all color inputs once on entry — never trust prop values downstream
  const safeColors = glitchColors.map(c => sanitizeHexColor(c, '#61dca3'));
  const safeVignetteColor = sanitizeRgbTriplet(vignetteColor, '0,0,0');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const letters = useRef<
    {
      char: string;
      color: string;
      targetColor: string;
      colorProgress: number;
    }[]
  >([]);
  const grid = useRef({ columns: 0, rows: 0 });
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const lastGlitchTime = useRef(0);
  const canvasSize = useRef({ width: 0, height: 0 });

  const lettersAndSymbols = Array.from(characters);

  const fontSize = 16;
  const charWidth = 10;
  const charHeight = 20;

  const getRandomChar = () => {
    return lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)];
  };

  const getRandomColor = () => {
    return safeColors[Math.floor(Math.random() * safeColors.length)];
  };

  const hexToRgb = (hex: string) => {
    // Support rgb(r, g, b) strings produced by interpolateColor
    if (hex.startsWith('rgb')) {
      const m = /rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/.exec(hex);
      return m
        ? { r: parseInt(m[1], 10), g: parseInt(m[2], 10), b: parseInt(m[3], 10) }
        : null;
    }

    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (_m, r, g, b) => {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null;
  };

  const interpolateColor = (
    start: { r: number; g: number; b: number },
    end: { r: number; g: number; b: number },
    factor: number
  ) => {
    const result = {
      r: Math.round(start.r + (end.r - start.r) * factor),
      g: Math.round(start.g + (end.g - start.g) * factor),
      b: Math.round(start.b + (end.b - start.b) * factor)
    };
    return `rgb(${result.r}, ${result.g}, ${result.b})`;
  };

  const calculateGrid = (width: number, height: number) => {
    const columns = Math.ceil(width / charWidth);
    const rows = Math.ceil(height / charHeight);
    return { columns, rows };
  };

  const initializeLetters = (columns: number, rows: number) => {
    grid.current = { columns, rows };
    const totalLetters = columns * rows;
    letters.current = Array.from({ length: totalLetters }, () => ({
      char: getRandomChar(),
      color: getRandomColor(),
      targetColor: getRandomColor(),
      colorProgress: 1
    }));
  };

  const resizeCanvas = (width?: number, height?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = width === undefined || height === undefined
      ? parent.getBoundingClientRect()
      : { width, height };

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvasSize.current = { width: rect.width, height: rect.height };

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    if (context.current) {
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const { columns, rows } = calculateGrid(rect.width, rect.height);
    initializeLetters(columns, rows);
    drawLetters();
  };

  const drawLetters = () => {
    if (!context.current || letters.current.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = context.current;
    const { width, height } = canvasSize.current;
    ctx.clearRect(0, 0, width, height);
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = 'top';

    letters.current.forEach((letter, index) => {
      const x = (index % grid.current.columns) * charWidth;
      const y = Math.floor(index / grid.current.columns) * charHeight;
      ctx.fillStyle = letter.color;
      ctx.fillText(letter.char, x, y);
    });
  };

  const updateLetters = () => {
    if (!letters.current || letters.current.length === 0) return;

    const updateCount = Math.max(1, Math.floor(letters.current.length * 0.05));

    for (let i = 0; i < updateCount; i++) {
      const index = Math.floor(Math.random() * letters.current.length);
      if (!letters.current[index]) continue;

      letters.current[index].char = getRandomChar();
      letters.current[index].targetColor = getRandomColor();

      if (!smooth) {
        letters.current[index].color = letters.current[index].targetColor;
        letters.current[index].colorProgress = 1;
      } else {
        letters.current[index].colorProgress = 0;
      }
    }
  };

  const handleSmoothTransitions = () => {
    let needsRedraw = false;
    letters.current.forEach(letter => {
      if (letter.colorProgress < 1) {
        letter.colorProgress += 0.05;
        if (letter.colorProgress > 1) letter.colorProgress = 1;

        const startRgb = hexToRgb(letter.color);
        const endRgb = hexToRgb(letter.targetColor);
        if (startRgb && endRgb) {
          letter.color = interpolateColor(startRgb, endRgb, letter.colorProgress);
          needsRedraw = true;
        }
      }
    });

    if (needsRedraw) {
      drawLetters();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    lastGlitchTime.current = Date.now();
    context.current = canvas.getContext('2d');
    resizeCanvas();

    let loopId = 0;

    const animate = () => {
      const myId = ++loopId;
      const tick = () => {
        if (loopId !== myId) return; // stale loop — a newer one owns the cycle
        const now = Date.now();
        if (now - lastGlitchTime.current >= glitchSpeed) {
          updateLetters();
          drawLetters();
          lastGlitchTime.current = now;
        }
        if (smooth) {
          handleSmoothTransitions();
        }
        animationRef.current = requestAnimationFrame(tick);
      };
      tick();
    };

    animate();

    let resizeTimeout: ReturnType<typeof setTimeout>;
    let resizeObserver: ResizeObserver | undefined;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        cancelAnimationFrame(animationRef.current as number);
        resizeCanvas();
        animate(); // increments loopId — old tick() sees mismatch and exits
      }, 100);
    };

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect;
        resizeCanvas(width, height);
      });
      resizeObserver.observe(canvas.parentElement as HTMLElement);
    } else {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      cancelAnimationFrame(animationRef.current!);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glitchSpeed, smooth, JSON.stringify(glitchColors)]);

  const containerStyle = {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden'
  };

  const canvasStyle = {
    display: 'block',
    width: '100%',
    height: '100%'
  };

  const outerVignetteStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    background: `radial-gradient(circle, rgba(${safeVignetteColor},0) 60%, rgba(${safeVignetteColor},1) 100%)`
  };

  const centerVignetteStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    background: `radial-gradient(circle, rgba(${safeVignetteColor},0.8) 0%, rgba(${safeVignetteColor},0) 60%)`
  };

  return (
    <div style={containerStyle as React.CSSProperties}>
      <canvas ref={canvasRef} style={canvasStyle} />
      {outerVignette && <div style={outerVignetteStyle as React.CSSProperties}></div>}
      {centerVignette && <div style={centerVignetteStyle as React.CSSProperties}></div>}
    </div>
  );
};

export default LetterGlitch;
