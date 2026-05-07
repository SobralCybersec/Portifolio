'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageSlideshowProps {
  images: string[];
  alt: string;
  interval?: number;
}

export default function ImageSlideshow({ images, alt, interval = 5000 }: ImageSlideshowProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  if (images.length === 0) return null;

  return (
    <div className="relative w-full h-full">
      {images.map((img, idx) => (
        <Image
          key={img}
          src={img}
          alt={`${alt} ${idx + 1}`}
          fill
          className={`object-contain transition-opacity duration-500 ${
            idx === current ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          unoptimized
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ))}
    </div>
  );
}
