import { expect, test, type Page } from '@playwright/test';

type Role = 'READER' | 'CREATOR';

// Signing up asks for at least three interests, the same as the wizard does.
async function signUp(
  page: Page,
  role: Role,
  interests: string[] = ['Drama', 'Fantasy', 'Mystery'],
) {
  const id = crypto.randomUUID().replaceAll('-', '').slice(0, 12);
  await page.goto('/login');
  const created = await page.evaluate(
    async ({ id, role, interests }) => {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName:
            role === 'CREATOR' ? 'Dashboard Writer' : 'Dashboard Reader',
          username: `dash_${id}`,
          email: `dash_${id}@example.com`,
          password: 'SafeReadingPassword9',
          role,
          interests,
        }),
      });
      return response.status;
    },
    { id, role, interests },
  );
  expect(created).toBe(201);
  return `dash_${id}`;
}

test('a brand-new reader sees honest empty states, not somebody else’s books', async ({
  page,
}) => {
  await signUp(page, 'READER');
  await page.goto('/reader/dashboard');

  await expect(
    page.getByRole('heading', { name: /Welcome back, Dashboard/ }),
  ).toBeVisible();
  await expect(
    page.getByText('No reading streak yet. Read today to start one.'),
  ).toBeVisible();
  await expect(page.getByText('Nothing on the go yet.')).toBeVisible();
  await expect(
    page.getByText('You are not following anyone yet.'),
  ).toBeVisible();

  // The old hard-coded shelf and follower list must be gone for everybody.
  await expect(page.getByText('The Boy Who Painted Silence')).toBeHidden();
  await expect(page.getByText('12.4K followers')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Follow' })).toBeHidden();

  const viewAll = page.locator('.dash-section header a');
  for (const href of await viewAll.evaluateAll((links) =>
    links.map((link) => link.getAttribute('href')),
  ))
    expect(href).not.toBe('#');
});

test('reading a chapter puts that story in Continue Reading with its real percentage', async ({
  page,
}) => {
  await signUp(page, 'READER');

  await page.goto('/stories/baobab/chapters/1');
  await page.locator('#paragraph-5').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Save my place' }).click();
  await expect(page.getByRole('status')).toHaveText('Your place is saved.');

  await page.goto('/reader/dashboard');
  const card = page.locator('.reading-card').first();
  await expect(
    card.getByRole('link', { name: 'Beneath the Baobab Tree' }),
  ).toBeVisible();
  await expect(card.getByText(/\d+% complete/)).toBeVisible();
  await expect(page.getByText('Nothing on the go yet.')).toBeHidden();

  // One day of reading is one day of streak, not fourteen.
  await expect(page.getByText('1 day reading streak')).toBeVisible();
});

test('a creator with no stories sees an empty dashboard, not 245,780 reads', async ({
  page,
}) => {
  await signUp(page, 'CREATOR');
  await page.goto('/creator/dashboard');

  await expect(
    page.getByRole('heading', { name: 'Welcome back, Dashboard Writer' }),
  ).toBeVisible();
  await expect(page.getByText('245,780')).toBeHidden();
  await expect(page.getByText('18,642')).toBeHidden();
  await expect(page.getByText('$4,236.50')).toBeHidden();

  await expect(
    page.getByText('You have not published a story yet.'),
  ).toBeVisible();
  await expect(page.getByText('Nothing in draft.')).toBeVisible();
  await expect(page.getByText('No chapter is scheduled.')).toBeVisible();
  await expect(
    page.getByText('No reads recorded in the last 30 days.'),
  ).toBeVisible();
  await expect(
    page.getByText('No payment provider is configured'),
  ).toBeVisible();
  await expect(
    page.getByText(
      'Readems does not record where a read came from, so there is no source breakdown to show.',
    ),
  ).toBeVisible();
});

test('the landing page invites a signed-out visitor instead of faking progress', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.getByText('1,248 online now')).toBeHidden();
  await expect(page.getByText('Chinelo Okoye')).toBeHidden();
  await expect(page.getByText('Chapter 12 · 24m left')).toBeHidden();
  await expect(page.getByText('23.4K readers')).toBeHidden();
  await expect(
    page.getByRole('heading', { name: /Start reading/ }),
  ).toBeVisible();
});

test('a signed-in reader sees their own shelf on the landing page', async ({
  page,
}) => {
  await signUp(page, 'READER');

  await page.goto('/stories/baobab/chapters/1');
  await page.locator('#paragraph-5').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Save my place' }).click();
  await expect(page.getByRole('status')).toHaveText('Your place is saved.');

  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Welcome back, Dashboard' }),
  ).toBeVisible();
  const shelf = page.locator('.continue-card').first();
  await expect(
    shelf.getByRole('link', { name: 'Beneath the Baobab Tree' }),
  ).toBeVisible();
  await expect(shelf.getByText(/Chapter \d+ · \d+% read/)).toBeVisible();
});
