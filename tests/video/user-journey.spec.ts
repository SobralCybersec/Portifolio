import { expect, test } from '@playwright/test';
import {
  collectRuntimeErrors,
  expectNoHorizontalOverflow,
  gotoReady,
} from '../support/browser';

const navigationJourney = [
  { label: 'ABOUT', path: '/en/about' },
  { label: 'PROJECTS', path: '/en/projects' },
  { label: 'CERTIFICATIONS', path: '/en/certifications' },
  { label: 'CONTACT', path: '/en/contact' },
] as const;

const ENTRY_SETTLE_MS = 2200;

async function waitForPageEntry(page: import('@playwright/test').Page) {
  await expect(page.locator('.portfolio-transition')).toHaveCount(0, { timeout: 10_000 });
  await page.evaluate(async () => {
    await document.fonts?.ready;
    const finiteAnimations = document.getAnimations().filter((animation) => {
      const iterations = animation.effect?.getComputedTiming().iterations;
      return iterations !== Infinity;
    });
    await Promise.all(finiteAnimations.map((animation) => animation.finished.catch(() => undefined)));
  });
  // Keep final animation frame visible in recording instead of cutting directly
  // to the next interaction.
  await page.waitForTimeout(ENTRY_SETTLE_MS);
}

async function hoverElement(
  page: import('@playwright/test').Page,
  locator: import('@playwright/test').Locator,
) {
  if (await locator.count() === 0) return;
  await locator.first().scrollIntoViewIfNeeded();
  await locator.first().hover();
  await page.waitForTimeout(450);
}

async function scrollThroughPage(page: import('@playwright/test').Page) {
  for (let step = 0; step < 12; step += 1) {
    const position = await page.evaluate(() => ({
      current: window.scrollY,
      maximum: document.documentElement.scrollHeight - window.innerHeight,
    }));

    if (position.maximum <= position.current) break;

    await page.mouse.wheel(0, Math.min(620, position.maximum - position.current));
    // Pause gives encoder a visible frame for each user-like scroll segment.
    await page.waitForTimeout(300);

    const nextPosition = await page.evaluate(() => window.scrollY);

    // Browsers clamp wheel input at the document end; that is a valid final
    // state, not a failed interaction.
    if (nextPosition <= position.current) break;
  }

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
}

test('records navigation and scrolling through primary pages', async ({ page }) => {
  test.setTimeout(120_000);
  const runtime = collectRuntimeErrors(page);

  await gotoReady(page, '/en');
  await waitForPageEntry(page);
  await hoverElement(page, page.locator('nav').first());
  await hoverElement(page, page.locator('.hero-image-frame'));
  await hoverElement(page, page.locator('.hero-highlights .hero-highlight-item'));
  await hoverElement(page, page.locator('.hero-stats-grid .hero-stat-card'));
  await hoverElement(page, page.getByRole('link', { name: /View Projects/i }));
  await hoverElement(page, page.locator('.hero-cta-row a'));
  await scrollThroughPage(page);

  for (const destination of navigationJourney) {
    const navigationLink = page.getByRole('link', { name: destination.label, exact: true }).first();
    await navigationLink.hover();
    await page.waitForTimeout(350);
    await navigationLink.click();
    await expect(page).toHaveURL(new RegExp(`${destination.path}$`));
    await expect(page.locator('main')).toBeVisible();
    await waitForPageEntry(page);
    await hoverElement(page, page.locator('nav').first());

    if (destination.path === '/en/about') {
      await hoverElement(page, page.locator('main header').first());
      await hoverElement(page, page.getByRole('region', { name: /story/i }).first());
    }

    if (destination.path === '/en/projects') {
      const search = page.getByPlaceholder('Search projects...');
      await hoverElement(page, search);
      await hoverElement(page, page.locator('main article').first());
      await search.fill('qa-showcase');
      await page.waitForTimeout(500);
      const readmeButton = page.getByRole('button', { name: 'README: qa-showcase' });
      await hoverElement(page, readmeButton);
      await readmeButton.click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.waitForTimeout(700);
      await page.getByRole('button', { name: 'Close README' }).click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await search.fill('');
    }

    if (destination.path === '/en/certifications') {
      const filter = page.locator('.cert-controls').getByRole('button').first();
      await hoverElement(page, filter);
      await filter.click();
      await page.getByRole('button', { name: 'AWS', exact: true }).click();
      const certificate = page.locator('.certification-grid').getByRole('button').first();
      await hoverElement(page, certificate);
      await certificate.click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.waitForTimeout(700);
      await page.getByRole('button', { name: /close/i }).click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
    }

    if (destination.path === '/en/contact') {
      await hoverElement(page, page.getByRole('form').first());
      await page.getByLabel('IDENTITY').fill('QA Visitor');
      await page.getByLabel('EMAIL').fill('qa@example.com');
      await page.getByLabel('PROJECT BRIEF').fill('Interactive video journey review');
      await page.getByRole('button', { name: /OPEN MAIL CHANNEL/i }).hover();
      await page.waitForTimeout(600);
    }

    await scrollThroughPage(page);
    await expectNoHorizontalOverflow(page);
  }

  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.pageErrors).toEqual([]);
});
