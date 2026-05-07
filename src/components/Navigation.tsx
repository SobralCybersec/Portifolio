'use client';

import { useState } from 'react';
import { BookOpen, Github, User, Briefcase, Mail, Award, Menu, X, Search, Bell } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import LanguageSwitcher from './LanguageSwitcher';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

export default function Navigation() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { theme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  
  const isActive = (path: string) => pathname?.includes(path);
  const isDark = theme === 'dark';
  const primary = isDark ? '#a855f7' : '#3b82f6';
  
  const navLinks = [
    { href: '/about', label: t('about') },
    { href: '/projects', label: t('projects') },
    { href: '/certifications', label: t('certifications') },
    { href: '/blog', label: t('blog') },
    { href: '/contact', label: t('contact') },
  ];
  
  return (
    <>
      <nav 
        className="fixed top-0 left-0 right-0 z-50" 
        style={{
          margin: '16px auto 0',
          padding: '0 16px',
          maxWidth: '1400px'
        }}
        suppressHydrationWarning
      >
        <div 
          style={{
            position: 'relative',
            border: `1px solid ${primary}88`,
            background: isDark ? 'rgba(10,14,24,0.92)' : 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '2px'
          }}
        >
          {/* Frame accents */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg,transparent 0%,${primary} 20%,${primary}dd 50%,${primary} 80%,transparent 100%)` }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg,transparent 0%,${primary}66 30%,${primary}66 50%,${primary}66 70%,transparent 100%)` }} />
          
          {/* Corner accents */}
          {[{t:-2,l:-2,bw:'2px 0 0 2px'},{t:-2,r:-2,bw:'2px 2px 0 0'},{b:-2,l:-2,bw:'0 0 2px 2px'},{b:-2,r:-2,bw:'0 2px 2px 0'}].map((c,i)=>(
            <div key={i} style={{position:'absolute',...(c.t!==undefined?{top:c.t+'px'}:{}),... (c.b!==undefined?{bottom:c.b+'px'}:{}),... (c.l!==undefined?{left:c.l+'px'}:{}),... (c.r!==undefined?{right:c.r+'px'}:{}),width:'8px',height:'8px',borderColor:primary,borderStyle:'solid',borderWidth:c.bw}} />
          ))}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: '56px', gap: '12px' }}>
            {/* Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, textDecoration: 'none' }}>
              <div style={{ position: 'relative', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '34px', height: '34px' }}>
                  <polygon points="17,1 32,9 32,25 17,33 2,25 2,9" stroke={primary} strokeWidth="1" fill={`${primary}1a`} />
                  <polygon points="17,5 28,11 28,23 17,29 6,23 6,11" stroke={`${primary}4d`} strokeWidth="0.5" fill="none" />
                  <path d="M17 9 L21 17 L17 25 L13 17 Z" fill={primary} opacity="0.9" />
                  <circle cx="17" cy="17" r="2.5" fill={`${primary}dd`} />
                </svg>
              </div>

            </Link>

            {/* Desktop Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1, justifyContent: 'center', position: 'relative' }} className="hidden lg:flex">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  onMouseEnter={() => setHoveredLink(link.href)}
                  onMouseLeave={() => setHoveredLink(null)}
                  style={{ 
                    position: 'relative', 
                    padding: '7px 14px', 
                    fontFamily: 'var(--font-solo-heading)',
                    fontSize: '11px', 
                    fontWeight: 700, 
                    letterSpacing: '1.8px', 
                    textTransform: 'uppercase', 
                    color: isActive(link.href) ? `${primary}dd` : isDark ? '#8fa5bf' : '#5a6b7f', 
                    cursor: 'pointer', 
                    background: isActive(link.href) ? `${primary}1f` : 'transparent', 
                    border: `1px solid ${isActive(link.href) ? `${primary}73` : 'transparent'}`, 
                    borderRadius: '2px', 
                    transition: 'color .18s, background .18s, border-color .18s', 
                    textDecoration: 'none',
                    zIndex: 1
                  }}
                >
                  {link.label}
                  {hoveredLink === link.href && !isActive(link.href) && (
                    <motion.span
                      layoutId="nav-hover"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: `${primary}0d`,
                        border: `1px solid ${primary}40`,
                        borderRadius: '2px',
                        zIndex: -1
                      }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {isActive(link.href) && <span style={{ position: 'absolute', bottom: 0, left: '8px', right: '8px', height: '1px', background: primary }} />}
                </Link>
              ))}
            </div>

            {/* Right cluster */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${primary}40`, background: isDark ? 'rgba(4,8,16,0.6)' : 'rgba(255,255,255,0.6)', borderRadius: '2px', cursor: 'pointer', transition: 'all .18s' }} className="hidden md:flex">
                <Github style={{ width: '15px', height: '15px', color: isDark ? '#8fa5bf' : '#5a6b7f' }} />
              </a>
              <div className="hidden md:block" style={{ width: '32px', height: '32px' }}><LanguageSwitcher /></div>
              <div style={{ width: '32px', height: '32px' }}><ThemeToggle /></div>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${primary}4d`, background: 'transparent', borderRadius: '2px', cursor: 'pointer' }} className="lg:hidden">
                {mobileMenuOpen ? <X style={{ width: '18px', height: '18px', color: isDark ? '#8fa5bf' : '#5a6b7f' }} /> : <Menu style={{ width: '18px', height: '18px', color: isDark ? '#8fa5bf' : '#5a6b7f' }} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', borderTop: `1px solid ${primary}33`, padding: '8px 0', overflow: 'hidden' }} 
              className="lg:hidden"
            >
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  onClick={() => setMobileMenuOpen(false)} 
                  style={{ 
                    padding: '10px 20px', 
                    fontFamily: 'var(--font-solo-heading)',
                    fontSize: '11px', 
                    fontWeight: 700, 
                    letterSpacing: '1.8px', 
                    textTransform: 'uppercase', 
                    color: isActive(link.href) ? `${primary}dd` : isDark ? '#8fa5bf' : '#5a6b7f', 
                    cursor: 'pointer', 
                    borderLeft: `2px solid ${isActive(link.href) ? primary : 'transparent'}`, 
                    transition: 'all .15s', 
                    background: isActive(link.href) ? `${primary}1a` : 'transparent', 
                    textDecoration: 'none', 
                    display: 'block' 
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <div style={{ display: 'flex', gap: '8px', padding: '10px 20px', borderTop: `1px solid ${primary}1a`, marginTop: '8px' }} className="md:hidden">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${primary}40`, background: isDark ? 'rgba(4,8,16,0.6)' : 'rgba(255,255,255,0.6)', borderRadius: '2px' }}>
                  <Github style={{ width: '15px', height: '15px', color: isDark ? '#8fa5bf' : '#5a6b7f' }} />
                </a>
                <div style={{ width: '32px', height: '32px' }}><LanguageSwitcher /></div>
              </div>
            </motion.div>
          )}
        </div>
      </nav>
      <div style={{ height: '1px' }} />
    </>
  );
}
