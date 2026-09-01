'use client';

import { useEffect, useRef } from 'react';

export default function ScrollEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    const isDark = document.documentElement.classList.contains('dark');
    const primary = isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(59, 130, 246, 0.15)';
    const secondary = isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(37, 99, 235, 0.1)';

    let rafId = 0;
    let scrollY = 0;
    let ticking = false;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const offset = scrollY * 0.5;
      const gradient = ctx.createLinearGradient(0, offset, 0, canvas.height + offset);
      gradient.addColorStop(0, primary);
      gradient.addColorStop(0.5, secondary);
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const scheduleDraw = () => {
      if (ticking) return;
      ticking = true;
      rafId = requestAnimationFrame(() => {
        ticking = false;
        rafId = 0;
        draw();
      });
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
      scheduleDraw();
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleResize = () => {
      resize();
      scheduleDraw();
    };

    window.addEventListener('resize', handleResize);
    resize();
    draw();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        opacity: 0.6,
      }}
    />
  );
}
