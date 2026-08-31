'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useHydrated } from '@/hooks/browser/useHydrated';
import { useTranslations } from 'next-intl';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useHydrated();
  const t = useTranslations('nav');

  if (!mounted) {
    return null;
  }

  const isDark = theme === 'dark';
  const primary = isDark ? '#a855f7' : '#005B8C';

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="nav-icon-button"
      style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${primary}40`, background: isDark ? 'rgba(4,8,16,0.6)' : 'rgba(255,255,255,0.6)', borderRadius: '10px', cursor: 'pointer', transition: 'all .18s' }}
      aria-label={t('toggleTheme')}
    >
      {theme === 'dark' ? (
        <Sun style={{ width: '15px', height: '15px', color: isDark ? '#8fa5bf' : '#5a6b7f' }} />
      ) : (
        <Moon style={{ width: '15px', height: '15px', color: isDark ? '#8fa5bf' : '#5a6b7f' }} />
      )}
    </button>
  );
}
