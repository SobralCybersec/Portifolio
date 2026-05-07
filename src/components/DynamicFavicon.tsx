'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function DynamicFavicon() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const faviconPath = theme === 'dark' 
      ? '/images/favicon/Ahjin-white.svg'
      : '/images/favicon/Ahjin.svg';

    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    
    link.href = faviconPath;
  }, [theme, mounted]);

  return null;
}
