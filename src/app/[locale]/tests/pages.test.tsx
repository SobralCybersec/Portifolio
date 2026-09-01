import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import HomePage from '../page';
import AboutPage from '../about/page';
import CertificationsPage from '../certifications/page';
import ContactPage from '../contact/page';
import ProjectsPage from '../projects/page';

jest.mock('next/dynamic', () => (loader: () => Promise<unknown>) => {
  void Promise.resolve(loader()).catch(() => undefined);
  function DynamicMock({ onComplete, onMenuToggle, children, repo }: { onComplete?: () => void; onMenuToggle?: () => void; children?: React.ReactNode; repo?: { name: string } }) {
    return (
      <div data-testid="dynamic-component">
        {onComplete && <button onClick={onComplete}>complete boot</button>}
        {onMenuToggle && <button onClick={onMenuToggle}>toggle menu</button>}
        {repo && <article>{repo.name}</article>}
        {children}
      </div>
    );
  }
  return DynamicMock;
});

jest.mock('@/hooks/audio/useClickSound', () => ({ useClickSound: jest.fn() }));
jest.mock('@/components/layout/Navigation', () => {
  function NavigationMock() { return <nav data-testid="navigation" />; }
  return NavigationMock;
});
jest.mock('@/components/effects/ScrollEffect', () => {
  function ScrollEffectMock() { return <div data-testid="scroll-effect" />; }
  return ScrollEffectMock;
});
jest.mock('@/components/texts/AnimatedText', () => ({
  AnimatedText: function AnimatedTextMock({ children }: { children: React.ReactNode }) { return <div>{children}</div>; },
  GradientText: function GradientTextMock({ children }: { children: React.ReactNode }) { return <span>{children}</span>; },
}));
jest.mock('@/components/home/Hero', () => {
  function HeroMock() { return <section data-testid="hero" />; }
  return HeroMock;
});
jest.mock('@/components/projects/SoloLevelingProjectCard', () => {
  function ProjectCardMock({ repo }: { repo: { name: string } }) { return <article>{repo.name}</article>; }
  return ProjectCardMock;
});
jest.mock('@/components/effects/ParticleBackground', () => {
  function ParticleBackgroundMock() { return <div />; }
  return ParticleBackgroundMock;
});

const repo = {
  id: 1,
  name: 'demo-project',
  description: 'A demo project',
  html_url: 'https://example.test/project',
  homepage: null,
  language: 'TypeScript',
  stargazers_count: 1,
  forks_count: 2,
  topics: ['react'],
  allLanguages: ['typescript'],
  techStack: ['React'],
};

afterEach(() => {
  jest.restoreAllMocks();
  localStorage.clear();
});

test('renders home gate, completes boot, and loads projects', async () => {
  global.fetch = jest.fn().mockResolvedValue({ json: async () => [repo] });
  render(<HomePage />);
  expect(screen.getByTestId('hero')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'complete boot' }));
  fireEvent.click(screen.getByRole('button', { name: 'toggle menu' }));
  await waitFor(() => expect(screen.getByTestId('hero')).toBeInTheDocument());
  expect(localStorage.getItem('bootComplete')).toBe('true');
  expect(global.fetch).toHaveBeenCalledWith('/api/github/repos');
});

test('renders home with failed project request', async () => {
  global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
  render(<HomePage />);
  fireEvent.click(screen.getByRole('button', { name: 'complete boot' }));
  await waitFor(() => expect(screen.getByTestId('hero')).toBeInTheDocument());
});

test('renders about content and dark visual layers', () => {
  render(<AboutPage />);
  expect(screen.getByTestId('navigation')).toBeInTheDocument();
  expect(screen.getByText('eyebrow')).toBeInTheDocument();
  expect(screen.getByText('title')).toBeInTheDocument();
});

test('renders contact page links and social sections', () => {
  render(<ContactPage />);
  expect(screen.getByTestId('navigation')).toBeInTheDocument();
  expect(screen.getByText('getInTouch')).toBeInTheDocument();
  expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
});

test('renders contact light LinkedIn badge branch', () => {
  const themes = jest.requireMock('next-themes') as { useTheme: jest.Mock };
  jest.spyOn(themes, 'useTheme').mockReturnValue({ theme: 'light', setTheme: jest.fn() });
  render(<ContactPage />);
  expect(document.querySelector('[data-theme="light"]')).toBeInTheDocument();
});

test('filters certifications and opens/closes certification modal', () => {
  render(<CertificationsPage />);
  expect(screen.getByText(/showing/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'filters.all' }));
  fireEvent.click(screen.getByRole('button', { name: 'filters.aws' }));
  const cards = screen.getAllByText(/certs\./);
  fireEvent.click(cards[0]);
  expect(screen.getByText('Certification')).toBeInTheDocument();
  const modal = screen.getByText('Certification').closest('.fixed')!;
  fireEvent.click(modal.querySelector('.bg-\\[var\\(--bg-card\\)\\]')!);
  fireEvent.click(modal.querySelector('button')!);
  fireEvent.click(cards[0]);
  fireEvent.click(screen.getByText('Certification').closest('.fixed')!);
  expect(screen.queryByText('Certification')).not.toBeInTheDocument();
});

test('loads projects, searches, filters, and handles empty API response', async () => {
  global.fetch = jest.fn().mockResolvedValue({ json: async () => [repo] });
  render(<ProjectsPage />);
  await waitFor(() => expect(screen.getByText('demo-project')).toBeInTheDocument());
  const search = screen.getByPlaceholderText('Search projects...');
  fireEvent.change(search, { target: { value: 'missing' } });
  expect(screen.getByText('No projects found matching your criteria.')).toBeInTheDocument();
  fireEvent.change(search, { target: { value: 'demo' } });
  expect(screen.getByText('demo-project')).toBeInTheDocument();

  fireEvent.click(screen.getAllByRole('button', { name: 'All Projects' })[0]);
  fireEvent.click(screen.getByRole('button', { name: 'TypeScriptTypeScript' }));
  expect(screen.getByText('demo-project')).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: 'TypeScriptTypeScript' })[0]);
  fireEvent.click(screen.getByRole('button', { name: 'All Projects' }));
  fireEvent.click(screen.getAllByRole('button', { name: 'All Technologies' })[0]);
  fireEvent.click(screen.getByRole('button', { name: 'ReactReact' }));
  expect(screen.getByText('demo-project')).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: 'ReactReact' })[0]);
  fireEvent.click(screen.getByRole('button', { name: 'All Technologies' }));
  fireEvent.change(search, { target: { value: 'demo project' } });
  expect(screen.getByText('demo-project')).toBeInTheDocument();

  (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('offline'));
  const { unmount } = render(<ProjectsPage />);
  await waitFor(() => expect(screen.getAllByText('loading').length).toBeGreaterThan(0));
  unmount();
});

test('covers project language, tech, description filters, and light loading state', async () => {
  const customRepo = {
    ...repo,
    name: 'language-tech',
    description: 'description hit',
    language: 'JavaScript',
    allLanguages: [],
    topics: [],
    techStack: ['Nextjs'],
  };
  global.fetch = jest.fn().mockResolvedValue({ json: async () => [customRepo] });
  render(<ProjectsPage />);
  await waitFor(() => expect(screen.getByText('language-tech')).toBeInTheDocument());
  fireEvent.click(screen.getAllByRole('button', { name: 'All Projects' })[0]);
  fireEvent.click(screen.getByRole('button', { name: 'JavaScriptJavaScript' }));
  fireEvent.click(screen.getAllByRole('button', { name: 'All Technologies' })[0]);
  fireEvent.click(screen.getByRole('button', { name: 'Next.jsNext.js' }));
  const search = screen.getByPlaceholderText('Search projects...');
  fireEvent.change(search, { target: { value: 'description' } });
  expect(screen.getByText('language-tech')).toBeInTheDocument();
  fireEvent.change(search, { target: { value: 'missing' } });
  expect(screen.getByText('No projects found matching your criteria.')).toBeInTheDocument();

  const themes = jest.requireMock('next-themes') as { useTheme: jest.Mock };
  jest.spyOn(themes, 'useTheme').mockReturnValue({ theme: 'light', setTheme: jest.fn() });
  global.fetch = jest.fn(() => new Promise(() => {}));
  const loading = render(<ProjectsPage />);
  expect(screen.getAllByText('loading').length).toBeGreaterThan(0);
  loading.unmount();
});
