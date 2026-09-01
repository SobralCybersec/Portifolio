import { expect, test } from '@playwright/test';

import {
  collectRuntimeErrors,
  expectNoHorizontalOverflow,
  gotoReady,
} from '../support/browser';

const routes = [
  '/en',
  '/en/about',
  '/en/projects',
  '/en/certifications',
  '/en/contact',
  '/en/chat',
] as const;

for (const route of routes) {
  test(`loads ${route} without runtime errors`, async ({
    page,
  }) => {
    const runtime = collectRuntimeErrors(page);

    await gotoReady(page, route);

    await expect(
      page.locator('nav').first(),
    ).toBeVisible();

    await expect(
      page.locator('main'),
    ).toBeVisible();

    await expectNoHorizontalOverflow(page);

    expect(
      runtime.consoleErrors,
      `Console errors on ${route}:\n${runtime.consoleErrors.join('\n')}`,
    ).toEqual([]);

    expect(
      runtime.pageErrors,
      `Page errors on ${route}:\n${runtime.pageErrors.join('\n')}`,
    ).toEqual([]);
  });
}