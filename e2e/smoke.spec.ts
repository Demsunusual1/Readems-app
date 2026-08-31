import { expect, test } from '@playwright/test';

test('renders the landing page and opens signup', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Where Every Story Finds Its People' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Stories Everyone Is Reading' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Start Reading' }).click();
  await expect(
    page.getByRole('heading', { name: 'Your next chapter starts here.' }),
  ).toBeVisible();
  await page.getByRole('button', { name: /Create my account/ }).click();
  await page.getByLabel('Full name').fill('Kemi Adebayo');
  await page.getByLabel('Username').fill('kemi_reads');
  await page.getByLabel('Email address').fill('kemi@example.com');
  await page.getByLabel('Password', { exact: true }).fill('Short9A');
  await page.getByLabel('Confirm password').fill('Short9A');
  await page.getByRole('button', { name: /Continue/ }).click();
  await expect(
    page
      .locator('.signup-card')
      .getByText('Password must be at least 12 characters.', { exact: true }),
  ).toBeVisible();
});

test('mobile navigation is keyboard accessible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Open navigation menu' });
  await menu.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('link', { name: 'Log In' })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Join Readems' }),
  ).toHaveAttribute('href', '/signup');
});
