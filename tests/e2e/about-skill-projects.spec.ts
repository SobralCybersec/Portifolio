import { expect, test } from '@playwright/test';

import { gotoReady } from '../support/browser';

test('clicking an about skill reveals matching projects', async ({ page }) => {
  await gotoReady(page, '/en/about', { reducedMotion: true });

  const expertise = page.locator('section[aria-labelledby="expertise-title"]');
  const reposResponse = page.waitForResponse((response) => (
    response.url().endsWith('/api/github/repos') && response.ok()
  ));
  await expertise.scrollIntoViewIfNeeded();
  await reposResponse;
  await page.waitForTimeout(250);

  const skill = page.getByRole('button', {
    name: 'React',
    exact: true,
  });
  await expect(skill).toBeVisible();
  await skill.click({ force: true });

  const rail = page.getByTestId('skill-projects-rail');
  await expect(rail).toBeVisible();
  await expect(rail).toContainText('qa-showcase');
  await expect(skill).toHaveAttribute('aria-pressed', 'true');
});
