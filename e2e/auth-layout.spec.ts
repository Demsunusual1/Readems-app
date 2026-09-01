import { expect, test } from '@playwright/test';

for (const width of [320, 390, 768, 1440]) {
  for (const route of ['login', 'signup']) {
    test(`${route} fits ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${route}`);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.getByLabel('Email address')).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Continue with Google' }),
      ).toBeDisabled();
      const sizes = await page.evaluate(() => ({
        actual: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth,
      }));
      expect(sizes.actual).toBe(sizes.viewport);
      await page.screenshot({
        path: testInfo.outputPath(`${route}-${width}.png`),
        fullPage: true,
      });
    });
  }
}

test('signup checks password rules before personalization and preserves creator intent', async ({
  page,
}) => {
  await page.goto('/signup?role=creator');
  await page.getByLabel('Full name').fill('Ada Okoye');
  await page.getByLabel('Username').fill('ada_okoye');
  await page.getByLabel('Email address').fill('ada@example.com');
  await page
    .getByLabel('Create password', { exact: true })
    .fill('onlylowercasepassword');
  await page.getByLabel('Confirm password').fill('onlylowercasepassword');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.locator('.signup-card').getByRole('alert')).toContainText(
    'uppercase',
  );
  await page
    .getByLabel('Create password', { exact: true })
    .fill('StrongPassword9');
  await page.getByLabel('Confirm password').fill('StrongPassword9');
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await expect(
    page.getByRole('button', { name: /Creator.*Publish stories/ }),
  ).toHaveAttribute('aria-pressed', 'true');
});
