import { expect, test } from '@playwright/test';

import {
  expectNoHorizontalOverflow,
  gotoReady,
} from '../support/browser';

const routes = [
  '/en',
  '/en/about',
  '/en/projects',
  '/en/certifications',
  '/en/contact',
] as const;

for (const route of routes) {
  test(`keeps ${route} inside viewport`, async ({ page }) => {
    await gotoReady(page, route);

    await expectNoHorizontalOverflow(page);

    const landmarks = [
      page.locator('nav').first(),
      page.locator('main'),
    ];

    for (const [index, landmark] of landmarks.entries()) {
      await expect(landmark).toBeAttached();
      await expect(landmark).toBeVisible();

      await expect
        .poll(
          () =>
            landmark.evaluate((element) => {
              const rect = element.getBoundingClientRect();

              return rect.width > 0 && rect.height > 0;
            }),
          {
            message: `${route} landmark ${index} should settle with usable dimensions`,
          },
        )
        .toBe(true);

      const dimensions = await landmark.evaluate((element) => {
        const rect = element.getBoundingClientRect();

        return {
          width: rect.width,
          height: rect.height,
        };
      });

      expect(dimensions.width, `${route} landmark ${index} width`).toBeGreaterThan(0);
      expect(dimensions.height, `${route} landmark ${index} height`).toBeGreaterThan(0);
    }
  });
}
