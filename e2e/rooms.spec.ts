import { expect, test, type Page } from '@playwright/test';

async function signUp(
  page: Page,
  fullName: string,
  start = '/community/rooms',
) {
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

async function openRoom(page: Page, title: string) {
  await page.getByRole('button', { name: 'Start a room' }).click();
  await page.getByLabel('Title', { exact: true }).fill(title);
  await page.getByLabel('One line about it').fill('Stories after dark.');
  await page
    .getByLabel('Description')
    .fill('We read a folktale and talk about what it leaves behind.');
  await page.getByRole('button', { name: 'Open the room' }).click();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
}

test('a host opens a room and it says it is written, not spoken', async ({
  page,
}) => {
  await signUp(page, 'Nia Host');
  const title = `African Folklore After Dark ${Date.now()}`;
  await openRoom(page, title);

  await expect(page.getByText('No microphones here')).toBeVisible();
  await expect(page.getByText('1 person in the room')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'On stage (1)' }),
  ).toBeVisible();
  await expect(page.getByText('You are hosting this room.')).toBeVisible();
});

test('another reader joins the room and both see what was said', async ({
  browser,
}) => {
  const hostContext = await browser.newContext();
  const hostPage = await hostContext.newPage();
  await signUp(hostPage, 'Ama Host');
  const title = `Poetry Lounge ${Date.now()}`;
  await openRoom(hostPage, title);
  const roomUrl = hostPage.url();

  const guestContext = await browser.newContext();
  const guestPage = await guestContext.newPage();
  await signUp(guestPage, 'Kwame Guest');
  await guestPage.goto(roomUrl);

  await guestPage.getByRole('button', { name: `Join ${title}` }).click();
  await expect(guestPage.getByText('2 people in the room')).toBeVisible();

  const said = `The Anansi stories hide wisdom behind laughter ${Date.now()}`;
  await guestPage.getByLabel('Share your thoughts').fill(said);
  await guestPage.getByRole('button', { name: 'Send' }).click();
  await expect(guestPage.getByText(said)).toBeVisible();

  // The host never reloads: the poll is what brings the message in.
  await expect(hostPage.getByText(said)).toBeVisible({ timeout: 20_000 });

  await guestContext.close();
  await hostContext.close();
});

test('a reaction counts once for each person', async ({ page }) => {
  await signUp(page, 'Zainab Reader');
  const title = `World Book Club ${Date.now()}`;
  await openRoom(page, title);

  const heart = page.getByRole('button', { name: /^Love this/ });
  await heart.click();
  await expect(
    page.getByRole('button', { name: 'Love this (1)' }),
  ).toBeVisible();

  // Pressing it again takes the reaction back rather than counting twice.
  await page.getByRole('button', { name: 'Love this (1)' }).click();
  await expect(
    page.getByRole('button', { name: 'Love this (0)' }),
  ).toBeVisible();
});

test('a guest reads a room but is asked to sign in to write in it', async ({
  browser,
}) => {
  const hostContext = await browser.newContext();
  const hostPage = await hostContext.newPage();
  await signUp(hostPage, 'Musa Host');
  const title = `Write and Grow ${Date.now()}`;
  await openRoom(hostPage, title);
  const roomUrl = hostPage.url();
  await hostContext.close();

  const page = await browser.newPage();
  await page.goto(roomUrl);
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
  await expect(page.getByLabel('Share your thoughts')).toBeHidden();
  await expect(page.getByText(/Sign in.*join the room to write/)).toBeVisible();
  await page.close();
});

test('the rooms list shows the open room and the count of people in it', async ({
  page,
}) => {
  await signUp(page, 'Lina Host');
  const title = `Author Hangout ${Date.now()}`;
  await openRoom(page, title);

  await page.goto('/community/rooms');
  const card = page.locator('.room-grid > li').filter({ hasText: title });
  await expect(card).toBeVisible();
  await expect(card).toContainText('1 person');
  await expect(card).toContainText('Hosted by Lina Host');
});
