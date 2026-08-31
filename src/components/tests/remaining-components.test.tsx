import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import LanguageSwitcher from '../layout/LanguageSwitcher';
import LetterGlitch from '../effects/LetterGlitch';
import LivePreview from '../projects/LivePreview';
import MetricsTicker from '../home/MetricsTicker';
import { useClickSound } from '../../hooks/audio/useClickSound';

jest.mock('../texts/AnimatedText', () => ({
  AnimatedText: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

afterEach(() => {
  jest.restoreAllMocks();
});

test('covers language dropdown paths and outside-click cleanup', () => {
  const navigation = jest.requireMock('next/navigation') as {
    usePathname: jest.Mock;
    useRouter: jest.Mock;
  };
  const router = { push: jest.fn() };
  jest.spyOn(navigation, 'useRouter').mockReturnValue(router);
  jest.spyOn(navigation, 'usePathname').mockReturnValue('/en/projects');

  const { unmount } = render(<LanguageSwitcher />);
  fireEvent.click(screen.getByRole('button', { name: 'Select language' }));
  fireEvent.click(screen.getByRole('button', { name: /Português/ }));
  expect(router.push).toHaveBeenCalledWith('/pt/projects');

  jest.spyOn(navigation, 'usePathname').mockReturnValue('/projects');
  const second = render(<LanguageSwitcher />);
  fireEvent.click(screen.getAllByRole('button', { name: 'Select language' })[1]);
  fireEvent.mouseDown(document.body);
  expect(screen.queryByRole('button', { name: 'Français' })).not.toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: 'Select language' })[1]);
  fireEvent.click(screen.getByRole('button', { name: /Español/ }));
  expect(router.push).toHaveBeenCalledWith('/es/projects');
  second.unmount();
  unmount();

  document.documentElement.classList.add('dark');
  const dark = render(<LanguageSwitcher />);
  expect(dark.getByRole('button', { name: 'Select language' })).toBeInTheDocument();
  dark.unmount();
  document.documentElement.classList.remove('dark');
});

test('covers metrics ticker repository replacement and fetch failure', async () => {
  const nextIntl = jest.requireMock('next-intl') as { useTranslations: jest.Mock };
  const ticker = jest.fn((key: string) => key === 'ticker' ? 'OPEN SOURCE PROJECTS' : key);
  jest.spyOn(nextIntl, 'useTranslations').mockReturnValue(ticker);
  global.fetch = jest.fn().mockResolvedValue({ json: async () => ({ publicRepos: 12 }) });

  render(<MetricsTicker />);
  await waitFor(() => expect(screen.getByText('12+ OPEN SOURCE PROJECTS PROJECTS')).toBeInTheDocument());

  global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
  render(<MetricsTicker />);
  await act(async () => {});
  expect(screen.getAllByText(/OPEN SOURCE/).length).toBeGreaterThan(0);
});

test('covers live preview loading, success, timestamp, refresh, and error retry', async () => {
  const successText = '<img src="https://github.com/SobralCybersec/SobralCybersec/releases/download/2026-01-02.03-04-05/demo.gif">';
  global.fetch = jest.fn().mockResolvedValue({ ok: true, text: async () => successText });
  render(<LivePreview />);
  await waitFor(() => expect(screen.getByAltText('Live Coding Session')).toBeInTheDocument());
  expect(screen.getByText(/2026:01:02 03:04:05/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));

  global.fetch = jest.fn().mockResolvedValue({ ok: false, text: async () => '' });
  render(<LivePreview />);
  await waitFor(() => expect(screen.getByText('Failed to fetch README')).toBeInTheDocument());
  fireEvent.click(screen.getByRole('button', { name: 'tryAgain' }));
  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
});

test('covers LetterGlitch drawing, color sanitization, resize debounce, and cleanup', () => {
  let frame: FrameRequestCallback | undefined;
  const originalRaf = window.requestAnimationFrame;
  const originalCancel = window.cancelAnimationFrame;
  Object.defineProperty(window, 'requestAnimationFrame', {
    configurable: true,
    value: (callback: FrameRequestCallback) => { frame = callback; return 1; },
  });
  Object.defineProperty(window, 'cancelAnimationFrame', {
    configurable: true,
    value: jest.fn(),
  });
  Object.defineProperty(global, 'requestAnimationFrame', { configurable: true, value: window.requestAnimationFrame });
  Object.defineProperty(global, 'cancelAnimationFrame', { configurable: true, value: window.cancelAnimationFrame });
  jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({
    width: 100, height: 60, top: 0, left: 0, right: 100, bottom: 60, x: 0, y: 0,
    toJSON: () => ({}),
  }));
  let now = 0;
  jest.spyOn(Date, 'now').mockImplementation(() => now);
  jest.useFakeTimers();
  Object.defineProperty(window, 'requestAnimationFrame', {
    configurable: true,
    value: (callback: FrameRequestCallback) => { frame = callback; return 1; },
  });
  Object.defineProperty(window, 'cancelAnimationFrame', { configurable: true, value: jest.fn() });
  Object.defineProperty(global, 'requestAnimationFrame', { configurable: true, value: window.requestAnimationFrame });
  Object.defineProperty(global, 'cancelAnimationFrame', { configurable: true, value: window.cancelAnimationFrame });

  const { unmount, rerender } = render(
    <LetterGlitch
      characters="AB"
      glitchColors={['bad', '#abc']}
      vignetteColor="bad"
      glitchSpeed={1}
      smooth
      centerVignette
      outerVignette
    />,
  );
  now = 100;
  act(() => frame?.(100));
  fireEvent(window, new Event('resize'));
  act(() => jest.advanceTimersByTime(100));
  now = 200;
  act(() => frame?.(200));
  rerender(
    <LetterGlitch characters="AB" glitchColors={['#abc', '#aabbcc']} vignetteColor="1,2,3" glitchSpeed={1} smooth />,
  );
  act(() => {});
  expect(frame).toBeDefined();
  act(() => {
    for (let i = 0; i < 40; i += 1) {
      now = 300 + i * 100;
      frame?.(now);
    }
  });
  rerender(<LetterGlitch characters="AB" glitchColors={['#abc', '#aabbcc']} glitchSpeed={1} smooth={false} />);
  now = 5000;
  act(() => frame?.(5000));
  rerender(<LetterGlitch />);
  expect(document.querySelectorAll('canvas')).toHaveLength(1);
  unmount();
  jest.useRealTimers();
  Object.defineProperty(window, 'requestAnimationFrame', { configurable: true, value: originalRaf });
  Object.defineProperty(window, 'cancelAnimationFrame', { configurable: true, value: originalCancel });
  Object.defineProperty(global, 'requestAnimationFrame', { configurable: true, value: originalRaf });
  Object.defineProperty(global, 'cancelAnimationFrame', { configurable: true, value: originalCancel });
});

function ClickSoundHarness() {
  useClickSound();
  return <a href="https://example.test/target"><span>target</span></a>;
}

test('plays click sound for links and removes listener on unmount', () => {
  const play = jest.fn().mockResolvedValue(undefined);
  const audio = { volume: 0, currentTime: 0, play };
  Object.defineProperty(window, 'Audio', { configurable: true, value: jest.fn(() => audio) });
  const { unmount } = render(<ClickSoundHarness />);
  fireEvent.click(screen.getByText('target'));
  expect(play).toHaveBeenCalledTimes(1);
  unmount();
  fireEvent.click(document.body);
  expect(play).toHaveBeenCalledTimes(1);
});
