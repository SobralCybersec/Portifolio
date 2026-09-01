'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Github, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/config/routing';
import LanguageSwitcher from './LanguageSwitcher';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

type NavLink = { href: string; label: string };

interface NavigationContentProps {
  pathname: string;
  isDark: boolean;
  primary: string;
  navLinks: NavLink[];
  mobileMenuOpen: boolean;
  hoveredLink: string | null;
  onHoverLink: (href: string | null) => void;
  onNavigate: () => void;
  onToggleMobileMenu: () => void;
  openMenuLabel: string;
  closeMenuLabel: string;
}

interface MobileMenuProps {
  pathname: string;
  isDark: boolean;
  primary: string;
  navLinks: NavLink[];
  mobileMenuOpen: boolean;
  onNavigate: () => void;
}

function MobileMenu(props: MobileMenuProps) {
  const { pathname, isDark, primary, navLinks, mobileMenuOpen, onNavigate } = props;
  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/');

  return (
    <>
          {/* Mobile menu */}
          <AnimatePresence initial={false}>
            {mobileMenuOpen && (
              <motion.div
                key="mobile-menu"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{
                  duration: 0.25,
                  ease: 'easeInOut',
                }}
                style={{
                  overflow: 'hidden',
                  borderTop: `1px solid ${primary}33`,
                }}
                className="lg:hidden"
              >
                <div style={{ padding: '8px 0' }}>
                  {navLinks.map((link) => {
                    const active = isActive(link.href);

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={onNavigate}
                        style={{
                          display: 'block',
                          padding: '11px 20px',
                          fontFamily: 'var(--font-solo-heading)',
                          fontSize: '11px',
                          fontWeight: 700,
                          letterSpacing: '1.8px',
                          textTransform: 'uppercase',
                          color: active
                            ? `${primary}dd`
                            : isDark
                            ? '#8fa5bf'
                            : '#5a6b7f',
                          borderLeft: `2px solid ${
                            active ? primary : 'transparent'
                          }`,
                          background: active
                            ? `${primary}1a`
                            : 'transparent',
                          transition: 'all .15s',
                          textDecoration: 'none',
                        }}
                      >
                        {link.label}
                      </Link>
                    );
                  })}

                  {/* Mobile footer */}
                  <div
                    className="md:hidden"
                    style={{
                      display: 'flex',
                      gap: '8px',
                      padding: '10px 20px',
                      borderTop: `1px solid ${primary}1a`,
                      marginTop: '8px',
                    }}
                  >
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nav-icon-button"
                      aria-label="GitHub"
                      style={{
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${primary}40`,
                        background: isDark
                          ? 'rgba(4,8,16,0.6)'
                          : 'rgba(255,255,255,0.6)',
                        borderRadius: '10px',
                      }}
                    >
                      <Github
                        style={{
                          width: '15px',
                          height: '15px',
                          color: isDark ? '#8fa5bf' : '#5a6b7f',
                        }}
                      />
                    </a>

                    <LanguageSwitcher />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>    </>
  );
}

function isActivePath(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(path + '/');
}

type DesktopNavigationProps = Pick<NavigationContentProps, 'pathname' | 'isDark' | 'primary' | 'navLinks' | 'hoveredLink' | 'onHoverLink' | 'onNavigate'>;

function NavigationLogo(props: Pick<NavigationContentProps, 'isDark' | 'onNavigate'>) {
  const { isDark, onNavigate } = props;
  return (
    <Link href="/" onClick={onNavigate} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, textDecoration: 'none' }}>
      <Image
        src={isDark ? '/images/icons/igris.png' : '/images/icons/beru.png'}
        alt={isDark ? 'Igris' : 'Beru'}
        width={32}
        height={32}
        priority
        className="object-contain"
        style={{ width: '32px', height: '32px', flexShrink: 0 }}
      />
      <span
        className="sm:block"
        style={{ fontFamily: 'var(--font-solo-heading)', fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: isDark ? '#c4b8e0' : '#1e3a8a', display: 'none' }}
      >
        SOBRAL
      </span>
    </Link>
  );
}

function DesktopNavLink(props: DesktopNavigationProps & { link: NavLink }) {
  const { pathname, isDark, primary, hoveredLink, onHoverLink, onNavigate, link } = props;
  const active = isActivePath(pathname, link.href);
  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      onMouseEnter={() => onHoverLink(link.href)}
      onMouseLeave={() => onHoverLink(null)}
      style={{ position: 'relative', padding: '6px 13px', fontFamily: 'var(--font-solo-heading)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.6px', textTransform: 'uppercase', color: active ? (isDark ? '#d8b4fe' : '#1e3a8a') : (isDark ? '#8fa5bf' : '#5a6b7f'), background: active ? primary + '1f' : 'transparent', border: '1px solid ' + (active ? primary + '73' : 'transparent'), borderRadius: '8px', transition: 'color .18s, background .18s, border-color .18s', textDecoration: 'none', whiteSpace: 'nowrap', zIndex: 1 }}
    >
      {link.label}
      {hoveredLink === link.href && !active && (
        <motion.span
          layoutId="nav-hover"
          style={{ position: 'absolute', inset: 0, background: primary + '0d', border: '1px solid ' + primary + '40', borderRadius: '8px', zIndex: -1 }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
        />
      )}
      {active && <span style={{ position: 'absolute', bottom: 0, left: '8px', right: '8px', height: '1px', background: primary }} />}
    </Link>
  );
}

function DesktopNavigation(props: DesktopNavigationProps) {
  const { navLinks } = props;
  return (
    <div style={{ alignItems: 'center', gap: '2px', flex: '1 1 0', justifyContent: 'center', minWidth: 0 }} className="hidden lg:flex">
      {navLinks.map((link) => <DesktopNavLink key={link.href} {...props} link={link} />)}
    </div>
  );
}

function GithubLink(props: Pick<NavigationContentProps, 'isDark' | 'primary'>) {
  const { isDark, primary } = props;
  return (
    <a
      href="https://github.com"
      target="_blank"
      rel="noopener noreferrer"
      className="nav-icon-button hidden md:flex"
      aria-label="GitHub"
      style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid ' + primary + '40', background: isDark ? 'rgba(4,8,16,0.6)' : 'rgba(255,255,255,0.6)', borderRadius: '10px', transition: 'border-color .18s', flexShrink: 0 }}
    >
      <Github style={{ width: '15px', height: '15px', color: isDark ? '#8fa5bf' : '#5a6b7f' }} />
    </a>
  );
}

function MobileMenuToggle(props: Pick<NavigationContentProps, 'isDark' | 'primary' | 'mobileMenuOpen' | 'onToggleMobileMenu' | 'openMenuLabel' | 'closeMenuLabel'>) {
  const { isDark, primary, mobileMenuOpen, onToggleMobileMenu, openMenuLabel, closeMenuLabel } = props;
  const Icon = mobileMenuOpen ? X : Menu;
  return (
    <button
      onClick={onToggleMobileMenu}
      aria-label={mobileMenuOpen ? closeMenuLabel : openMenuLabel}
      aria-expanded={mobileMenuOpen}
      className="nav-icon-button lg:hidden"
      style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid ' + primary + '4d', background: 'transparent', borderRadius: '10px', cursor: 'pointer', flexShrink: 0 }}
    >
      <Icon style={{ width: '18px', height: '18px', color: isDark ? '#8fa5bf' : '#5a6b7f' }} />
    </button>
  );
}

function NavigationActions(props: NavigationContentProps) {
  const { isDark, primary } = props;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
      <GithubLink isDark={isDark} primary={primary} />
      <div className="hidden md:block" style={{ flexShrink: 0 }}><LanguageSwitcher /></div>
      <div style={{ flexShrink: 0 }}><ThemeToggle /></div>
      <MobileMenuToggle {...props} />
    </div>
  );
}

function CornerAccents({ primary }: { primary: string }) {
  const corners = [
    { top: -2, left: -2, borderWidth: '2px 0 0 2px' },
    { top: -2, right: -2, borderWidth: '2px 2px 0 0' },
    { bottom: -2, left: -2, borderWidth: '0 0 2px 2px' },
    { bottom: -2, right: -2, borderWidth: '0 2px 2px 0' },
  ] as const;
  return <>{corners.map((corner, index) => <div key={index} style={{ position: 'absolute', width: '8px', height: '8px', borderColor: primary, borderStyle: 'solid', ...corner, pointerEvents: 'none' }} />)}</>;
}

function NavigationBar(props: NavigationContentProps) {
  const { pathname, isDark, primary, navLinks, mobileMenuOpen, hoveredLink, onHoverLink, onNavigate, onToggleMobileMenu, openMenuLabel, closeMenuLabel } = props;
  return (
    <div style={{ position: 'relative', border: '1px solid ' + primary + '88', background: isDark ? 'rgba(10,14,24,0.92)' : 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '2px' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,' + primary + ',' + primary + 'dd 50%,' + primary + ',transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,' + primary + '66 30%,' + primary + '66 70%,transparent)', pointerEvents: 'none' }} />
      <CornerAccents primary={primary} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: '52px', gap: '8px', minWidth: 0 }}>
        <NavigationLogo isDark={isDark} onNavigate={onNavigate} />
        <DesktopNavigation pathname={pathname} isDark={isDark} primary={primary} navLinks={navLinks} hoveredLink={hoveredLink} onHoverLink={onHoverLink} onNavigate={onNavigate} />
        <NavigationActions {...props} />
      </div>
      <MobileMenu pathname={pathname} isDark={isDark} primary={primary} navLinks={navLinks} mobileMenuOpen={mobileMenuOpen} onNavigate={onNavigate} />
    </div>
  );
}

function NavigationContent(props: NavigationContentProps) {
  return (
    <>
      <nav style={{ position: 'fixed', top: '12px', left: '12px', right: '12px', zIndex: 50, maxWidth: '1400px', margin: '0 auto' }} suppressHydrationWarning>
        <NavigationBar {...props} />
      </nav>
      <div style={{ height: '76px' }} />
    </>
  );
}

export default function Navigation() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const isDark = resolvedTheme !== 'light';
  const primary = isDark ? '#a855f7' : '#3b82f6';
  const navLinks: NavLink[] = [
    { href: '/about', label: t('about') },
    { href: '/projects', label: t('projects') },
    { href: '/certifications', label: t('certifications') },
    { href: '/chat', label: t('chat') },
    { href: '/contact', label: t('contact') },
  ];
  const handleNavigate = () => setMobileMenuOpen(false);

  return (
    <NavigationContent
      pathname={pathname}
      isDark={isDark}
      primary={primary}
      navLinks={navLinks}
      mobileMenuOpen={mobileMenuOpen}
      hoveredLink={hoveredLink}
      onHoverLink={setHoveredLink}
      onNavigate={handleNavigate}
      onToggleMobileMenu={() => setMobileMenuOpen((open) => !open)}
      openMenuLabel={t('openMenu')}
      closeMenuLabel={t('closeMenu')}
    />
  );
}
