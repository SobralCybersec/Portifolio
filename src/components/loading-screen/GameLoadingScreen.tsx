'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getRandomLoadingMessage, type LoadingMessage } from './loadingMessages';
import './GameLoadingScreen.css';

interface GameLoadingScreenProps {
  renderSrc?: string;
  duration?: number;
  onComplete?: () => void;
}

export default function GameLoadingScreen({
  renderSrc = '/images/JinWoo-BackFacing3.png',
  duration = 3000,
  onComplete,
}: GameLoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [activeRenderSrc, setActiveRenderSrc] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<LoadingMessage | null>(null);

  useEffect(() => {
    const lightModeImages = [
      '/images/JinWoo-BackFacing3.png',
      '/images/jinwoo.png',
      '/images/jinwoo2.png',
    ];
    const darkModeImages = [
      '/images/JinWoo-render.png',
      '/images/jinwoo3.png',
    ];
    const availableImages = document.documentElement.classList.contains('light')
      ? lightModeImages
      : darkModeImages;
    const randomIndex = Math.floor(Math.random() * availableImages.length);
    const selectedImage = availableImages[randomIndex] ?? renderSrc;
    const selectionTimer = window.setTimeout(() => {
      setActiveRenderSrc(selectedImage);
      setLoadingMessage(getRandomLoadingMessage());
    }, 0);

    return () => window.clearTimeout(selectionTimer);
  }, [renderSrc]);

  useEffect(() => {
    let frame = 0;
    let exitTimer = 0;

    const startedAt = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startedAt;
      const value = Math.min(100, (elapsed / duration) * 100);

      setProgress(value);

      if (value < 100) {
        frame = requestAnimationFrame(animate);
        return;
      }

      setLeaving(true);
      exitTimer = window.setTimeout(() => {
        onComplete?.();
      }, 650);
    };

    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(exitTimer);
    };
  }, [duration, onComplete]);

  return (
    <div
      className={`sl-loading-screen ${leaving ? 'sl-loading-screen--leaving' : ''}`}
      role="status"
      aria-label="Loading"
    >
      <div className="sl-loading-screen__light" />
      <div className="sl-loading-screen__dark" />

      <div className="sl-loading-screen__horizon">
        <span />
      </div>

      <div className="sl-loading-screen__energy sl-loading-screen__energy--left" />
      <div className="sl-loading-screen__energy sl-loading-screen__energy--right" />
      <div className="sl-loading-screen__sigil" />

      <div className="sl-loading-screen__character">
        <div className="sl-loading-screen__character-aura" />
        {activeRenderSrc && (
          <Image
            className="sl-loading-screen__character-render"
            src={activeRenderSrc}
            alt=""
            fill
            unoptimized
            priority
            sizes="(max-width: 900px) 100vw, 54vw"
          />
        )}
      </div>

      <div className="sl-loading-screen__particles" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => (
          <span
            key={index}
            style={{ '--particle-index': index } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="sl-loading-screen__loader">
        <div className="sl-loading-screen__loader-top">
          <div className="sl-loading-screen__spinner">
            <span />
          </div>

          <div className="sl-loading-screen__label">
            <span className="sl-loading-screen__loading-word">LOADING</span>

            <span className="sl-loading-screen__dots">
              <i />
              <i />
              <i />
            </span>
          </div>

          <span className="sl-loading-screen__percentage">
            {Math.round(progress).toString().padStart(2, '0')}
          </span>
        </div>

        <div className="sl-loading-screen__track">
          <span
            className="sl-loading-screen__progress"
            style={{ transform: `scaleX(${progress / 100})` }}
          />

          <span
            className="sl-loading-screen__progress-glow"
            style={{ left: `${progress}%` }}
          />
        </div>

        {loadingMessage && (
          <p className="sl-loading-screen__message" aria-live="polite">
            <span className="sl-loading-screen__message-kind">
              {loadingMessage.kind === 'profile' ? 'PROFILE' : 'REMINDER'}
            </span>
            {loadingMessage.text}
          </p>
        )}
      </div>
    </div>
  );
}
