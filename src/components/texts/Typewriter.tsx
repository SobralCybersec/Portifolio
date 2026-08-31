'use client';

import React from 'react';
import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useHydrated } from '@/hooks/browser/useHydrated';

interface TypewriterProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  cursor?: boolean;
}

export function Typewriter({ 
  text, 
  className = '', 
  delay = 0, 
  duration = 2,
  cursor = true 
}: TypewriterProps) {
  const isClient = useHydrated();
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const displayText = useTransform(rounded, (latest) => text.slice(0, latest));

  useEffect(() => {
    if (!isClient) return;
    const controls = animate(count, text.length, {
      type: 'tween',
      duration,
      ease: 'easeInOut',
      delay,
    });
    return controls.stop;
  }, [isClient, count, text.length, duration, delay]);

  if (!isClient) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className} suppressHydrationWarning>
      <motion.span>{displayText}</motion.span>
      {cursor && <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
        className="inline-block w-[2px] h-[1em] bg-current ml-1"
      />}
    </span>
  );
}

interface TypewriterLoopProps {
  texts: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export function TypewriterLoop({
  texts,
  className = '',
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
}: TypewriterLoopProps) {
  const isClient = useHydrated();
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);
  
  const currentText = texts[currentIndex];
  const displayText = useTransform(rounded, (latest) => 
    currentText.slice(0, latest)
  );

  useEffect(() => {
    if (!isClient) return;
    
    const targetLength = isDeleting ? 0 : currentText.length;
    const speed = isDeleting ? deletingSpeed : typingSpeed;
    
    const controls = animate(count, targetLength, {
      type: 'tween',
      duration: Math.abs(targetLength - count.get()) * speed / 1000,
      ease: 'linear',
      onComplete: () => {
        if (!isDeleting) {
          setTimeout(() => setIsDeleting(true), pauseDuration);
        } else {
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % texts.length);
        }
      },
    });

    return controls.stop;
  }, [currentText, isDeleting, count, typingSpeed, deletingSpeed, pauseDuration, texts.length, isClient]);

  if (!isClient) {
    return <span className={className}>{texts[0]}</span>;
  }

  return (
    <span className={className} suppressHydrationWarning>
      <motion.span>{displayText}</motion.span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
        className="inline-block w-[2px] h-[1em] bg-current ml-1"
      />
    </span>
  );
}
