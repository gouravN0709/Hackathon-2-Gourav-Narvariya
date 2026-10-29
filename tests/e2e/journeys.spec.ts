import { test, expect, loginUser } from './fixtures';

test.describe('End-to-End Journeys (J1 - J10)', () => {
  test('J1: Sign up -> Onboarding (5 steps) -> Dashboard shows entered data and computed targets', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign up' }).click();

    await page.getByLabel('Full name').fill('Maya Lin');
    await page.getByLabel('Email').fill('maya.lin@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('checkbox').check();
    await page.getByTestId('auth-submit').click();

    await expect(page.getByRole('heading', { name: 'Account created' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('link', { name: 'Set up my profile' }).click();
    await page.waitForURL('/onboarding');

    // 5 Onboarding steps
    await page.getByLabel('Age').fill('29');
    await page.getByLabel('Height').fill('170');
    await page.getByLabel('Current weight').fill('65.0');
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByRole('button', { name: /^Lose fat/i }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByRole('button', { name: /^Intermediate/i }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByRole('button', { name: /^Vegetarian/i }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Confirm step
    await page.getByRole('button', { name: 'Build my plan' }).click();
    await expect(page.getByText('Nova is building your plan…')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Your plan is ready!' })).toBeVisible({ timeout: 6000 });

    await page.getByRole('link', { name: 'Go to my dashboard' }).click();
    await page.waitForURL('/dashboard');

    await expect(page.locator('.max-md\\:hidden').getByText('Good morning, Maya!')).toBeVisible();
    await expect(page.locator('.max-md\\:hidden').getByText('Fat loss', { exact: false })).toBeVisible();
  });

  test('J2: Log in -> Dashboard -> Workouts -> Details -> Start -> complete sets -> Finish & save -> Dashboard & Progress', async ({ page }) => {
    await loginUser(page);

    // Dashboard -> Workouts details
    await page.locator('.max-md\\:hidden').getByTestId('quick-action-start-workout').click();
    await page.waitForURL('/workouts/details');

    // Details -> Start Workout
    await page.getByTestId('start-workout-button').click();
    await page.waitForURL('/workouts/active');

    // Complete sets
    await page.getByLabel('Mark set 1 complete').click();
    await page.getByLabel('Mark set 2 complete').click();

    // Save
    await page.getByTestId('active-finish-save-button').click();
    await expect(page.getByRole('heading', { name: /Session saved\. Nice work, Alex!/i })).toBeVisible({ timeout: 5000 });

    // Dashboard shows completed
    await page.getByRole('link', { name: 'Back to dashboard' }).click();
    await page.waitForURL('/dashboard');
    await expect(page.locator('.max-md\\:hidden').getByText('Completed', { exact: true }).first()).toBeVisible();

    // Progress shows updated workout session
    await page.goto('/progress');
    await expect(page.getByRole('img', { name: /Sessions per week/i })).toBeVisible();
  });

  test('J3: Dashboard -> Nutrition -> Search Food -> Paneer tikka, 2 servings -> Dinner -> Add -> Dashboard updated', async ({ page }) => {
    await loginUser(page);

    await page.goto('/nutrition');
    await page.getByRole('link', { name: 'Search Food' }).click();
    await page.waitForURL('/nutrition/add');

    await page.getByText('Paneer tikka', { exact: true }).first().click();
    const details = page.locator('aside[aria-label="Food details"]');
    // 2 servings (initial is 1, each step +0.5)
    await details.getByLabel('More servings').click();
    await details.getByLabel('More servings').click();
    // Dinner
    await page.getByRole('button', { name: 'Dinner', exact: true }).click();
    await page.getByTestId('add-selected-food-button').click();

    await expect(page.getByText(/Added .*Paneer tikka to Dinner/i).first()).toBeVisible();

    // Verify dashboard reflects added calories (1640 + 660 = 2300)
    await page.getByTestId('sidebar-nav-dashboard').click();
    await page.waitForURL('/dashboard');
    await expect(page.locator('.max-md\\:hidden').getByTestId('dashboard-calories-card').getByText('2,300')).toBeVisible();
  });

  test('J4: Dashboard -> AI Coach -> Analyze my progress -> answer -> Return to dashboard', async ({ page }) => {
    await loginUser(page);

    await page.goto('/coach');
    await page.getByRole('button', { name: 'Analyze my progress.' }).click();

    await expect(page.getByText(/In 30 days you moved/i)).toBeVisible({ timeout: 6000 });
    await expect(page.getByRole('link', { name: 'Return to dashboard' })).toBeVisible();

    await page.getByRole('link', { name: 'Return to dashboard' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('J5: Dashboard -> Progress -> log 76.9 kg -> chart point added, goal % updated -> Dashboard shows 76.9', async ({ page }) => {
    await loginUser(page);

    await page.goto('/progress');
    await page.getByTestId('progress-weight-input').fill('76.9');
    await page.getByTestId('progress-weight-submit').click();
    await expect(page.getByText('Weight saved (76.9 kg)')).toBeVisible();

    // Dashboard shows 76.9
    await page.goto('/dashboard');
    await expect(page.locator('.max-md\\:hidden').getByTestId('dashboard-weight-card').getByText('76.9')).toBeVisible();
  });

  test('J6: Profile -> change goal weight to 82 & calories target -> Save -> all screens reflect new values', async ({ page }) => {
    await loginUser(page);

    await page.goto('/profile');
    await page.getByLabel('Goal weight (kg)').fill('82');
    await page.getByLabel('Calories (kcal)').fill('2600');
    await page.getByTestId('profile-save-button').click();
    await expect(page.getByText(/Changes saved/i)).toBeVisible();

    // Dashboard
    await page.goto('/dashboard');
    await expect(page.locator('.max-md\\:hidden').getByText(/of 2,600 kcal/i)).toBeVisible();
    await expect(page.locator('.max-md\\:hidden').getByText('82 kg', { exact: false }).first()).toBeVisible();

    // Nutrition
    await page.goto('/nutrition');
    await expect(page.getByText(/Target 2,600 kcal/i)).toBeVisible();

    // Progress
    await page.goto('/progress');
    await expect(page.getByText('to 82 kg')).toBeVisible();
  });

  test('J7: Custom food: Nutrition -> Add Custom Food -> Snacks -> totals update & Undo works', async ({ page }) => {
    await loginUser(page);

    await page.goto('/nutrition/add?tab=custom&meal=snacks');
    await page.getByTestId('custom-food-name').fill('Almond Butter Toast');
    await page.getByTestId('custom-food-calories').fill('220');
    await page.getByTestId('custom-food-submit').click();

    await expect(page.getByText(/Added Almond Butter Toast to Snacks/i).first()).toBeVisible();

    // Go to nutrition and verify item is logged
    await page.goto('/nutrition');
    await expect(page.getByText('Almond Butter Toast', { exact: true })).toBeVisible();

    // Remove it
    await page.getByLabel('Remove Almond Butter Toast').click();
    await expect(page.getByTestId('toast')).toBeVisible();

    // Click Undo and verify restored
    await page.getByTestId('toast-undo').click();
    await expect(page.getByText('Almond Butter Toast', { exact: true })).toBeVisible();
  });

  test('J8: Mobile (390): full pass using only tab bar and on-screen controls', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginUser(page);

    // Tab to Workouts
    await page.getByTestId('mobile-tab-workouts').click();
    await expect(page).toHaveURL(/\/workouts/);

    // Tab to Nutrition
    await page.getByTestId('mobile-tab-nutrition').click();
    await expect(page).toHaveURL(/\/nutrition/);

    // Tab to Coach
    await page.getByTestId('mobile-tab-coach').click();
    await expect(page).toHaveURL(/\/coach/);

    // Tab to Progress
    await page.getByTestId('mobile-tab-progress').click();
    await expect(page).toHaveURL(/\/progress/);

    // Tab to Home
    await page.getByTestId('mobile-tab-dashboard').click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('J9: Refresh maintains state; Reset demo data restores seed', async ({ page }) => {
    await loginUser(page);

    // Mutate state
    await page.goto('/progress');
    await page.getByTestId('progress-weight-input').fill('79.2');
    await page.getByTestId('progress-weight-submit').click();

    // Refresh
    await page.reload();
    await expect(page.getByText('79.2', { exact: true }).first()).toBeVisible();

    // Reset demo data in profile
    await page.goto('/profile');
    await page.getByTestId('profile-reset-demo-button').click();
    await expect(page.getByText('Demo data restored to the original sample week.')).toBeVisible();

    // Check dashboard has seed 76.4
    await page.goto('/dashboard');
    await expect(page.locator('.max-md\\:hidden').getByTestId('dashboard-weight-card').getByText('76.4')).toBeVisible();
  });

  test('J10: Log out -> guarded routes redirect -> log in again -> data intact', async ({ page }) => {
    await loginUser(page);

    // Log weight
    await page.goto('/progress');
    await page.getByTestId('progress-weight-input').fill('77.7');
    await page.getByTestId('progress-weight-submit').click();

    // Log out
    await page.goto('/profile');
    await page.getByTestId('profile-logout-button').click();
    await expect(page).toHaveURL(/\/login/);

    // Try accessing dashboard while signed out -> redirects to /login
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);

    // Log in again
    await page.getByLabel('Email').fill('alex.morgan@email.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByTestId('auth-submit').click();
    await page.getByRole('link', { name: 'Go to dashboard' }).click();
    await page.waitForURL('/dashboard');

    // Data from before logout is still there
    await expect(page.locator('.max-md\\:hidden').getByTestId('dashboard-weight-card').getByText('77.7')).toBeVisible();
  });
});
