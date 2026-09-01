'use client';

import { useEffect, useRef } from 'react';

export function useClickSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.closest('a')) {
        const audio = audioRef.current ?? new Audio('/sounds/pop.mov');
        audioRef.current = audio;
        audio.volume = 0.3;
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
      const audio = audioRef.current;
      if (audio && typeof audio.pause === 'function') audio.pause();
      audioRef.current = null;
    };
  }, []);
}
