import { expect, test, type Page } from '@playwright/test';

async function signUp(page: Page, fullName: string, start = '/community') {
  const id = crypto.randomUUID().replaceAll('-', '').slice(0, 12);
  await page.goto(start);
  const status = await page.evaluate(
    async ([fullName, id]) => {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          username: `member_${id}`,
          email: `member_${id}@example.com`,
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
  await page.reload();
}

test('a member posts to the community and others can reply', async ({
  page,
}) => {
  await signUp(page, 'Nia Poster');
  const body = `Reading beneath a baobab tonight ${Date.now()}`;

  const composer = page.locator('.community-feed-column .composer');
  await composer.getByLabel('Share a thought').fill(body);
  await composer.getByRole('button', { name: 'Post' }).click();

  const post = page.locator('.feed-list > li').filter({ hasText: body });
  await expect(post).toBeVisible();

  await post.getByRole('button', { name: /Like Nia Poster’s post/ }).click();
  await expect(
    post.getByRole('button', { name: /Remove your like/ }),
  ).toContainText('1');

  await post
    .getByRole('button', { name: 'Replies to Nia Poster’s post' })
    .click();
  await page
    .getByRole('textbox', { name: 'Reply to Nia Poster' })
    .fill('A good night for it.');
  await page.getByRole('button', { name: 'Send reply to Nia Poster' }).click();
  await expect(page.getByText('A good night for it.')).toBeVisible();

  await post.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText(body)).toBeHidden();
});

test('a guest reads the community but is asked to sign in to post', async ({
  page,
}) => {
  await page.goto('/community');
  await expect(
    page.getByRole('heading', { name: /The world reads/ }),
  ).toBeVisible();
  await expect(page.getByLabel('Share a thought')).toBeHidden();
  await expect(page.getByText(/Sign in.*to post, reply/)).toBeVisible();
});

test('a member joins a group and posts in it', async ({ page }) => {
  await signUp(page, 'Kwame Group', '/groups');

  await page.getByRole('link', { name: /Poets Collective/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Poets Collective' }),
  ).toBeVisible();
  await expect(page.getByText('Join the group to post in it.')).toBeVisible();

  await page.getByRole('button', { name: 'Join Poets Collective' }).click();
  const body = `A line I could not stop repeating ${Date.now()}`;
  const groupComposer = page.locator('.composer');
  await groupComposer.getByLabel('Share a thought').fill(body);
  await groupComposer.getByRole('button', { name: 'Post' }).click();
  await expect(page.getByText(body)).toBeVisible();

  // Group posts stay in the group.
  await page.goto('/community');
  await expect(page.getByText(body)).toBeHidden();
});

test('a member starts a group and it opens on its own page', async ({
  page,
}) => {
  await signUp(page, 'Zara Founder', '/groups');
  const name = `Night Readers ${Date.now()}`;

  await page.getByRole('button', { name: /Create a Group/ }).click();
  await page.getByLabel('Name', { exact: true }).fill(name);
  await page.getByLabel('One line about it').fill('We read after dark.');
  await page
    .getByLabel('Description')
    .fill('Late-night reading and the conversations that follow.');
  await page.getByRole('button', { name: 'Create group' }).click();

  await expect(page.getByRole('heading', { name })).toBeVisible();
  await expect(
    page.getByRole('button', { name: `Leave ${name}` }),
  ).toBeVisible();
});
