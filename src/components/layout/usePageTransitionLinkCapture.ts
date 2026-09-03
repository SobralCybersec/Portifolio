'use client';

import { useEffect } from 'react';
import type { ActiveTransition } from './page-transition-config';
import { resolveInternalUrl } from './page-transition-utils';

type TransitionRef = { current: ActiveTransition | null };

export function usePageTransitionLinkCapture(
  navigate: (href: string) => boolean,
  transitionRef: TransitionRef,
) {
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest('a');
      if (!anchor || (anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      const url = resolveInternalUrl(href);
      if (!url) return;

      if (transitionRef.current) {
        event.preventDefault();
        return;
      }

      if (navigate(url.href)) event.preventDefault();
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () => document.removeEventListener('click', handleDocumentClick, true);
  }, [navigate, transitionRef]);
}
