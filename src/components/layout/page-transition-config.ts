export type TransitionName =
  | 'letterbox'
  | 'monocolor-wipe'
  | 'black-white-slice'
  | 'marquee-stripes'
  | 'loading-screen';

export type TransitionPhase = 'cover' | 'hold' | 'reveal';

export interface ActiveTransition {
  effect: TransitionName;
  video: string;
  marqueeSeed: number;
  phase: TransitionPhase;
  id: number;
}

export interface TransitionTiming {
  coverMs: number;
  revealMs: number;
}

export const TRANSITION_VIDEOS = [
  '/videos/05-solo-leveling-hd-animated-wallpaper.mp4',
  '/videos/artwork-solo-leveling-saison-2-hd-animated-wallpaper.mp4',
  '/videos/jin-woo-shadows-might.1920x1080.mp4',
  '/videos/personnage-sung-jin-woo-et-han-song-yi-solo-leveling-hd-animated-wallpaper.mp4',
  '/videos/shadow-king-sung-jin-woo.1920x1080.mp4',
  '/videos/solo-leveling-personnage-sung-jin-woo-et-logo-hd-animated-wallpaper.mp4',
  '/videos/sung-jin-woo-darkness.1920x1080.mp4',
  '/videos/sung-jin-woo-personnage-et-logo-solo-leveling-hd-animated-wallpaper.mp4',
  '/videos/sung-jinwoo-in-forest.1920x1080.mp4',
] as const;

export const MOSAIC_VIDEOS = [
  ...TRANSITION_VIDEOS,
  '/videos/Solo leveling(1).mp4',
  '/videos/Solo leveling(2).mp4',
  '/videos/Solo leveling.mp4',
  '/videos/sololeveling.mp4',
  '/videos/sololeveling2.mp4',
  '/videos/sololeveling3.mp4',
] as const;

export const MARQUEE_COPIES = [
  'PORTFOLIO · SIGNAL · PORTFOLIO · SIGNAL · ',
  'BUILD / SHIP / LEARN / BUILD / ',
  'PROJECTS · SYSTEMS · PROJECTS · SYSTEMS · ',
  'LEVEL UP / FOCUS / LEVEL UP / ',
  'SHADOWS · MOTION · SHADOWS · MOTION · ',
  'SYSTEMS / SHADOWS / SYSTEMS / ',
  'MOVE / BREAK / ASCEND / ',
] as const;

/** Single source of truth for cover and reveal timing. */
export const TRANSITION_TIMINGS: Record<TransitionName, TransitionTiming> = {
  letterbox: { coverMs: 620, revealMs: 700 },
  'monocolor-wipe': { coverMs: 3760, revealMs: 900 },
  'black-white-slice': { coverMs: 600, revealMs: 680 },
  'marquee-stripes': { coverMs: 680, revealMs: 760 },
  'loading-screen': { coverMs: 3000, revealMs: 650 },
};
