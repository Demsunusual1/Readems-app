import { expect, test } from '@playwright/test';

test('renders the foundation landing page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Readems' })).toBeVisible();
});
