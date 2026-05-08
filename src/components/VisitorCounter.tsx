'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useHydrated } from '@/hooks/useHydrated';

export default function VisitorCounter() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const mounted = useHydrated();

  const isDark = mounted ? theme === 'dark' : true;
  const primary = isDark ? '#a855f7' : '#3b82f6';
  const accent = isDark ? '#8b5cf6' : '#3b82f6';

  useEffect(() => {
    // Track this visit
    fetch('/api/visitors', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setCount(data.count);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div
        className="relative overflow-hidden rounded-lg border px-4 py-3 backdrop-blur-sm"
        style={{
          borderColor: `${primary}66`,
          background: isDark ? 'rgba(10,5,20,0.9)' : 'rgba(255,255,255,0.9)',
          boxShadow: `0 0 20px ${primary}33, inset 0 0 20px ${primary}1a`,
        }}
      >
        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}66, transparent)`,
          }}
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        <div className="relative flex items-center gap-3">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Eye className="w-5 h-5" style={{ color: accent }} />
          </motion.div>

          <div className="flex flex-col">
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                color: isDark ? 'rgba(210,160,255,0.7)' : 'rgba(59,130,246,0.7)',
              }}
            >
              Visitors
            </span>
            <motion.span
              className="text-2xl font-bold tabular-nums"
              style={{
                fontFamily: 'Orbitron, monospace',
                color: primary,
                textShadow: `0 0 10px ${primary}99`,
              }}
              key={count}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {count.toLocaleString()}
            </motion.span>
          </div>
        </div>

        {/* Corner accents */}
        {[
          { pos: 'top-0 left-0', border: 'border-t-2 border-l-2' },
          { pos: 'top-0 right-0', border: 'border-t-2 border-r-2' },
          { pos: 'bottom-0 left-0', border: 'border-b-2 border-l-2' },
          { pos: 'bottom-0 right-0', border: 'border-b-2 border-r-2' },
        ].map((corner, i) => (
          <div
            key={i}
            className={`absolute ${corner.pos} w-3 h-3 ${corner.border}`}
            style={{ borderColor: accent }}
          />
        ))}
      </div>
    </motion.div>
  );
}
