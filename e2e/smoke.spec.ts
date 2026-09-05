import { expect, test } from '@playwright/test';

test('a reader can complete signup from the landing page', async ({ page }) => {
  const uniqueId = crypto.randomUUID().replaceAll('-', '').slice(0, 12);

  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Stories that stay with you' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Featured Serial' }),
  ).toBeVisible();
  await expect(page.locator('.testimonial')).toHaveCount(0);
  await expect(page.locator('.official-footer')).toHaveCount(0);
  await page.getByRole('link', { name: 'Start Reading' }).click();
  await expect(
    page.getByRole('heading', { name: 'Create your Readems account' }),
  ).toBeVisible();
  await page.getByLabel('Full name').fill('Kemi Adebayo');
  await page.getByLabel('Username').fill(`kemi_${uniqueId}`);
  await page.getByLabel('Email address').fill(`kemi_${uniqueId}@example.com`);
  await page.getByLabel('Create password').fill('LongEnough9A');
  await page.getByLabel('Confirm password').fill('LongEnough9A');
  await page
    .getByRole('checkbox', { name: /I agree to the Terms of Service/ })
    .check();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();

  await expect(
    page.getByRole('heading', { name: 'Welcome to Readems' }),
  ).toBeVisible();
  await page
    .getByRole('button', {
      name: /Reader.*Discover stories/,
    })
    .click();
  await page.getByRole('button', { name: /Continue/ }).click();

  await expect(
    page.getByRole('heading', { name: 'What stories move you?' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Romance', exact: true }).click();
  await page.getByRole('button', { name: 'Fantasy', exact: true }).click();
  await page.getByRole('button', { name: 'Mystery', exact: true }).click();
  await page.getByRole('button', { name: /Continue/ }).click();

  await expect(
    page.getByRole('heading', { name: 'Create Your Reader Profile' }),
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
  await page.context().clearCookies();
  await page.goto('/login');
  await page.getByLabel('Email address').fill(`kemi_${uniqueId}@example.com`);
  await page.getByLabel('Password', { exact: true }).fill('LongEnough9A');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL('/reader/dashboard');
});

test('mobile navigation is keyboard accessible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const shortcuts = page.getByRole('navigation', {
    name: 'Landing shortcuts',
  });
  const search = shortcuts.getByRole('link', { name: 'Search stories' });
  await search.focus();
  await expect(search).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/discover');

  await page.goBack();
  const notifications = page.getByRole('link', { name: 'Notifications' });
  await notifications.focus();
  await expect(notifications).toBeFocused();
  await expect(notifications).toHaveAttribute('href', '/login');
});
