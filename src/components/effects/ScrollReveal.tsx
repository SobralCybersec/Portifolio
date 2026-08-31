'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

interface ScrollRevealProps {
  children: string;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
}

/** Word-level reveal adapted from PersonalBlog's ScrollReveal component. */
export default function ScrollReveal({
  children,
  baseOpacity = 0.25,
  baseRotation = 2,
  blurStrength = 3,
  containerClassName = '',
  textClassName = '',
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const parts = useMemo(() => children.split(/(\s+)/), [children]);

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: baseOpacity, rotate: baseRotation }}
      whileInView={{ opacity: 1, rotate: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`relative z-10 ${containerClassName}`}
      style={{ transformOrigin: '0% 50%' }}
    >
      <p className={`relative z-10 leading-relaxed ${textClassName}`}>
        {parts.map((part, index) => {
          if (/^\s+$/.test(part)) return part;

          const word: ReactNode = (
            <motion.span
              initial={shouldReduceMotion ? false : { opacity: baseOpacity, filter: `blur(${blurStrength}px)` }}
              whileInView={{ opacity: 1, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-12% 0px' }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.45,
                delay: shouldReduceMotion ? 0 : index * 0.018,
                ease: 'easeOut',
              }}
              className="inline-block"
            >
              {part}
            </motion.span>
          );

          return <span key={`${part}-${index}`}>{word}</span>;
        })}
      </p>
    </motion.div>
  );
}
