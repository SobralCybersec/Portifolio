import { expect, test } from '@playwright/test';

import { gotoReady } from '../support/browser';

test('projects archive renders its controls and project card', async ({
  page,
}) => {
  await gotoReady(page, '/en/projects');

  const archive = page.locator('#project-archive');

  await expect(archive).toBeVisible();
  await expect(
    archive.getByRole('heading', { name: 'Latest Projects', exact: true }),
  ).toBeVisible();
  await expect(
    archive.getByPlaceholder('Search projects...'),
  ).toBeVisible();
  await expect(
    archive.getByRole('heading', { name: 'qa-showcase', exact: true }),
  ).toBeVisible();
});
