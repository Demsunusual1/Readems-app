import { expect, test } from '@playwright/test';

test('a reader can complete signup from the landing page', async ({ page }) => {
  const uniqueId = Date.now().toString();

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
  await page.getByLabel('Username').fill(`kemi_${uniqueId}`);
  await page.getByLabel('Email address').fill(`kemi_${uniqueId}@example.com`);
  await page.getByLabel('Create password').fill('LongEnough9A');
  await page.getByLabel('Confirm password').fill('LongEnough9A');
  await page
    .getByRole('checkbox', { name: /I agree to the Terms of Service/ })
    .check();
  await page.getByRole('button', { name: /Continue/ }).click();

  await expect(
    page.getByRole('heading', { name: 'How will you use Readems?' }),
  ).toBeVisible();
  await page.getByRole('button', { name: /^Reader/ }).click();
  await page.getByRole('button', { name: /Continue/ }).click();

  await expect(
    page.getByRole('heading', { name: 'What stories move you?' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Romance', exact: true }).click();
  await page.getByRole('button', { name: 'Fantasy', exact: true }).click();
  await page.getByRole('button', { name: 'Mystery', exact: true }).click();
  await page.getByRole('button', { name: /Continue/ }).click();

  await expect(
    page.getByRole('heading', { name: 'Set up your profile' }),
  ).toBeVisible();
  await page.getByRole('button', { name: /Finish signup/ }).click();

  await expect(
    page.getByRole('heading', { name: 'Welcome to Readems, Kemi!' }),
  ).toBeVisible();
  await page.getByRole('button', { name: /Go to my dashboard/ }).click();
  await expect(page).toHaveURL('/reader/dashboard');
  await expect(
    page.getByRole('heading', { name: /Good morning, Kemi!/ }),
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
