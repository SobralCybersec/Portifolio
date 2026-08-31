'use client';

import { useState } from 'react';
import Image from 'next/image';

function shouldBypassOptimizer(url: string): boolean {
  // Local static assets (icons) must not hit the optimizer.
  if (url.startsWith('/')) return true;
  // Bypass Next.js' server-side optimizer for ALL remote images. Many hosts we
  // embed (imgur, forgecdn, fiap, github user-attachments, raw.githubusercontent,
  // ...) reject or throttle the optimizer's hotlinked fetch (403/429), which made
  // perfectly valid images silently fall back to the language icon. Loading them
  // unoptimized lets the *browser* fetch them directly, so real content renders
  // instead of being overridden by the fallback.
  return /^https?:\/\//i.test(url);
}

interface SafeImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  sizes?: string;
  priority?: boolean;
}

export default function SafeImage({
  src,
  alt,
  fallbackSrc = '/icons/github.png',
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

  const handleError = () => {
    if (!error) {
      setError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={handleError}
      unoptimized={shouldBypassOptimizer(imgSrc)}
    />
  );
}