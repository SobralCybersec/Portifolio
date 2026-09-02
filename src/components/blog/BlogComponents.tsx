import type { ComponentProps, ReactNode } from 'react';
import type { MDXComponents } from 'mdx/types';
import { compile, run } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import type { Element, Root } from 'hast';
import { common, createLowlight } from 'lowlight';

const lowlight = createLowlight(common);

function hastText(node: Element['children'][number]): string {
  if (node.type === 'text') return node.value;
  if (node.type === 'element') return node.children.map(hastText).join(' ');
  return '';
}

export type VideoProps = {
  src: string;
  poster?: string;
  title?: string;
};

export function Video({ src, poster, title = 'Embedded video' }: VideoProps) {
  return (
    <figure className="blog-media-frame">
      <video controls preload="metadata" playsInline poster={poster} aria-label={title}>
        <source src={src} />
        Your browser does not support embedded video.
      </video>
      <figcaption>{title}</figcaption>
    </figure>
  );
}

export type YouTubeProps = {
  id: string;
  title: string;
  start?: number;
};

export function YouTube({ id, title, start }: YouTubeProps) {
  const validId = /^[A-Za-z0-9_-]{6,20}$/.test(id) ? id : '';
  if (!validId) return <p role="alert">Invalid YouTube video id.</p>;
  const query = start && start > 0 ? `?start=${Math.floor(start)}` : '';
  return (
    <div className="blog-video-frame">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${validId}${query}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}

export type CalloutProps = {
  children: ReactNode;
  title?: string;
  variant?: 'info' | 'warning' | 'success';
};

export function Callout({ children, title, variant = 'info' }: CalloutProps) {
  return (
    <aside className={`blog-callout blog-callout--${variant}`}>
      {title && <strong>{title}</strong>}
      <div>{children}</div>
    </aside>
  );
}

function rehypeSlug() {
  return (tree: Root) => {
    const counts = new Map<string, number>();
    visit(tree, 'element', (node: Element) => {
      if (!/^h[1-6]$/.test(node.tagName)) return;
      const text = node.children.map(hastText).join(' ')
        .toLowerCase()
        .normalize('NFKD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'section';
      const count = counts.get(text) ?? 0;
      counts.set(text, count + 1);
      node.properties.id = count ? `${text}-${count + 1}` : text;
    });
  };
}

function rehypeHighlight() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'pre') return;
      const code = node.children.find((child): child is Element => child.type === 'element' && child.tagName === 'code');
      if (!code) return;
      const classNames = Array.isArray(code.properties.className) ? code.properties.className.filter((name): name is string => typeof name === 'string') : [];
      const language = classNames.find((name) => name.startsWith('language-'))?.slice('language-'.length);
      if (!language) return;
      try {
        const highlighted = lowlight.highlight(language, code.children.filter((child) => child.type === 'text').map((child) => child.value).join(''));
        code.children = highlighted.children as Element['children'];
        code.properties.className = [...classNames, 'hljs'];
      } catch {
        // Unknown language stays readable as plain code.
      }
    });
  };
}

function ExternalLink({ href, children, ...props }: ComponentProps<'a'>) {
  const external = typeof href === 'string' && /^https?:\/\//.test(href);
  return <a href={href} {...props} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}</a>;
}

export const blogMdxComponents: MDXComponents = {
  h1: (props) => <h1 className="blog-mdx-h1" {...props} />,
  h2: (props) => <h2 className="blog-mdx-h2" {...props} />,
  h3: (props) => <h3 className="blog-mdx-h3" {...props} />,
  p: (props) => <p className="blog-mdx-p" {...props} />,
  a: ExternalLink,
  // Inline MDX image dimensions are author-controlled; avoid inventing layout data.
  img: ({ alt = '', loading = 'lazy', ...props }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} loading={loading} {...props} />;
  },
  blockquote: (props) => <blockquote className="blog-mdx-blockquote" {...props} />,
  table: (props) => <div className="blog-mdx-table"><table {...props} /></div>,
  pre: (props) => <pre className="blog-mdx-pre" {...props} />,
  code: (props) => <code className="blog-mdx-code" {...props} />,
  Video,
  YouTube,
  Callout,
};

export async function BlogMdx({ source }: { source: string }) {
  const compiled = await compile(source, {
    outputFormat: 'function-body',
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, rehypeHighlight],
  });
  const { default: MDXContent } = await run(compiled, { ...runtime, baseUrl: import.meta.url });
  return <MDXContent components={blogMdxComponents} />;
}
