import { expect, test, type Page } from '@playwright/test';

async function signUp(page: Page) {
  const id = crypto.randomUUID().replaceAll('-', '').slice(0, 12);
  await page.goto('/stories/baobab');
  const created = await page.evaluate(async (id) => {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Library Reader',
        username: `library_${id}`,
        email: `library_${id}@example.com`,
        password: 'SafeReadingPassword9',
        role: 'READER',
        interests: ['Drama', 'Fantasy', 'Mystery'],
      }),
    });
    return response.status;
  }, id);
  expect(created).toBe(201);
}

test('a guest is asked to sign in before saving a story', async ({ page }) => {
  await page.goto('/stories/baobab');
  await page.getByRole('button', { name: 'Add to Library' }).click();
  await expect(page.locator('.details-action-status')).toHaveText(
    'Sign in to keep this story in your library.',
  );
  await page.goto('/library');
  await expect(
    page.getByText('Sign in to keep a shelf of your own.'),
  ).toBeVisible();
});

test('a reader saves a story, sees it on the shelf and lists it', async ({
  page,
}) => {
  await signUp(page);
  await page.reload();

  await page.getByRole('button', { name: 'Add to Library' }).click();
  await expect(page.locator('.details-action-status')).toHaveText(
    'Saved to your library.',
  );

  await page.goto('/library');
  await page.getByRole('tab', { name: 'Saved' }).click();
  await expect(
    page.getByRole('link', { name: 'Beneath the Baobab Tree', exact: true }),
  ).toBeVisible();

  await page.getByRole('button', { name: /New List/ }).click();
  await page.getByLabel('List name').fill('African Voices');
  await page.getByLabel('Description').fill('Stories that centre our voices.');
  await page.getByRole('button', { name: 'Create list' }).click();
  await expect(page.getByText('African Voices')).toBeVisible();
  await expect(page.getByText('0 stories')).toBeVisible();

  await page.getByRole('button', { name: 'Change goal' }).click();
  await page.getByLabel('Books this year').fill('24');
  await page.getByRole('button', { name: 'Save goal' }).click();
  await expect(page.getByText('of 24 books')).toBeVisible();
});

test('finishing a chapter moves a story from current to completed', async ({
  page,
}) => {
  await signUp(page);
  await page.goto('/stories/baobab/chapters/1');
  await page.locator('#paragraph-5').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Save my place' }).click();
  await expect(page.getByRole('status')).toHaveText('Your place is saved.');

  await page.goto('/library');
  await expect(
    page.getByRole('link', { name: 'Beneath the Baobab Tree', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('50%').first()).toBeVisible();

  await page.goto('/stories/baobab/chapters/2');
  await page.locator('#paragraph-5').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Save my place' }).click();
  await expect(page.getByRole('status')).toHaveText('Your place is saved.');

  await page.goto('/library');
  await expect(
    page.getByRole('link', { name: 'Beneath the Baobab Tree', exact: true }),
  ).toBeHidden();
  await page.getByRole('tab', { name: 'Completed' }).click();
  await expect(
    page.getByRole('link', { name: 'Beneath the Baobab Tree', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('1', { exact: true }).first()).toBeVisible();
});

test('a story can be put into a reading list and taken out again', async ({
  page,
}) => {
  await signUp(page);
  await page.goto('/library');
  await page.getByRole('button', { name: /New List/ }).click();
  await page.getByLabel('List name').fill('Weekend Reading');
  await page.getByRole('button', { name: 'Create list' }).click();
  await expect(page.getByText('Weekend Reading')).toBeVisible();

  await page.goto('/stories/baobab');
  await page.getByRole('button', { name: 'Add to a reading list' }).click();
  await page.getByRole('checkbox', { name: 'Weekend Reading' }).check();
  await expect(page.getByText('Added to Weekend Reading.')).toBeVisible();

  await page.goto('/library');
  await expect(page.getByText('1 story')).toBeVisible();
  await page.getByRole('link', { name: /Weekend Reading/ }).click();
  await expect(
    page.getByRole('link', { name: /Beneath the Baobab Tree/ }),
  ).toBeVisible();

  await page
    .getByRole('button', { name: /Remove Beneath the Baobab Tree/ })
    .click();
  await expect(page.getByText(/Nothing here yet/)).toBeVisible();
});
