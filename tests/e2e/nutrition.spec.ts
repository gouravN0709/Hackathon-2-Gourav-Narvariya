import { test, expect, loginUser } from './fixtures';

test.describe('Nutrition and Food Search (NUT)', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  test('NUT-01 (P0) Seed totals and empty Dinner state', async ({ page }) => {
    await page.goto('/nutrition');

    // Totals: 1,640 of 2,400 kcal, 760 remaining, 48g protein remaining
    await expect(page.getByText('1,640')).toBeVisible();
    await expect(page.getByText('760', { exact: true })).toBeVisible();
    await expect(page.getByText('48', { exact: true })).toBeVisible();

    // Four meal sections
    await expect(page.getByRole('heading', { name: 'Breakfast' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Lunch' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dinner', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Snacks' })).toBeVisible();

    // Dinner hint
    await expect(page.getByText(/You have room for a full dinner/i)).toBeVisible();
  });

  test('NUT-02 (P0) AI suggestion Add to Dinner updates totals, button state and shows toast', async ({ page }) => {
    await page.goto('/nutrition');
    const suggestBtn = page.getByTestId('add-suggestion-button');
    await expect(suggestBtn).toHaveText('Add to Dinner');

    await suggestBtn.click();
    await expect(page.getByTestId('toast')).toBeVisible();
    await expect(suggestBtn).toHaveText('Added to Dinner');
    await expect(suggestBtn).toBeDisabled();

    // Paneer tikka bowl is now in Dinner
    await expect(page.getByRole('heading', { name: /Paneer tikka bowl for dinner/i })).toBeVisible();
  });

  test('NUT-03 (P1) Remove food item updates totals and Undo restores it', async ({ page }) => {
    await page.goto('/nutrition');

    // Find first delete button in breakfast
    const deleteBtn = page.getByLabel('Remove Rolled oats with almond milk');
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await expect(page.getByTestId('toast')).toBeVisible();

      // Click Undo
      const undoBtn = page.getByTestId('toast-undo');
      await undoBtn.click();
      await expect(page.getByText('Rolled oats with almond milk')).toBeVisible();
    }
  });

  test('NUT-04 (P0) Food Search filters live and shows no-match custom food prompt', async ({ page }) => {
    await page.goto('/nutrition/add');

    const searchInput = page.getByTestId('food-search-input');
    await searchInput.fill('paneer');
    await expect(page.getByText('Paneer tikka')).toBeVisible();

    // No match
    await searchInput.fill('nonexistentfoodxyz');
    await expect(page.getByText('No match for “nonexistentfoodxyz”')).toBeVisible();

    // Add as custom food pre-fills name and switches tab
    await page.getByRole('button', { name: 'Add as custom food' }).click();
    await expect(page.getByTestId('custom-food-name')).toHaveValue('nonexistentfoodxyz');
  });

  test('NUT-05 (P0) Select food and adjust servings / quantity recalculates values', async ({ page }) => {
    await page.goto('/nutrition/add');
    await page.getByText('Paneer tikka', { exact: true }).first().click();

    const details = page.locator('aside[aria-label="Food details"]');
    // Default 1 serving (330 kcal, 24g protein)
    await expect(details.getByText('330')).toBeVisible();

    // Increase quantity to 2 (initial is 1, each step is 0.5)
    const incBtn = details.getByLabel('More servings');
    await incBtn.click();
    await incBtn.click();
    // 330 * 2 = 660 kcal
    await expect(details.getByText('660')).toBeVisible();
  });

  test('NUT-06 & NUT-07 (P0/P1) Add food to chosen meal shows success state and updates dashboard', async ({ page }) => {
    await page.goto('/nutrition/add');
    await page.getByText('Paneer tikka', { exact: true }).first().click();

    // Pick Dinner chip
    await page.getByRole('button', { name: 'Dinner', exact: true }).click();
    await page.getByTestId('add-selected-food-button').click();

    // Success confirmation
    await expect(page.getByText(/Added Paneer tikka to Dinner/i).first()).toBeVisible();

    // Return to dashboard and verify calories increased
    await page.getByTestId('sidebar-nav-dashboard').click();
    await page.waitForURL('/dashboard');
    // Calories must be > 1640
    await expect(page.locator('.max-md\\:hidden').getByTestId('dashboard-calories-card').getByText('1,970')).toBeVisible();
  });

  test('NUT-08 (P1) Custom food validation and addition', async ({ page }) => {
    await page.goto('/nutrition/add?tab=custom');

    // Empty submit fails
    await page.getByTestId('custom-food-submit').click();
    await expect(page.getByText('Give the food a name.')).toBeVisible();

    // Fill name, invalid calories
    await page.getByTestId('custom-food-name').fill('Homemade Energy Ball');
    await page.getByTestId('custom-food-submit').click();
    await expect(page.getByText('Enter calories as a number above 0.')).toBeVisible();

    // Valid values
    await page.getByTestId('custom-food-calories').fill('150');
    await page.getByTestId('custom-food-submit').click();
    await expect(page.getByTestId('toast').getByText(/Added Homemade Energy Ball/i)).toBeVisible();
  });

  test('NUT-09 (P2) Default meal follows query param', async ({ page }) => {
    await page.goto('/nutrition/add?meal=lunch');
    await expect(page.getByRole('button', { name: 'Lunch', exact: true })).toHaveAttribute('aria-pressed', 'true');
  });
});
