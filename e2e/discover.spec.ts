import { test, expect } from '@playwright/test';

test(
  'Discover search, categories and story navigation work',
  async ({ page }) => {
    await page.goto('/discover');
    await page.getByLabel('Search stories or authors').fill('salt');
    await expect(page.locator('.discover-story-card')).toHaveCount(1);
    await page
      .getByRole('link', { name: 'Open The Archivist of Salt' })
      .click();
    await expect(page).toHaveURL('/story/archivist');
    await expect(
      page.getByRole('heading', { name: 'The Archivist of Salt' }),
    ).toBeVisible();

    await page.goto('/discover');
    await page
      .getByRole('button', { name: 'African Folktales', exact: true })
      .click();
    await expect(page.locator('.discover-story-card')).toHaveCount(2);
    await page.getByRole('button', { name: 'Sci-Fi', exact: true }).click();
    await expect(page.getByText('No matching previews yet')).toBeVisible();
    await page.getByRole('button', { name: 'Show all previews' }).click();
    await expect(page.locator('.discover-story-card')).toHaveCount(6);
  },
);

for (const width of [320, 390, 768, 1440]) {
  test(`Discover fits ${width}px with themed logo`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/discover');
    await expect(
      page.getByRole('link', { name: 'Readems home' }),
    ).toHaveAttribute('data-tone', 'dark');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
    const cover = page.locator('.discover-cover').first();
    expect((await cover.boundingBox())?.width).toBeGreaterThan(100);
  });
}
