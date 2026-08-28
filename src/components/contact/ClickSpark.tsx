'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef } from 'react';

interface ClickSparkProps {
  children: ReactNode;
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  extraScale?: number;
}

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

/** Canvas click burst adapted from PersonalBlog's ClickSpark effect. */
export default function ClickSpark({
  children,
  sparkColor = '#a855f7',
  sparkSize = 9,
  sparkRadius = 20,
  sparkCount = 8,
  duration = 420,
  extraScale = 1,
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const animationRef = useRef<number | null>(null);
  const drawRef = useRef<(timestamp: number) => void>(() => undefined);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resize();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(resize);
      observer.observe(parent);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const draw = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    sparksRef.current = sparksRef.current.filter((spark) => {
      const progress = (timestamp - spark.startTime) / duration;
      if (progress >= 1) return false;

      const eased = progress * (2 - progress);
      const distance = eased * sparkRadius * extraScale;
      const lineLength = sparkSize * (1 - eased);
      const x1 = spark.x + distance * Math.cos(spark.angle);
      const y1 = spark.y + distance * Math.sin(spark.angle);
      const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
      const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

      context.strokeStyle = sparkColor;
      context.globalAlpha = 1 - progress;
      context.lineWidth = 1.5;
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.stroke();
      return true;
    });
    context.globalAlpha = 1;

    if (sparksRef.current.length > 0) {
      animationRef.current = requestAnimationFrame((nextTimestamp) => drawRef.current(nextTimestamp));
    } else {
      animationRef.current = null;
    }
  }, [duration, extraScale, sparkColor, sparkRadius, sparkSize]);

  useEffect(() => {
    drawRef.current = draw;
    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    };
  }, [draw]);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotionRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const now = performance.now();
    sparksRef.current.push(...Array.from({ length: sparkCount }, (_, index) => ({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      angle: (Math.PI * 2 * index) / sparkCount,
      startTime: now,
    })));

    if (animationRef.current === null) animationRef.current = requestAnimationFrame((nextTimestamp) => drawRef.current(nextTimestamp));
  };

  return (
    <div className="relative w-full" onClick={handleClick}>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 h-full w-full" />
      {children}
    </div>
  );
}
