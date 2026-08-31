'use client';

import type { CSSProperties } from 'react';
import GameLoadingScreen from '@/components/loading-screen/GameLoadingScreen';
import {
  MARQUEE_COPIES,
  MOSAIC_VIDEOS,
  TRANSITION_TIMINGS,
} from './page-transition-config';
import type { ActiveTransition } from './page-transition-config';

function getMosaicVideos(seed: number) {
  const offset = seed % MOSAIC_VIDEOS.length;

  return [
    ...MOSAIC_VIDEOS.slice(offset),
    ...MOSAIC_VIDEOS.slice(0, offset),
  ];
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

export default function PortfolioTransition({
  transition,
}: {
  transition: ActiveTransition;
}) {
  const marqueeCopies = getMarqueeCopies(
    transition.marqueeSeed,
  );

  const mosaicVideos = getMosaicVideos(
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
      data-phase={transition.phase}
      style={transitionStyle}
      aria-hidden="true"
    >
      {transition.effect === 'loading-screen' ? (
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
              style={{ '--manga-index': index } as CSSProperties}
            >
              <video
                className="portfolio-transition__manga-panel-video"
                width={1920}
                height={1080}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              >
                <source src={mosaicVideos[index]} type="video/mp4" />
              </video>
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
        'black-white-slice' && (
        <>
          <div
            className="
              portfolio-transition__split-panel
              portfolio-transition__split-panel--left
            "
          />

          <div
            className="
              portfolio-transition__split-panel
              portfolio-transition__split-panel--right
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
    </div>
  );
}

