'use client';

import { useEffect } from 'react';

export function useClickSound() {
  useEffect(() => {
    const audio = new Audio('/sounds/pop.mov');
    audio.volume = 0.3;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.closest('a')) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
}
