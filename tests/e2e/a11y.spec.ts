import { test, expect, loginUser } from './fixtures';
import AxeBuilder from '@axe-core/playwright';

const ROUTES = [
  { path: '/login', name: 'Login' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/workouts', name: 'Workouts Planner' },
  { path: '/workouts/details', name: 'Workout Details' },
  { path: '/workouts/active', name: 'Active Workout' },
  { path: '/nutrition', name: 'Nutrition' },
  { path: '/nutrition/add', name: 'Food Search' },
  { path: '/coach', name: 'Coach' },
  { path: '/progress', name: 'Progress' },
  { path: '/profile', name: 'Profile' },
];

test.describe('Accessibility (A11Y) - Axe Core', () => {
  for (const r of ROUTES) {
    test(`Zero critical/serious a11y violations on ${r.name} (${r.path})`, async ({ page }) => {
      if (r.path !== '/login') {
        await loginUser(page);
      }
      await page.goto(r.path);
      await page.waitForTimeout(500);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const seriousOrCritical = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      );

      if (seriousOrCritical.length > 0) {
        console.warn(
          `A11y violations on ${r.path}:`,
          seriousOrCritical.map((v) => ({ id: v.id, impact: v.impact, description: v.description })),
        );
      }

      expect(seriousOrCritical, `Found ${seriousOrCritical.length} serious/critical a11y violations on ${r.path}`).toEqual([]);
    });
  }

  test('Zero critical/serious a11y violations in Feedback Modal', async ({ page }) => {
    await loginUser(page);
    await page.goto('/profile');
    await page.getByRole('button', { name: 'Report a problem / Request a feature' }).click();
    await expect(page.getByRole('dialog', { name: 'Report a problem or request a feature' })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const seriousOrCritical = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(seriousOrCritical).toEqual([]);
  });

  test('Zero critical/serious a11y violations in Command Palette', async ({ page }) => {
    await loginUser(page);
    await page.goto('/dashboard');
    await page.getByTestId('sidebar-search').click();
    await expect(page.getByRole('dialog', { name: /Command palette/i })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const seriousOrCritical = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(seriousOrCritical).toEqual([]);
  });
});

