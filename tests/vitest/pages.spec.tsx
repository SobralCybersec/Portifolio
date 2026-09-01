import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps, ReactNode } from 'react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const dynamicState = vi.hoisted(() => ({ calls: 0 }));

vi.mock('next/dynamic', async () => {
  const React = await import('react');

  return {
    default: (loader: () => unknown) => {
      const source = String(loader);

      if (source.includes('AboutScrollStory')) {
        function AboutScrollStoryMock() {
          return <section aria-label="about story">about.story</section>;
        }

        return AboutScrollStoryMock;
      }

      if (source.includes('InteractiveExpertiseGrid')) {
        function InteractiveExpertiseGridMock() {
          return <section aria-label="expertise">about.expertise</section>;
        }

        return InteractiveExpertiseGridMock;
      }

      if (source.includes('SoloLevelingProjectCard')) {
        return function ProjectCardMock({ repo }: { repo: { name: string } }) {
          return <article><h3>{repo.name}</h3></article>;
        };
      }

      const callIndex = dynamicState.calls++;

      return function DynamicMock(props: { onComplete?: () => void }) {
        React.useEffect(() => {
          if (callIndex === 0) props.onComplete?.();
        }, [props]);

        return null;
      };
    },
  };
});

vi.mock('next/image', () => ({
  default: ({ fill: _fill, priority: _priority, sizes: _sizes, unoptimized: _unoptimized, ...props }: ComponentProps<'img'> & {
    fill?: boolean;
    priority?: boolean;
    sizes?: string;
    unoptimized?: boolean;
  }) => createElement('img', props),
}));

vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) => `${namespace}.${key}`,
}));

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'dark', resolvedTheme: 'dark' }),
}));

vi.mock('framer-motion', async () => {
  const React = await import('react');
  const motionProps = new Set([
    'animate',
    'exit',
    'initial',
    'layout',
    'layoutId',
    'transition',
    'whileHover',
    'whileInView',
    'viewport',
  ]);
  const motion = new Proxy({}, {
    get: (_target, tag: string) => (props: Record<string, unknown>) => {
      const domProps = Object.fromEntries(
        Object.entries(props).filter(([key]) => !motionProps.has(key)),
      );

      return React.createElement(tag, domProps, props.children as ReactNode);
    },
  });

  return {
    AnimatePresence: ({ children }: { children: ReactNode }) => children,
    motion,
    useReducedMotion: () => false,
  };
});

vi.mock('@/components/layout/Navigation', () => ({
  default: () => (
    <nav aria-label="Primary navigation">
      <span role="link">ABOUT</span>
      <span role="link">PROJECTS</span>
      <span role="link">CERTIFICATIONS</span>
      <span role="link">CHAT</span>
      <span role="link">CONTACT</span>
    </nav>
  ),
}));

vi.mock('@/hooks/audio/useClickSound', () => ({
  useClickSound: () => undefined,
}));

vi.mock('@/hooks/browser/useHydrated', () => ({
  useHydrated: () => true,
}));

vi.mock('@/components/effects/ScrollEffect', () => ({ default: () => null }));
vi.mock('@/components/effects/ScrollProgress', () => ({ default: () => null }));
vi.mock('@/components/effects/ScrollReveal', () => ({
  default: ({ children }: { children: ReactNode }) => <p>{children}</p>,
}));

vi.mock('@/components/texts/AnimatedText', () => ({
  AnimatedText: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  GradientText: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/home/Hero', () => ({
  default: () => <section><h1>home.hero</h1></section>,
}));

vi.mock('@/components/ui/FilterDropdown', () => ({
  default: ({ options, selected, onChange, placeholder }: {
    options: Array<{ id: string; label: string }>;
    selected: string;
    onChange: (value: string) => void;
    placeholder: string;
  }) => (
    <label>
      {placeholder}
      <select value={selected} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
      </select>
    </label>
  ),
}));

vi.mock('@/components/projects/SoloLevelingProjectCard', () => ({
  default: ({ repo }: { repo: { name: string } }) => (
    <article><h3>{repo.name}</h3></article>
  ),
}));

vi.mock('@/components/projects/ProjectReadmeModal', () => ({ default: () => null }));
vi.mock('@/components/about/AboutScrollStory', () => ({
  default: () => <section aria-label="about story">about.story</section>,
}));
vi.mock('@/components/about/InteractiveExpertiseGrid', () => ({
  default: () => <section aria-label="expertise">about.expertise</section>,
}));
vi.mock('@/components/contact/ContactCommandForm', () => ({
  default: ({ title }: { title: string }) => <form><h2>{title}</h2></form>,
}));

vi.mock('@/lib/auth/auth', () => ({
  auth: vi.fn(async () => null),
}));
vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('@/components/runtime/ClientOnlyComponents', () => ({
  HexagonGrid: () => null,
  ClientChatRoom: () => <section aria-label="chat room">chat.room</section>,
}));
vi.mock('@/components/chat/ChatEffects', () => ({ default: () => null }));

import HomePage from '@/app/[locale]/page';
import AboutPage from '@/app/[locale]/about/page';
import ProjectsPage from '@/app/[locale]/projects/page';
import CertificationsPage from '@/app/[locale]/certifications/page';
import ContactPage from '@/app/[locale]/contact/page';
import ChatPage from '@/app/[locale]/chat/page';

const repos = [
  {
    id: 1,
    name: 'qa-showcase',
    description: 'Stable fixture',
    html_url: 'https://example.test/qa-showcase',
    homepage: null,
    language: 'TypeScript',
    stargazers_count: 1,
    forks_count: 0,
    topics: [],
  },
];

beforeEach(() => {
  const storage = {
    getItem: vi.fn(() => null),
    removeItem: vi.fn(),
    setItem: vi.fn(),
  };

  vi.stubGlobal('localStorage', storage);
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: storage,
  });

  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true,
    json: async () => repos,
  })));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('locale pages', () => {
  it('renders home content after boot completes', async () => {
    render(<HomePage />);

    expect(await screen.findByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'home.hero' })).toBeVisible();
  });

  it('renders about landmarks and expertise section', async () => {
    render(<AboutPage />);

    expect(screen.getByRole('main')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'about.title' })).toBeVisible();
    expect(screen.getByRole('region', { name: 'about story' })).toBeVisible();
    expect(screen.getByRole('region', { name: 'expertise' })).toBeVisible();
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/github/repos'));
  });

  it('loads projects and exposes search/filter controls', async () => {
    render(<ProjectsPage />);

    expect(await screen.findByRole('heading', { name: 'qa-showcase' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'projects.title', level: 1 })).toBeVisible();
    expect(screen.getByRole('searchbox', { name: 'projects.filters.search' })).toBeVisible();
  });

  it('keeps projects loading until the repository response resolves', async () => {
    let resolveResponse!: (response: {
      ok: boolean;
      json: () => Promise<typeof repos>;
    }) => void;
    const response = new Promise<{ ok: boolean; json: () => Promise<typeof repos> }>(
      (resolve) => {
        resolveResponse = resolve;
      },
    );

    vi.stubGlobal('fetch', vi.fn(() => response));
    render(<ProjectsPage />);

    expect(screen.getByRole('heading', { name: 'projects.title', level: 1 })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'qa-showcase' })).not.toBeInTheDocument();

    resolveResponse({
      ok: true,
      json: async () => repos,
    });

    expect(await screen.findByRole('heading', { name: 'qa-showcase' })).toBeVisible();
    await waitFor(() => expect(screen.getByRole('searchbox', { name: 'projects.filters.search' })).toBeVisible());
  });

  it('filters projects through user input', async () => {
    const user = userEvent.setup();
    render(<ProjectsPage />);

    const search = await screen.findByRole('searchbox', { name: 'projects.filters.search' });
    await user.type(search, 'missing-project');

    expect(screen.queryByRole('heading', { name: 'qa-showcase' })).not.toBeInTheDocument();
    expect(screen.getByText('projects.noResults')).toBeVisible();

    await user.clear(search);
    expect(await screen.findByRole('heading', { name: 'qa-showcase' })).toBeVisible();
  });

  it('filters and opens certification details', async () => {
    const user = userEvent.setup();
    render(<CertificationsPage />);

    const filter = screen.getByRole('combobox', { name: 'certifications.filter' });
    await user.selectOptions(filter, 'aws');

    const certification = screen.getAllByRole('button').find((button) =>
      button.getAttribute('aria-label')?.includes(' — '),
    );
    expect(certification).toBeDefined();
    await user.click(certification!);

    expect(screen.getByRole('dialog')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'certifications.closeDetails' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders certification archive and category filter', () => {
    render(<CertificationsPage />);

    expect(screen.getByRole('heading', { name: 'certifications.title', level: 1 })).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'certifications.filter' })).toBeVisible();
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('renders contact form entry point', () => {
    render(<ContactPage />);

    expect(screen.getByRole('heading', { name: 'contact.title' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'contact.getInTouch' })).toBeVisible();
  });

  it('renders chat page with chat room landmark', async () => {
    render(await ChatPage());

    expect(screen.getByRole('main')).toBeVisible();
    expect(screen.getByRole('region', { name: 'chat room' })).toBeVisible();
  });
});
