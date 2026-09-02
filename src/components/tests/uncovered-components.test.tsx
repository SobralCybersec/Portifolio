import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server.node';
import { BackgroundMusic } from '../media/BackgroundMusic';
import DynamicFavicon from '../layout/DynamicFavicon';
import FilterDropdown from '../ui/FilterDropdown';
import HexagonGrid from '../effects/HexagonGrid';
import ImageSlideshow from '../projects/ImageSlideshow';
import KeyboardNav from '../ui/KeyboardNav';
import LanguageSwitcher from '../layout/LanguageSwitcher';
import MatrixBackground from '../effects/MatrixBackground';
import ParticleBackground from '../effects/ParticleBackground';
import SafeImage from '../ui/SafeImage';
import ScrollEffect from '../effects/ScrollEffect';
import ScrollProgress from '../effects/ScrollProgress';
import BongoCat from '../home/BongoCat';
import Skills from '../home/Skills';
import ThemeToggle from '../layout/ThemeToggle';
import { Typewriter, TypewriterLoop } from '../texts/Typewriter';
import { useClickSound } from '../../hooks/audio/useClickSound';

const rafCallbacks = new Map<number, FrameRequestCallback>();
let nextRafId = 1;

beforeAll(() => {
  Object.defineProperty(window, 'requestAnimationFrame', {
    configurable: true,
    value: (callback: FrameRequestCallback) => {
      const id = nextRafId++;
      rafCallbacks.set(id, callback);
      return id;
    },
  });
  Object.defineProperty(window, 'cancelAnimationFrame', {
    configurable: true,
    value: (id: number) => rafCallbacks.delete(id),
  });
  Object.defineProperty(global, 'requestAnimationFrame', {
    configurable: true,
    value: window.requestAnimationFrame,
  });
  Object.defineProperty(global, 'cancelAnimationFrame', {
    configurable: true,
    value: window.cancelAnimationFrame,
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: jest.fn(() => Promise.resolve()),
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'load', {
    configurable: true,
    value: jest.fn(),
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    value: jest.fn(),
  });
});

afterEach(() => {
  rafCallbacks.clear();
  jest.restoreAllMocks();
  localStorage.clear();
  document.head.innerHTML = '';
});

test('covers filter selection, outside click, and icon rendering', () => {
  const onChange = jest.fn();
  render(
    <FilterDropdown
      options={[{ id: 'all', label: 'All' }, { id: 'code', label: 'Code', icon: '/code.png' }]}
      selected="all"
      onChange={onChange}
      placeholder="Choose"
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: /All/i }));
  expect(screen.getByRole('button', { name: /Code/i })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Code/i }));
  expect(onChange).toHaveBeenCalledWith('code');

  fireEvent.click(screen.getByRole('button', { name: /All/i }));
  fireEvent.mouseDown(document.body);
  expect(screen.queryByRole('button', { name: /Code/i })).not.toBeInTheDocument();
});

test('covers filter placeholder when selected option is missing', () => {
  render(<FilterDropdown options={[{ id: 'one', label: 'One' }]} selected="missing" onChange={jest.fn()} placeholder="Choose" />);
  expect(screen.getByRole('button', { name: 'Choose' })).toBeInTheDocument();
});

test('covers filter option without icon and hydrated false effects', () => {
  render(<FilterDropdown options={[{ id: 'one', label: 'One' }]} selected="one" onChange={jest.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'One' }));
  expect(screen.getAllByRole('button', { name: 'One' })).toHaveLength(2);

  const hydration = jest.requireMock('@/hooks/browser/useHydrated') as { useHydrated: jest.Mock };
  jest.spyOn(hydration, 'useHydrated').mockReturnValue(false);
  render(<DynamicFavicon />);
  render(<BackgroundMusic />);
  render(<HexagonGrid />);
  render(<Typewriter text="not hydrated" />);
  render(<TypewriterLoop texts={['not hydrated']} />);
});

test('covers slideshow empty, single, timed, and dot navigation states', () => {
  const { rerender } = render(<ImageSlideshow images={[]} alt="empty" />);
  expect(document.querySelector('.relative')).not.toBeInTheDocument();

  rerender(<ImageSlideshow images={['/one.png']} alt="single" />);
  expect(screen.getByAltText('single - 1')).toBeInTheDocument();

  jest.useFakeTimers();
  rerender(<ImageSlideshow images={['/one.png', 'https://example.test/two.png']} alt="gallery" interval={10} />);
  expect(screen.getByRole('button', { name: 'Go to image 2' })).toBeInTheDocument();
  act(() => jest.advanceTimersByTime(10));
  fireEvent.click(screen.getByRole('button', { name: 'Go to image 1' }));
  jest.useRealTimers();
});

test('covers SafeImage fallback and repeated error handling', () => {
  render(<SafeImage src="https://example.test/image.png" alt="remote" fallbackSrc="/fallback.png" />);
  const image = screen.getByAltText('remote');
  expect(image).toHaveAttribute('src', 'https://example.test/image.png');
  fireEvent.error(image);
  expect(image).toHaveAttribute('src', '/fallback.png');
  fireEvent.error(image);
});

test('covers canvas effects, resize, scroll, and cleanup', () => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 320 });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 180 });
  document.documentElement.classList.add('dark');
  const { unmount: unmountScroll } = render(<ScrollEffect />);
  fireEvent(window, new Event('resize'));
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 40 });
  fireEvent.scroll(window);
  const { unmount: unmountMatrix } = render(<MatrixBackground />);
  const { unmount: unmountParticle } = render(<ParticleBackground />);
  Object.defineProperty(HTMLCanvasElement.prototype, 'offsetWidth', { configurable: true, value: 100 });
  Object.defineProperty(HTMLCanvasElement.prototype, 'offsetHeight', { configurable: true, value: 100 });
  fireEvent(window, new Event('resize'));
  act(() => {
    for (const callback of [...rafCallbacks.values()]) callback(100);
  });
  unmountScroll();
  unmountMatrix();
  unmountParticle();
  document.documentElement.classList.remove('dark');
});

test('covers reduced motion, matrix frame throttling, and particle light theme', () => {
  const framer = jest.requireMock('framer-motion') as { useReducedMotion: jest.Mock };
  jest.spyOn(framer, 'useReducedMotion').mockReturnValue(true);
  render(<MatrixBackground />);

  jest.spyOn(framer, 'useReducedMotion').mockReturnValue(false);
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 16 });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1 });
  jest.spyOn(Math, 'random').mockReturnValue(0.99);
  const { unmount } = render(<MatrixBackground />);
  let callback = [...rafCallbacks.values()].at(-1);
  act(() => callback?.(10));
  for (let i = 0; i < 40; i += 1) {
    callback = [...rafCallbacks.values()].at(-1);
    act(() => callback?.(100 + i * 60));
  }
  unmount();

  const themes = jest.requireMock('next-themes') as { useTheme: jest.Mock };
  jest.spyOn(themes, 'useTheme').mockReturnValue({ theme: 'light', setTheme: jest.fn() });
  const particle = render(<ParticleBackground />);
  fireEvent(window, new Event('resize'));
  act(() => {
    for (const callback of [...rafCallbacks.values()]) callback(100);
  });
  particle.unmount();
});

test('covers canvas early exits and light/dark drawing branches', () => {
  const getContext = jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null);
  const { unmount: unmountScroll } = render(<ScrollEffect />);
  const { unmount: unmountMatrix } = render(<MatrixBackground />);
  unmountScroll();
  unmountMatrix();
  getContext.mockRestore();

  document.documentElement.classList.remove('dark');
  const { unmount } = render(<ScrollEffect />);
  fireEvent.scroll(window);
  fireEvent.scroll(window);
  act(() => {
    for (const callback of [...rafCallbacks.values()]) callback(200);
  });
  unmount();
});

test('covers particle context fallback and explicit light scroll palette', () => {
  const getContext = jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null);
  const particle = render(<ParticleBackground />);
  particle.unmount();
  getContext.mockRestore();

  document.documentElement.classList.remove('dark');
  const scroll = render(<ScrollEffect />);
  fireEvent.scroll(window);
  act(() => {
    for (const callback of [...rafCallbacks.values()]) callback(500);
  });
  scroll.unmount();
});

test('covers HexagonGrid build, resize debounce, sanitization fallback, and cleanup', () => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 180 });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 120 });
  jest.useFakeTimers();
  const { container, unmount } = render(
    <HexagonGrid cellSize={30} lineColor="not-a-color<script>" glowColor="#fff" />,
  );
  expect(container.querySelectorAll('polygon').length).toBeGreaterThan(0);
  expect(renderToString(<HexagonGrid />)).toBe('');
  fireEvent(window, new Event('resize'));
  act(() => jest.advanceTimersByTime(200));
  unmount();
  jest.useRealTimers();
});

test('covers keyboard navigation and menu shortcut', () => {
  const onMenuToggle = jest.fn();
  const section = document.createElement('div');
  section.id = 'live';
  section.scrollIntoView = jest.fn();
  document.body.appendChild(section);
  jest.useFakeTimers();
  render(<KeyboardNav onMenuToggle={onMenuToggle} />);
  fireEvent.keyDown(window, { key: 'ArrowDown' });
  fireEvent.keyDown(window, { key: 'ArrowDown' });
  expect(section.scrollIntoView).toHaveBeenCalled();
  fireEvent.keyDown(window, { key: 'm' });
  expect(onMenuToggle).toHaveBeenCalled();
  act(() => jest.advanceTimersByTime(800));
  fireEvent.keyDown(window, { key: 'k' });
  act(() => jest.advanceTimersByTime(800));
  fireEvent.keyDown(window, { key: 'j' });
  jest.useRealTimers();
  section.remove();
});

test('covers skills derivation and both typewriter hydration branches', () => {
  render(
    <Skills
      repos={[{
        language: 'TypeScript',
        topics: ['next-js', 'spring-boot', 'rust'],
        techStack: ['PostgreSQL', 'micro-service'],
        allLanguages: ['python', 'c++'],
      }]}
    />,
  );
  expect(screen.getByText('title')).toBeInTheDocument();
  expect(screen.getByText('TypeScript')).toBeInTheDocument();
  expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
  render(<Skills repos={[{ language: null, topics: [] }]} />);
  render(<Skills />);

  render(<Typewriter text="Ready" cursor={false} />);
  render(<TypewriterLoop texts={['One', 'Two']} />);
});

test('starts BongoCat motion after its first frame settles', () => {
  jest.useFakeTimers();
  const { container } = render(<BongoCat />);
  const shell = container.querySelector('.bongo-cat-shell');

  expect(container.querySelector('style')).toHaveTextContent('.typing-animation');
  expect(shell).not.toHaveClass('bongo-cat-shell--motion-ready');

  act(() => jest.advanceTimersByTime(320));

  expect(shell).toHaveClass('bongo-cat-shell--motion-ready');
  jest.useRealTimers();
});

test('covers favicon creation and background music boot completion', async () => {
  render(<DynamicFavicon />);
  await act(async () => {});
  expect(document.querySelector("link[rel~='icon']")).toHaveAttribute('href', '/images/favicon/Ahjin.svg');

  localStorage.setItem('bootComplete', 'true');
  const { container } = render(<BackgroundMusic autoPlay />);
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  fireEvent(window, new Event('bootComplete'));
  await act(async () => {});
  expect(container.querySelector('audio')).toBeInTheDocument();
});

test('covers existing light favicon and successful autoplay', async () => {
  const themes = jest.requireMock('next-themes') as { useTheme: jest.Mock };
  jest.spyOn(themes, 'useTheme').mockReturnValue({ resolvedTheme: 'light', theme: 'light', setTheme: jest.fn() });
  const existing = document.createElement('link');
  existing.rel = 'icon';
  document.head.appendChild(existing);
  render(<DynamicFavicon />);
  await act(async () => {});
  expect(existing.href).toContain('Ahjin-white.svg');

  localStorage.setItem('bootComplete', 'true');
  const music = render(<BackgroundMusic autoPlay />);
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  expect(document.querySelector('audio source')).toHaveAttribute('src', '/sounds/sound2.mp3');
  const audio = music.container.querySelector('audio')!;
  Object.defineProperty(audio, 'paused', { configurable: true, value: false });
  jest.spyOn(themes, 'useTheme').mockReturnValue({ resolvedTheme: 'dark', theme: 'dark', setTheme: jest.fn() });
  music.rerender(<BackgroundMusic autoPlay />);
  await act(async () => {});
});

test('covers delayed successful music playback', async () => {
  jest.useFakeTimers();
  localStorage.setItem('bootComplete', 'true');
  const music = render(<BackgroundMusic />);
  act(() => jest.advanceTimersByTime(0));
  act(() => jest.advanceTimersByTime(2000));
  fireEvent.click(document.body);
  await act(async () => {});
  expect(music.container.querySelector('audio')).toBeInTheDocument();
  music.unmount();
  jest.useRealTimers();
});

test('covers delayed music playback and rejected autoplay', async () => {
  jest.useFakeTimers();
  localStorage.removeItem('bootComplete');
  const play = jest.spyOn(HTMLMediaElement.prototype, 'play').mockRejectedValue(new Error('blocked'));
  const { container, unmount } = render(<BackgroundMusic />);
  act(() => jest.advanceTimersByTime(0));
  fireEvent(window, new Event('bootComplete'));
  act(() => jest.advanceTimersByTime(2000));
  fireEvent.click(document.body);
  await act(async () => {});
  expect(container.querySelector('audio')).toBeInTheDocument();
  unmount();
  play.mockRestore();
  jest.useRealTimers();
});

test('covers theme toggle and SafeImage local/default fallback paths', () => {
  const themeModule = jest.requireMock('next-themes') as { useTheme: jest.Mock };
  const setTheme = jest.fn();
  jest.spyOn(themeModule, 'useTheme').mockReturnValue({ theme: 'dark', setTheme });
  render(<ThemeToggle />);
  fireEvent.click(screen.getByRole('button', { name: 'Toggle theme' }));
  expect(setTheme).toHaveBeenCalledWith('light');

  const { unmount } = render(<SafeImage src="/local.png" alt="local" />);
  fireEvent.error(screen.getByAltText('local'));
  expect(screen.getByAltText('local')).toHaveAttribute('src', '/icons/github.png');
  unmount();
  render(<SafeImage src="data:image/png;base64,x" alt="data" fallbackSrc="/fallback.png" />);
  expect(screen.getByAltText('data')).toHaveAttribute('src', 'data:image/png;base64,x');

  unmount();
  jest.spyOn(themeModule, 'useTheme').mockReturnValue({ theme: 'light', setTheme });
  render(<ThemeToggle />);
  fireEvent.click(screen.getAllByRole('button', { name: 'Toggle theme' }).at(-1)!);
  expect(setTheme).toHaveBeenCalledWith('dark');
  expect(renderToString(<ThemeToggle />)).toBe('');
});

test('covers explicit light theme toggle rendering', () => {
  const themeModule = jest.requireMock('next-themes') as { useTheme: jest.Mock };
  jest.spyOn(themeModule, 'useTheme').mockReturnValue({ theme: 'light', setTheme: jest.fn() });
  render(<ThemeToggle />);
  expect(screen.getByRole('button', { name: 'Toggle theme' })).toBeInTheDocument();
});

test('covers rejected click sound handler cleanup', () => {
  const play = jest.fn().mockRejectedValue(new Error('blocked'));
  Object.defineProperty(window, 'Audio', { configurable: true, value: jest.fn(() => ({ volume: 0, currentTime: 0, play })) });
  function ClickHarness() {
    useClickSound();
    return <a href="https://example.test/link">link</a>;
  }
  const { unmount } = render(<ClickHarness />);
  fireEvent.click(screen.getByText('link'));
  expect(play).toHaveBeenCalled();
  unmount();
});

test('covers language switcher replacement, insertion, fallback, and light colors', () => {
  const intl = jest.requireMock('next-intl') as { useLocale: jest.Mock };
  const navigation = jest.requireMock('next/navigation') as { useRouter: jest.Mock; usePathname: jest.Mock };
  const push = jest.fn();
  jest.spyOn(intl, 'useLocale').mockReturnValue('xx');
  jest.spyOn(navigation, 'useRouter').mockReturnValue({ push });
  jest.spyOn(navigation, 'usePathname').mockReturnValue('/projects');
  document.documentElement.classList.remove('dark');
  const { unmount } = render(<LanguageSwitcher />);
  fireEvent.click(screen.getByRole('button', { name: 'Select language' }));
  fireEvent.click(screen.getByRole('button', { name: /Português/ }));
  expect(push).toHaveBeenCalledWith('/pt/projects');
  unmount();

  jest.spyOn(intl, 'useLocale').mockReturnValue('en');
  jest.spyOn(navigation, 'usePathname').mockReturnValue('/en/projects');
  const replacement = render(<LanguageSwitcher />);
  fireEvent.click(screen.getByRole('button', { name: 'Select language' }));
  fireEvent.click(screen.getByRole('button', { name: /Español/ }));
  expect(push).toHaveBeenCalledWith('/es/projects');
  replacement.unmount();
  expect(renderToString(<LanguageSwitcher />)).toContain('Select language');
});

test('covers scroll progress output', () => {
  const { container } = render(<ScrollProgress />);
  expect(container.firstChild).toHaveClass('fixed');
  const themes = jest.requireMock('next-themes') as { useTheme: jest.Mock };
  jest.spyOn(themes, 'useTheme').mockReturnValue({ theme: 'light', setTheme: jest.fn() });
  const light = render(<ScrollProgress />);
  expect(light.container.firstChild).toHaveClass('fixed');
  light.unmount();
  expect(renderToString(<ScrollProgress />)).toBe('');
});

test('covers typewriter completion callbacks and server fallbacks', () => {
  expect(renderToString(<Typewriter text="server" />)).toContain('server');
  expect(renderToString(<TypewriterLoop texts={['one', 'two']} />)).toContain('one');

  const framer = jest.requireMock('framer-motion') as { animate: jest.Mock };
  const animate = jest.spyOn(framer, 'animate');
  let calls = 0;
  animate.mockImplementation((_value, _target, options) => {
    if (calls < 2) options?.onComplete?.();
    calls += 1;
    return { stop: jest.fn() };
  });
  jest.useFakeTimers();
  render(<TypewriterLoop texts={['one', 'two']} pauseDuration={0} />);
  act(() => jest.advanceTimersByTime(0));
  act(() => jest.advanceTimersByTime(0));
  animate.mockRestore();
  jest.useRealTimers();
});
