import { expect, test } from '@playwright/test';

import {
  expectNoHorizontalOverflow,
  gotoReady,
} from '../support/browser';

test('main navigation reaches projects', async ({ page }) => {
  await gotoReady(page, '/en/about');

  const openMenu = page.getByRole('button', {
    name: 'Open menu',
  });

  if (await openMenu.isVisible()) {
    await openMenu.click();
  }

  const projectsLink = page
    .getByRole('link', {
      name: 'PROJECTS',
      exact: true,
    })
    .first();

  await expect(projectsLink).toBeVisible();

  await projectsLink.click();

  await expect(page).toHaveURL(/\/en\/projects\/?$/);

  const archive = page.locator('#project-archive');

  await expect(archive).toBeVisible();

  await expect(
    archive.getByRole('heading', {
      name: 'Latest Projects',
      exact: true,
    }),
  ).toBeVisible();
});

test.describe('mobile menu', () => {
  test.use({
    viewport: {
      width: 390,
      height: 844,
    },
  });

  test('opens and closes through primary navigation', async ({
    page,
  }) => {
    await gotoReady(page, '/en/about');

    const openMenu = page.getByRole('button', {
      name: 'Open menu',
    });

    await expect(openMenu).toBeVisible();

    await openMenu.click();

    await expect(
      page.getByRole('button', {
        name: 'Close menu',
      }),
    ).toBeVisible();

    const projectsLink = page.getByRole('link', {
      name: 'PROJECTS',
      exact: true,
    });

    await expect(projectsLink).toBeVisible();

    await projectsLink.click();

    await expect(page).toHaveURL(/\/en\/projects\/?$/);

    await expect(
      page.locator('#project-archive'),
    ).toBeVisible();

    await expectNoHorizontalOverflow(page);
  });
});

test('project search filters visible cards', async ({ page }) => {
  await gotoReady(page, '/en/projects');

  const search = page.getByPlaceholder(
    'Search projects...',
  );

  await expect(search).toBeVisible();

  await search.fill('qa-showcase');

  await expect(
    page.getByRole('heading', {
      name: 'qa-showcase',
      exact: true,
    }),
  ).toBeVisible();

  await expect(
    page.getByRole('heading', {
      name: 'api-lab',
      exact: true,
    }),
  ).toHaveCount(0);

  await search.fill('no-such-project');

  await expect(
    page.getByText(
      'No projects found matching your criteria.',
      {
        exact: true,
      },
    ),
  ).toBeVisible();

  await expect(
    page.getByRole('heading', {
      name: 'qa-showcase',
      exact: true,
    }),
  ).toHaveCount(0);
});