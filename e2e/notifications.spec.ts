import { expect, test, type Page } from '@playwright/test';

async function signUp(page: Page, fullName: string, start: string) {
  const id = crypto.randomUUID().replaceAll('-', '').slice(0, 12);
  await page.goto(start);
  const status = await page.evaluate(
    async ([fullName, id]) => {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          username: `notify_${id}`,
          email: `notify_${id}@example.com`,
          password: 'SafeReadingPassword9',
          role: 'BOTH',
          interests: ['Drama', 'Fantasy', 'Mystery'],
        }),
      });
      return response.status;
    },
    [fullName, id] as const,
  );
  expect(status).toBe(201);
  return `notify_${id}`;
}

test('a guest is sent to sign in for notifications', async ({ page }) => {
  const response = await page.goto('/notifications');
  expect(response?.url()).toContain('/login');
});

test('following someone tells them, and the page counts it', async ({
  page,
  browser,
}) => {
  const creator = await signUp(page, 'Watched Creator', '/');
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3000',
  });
  const follower = await context.newPage();
  await signUp(follower, 'Eager Follower', '/');
  await follower.goto(`/u/${creator}`);
  await follower
    .getByRole('button', { name: 'Follow Watched Creator' })
    .click();
  await expect(
    follower.getByRole('button', { name: 'Unfollow Watched Creator' }),
  ).toBeVisible();
  await context.close();

  await page.goto('/notifications');
  await expect(page.getByText('New follower')).toBeVisible();
  await expect(
    page.getByText('Eager Follower started following you.'),
  ).toBeVisible();
  await expect(page.getByText('1 unread notification')).toBeVisible();

  await page.getByRole('button', { name: 'Mark all read' }).click();
  await expect(page.getByText('1 unread notification')).toBeHidden();

  await page.getByRole('link', { name: 'Community' }).first().click();
  await page.goto('/notifications?tab=Reading');
  await expect(page.getByText('New follower')).toBeHidden();
});

test('finishing a story records a reading milestone', async ({ page }) => {
  await signUp(page, 'Finishing Reader', '/stories/baobab');
  for (const chapter of [1, 2]) {
    await page.goto(`/stories/baobab/chapters/${chapter}`);
    await page.locator('#paragraph-5').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Save my place' }).click();
    await expect(page.getByRole('status')).toHaveText('Your place is saved.');
  }

  await page.goto('/notifications?tab=Reading');
  await expect(page.getByText('Reading milestone')).toBeVisible();
  await expect(
    page.getByText(/You finished Beneath the Baobab Tree/),
  ).toBeVisible();
});
