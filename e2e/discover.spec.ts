import { expect, test } from '@playwright/test';

test('official Discover categories screen is complete and interactive', async ({
  page,
}) => {
  await page.goto('/discover');
  await expect(
    page.getByRole('heading', { name: 'Find your next world' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Browse by Genre' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Regional Folktales' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Find Your Mood' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Trending Categories' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Thoughtful' }).click();
  await expect(
    page.getByRole('button', { name: 'Thoughtful' }),
  ).toHaveAttribute('aria-pressed', 'true');
});

for (const width of [320, 390, 768, 1440]) {
  test(`Discover fits ${width}px and matches official structure`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/discover');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
    await expect(
      page.getByRole('navigation', { name: 'Primary navigation' }),
    ).toBeVisible();
    await page.screenshot({
      path: `test-results/discover-${width}.png`,
      fullPage: true,
    });
  });
}

test('categories alias opens the same official screen', async ({ page }) => {
  await page.goto('/categories');
  await expect(
    page.getByRole('heading', { name: 'Find your next world' }),
  ).toBeVisible();
});
