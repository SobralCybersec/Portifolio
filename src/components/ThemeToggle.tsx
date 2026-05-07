'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useHydrated } from '@/hooks/useHydrated';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useHydrated();

  if (!mounted) {
    return null;
  }

  const isDark = theme === 'dark';
  const primary = isDark ? '#a855f7' : '#005B8C';

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${primary}40`, background: isDark ? 'rgba(4,8,16,0.6)' : 'rgba(255,255,255,0.6)', borderRadius: '2px', cursor: 'pointer', transition: 'all .18s' }}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun style={{ width: '15px', height: '15px', color: isDark ? '#8fa5bf' : '#5a6b7f' }} />
      ) : (
        <Moon style={{ width: '15px', height: '15px', color: isDark ? '#8fa5bf' : '#5a6b7f' }} />
      )}
    </button>
  );
}
