import { expect, test } from '@playwright/test';
import { expectNoHorizontalOverflow, gotoReady } from '../support/browser';

test('main navigation reaches projects', async ({ page }) => {
  await gotoReady(page, '/en/about');
  const openMenu = page.getByRole('button', { name: 'Open menu' });
  if (await openMenu.isVisible()) await openMenu.click();
  await page.getByRole('link', { name: 'PROJECTS', exact: true }).first().click();
  await expect(page).toHaveURL(/\/en\/projects$/);
  await expect(page.locator('#project-archive').getByRole('heading', { name: 'Latest Projects' })).toBeVisible();
});

test.describe('mobile menu', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('opens and closes through primary navigation', async ({ page }) => {
    await gotoReady(page, '/en/about');
    const openMenu = page.getByRole('button', { name: 'Open menu' });
    await expect(openMenu).toBeVisible();
    await openMenu.click();
    await expect(page.getByRole('button', { name: 'Close menu' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'PROJECTS', exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'PROJECTS', exact: true }).click();
    await expect(page).toHaveURL(/\/en\/projects$/);
    await expectNoHorizontalOverflow(page);
  });
});

test('project search filters visible cards', async ({ page }) => {
  await gotoReady(page, '/en/projects');
  const search = page.getByPlaceholder('Search projects...');
  await search.fill('qa-showcase');
  await expect(page.getByRole('heading', { name: 'qa-showcase' })).toBeVisible();
  await search.fill('no-such-project');
  await expect(page.getByText('No projects found matching your criteria.')).toBeVisible();
});
