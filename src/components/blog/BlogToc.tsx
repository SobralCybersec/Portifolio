'use client';

import { useEffect, useState } from 'react';
import type { BlogTocItem } from '@/lib/blog/toc';

export default function BlogToc({ items }: { items: BlogTocItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));

    if (!headings.length) return;

    const updateActive = () => {
      const marker = window.innerHeight * 0.6;
      const current = headings.reduce(
        (active, heading) => (heading.getBoundingClientRect().top <= marker ? heading : active),
        headings[0],
      );
      setActiveId(current.id);
    };

    const observer = new IntersectionObserver(updateActive, {
      rootMargin: '0px 0px -40% 0px',
      threshold: [0.1, 0.35, 0.7],
    });

    headings.forEach((heading) => observer.observe(heading));
    window.addEventListener('resize', updateActive);
    updateActive();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateActive);
    };
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav className="blog-toc" aria-label="On this page">
      <div className="blog-toc__header">
        <span>CHAPTER INDEX</span>
        <span aria-hidden="true">/ {String(items.length).padStart(2, '0')}</span>
      </div>
      <ol className="blog-toc__list">
        {items.map((item, index) => {
          const active = item.id === activeId;
          return (
            <li className={`blog-toc__item${item.level === 3 ? ' is-subitem' : ''}${active ? ' is-active' : ''}`} key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active ? 'location' : undefined}
                onClick={() => setActiveId(item.id)}
                onFocus={() => setActiveId(item.id)}
                onMouseEnter={() => setActiveId(item.id)}
              >
                <span className="blog-toc__number">{String(index + 1).padStart(2, '0')}</span>
                <span className="blog-toc__label">{item.title}</span>
                <span className="blog-toc__line" aria-hidden="true" />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
