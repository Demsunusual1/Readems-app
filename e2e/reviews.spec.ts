import { expect, test, type Page } from '@playwright/test';

async function signUp(page: Page, prefix: string) {
  const id = crypto.randomUUID().replaceAll('-', '').slice(0, 12);
  await page.goto('/stories/baobab');
  const status = await page.evaluate(
    async ([prefix, id]) => {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Amara Review',
          username: `${prefix}_${id}`,
          email: `${prefix}_${id}@example.com`,
          password: 'SafeReadingPassword9',
          role: 'READER',
          interests: ['Drama', 'Fantasy', 'Mystery'],
        }),
      });
      return response.status;
    },
    [prefix, id] as const,
  );
  expect(status).toBe(201);
  await page.reload();
}

test('a reader rates a story and the rating shows on the page', async ({
  page,
}) => {
  await signUp(page, 'review');

  await page.getByRole('button', { name: 'Write a review' }).click();
  await page.getByRole('radio', { name: '4 stars' }).check();
  await page
    .getByLabel('Your review')
    .fill('The characters stayed with me for days.');
  await page.getByRole('button', { name: 'Post review' }).click();

  const mine = page
    .locator('.review-list li')
    .filter({ hasText: 'Your review' });
  await expect(mine).toContainText('The characters stayed with me for days.');
  await expect(mine.locator('.review-stars')).toHaveAttribute(
    'aria-label',
    '4 out of 5 stars',
  );

  await page.reload();
  await expect(
    page.locator('.review-list li').filter({ hasText: 'Your review' }),
  ).toContainText('The characters stayed with me for days.');
});

test('a like counts once and can be taken back', async ({ page }) => {
  await signUp(page, 'liker');

  const like = page.getByRole('button', { name: 'Like this story' });
  const before = Number((await like.innerText()).trim());
  await like.click();

  const liked = page.getByRole('button', { name: 'Remove your like' });
  await expect(liked).toContainText(String(before + 1));
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Remove your like' }),
  ).toContainText(String(before + 1));

  await page.getByRole('button', { name: 'Remove your like' }).click();
  await expect(
    page.getByRole('button', { name: 'Like this story' }),
  ).toContainText(String(before));
});

test('a guest is told to sign in rather than shown a review form', async ({
  page,
}) => {
  await page.goto('/stories/baobab');
  await expect(
    page.getByRole('button', { name: 'Write a review' }),
  ).toBeHidden();
  await page.getByRole('button', { name: 'Like this story' }).click();
  await expect(page.locator('.details-action-status')).toHaveText(
    'Sign in to like this story.',
  );
});
