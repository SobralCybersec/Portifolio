'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useTheme } from 'next-themes';

export default function ScrollProgress() {
  const [isClient, setIsClient] = useState(false);
  const { theme } = useTheme();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 origin-left z-50"
      style={{ 
        scaleX,
        background: theme === 'dark' 
          ? 'linear-gradient(90deg, #a855f7, #8b5cf6)' 
          : 'linear-gradient(90deg, #6366f1, #3b82f6)'
      }}
    />
  );
}
