import { expect, test, type Page } from '@playwright/test';

// The first admin is made by the environment: an address listed in
// READEMS_ADMIN_EMAILS becomes SUPER_ADMIN when it signs in. The server reads
// that variable at start-up, so the tests below need it set on the process
// that launches the app:
//
//   READEMS_ADMIN_EMAILS=admin@example.com npx playwright test e2e/admin.spec.ts
//
// With no dev server already running, Playwright starts one as a child of the
// test process and it inherits the variable. Without it there is no way to
// make an admin from a browser, so those tests skip rather than pretend.
const adminEmail = process.env.READEMS_ADMIN_EMAILS?.split(',')[0]?.trim();
const password = 'SafeReadingPassword9';

async function signUp(
  page: Page,
  overrides: { email?: string; role?: 'READER' | 'CREATOR' } = {},
) {
  const id = crypto.randomUUID().replaceAll('-', '').slice(0, 12);
  const email = overrides.email ?? `reader_${id}@example.com`;
  await page.goto('/');
  const status = await page.evaluate(
    async (account) => {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Adaeze Test',
          username: account.username,
          email: account.email,
          password: account.password,
          role: account.role,
          interests: ['Drama', 'Fantasy', 'Mystery'],
        }),
      });
      return response.status;
    },
    {
      username: `person_${id}`,
      email,
      password,
      role: overrides.role ?? 'READER',
    },
  );
  // The admin address is signed up once and signed in afterwards.
  expect([201, 409]).toContain(status);
  return { email, username: `person_${id}` };
}

async function signIn(page: Page, email: string) {
  await page.goto('/');
  const status = await page.evaluate(
    async (account) => {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account),
      });
      return response.status;
    },
    { email, password },
  );
  expect(status).toBe(200);
}

async function becomeAdmin(page: Page) {
  await signUp(page, { email: adminEmail });
  await signIn(page, adminEmail!);
}

async function reportFirstStory(page: Page) {
  await page.goto('/discover');
  await page.locator('a[href^="/stories/"]').first().click();
  await page.waitForURL(/\/stories\//);
  const url = page.url();
  const title = await page.getByRole('heading', { level: 1 }).innerText();

  await page.getByRole('button', { name: 'Report this story' }).click();
  await page.getByLabel('What is wrong with this?').selectOption('Spam');
  await page.getByRole('button', { name: 'Send report' }).click();
  // The story page has its own status line for saved progress, so look
  // inside the report control.
  await expect(page.locator('.report-panel [role="status"]')).toContainText(
    'A moderator will look at this',
  );
  return { url, title };
}

test('a reader cannot reach the admin area', async ({ page }) => {
  await signUp(page);
  for (const path of [
    '/admin',
    '/admin/users',
    '/admin/moderation',
    '/admin/deals',
  ]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
  }
  await expect(page.getByRole('heading', { name: /Welcome back/ })).toHaveCount(
    0,
  );
});

test.describe('with an admin account', () => {
  test.skip(
    !adminEmail,
    'Set READEMS_ADMIN_EMAILS on the process that starts the app to run these.',
  );

  test('a report filed from a story page reaches the moderation queue', async ({
    page,
  }) => {
    await signUp(page);
    const story = await reportFirstStory(page);

    await becomeAdmin(page);
    await page.goto('/admin/moderation');
    await expect(
      page.getByRole('heading', { name: 'Moderation' }),
    ).toBeVisible();

    const card = page.locator('.admin-report', { hasText: story.title });
    await expect(card.first()).toBeVisible();
    await expect(card.first()).toContainText('Spam');
  });

  test('restricting reported content hides it from readers', async ({
    page,
  }) => {
    await signUp(page);
    const story = await reportFirstStory(page);

    await becomeAdmin(page);
    await page.goto('/admin/moderation');
    const card = page
      .locator('.admin-report', { hasText: story.title })
      .first();
    await card.getByRole('button', { name: 'Restrict' }).click();
    // A resolved report leaves the open queue and turns up under Restricted.
    await expect(
      page.locator('.admin-report', { hasText: story.title }),
    ).toHaveCount(0);
    await page.goto('/admin/moderation?status=RESTRICTED');
    await expect(
      page.locator('.admin-report', { hasText: story.title }).first(),
    ).toBeVisible();

    // A reader can no longer open it, and it is gone from Discover.
    await signUp(page);
    const response = await page.goto(story.url);
    expect(response?.status()).toBe(404);
    await page.goto('/discover');
    await expect(page.getByRole('link', { name: story.title })).toHaveCount(0);
  });

  test('the overview reports what it does not measure', async ({ page }) => {
    await becomeAdmin(page);
    await page.goto('/admin');
    await expect(
      page.getByRole('heading', { name: /Welcome back/ }),
    ).toBeVisible();
    await expect(page.getByText(/Answered SELECT 1 in/)).toBeVisible();
    await expect(page.getByText('Platform revenue').first()).toBeVisible();
    await expect(page.getByText('Not measured').first()).toBeVisible();
  });
});

// Restricting a comment is covered by the database test in
// src/lib/admin.db.test.ts ("restricts a comment so readers stop seeing it"):
// the report control was added to the story page only, so a browser has no way
// to file a report against a comment yet.
