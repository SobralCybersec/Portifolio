import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { createPageMetadata } from '@/lib/seo/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.chat' });

  return createPageMetadata(locale, 'chat', t('title'), t('description'));
}

export default function ChatLayout({ children }: { children: ReactNode }) {
  return children;
}
