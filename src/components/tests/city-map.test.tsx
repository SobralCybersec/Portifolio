import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import CityMap from '../projects/CityMap';

type TreeOptions = { container: HTMLElement };

class FakeTreePlugin {
  static instances: FakeTreePlugin[] = [];
  canvas: HTMLCanvasElement;
  branches: Array<Array<{ endX: number; endY: number }>>;
  animation = 7;
  destroy = jest.fn();

  constructor({ container }: TreeOptions) {
    this.canvas = document.createElement('canvas');
    this.branches = Array.from({ length: 10 }, () => []);
    this.branches[3] = [{ endX: 20, endY: 30 }];
    container.appendChild(this.canvas);
    Object.defineProperty(this.canvas, 'parentNode', {
      configurable: true,
      value: { removeChild: jest.fn() },
    });
    FakeTreePlugin.instances.push(this);
  }
}

const richRepo = {
  id: 101,
  name: 'react-nextjs-city',
  description: 'Python Docker project',
  html_url: 'https://github.com/example/city',
  homepage: 'https://example.test/city',
  stargazers_count: 30,
  forks_count: 4,
  language: 'TypeScript',
  topics: ['react', 'docker'],
  previewImage: JSON.stringify(['/city-preview.png']),
  isVideo: false,
  techStack: ['PostgreSQL', 'OpenAPI'],
};

const videoRepo = {
  ...richRepo,
  id: 102,
  name: 'video-city',
  description: null,
  homepage: null,
  language: 'Mystery',
  topics: [],
  previewImage: '/city-video.mp4',
  isVideo: true,
  techStack: [],
};

let frameId = 1;
const frames = new Map<number, FrameRequestCallback>();

function flushFrames() {
  const pending = [...frames.entries()];
  for (const [id, callback] of pending) {
    frames.delete(id);
    callback(16);
  }
}

beforeEach(() => {
  jest.useFakeTimers();
  FakeTreePlugin.instances = [];
  frames.clear();
  frameId = 1;
  Object.defineProperty(window, 'requestAnimationFrame', {
    configurable: true,
    value: (callback: FrameRequestCallback) => {
      const id = frameId++;
      frames.set(id, callback);
      return id;
    },
  });
  Object.defineProperty(window, 'cancelAnimationFrame', {
    configurable: true,
    value: (id: number) => frames.delete(id),
  });
  Object.defineProperty(global, 'requestAnimationFrame', {
    configurable: true,
    value: window.requestAnimationFrame,
  });
  Object.defineProperty(global, 'cancelAnimationFrame', {
    configurable: true,
    value: window.cancelAnimationFrame,
  });
  Object.defineProperty(window, 'TreePlugin', {
    configurable: true,
    writable: true,
    value: FakeTreePlugin,
  });
  Object.defineProperty(HTMLCanvasElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 400,
      bottom: 700,
      width: 400,
      height: 700,
      toJSON: () => ({}),
    }),
  });
  Object.defineProperty(HTMLImageElement.prototype, 'complete', { configurable: true, value: true });
  Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', { configurable: true, value: 1 });
});

afterEach(() => {
  frames.clear();
  delete window.TreePlugin;
  jest.useRealTimers();
  jest.restoreAllMocks();
  document.head.innerHTML = '';
});

test('covers tree setup, drawing LODs, camera input, legends, and project modal', () => {
  jest.spyOn(Math, 'random').mockReturnValue(0.99);
  const { container, rerender, unmount } = render(<CityMap repos={[richRepo]} />);
  const overlay = container.querySelector('canvas.pointer-events-auto')!;

  act(() => jest.advanceTimersByTime(3000));
  act(() => flushFrames());
  expect(screen.getByText('TypeScript')).toBeInTheDocument();

  fireEvent.mouseMove(window, { clientX: 300, clientY: 300 });
  expect(screen.queryByText('react-nextjs-city')).not.toBeInTheDocument();
  fireEvent.mouseMove(window, { clientX: 20, clientY: 30 });
  expect(screen.getByText('react-nextjs-city')).toBeInTheDocument();

  fireEvent.mouseDown(overlay, { clientX: 20, clientY: 30 });
  fireEvent.mouseUp(window, { clientX: 20, clientY: 30 });
  expect(screen.getByText('PROJECT DETAILS')).toBeInTheDocument();
  expect(screen.getByText('Python Docker project')).toBeInTheDocument();
  expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
  fireEvent.error(screen.getByAltText('react-nextjs-city'));
  fireEvent.click(screen.getAllByRole('button').at(-1)!);

  fireEvent.mouseDown(overlay, { clientX: 0, clientY: 0 });
  fireEvent.mouseMove(window, { clientX: 20, clientY: 20 });
  fireEvent.mouseUp(window, { clientX: 20, clientY: 20 });

  for (let i = 0; i < 12; i += 1) {
    fireEvent.wheel(overlay, { deltaY: -100, clientX: 200, clientY: 200 });
  }
  act(() => flushFrames());
  act(() => flushFrames());
  expect((container.querySelector('canvas:not(.pointer-events-auto)') as HTMLCanvasElement)?.style.transform).toContain('scale');

  const now = jest.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(1100);
  fireEvent.mouseDown(overlay, { clientX: 300, clientY: 300 });
  fireEvent.mouseUp(window, { clientX: 300, clientY: 300 });
  fireEvent.mouseDown(overlay, { clientX: 300, clientY: 300 });
  fireEvent.mouseUp(window, { clientX: 300, clientY: 300 });
  now.mockRestore();
  fireEvent.mouseLeave(overlay);

  const firstTree = FakeTreePlugin.instances[0];
  rerender(<CityMap repos={[{ ...richRepo, id: 103, name: 'replacement', previewImage: 'not-json' }]} />);
  expect(firstTree.destroy).toHaveBeenCalled();
  act(() => jest.advanceTimersByTime(3000));
  act(() => flushFrames());
  act(() => flushFrames());
  unmount();
});

test('covers video modal, light palette, empty metadata, and plugin script injection', () => {
  jest.spyOn(Math, 'random').mockReturnValue(0.99);
  const themes = jest.requireMock('next-themes') as { useTheme: jest.Mock };
  jest.spyOn(themes, 'useTheme').mockReturnValue({ theme: 'light', systemTheme: 'light' });
  const { container, unmount } = render(<CityMap repos={[videoRepo]} />);
  const overlay = container.querySelector('canvas.pointer-events-auto')!;

  act(() => jest.advanceTimersByTime(3000));
  fireEvent.mouseDown(overlay, { clientX: 20, clientY: 30 });
  fireEvent.mouseUp(window, { clientX: 20, clientY: 30 });
  expect(screen.getByText('No description')).toBeInTheDocument();
  expect(container.querySelector('video')).toBeInTheDocument();
  fireEvent.click(screen.getByText('PROJECT DETAILS').closest('.absolute.inset-0.z-40')!);
  unmount();

  delete window.TreePlugin;
  const injected = render(<CityMap repos={[]} />);
  expect(document.head.querySelector('script')).toBeInTheDocument();
  window.TreePlugin = FakeTreePlugin;
  act(() => jest.advanceTimersByTime(100));
  act(() => jest.advanceTimersByTime(3000));
  injected.unmount();
});
