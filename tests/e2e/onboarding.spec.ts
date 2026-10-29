import { test, expect } from './fixtures';

test.describe('Onboarding (ONB)', () => {
  test.beforeEach(async ({ page }) => {
    // Sign up a fresh user to get into onboarding
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign up' }).click();
    await page.getByLabel('Full name').fill('Sam Rivera');
    await page.getByLabel('Email').fill('sam.rivera@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Create account' }).click();
    await page.getByRole('link', { name: 'Set up my profile' }).click();
    await page.waitForURL('/onboarding');
  });

  test('ONB-01 (P0) Five steps navigate Next/Back and keep answers', async ({ page }) => {
    await expect(page.getByText('Step 1 of 5')).toBeVisible();

    // Step 1: fill age, height, weight
    await page.getByLabel('Age').fill('26');
    await page.getByLabel('Height').fill('175');
    await page.getByLabel('Current weight').fill('72.5');
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 2: Goal
    await expect(page.getByText('Step 2 of 5')).toBeVisible();
    await page.getByRole('button', { name: /^Build muscle/i }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 3: Experience
    await expect(page.getByText('Step 3 of 5')).toBeVisible();
    await page.getByRole('button', { name: /^Intermediate/i }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 4: Diet
    await expect(page.getByText('Step 4 of 5')).toBeVisible();
    await page.getByRole('button', { name: /^Vegetarian/i }).click();

    // Go back and verify answers kept
    await page.getByTestId('onboarding-back').click();
    await expect(page.getByText('Step 3 of 5')).toBeVisible();
    await expect(page.getByRole('button', { name: /^Intermediate/i })).toHaveAttribute('aria-pressed', 'true');

    await page.getByTestId('onboarding-back').click();
    await expect(page.getByText('Step 2 of 5')).toBeVisible();
    await expect(page.getByRole('button', { name: /^Build muscle/i })).toHaveAttribute('aria-pressed', 'true');

    await page.getByTestId('onboarding-back').click();
    await expect(page.getByText('Step 1 of 5')).toBeVisible();
    await expect(page.getByLabel('Age')).toHaveValue('26');
    await expect(page.getByLabel('Height')).toHaveValue('175');
    await expect(page.getByLabel('Current weight')).toHaveValue('72.5');
  });

  test('ONB-02 (P1) Step 1 validation for age, height, weight', async ({ page }) => {
    await page.getByLabel('Age').fill('10');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Enter an age between 14 and 90.')).toBeVisible();

    await page.getByLabel('Age').fill('25');
    await page.getByLabel('Height').fill('100');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Enter a height between 120 and 230 cm.')).toBeVisible();

    await page.getByLabel('Height').fill('180');
    await page.getByLabel('Current weight').fill('20');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Enter a weight between 30 and 300 kg.')).toBeVisible();
  });

  test('ONB-03 (P1) Single-select card options validate when none picked', async ({ page }) => {
    // Go to step 2
    await page.getByLabel('Age').fill('26');
    await page.getByLabel('Height').fill('175');
    await page.getByLabel('Current weight').fill('72.5');
    await page.getByRole('button', { name: 'Continue' }).click();

    // Try continue without picking goal
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Pick a goal to continue.')).toBeVisible();

    // Pick goal and continue to step 3
    await page.getByRole('button', { name: /^Lose fat/i }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Try continue without picking experience
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Pick your experience level to continue.')).toBeVisible();

    // Pick experience and continue to step 4
    await page.getByRole('button', { name: /^Beginner/i }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Try continue without picking diet
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Pick a dietary preference to continue.')).toBeVisible();
  });

  test('ONB-04 (P0) Review shows entered answers plus computed daily calories and protein', async ({ page }) => {
    // Step 1
    await page.getByLabel('Age').fill('25');
    await page.getByLabel('Height').fill('178');
    await page.getByLabel('Current weight').fill('75');
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 2
    await page.getByRole('button', { name: /^Build muscle/i }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 3
    await page.getByRole('button', { name: /^Intermediate/i }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 4
    await page.getByRole('button', { name: /^Vegetarian/i }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 5: Review
    await expect(page.getByText('Step 5 of 5')).toBeVisible();
    await expect(page.getByText('25 years')).toBeVisible();
    await expect(page.getByText('178 cm')).toBeVisible();
    await expect(page.getByText('75 kg')).toBeVisible();
    await expect(page.getByText('Build muscle')).toBeVisible();
    await expect(page.getByText('Intermediate')).toBeVisible();
    await expect(page.getByText('Vegetarian')).toBeVisible();

    // Computed targets container
    await expect(page.getByText('Daily calories')).toBeVisible();
    await expect(page.getByText('Daily protein')).toBeVisible();
  });

  test('ONB-05 (P0) Finish -> loader -> ready -> Go to my dashboard', async ({ page }) => {
    // Fill all steps
    await page.getByLabel('Age').fill('28');
    await page.getByLabel('Height').fill('180');
    await page.getByLabel('Current weight').fill('78');
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByRole('button', { name: /^Build muscle/i }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByRole('button', { name: /^Intermediate/i }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByRole('button', { name: /^Vegetarian/i }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Build plan
    await page.getByRole('button', { name: 'Build my plan' }).click();
    await expect(page.getByText('Nova is building your plan…')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Your plan is ready!' })).toBeVisible({ timeout: 6000 });

    const dashBtn = page.getByRole('link', { name: 'Go to my dashboard' });
    await expect(dashBtn).toBeVisible();
    await dashBtn.click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /Good morning, Sam!/i }).first()).toBeVisible();
  });

  test('ONB-06 (P2) Refresh mid-flow does not crash', async ({ page }) => {
    await page.getByLabel('Age').fill('26');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.reload();
    await expect(page.getByText(/Step [1-5] of 5/)).toBeVisible();
  });
});

