import { expect, test } from '@playwright/test';

const viewports = [
  { width: 320, height: 800 },
  { width: 360, height: 800 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 900 },
  { width: 1440, height: 1000 },
] as const;

for (const viewport of viewports) {
  test(`landing layout fits a ${viewport.width}px viewport`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.hero-asset img')).toBeVisible();
    await expect
      .poll(() =>
        page.locator('.hero-asset img').evaluate((image) => {
          const element = image as HTMLImageElement;
          return element.complete && element.naturalWidth > 0;
        }),
      )
      .toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`landing-${viewport.width}.png`),
      fullPage: true,
    });

    const layoutWidth = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(layoutWidth.scrollWidth).toBe(layoutWidth.clientWidth);

    const dots = page.getByRole('button', { name: /Show slide/ });
    await expect(dots).toHaveCount(4);
    for (let index = 0; index < 4; index++) {
      await dots.nth(index).click();
      await expect(dots.nth(index)).toHaveAttribute('aria-current', 'true');
      const width = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(width.scroll).toBe(width.client);
    }
    await dots.first().click();
    await expect(page.locator('.spotlight-image img')).toHaveAttribute(
      'src',
      /creator-chinelo-okoye/,
    );
    await expect(page.locator('.creator-spotlight dl svg')).toHaveCount(3);

    if (viewport.width <= 767) {
      const hero = await page.locator('.official-hero').boundingBox();
      expect(hero).not.toBeNull();
      expect(hero!.height).toBeLessThan(450);
      const art = await page.locator('.hero-asset').boundingBox();
      const copy = await page.locator('.official-hero-copy').boundingBox();
      expect(art).not.toBeNull();
      expect(copy).not.toBeNull();
      expect(
        Math.abs(art!.y + art!.height / 2 - copy!.y - copy!.height / 2),
      ).toBeLessThan(45);
      await expect(page.locator('.reading-goal')).toBeVisible();
      for (const button of await page.locator('.official-actions a').all()) {
        await expect(button).toBeVisible();
        const box = await button.boundingBox();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
      }
      const mobileNavigation = page.getByRole('navigation', {
        name: 'Mobile navigation',
      });
      await expect(mobileNavigation).toBeVisible();
      await expect(mobileNavigation).toHaveCSS('position', 'fixed');
      await expect(mobileNavigation).toHaveCSS('bottom', '0px');
      await expect(page.locator('.official-footer')).toHaveCount(0);
    }

    if (viewport.width <= 390) {
      const cards = page.locator('.continue-card');
      const first = await cards.nth(0).boundingBox();
      const second = await cards.nth(1).boundingBox();

      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      expect(first?.x).toBeGreaterThanOrEqual(0);
      expect(first ? first.x + first.width : Infinity).toBeLessThanOrEqual(
        viewport.width,
      );
      expect(second?.x).toBeLessThan(viewport.width);
    }
    if (viewport.width <= 767) {
      await page.screenshot({
        path: testInfo.outputPath(`top-${viewport.width}.png`),
      });
      await page.getByRole('button', { name: 'Open navigation menu' }).click();
      await expect(
        page.getByRole('navigation', { name: 'Primary navigation' }),
      ).toBeVisible();
      await page.screenshot({
        path: testInfo.outputPath(`menu-${viewport.width}.png`),
      });
      await page.getByRole('button', { name: 'Close navigation menu' }).click();
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const writerButton = page.locator('.official-creator .button');
      await expect(writerButton).toBeInViewport();
      const buttonBox = await writerButton.boundingBox();
      const navBox = await page.locator('.landing-bottom-nav').boundingBox();
      expect(buttonBox!.y + buttonBox!.height).toBeLessThanOrEqual(navBox!.y);
      await page.screenshot({
        path: testInfo.outputPath(`bottom-${viewport.width}.png`),
      });
    }
  });
}
