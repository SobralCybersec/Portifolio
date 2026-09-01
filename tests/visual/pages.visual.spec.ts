import { expect, test } from '@playwright/test';
import { gotoReady, maskedVisualOptions, prepareFullPageVisual, stabilizeVisualLayers } from '../support/browser';

test('homepage desktop visual regression', async ({ page }) => {
  await gotoReady(page, '/en');
  await stabilizeVisualLayers(page);
  await expect(page).toHaveScreenshot('homepage-desktop.png', {
    ...maskedVisualOptions(page),
  });
});

test.describe('mobile visual regression', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('homepage mobile visual regression', async ({ page }) => {
    await gotoReady(page, '/en');
    await stabilizeVisualLayers(page);
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      ...maskedVisualOptions(page),
    });
  });
});

for (const [name, route] of [
  ['about', '/en/about'],
  ['projects', '/en/projects'],
  ['certifications', '/en/certifications'],
  ['contact', '/en/contact'],
] as const) {
  test(`${name} desktop visual regression`, async ({ page }) => {
    await gotoReady(page, route);
    await stabilizeVisualLayers(page);
    await prepareFullPageVisual(page);
    const options = maskedVisualOptions(page);
    await expect(page).toHaveScreenshot(`${name}-desktop.png`, {
      ...options,
      fullPage: true,
      ...(name === 'projects' ? { maxDiffPixels: 100 } : {}),
    });
  });
}

test('navigation region visual regression', async ({ page }) => {
  await gotoReady(page, '/en/about');
  await stabilizeVisualLayers(page);
  await expect(page.getByRole('navigation')).toHaveScreenshot('navigation.png', {
    animations: 'disabled',
  });
});

test('project card region visual regression', async ({ page }) => {
  await gotoReady(page, '/en/projects');
  await stabilizeVisualLayers(page);
  const card = page.getByRole('button', { name: 'README: qa-showcase' }).locator('xpath=ancestor::article[1]');
  await expect(card).toBeVisible();
  await expect(card).toHaveScreenshot('project-card.png', {
    animations: 'disabled',
    // The icon's antialiasing varies by capture pass; keep tolerance below
    // one visual glyph instead of masking the component region.
    maxDiffPixels: 20,
  });
});
