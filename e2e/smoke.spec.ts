import { expect, test } from '@playwright/test';

test('opens signup and validates account details', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /Stories That/i }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Start your story' }).click();
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
