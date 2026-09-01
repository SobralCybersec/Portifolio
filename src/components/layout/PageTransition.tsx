'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';

const PortfolioTransition = dynamic(() => import('./PageTransitionOverlay'), {
  ssr: false,
});

/**
 * Shared route layer built from Cinematic Letterbox,
 * Monocolor Editorial Wipe,
 * Split Center Reveal,
 * and Kinetic Marquee Stripes source overlays.
 */
export type { ActiveTransition, TransitionName, TransitionTiming } from './page-transition-config';
import type { ActiveTransition, TransitionName } from './page-transition-config';
import { TRANSITION_TIMINGS, TRANSITION_VIDEOS } from './page-transition-config';
interface NavigationOptions {
  replace?: boolean;
  commit?: () => void;
}

interface PageTransitionContextValue {
  navigate: (href: string, options?: NavigationOptions) => boolean;
  isTransitioning: boolean;
}

const ROUTE_TRANSITIONS: Record<string, TransitionName> = {
  '/': 'letterbox',
  '/about': 'monocolor-wipe',
  '/projects': 'marquee-stripes',
  '/certifications': 'black-white-slice',
  '/contact': 'monocolor-wipe',
  '/chat': 'loading-screen',
};

const LOCALES = new Set([
  'en',
  'es',
  'pt',
  'fr',
  'de',
  'ja',
  'zh',
]);

const FAILSAFE_MS = 10000;

const PageTransitionContext =
  createContext<PageTransitionContextValue | null>(null);

export function getTransitionForPath(
  pathname: string,
): TransitionName {
  const cleanPath =
    pathname
      .split(/[?#]/, 1)[0]
      .replace(/\/+$/, '') || '/';

  const segments = cleanPath.split('/');

  const withoutLocale = LOCALES.has(segments[1])
    ? `/${segments.slice(2).join('/')}`
    : cleanPath;

  const route =
    withoutLocale === '/' || withoutLocale === ''
      ? '/'
      : withoutLocale.replace(/\/+$/, '');

  return ROUTE_TRANSITIONS[route] ?? 'letterbox';
}

function prefersReducedMotion() {
  return window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
}

function resolveInternalUrl(href: string) {
  try {
    const url = new URL(
      href,
      window.location.href,
    );

    if (
      url.origin !== window.location.origin ||
      !/^https?:$/.test(url.protocol)
    ) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

function normalizePath(pathname: string) {
  return pathname === '/'
    ? '/'
    : pathname.replace(/\/+$/, '');
}

function nextVideo(index: number) {
  return TRANSITION_VIDEOS[
    index % TRANSITION_VIDEOS.length
  ];
}

export function PageTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [
    transition,
    setTransition,
  ] =
    useState<ActiveTransition | null>(
      null,
    );

  const transitionRef =
    useRef<ActiveTransition | null>(
      null,
    );

  const pendingEffectRef =
    useRef<TransitionName | null>(
      null,
    );

  const pendingVideoRef =
    useRef<string | null>(
      null,
    );

  const pendingMarqueeSeedRef =
    useRef<number | null>(
      null,
    );

  const lastPathRef =
    useRef(pathname);

  const sequenceRef =
    useRef(0);

  const videoIndexRef =
    useRef(0);

  const timersRef = useRef<{
    cover?: number;
    reveal?: number;
    failsafe?: number;
  }>({});

  const clearTimers =
    useCallback(() => {
      const timers =
        timersRef.current;

      if (
        timers.cover !==
        undefined
      ) {
        window.clearTimeout(
          timers.cover,
        );
      }

      if (
        timers.reveal !==
        undefined
      ) {
        window.clearTimeout(
          timers.reveal,
        );
      }

      if (
        timers.failsafe !==
        undefined
      ) {
        window.clearTimeout(
          timers.failsafe,
        );
      }

      timersRef.current = {};
    }, []);

  const finish =
    useCallback(() => {
      clearTimers();

      transitionRef.current =
        null;

      pendingEffectRef.current =
        null;

      pendingVideoRef.current =
        null;

      pendingMarqueeSeedRef.current =
        null;

      setTransition(null);
    }, [clearTimers]);

  /**
   * IMPORTANT:
   *
   * Reveal no longer creates a fresh transition ID when
   * we already have an active cover transition.
   *
   * That means:
   *
   * cover
   *   ↓
   * hold
   *   ↓
   * pathname changes
   *   ↓
   * SAME overlay
   * SAME video element
   * SAME transition id
   *   ↓
   * reveal
   *
   * The video therefore does not restart at reveal.
   */
  const beginReveal =
    useCallback(
      (
        effect: TransitionName,
        video: string,
        marqueeSeed: number,
      ) => {
        if (
          prefersReducedMotion()
        ) {
          finish();
          return;
        }

        clearTimers();

        const current =
          transitionRef.current;

        const nextTransition:
          ActiveTransition =
          current
            ? {
                ...current,
                effect,
                video,
                marqueeSeed,
                phase:
                  'reveal',
              }
            : {
                effect,
                video,
                marqueeSeed,
                phase:
                  'reveal',
                id:
                  ++sequenceRef.current,
              };

        transitionRef.current =
          nextTransition;

        setTransition(
          nextTransition,
        );

        const { revealMs } =
          TRANSITION_TIMINGS[
            effect
          ];

        /**
         * The overlay disappears exactly when the configured
         * reveal duration finishes.
         *
         * No extra +160ms.
         * No additional hold.
         */
        timersRef.current.reveal =
          window.setTimeout(
            finish,
            revealMs,
          );
      },
      [
        clearTimers,
        finish,
      ],
    );

  const navigate =
    useCallback(
      (
        href: string,
        options:
          NavigationOptions = {},
      ) => {
        const url =
          resolveInternalUrl(
            href,
          );

        if (
          !url ||
          normalizePath(
            url.pathname,
          ) ===
            normalizePath(
              window.location
                .pathname,
            )
        ) {
          return false;
        }

        if (
          transitionRef.current
        ) {
          return false;
        }

        const target =
          `${url.pathname}${url.search}${url.hash}`;

        const effect =
          getTransitionForPath(
            url.pathname,
          );

        if (
          prefersReducedMotion()
        ) {
          if (options.commit) {
            options.commit();
          } else if (
            options.replace
          ) {
            router.replace(
              target,
            );
          } else {
            router.push(
              target,
            );
          }

          return true;
        }

        const marqueeSeed =
          videoIndexRef.current++;

        const video =
          nextVideo(
            marqueeSeed,
          );

        const nextTransition:
          ActiveTransition = {
          effect,
          video,
          marqueeSeed,
          phase: 'cover',
          id:
            ++sequenceRef.current,
        };

        transitionRef.current =
          nextTransition;

        pendingEffectRef.current =
          effect;

        pendingVideoRef.current =
          video;

        pendingMarqueeSeedRef.current =
          marqueeSeed;

        setTransition(
          nextTransition,
        );

        const { coverMs } =
          TRANSITION_TIMINGS[
            effect
          ];

        /**
         * COVER
         *
         * Wait only until the visual cover has reached
         * its fully-covered state.
         *
         * There is no additional fixed HOLD_MS.
         */
        timersRef.current.cover =
          window.setTimeout(
            () => {
              const current =
                transitionRef.current;

              if (!current) {
                return;
              }

              /**
               * HOLD now means:
               *
               * "The old page is fully covered and we are waiting
               * for Next.js to commit the destination route."
               *
               * It is NOT a timed visual pause anymore.
               */
              const holdTransition:
                ActiveTransition =
                {
                  ...current,
                  phase:
                    'hold',
                };

              transitionRef.current =
                holdTransition;

              setTransition(
                holdTransition,
              );

              try {
                if (
                  options.commit
                ) {
                  options.commit();
                } else if (
                  options.replace
                ) {
                  router.replace(
                    target,
                  );
                } else {
                  router.push(
                    target,
                  );
                }
              } catch {
                finish();
              }
            },
            coverMs,
          );

        /**
         * This exists only for unexpected router failures.
         *
         * It should never be part of the normal animation timing.
         */
        timersRef.current.failsafe =
          window.setTimeout(
            finish,
            FAILSAFE_MS,
          );

        return true;
      },
      [
        finish,
        router,
      ],
    );

  /**
   * The destination pathname changed.
   *
   * At this point the new route is mounted behind the overlay,
   * so reveal can start immediately.
   */
  useEffect(() => {
    if (
      pathname ===
      lastPathRef.current
    ) {
      return;
    }

    lastPathRef.current =
      pathname;

    const pendingEffect =
      pendingEffectRef.current;

    const pendingVideo =
      pendingVideoRef.current;

    const pendingMarqueeSeed =
      pendingMarqueeSeedRef.current;

    const marqueeSeed =
      pendingMarqueeSeed ??
      videoIndexRef.current++;

    pendingEffectRef.current =
      null;

    pendingVideoRef.current =
      null;

    pendingMarqueeSeedRef.current =
      null;

    beginReveal(
      pendingEffect ??
        getTransitionForPath(
          pathname ?? '/',
        ),

      pendingVideo ??
        nextVideo(
          marqueeSeed,
        ),

      marqueeSeed,
    );
  }, [
    beginReveal,
    pathname,
  ]);

  /**
   * Capture normal internal links so all page navigation
   * uses the transition system.
   */
  useEffect(() => {
    const handleDocumentClick =
      (
        event: MouseEvent,
      ) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        const target =
          event.target;

        if (
          !(
            target instanceof
            Element
          )
        ) {
          return;
        }

        const anchor =
          target.closest('a');

        if (
          !anchor ||
          (anchor.target &&
            anchor.target !==
              '_self') ||
          anchor.hasAttribute(
            'download',
          )
        ) {
          return;
        }

        const href =
          anchor.getAttribute(
            'href',
          );

        if (
          !href ||
          href.startsWith('#')
        ) {
          return;
        }

        const url =
          resolveInternalUrl(
            href,
          );

        if (!url) {
          return;
        }

        if (
          transitionRef.current
        ) {
          event.preventDefault();
          return;
        }

        if (
          navigate(url.href)
        ) {
          event.preventDefault();
        }
      };

    document.addEventListener(
      'click',
      handleDocumentClick,
      true,
    );

    return () => {
      document.removeEventListener(
        'click',
        handleDocumentClick,
        true,
      );
    };
  }, [navigate]);

  /**
   * Ensure timers never survive provider unmount.
   */
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return (
    <PageTransitionContext.Provider
      value={{
        navigate,
        isTransitioning:
          Boolean(
            transition,
          ),
      }}
    >
      {children}

      {transition && (
        <PortfolioTransition
          transition={
            transition
          }
        />
      )}
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  return (
    useContext(
      PageTransitionContext,
    ) ?? {
      navigate: () =>
        false,

      isTransitioning:
        false,
    }
  );
}
