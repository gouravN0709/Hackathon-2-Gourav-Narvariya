import { test, expect, loginUser } from './fixtures';

const VIEWPORTS = [
  { width: 320, height: 600, name: '320px (Small Mobile)' },
  { width: 390, height: 844, name: '390px (iPhone)' },
  { width: 820, height: 1180, name: '820px (Tablet rail)' },
  { width: 1024, height: 768, name: '1024px (Small Desktop)' },
  { width: 1440, height: 900, name: '1440px (Design Baseline)' },
  { width: 1920, height: 1080, name: '1920px (Full HD Desktop)' },
];

test.describe('Responsive Viewports & Overflow (320, 390, 820, 1024, 1440, 1920)', () => {
  for (const vp of VIEWPORTS) {
    test(`No horizontal scroll at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await loginUser(page);

      for (const route of ['/dashboard', '/workouts', '/nutrition', '/progress', '/profile']) {
        await page.goto(route);
        // Wait for page transition
        await page.waitForTimeout(300);

        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalScroll, `Horizontal scroll detected on ${route} at ${vp.width}px`).toBe(false);
      }
    });
  }

  test('Navigation swap breakpoint at 820px', async ({ page }) => {
    await loginUser(page);

    // Below 820px: mobile tab bar visible, desktop sidebar hidden
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard');
    await expect(page.getByTestId('mobile-tab-dashboard')).toBeVisible();
    await expect(page.getByTestId('sidebar-nav-dashboard')).not.toBeVisible();

    // At 820px and above: desktop sidebar visible, mobile tab bar hidden
    await page.setViewportSize({ width: 820, height: 1180 });
    await expect(page.getByTestId('sidebar-nav-dashboard')).toBeVisible();
    await expect(page.getByTestId('mobile-tab-dashboard')).not.toBeVisible();
  });
});

