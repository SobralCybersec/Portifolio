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
          height: 49,
        }}
      >
        <Image
          src="/sprites/jinwoo.gif"
          alt=""
          width={132}
          height={100}
          priority
          unoptimized
          style={{
            width: 64,
            height: 'auto',
            imageRendering: 'pixelated',
            filter: 'drop-shadow(0 0 6px rgba(168,85,247,0.9)) drop-shadow(0 0 2px rgba(168,85,247,1))',
          }}
        />
      </div>
    </>
  );
}
