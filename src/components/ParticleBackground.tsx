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

    // Particle system
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }> = [];

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      if (canvas.width > 0 && canvas.height > 0) {
        for (const p of particles) {
          p.x %= canvas.width;
          p.y %= canvas.height;
        }
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create particles
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

    const particleColor = theme === 'light' ? '59, 130, 246' : '147, 51, 234';
    let rafId: number;

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const particle of particles) {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor}, ${particle.opacity})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [theme]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient background with blur */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: theme === 'light' 
            ? 'linear-gradient(180deg, rgba(200, 220, 255, 0) 0%, rgba(100, 150, 255, 0.16) 59.46%, rgba(59, 130, 246, 0.22) 82%, rgba(29, 78, 216, 0.26) 100%)'
            : 'linear-gradient(180deg, rgba(83, 64, 105, 0) 0%, rgba(122, 79, 232, 0.16) 59.46%, rgba(145, 149, 227, 0.22) 82%, rgba(210, 74, 255, 0.26) 100%)',
          filter: 'blur(100px)',
          WebkitMask: 'radial-gradient(50% 32.2034% at 50% 68.7%, transparent 46.8873%, rgba(0,0,0,0.7) 100%)',
          mask: 'radial-gradient(50% 32.2034% at 50% 68.7%, transparent 46.8873%, rgba(0,0,0,0.7) 100%)',
        }}
      />
      
      {/* Additional glow effect */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[50vh] opacity-20"
        style={{
          background: theme === 'light'
            ? 'radial-gradient(circle at center, rgba(59, 130, 246, 0.4) 0%, transparent 70%)'
            : 'radial-gradient(circle at center, rgba(147, 51, 234, 0.4) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Animated particles canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.6 }}
      />
    </div>
  );
}
