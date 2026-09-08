import { expect, test, type Page } from '@playwright/test';

async function signUp(page: Page, name: string) {
  const id = crypto.randomUUID().replaceAll('-', '').slice(0, 12);
  await page.goto('/stories/baobab/chapters/1');
  const status = await page.evaluate(
    async ([name, id]) => {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: name,
          username: `commenter_${id}`,
          email: `commenter_${id}@example.com`,
          password: 'SafeReadingPassword9',
          role: 'READER',
          interests: ['Drama', 'Fantasy', 'Mystery'],
        }),
      });
      return response.status;
    },
    [name, id] as const,
  );
  expect(status).toBe(201);
  await page.reload();
}

test('a reader comments on a chapter, likes it and deletes it', async ({
  page,
}) => {
  await signUp(page, 'Kemi Comment');
  const body = `The baobab is a character of its own ${Date.now()}`;

  await page.getByLabel('Add a comment').fill(body);
  await page.getByRole('button', { name: 'Post comment' }).click();

  const comment = page.locator('.comment-list > li').filter({ hasText: body });
  await expect(comment).toBeVisible();

  await comment
    .getByRole('button', { name: /^Like Kemi Comment’s comment$/ })
    .click();
  await expect(
    comment.getByRole('button', { name: /Remove your like/ }),
  ).toContainText('1');

  await comment.getByRole('button', { name: 'Reply' }).click();
  await page.getByLabel('Reply to Kemi Comment').fill('Completely agree.');
  await page
    .locator('.comment-replies')
    .getByRole('button', { name: 'Post comment' })
    .click();
  await expect(page.getByText('Completely agree.')).toBeVisible();

  await comment.getByRole('button', { name: 'Delete' }).first().click();
  await expect(page.getByText(body)).toBeHidden();
});

test('a guest reads comments but is asked to sign in to add one', async ({
  page,
}) => {
  await page.goto('/stories/baobab/chapters/1');
  await expect(page.getByLabel('Add a comment')).toBeHidden();
  await expect(
    page.getByRole('link', { name: 'Sign in' }).last(),
  ).toBeVisible();
});
