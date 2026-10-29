import { test, expect, loginUser } from './fixtures';

test.describe('Animation & Motion (Section 9)', () => {
  test('Honors prefers-reduced-motion without losing information', async ({ page }) => {
    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await loginUser(page);

    await page.goto('/dashboard');
    const d = page.locator('.max-md\\:hidden');
    // Metrics render immediately without errors
    await expect(d.getByTestId('dashboard-calories-card').getByText('1,640')).toBeVisible();
    await expect(d.getByTestId('dashboard-protein-card').getByText('112')).toBeVisible();
    await expect(d.getByTestId('dashboard-weight-card').getByText('76.4')).toBeVisible();

    // Rings and bars render with accessible labels
    await expect(d.getByRole('img', { name: /Calories \d+ percent/i })).toBeVisible();
  });

  test('Page transitions complete without double-rendering', async ({ page }) => {
    await loginUser(page);

    await page.goto('/workouts');
    await expect(page.getByRole('heading', { name: 'My Workouts', exact: true })).toBeVisible();

    await page.goto('/nutrition');
    await expect(page.getByRole('heading', { name: 'Nutrition', exact: true })).toBeVisible();

    await page.goto('/progress');
    await expect(page.getByRole('heading', { name: 'Progress', exact: true })).toBeVisible();
  });
});
