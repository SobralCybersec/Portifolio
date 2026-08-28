import type { Metadata } from 'next';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://sobralcybersec.vercel.app').replace(/\/$/, '');
export const SITE_NAME = 'M.S Creative Technologist';
export const OG_IMAGE = '/images/og-default.png';

export const OPEN_GRAPH_LOCALES: Record<string, string> = {
  en: 'en_US',
  pt: 'pt_BR',
  es: 'es_ES',
  fr: 'fr_FR',
  de: 'de_DE',
  ja: 'ja_JP',
  zh: 'zh_CN',
};

export function createPageMetadata(
  locale: string,
  page: string,
  title: string,
  description: string,
): Metadata {
  const url = `/${locale}/${page}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: OPEN_GRAPH_LOCALES[locale] || locale,
      url,
      title,
      description,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: title }],
    },
  };
}
