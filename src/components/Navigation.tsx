'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import LanguageSwitcher from './LanguageSwitcher';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => pathname?.includes(path);

  const navLinks = [
    { href: '/', label: t('home'), exact: true },
    { href: '/projects', label: t('projects') },
    { href: '/certifications', label: t('certifications') },
    { href: '/contact', label: t('contact') },
  ];

  const isHomeActive = () => {
    const segments = pathname?.split('/').filter(Boolean) ?? [];
    return segments.length <= 1;
  };

  return (
    <nav className="ccg-nav">
      <Link href="/" className="nav-logo">
        M<em>.</em>S<em>.</em>SILVA
      </Link>

      <button
        className={`nav-toggle${mobileOpen ? ' open' : ''}`}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>

      <ul className={`nav-links${mobileOpen ? ' open' : ''}`}>
        <li>
          <Link
            href="/"
            className={isHomeActive() ? 'active' : ''}
            onClick={() => setMobileOpen(false)}
          >
            {t('home')}
          </Link>
        </li>
        <li>
          <Link
            href="/projects"
            className={isActive('/projects') ? 'active' : ''}
            onClick={() => setMobileOpen(false)}
          >
            {t('projects')}
          </Link>
        </li>
        <li>
          <Link
            href="/certifications"
            className={isActive('/certifications') ? 'active' : ''}
            onClick={() => setMobileOpen(false)}
          >
            {t('certifications')}
          </Link>
        </li>
        <li>
          <Link
            href="/contact"
            className={isActive('/contact') ? 'active' : ''}
            onClick={() => setMobileOpen(false)}
          >
            {t('contact')}
          </Link>
        </li>
        <li className="nav-lang">
          <LanguageSwitcher />
        </li>
      </ul>
    </nav>
  );
}
