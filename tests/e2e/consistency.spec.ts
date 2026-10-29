import { test, expect, loginUser } from './fixtures';

test.describe('Cross-Screen Data Consistency Matrix (Section 8)', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  test('Consistency: Add food updates Dashboard, Nutrition, Coach context', async ({ page }) => {
    // 1. Check initial values
    await page.goto('/dashboard');
    await expect(page.locator('.max-md\\:hidden').getByTestId('dashboard-calories-card').getByText('1,640')).toBeVisible();

    // 2. Add Paneer Tikka (330 kcal, 24g protein)
    await page.goto('/nutrition/add');
    await page.getByText('Paneer tikka', { exact: true }).first().click();
    await page.getByRole('button', { name: 'Dinner', exact: true }).click();
    await page.getByTestId('add-selected-food-button').click();
    await expect(page.getByText(/Added .*Paneer tikka to Dinner/i).first()).toBeVisible();

    // 3. Verify on Nutrition page
    await page.goto('/nutrition');
    await expect(page.getByText('1,970').first()).toBeVisible(); // 1640 + 330 = 1970
    await expect(page.getByText('430').first()).toBeVisible(); // 760 - 330 = 430

    // 4. Verify on Dashboard
    await page.goto('/dashboard');
    await expect(page.locator('.max-md\\:hidden').getByTestId('dashboard-calories-card').getByText('1,970')).toBeVisible();
    await expect(page.locator('.max-md\\:hidden').getByText(/430 left/i)).toBeVisible();

    // 5. Verify on Coach context
    await page.goto('/coach');
    await expect(page.getByText(/1,970 of 2,400 kcal/i)).toBeVisible();
  });

  test('Consistency: Log weight updates Dashboard, Progress, Coach context, Profile', async ({ page }) => {
    // 1. Log weight in Progress
    await page.goto('/progress');
    await page.getByTestId('progress-weight-input').fill('78.0');
    await page.getByTestId('progress-weight-submit').click();
    await expect(page.getByText(/Weight saved \(78/i)).toBeVisible();

    // Progress page shows 78.0
    await expect(page.getByText('78.0', { exact: false }).first()).toBeVisible();

    // 2. Dashboard shows 78.0
    await page.goto('/dashboard');
    await expect(page.locator('.max-md\\:hidden').getByTestId('dashboard-weight-card').getByText('78.0')).toBeVisible();

    // 3. Profile shows 78.0
    await page.goto('/profile');
    await expect(page.getByLabel('Current weight (kg)')).toHaveValue('78');

    // 4. Coach context shows 78.0
    await page.goto('/coach');
    await expect(page.getByText(/Current: 78\.0 kg/i)).toBeVisible();
  });

  test('Consistency: Complete workout updates Dashboard, Workouts, Coach context, Progress', async ({ page }) => {
    // 1. Complete session in active workout
    await page.goto('/workouts/active');
    await page.getByLabel('Mark set 1 complete').click();
    await page.getByTestId('active-finish-save-button').click();
    await expect(page.getByRole('heading', { name: /Session saved/i })).toBeVisible({ timeout: 5000 });

    // 2. Dashboard shows Completed and 3 of 4
    await page.goto('/dashboard');
    await expect(page.locator('.max-md\\:hidden').getByText('Completed', { exact: true }).first()).toBeVisible();

    // 3. Workouts planner shows Thu DONE
    await page.goto('/workouts');
    await expect(page.getByTestId('workout-day-thu')).toContainText('DONE');

    // 4. Coach context shows Completed
    await page.goto('/coach');
    await expect(page.getByText(/Completed · \d+ min/i).first()).toBeVisible();

    // 5. Progress consistency chart renders
    await page.goto('/progress');
    await expect(page.getByRole('img', { name: /Sessions per week/i })).toBeVisible();
  });

  test('Consistency: Edit profile updates Dashboard, Nutrition, Progress, Coach', async ({ page }) => {
    await page.goto('/profile');
    await page.getByLabel('Goal weight (kg)').fill('84');
    await page.getByLabel('Calories (kcal)').fill('2700');
    await page.getByTestId('profile-save-button').click();
    await expect(page.getByText(/Changes saved/i)).toBeVisible();

    // Dashboard
    await page.goto('/dashboard');
    await expect(page.locator('.max-md\\:hidden').getByText(/of 2,700 kcal/i)).toBeVisible();
    await expect(page.locator('.max-md\\:hidden').getByText('84 kg', { exact: false }).first()).toBeVisible();

    // Nutrition
    await page.goto('/nutrition');
    await expect(page.getByText(/Target 2,700 kcal/i)).toBeVisible();

    // Progress
    await page.goto('/progress');
    await expect(page.getByText('to 84 kg')).toBeVisible();

    // Coach
    await page.goto('/coach');
    await expect(page.getByText(/Target: 84 kg/i)).toBeVisible();
  });

  test('Consistency: Reset demo data restores all section 4 seed values across screens', async ({ page }) => {
    // Make changes first
    await page.goto('/progress');
    await page.getByTestId('progress-weight-input').fill('81.0');
    await page.getByTestId('progress-weight-submit').click();

    // Reset
    await page.goto('/profile');
    await page.getByTestId('profile-reset-demo-button').click();
    await expect(page.getByText('Demo data restored to the original sample week.')).toBeVisible();

    // Verify Dashboard
    await page.goto('/dashboard');
    await expect(page.locator('.max-md\\:hidden').getByTestId('dashboard-weight-card').getByText('76.4')).toBeVisible();
    await expect(page.locator('.max-md\\:hidden').getByTestId('dashboard-calories-card').getByText('1,640')).toBeVisible();
    await expect(page.locator('.max-md\\:hidden').getByText(/of 2,400 kcal/i)).toBeVisible();

    // Verify Progress
    await page.goto('/progress');
    await expect(page.getByText('76.4', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('55%')).toBeVisible();
  });
});
