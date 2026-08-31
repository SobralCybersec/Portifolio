import { expect, test } from '@playwright/test';
import { collectRuntimeErrors, expectNoHorizontalOverflow, gotoReady } from '../support/browser';

const routes = ['/en', '/en/about', '/en/projects', '/en/certifications', '/en/contact', '/en/chat'];

for (const route of routes) {
  test(`loads ${route} without runtime errors`, async ({ page }) => {
    const runtime = collectRuntimeErrors(page);
    await gotoReady(page, route);

    await expect(page.locator('nav').first()).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expectNoHorizontalOverflow(page);
    expect(runtime.consoleErrors).toEqual([]);
    expect(runtime.pageErrors).toEqual([]);
  });
}
