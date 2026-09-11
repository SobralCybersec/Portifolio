import type { Metadata } from 'next';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://sobralcybersec.vercel.app').replace(/\/$/, '');
export const SITE_NAME = 'Matheus Sobral | Full-Stack Developer & Cybersecurity Analyst';
export const OG_IMAGE = '/images/og-default.png';

export const PERSON_JSONLD = {
  '@type': 'Person',
  name: 'Matheus Sobral',
  alternateName: ['SobralCybersec', 'M.S', 'Matheus S.'],
  description: 'Full-Stack Developer and Cybersecurity Analyst with 2+ years building Java systems with 1M+ downloads in production. Computer Science at UNESA, Cybersecurity at FIAP.',
  jobTitle: 'Full-Stack Developer & Cybersecurity Analyst',
  url: SITE_URL,
  image: `${SITE_URL}/images/og-default.png`,
  nationality: { '@type': 'Country', name: 'Brazil' },
  alumniOf: [
    { '@type': 'CollegeOrUniversity', name: 'UNESA — Universidade Estácio de Sá', department: 'Computer Science' },
    { '@type': 'CollegeOrUniversity', name: 'FIAP', department: 'Cybersecurity' },
  ],
  knowsAbout: [
    'Cybersecurity',
    'Full-Stack Development',
    'Java',
    'Spring Boot',
    'Next.js',
    'React',
    'TypeScript',
    'AWS',
    'Redis',
    'Penetration Testing',
    'OWASP',
    'REST APIs',
    'Clean Architecture',
  ],
  knowsLanguage: ['pt', 'en', 'es'],
  sameAs: ['https://github.com/SobralCybersec', 'https://br.linkedin.com/in/matheusdecyber'],
};

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
