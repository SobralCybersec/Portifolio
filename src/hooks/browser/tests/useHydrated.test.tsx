import React from 'react';
import { renderToString } from 'react-dom/server.node';
import { useHydrated } from '@/hooks/browser/useHydrated';

function HydrationProbe() {
  return <span>{String(useHydrated())}</span>;
}

test('uses server snapshot during server rendering', () => {
  expect(renderToString(<HydrationProbe />)).toContain('false');
});
