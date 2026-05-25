import '../globals.css';
import { Share_Tech_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import DynamicFavicon from '@/components/DynamicFavicon';
import { BackgroundMusic } from '@/components/BackgroundMusic';
import { Analytics } from '@vercel/analytics/react';

const shareTechMono = Share_Tech_Mono({
  variable: '--font-share-tech-mono',
  subsets: ['latin'],
  weight: '400',
});

const eternal = localFont({
  src: '../../../public/fonts/Eternal.ttf',
  variable: '--font-eternal',
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return {
    title: 'Matheus S. Silva — Black Reaper',
    description: 'Full-Stack Developer and Cybersecurity Analyst. Building fast, secure, and hard-to-break systems.',
    keywords: ['portfolio', 'developer', 'full-stack', 'cybersecurity', 'TypeScript', 'Next.js', 'React', 'Java'],
    icons: {
      icon: '/images/favicon/Ahjin.svg',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <link rel="icon" type="image/svg+xml" href="/images/favicon/Ahjin.svg" />
        <link rel="preconnect" href="https://fonts.cdnfonts.com" />
        <link href="https://fonts.cdnfonts.com/css/downcome" rel="stylesheet" />
      </head>
      <body className={`${shareTechMono.variable} ${eternal.variable} antialiased`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <DynamicFavicon />
          <BackgroundMusic autoPlay />
          {children}
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
