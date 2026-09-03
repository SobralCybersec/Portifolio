import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const articlePath = '/en/blog/2026/09/02/lighthouse-nextjs-performance';
const appOrigin = 'http://127.0.0.1:3000';

function browserErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    const text = message.text();
    const expectedBlockedRequest = text === 'Failed to load resource: net::ERR_FAILED';
    if (!expectedBlockedRequest && (message.type() === 'error' || /hydration/i.test(text))) errors.push(text);
  });
  return errors;
}

async function blockExternalResources(page: Page) {
  await page.route('**/*', (route) => {
    const requestUrl = new URL(route.request().url());
    if (/^https?:$/i.test(requestUrl.protocol) && requestUrl.origin !== appOrigin) {
      return route.abort();
    }
    return route.continue();
  });
}

test('blog index and tag navigation render without browser errors', async ({ page }) => {
  const errors = browserErrors(page);
  await blockExternalResources(page);
  await page.goto('/en/blog');
  await expect(page.getByRole('heading', { name: 'Field Notes' })).toBeVisible();
  const articleLink = page.locator('a.blog-article-row').filter({ hasText: 'How I got 100 on Lighthouse' });
  await expect(articleLink).toBeVisible();
  await articleLink.click();
  await expect(page).toHaveURL(/\/en\/blog\/2026\/09\/02\/lighthouse-nextjs-performance$/);
  await page.goto('/en/blog/tags');
  await page.getByRole('link', { name: /Next\.js/i }).click();
  await expect(page).toHaveURL(/\/en\/blog\/tags\/nextjs$/);
  await expect(page.getByRole('heading', { name: 'Next.js' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('article renders semantic heading, chronology, and no hydration errors', async ({ page }) => {
  const errors = browserErrors(page);
  await blockExternalResources(page);
  await page.goto(articlePath);
  await expect(page.locator('article')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('How I got 100 on Lighthouse');
  await expect(page.locator('.blog-post-date svg')).toHaveCount(1);
  await expect(page.locator('.blog-post-tags .blog-post-category')).toHaveCount(3);
  await expect(page.locator('.blog-post-meta-row .blog-post-category')).toHaveCount(0);
  await expect(page.locator('.blog-post-route')).toHaveCount(0);
  await expect(page.locator('.blog-toc__item.is-active')).toContainText('The result');
  await page.locator('#what-changed').evaluate((element) => {
    window.scrollTo({ top: element.offsetTop - window.innerHeight / 2, behavior: 'instant' });
  });
  await expect(page.locator('.blog-toc__item.is-active')).toContainText('What changed');
  await expect(page.getByRole('heading', { name: 'The result' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Article chronology' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('missing article returns 404', async ({ request }) => {
  const response = await request.get('/en/blog/2026/09/02/does-not-exist');
  expect(response.status()).toBe(404);
});
