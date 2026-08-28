import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { createPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.about' });

  return createPageMetadata(locale, 'about', t('title'), t('description'));
}

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
