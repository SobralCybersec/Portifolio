'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useHydrated } from '@/hooks/useHydrated';

export default function DynamicFavicon() {
  const { resolvedTheme } = useTheme();
  const mounted = useHydrated();

  useEffect(() => {
    if (!mounted) return;

    const isDark = resolvedTheme !== 'light';
    const faviconPath = isDark
      ? '/images/favicon/Ahjin.svg'
      : '/images/favicon/Ahjin-white.svg';

    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    
    link.href = faviconPath;
  }, [resolvedTheme, mounted]);

  return null;
}
