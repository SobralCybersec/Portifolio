'use client';

import { useEffect, useState } from 'react';

interface IdleWindow {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
}

/** Defer decorative work until first content paint has settled. */
export function useDeferredMount(timeout = 900) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const idleWindow = window as unknown as IdleWindow;
    const reveal = () => {
      if (!cancelled) setReady(true);
    };

    if (idleWindow.requestIdleCallback) {
      const idleId = idleWindow.requestIdleCallback(reveal, { timeout });
      return () => {
        cancelled = true;
        idleWindow.cancelIdleCallback?.(idleId);
      };
    }

    const timeoutId = window.setTimeout(reveal, timeout);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [timeout]);

  return ready;
}
