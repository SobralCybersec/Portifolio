'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';

export default function MagneticLibraryGrid({ children }: { children: ReactNode }) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (reducedMotion || !finePointer) return;

    let cards: Array<{ element: HTMLElement; rect: DOMRect }> = [];
    let gridRect = grid.getBoundingClientRect();
    let frame = 0;
    let queuedPoint: { x: number; y: number } | null = null;

    const refresh = () => {
      gridRect = grid.getBoundingClientRect();
      cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-magnetic-card]'))
        .map((element) => ({ element, rect: element.getBoundingClientRect() }));
    };

    const reset = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      queuedPoint = null;
      cards.forEach(({ element }) => {
        element.style.setProperty('--magnetic-x', '0px');
        element.style.setProperty('--magnetic-y', '0px');
        element.style.setProperty('--magnetic-rotate', '0deg');
      });
    };

    const paint = () => {
      frame = 0;
      if (!queuedPoint) return;
      const point = queuedPoint;
      queuedPoint = null;

      cards.forEach(({ element, rect }) => {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.hypot(point.x - centerX, point.y - centerY);
        const radius = Math.max(rect.width, rect.height) * 1.35;
        const influence = Math.max(0, 1 - distance / radius);
        const x = (point.x - centerX) * 0.035 * influence;
        const y = (point.y - centerY) * 0.025 * influence;
        const rotate = ((point.x - centerX) / Math.max(rect.width, 1)) * 1.1 * influence;

        element.style.setProperty('--magnetic-x', `${x.toFixed(2)}px`);
        element.style.setProperty('--magnetic-y', `${y.toFixed(2)}px`);
        element.style.setProperty('--magnetic-rotate', `${rotate.toFixed(2)}deg`);
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (
        event.pointerType !== 'mouse' &&
        event.pointerType !== 'pen'
      ) return;

      if (
        event.clientX < gridRect.left - 120 ||
        event.clientX > gridRect.right + 120 ||
        event.clientY < gridRect.top - 120 ||
        event.clientY > gridRect.bottom + 120
      ) {
        reset();
        return;
      }

      if (!cards.length) refresh();
      queuedPoint = { x: event.clientX, y: event.clientY };
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    refresh();
    grid.addEventListener('pointermove', handlePointerMove, { passive: true });
    grid.addEventListener('pointerleave', reset, { passive: true });
    window.addEventListener('resize', refresh, { passive: true });

    const mutationObserver = new MutationObserver(refresh);
    mutationObserver.observe(grid, { childList: true, subtree: true });
    const resizeObserver = 'ResizeObserver' in window
      ? new ResizeObserver(refresh)
      : null;
    resizeObserver?.observe(grid);

    return () => {
      reset();
      grid.removeEventListener('pointermove', handlePointerMove);
      grid.removeEventListener('pointerleave', reset);
      window.removeEventListener('resize', refresh);
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
    };
  }, []);

  return <div ref={gridRef} className="magnetic-library-grid" data-testid="magnetic-library-grid">{children}</div>;
}
