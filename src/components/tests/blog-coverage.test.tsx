import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useMDXComponents } from '../../mdx-components';
import { BlogBackLink, BlogCard, BlogChronology, BlogChrome, BlogDate, BlogExternalReference, BlogHeader, BlogMonthList } from '../blog/BlogUI';
import { Callout, Video, YouTube, blogMdxComponents } from '../blog/BlogComponents';
import BlogToc from '../blog/BlogToc';
import { getBlogPostMetadata, getBlogJsonLd } from '../../lib/blog/seo';
import { getBlogRoute } from '../../lib/blog/content';
import { slugify } from '../../lib/blog/slug';
import { getBlogToc } from '../../lib/blog/toc';
import type { BlogPost } from '../../lib/blog/types';

jest.mock('next/link', () => ({
  __esModule: true,
  default: function LinkMock({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) {
    return <a {...props}>{children}</a>;
  },
}));
jest.mock('@/components/layout/Navigation', () => function NavigationMock() {
  return <nav data-testid="navigation" />;
});
jest.mock('@mdx-js/mdx', () => ({ compile: jest.fn(), run: jest.fn() }));
jest.mock('unist-util-visit', () => ({ visit: jest.fn() }));
jest.mock('lowlight', () => ({ common: {}, createLowlight: () => ({ highlight: jest.fn() }) }));

const post: BlogPost = {
  title: 'Performance notes',
  description: 'A concrete description for this article.',
  date: '2026-01-02T10:00:00-03:00',
  updated: '2026-01-03T10:00:00-03:00',
  tags: ['nextjs', 'performance'],
  draft: false,
  pinned: true,
  cover: '/blog/cover.webp',
  year: '2026',
  month: '01',
  day: '02',
  slug: 'performance-notes',
  route: '/en/blog/2026/01/02/performance-notes',
  sourcePath: '/tmp/index.mdx',
  locale: 'en-US',
};

test('covers blog chrome, headers, cards, chronology, and metadata', () => {
  const group = { key: '2026-01', year: '2026', month: '01', label: 'January', posts: [post] };
  render(<BlogChrome><BlogHeader locale="en" title="Field notes" description="Articles" /></BlogChrome>);
  expect(screen.getByTestId('navigation')).toBeInTheDocument();
  expect(screen.getByRole('navigation', { name: 'Blog navigation' })).toBeInTheDocument();
  render(<BlogMonthList groups={[group]} locale="en-US" />);
  expect(screen.getByText('Performance notes')).toBeInTheDocument();
  expect(screen.getByText('PINNED')).toBeInTheDocument();
  expect(screen.getByText('2 topics')).toBeInTheDocument();
  render(<BlogChronology current={post} locale="en-US" />);
  render(<BlogChronology current={post} previous={{ ...post, title: 'Older' }} next={{ ...post, title: 'Newer' }} locale="en-US" />);
  expect(screen.getByText('Older')).toBeInTheDocument();
  expect(screen.getByText('Newer')).toBeInTheDocument();
  render(<BlogBackLink locale="en" />);
  render(<BlogExternalReference href="https://example.test" label="Reference" />);
  render(<BlogDate post={post} />);
  expect(screen.getByText('Reference')).toHaveAttribute('target', '_blank');
  const metadata = getBlogPostMetadata(post, 'en');
  expect(metadata.alternates?.canonical).toBe(getBlogRoute(post, 'en'));
  expect(getBlogJsonLd(post, 'en').dateModified).toBe(post.updated);
});

test('covers MDX components and external-link behavior', () => {
  render(<Video src="/demo.mp4" poster="/poster.webp" title="Demo" />);
  expect(screen.getByLabelText('Demo')).toHaveAttribute('poster', '/poster.webp');
  render(<YouTube id="bad" title="Invalid" />);
  expect(screen.getByRole('alert')).toHaveTextContent('Invalid YouTube video id.');
  render(<YouTube id="abc123" title="Demo" start={3.8} />);
  expect(screen.getByTitle('Demo')).toHaveAttribute('src', expect.stringContaining('?start=3'));
  render(<Callout title="Note" variant="warning">Body</Callout>);
  expect(screen.getByText('Note').parentElement).toHaveClass('blog-callout--warning');

  const Heading = blogMdxComponents.h2 as React.ComponentType<React.HTMLAttributes<HTMLHeadingElement>>;
  const Anchor = blogMdxComponents.a as React.ComponentType<React.AnchorHTMLAttributes<HTMLAnchorElement>>;
  const Image = blogMdxComponents.img as React.ComponentType<React.ImgHTMLAttributes<HTMLImageElement>>;
  render(<Heading>Heading</Heading>);
  render(<Anchor href="https://example.test">External</Anchor>);
  render(<Anchor href="/internal">Internal</Anchor>);
  render(<Image src="/image.webp" alt="" />);
  expect(screen.getByRole('link', { name: 'External' })).toHaveAttribute('rel', 'noopener noreferrer');
  expect(screen.getByRole('link', { name: 'Internal' })).not.toHaveAttribute('target');
  const images = screen.getAllByAltText('');
  expect(images[images.length - 1]).toHaveAttribute('loading', 'lazy');
  expect(useMDXComponents()).toBe(blogMdxComponents);
});

test('extracts headings, duplicate ids, and normalized slugs', () => {
  expect(slugify('Olá & World!')).toBe('ola-and-world');
  expect(getBlogToc('Intro\n\n## O resultado\n### O que mudou\n## O resultado\n## [Contrato](#x) (draft)')).toEqual([
    { id: 'o-resultado', title: 'O resultado', level: 2 },
    { id: 'o-que-mudou', title: 'O que mudou', level: 3 },
    { id: 'o-resultado-2', title: 'O resultado', level: 2 },
    { id: 'contrato', title: 'Contrato', level: 2 },
  ]);
});

test('tracks active chapter and handles short or missing indexes', () => {
  expect(render(<BlogToc items={[{ id: 'only', title: 'Only', level: 2 }]} />).container).toBeEmptyDOMElement();
  const items = [
    { id: 'first', title: 'First', level: 2 as const },
    { id: 'second', title: 'Second', level: 3 as const },
  ];
  const first = document.createElement('h2');
  first.id = 'first';
  const second = document.createElement('h3');
  second.id = 'second';
  document.body.append(first, second);
  Object.defineProperty(first, 'getBoundingClientRect', { value: () => ({ top: 10 }) });
  Object.defineProperty(second, 'getBoundingClientRect', { value: () => ({ top: 900 }) });
  const { unmount } = render(<BlogToc items={items} />);
  expect(screen.getByRole('link', { name: /First/ }).closest('li')).toHaveClass('is-active');
  const secondLink = screen.getByRole('link', { name: /Second/ });
  fireEvent.mouseEnter(secondLink);
  expect(secondLink.closest('li')).toHaveClass('is-active');
  fireEvent.focus(secondLink);
  fireEvent.click(secondLink);
  fireEvent(window, new Event('resize'));
  unmount();
});
