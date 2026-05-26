'use client';

import { useState } from 'react';
import { Github, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import LanguageSwitcher from './LanguageSwitcher';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navigation() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  // Avoids hydration mismatch while removing mounted/useEffect
  const isDark = resolvedTheme !== 'light';

  const primary = isDark ? '#a855f7' : '#3b82f6';

  const isActive = (path: string) => pathname?.includes(path);

  const navLinks = [
    { href: '/about', label: t('about') },
    { href: '/projects', label: t('projects') },
    { href: '/certifications', label: t('certifications') },
    { href: '/chat', label: t('chat') },
    { href: '/contact', label: t('contact') },
  ];

  const handleNavigate = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: '12px',
          left: '12px',
          right: '12px',
          zIndex: 50,
          maxWidth: '1400px',
          margin: '0 auto',
        }}
        suppressHydrationWarning
      >
        <div
          style={{
            position: 'relative',
            border: `1px solid ${primary}88`,
            background: isDark
              ? 'rgba(10,14,24,0.92)'
              : 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '2px',
          }}
        >
          {/* Top accent line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: `linear-gradient(90deg,transparent,${primary},${primary}dd 50%,${primary},transparent)`,
              pointerEvents: 'none',
            }}
          />

          {/* Bottom accent line */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: `linear-gradient(90deg,transparent,${primary}66 30%,${primary}66 70%,transparent)`,
              pointerEvents: 'none',
            }}
          />

          {/* Corner accents */}
          {([
            { top: -2, left: -2, borderWidth: '2px 0 0 2px' },
            { top: -2, right: -2, borderWidth: '2px 2px 0 0' },
            { bottom: -2, left: -2, borderWidth: '0 0 2px 2px' },
            { bottom: -2, right: -2, borderWidth: '0 2px 2px 0' },
          ] as const).map((c, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '8px',
                height: '8px',
                borderColor: primary,
                borderStyle: 'solid',
                ...c,
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* Main bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              height: '52px',
              gap: '8px',
              minWidth: 0,
            }}
          >
            {/* Logo */}
            <Link
              href="/"
              onClick={handleNavigate}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0,
                textDecoration: 'none',
              }}
            >
              <svg
                viewBox="0 0 34 34"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  width: '32px',
                  height: '32px',
                  flexShrink: 0,
                }}
              >
                <polygon
                  points="17,1 32,9 32,25 17,33 2,25 2,9"
                  stroke={primary}
                  strokeWidth="1"
                  fill={`${primary}1a`}
                />
                <polygon
                  points="17,5 28,11 28,23 17,29 6,23 6,11"
                  stroke={`${primary}4d`}
                  strokeWidth="0.5"
                  fill="none"
                />
                <path
                  d="M17 9 L21 17 L17 25 L13 17 Z"
                  fill={primary}
                  opacity="0.9"
                />
                <circle cx="17" cy="17" r="2.5" fill={`${primary}dd`} />
              </svg>

              <span
                style={{
                  fontFamily: 'var(--font-solo-heading)',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: isDark ? '#c4b8e0' : '#1e3a8a',
                  display: 'none',
                }}
                className="sm:block"
              >
                SOBRAL
              </span>
            </Link>

            {/* Desktop nav */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                flex: '1 1 0',
                justifyContent: 'center',
                minWidth: 0,
              }}
              className="hidden lg:flex"
            >
              {navLinks.map((link) => {
                const active = isActive(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={handleNavigate}
                    onMouseEnter={() => setHoveredLink(link.href)}
                    onMouseLeave={() => setHoveredLink(null)}
                    style={{
                      position: 'relative',
                      padding: '6px 13px',
                      fontFamily: 'var(--font-solo-heading)',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '1.6px',
                      textTransform: 'uppercase',
                      color: active
                        ? `${primary}dd`
                        : isDark
                        ? '#8fa5bf'
                        : '#5a6b7f',
                      background: active ? `${primary}1f` : 'transparent',
                      border: `1px solid ${
                        active ? `${primary}73` : 'transparent'
                      }`,
                      borderRadius: '2px',
                      transition:
                        'color .18s, background .18s, border-color .18s',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      zIndex: 1,
                    }}
                  >
                    {link.label}

                    {hoveredLink === link.href && !active && (
                      <motion.span
                        layoutId="nav-hover"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: `${primary}0d`,
                          border: `1px solid ${primary}40`,
                          borderRadius: '2px',
                          zIndex: -1,
                        }}
                        transition={{
                          type: 'spring',
                          bounce: 0.2,
                          duration: 0.5,
                        }}
                      />
                    )}

                    {active && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: '8px',
                          right: '8px',
                          height: '1px',
                          background: primary,
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right cluster */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0,
              }}
            >
              {/* GitHub */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex"
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
                  borderRadius: '2px',
                  transition: 'border-color .18s',
                  flexShrink: 0,
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

              {/* Language switcher */}
              <div className="hidden md:block" style={{ flexShrink: 0 }}>
                <LanguageSwitcher />
              </div>

              {/* Theme toggle */}
              <div style={{ flexShrink: 0 }}>
                <ThemeToggle />
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen((o) => !o)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
                className="lg:hidden"
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${primary}4d`,
                  background: 'transparent',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {mobileMenuOpen ? (
                  <X
                    style={{
                      width: '18px',
                      height: '18px',
                      color: isDark ? '#8fa5bf' : '#5a6b7f',
                    }}
                  />
                ) : (
                  <Menu
                    style={{
                      width: '18px',
                      height: '18px',
                      color: isDark ? '#8fa5bf' : '#5a6b7f',
                    }}
                  />
                )}
              </button>
            </div>
          </div>

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
                        onClick={handleNavigate}
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
                        borderRadius: '2px',
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
          </AnimatePresence>
        </div>
      </nav>

      {/* Spacer */}
      <div style={{ height: '76px' }} />
    </>
  );
}