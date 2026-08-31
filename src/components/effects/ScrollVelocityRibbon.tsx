'use client';

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

interface ScrollVelocityRibbonProps {
  children: ReactNode;
  baseVelocity?: number;
  className?: string;
  direction?: 'left' | 'right';
  scrollDependent?: boolean;
}

const wrap = (min: number, max: number, value: number) => {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
};

/** TextScrollMarquee-inspired ribbon that accelerates with page movement. */
export default function ScrollVelocityRibbon({
  children,
  baseVelocity = 0.8,
  className = '',
  direction = 'left',
  scrollDependent = true,
}: ScrollVelocityRibbonProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 2], { clamp: false });
  const directionFactor = useRef(direction === 'left' ? 1 : -1);
  const [isMobile, setIsMobile] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const updateMobile = () => {
      const matches = typeof window.matchMedia === 'function'
        && window.matchMedia('(max-width: 768px)').matches;
      setIsMobile(matches);
    };
    updateMobile();
    window.addEventListener('resize', updateMobile);
    return () => window.removeEventListener('resize', updateMobile);
  }, []);

  useEffect(() => {
    directionFactor.current = direction === 'left' ? 1 : -1;
  }, [direction]);

  const x = useTransform(baseX, (value) => `${wrap(-100, 0, value % 100)}%`);

  useAnimationFrame((_, delta) => {
    if (isMobile || shouldReduceMotion) return;

    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (scrollDependent) moveBy += moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <motion.div
        className="flex w-max whitespace-nowrap"
        style={{ x: isMobile || shouldReduceMotion ? undefined : x }}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <span key={index} className="flex shrink-0 items-center gap-6 pr-6">
            {children}
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}
