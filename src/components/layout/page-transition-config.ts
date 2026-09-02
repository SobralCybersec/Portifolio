export type TransitionEffect =
  | 'letterbox'
  | 'monocolor-wipe'
  | 'black-white-slice'
  | 'marquee-stripes'
  | 'loading-screen'
  | 'fourth-wall-frames'
  | 'fourth-wall-typography'
  | 'view-transition-morph';

export type TransitionName = TransitionEffect;

export type TransitionPhase = 'cover' | 'hold' | 'reveal';

export interface ActiveTransition {
  effect: TransitionName;
  effects: readonly TransitionEffect[];
  label: string;
  variant: number;
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

export const MOSAIC_GIFS = [
  '/images/gifs/jinwoo1.gif',
  '/images/gifs/jinwoo19.gif',
  '/images/gifs/jinwoo20.gif',
  '/images/gifs/jinwoo21.gif',
  '/images/gifs/jinwoo22.gif',
  '/images/gifs/jinwoo23.gif',
  '/images/gifs/jinwoo24.gif',
  '/images/gifs/jinwoo25.gif',
  '/images/gifs/jinwoo26.gif',
  '/images/gifs/jinwoo27.gif',
  '/images/gifs/jinwoo28.gif',
  '/images/gifs/jinwoo29.gif',
  '/images/gifs/jinwoo30.gif',
  '/images/gifs/jinwoo31.gif',
  '/images/gifs/jinwoo32.gif',
  '/images/gifs/jinwoo33.gif',
  '/images/gifs/jinwoogf.gif',
  '/images/gifs/jinwoogf2.gif',
  '/images/gifs/jinwoogf3.gif',
  '/images/gifs/jinwoogf4.gif',
  '/images/gifs/jinwoogf5.gif',
  '/images/gifs/jinwoogf6.gif',
  '/images/gifs/jinwoogif7.gif',
  '/images/gifs/jinwoogif8.gif',
  '/images/gifs/jinwoogif9.gif',
  '/images/gifs/jinwoogif10.gif',
  '/images/gifs/jinwoogif11.gif',
  '/images/gifs/jinwoogif12.gif',
  '/images/gifs/jinwoogif13.gif',
  '/images/gifs/jinwoogif14.gif',
  '/images/gifs/jinwoogif15.gif',
  '/images/gifs/jinwoogif16.gif',
  '/images/gifs/jinwoogif17.gif',
  '/images/gifs/jinwoogif18.gif',
  '/images/gifs/jinwoogif67.gif',
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

/** Legacy default effect per route. Kept stable for direct loads and tests. */
export const PAGE_TRANSITIONS: Record<string, TransitionEffect> = {
  '/': 'letterbox',
  '/about': 'monocolor-wipe',
  '/projects': 'marquee-stripes',
  '/blog': 'marquee-stripes',
  '/certifications': 'black-white-slice',
  '/contact': 'monocolor-wipe',
  '/chat': 'loading-screen',
};

/** Each entry is one complete transition. Navigation selects exactly one. */
export const PAGE_TRANSITION_VARIANTS: Record<
  string,
  readonly (readonly TransitionEffect[])[]
> = {
  '/': [['letterbox'], ['fourth-wall-frames'], ['view-transition-morph']],
  '/about': [
    ['monocolor-wipe'],
    ['fourth-wall-typography'],
    ['fourth-wall-frames'],
    ['view-transition-morph'],
    ['monocolor-wipe', 'fourth-wall-typography'],
  ],
  '/projects': [
    ['marquee-stripes'],
    ['fourth-wall-frames'],
    ['fourth-wall-typography'],
    ['black-white-slice'],
    ['monocolor-wipe', 'fourth-wall-typography'],
  ],
  '/blog': [
    ['marquee-stripes'],
    ['fourth-wall-frames'],
    ['fourth-wall-typography'],
    ['black-white-slice'],
    ['monocolor-wipe', 'fourth-wall-typography'],
  ],
  '/certifications': [
    ['black-white-slice'],
    ['fourth-wall-frames'],
    ['fourth-wall-typography'],
    ['letterbox'],
    ['monocolor-wipe', 'fourth-wall-typography'],
  ],
  '/contact': [
    ['monocolor-wipe'],
    ['fourth-wall-frames'],
    ['fourth-wall-typography'],
    ['view-transition-morph'],
    ['monocolor-wipe', 'fourth-wall-typography'],
  ],
  '/chat': [
    ['loading-screen'],
    ['fourth-wall-frames'],
    ['fourth-wall-typography'],
    ['view-transition-morph'],
    ['monocolor-wipe', 'fourth-wall-typography'],
  ],
};

/** Single source of truth for cover and reveal timing. */
export const TRANSITION_TIMINGS: Record<TransitionName, TransitionTiming> = {
  letterbox: { coverMs: 620, revealMs: 700 },
  'monocolor-wipe': { coverMs: 960, revealMs: 760 },
  'black-white-slice': { coverMs: 600, revealMs: 680 },
  'marquee-stripes': { coverMs: 680, revealMs: 760 },
  'loading-screen': { coverMs: 3000, revealMs: 650 },
  'fourth-wall-frames': { coverMs: 620, revealMs: 620 },
  'fourth-wall-typography': { coverMs: 540, revealMs: 540 },
  'view-transition-morph': { coverMs: 0, revealMs: 420 },
};
