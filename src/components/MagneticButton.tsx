'use client';

import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import type { ReactNode } from 'react';
import { useRef, useState } from 'react';
import { Link } from '@/i18n/routing';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'outline';
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
}

/** Magnetic pull and bottom-fill interaction adapted from PersonalBlog. */
export default function MagneticButton({
  children,
  className = '',
  variant = 'primary',
  href,
  type = 'button',
  onClick,
  disabled = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handlePointerMove = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (shouldReduceMotion || event.pointerType === 'touch' || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * 0.3);
    y.set((event.clientY - (rect.top + rect.height / 2)) * 0.3);
  };

  const handleLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const fillClass = variant === 'primary'
    ? 'bg-[var(--bg-dark)]'
    : 'bg-[var(--theme-primary)]';

  const content = (
      <motion.span
        ref={ref}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={handleLeave}
        style={{ x: springX, y: springY }}
        whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
        className={`magnetic-button relative inline-flex items-center justify-center overflow-hidden ${className}`}
      >
        <motion.span
          aria-hidden="true"
          initial={{ y: '100%', borderRadius: '50% 50% 0 0' }}
          animate={shouldReduceMotion ? { y: '100%' } : {
            y: isHovered ? '0%' : '100%',
            borderRadius: isHovered ? '0%' : '50% 50% 0 0',
          }}
          transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
          className={`pointer-events-none absolute inset-0 z-0 ${fillClass}`}
        />
        <span className="relative z-10 inline-flex items-center justify-center gap-2">
          {children}
        </span>
      </motion.span>
  );

  if (!href) {
    return (
      <button type={type} onClick={onClick} disabled={disabled} className="inline-block disabled:cursor-not-allowed disabled:opacity-60">
        {content}
      </button>
    );
  }

  if (/^(?:[a-z]+:|#)/i.test(href)) {
    return <a href={href} className="inline-block">{content}</a>;
  }

  return <Link href={href} className="inline-block">{content}</Link>;
}
