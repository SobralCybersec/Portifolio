import React from 'react';
import { Github } from 'lucide-react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import Hero from '../home/Hero';
import AboutParticleField from '../about/AboutParticleField';
import AboutScrollStory from '../about/AboutScrollStory';
import ClickSpark from '../contact/ClickSpark';
import ContactCommandForm from '../contact/ContactCommandForm';
import GameLoadingScreen from '../loading-screen/GameLoadingScreen';
import LoadingScreenDemo from '../loading-screen/LoadingScreenDemo';
import { getRandomLoadingMessage, LOADING_MESSAGES } from '../loading-screen/loadingMessages';

jest.mock('@/components/texts/AnimatedText', () => {
  const React = require('react');
  const passthrough = ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children);
  return {
    AnimatedText: passthrough,
    GradientText: ({ children }: { children: React.ReactNode }) => React.createElement('span', null, children),
  };
});
jest.mock('@/components/texts/Typewriter', () => ({
  Typewriter: ({ text }: { text: string }) => <span>{text}</span>,
}));
jest.mock('@/components/effects/LetterGlitch', () => ({ __esModule: true, default: () => <div data-testid="letter-glitch" /> }));
jest.mock('@/components/effects/ScrollVelocityRibbon', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/components/home/MetricsTicker', () => ({ __esModule: true, default: () => <div data-testid="metrics" /> }));
jest.mock('@/components/ui/MagneticButton', () => ({
  __esModule: true,
  default: ({ children, href, type = 'button', onClick, disabled }: any) => href
    ? <a href={href}>{children}</a>
    : <button type={type} onClick={onClick} disabled={disabled}>{children}</button>,
}));

jest.mock('three', () => {
  class Renderer {
    setClearColor = jest.fn();
    setPixelRatio = jest.fn();
    setSize = jest.fn();
    render = jest.fn();
    dispose = jest.fn();
    constructor(_options: unknown) {}
  }
  class Scene { add = jest.fn(); }
  class Camera {
    position = { set: jest.fn() };
    aspect = 1;
    updateProjectionMatrix = jest.fn();
  }
  class Geometry {
    attributes: Record<string, unknown> = {};
    setAttribute = (name: string, value: unknown) => { this.attributes[name] = value; };
    dispose = jest.fn();
  }
  class Attribute { constructor(public data: unknown, public size: number) {} }
  class Material {
    uniforms: Record<string, { value: number }>;
    constructor(options: any) { this.uniforms = options.uniforms; }
    dispose = jest.fn();
  }
  class Points {
    frustumCulled = true;
    position = { x: 0, y: 0, setScalar: jest.fn() };
    scale = { setScalar: jest.fn() };
    rotation = { x: 0, y: 0, z: 0 };
    constructor(public geometry: unknown, public material: unknown) {}
  }
  class Timer {
    private elapsed = 0;
    connect = jest.fn();
    disconnect = jest.fn();
    update = (time: number) => { this.elapsed = time / 1000; };
    getElapsed = () => this.elapsed;
    getDelta = () => 0.016;
  }
  return {
    WebGLRenderer: Renderer,
    Scene,
    PerspectiveCamera: Camera,
    BufferGeometry: Geometry,
    BufferAttribute: Attribute,
    ShaderMaterial: Material,
    Points,
    Timer,
    AdditiveBlending: 2,
    MathUtils: { lerp: (from: number, to: number, amount: number) => from + (to - from) * amount },
  };
});

const rafCallbacks = new Map<number, FrameRequestCallback>();
let rafId = 1;
let originalRaf: typeof window.requestAnimationFrame | undefined;
let originalCancel: typeof window.cancelAnimationFrame | undefined;
const defaultMatchMedia = window.matchMedia;
const defaultResizeObserver = (globalThis as any).ResizeObserver;

function installRaf() {
  originalRaf = window.requestAnimationFrame;
  originalCancel = window.cancelAnimationFrame;
  rafCallbacks.clear();
  rafId = 1;
  const request = (callback: FrameRequestCallback) => {
    const id = rafId++;
    rafCallbacks.set(id, callback);
    return id;
  };
  const cancel = (id: number) => { rafCallbacks.delete(id); };
  Object.defineProperty(window, 'requestAnimationFrame', { configurable: true, value: request });
  Object.defineProperty(window, 'cancelAnimationFrame', { configurable: true, value: cancel });
  Object.defineProperty(global, 'requestAnimationFrame', { configurable: true, value: request });
  Object.defineProperty(global, 'cancelAnimationFrame', { configurable: true, value: cancel });
}

function restoreRaf() {
  rafCallbacks.clear();
  Object.defineProperty(window, 'requestAnimationFrame', { configurable: true, value: originalRaf });
  Object.defineProperty(window, 'cancelAnimationFrame', { configurable: true, value: originalCancel });
  Object.defineProperty(global, 'requestAnimationFrame', { configurable: true, value: originalRaf });
  Object.defineProperty(global, 'cancelAnimationFrame', { configurable: true, value: originalCancel });
}

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
  if (originalRaf) restoreRaf();
  Object.assign(window, { matchMedia: defaultMatchMedia });
  Object.defineProperty(global, 'ResizeObserver', { configurable: true, value: defaultResizeObserver });
  document.documentElement.classList.remove('light');
  document.body.innerHTML = '';
});

describe('coverage-heavy visual components', () => {
  test('renders Hero in localized light and dark states, with stats success and failure', async () => {
    const themes = jest.requireMock('next-themes') as { useTheme: jest.Mock };
    const routing = jest.requireMock('@/i18n/config/routing') as { usePathname: jest.Mock };
    jest.spyOn(themes, 'useTheme').mockReturnValue({ theme: 'light' });
    jest.spyOn(routing, 'usePathname').mockReturnValue('/pt');
    global.fetch = jest.fn().mockResolvedValue({ json: async () => ({ publicRepos: 12, yearsActive: 6, totalCommits: 3456 }) });

    const { rerender } = render(<Hero animateSection="hero" />);
    await waitFor(() => expect(screen.getByText('12+')).toBeInTheDocument());
    expect(screen.getByRole('link', { name: 'cta.downloadCV' })).toHaveAttribute('href', '/cv/cv.pdf');
    expect(screen.getByAltText('Matheus Sobral — Developer')).toHaveAttribute('src', '/images/JinWoo-BackFacing3.png');

    jest.spyOn(themes, 'useTheme').mockReturnValue({ theme: 'dark' });
    jest.spyOn(routing, 'usePathname').mockReturnValue('/en');
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
    rerender(<Hero />);
    await act(async () => {});
    expect(screen.getByRole('link', { name: 'cta.downloadCV' })).toHaveAttribute('href', '/cv/cven.pdf');
    expect(screen.getByTestId('letter-glitch')).toBeInTheDocument();
  });

  test('covers loading messages, image selection, progress animation, completion, and demo restart', () => {
    jest.useFakeTimers();
    installRaf();
    jest.spyOn(performance, 'now').mockReturnValue(0);
    jest.spyOn(Math, 'random').mockReturnValue(0);
    document.documentElement.classList.add('light');
    const complete = jest.fn();
    const { unmount } = render(<GameLoadingScreen renderSrc="/fallback.png" duration={100} onComplete={complete} />);

    act(() => jest.advanceTimersByTime(0));
    expect(screen.getByAltText('')).toHaveAttribute('src', '/images/JinWoo-BackFacing3.png');
    let callback: FrameRequestCallback | undefined = [...rafCallbacks.values()][0];
    act(() => callback?.(40));
    expect(screen.getByText('40')).toBeInTheDocument();
    callback = [...rafCallbacks.values()].at(-1);
    act(() => callback?.(100));
    expect(screen.getByRole('status')).toHaveClass('sl-loading-screen--leaving');
    expect(screen.getByText('100')).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(650));
    expect(complete).toHaveBeenCalledTimes(1);
    unmount();

    render(<LoadingScreenDemo />);
    act(() => jest.advanceTimersByTime(0));
    callback = [...rafCallbacks.values()].at(-1);
    act(() => callback?.(3000));
    act(() => jest.advanceTimersByTime(650));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Test loading screen' }));
    expect(screen.getByRole('status')).toBeInTheDocument();

    jest.spyOn(Math, 'random').mockReturnValue(-1);
    expect(getRandomLoadingMessage()).toEqual(LOADING_MESSAGES[0]);
    jest.spyOn(Math, 'random').mockReturnValue(0.99);
    expect(getRandomLoadingMessage().kind).toBe('practice');
    restoreRaf();
  });

  test('runs WebGL particle setup, pointer/resize rendering, reduced motion, and cleanup', () => {
    installRaf();
    const framer = jest.requireMock('framer-motion') as { useReducedMotion: jest.Mock };
    jest.spyOn(framer, 'useReducedMotion').mockReturnValue(false);
    const { container, unmount } = render(
      <AboutParticleField particleColors={['#abc', '#aabbcc']} particleCount={2} particleSpread={1.2} speed={0.5} hoverFactor={0.4} />,
    );
    fireEvent.pointerMove(window, { clientX: 20, clientY: 30, pointerType: 'mouse' });
    fireEvent.pointerMove(window, { clientX: 20, clientY: 30, pointerType: 'touch' });
    fireEvent(window, new Event('resize'));
    act(() => [...rafCallbacks.values()].forEach((callback) => callback(100)));
    expect(container.querySelector('canvas')).toBeInTheDocument();
    unmount();

    jest.spyOn(framer, 'useReducedMotion').mockReturnValue(true);
    const reduced = render(<AboutParticleField particleCount={0} particleColors={[]} />);
    expect(reduced.container.querySelector('canvas')).toBeInTheDocument();
    reduced.unmount();
    restoreRaf();
  });

  test('covers click sparks, resize observer fallback, and contact form interactions', () => {
    installRaf();
    let resizeObserverCallback: (() => void) | undefined;
    class TestResizeObserver {
      constructor(callback: () => void) { resizeObserverCallback = callback; }
      observe = jest.fn();
      disconnect = jest.fn();
    }
    Object.defineProperty(global, 'ResizeObserver', { configurable: true, value: TestResizeObserver });
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({
      width: 120, height: 80, top: 10, left: 20, right: 140, bottom: 90, x: 20, y: 10,
      toJSON: () => ({}),
    }));

    const { container, unmount } = render(<ClickSpark sparkCount={4} duration={100}><span>spark</span></ClickSpark>);
    const canvas = container.querySelector('canvas')!;
    expect(canvas.width).toBe(120);
    resizeObserverCallback?.();
    fireEvent.click(screen.getByText('spark'), { clientX: 50, clientY: 60 });
    let callback = [...rafCallbacks.values()].at(-1);
    act(() => callback?.(10));
    callback = [...rafCallbacks.values()].at(-1);
    act(() => callback?.(200));
    unmount();

    Object.defineProperty(global, 'ResizeObserver', { configurable: true, value: undefined });
    const fallback = render(<ClickSpark><span>fallback</span></ClickSpark>);
    fireEvent(window, new Event('resize'));
    fallback.unmount();

    const reducedMatchMedia = window.matchMedia;
    Object.assign(window, { matchMedia: () => ({ matches: true, addListener: jest.fn(), removeListener: jest.fn() }) });
    const reduced = render(<ClickSpark><span>reduced</span></ClickSpark>);
    fireEvent.click(screen.getByText('reduced'));
    reduced.unmount();
    Object.assign(window, { matchMedia: reducedMatchMedia });

    const nullContext = jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null);
    const empty = render(<ClickSpark><span>empty</span></ClickSpark>);
    fireEvent.click(screen.getByText('empty'));
    empty.unmount();
    nullContext.mockRestore();

    const mail = render(
      <ContactCommandForm title="Contact" description="Description" emailAddress="hello@example.test" emailLabel="Email" links={[{ label: 'GitHub', href: 'https://example.test', icon: Github }]} />,
    );
    const name = screen.getByLabelText('IDENTITY');
    const email = screen.getByLabelText('EMAIL');
    const message = screen.getByLabelText('PROJECT BRIEF');
    fireEvent.focus(name);
    fireEvent.change(name, { target: { value: 'Ada' } });
    fireEvent.change(email, { target: { value: 'ada@example.test' } });
    fireEvent.change(message, { target: { value: 'Build it' } });
    fireEvent.pointerMove(mail.container.querySelector('[data-contact-shell]')!, { pointerType: 'touch' });
    fireEvent.pointerMove(mail.container.querySelector('[data-contact-shell]')!, { pointerType: 'mouse', clientX: 35, clientY: 45 });
    fireEvent.blur(name);
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    fireEvent.submit(mail.container.querySelector('form')!);
    expect(screen.getByText('DRAFT READY')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('target', '_blank');
    consoleError.mockRestore();
    mail.unmount();
    restoreRaf();
  });

  test('covers reduced-motion story path and empty story guard', () => {
    const originalMatchMedia = window.matchMedia;
    Object.assign(window, { matchMedia: (query: string) => ({ matches: query.includes('prefers-reduced-motion'), addListener: jest.fn(), removeListener: jest.fn() }) });
    const story = render(<AboutScrollStory items={[{ label: '01', title: 'Title', body: 'Body', signal: 'Signal', detail: 'Detail' }, { label: '02', title: 'Next', body: 'Next body', signal: 'Next signal', detail: 'Next detail', image: '/story.png' }]} sectionLabel="STORY" prompt="Scroll" traceLabel="Trace" />);
    fireEvent.pointerMove(screen.getByText('Title').closest('article')!, { pointerType: 'touch' });
    expect(story.getByRole('region', { name: 'STORY' })).toBeInTheDocument();
    story.unmount();
    render(<AboutScrollStory items={[]} sectionLabel="EMPTY" prompt="Scroll" />);
    expect(screen.getByRole('region', { name: 'EMPTY' })).toBeInTheDocument();
    Object.assign(window, { matchMedia: originalMatchMedia });
  });
});
