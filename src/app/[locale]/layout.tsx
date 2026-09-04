import '../globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/config/routing';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import DynamicFavicon from '@/components/layout/DynamicFavicon';
import { BackgroundMusic } from '@/components/media/BackgroundMusic';
import { Analytics } from '@vercel/analytics/react';
import { OPEN_GRAPH_LOCALES, OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/seo/seo';
import { PageTransitionProvider } from '@/components/layout/PageTransition';
import MatrixBackground from '@/components/effects/MatrixBackground';

const geistSans = localFont({
  src: [
    { path: '../../../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2', weight: '400' },
    { path: '../../../node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2', weight: '600' },
    { path: '../../../node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2', weight: '700' },
  ],
  variable: '--font-geist-sans',
  display: 'optional',
  preload: false,
});

const geistMono = localFont({
  src: [
    { path: '../../../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2', weight: '400' },
    { path: '../../../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-600-normal.woff2', weight: '600' },
    { path: '../../../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2', weight: '700' },
  ],
  variable: '--font-geist-mono',
  display: 'optional',
  preload: false,
});

const soloHeading = localFont({
  src: [
    { path: '../../../node_modules/@fontsource/rajdhani/files/rajdhani-latin-300-normal.woff2', weight: '300' },
    { path: '../../../node_modules/@fontsource/rajdhani/files/rajdhani-latin-400-normal.woff2', weight: '400' },
    { path: '../../../node_modules/@fontsource/rajdhani/files/rajdhani-latin-500-normal.woff2', weight: '500' },
    { path: '../../../node_modules/@fontsource/rajdhani/files/rajdhani-latin-600-normal.woff2', weight: '600' },
    { path: '../../../node_modules/@fontsource/rajdhani/files/rajdhani-latin-700-normal.woff2', weight: '700' },
  ],
  variable: '--font-solo-heading',
  display: 'optional',
  preload: false,
});

const eternal = localFont({
  src: '../../../public/fonts/Eternal.ttf',
  variable: '--font-eternal',
  display: 'optional',
});

const codystar = localFont({
  src: [
    { path: '../../../node_modules/@fontsource/codystar/files/codystar-latin-300-normal.woff2', weight: '300' },
    { path: '../../../node_modules/@fontsource/codystar/files/codystar-latin-400-normal.woff2', weight: '400' },
  ],
  variable: '--font-codystar',
  display: 'optional',
  preload: false,
});

const displayFont = localFont({
  src: [
    { path: '../../../node_modules/@fontsource/teko/files/teko-latin-500-normal.woff2', weight: '500' },
    { path: '../../../node_modules/@fontsource/teko/files/teko-latin-600-normal.woff2', weight: '600' },
    { path: '../../../node_modules/@fontsource/teko/files/teko-latin-700-normal.woff2', weight: '700' },
  ],
  variable: '--font-teko',
  display: 'optional',
  preload: false,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t('title'),
      template: `%s | ${t('title')}`,
    },
    description: t('description'),
    keywords: ['portfolio', 'developer', 'full-stack', 'TypeScript', 'Next.js', 'React'],
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(
        routing.locales.map((supportedLocale) => [supportedLocale, `/${supportedLocale}`]),
      ),
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: OPEN_GRAPH_LOCALES[locale] || locale,
      url: `/${locale}`,
      title: t('title'),
      description: t('description'),
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: t('title') }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: [OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: '/images/favicon/Ahjin.svg',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages({ locale });
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: 'Matheus Sobral',
      jobTitle: 'Full-Stack Developer & Cybersecurity Analyst',
      url: SITE_URL,
      sameAs: [
        'https://github.com/SobralCybersec',
        'https://br.linkedin.com/in/matheusdecyber',
      ],
      knowsAbout: ['Cybersecurity', 'Full-Stack Development', 'Java', 'Spring Boot', 'Next.js', 'React', 'AWS', 'Redis'],
    },
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="darkreader-lock" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <link rel="icon" type="image/svg+xml" href="/images/favicon/Ahjin.svg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${soloHeading.variable} ${eternal.variable} ${codystar.variable} ${displayFont.variable} antialiased`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <DynamicFavicon />
            <BackgroundMusic autoPlay />
            <PageTransitionProvider>
              <MatrixBackground />
              {children}
            </PageTransitionProvider>
            {process.env.VERCEL === '1' && <Analytics />}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
