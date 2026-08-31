import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { gotoReady } from '../support/browser';

const routes = ['/en', '/en/about', '/en/projects', '/en/certifications', '/en/contact'];

for (const route of routes) {
  test(`${route} has no critical or serious axe violations`, async ({ page }) => {
    await gotoReady(page, route);
    const results = await new AxeBuilder({ page }).analyze();
    const severe = results.violations.filter((violation) =>
      violation.impact === 'critical' || violation.impact === 'serious',
    );
    expect(severe, JSON.stringify(severe, null, 2)).toEqual([]);
  });
}
