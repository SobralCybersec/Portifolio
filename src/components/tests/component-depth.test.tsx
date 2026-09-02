import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AnimatedChar, AnimatedText, AnimatedWord, GradientText } from '../texts/AnimatedText';
import ChatEffects from '../chat/ChatEffects';
import ChatRoom from '../chat/ChatRoom';
import { ClientChatRoom, HexagonGrid, ParticleBackground } from '../runtime/ClientOnlyComponents';
import SoloLevelingBoot from '../loading-screen/SoloLevelingBoot';
import SoloLevelingProjectCard from '../projects/SoloLevelingProjectCard';
import { ThemeProvider } from '../layout/ThemeProvider';

jest.mock('next/dynamic', () => {
  function DynamicFactory(loader: () => Promise<unknown>) {
    void Promise.resolve(loader()).catch(() => undefined);
    function DynamicComponent({ children }: { children?: React.ReactNode }) { return <div>{children}</div>; }
    return DynamicComponent;
  }
  return DynamicFactory;
});
jest.mock('next-auth/react', () => {
  function SessionProviderMock({ children }: { children: React.ReactNode }) { return children; }
  return { signIn: jest.fn(), signOut: jest.fn(), SessionProvider: SessionProviderMock };
});
jest.mock('pusher-js', () => jest.fn().mockImplementation(() => ({
  subscribe: () => ({ bind: jest.fn(), unbind_all: jest.fn() }),
  unsubscribe: jest.fn(),
  disconnect: jest.fn(),
})));

const repo = {
  id: 9,
  name: 'depth-project',
  description: 'A project with a useful description',
  html_url: 'https://github.com/example/depth-project',
  homepage: 'https://example.test/depth',
  stargazers_count: 12,
  forks_count: 3,
  language: 'TypeScript',
  topics: ['react', 'portfolio'],
  previewImage: JSON.stringify(['/preview-one.png', '/preview-two.png']),
  techStack: ['React', 'Next.js'],
};

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  delete (window as Window & { TreePlugin?: unknown }).TreePlugin;
});

test('covers all AnimatedText exports and common component wrappers', () => {
  render(
    <>
      <AnimatedText className="animated">body</AnimatedText>
      <AnimatedWord text="one two" />
      <AnimatedChar text="a b" />
      <GradientText>gradient</GradientText>
      <ChatEffects />
      <ThemeProvider><span>theme-child</span></ThemeProvider>
      <HexagonGrid />
      <ParticleBackground />
      <ClientChatRoom session={null} />
    </>,
  );
  expect(screen.getByText('theme-child')).toBeInTheDocument();
  expect(screen.getByText('gradient')).toBeInTheDocument();
});

test('covers SoloLevelingProjectCard preview, metadata, links, and fallback paths', () => {
  const { rerender } = render(<SoloLevelingProjectCard repo={repo} index={0} />);
  expect(screen.getByText('depth-project')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Archive/i })).toHaveAttribute('href', repo.html_url);
  expect(screen.getByRole('link', { name: /Deploy/i })).toHaveAttribute('href', repo.homepage);

  rerender(<SoloLevelingProjectCard repo={{ ...repo, previewImage: '/demo.mp4', isVideo: true }} index={1} />);
  expect(document.querySelector('video')).toBeInTheDocument();
  rerender(<SoloLevelingProjectCard repo={{ ...repo, previewImage: '/icons/typescript.png', isVideo: true }} index={1} />);
  expect(document.querySelector('video')).not.toBeInTheDocument();
  expect(screen.getByAltText('TypeScript')).toBeInTheDocument();
  rerender(<SoloLevelingProjectCard repo={{ ...repo, previewImage: '/icons/typescript.png', isVideo: false }} index={1} />);
  expect(screen.getByAltText('TypeScript')).toBeInTheDocument();
  rerender(<SoloLevelingProjectCard repo={{ ...repo, previewImage: undefined, description: null, homepage: null, language: null }} index={2} />);
  expect(screen.getByText('depth-project')).toBeInTheDocument();

  const themes = jest.requireMock('next-themes') as { useTheme: jest.Mock };
  jest.spyOn(themes, 'useTheme').mockReturnValue({ resolvedTheme: 'light', theme: 'light', setTheme: jest.fn() });
  render(<SoloLevelingProjectCard repo={{ ...repo, html_url: 'javascript:bad', homepage: 'javascript:bad', previewImage: 'not-json', description: null, language: 'Mystery', topics: ['tag'] }} index={3} />);
  expect(screen.getAllByRole('link', { name: /Archive/ }).at(-1)).toHaveAttribute('href', '#');
  expect(screen.queryByRole('link', { name: /Deploy/ })).not.toBeInTheDocument();
  render(<SoloLevelingProjectCard repo={{ ...repo, language: null, previewImage: undefined }} index={4} />);
});

test('opens README callback from project card', () => {
  const onReadme = jest.fn();
  render(<SoloLevelingProjectCard repo={repo} index={0} onReadme={onReadme} />);

  fireEvent.click(screen.getByText('depth-project'));
  expect(onReadme).toHaveBeenCalledWith(repo);

  fireEvent.click(screen.getByRole('button', { name: /README: depth-project/i }));
  expect(onReadme).toHaveBeenCalledTimes(2);

  fireEvent.click(screen.getByRole('link', { name: /Archive/i }));
  expect(onReadme).toHaveBeenCalledTimes(2);
});

test('covers project card pointer interaction', () => {
  const { container } = render(<SoloLevelingProjectCard repo={repo} index={0} />);
  const card = container.querySelector('article')!;
  Object.defineProperty(card, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100, x: 0, y: 0, toJSON: () => ({}) }),
  });

  fireEvent.mouseEnter(card, { clientX: 50, clientY: 60 });
  fireEvent.mouseMove(card, { clientX: 80, clientY: 20 });
  fireEvent.mouseLeave(card);
});

test('covers boot overlay reveal, reduced-motion completion, and cleanup', () => {
  const onComplete = jest.fn();
  Object.defineProperty(window, 'Audio', {
    configurable: true,
    value: jest.fn(() => ({ volume: 0, play: jest.fn(() => Promise.resolve()), pause: jest.fn(), src: '' })),
  });
  jest.useFakeTimers();
  const { unmount } = render(<SoloLevelingBoot onComplete={onComplete} />);
  expect(screen.getByRole('status')).toBeInTheDocument();
  act(() => jest.advanceTimersByTime(1300));
  act(() => jest.advanceTimersByTime(1300));
  expect(onComplete).toHaveBeenCalled();
  unmount();
});

test('covers reduced-motion boot, light palette, and typewriter timer', () => {
  const framer = jest.requireMock('framer-motion') as { useReducedMotion: jest.Mock };
  const themes = jest.requireMock('next-themes') as { useTheme: jest.Mock };
  jest.spyOn(framer, 'useReducedMotion').mockReturnValue(true);
  jest.spyOn(themes, 'useTheme').mockReturnValue({ resolvedTheme: 'light', theme: 'light', setTheme: jest.fn() });
  jest.useFakeTimers();
  const onComplete = jest.fn();
  render(<SoloLevelingBoot onComplete={onComplete} />);
  act(() => jest.advanceTimersByTime(0));
  act(() => jest.advanceTimersByTime(700));
  expect(onComplete).toHaveBeenCalled();
  jest.useRealTimers();
});

test('covers ChatRoom signed-out and signed-in message flows', async () => {
  Element.prototype.scrollIntoView = jest.fn();
  const messages = [
    { id: 'mine', text: 'mine', userId: 'me', userName: 'Me', userImage: '/me.png', createdAt: Date.now() },
    { id: 'other', text: 'other', userId: 'other', userName: 'Other', userImage: null, createdAt: Date.now() },
  ];
  global.fetch = jest.fn().mockImplementation((url: string, options?: RequestInit) =>
    options?.method === 'POST'
      ? Promise.resolve({ ok: true, json: async () => ({}) })
      : Promise.resolve({ ok: true, json: async () => messages }),
  );
  const session = { user: { id: 'me', name: 'Me', image: '/me.png' } } as any;
  const signedIn = render(<ChatRoom session={session} />);
  await waitFor(() => expect(screen.getByText('mine')).toBeInTheDocument());
  fireEvent.error(screen.getAllByAltText('Me')[0]);
  const input = screen.getByPlaceholderText(/Type a message/);
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: 'hello' } });
  fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/chat/messages', expect.objectContaining({ method: 'POST' })));
  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
  signedIn.unmount();

  const { unmount } = render(<ChatRoom session={null} />);
  await waitFor(() => expect(screen.getAllByRole('button', { name: 'Sign in with GitHub' }).length).toBeGreaterThan(0));
  const signInButtons = screen.getAllByRole('button', { name: 'Sign in with GitHub' });
  fireEvent.click(signInButtons[0]);
  fireEvent.click(signInButtons.at(-1)!);
  unmount();

  const sparse = render(<ChatRoom session={{ user: { id: 'sparse' } } as any} />);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument());
  sparse.unmount();
});

test('covers chat errors, pusher deduplication, and cleanup', async () => {
  Element.prototype.scrollIntoView = jest.fn();
  process.env.NEXT_PUBLIC_PUSHER_KEY = 'key';
  process.env.NEXT_PUBLIC_PUSHER_CLUSTER = 'cluster';
  const handler = jest.fn();
  const pusher = jest.requireMock('pusher-js') as jest.Mock;
  pusher.mockImplementationOnce(() => ({
    subscribe: () => ({ bind: (_event: string, callback: (message: unknown) => void) => { handler.mockImplementation(callback); }, unbind_all: jest.fn() }),
    unsubscribe: jest.fn(),
    disconnect: jest.fn(),
  }));
  const error = jest.spyOn(console, 'error').mockImplementation(() => {});
  let postShouldFail = true;
  global.fetch = jest.fn().mockImplementation((_url: string, options?: RequestInit) => {
    if (options?.method === 'POST') return postShouldFail
      ? Promise.resolve({ ok: false, status: 500 })
      : Promise.resolve({ ok: true, status: 200 });
    return Promise.resolve({ ok: false, status: 500 });
  });
  const session = { user: { id: 'me', name: 'Me', image: null } } as any;
  const { unmount } = render(<ChatRoom session={session} />);
  await act(async () => {});
  expect(error).toHaveBeenCalled();
  act(() => {
    handler({ id: 'push', text: 'pushed', userId: 'other', userName: 'Other', userImage: null, createdAt: Date.now() });
    handler({ id: 'push', text: 'duplicate', userId: 'other', userName: 'Other', userImage: null, createdAt: Date.now() });
  });
  await waitFor(() => expect(screen.getByText('pushed')).toBeInTheDocument());
  const input = screen.getByPlaceholderText(/Type a message/);
  fireEvent.focus(input);
  fireEvent.blur(input);
  fireEvent.change(input, { target: { value: 'restore me' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
  await waitFor(() => expect(screen.getByDisplayValue('restore me')).toBeInTheDocument());
  postShouldFail = false;
  fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
  fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
  await waitFor(() => expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(2));
  unmount();
  delete process.env.NEXT_PUBLIC_PUSHER_KEY;
  delete process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  error.mockRestore();
});
