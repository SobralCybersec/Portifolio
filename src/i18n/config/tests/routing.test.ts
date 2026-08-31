jest.unmock('@/i18n/config/routing');
jest.mock('next-intl/routing', () => ({ defineRouting: (value: unknown) => value }));
jest.mock('next-intl/navigation', () => ({
  createNavigation: () => ({ Link: jest.fn(), redirect: jest.fn(), usePathname: jest.fn(), useRouter: jest.fn() }),
}));

import { Link, redirect, routing, usePathname, useRouter } from '@/i18n/config/routing';

test('loads locale routing and exports navigation helpers', () => {
  expect(routing.locales).toEqual(['en', 'es', 'pt', 'fr', 'de', 'ja', 'zh']);
  expect(routing.defaultLocale).toBe('en');
  expect(Link).toBeDefined();
  expect(redirect).toBeDefined();
  expect(usePathname).toBeDefined();
  expect(useRouter).toBeDefined();
});
