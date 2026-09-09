import { expect, test, type Page } from '@playwright/test';

// Every page in the app, opened in one go: a route that throws, redirects
// somewhere unexpected or renders Next's error boundary is caught here even
// when no feature test happens to cover it.

async function signUp(page: Page, role: 'READER' | 'CREATOR' | 'BOTH') {
  const id = crypto.randomUUID().replaceAll('-', '').slice(0, 12);
  await page.goto('/login');
  const status = await page.evaluate(
    async ([id, role]) => {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Route Walker',
          username: `route_${id}`,
          email: `route_${id}@example.com`,
          password: 'SafeReadingPassword9',
          role,
          interests: ['Drama', 'Fantasy', 'Mystery'],
        }),
      });
      return response.status;
    },
    [id, role] as const,
  );
  expect(status).toBe(201);
  return `route_${id}`;
}

const guestRoutes = [
  '/',
  '/discover',
  '/categories',
  '/search',
  '/search?q=baobab',
  '/library',
  '/community',
  '/community?tab=Books',
  '/community/rooms',
  '/groups',
  '/groups/poets-collective',
  '/help',
  '/about',
  '/features',
  '/terms',
  '/privacy',
  '/login',
  '/signup',
  '/stories/baobab',
  '/stories/baobab/chapters/1',
  '/u/readems_editorial',
];

const readerRoutes = [
  '/reader/dashboard',
  '/library',
  '/messages',
  '/notifications',
  '/notifications?tab=Reading',
  '/settings',
  '/community',
  '/community/rooms',
];

const creatorRoutes = [
  '/creator/dashboard',
  '/creator/stories',
  '/creator/stories?tab=Drafts',
  '/creator/stories/new',
  '/creator/analytics',
  '/creator/analytics?days=7',
];

async function openAll(page: Page, routes: string[]) {
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status(), `${route} should answer`).toBeLessThan(400);
    await expect(
      page.locator('text=Application error'),
      `${route} should not render an error boundary`,
    ).toHaveCount(0);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  }
}

test('every page a guest can open, opens', async ({ page }) => {
  await openAll(page, guestRoutes);
});

test('every page a signed-in reader can open, opens', async ({ page }) => {
  await signUp(page, 'READER');
  await openAll(page, readerRoutes);
});

test('every page a creator can open, opens', async ({ page }) => {
  await signUp(page, 'CREATOR');
  await openAll(page, creatorRoutes);
});

test('the admin area is shut to everybody else', async ({ page }) => {
  await signUp(page, 'BOTH');
  for (const route of [
    '/admin',
    '/admin/users',
    '/admin/moderation',
    '/admin/deals',
  ]) {
    const response = await page.goto(route);
    const status = response?.status() ?? 0;
    const url = page.url();
    expect(
      status === 404 || url.includes('/login') || url.endsWith('/'),
      `${route} should not open for a reader`,
    ).toBe(true);
  }
});
