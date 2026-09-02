import { expect, test, type Page } from '@playwright/test';

async function createReader(page: Page) {
  const uniqueId = crypto.randomUUID().replaceAll('-', '').slice(0, 12);
  await page.goto('/signup');
  await page.getByLabel('Full name').fill('Reader Test');
  await page.getByLabel('Username').fill(`reader_${uniqueId}`);
  await page.getByLabel('Email address').fill(`reader_${uniqueId}@example.com`);
  await page.getByLabel('Create password').fill('LongEnough9A');
  await page.getByLabel('Confirm password').fill('LongEnough9A');
  await page
    .getByRole('checkbox', { name: /I agree to the Terms of Service/ })
    .check();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page
    .getByRole('button', {
      name: /Reader.*Discover stories and build your library/,
    })
    .click();
  await page.getByRole('button', { name: /Continue/ }).click();
  await page.getByRole('button', { name: 'Romance', exact: true }).click();
  await page.getByRole('button', { name: 'Fantasy', exact: true }).click();
  await page.getByRole('button', { name: 'Mystery', exact: true }).click();
  await page.getByRole('button', { name: /Continue/ }).click();
  await page.getByRole('button', { name: /Finish signup/ }).click();
  await page.getByRole('button', { name: /Go to my dashboard/ }).click();
}

test('story details, chapters and navigation work for guests', async ({ page }) => {
  await page.goto('/story/baobab');
  await expect(
    page.getByRole('heading', { name: 'Beneath the Baobab Tree' }),
  ).toBeVisible();
  await page.getByRole('link', { name: /Start reading/ }).click();
  await expect(page).toHaveURL('/story/baobab/chapter/1');
  await expect(
    page.getByRole('heading', { name: 'The Story the Tree Kept' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Next chapter →' }).click();
  await expect(page).toHaveURL('/story/baobab/chapter/2');
  await page.getByRole('link', { name: '← Previous chapter' }).click();
  await expect(page).toHaveURL('/story/baobab/chapter/1');
});

test('signed-in readers save progress and library state', async ({ page }) => {
  await createReader(page);
  await page.goto('/story/baobab');
  await page.getByRole('button', { name: 'Save to library' }).click();
  await expect(
    page.getByRole('button', { name: 'Saved to library' }),
  ).toBeVisible();

  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/reading-progress') &&
        response.request().method() === 'POST' &&
        response.ok(),
    ),
    page.getByRole('link', { name: /Start reading/ }).click(),
  ]);
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/reading-progress') && response.ok(),
    ),
    page.getByRole('link', { name: 'Next chapter →' }).click(),
  ]);
  await page.goto('/story/baobab');
  await expect(
    page.getByRole('link', { name: /Continue reading/ }),
  ).toHaveAttribute('href', '/story/baobab/chapter/2');
  await expect(
    page.getByRole('button', { name: 'Saved to library' }),
  ).toBeVisible();
});
