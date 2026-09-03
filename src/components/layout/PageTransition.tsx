'use client';

import { useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import type { ActiveTransition, TransitionEffect, TransitionName } from './page-transition-config';
import { TRANSITION_TIMINGS } from './page-transition-config';
import { FAILSAFE_MS, PageTransitionContext, getTransitionCompositionForPath, getTransitionForPath, getTransitionLabelForPath, getTransitionVariantForPath, nextVideo, normalizePath, prefersReducedMotion, resolveInternalUrl, type NavigationOptions, type NativeViewTransition, type ViewTransitionDocument } from './page-transition-utils';
import { usePageTransitionLinkCapture } from './usePageTransitionLinkCapture';

export type { ActiveTransition, TransitionEffect, TransitionName, TransitionTiming } from './page-transition-config';
export { getTransitionCompositionForPath, getTransitionForPath, getTransitionLabelForPath, getTransitionVariantForPath } from './page-transition-utils';

const PortfolioTransition = dynamic(() => import('./PageTransitionOverlay'), {
  ssr: false,
});
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

  const pendingEffectsRef =
    useRef<readonly TransitionEffect[] | null>(
      null,
    );

  const pendingLabelRef =
    useRef<string | null>(null);

  const pendingVariantRef =
    useRef<number | null>(null);

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
    nativeUpdate?: number;
  }>({});

  const nativeViewTransitionRef =
    useRef<NativeViewTransition | null>(null);

  const nativeUpdateResolveRef =
    useRef<(() => void) | null>(null);

  const resolveNativeUpdate = useCallback(() => {
    const resolve = nativeUpdateResolveRef.current;
    nativeUpdateResolveRef.current = null;

    if (
      timersRef.current.nativeUpdate !==
      undefined
    ) {
      window.clearTimeout(
        timersRef.current.nativeUpdate,
      );
      timersRef.current.nativeUpdate =
        undefined;
    }

    resolve?.();
  }, []);

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

      if (
        timers.nativeUpdate !==
        undefined
      ) {
        window.clearTimeout(
          timers.nativeUpdate,
        );
      }

      timersRef.current = {};
    }, []);

  const finish =
    useCallback(() => {
      resolveNativeUpdate();
      clearTimers();

      nativeViewTransitionRef.current?.skipTransition?.();
      nativeViewTransitionRef.current = null;

      transitionRef.current =
        null;

      pendingEffectRef.current =
        null;

      pendingEffectsRef.current =
        null;

      pendingLabelRef.current =
        null;

      pendingVariantRef.current =
        null;

      pendingVideoRef.current =
        null;

      pendingMarqueeSeedRef.current =
        null;

      setTransition(null);
    }, [clearTimers, resolveNativeUpdate]);

  const startNativeNavigation = useCallback(
    (commit: () => void) => {
      const documentWithViewTransition =
        document as ViewTransitionDocument;

      if (
        typeof documentWithViewTransition.startViewTransition !==
        'function'
      ) {
        commit();
        return;
      }

      let nativeTransition: NativeViewTransition;

      try {
        nativeTransition =
          documentWithViewTransition.startViewTransition(
            () =>
              new Promise<void>((resolve) => {
                nativeUpdateResolveRef.current = resolve;
                timersRef.current.nativeUpdate =
                  window.setTimeout(
                    resolveNativeUpdate,
                    1400,
                  );
                commit();
              }),
          );
      } catch {
        commit();
        return;
      }

      nativeViewTransitionRef.current =
        nativeTransition;

      void nativeTransition.finished
        .catch(() => undefined)
        .finally(() => {
          if (
            nativeViewTransitionRef.current ===
            nativeTransition
          ) {
            nativeViewTransitionRef.current =
              null;
          }
        });
    },
    [resolveNativeUpdate],
  );

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
        effects: readonly TransitionEffect[],
        label: string,
        variant: number,
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
                effects,
                label,
                variant,
                video,
                marqueeSeed,
                phase:
                  'reveal',
              }
            : {
                effect,
                effects,
                label,
                variant,
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

        const marqueeSeed =
          videoIndexRef.current++;

        const effects =
          getTransitionCompositionForPath(
            url.pathname,
            marqueeSeed,
          );

        const effect =
          effects[0] ??
          getTransitionForPath(url.pathname);

        const variant =
          getTransitionVariantForPath(
            url.pathname,
            marqueeSeed,
          );

        const label =
          getTransitionLabelForPath(
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

        const video =
          nextVideo(
            marqueeSeed,
          );

        const nextTransition:
          ActiveTransition = {
          effect,
          effects,
          label,
          variant,
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

        pendingEffectsRef.current =
          effects;

        pendingLabelRef.current =
          label;

        pendingVariantRef.current =
          variant;

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

              const commitRoute = () => {
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
              };

              if (current.effects.includes('view-transition-morph')) {
                startNativeNavigation(commitRoute);
              } else {
                commitRoute();
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
        startNativeNavigation,
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

    // Let native View Transition capture the committed destination geometry.
    resolveNativeUpdate();

    const pendingEffect =
      pendingEffectRef.current;

    const pendingEffects =
      pendingEffectsRef.current;

    const pendingLabel =
      pendingLabelRef.current;

    const pendingVariant =
      pendingVariantRef.current;

    const pendingVideo =
      pendingVideoRef.current;

    const pendingMarqueeSeed =
      pendingMarqueeSeedRef.current;

    const marqueeSeed =
      pendingMarqueeSeed ??
      videoIndexRef.current++;

    pendingEffectRef.current =
      null;

    pendingEffectsRef.current =
      null;

    pendingLabelRef.current =
      null;

    pendingVariantRef.current =
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

      pendingEffects ??
        getTransitionCompositionForPath(
          pathname ?? '/',
        ),

      pendingLabel ??
        getTransitionLabelForPath(
          pathname ?? '/',
        ),

      pendingVariant ??
        getTransitionVariantForPath(
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
    resolveNativeUpdate,
  ]);

  usePageTransitionLinkCapture(navigate, transitionRef);

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
