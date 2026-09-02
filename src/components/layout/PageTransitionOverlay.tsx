'use client';

import type { CSSProperties } from 'react';
import GameLoadingScreen from '@/components/loading-screen/GameLoadingScreen';
import {
  MARQUEE_COPIES,
  MOSAIC_GIFS,
  MOSAIC_VIDEOS,
  TRANSITION_TIMINGS,
} from './page-transition-config';
import type { ActiveTransition, TransitionEffect } from './page-transition-config';

function rotateMedia(media: readonly string[], seed: number) {
  const offset = seed % media.length;

  return [
    ...media.slice(offset),
    ...media.slice(0, offset),
  ];
}

function getMosaicMedia(seed: number) {
  const videos = rotateMedia(MOSAIC_VIDEOS, seed);
  const gifs = rotateMedia(MOSAIC_GIFS, seed);

  return Array.from({ length: 6 }, (_, index) => ({
    src: index % 2 === 0 ? videos[index / 2] : gifs[Math.floor(index / 2)],
    type: index % 2 === 0 ? 'video' as const : 'gif' as const,
  }));
}

function getMarqueeCopies(seed: number) {
  const copies = [...MARQUEE_COPIES];

  for (
    let index = copies.length - 1;
    index > 0;
    index -= 1
  ) {
    const swapIndex =
      (seed * 13 + index * 7) %
      (index + 1);

    [
      copies[index],
      copies[swapIndex],
    ] = [
      copies[swapIndex],
      copies[index],
    ];
  }

  return copies;
}

function hasEffect(
  effects: readonly TransitionEffect[],
  effect: TransitionEffect,
) {
  return effects.includes(effect);
}

export default function PortfolioTransition({
  transition,
}: {
  transition: ActiveTransition;
}) {
  const marqueeCopies = getMarqueeCopies(
    transition.marqueeSeed,
  );

  const mosaicMedia = getMosaicMedia(
    transition.marqueeSeed,
  );

  const timing =
    TRANSITION_TIMINGS[transition.effect];

  /**
   * CSS can consume these variables too.
   *
   * This prevents React timing and CSS timing from drifting apart.
   *
   * Example:
   *
   * animation-duration: var(--portfolio-cover-duration);
   *
   * animation-duration: var(--portfolio-reveal-duration);
   */
  const transitionStyle = {
    '--portfolio-cover-duration':
      `${timing.coverMs}ms`,

    '--portfolio-reveal-duration':
      `${timing.revealMs}ms`,
  } as CSSProperties;

  return (
    <div
      key={transition.id}
      className="portfolio-transition"
      data-effect={transition.effect}
      data-effects={transition.effects.join(' ')}
      data-variant={transition.variant}
      data-phase={transition.phase}
      style={transitionStyle}
      aria-hidden="true"
    >
      {transition.effect === 'view-transition-morph' ? null : transition.effect === 'loading-screen' ? (
        <GameLoadingScreen
          renderSrc="/images/JinWoo-BackFacing3.png"
          duration={timing.coverMs}
        />
      ) : transition.effect === 'monocolor-wipe' ? (
        <div
          className="portfolio-transition__manga-mosaic"
          data-layout={transition.marqueeSeed % 4}
        >
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className={`portfolio-transition__manga-panel portfolio-transition__manga-panel--${String.fromCharCode(97 + index)}`}
              data-media-type={mosaicMedia[index].type}
              style={{ '--manga-index': index } as CSSProperties}
            >
              {mosaicMedia[index].type === 'gif' ? (
                // Native image keeps animated GIF frames intact.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="portfolio-transition__manga-panel-media"
                  src={mosaicMedia[index].src}
                  alt=""
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              ) : (
                <video
                  className="portfolio-transition__manga-panel-media"
                  width={1920}
                  height={1080}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                >
                  <source src={mosaicMedia[index].src} type="video/mp4" />
                </video>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="portfolio-transition__video-frame">
          <video
            className="portfolio-transition__video"
            width={1920}
            height={1080}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src={transition.video} type="video/mp4" />
          </video>
        </div>
      )}

      {transition.effect === 'letterbox' && (
        <>
          <div
            className="
              portfolio-transition__letterbox
              portfolio-transition__letterbox--top
            "
          />

          <div
            className="
              portfolio-transition__letterbox
              portfolio-transition__letterbox--bottom
            "
          />
        </>
      )}

      {transition.effect ===
        'marquee-stripes' && (
        <div className="portfolio-transition__marquee">
          {marqueeCopies.map(
            (copy, index) => {
              const variant =
                String.fromCharCode(
                  97 + index,
                );

              return (
                <div
                  key={variant}
                  className={`
                    portfolio-transition__marquee-line
                    portfolio-transition__marquee-line--${variant}
                  `}
                  style={
                    {
                      '--marquee-index':
                        index,
                    } as CSSProperties
                  }
                >
                  <span>{copy}</span>
                </div>
              );
            },
          )}
        </div>
      )}

      {hasEffect(transition.effects, 'fourth-wall-frames') && (
        <div className="portfolio-transition__wall-layer" data-effect-layer="fourth-wall-frames">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="portfolio-transition__wall-frame"
              style={{ '--wall-index': index } as CSSProperties}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
            </div>
          ))}
        </div>
      )}

      {hasEffect(transition.effects, 'fourth-wall-typography') && (
        <div className="portfolio-transition__type-layer" data-effect-layer="fourth-wall-typography">
          <span className="portfolio-transition__type-word" style={{ '--type-index': 0 } as CSSProperties}>
            {transition.label}
          </span>
          <span className="portfolio-transition__type-word portfolio-transition__type-word--inverse" style={{ '--type-index': 1 } as CSSProperties}>
            / {transition.label}
          </span>
          <i className="portfolio-transition__type-fissure" />
        </div>
      )}
    </div>
  );
}
