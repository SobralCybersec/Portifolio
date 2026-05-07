import '../globals.css';
import { Inter, JetBrains_Mono, Rajdhani, Codystar } from 'next/font/google';
import localFont from 'next/font/local';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ThemeProvider } from '@/components/ThemeProvider';
import DynamicFavicon from '@/components/DynamicFavicon';
import { BackgroundMusic } from '@/components/BackgroundMusic';

const geistSans = Inter({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = JetBrains_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const soloHeading = Rajdhani({
  variable: '--font-solo-heading',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const eternal = localFont({
  src: '../../../public/fonts/Eternal.ttf',
  variable: '--font-eternal',
  display: 'swap',
});

const codystar = Codystar({
  variable: '--font-codystar',
  subsets: ['latin'],
  weight: ['300', '400'],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  return {
    title: 'Matheus Sobral - Creative Technologist',
    description: 'Portfolio of a creative technologist specializing in full-stack development, architecture, and modern web technologies.',
    keywords: ['portfolio', 'developer', 'full-stack', 'TypeScript', 'Next.js', 'React'],
    icons: {
      icon: '/images/favicon/Ahjin.svg',
    },
    other: {
      'darkreader': 'NO-DARKREADER-PLUGIN',
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
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${soloHeading.variable} ${eternal.variable} ${codystar.variable} antialiased`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <DynamicFavicon />
            <BackgroundMusic autoPlay />
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
