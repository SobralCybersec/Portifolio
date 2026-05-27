'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';

export default function ChatEffects() {
  return (
    <>
      {/* Retro sprite — static at bottom of viewport */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          zIndex: 20,
          pointerEvents: 'none',
          width: 64,
          height: 64,
        }}
      >
        <Image
          src="/sprites/jinwoo.gif"
          alt=""
          width={64}
          height={64}
          unoptimized
          style={{
            imageRendering: 'pixelated',
            filter: 'drop-shadow(0 0 6px rgba(168,85,247,0.9)) drop-shadow(0 0 2px rgba(168,85,247,1))',
          }}
        />
      </div>
    </>
  );
}