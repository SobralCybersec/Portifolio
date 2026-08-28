'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useHydrated } from '@/hooks/useHydrated';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mounted = useHydrated();
  const t = useTranslations('nav');

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    const segments = pathname.split('/');
    
    if (segments[1] && languages.some(lang => lang.code === segments[1])) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    
    const newPath = segments.join('/');
    router.push(newPath);
    setIsOpen(false);
  };

  const isDark = mounted && document.documentElement.classList.contains('dark');
  const primary = isDark ? '#a855f7' : '#005B8C';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="nav-icon-button"
        style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${primary}40`, background: isDark ? 'rgba(4,8,16,0.6)' : 'rgba(255,255,255,0.6)', borderRadius: '10px', cursor: 'pointer', transition: 'all .18s' }}
        aria-label={t('selectLanguage')}
      >
        <Globe style={{ width: '15px', height: '15px', color: isDark ? '#8fa5bf' : '#5a6b7f' }} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-lg z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-[var(--theme-primary)]/10 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                lang.code === locale ? 'bg-[var(--theme-primary)]/20' : ''
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="text-sm font-medium text-[var(--text-primary)]">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
