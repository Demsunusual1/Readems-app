import { expect, test } from '@playwright/test';

const viewports = [
  { width: 320, height: 800 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 900 },
  { width: 1440, height: 1000 },
] as const;

for (const viewport of viewports) {
  test(`landing layout fits a ${viewport.width}px viewport`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');

    const layoutWidth = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(layoutWidth.scrollWidth).toBe(layoutWidth.clientWidth);

    if (viewport.width <= 390) {
      const cards = page.locator('.official-story-card');
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
  });
}
