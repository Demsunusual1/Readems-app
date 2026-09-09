import { expect, test } from '@playwright/test';

test('search finds a story, a creator and a group', async ({ page }) => {
  await page.goto('/search');
  await expect(page.getByText('Type at least two letters')).toBeVisible();

  await page.getByLabel(/Search stories, creators/).fill('baobab');
  await page.getByRole('button', { name: 'Search' }).click();

  await expect(page.getByRole('heading', { name: 'Top result' })).toBeVisible();
  await expect(page.locator('.search-top')).toContainText(
    'Beneath the Baobab Tree',
  );
  await expect(
    page.getByRole('heading', { name: 'Stories', exact: true }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'Creators' }).click();
  await expect(page.getByRole('heading', { name: 'Stories' })).toBeHidden();

  await page.goto('/search?q=poets');
  await expect(page.getByRole('heading', { name: 'Groups' })).toBeVisible();
  await expect(page.locator('.search-groups')).toContainText(
    'Poets Collective',
  );
});

test('search says plainly when nothing matches', async ({ page }) => {
  await page.goto('/search?q=qzzxwlkj');
  await expect(page.getByText(/Nothing matches/)).toBeVisible();
});

test('recent searches are remembered on the device', async ({ page }) => {
  await page.goto('/search?q=baobab');
  // The term is recorded once the page has hydrated, so wait for it before
  // searching again.
  await expect(page.locator('.recent-searches')).toContainText('baobab');
  await page.goto('/search?q=poets');
  await expect(
    page.getByRole('heading', { name: 'Recent searches' }),
  ).toBeVisible();
  await expect(page.locator('.recent-searches')).toContainText('baobab');
  // The current term is written to the device before the list settles.
  await expect(page.locator('.recent-searches')).toContainText('poets');

  await page.getByRole('button', { name: 'Clear all' }).click();
  await expect(page.locator('.recent-searches')).toBeHidden();
});
