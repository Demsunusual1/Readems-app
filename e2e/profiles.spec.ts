import { expect, test, type Page } from '@playwright/test';

async function signUp(page: Page) {
  const id = crypto.randomUUID().replaceAll('-', '').slice(0, 12);
  await page.goto('/u/readems_editorial');
  const status = await page.evaluate(async (id) => {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Follower Person',
        username: `follower_${id}`,
        email: `follower_${id}@example.com`,
        password: 'SafeReadingPassword9',
        role: 'READER',
        interests: ['Drama', 'Fantasy', 'Mystery'],
      }),
    });
    return response.status;
  }, id);
  expect(status).toBe(201);
  return `follower_${id}`;
}

test('a story links to the profile of the person who wrote it', async ({
  page,
}) => {
  await page.goto('/stories/baobab');
  await page
    .getByRole('link', { name: 'Readems Editorial', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Readems Editorial' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /Beneath the Baobab Tree/ }),
  ).toBeVisible();
});

test('a reader follows a creator and the count moves', async ({ page }) => {
  // Follow somebody made for this test: the shared editorial account is a
  // moving target while other tests are running.
  const creator = await signUp(page);
  await signUp(page);
  await page.goto(`/u/${creator}`);

  const follow = page.getByRole('button', { name: 'Follow Follower Person' });
  const followers = page.locator('.profile-stats div').first();
  const before = Number((await followers.locator('dt').innerText()).trim());

  await follow.click();
  await expect(
    page.getByRole('button', { name: 'Unfollow Follower Person' }),
  ).toBeVisible();

  await page.reload();
  await expect(followers.locator('dt')).toHaveText(String(before + 1));
  await page.getByRole('button', { name: 'Unfollow Follower Person' }).click();
  await expect(
    page.getByRole('button', { name: 'Follow Follower Person' }),
  ).toBeVisible();
  await page.reload();
  await expect(followers.locator('dt')).toHaveText(String(before));
});

test('a guest is asked to sign in before following', async ({ page }) => {
  await page.goto('/u/readems_editorial');
  await page.getByRole('button', { name: 'Follow Readems Editorial' }).click();
  await expect(page.getByRole('status')).toHaveText(
    'Sign in to follow people.',
  );
});

test('an unknown profile is not found', async ({ page }) => {
  const response = await page.goto('/u/nobody-by-that-name');
  expect(response?.status()).toBe(404);
});
