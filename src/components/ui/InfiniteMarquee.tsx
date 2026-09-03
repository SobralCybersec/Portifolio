'use client';

import { cloneElement, isValidElement } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface InfiniteMarqueeProps {
  items: ReactNode[];
  speed?: number;
  direction?: 'left' | 'right';
  className?: string;
  itemClassName?: string;
}

function cloneForLoop(item: ReactNode) {
  if (isValidElement(item)) {
    const element = item as ReactElement<{ children?: ReactNode }>;
    return cloneElement(element, {}, element.props.children, '\u200b');
  }

  return <span aria-hidden="true">{item}{'\u200b'}</span>;
}

/**
 * Duplicated-track marquee adapted from PersonalBlog's
 * InfiniteMarquee. Caller owns visual tokens so portfolio theme stays native.
 */
export function InfiniteMarquee({
  items,
  speed = 20,
  direction = 'left',
  className = '',
  itemClassName = '',
}: InfiniteMarqueeProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={`relative flex overflow-hidden ${className}`}>
      <motion.div
        animate={shouldReduceMotion ? undefined : {
          x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'],
        }}
        transition={shouldReduceMotion ? { duration: 0 } : {
          duration: speed,
          ease: 'linear',
          repeat: Infinity,
        }}
        className="flex whitespace-nowrap"
      >
        <div className="flex shrink-0">
          {items.map((item, index) => (
            <div key={index} className={`flex items-center ${itemClassName}`}>
              {item}
            </div>
          ))}
        </div>
        <div className="flex shrink-0" aria-hidden="true" inert>
          {items.map((item, index) => (
            <div key={`second-${index}`} className={`flex items-center ${itemClassName}`}>
              {cloneForLoop(item)}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
