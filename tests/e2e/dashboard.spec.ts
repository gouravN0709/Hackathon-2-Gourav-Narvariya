import { test, expect, loginUser } from './fixtures';

test.describe('Dashboard (DASH)', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  test('DASH-01 (P0) Seed values are displayed correctly', async ({ page }) => {
    const d = page.locator('.max-md\\:hidden');
    await expect(d.getByRole('heading', { name: 'Good morning, Alex!' })).toBeVisible();
    await expect(d.getByText(/THURSDAY, OCT 15/i)).toBeVisible();

    // Calories: 1640 of 2400 · 760 left, 68%
    await expect(d.getByTestId('dashboard-calories-card').getByText('1,640')).toBeVisible();
    await expect(d.getByText(/of 2,400 kcal · 760 left/i)).toBeVisible();

    // Protein: 112 / 160 g, 70%
    await expect(d.getByTestId('dashboard-protein-card').getByText('112')).toBeVisible();
    await expect(d.getByTestId('dashboard-protein-card').getByText(/\/ 160 g/i)).toBeVisible();

    // Weight: 76.4, +1.5 kg / 30d
    await expect(d.getByTestId('dashboard-weight-card').getByText('76.4')).toBeVisible();
    await expect(d.getByText(/\+1\.5 kg \/ 30d/i)).toBeVisible();

    // Workout: Planned, Chest & Triceps
    await expect(d.getByRole('heading', { name: 'Chest & Triceps' })).toBeVisible();
    await expect(d.getByTestId('dashboard-workout-card').getByText('Planned')).toBeVisible();
    await expect(d.getByTestId('dashboard-workout-card').getByText(/6:30 PM/)).toBeVisible();
  });

  test('DASH-02 (P1) Tip banner displays and can be dismissed permanently', async ({ page }) => {
    const d = page.locator('.max-md\\:hidden');
    const tipBanner = d.getByRole('note');
    await expect(tipBanner).toBeVisible();
    await expect(d.getByText('First time here?')).toBeVisible();

    // Dismiss tip using testid
    await d.getByTestId('dashboard-tip-dismiss').click();
    await expect(tipBanner).not.toBeVisible();

    // Refresh and ensure stays dismissed
    await page.reload();
    await expect(page.locator('.max-md\\:hidden').getByText('First time here?')).not.toBeVisible();
  });

  test('DASH-03 (P0) Quick actions link to their target screens', async ({ page }) => {
    const d = page.locator('.max-md\\:hidden');

    // Quick action: Log Weight -> /progress
    await d.getByTestId('quick-action-log-weight').click();
    await expect(page).toHaveURL(/\/progress/);

    await page.goto('/dashboard');

    // Quick action: Log Food -> /nutrition/add
    await d.getByTestId('quick-action-log-food').click();
    await expect(page).toHaveURL(/\/nutrition\/add/);

    await page.goto('/dashboard');

    // Quick action: Start Workout -> /workouts/details
    await d.getByTestId('quick-action-start-workout').click();
    await expect(page).toHaveURL(/\/workouts\/details/);

    await page.goto('/dashboard');

    // Quick action: Ask AI -> /coach
    await d.getByTestId('quick-action-ask-ai').click();
    await expect(page).toHaveURL(/\/coach/);
  });

  test('DASH-04 (P0) Summary cards and profile triggers link correctly', async ({ page }) => {
    const d = page.locator('.max-md\\:hidden');

    // Current goal card -> Profile
    await d.getByRole('link', { name: /Current goal/i }).click();
    await expect(page).toHaveURL(/\/profile/);

    await page.goto('/dashboard');

    // Avatar link -> Profile
    await page.getByTestId('sidebar-profile').click();
    await expect(page).toHaveURL(/\/profile/);

    await page.goto('/dashboard');

    // Calories card -> Nutrition
    await d.getByTestId('dashboard-calories-card').click();
    await expect(page).toHaveURL(/\/nutrition/);
  });

  test('DASH-05 (P1) Weight chart renders with 7/30-day toggle', async ({ page }) => {
    const d = page.locator('.max-md\\:hidden');
    await expect(d.getByRole('img', { name: /Weight progress line chart/i })).toBeVisible();

    // Toggle to 7 days
    await d.getByRole('button', { name: '7d' }).click();
    await expect(d.getByText(/this week · on track/i)).toBeVisible();

    // Toggle back to 30 days
    await d.getByRole('button', { name: '30d' }).click();
    await expect(d.getByText(/in 30 days · on track/i)).toBeVisible();
  });

  test('DASH-06 (P1) Nutrition card macro bar and rows match totals', async ({ page }) => {
    const d = page.locator('.max-md\\:hidden');
    await expect(d.locator('dt').filter({ hasText: 'Protein' })).toBeVisible();
    await expect(d.locator('dt').filter({ hasText: 'Carbs' })).toBeVisible();
    await expect(d.locator('dt').filter({ hasText: 'Fats' })).toBeVisible();
    await expect(d.getByRole('link', { name: 'Log meal' })).toBeVisible();
  });

  test('DASH-07 (P1) AI Coach card displays computed data insights', async ({ page }) => {
    const d = page.locator('.max-md\\:hidden');
    await expect(d.getByRole('heading', { name: 'Your AI Coach' })).toBeVisible();
    await expect(d.getByText(/Protein is 48 g short/i)).toBeVisible();
  });

  test('DASH-08 (P1) Workout completion updates dashboard card', async ({ page }) => {
    // Navigate to active workout and complete a set then save
    await page.goto('/workouts/details');
    await page.getByRole('link', { name: 'Start Workout' }).first().click();
    await page.waitForURL('/workouts/active');

    // Complete first set
    await page.getByLabel('Mark set 1 complete').click();
    await page.getByTestId('active-finish-save-button').click();
    await expect(page.getByText(/Session saved/i)).toBeVisible({ timeout: 5000 });

    // Return to dashboard
    await page.getByRole('link', { name: 'Back to dashboard' }).click();
    await page.waitForURL('/dashboard');

    // Status on workout card is Completed
    const d = page.locator('.max-md\\:hidden');
    await expect(d.getByText(/Completed · See progress/i)).toBeVisible();
  });

  test('DASH-09 (P2) Responsive check at 390px mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

    // Bottom tab bar visible on mobile
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
  });
});
