'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface AnimatedTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  critical?: boolean;
}

export function AnimatedText({ children, className = '', delay = 0, critical = false }: AnimatedTextProps) {
  return (
    <motion.div
      initial={critical ? false : { opacity: 1, y: 20 }}
      animate={critical ? undefined : { opacity: 1, y: 0 }}
      transition={critical ? { duration: 0 } : { duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedWordProps {
  text: string;
  className?: string;
  delay?: number;
}

export function AnimatedWord({ text, className = '', delay = 0 }: AnimatedWordProps) {
  const words = text.split(' ');

  return (
    <span className={className}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: delay + index * 0.1 }}
          style={{ display: 'inline-block', marginRight: '0.25em' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

interface AnimatedCharProps {
  text: string;
  className?: string;
  delay?: number;
}

export function AnimatedChar({ text, className = '', delay = 0 }: AnimatedCharProps) {
  const chars = text.split('');

  return (
    <span className={className}>
      {chars.map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: delay + index * 0.03 }}
          style={{ display: 'inline-block' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
}

interface GradientTextProps {
  children: ReactNode;
  className?: string;
}

export function GradientText({ children, className = '' }: GradientTextProps) {
  return (
    <span 
      className={className}
      style={{
        background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-accent))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}
    >
      {children}
    </span>
  );
}
