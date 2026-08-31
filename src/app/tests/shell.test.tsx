import React from 'react';
import { render, screen } from '@testing-library/react';
import RootLayout from '../layout';
import RootPage from '../page';
import LocaleLayout, { generateMetadata, generateStaticParams } from '../[locale]/layout';
import { generateMetadata as generateAboutMetadata } from '../[locale]/about/layout';
import { generateMetadata as generateProjectsMetadata } from '../[locale]/projects/layout';
import { generateMetadata as generateCertificationsMetadata } from '../[locale]/certifications/layout';
import { generateMetadata as generateContactMetadata } from '../[locale]/contact/layout';
import { generateMetadata as generateChatMetadata } from '../[locale]/chat/layout';
import sitemap from '../sitemap';
import robots from '../robots';
import LocaleNotFound from '../[locale]/not-found';
import CatchAllNotFound from '../[locale]/[...not-found]/page';
import ChatPage from '../[locale]/chat/page';
import { GET as authGet, POST as authPost } from '../api/auth/[...nextauth]/route';
import requestConfig from '@/i18n/request';
import { routing } from '@/i18n/config/routing';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  notFound: jest.fn(() => { throw new Error('not found'); }),
  usePathname: () => '/en',
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));
jest.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
  useTranslations: () => (key: string) => key,
}));
jest.mock('next-intl/server', () => ({
  getMessages: jest.fn(async () => ({ hello: 'world' })),
  getTranslations: jest.fn(async () => (key: string) => key),
  setRequestLocale: jest.fn(),
  getRequestConfig: (callback: unknown) => callback,
}));
jest.mock('next-intl/routing', () => ({
  defineRouting: (value: unknown) => value,
  createNavigation: () => ({ Link: () => null, redirect: jest.fn(), usePathname: jest.fn(), useRouter: jest.fn() }),
}));
jest.mock('@/lib/auth/auth', () => ({ auth: jest.fn().mockResolvedValue({ user: { id: 'u1' } }), handlers: { GET: 'GET_HANDLER', POST: 'POST_HANDLER' } }));
jest.mock('@/components/layout/ThemeProvider', () => {
  function ThemeProviderMock({ children }: { children: React.ReactNode }) { return children; }
  return { ThemeProvider: ThemeProviderMock };
});
jest.mock('@/components/layout/DynamicFavicon', () => {
  function DynamicFaviconMock() { return null; }
  return DynamicFaviconMock;
});
jest.mock('@/components/media/BackgroundMusic', () => {
  function BackgroundMusicMock() { return null; }
  return { BackgroundMusic: BackgroundMusicMock };
});
jest.mock('@/components/layout/Navigation', () => {
  function NavigationMock() { return <nav />; }
  return NavigationMock;
});
jest.mock('@/components/chat/ChatEffects', () => {
  function ChatEffectsMock() { return <div />; }
  return ChatEffectsMock;
});
jest.mock('@/components/runtime/ClientOnlyComponents', () => {
  function HexagonGridMock() { return <div />; }
  function ClientChatRoomMock() { return <div>chat-room</div>; }
  return { HexagonGrid: HexagonGridMock, ClientChatRoom: ClientChatRoomMock };
});
jest.mock('@vercel/analytics/react', () => ({ Analytics: () => null }));
jest.mock('next-auth/react', () => {
  function SessionProviderMock({ children }: { children: React.ReactNode }) { return children; }
  return { SessionProvider: SessionProviderMock };
});

const notFound = jest.requireMock('next/navigation').notFound as jest.Mock;

test('covers root redirects, shell pages, and auth route exports', async () => {
  RootPage();
  expect((await RootLayout({ children: <span>root</span> }))).toEqual(<span>root</span>);
  expect(authGet).toBe('GET_HANDLER');
  expect(authPost).toBe('POST_HANDLER');
  expect(generateStaticParams()).toHaveLength(routing.locales.length);
  const rootMetadata = await generateMetadata({ params: Promise.resolve({ locale: 'en' }) });
  expect(rootMetadata).toEqual(expect.objectContaining({
    title: expect.objectContaining({ default: expect.any(String), template: expect.stringContaining('%s') }),
  }));
  const layout = await LocaleLayout({ children: <span>child</span>, params: Promise.resolve({ locale: 'en' }) });
  expect(layout).toBeDefined();
  expect(LocaleNotFound()).toBeDefined();
  expect(() => CatchAllNotFound()).toThrow('not found');
  await expect(ChatPage()).resolves.toBeDefined();
});

test('generates page metadata, sitemap, and robots directives', async () => {
  const pageMetadata = await Promise.all([
    generateAboutMetadata({ params: Promise.resolve({ locale: 'pt' }) }),
    generateProjectsMetadata({ params: Promise.resolve({ locale: 'pt' }) }),
    generateCertificationsMetadata({ params: Promise.resolve({ locale: 'pt' }) }),
    generateContactMetadata({ params: Promise.resolve({ locale: 'pt' }) }),
    generateChatMetadata({ params: Promise.resolve({ locale: 'pt' }) }),
  ]);

  expect(pageMetadata.map((metadata) => metadata.alternates?.canonical)).toEqual([
    '/pt/about',
    '/pt/projects',
    '/pt/certifications',
    '/pt/contact',
    '/pt/chat',
  ]);
  expect(pageMetadata[0].openGraph).toEqual(expect.objectContaining({
    type: 'website',
    siteName: expect.any(String),
    locale: 'pt_BR',
    images: expect.any(Array),
  }));
  expect(sitemap()).toHaveLength(42);
  expect(robots()).toEqual(expect.objectContaining({
    sitemap: expect.stringContaining('/sitemap.xml'),
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
  }));
});

test('uses default locale for invalid request locale and preserves valid locale', async () => {
  const config = requestConfig as unknown as (args: { requestLocale: Promise<string | undefined> }) => Promise<{ locale: string; messages: unknown }>;
  expect((await config({ requestLocale: Promise.resolve('pt') })).locale).toBe('pt');
  expect((await config({ requestLocale: Promise.resolve('invalid') })).locale).toBe('en');
  expect((await config({ requestLocale: Promise.resolve(undefined) })).locale).toBe('en');
});

test('throws not-found for invalid locale layout', async () => {
  await expect(LocaleLayout({ children: <span />, params: Promise.resolve({ locale: 'invalid' }) })).rejects.toThrow('not found');
  expect(notFound).toHaveBeenCalled();
});
