import { expect, test, type Page } from '@playwright/test';

async function signUp(page: Page, fullName: string, start = '/messages') {
  const id = crypto.randomUUID().replaceAll('-', '').slice(0, 12);
  await page.goto(start);
  const status = await page.evaluate(
    async ([fullName, id]) => {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          username: `talker_${id}`,
          email: `talker_${id}@example.com`,
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
  return `talker_${id}`;
}

test('a guest is sent to sign in for messages', async ({ page }) => {
  const response = await page.goto('/messages');
  expect(response?.url()).toContain('/login');
});

test('two readers start a conversation, and the unread badge clears on reading it', async ({
  page,
  browser,
}) => {
  const writerName = `Nia Writes ${Date.now()}`;
  const writerUsername = await signUp(page, writerName);
  await page.goto('/messages');
  await expect(page.getByRole('heading', { name: 'Messages' })).toBeVisible();
  await expect(
    page.getByText('No conversations yet. Search for somebody above'),
  ).toBeVisible();

  // The other reader finds the writer by username and writes to them.
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3000',
  });
  const reader = await context.newPage();
  const readerName = 'Kwame Reads';
  await signUp(reader, readerName);
  await reader.goto('/messages');

  await reader.getByLabel('Search messages or people').fill(writerUsername);
  await reader.getByRole('button', { name: 'Search' }).click();
  await reader.getByRole('button', { name: `Message ${writerName}` }).click();

  await expect(
    reader.getByRole('heading', { name: `Conversation with ${writerName}` }),
  ).toBeVisible();
  await expect(
    reader.getByRole('link', { name: `@${writerUsername}` }),
  ).toBeVisible();

  const body = `Loved your latest chapter ${Date.now()}`;
  await reader.getByLabel(`Message ${writerName}`).fill(body);
  await reader
    .getByRole('button', { name: `Send message to ${writerName}` })
    .click();
  await expect(reader.getByText(body)).toBeVisible();

  // The writer sees the message waiting, counted as unread.
  await page.goto('/messages');
  const conversation = page.locator('.messages-list > li').filter({
    hasText: readerName,
  });
  await expect(conversation).toBeVisible();
  await expect(conversation.getByText(body)).toBeVisible();
  await expect(conversation.locator('.messages-badge')).toHaveText(/1/);

  // Opening it reads it, and the badge is gone when they come back.
  await conversation.getByRole('link').click();
  await expect(page.getByText(body)).toBeVisible();
  await page.goto('/messages');
  await expect(
    page.locator('.messages-list > li').filter({ hasText: readerName }),
  ).toBeVisible();
  await expect(page.locator('.messages-badge')).toHaveCount(0);

  // A reply reaches the reader in the same thread.
  const answer = `Thank you for reading ${Date.now()}`;
  await page
    .locator('.messages-list > li')
    .filter({ hasText: readerName })
    .getByRole('link')
    .click();
  await page.getByLabel(`Message ${readerName}`).fill(answer);
  await page
    .getByRole('button', { name: `Send message to ${readerName}` })
    .click();
  await expect(page.getByText(answer)).toBeVisible();

  await reader.goto('/messages');
  await expect(reader.getByText(answer)).toBeVisible();
  await context.close();
});

test('searching the inbox narrows it to the conversation asked for', async ({
  page,
  browser,
}) => {
  const meName = `Isabella Searches ${Date.now()}`;
  await signUp(page, meName);

  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3000',
  });
  const other = await context.newPage();
  const otherName = `Jules Moreau ${Date.now()}`;
  const otherUsername = await signUp(other, otherName);
  await context.close();

  await page.goto('/messages');
  await page.getByLabel('Search messages or people').fill(otherUsername);
  await page.getByRole('button', { name: 'Search' }).click();
  await page.getByRole('button', { name: `Message ${otherName}` }).click();
  await page.getByLabel(`Message ${otherName}`).fill('A first word.');
  await page
    .getByRole('button', { name: `Send message to ${otherName}` })
    .click();
  await expect(page.getByText('A first word.')).toBeVisible();

  await page.goto('/messages');
  await expect(page.getByText(otherName)).toBeVisible();
  await page
    .getByLabel('Search messages or people')
    .fill('nobody by that name');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByText(/No conversations match/)).toBeVisible();
});
