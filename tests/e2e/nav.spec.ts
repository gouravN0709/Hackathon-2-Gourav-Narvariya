import { test, expect, loginUser } from './fixtures';

test.describe('Shell, navigation and global (NAV)', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  test('NAV-01 (P0) Sidebar items, active route indicator, profile link and collapse toggle', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/dashboard');

    // 6 nav items exist
    await expect(page.getByTestId('sidebar-nav-dashboard')).toBeVisible();
    await expect(page.getByTestId('sidebar-nav-coach')).toBeVisible();
    await expect(page.getByTestId('sidebar-nav-workouts')).toBeVisible();
    await expect(page.getByTestId('sidebar-nav-nutrition')).toBeVisible();
    await expect(page.getByTestId('sidebar-nav-progress')).toBeVisible();
    await expect(page.getByTestId('sidebar-nav-profile')).toBeVisible();

    // Active item on /dashboard
    await expect(page.getByTestId('sidebar-nav-dashboard')).toHaveAttribute('aria-current', 'page');

    // Navigate to Workouts
    await page.getByTestId('sidebar-nav-workouts').click();
    await expect(page).toHaveURL(/\/workouts/);
    await expect(page.getByTestId('sidebar-nav-workouts')).toHaveAttribute('aria-current', 'page');

    // Profile link
    await page.getByTestId('sidebar-profile').click();
    await expect(page).toHaveURL(/\/profile/);

    // Toggle collapse
    await page.goto('/dashboard');
    const toggleBtn = page.getByTestId('sidebar-toggle');
    await toggleBtn.click();
    await expect(toggleBtn).toHaveAttribute('aria-label', 'Expand sidebar');

    // Persists after reload
    await page.reload();
    await expect(toggleBtn).toHaveAttribute('aria-label', 'Expand sidebar');
  });

  test('NAV-02 (P0) Below 820px desktop sidebar hides and 5-tab bottom bar appears', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard');

    // Desktop sidebar hidden
    await expect(page.getByTestId('sidebar-nav-dashboard')).not.toBeVisible();

    // 5-tab bottom bar visible
    await expect(page.getByTestId('mobile-tab-dashboard')).toBeVisible();
    await expect(page.getByTestId('mobile-tab-coach')).toBeVisible();
    await expect(page.getByTestId('mobile-tab-workouts')).toBeVisible();
    await expect(page.getByTestId('mobile-tab-nutrition')).toBeVisible();
    await expect(page.getByTestId('mobile-tab-progress')).toBeVisible();

    // Active tab
    await expect(page.getByTestId('mobile-tab-dashboard')).toHaveAttribute('aria-current', 'page');

    // Tap Coach tab
    await page.getByTestId('mobile-tab-coach').click();
    await expect(page).toHaveURL(/\/coach/);
    await expect(page.getByTestId('mobile-tab-coach')).toHaveAttribute('aria-current', 'page');
  });

  test('NAV-03 (P1) Browser back/forward works and unknown route shows 404', async ({ page }) => {
    await page.goto('/dashboard');
    await page.goto('/nutrition');
    await page.goto('/progress');

    // Back
    await page.goBack();
    await expect(page).toHaveURL(/\/nutrition/);
    await page.goBack();
    await expect(page).toHaveURL(/\/dashboard/);

    // Forward
    await page.goForward();
    await expect(page).toHaveURL(/\/nutrition/);

    // Unknown route shows 404
    await page.goto('/some-unknown-route-12345');
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByRole('link', { name: /Back to dashboard/i })).toBeVisible();
  });

  test('NAV-04 (P1) Command palette (Cmd/Ctrl+K) opens, filters and executes actions', async ({ page }) => {
    await page.goto('/dashboard');

    // Press Cmd+K / Ctrl+K
    await page.keyboard.press('ControlOrMeta+K');
    await expect(page.getByRole('dialog', { name: 'Command Palette' })).toBeVisible();

    const input = page.getByTestId('command-palette-input');
    await input.fill('Start Today');
    await expect(page.getByText("Start Today's Workout")).toBeVisible();

    // Select with Enter
    await input.press('Enter');
    await expect(page).toHaveURL(/\/workouts\/details/);

    // Reopen and close with Escape
    await page.keyboard.press('ControlOrMeta+K');
    await expect(page.getByRole('dialog', { name: 'Command Palette' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Command Palette' })).not.toBeVisible();
  });
});

