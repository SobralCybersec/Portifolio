import { shouldRenderVideoPreview } from './project-preview';

test('image extension wins over stale video metadata', () => {
  expect(shouldRenderVideoPreview(true, '/spring-security.png')).toBe(false);
  expect(shouldRenderVideoPreview(true, '/project-preview.webp')).toBe(false);
  expect(shouldRenderVideoPreview(true, '/demo.webm')).toBe(true);
  expect(shouldRenderVideoPreview(false, '/demo.webm')).toBe(false);
});
