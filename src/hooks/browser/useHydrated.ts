'use client';

import { useSyncExternalStore } from 'react';

// Subscribe function that never changes
const subscribe = () => () => {};

/**
 * Hook to detect if component is hydrated (client-side)
 * Uses useSyncExternalStore to avoid setState in useEffect
 * Recommended by React for SSR/CSR branching
 * @see https://react.dev/reference/react/useSyncExternalStore
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,  // Client snapshot
    () => false  // Server snapshot
  );
}
