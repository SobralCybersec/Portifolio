'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import SafeImage from './SafeImage';

interface ImageSlideshowProps {
  images: string[];
  alt: string;
  interval?: number;
  fallbackSrc?: string;
}

export default function ImageSlideshow({ images, alt, interval = 5000, fallbackSrc = '/icons/github.png' }: ImageSlideshowProps) {
  const t = useTranslations('projects');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Re-runs when images identity or interval changes; safeIndex clamps any
  // out-of-bounds currentIndex that can occur if the array shrinks mid-session.
  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images, interval]);

  const safeIndex = images.length > 0 ? currentIndex % images.length : 0;

  if (images.length === 0) return null;

  return (
    <div className="relative w-full h-full">
      {images.map((src, index) => (
        <div
          key={`${src}-${index}`}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: index === safeIndex ? 1 : 0 }}
        >
          <SafeImage
            src={src}
            alt={`${alt} - ${index + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain"
            fallbackSrc={fallbackSrc}
          />
        </div>
      ))}
      
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                background: index === safeIndex ? '#a855f7' : 'rgba(168, 85, 247, 0.3)',
                boxShadow: index === safeIndex ? '0 0 8px #a855f7' : 'none',
              }}
              aria-label={t('imageNumber', { number: index + 1 })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
