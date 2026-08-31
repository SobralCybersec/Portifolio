import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import {
  getTransitionForPath,
  PageTransitionProvider,
  usePageTransition,
} from '../layout/PageTransition';
import { Link } from '@/i18n/config/routing';

const mockRouter = { push: jest.fn(), replace: jest.fn() };
const mockPathname = jest.fn(() => '/en');
const defaultMatchMedia = window.matchMedia;

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => mockRouter,
}));
jest.mock('@/components/loading-screen/GameLoadingScreen', () => ({
  __esModule: true,
  default: ({ duration }: { duration: number }) => <div data-testid="loading-transition">{duration}</div>,
}));

function Consumer() {
  const { navigate, isTransitioning } = usePageTransition();
  return (
    <>
      <button type="button" onClick={() => navigate('/about')}>go about</button>
      <button type="button" onClick={() => navigate('/projects')}>go projects</button>
      <button type="button" onClick={() => navigate('/contact', { replace: true })}>replace contact</button>
      <span data-testid="transitioning">{String(isTransitioning)}</span>
    </>
  );
}

function OutsideConsumer() {
  const { navigate, isTransitioning } = usePageTransition();
  return <button type="button" onClick={() => navigate('/about')}>{String(isTransitioning)}</button>;
}

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
  mockRouter.push.mockReset();
  mockRouter.replace.mockReset();
  mockPathname.mockReset().mockReturnValue('/en');
  Object.assign(window, { matchMedia: defaultMatchMedia });
});

describe('PageTransitionProvider', () => {
  test('maps locale, query, trailing slash, and unknown routes to effects', () => {
    expect(getTransitionForPath('/')).toBe('letterbox');
    expect(getTransitionForPath('/en/')).toBe('letterbox');
    expect(getTransitionForPath('/pt/about?from=home')).toBe('monocolor-wipe');
    expect(getTransitionForPath('/projects///#top')).toBe('marquee-stripes');
    expect(getTransitionForPath('/de/certifications')).toBe('black-white-slice');
    expect(getTransitionForPath('/ja/chat')).toBe('loading-screen');
    expect(getTransitionForPath('/missing')).toBe('letterbox');
  });

  test('returns fallback transition API outside provider', () => {
    render(<OutsideConsumer />);
    expect(screen.getByRole('button', { name: 'false' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button', { name: 'false' })).toBeInTheDocument();
  });

  test.each([
    ['/about', 'monocolor-wipe'],
    ['/projects', 'marquee-stripes'],
    ['/certifications', 'black-white-slice'],
    ['/chat', 'loading-screen'],
    ['/en', 'letterbox'],
  ])('renders %s transition overlay', (href, effect) => {
    jest.useFakeTimers();
    function RouteConsumer() {
      const { navigate } = usePageTransition();
      return <button type="button" onClick={() => navigate(href)}>navigate</button>;
    }
    const { unmount } = render(<PageTransitionProvider><RouteConsumer /></PageTransitionProvider>);
    act(() => fireEvent.click(screen.getByRole('button', { name: 'navigate' })));
    const overlay = document.querySelector('.portfolio-transition')!;
    expect(overlay).toHaveAttribute('data-effect', effect);
    expect(overlay).toHaveAttribute('data-phase', 'cover');
    if (effect === 'monocolor-wipe') expect(overlay.querySelectorAll('.portfolio-transition__manga-panel')).toHaveLength(6);
    if (effect === 'marquee-stripes') expect(overlay.querySelectorAll('.portfolio-transition__marquee-line')).toHaveLength(7);
    if (effect === 'black-white-slice') expect(overlay.querySelectorAll('.portfolio-transition__split-panel')).toHaveLength(2);
    if (effect === 'letterbox') expect(overlay.querySelectorAll('.portfolio-transition__letterbox')).toHaveLength(2);
    if (effect === 'loading-screen') expect(screen.getByTestId('loading-transition')).toHaveTextContent('3000');
    unmount();
  });

  test('keeps same overlay through cover, hold, reveal, then finishes', () => {
    jest.useFakeTimers();
    const { rerender } = render(<PageTransitionProvider><Consumer /></PageTransitionProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'go projects' }));
    const overlay = document.querySelector('.portfolio-transition')!;
    expect(screen.getByTestId('transitioning')).toHaveTextContent('true');
    act(() => jest.advanceTimersByTime(680));
    expect(overlay).toHaveAttribute('data-phase', 'hold');
    expect(mockRouter.push).toHaveBeenCalledWith('/projects');

    mockPathname.mockReturnValue('/projects');
    rerender(<PageTransitionProvider><Consumer /></PageTransitionProvider>);
    expect(document.querySelector('.portfolio-transition')).toHaveAttribute('data-phase', 'reveal');
    act(() => jest.advanceTimersByTime(760));
    expect(document.querySelector('.portfolio-transition')).not.toBeInTheDocument();
    expect(screen.getByTestId('transitioning')).toHaveTextContent('false');
  });

  test('rejects external, same-path, and duplicate navigation, and handles reduced motion', () => {
    const matchMedia = jest.fn((query: string) => ({ matches: query.includes('prefers-reduced-motion'), addListener: jest.fn(), removeListener: jest.fn() }));
    const originalMatchMedia = window.matchMedia;
    Object.assign(window, { matchMedia });
    function ReducedConsumer() {
      const { navigate } = usePageTransition();
      return (
        <>
          <button onClick={() => navigate('mailto:test@example.test')}>external</button>
          <button onClick={() => navigate('/')}>same</button>
          <button onClick={() => navigate('/about', { replace: true })}>reduced replace</button>
        </>
      );
    }
    render(<PageTransitionProvider><ReducedConsumer /></PageTransitionProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'external' }));
    fireEvent.click(screen.getByRole('button', { name: 'same' }));
    expect(mockRouter.push).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'reduced replace' }));
    expect(mockRouter.replace).toHaveBeenCalledWith('/about');
    expect(document.querySelector('.portfolio-transition')).not.toBeInTheDocument();
    Object.assign(window, { matchMedia: originalMatchMedia });
  });

  test('captures internal links, skips modified/download/external links, and cleans failed navigation', () => {
    jest.useFakeTimers();
    const push = mockRouter.push;
    push.mockImplementationOnce(() => { throw new Error('router failed'); });
    function Links() {
      return (
        <>
          <Link href="/about">internal</Link>
          <a href="/projects" target="_blank">new tab</a>
          <a href="https://external.example.test">external</a>
          <a href="/download" download>download</a>
          <a href="#section">anchor</a>
        </>
      );
    }
    render(<PageTransitionProvider><Links /></PageTransitionProvider>);
    const internal = screen.getByRole('link', { name: 'internal' });
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    internal.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    act(() => jest.advanceTimersByTime(620));
    expect(document.querySelector('.portfolio-transition')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'new tab' }), { ctrlKey: true });
    fireEvent.click(screen.getByRole('link', { name: 'external' }));
    fireEvent.click(screen.getByRole('link', { name: 'download' }));
    fireEvent.click(screen.getByRole('link', { name: 'anchor' }));
  });
});
