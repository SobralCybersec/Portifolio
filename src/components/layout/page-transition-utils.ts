"use client";

import { createContext } from 'react';

/**
 * Shared route layer built from Cinematic Letterbox,
 * Monocolor Editorial Wipe,
 * Grayscale Media Reveal,
 * and Kinetic Marquee Stripes source overlays.
 */
export type { ActiveTransition, TransitionEffect, TransitionName, TransitionTiming } from './page-transition-config';
import type { ActiveTransition, TransitionEffect, TransitionName } from './page-transition-config';
import {
  PAGE_TRANSITIONS,
  PAGE_TRANSITION_VARIANTS,
  TRANSITION_TIMINGS,
  TRANSITION_VIDEOS,
} from './page-transition-config';
export interface NavigationOptions {
  replace?: boolean;
  commit?: () => void;
}

export interface PageTransitionContextValue {
  navigate: (href: string, options?: NavigationOptions) => boolean;
  isTransitioning: boolean;
}

const ROUTE_TRANSITIONS: Record<string, TransitionName> = {
  '/': 'letterbox',
  '/about': 'monocolor-wipe',
  '/projects': 'marquee-stripes',
  '/blog': 'marquee-stripes',
  '/certifications': 'black-white-slice',
  '/contact': 'monocolor-wipe',
  '/chat': 'loading-screen',
};

const ROUTE_LABELS: Record<string, string> = {
  '/': 'HOME',
  '/about': 'ABOUT',
  '/projects': 'PROJECTS',
  '/blog': 'BLOG',
  '/certifications': 'CERTIFICATIONS',
  '/contact': 'CONTACT',
  '/chat': 'CHAT',
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

export const FAILSAFE_MS = 10000;

export interface NativeViewTransition {
  finished: Promise<unknown>;
  skipTransition?: () => void;
}

export interface ViewTransitionDocument {
  startViewTransition?: (
    updateCallback: () => void | Promise<void>,
  ) => NativeViewTransition;
}

export const PageTransitionContext =
  createContext<PageTransitionContextValue | null>(null);

function getRoutePath(pathname: string) {
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

  return route === '/blog' || route.startsWith('/blog/') ? '/blog' : route;
}

export function getTransitionCompositionForPath(
  pathname: string,
  seed = 0,
): readonly TransitionEffect[] {
  const route = getRoutePath(pathname);
  const variants =
    PAGE_TRANSITION_VARIANTS[route] ?? [[PAGE_TRANSITIONS['/']]];

  return (
    variants[getTransitionVariantForPath(pathname, seed)] ??
    variants[0] ??
    [PAGE_TRANSITIONS['/']]
  );
}

export function getTransitionVariantForPath(
  pathname: string,
  seed = 0,
) {
  const route = getRoutePath(pathname);
  const variants =
    PAGE_TRANSITION_VARIANTS[route] ?? [[PAGE_TRANSITIONS['/']]];

  if (variants.length < 2 || seed === 0) {
    return 0;
  }

  let routeHash = 0;

  for (const character of route) {
    routeHash = (routeHash * 31 + character.charCodeAt(0)) >>> 0;
  }

  let value =
    (routeHash ^ Math.imul(seed, 0x9e3779b9)) >>> 0;

  value ^= value >>> 16;
  value = Math.imul(value, 0x85ebca6b) >>> 0;
  value ^= value >>> 13;

  return (value >>> 0) % variants.length;
}

export function getTransitionForPath(
  pathname: string,
): TransitionName {
  return ROUTE_TRANSITIONS[getRoutePath(pathname)] ?? 'letterbox';
}

export function getTransitionLabelForPath(pathname: string) {
  return ROUTE_LABELS[getRoutePath(pathname)] ?? 'PORTFOLIO';
}

export function prefersReducedMotion() {
  return window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
}

export function resolveInternalUrl(href: string) {
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

export function normalizePath(pathname: string) {
  return pathname === '/'
    ? '/'
    : pathname.replace(/\/+$/, '');
}

export function nextVideo(index: number) {
  return TRANSITION_VIDEOS[
    index % TRANSITION_VIDEOS.length
  ];
}
