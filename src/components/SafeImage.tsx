'use client';

import { useState } from 'react';
import Image from 'next/image';

// Third-party hosts that reject Next.js' server-side optimizer fetch
// (hotlink protection → 403/429). Their images must be loaded unoptimized so
// the *browser* fetches them directly, otherwise they silently fall back.
const UNOPTIMIZED_HOSTS = new Set([
  'i.imgur.com',
  'media.forgecdn.net',
  'www.fiap.com.br',
]);

function shouldBypassOptimizer(url: string): boolean {
  // Local icons are already static and must not hit the optimizer.
  if (url.startsWith('/icons/')) return true;
  try {
    return UNOPTIMIZED_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
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