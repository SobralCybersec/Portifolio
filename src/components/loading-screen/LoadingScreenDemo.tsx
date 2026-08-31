'use client';

import { useState } from 'react';
import GameLoadingScreen from './GameLoadingScreen';

export default function LoadingScreenDemo() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && (
        <GameLoadingScreen
          renderSrc="/images/JinWoo-BackFacing3.png"
          duration={3000}
          onComplete={() => setLoading(false)}
        />
      )}

      <main
        style={{
          minHeight: '100vh',
          padding: 80,
          background: '#05070b',
          color: '#fff',
        }}
      >
        <button type="button" onClick={() => setLoading(true)}>
          Test loading screen
        </button>
      </main>
    </>
  );
}
