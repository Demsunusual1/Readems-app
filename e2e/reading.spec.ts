import { expect, test } from '@playwright/test';
test('reader preferences, chapters and account-only save prompt work', async ({
  page,
}) => {
  await page.goto('/stories/baobab');
  await page.getByRole('link', { name: 'Start Reading', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Roots of Our Past' }),
  ).toBeVisible();
  await page.getByLabel('Text size').selectOption('24');
  await expect(page.locator('.reader-text')).toHaveCSS('font-size', '24px');
  await page.getByRole('button', { name: 'Dark theme' }).click();
  await expect(page.locator('.chapter-reader')).toHaveClass(/reader-night/);
  await page.getByRole('button', { name: 'Save my place' }).click();
  await expect(
    page.getByRole('link', { name: 'Log in to save' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Next chapter' }).click();
  await expect(
    page.getByRole('heading', { name: 'The House Beyond the Path' }),
  ).toBeVisible();
});
test('reading progress persists and is isolated by authenticated account', async ({
  page,
  browser,
}) => {
  await page.goto('/stories/baobab/chapters/1');
  const origin = new URL(page.url()).origin;
  const id = crypto.randomUUID().replaceAll('-', '').slice(0, 12);
  const signup = await page.request.post('/api/signup', {
    data: {
      fullName: 'Reading Test',
      username: `reader_${id}`,
      email: `reader_${id}@example.com`,
      password: 'SafeReadingPassword9',
      role: 'READER',
      interests: ['Drama', 'Fantasy', 'Mystery'],
    },
  });
  expect(signup.status()).toBe(201);
  const badOrigin = await page.request.post('/api/reading-progress', {
    headers: { Origin: 'https://example.com' },
    data: { storyId: 'baobab', chapter: 1, paragraph: 0, completed: false },
  });
  expect(badOrigin.status()).toBe(403);
  const invalid = await page.request.post('/api/reading-progress', {
    headers: { Origin: origin },
    data: { storyId: 'baobab', chapter: 1, paragraph: 999, completed: false },
  });
  expect(invalid.status()).toBe(400);
  await page.getByRole('button', { name: 'Mark chapter complete' }).click();
  await expect(page.getByRole('status')).toHaveText(
    'Chapter marked complete. Progress saved to your account.',
  );
  await page.goto('/stories/baobab');
  await expect(
    page.getByRole('link', { name: 'Resume reading' }),
  ).toHaveAttribute('href', '/stories/baobab/chapters/1#paragraph-5');
  const second = await browser.newContext({ baseURL: origin });
  const other = await second.request.post('/api/signup', {
    data: {
      fullName: 'Other Reader',
      username: `other_${id}`,
      email: `other_${id}@example.com`,
      password: 'SafeReadingPassword9',
      role: 'READER',
      interests: ['Drama', 'Fantasy', 'Mystery'],
    },
  });
  expect(other.status()).toBe(201);
  expect(
    await (
      await second.request.get('/api/reading-progress?storyId=baobab')
    ).json(),
  ).toEqual({ progress: null });
  await second.close();
});
for (const width of [320, 390, 768, 1440]) {
  test(`reading screens fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/stories/baobab', '/stories/baobab/chapters/1']) {
      await page.goto(route);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBe(width);
    }
    if (width === 390) {
      await page.goto('/stories/baobab');
      await page.screenshot({
        path: 'test-results/story-details-390.png',
        fullPage: true,
      });
    }
  });
}
test('unknown chapters return not found', async ({ page }) => {
  const response = await page.goto('/stories/baobab/chapters/99');
  expect(response?.status()).toBe(404);
});
