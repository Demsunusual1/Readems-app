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
      expect(hero!.height).toBeLessThanOrEqual(194);
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
      await expect(
        page.getByRole('navigation', { name: 'Landing shortcuts' }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: 'Search stories' }),
      ).toBeVisible();

      const cards = page.locator('.continue-card');
      const firstCard = await cards.first().boundingBox();
      const secondCard = await cards.nth(1).boundingBox();
      expect(firstCard).not.toBeNull();
      expect(secondCard).not.toBeNull();
      expect(firstCard!.width).toBeGreaterThanOrEqual(92);
      expect(secondCard!.x).toBeLessThan(viewport.width);

      const continueTrack = page.locator('.continue-row');
      const continueMetrics = await continueTrack.evaluate((element) => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      }));
      expect(continueMetrics.scrollWidth).toBeGreaterThan(
        continueMetrics.clientWidth,
      );
      await continueTrack.evaluate((element) => {
        element.scrollLeft = element.scrollWidth;
      });
      await expect(page.locator('.discover-card')).toBeInViewport();

      await expect(page.locator('.community-online-dot')).toBeVisible();
      await expect(page.locator('.community-online-dot')).toHaveCSS(
        'background-color',
        'rgb(32, 184, 106)',
      );

      const featured = page.locator('.featured-card');
      const secondFeature = await featured.nth(1).boundingBox();
      const thirdFeature = await featured.nth(2).boundingBox();
      expect(secondFeature).not.toBeNull();
      expect(thirdFeature).not.toBeNull();
      expect(secondFeature!.x + secondFeature!.width).toBeLessThanOrEqual(
        viewport.width + 2,
      );
      expect(thirdFeature!.x).toBeLessThan(viewport.width);

      for (const activity of await page
        .locator('.activity-row article')
        .all()) {
        const box = await activity.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
      }

      const navItems = page.locator('.landing-bottom-nav > a');
      await expect(navItems).toHaveCount(5);
      await expect(page.locator('.landing-bottom-nav svg')).toHaveCount(5);
      await page.screenshot({
        path: testInfo.outputPath(`top-${viewport.width}.png`),
      });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const writerButton = page.locator('.official-creator .button');
      await expect(writerButton).toBeInViewport();
      const buttonBox = await writerButton.boundingBox();
      const navBox = await page.locator('.landing-bottom-nav').boundingBox();
      expect(buttonBox!.y + buttonBox!.height).toBeLessThanOrEqual(navBox!.y);
      await page.screenshot({
        path: testInfo.outputPath(`bottom-${viewport.width}.png`),
      });
    } else {
      await expect(
        page.getByRole('navigation', { name: 'Primary navigation' }),
      ).toBeVisible();
    }
  });
}
