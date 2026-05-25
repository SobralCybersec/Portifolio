'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    let animationFrameId = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);

        // Tokyo Ghoul-inspired blood red / dark crimson
        const particleColor = theme === 'light' ? '120, 0, 0' : '180, 0, 0';
        ctx.fillStyle = `rgba(${particleColor}, ${particle.opacity})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            theme === 'light'
              ? 'linear-gradient(180deg, rgba(40, 0, 0, 0) 0%, rgba(90, 0, 0, 0.18) 55%, rgba(140, 0, 0, 0.28) 82%, rgba(70, 0, 0, 0.34) 100%)'
              : 'linear-gradient(180deg, rgba(10, 0, 0, 0) 0%, rgba(80, 0, 0, 0.18) 55%, rgba(140, 0, 0, 0.28) 82%, rgba(255, 0, 0, 0.18) 100%)',
          filter: 'blur(100px)',
          WebkitMask:
            'radial-gradient(50% 32.2034% at 50% 68.7%, transparent 46.8873%, rgba(0,0,0,0.7) 100%)',
          mask: 'radial-gradient(50% 32.2034% at 50% 68.7%, transparent 46.8873%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[50vh] opacity-20"
        style={{
          background:
            theme === 'light'
              ? 'radial-gradient(circle at center, rgba(140, 0, 0, 0.45) 0%, transparent 70%)'
              : 'radial-gradient(circle at center, rgba(255, 0, 0, 0.28) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.7 }}
      />
    </div>
  );
}