import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { createPageMetadata } from '@/lib/seo/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.projects' });

  return createPageMetadata(locale, 'projects', t('title'), t('description'));
}

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return children;
}
