import { expect, test } from '@playwright/test';
import { expectNoHorizontalOverflow, gotoReady } from '../support/browser';

const routes = ['/en', '/en/about', '/en/projects', '/en/certifications', '/en/contact'];

for (const route of routes) {
  test(`keeps ${route} inside viewport`, async ({ page }) => {
    await gotoReady(page, route);
    await expectNoHorizontalOverflow(page);

    for (const landmark of [page.locator('nav').first(), page.locator('main')]) {
      const box = await landmark.boundingBox();
      expect(box?.width).toBeGreaterThan(0);
      expect(box?.height).toBeGreaterThan(0);
    }
  });
}
