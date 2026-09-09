import { expect, test, type Page } from '@playwright/test';

async function signUp(page: Page) {
  const id = crypto.randomUUID().replaceAll('-', '').slice(0, 12);
  await page.goto('/');
  const status = await page.evaluate(async (id) => {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Daniel Settings',
        username: `settings_${id}`,
        email: `settings_${id}@example.com`,
        password: 'SafeReadingPassword9',
        role: 'READER',
        interests: ['Drama', 'Fantasy', 'Mystery'],
      }),
    });
    return response.status;
  }, id);
  expect(status).toBe(201);
  return `settings_${id}`;
}

test('a reader edits their profile and preferences', async ({ page }) => {
  const username = await signUp(page);
  await page.goto('/settings');

  await expect(
    page.getByRole('heading', { name: 'Profile & Settings' }),
  ).toBeVisible();
  await expect(page.getByText(`readems.com/u/${username}`)).toBeVisible();

  await page.getByLabel('Display name').fill('Daniel E. Settings');
  await page.getByLabel('Short bio').fill('Reads at night.');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByText('Profile saved.')).toBeVisible();

  await page.getByLabel('Reading theme').selectOption('dark');
  await page.getByRole('button', { name: 'Save preferences' }).click();
  await expect(page.getByText('Preferences saved.')).toBeVisible();

  // The saved theme is how a chapter opens.
  await page.goto('/stories/baobab/chapters/1');
  await expect(page.locator('.chapter-reader')).toHaveClass(/reader-night/);

  await page.goto(`/u/${username}`);
  await expect(
    page.getByRole('heading', { name: 'Daniel E. Settings' }),
  ).toBeVisible();
});

test('a private profile is hidden from other people', async ({
  page,
  browser,
}) => {
  const username = await signUp(page);
  await page.goto('/settings');
  await page.getByLabel('Show my profile to other readers').uncheck();
  await page.getByRole('button', { name: 'Save preferences' }).click();
  await expect(page.getByText('Preferences saved.')).toBeVisible();

  const stranger = await browser.newContext({
    baseURL: 'http://127.0.0.1:3000',
  });
  const other = await stranger.newPage();
  const response = await other.goto(`/u/${username}`);
  expect(response?.status()).toBe(404);
  await stranger.close();

  // The owner can still see it.
  await page.goto(`/u/${username}`);
  await expect(
    page.getByRole('heading', { name: 'Daniel Settings' }),
  ).toBeVisible();
});

test('a password changes only with the current one, and logout ends the session', async ({
  page,
}) => {
  await signUp(page);
  await page.goto('/settings');

  await page.getByLabel('Current password').fill('WrongPassword9');
  await page.getByLabel('New password').fill('AnotherSafePassword9');
  await page.getByRole('button', { name: 'Change password' }).click();
  await expect(
    page.getByText('That is not your current password.'),
  ).toBeVisible();

  await page.getByLabel('Current password').fill('SafeReadingPassword9');
  await page.getByLabel('New password').fill('AnotherSafePassword9');
  await page.getByRole('button', { name: 'Change password' }).click();
  await expect(page.getByText('Password changed.')).toBeVisible();

  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/\/login/);
  const response = await page.goto('/settings');
  expect(response?.url()).toContain('/login');
});

test('the written pages the app links to exist', async ({ page }) => {
  for (const [path, heading] of [
    ['/help', 'Find answers, and a way to reach us.'],
    ['/about', 'Every voice deserves a reader.'],
    ['/features', 'Everything your story needs.'],
    ['/terms', 'What we agree on.'],
    ['/privacy', 'What we keep, and what we do not.'],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }
});
