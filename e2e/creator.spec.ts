import { expect, test, type Page } from '@playwright/test';

async function signUpCreator(page: Page) {
  const id = crypto.randomUUID().replaceAll('-', '').slice(0, 12);
  await page.goto('/');
  const status = await page.evaluate(async (id) => {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Tunde Writes',
        username: `writer_${id}`,
        email: `writer_${id}@example.com`,
        password: 'SafeReadingPassword9',
        role: 'CREATOR',
        interests: ['Drama', 'Fantasy', 'Mystery'],
      }),
    });
    return response.status;
  }, id);
  expect(status).toBe(201);
  return `writer_${id}`;
}

test('a writer creates a story, writes a chapter and publishes it', async ({
  page,
}) => {
  const username = await signUpCreator(page);
  const title = `Echoes in the Market ${Date.now()}`;

  await page.goto('/creator/stories');
  await expect(page.getByText(/No drafts|Nothing published yet/)).toBeVisible();

  await page.getByRole('link', { name: /Create New Story/ }).click();
  await page.getByLabel('Title').fill(title);
  await page
    .getByLabel('Synopsis')
    .fill('In a city of dreams, a boy’s choice changes everything.');
  await page.getByLabel('Genre').selectOption('Drama');
  await page.getByRole('button', { name: 'Create story' }).click();

  await expect(page.getByRole('heading', { name: title })).toBeVisible();
  await expect(page.getByText('Only you can see this story')).toBeVisible();

  await page.getByLabel('New chapter title').fill('Crossroads');
  await page.getByRole('button', { name: 'Add chapter' }).click();

  await expect(page.getByLabel('Chapter title')).toHaveValue('Crossroads');
  await page
    .getByLabel('Chapter', { exact: true })
    .fill('The market woke before the city did.\n\nAmina counted her coins.');
  await expect(page.getByRole('status')).toContainText('Saved just now');
  await expect(page.getByText('11 words')).toBeVisible();

  await page.getByRole('button', { name: 'Publish chapter' }).click();
  await expect(page.getByRole('status')).toContainText('Published');

  // A reader can now open it.
  await page.goto('/creator/stories');
  await page.getByRole('link', { name: new RegExp(title) }).click();
  await page.getByRole('link', { name: 'View as a reader' }).click();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
  await expect(page.getByText('1 chapter')).toBeVisible();

  await page.goto(`/u/${username}`);
  await expect(
    page.getByRole('link', { name: new RegExp(title) }),
  ).toBeVisible();
});

test('a draft stays out of the catalogue until it is published', async ({
  page,
}) => {
  await signUpCreator(page);
  const title = `Fragments of Us ${Date.now()}`;

  await page.goto('/creator/stories/new');
  await page.getByLabel('Title').fill(title);
  await page.getByLabel('Synopsis').fill('Pieces of the past.');
  await page.getByRole('button', { name: 'Create story' }).click();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();

  const slug = new URL(page.url()).pathname.split('/').pop();
  const response = await page.goto(`/stories/${slug}`);
  expect(response?.status()).toBe(404);
});

test('analytics reports only what has been measured', async ({ page }) => {
  await signUpCreator(page);
  await page.goto('/creator/analytics');
  await expect(
    page.getByRole('heading', { name: 'Your stories. Their connection.' }),
  ).toBeVisible();
  await expect(
    page.getByText('Nothing published yet, so there is nothing to measure.'),
  ).toBeVisible();
  await expect(page.getByText(/no payment provider configured/)).toBeVisible();
  await expect(
    page.getByText(/does not track where a reader came from/),
  ).toBeVisible();
});
