export const BONGO_CAT_STYLES = `
  .bongo-cat-shell {
    --bongo-surface: var(--bg-card);
    --bongo-ink: var(--theme-primary);
    --bongo-accent: var(--theme-accent);
    --bongo-dark: var(--bg-dark);
    --bongo-muted: var(--text-muted);

    position: relative;
    aspect-ratio: 1.16;
    min-height: 0;
    overflow: hidden;
    border: 1px solid var(--border);
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 10%, transparent), transparent 44%),
      var(--bg-card);
    isolation: isolate;
  }

  .bongo-cat-shell::before,
  .bongo-cat-shell::after {
    content: '';
    position: absolute;
    pointer-events: none;
  }

  .bongo-cat-shell::before {
    inset: 0;
    z-index: 0;
    background: linear-gradient(
      90deg,
      transparent,
      color-mix(in srgb, var(--theme-primary) 10%, transparent),
      transparent
    );
    transform: translateX(-100%);
    animation: bongo-scan 7s ease-in-out infinite;
  }

  .bongo-cat-shell::after {
    inset: 0.8rem;
    z-index: 0;
    border: 1px solid color-mix(in srgb, var(--theme-primary) 22%, transparent);
  }

  .bongo-cat-frame {
    position: relative;
    z-index: 1;
    display: flex;
    height: 100%;
    flex-direction: column;
    padding: 0.8rem 1rem 0;
  }

  .bongo-cat-topline {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    justify-content: space-between;
    gap: 1rem;
    color: var(--text-muted);
    font: 600 0.625rem/1 var(--font-geist-mono), monospace;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .bongo-cat-dots {
    display: inline-flex;
    gap: 0.45rem;
    margin-bottom: 2rem;
    padding-top: 0.5rem;
    padding-left: 0.35rem;
  }

  .bongo-cat-dots i {
    width: 0.42rem;
    height: 0.42rem;
    border-radius: 999px;
    background: var(--theme-primary);
    opacity: 0.7;
  }

  .bongo-cat-dots i:nth-child(2) {
    background: var(--theme-accent);
  }

  .bongo-cat-dots i:nth-child(3) {
    opacity: 0.35;
  }

  #bongo-cat {
    display: block;
    width: min(100%, 54rem);
    height: auto;
    margin: 0 auto;
    overflow: visible;
  }

  /* Re-theme original illustration without changing its geometry. */
  #bongo-cat [fill='#fff'],
  #bongo-cat [fill='#f2f2f2'] {
    fill: var(--bongo-surface);
  }

  #bongo-cat [fill='#231f20'] {
    fill: var(--bongo-dark);
  }

  #bongo-cat [fill='#3e3e54'] {
    fill: color-mix(in srgb, var(--theme-primary) 35%, var(--bg-dark));
  }

  #bongo-cat [fill='#ef97b0'] {
    fill: var(--bongo-accent);
  }

  #head__outline > path:last-child,
  #mouth > path:last-child,
  #table > path:last-child,
  #laptop__base > path,
  #paw-right path:not([fill]),
  #paw-left path:not([fill]),
  #laptop__terminal > path {
    fill: var(--bongo-ink);
  }

  #eyes {
    fill: var(--bongo-accent);
  }

  #laptop__keyboard polygon[stroke='#000'] {
    stroke: var(--bongo-ink);
  }

  #laptop__code {
    transform: rotateX(-37deg) rotateY(-46deg) rotateZ(-23deg)
      translateX(8px) translateY(20px) translateZ(-50px);
    transform-box: fill-box;
    transform-origin: center;
  }

  #laptop__code > g {
    stroke: var(--bongo-accent);
  }

  .typing-animation {
    animation-duration: 1.2s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    stroke-linecap: round;
  }

  #f1-l1 { animation-name: typing-f1-l1; }
  #f1-l2 { animation-name: typing-f1-l2; }
  #f1-l3 { animation-name: typing-f1-l3; }
  #f2-l4 { animation-name: typing-f2-l4; }
  #f2-l5 { animation-name: typing-f2-l5; }
  #f2-l6 { animation-name: typing-f2-l6; }
  #f3-l7 { animation-name: typing-f3-l7; }
  #f3-l8 { animation-name: typing-f3-l8; }
  #f3-l9 { animation-name: typing-f3-l9; }

  #paw-right--up,
  #paw-right--down,
  #paw-left--up,
  #paw-left--down {
    animation: bongo-blink 300ms steps(1, end) infinite;
  }

  #paw-right--up,
  #paw-left--down {
    animation-delay: 150ms;
  }

  @keyframes typing-f1-l1 {
    0% { stroke-dashoffset: 1; }
    14%, 100% { stroke-dashoffset: 0; }
  }

  @keyframes typing-f1-l2 {
    0%, 14% { stroke-dashoffset: 1; }
    24%, 100% { stroke-dashoffset: 0; }
  }

  @keyframes typing-f1-l3 {
    0%, 24% { stroke-dashoffset: 1; }
    30%, 100% { stroke-dashoffset: 0; }
  }

  @keyframes typing-f2-l4 {
    0%, 30% { stroke-dashoffset: 1; }
    44%, 100% { stroke-dashoffset: 0; }
  }

  @keyframes typing-f2-l5 {
    0%, 44% { stroke-dashoffset: 1; }
    54%, 100% { stroke-dashoffset: 0; }
  }

  @keyframes typing-f2-l6 {
    0%, 54% { stroke-dashoffset: 1; }
    60%, 100% { stroke-dashoffset: 0; }
  }

  @keyframes typing-f3-l7 {
    0%, 60% { stroke-dashoffset: 1; }
    68%, 100% { stroke-dashoffset: 0; }
  }

  @keyframes typing-f3-l8 {
    0%, 68% { stroke-dashoffset: 1; }
    82%, 100% { stroke-dashoffset: 0; }
  }

  @keyframes typing-f3-l9 {
    0%, 82% { stroke-dashoffset: 1; }
    92%, 100% { stroke-dashoffset: 0; }
  }

  @keyframes bongo-blink {
    0%, 49% { opacity: 0; }
    50%, 100% { opacity: 1; }
  }

  @keyframes bongo-scan {
    0%, 18% { transform: translateX(-100%); }
    48%, 68% { transform: translateX(100%); }
    100% { transform: translateX(100%); }
  }

  @media (max-width: 640px) {
    .bongo-cat-shell {
      min-height: 0;
    }

    .bongo-cat-frame {
      padding-inline: 0.55rem;
    }

    .bongo-cat-topline {
      font-size: 0.5rem;
      letter-spacing: 0.14em;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .bongo-cat-shell::before,
    .typing-animation,
    #paw-right--up,
    #paw-right--down,
    #paw-left--up,
    #paw-left--down {
      animation: none !important;
    }

    .typing-animation {
      stroke-dashoffset: 0;
    }

    #paw-right--up,
    #paw-left--up {
      opacity: 0;
    }

    #paw-right--down,
    #paw-left--down {
      opacity: 1;
    }
  }
`;
