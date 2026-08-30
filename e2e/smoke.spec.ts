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
  await page.getByRole('button', { name: /Continue/ }).click();
  await expect(page.getByRole('alert')).toContainText(
    'Complete every account field',
  );
});
