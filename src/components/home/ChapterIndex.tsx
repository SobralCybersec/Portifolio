'use client';

import { useTranslations } from 'next-intl';
import { usePathname, Link } from '@/i18n/config/routing';
import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

type Chapter = {
  href: string;
  section?: string;
  label: string;
  detail: string;
};

export default function ChapterIndex() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [activeHref, setActiveHref] = useState('#hero');
  const chapters = useMemo<Chapter[]>(() => [
    { href: '#hero', section: 'hero', label: t('home'), detail: 'OPENING FRAME' },
    { href: '#live', section: 'live', label: 'LIVE', detail: 'SYSTEM PREVIEW' },
    { href: '/about', label: t('about'), detail: 'PROFILE / STACK' },
    { href: '/projects', label: t('projects'), detail: 'SELECTED ARCHIVE' },
    { href: '/certifications', label: t('certifications'), detail: 'VERIFIED SIGNALS' },
    { href: '#contact', section: 'contact', label: t('contact'), detail: 'OPEN CHANNEL' },
  ], [t]);

  useEffect(() => {
    if (pathname !== '/') {
      return;
    }

    const sections = chapters.filter((chapter) => chapter.section);
    const observed = sections
      .map((chapter) => document.getElementById(chapter.section!))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!observed.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveHref(`#${visible.target.id}`);
      },
      { rootMargin: '-30% 0px -52% 0px', threshold: [0.1, 0.35, 0.7] },
    );

    observed.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [chapters, pathname]);

  return (
    <nav
      className="chapter-index-shell"
      aria-label="Portfolio chapters"
      data-testid="chapter-index"
      style={{ '--chapter-progress': (chapters.findIndex((chapter) => chapter.href === activeHref) + 1) / chapters.length } as CSSProperties}
    >
      <div className="chapter-index__header">
        <span>INDEX</span>
        <span aria-hidden="true">/ 06</span>
      </div>
      <ol className="chapter-index__list">
        {chapters.map((chapter, index) => {
          const active = activeHref === chapter.href;
          const linkProps = {
            className: `chapter-index__link${active ? ' is-active' : ''}`,
            'aria-current': active ? 'location' as const : undefined,
            onFocus: () => setActiveHref(chapter.href),
            onMouseEnter: () => setActiveHref(chapter.href),
          };

          return (
            <li className="chapter-index__item" key={chapter.href}>
              {chapter.href.startsWith('#') ? (
                <a href={chapter.href} {...linkProps}>
                  <span className="chapter-index__number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="chapter-index__label">{chapter.label}</span>
                  <span className="chapter-index__arrow" aria-hidden="true">↗</span>
                  <span className="chapter-index__preview" aria-hidden="true">{chapter.detail}</span>
                </a>
              ) : (
                <Link href={chapter.href} {...linkProps}>
                  <span className="chapter-index__number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="chapter-index__label">{chapter.label}</span>
                  <span className="chapter-index__arrow" aria-hidden="true">↗</span>
                  <span className="chapter-index__preview" aria-hidden="true">{chapter.detail}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      <div className="chapter-index__progress" aria-hidden="true"><span /></div>
    </nav>
  );
}
