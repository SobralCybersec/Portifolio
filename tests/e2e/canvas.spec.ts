import { expect, test } from '@playwright/test';
import { gotoReady } from '../support/browser';

test('projects canvas renders with usable dimensions', async ({ page }) => {
  await gotoReady(page, '/en/projects');

  const canvas = page.locator('main canvas').last();
  await expect(canvas).toBeAttached();
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  expect(box?.width).toBeGreaterThan(0);
  expect(box?.height).toBeGreaterThan(0);
  await expect(page.locator('main')).toBeVisible();
});
