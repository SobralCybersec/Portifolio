'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { useHydrated } from '@/hooks/useHydrated';

interface BackgroundMusicProps {
  autoPlay?: boolean;
}

export function BackgroundMusic({ autoPlay = false }: BackgroundMusicProps = {}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { theme } = useTheme();
  const mounted = useHydrated();
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    // Check if boot animation has completed - using callback to avoid sync setState
    const checkBootComplete = () => {
      const bootComplete = localStorage.getItem('bootComplete') === 'true';
      setCanPlay(bootComplete);
    };
    
    // Defer setState to next tick
    const timer = setTimeout(checkBootComplete, 0);

    // Listen for boot completion event
    const handleBootComplete = () => {
      setCanPlay(true);
    };
    window.addEventListener('bootComplete', handleBootComplete);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('bootComplete', handleBootComplete);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !canPlay) return;
    
    const audio = audioRef.current;
    if (!audio) return;

    const wasPlaying = !audio.paused;

    // Stop current music
    audio.pause();
    audio.currentTime = 0;

    // Load new music based on theme
    const soundFile = theme === 'dark' ? '/sounds/sound.mp3' : '/sounds/sound2.mp3';
    audio.src = soundFile;
    audio.volume = 0.35;
    audio.load();

    // Play new music if old one was playing
    if (wasPlaying) {
      audio.play().catch(() => {});
    }
  }, [theme, mounted, canPlay]);

  useEffect(() => {
    if (!mounted || !canPlay) return;
    
    const audio = audioRef.current;
    if (!audio) return;

    if (autoPlay) {
      const playAudio = async () => {
        try {
          audio.volume = 0.35;
          await audio.play();
          setIsPlaying(true);
        } catch {}
      };
      playAudio();
    } else {
      const playAudio = async () => {
        try {
          audio.volume = 0.35;
          await audio.play();
          setIsPlaying(true);
        } catch {}
        document.removeEventListener('click', playAudio);
      };

      const timer = setTimeout(() => {
        document.addEventListener('click', playAudio);
      }, 2000);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', playAudio);
      };
    }
  }, [autoPlay, mounted, canPlay]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  if (!mounted || !canPlay) return null;

  const soundFile = theme === 'dark' ? '/sounds/sound.mp3' : '/sounds/sound2.mp3';

  return (
    <audio ref={audioRef} loop preload="auto">
      <source src={soundFile} type="audio/mpeg" />
    </audio>
  );
}
