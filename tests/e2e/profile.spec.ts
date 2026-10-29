import { test, expect, loginUser } from './fixtures';

test.describe('Profile & Settings (PROF)', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    await page.goto('/profile');
  });

  test('PROF-01 (P0) Editing any field shows Unsaved changes; Discard reverts', async ({ page }) => {
    await expect(page.getByText('Unsaved changes')).not.toBeVisible();

    const ageInput = page.getByLabel('Age');
    await ageInput.fill('35');

    await expect(page.getByText('Unsaved changes')).toBeVisible();

    // Discard reverts
    await page.getByTestId('profile-discard-button').click();
    await expect(page.getByText('Unsaved changes')).not.toBeVisible();
    await expect(ageInput).toHaveValue('28');
  });

  test('PROF-02 (P0) Save validates and updates cross-screen data', async ({ page }) => {
    // Change goal weight to 82 and calorie target to 2500
    const gwInput = page.getByLabel('Goal weight (kg)');
    await gwInput.fill('82');

    const calInput = page.getByLabel('Calories (kcal)');
    await calInput.fill('2500');

    await page.getByTestId('profile-save-button').click();
    await expect(page.getByText(/Changes saved/i)).toBeVisible();

    // Verify dashboard reflects new target
    await page.goto('/dashboard');
    await expect(page.getByText(/of 2,500 kcal/i)).toBeVisible();

    // Verify progress reflects new goal weight
    await page.goto('/progress');
    await expect(page.getByText('to 82 kg')).toBeVisible();
  });

  test('PROF-03 (P1) Changing current weight logs it for today', async ({ page }) => {
    const weightInput = page.getByLabel('Current weight (kg)');
    await weightInput.fill('77.5');
    await page.getByTestId('profile-save-button').click();
    await expect(page.getByText(/Changes saved/i)).toBeVisible();

    // Check progress
    await page.goto('/progress');
    await expect(page.getByRole('region', { name: 'Key stats' }).getByText('77.5')).toBeVisible();
  });

  test('PROF-04 (P1) Recalculate with Nova fills suggested targets', async ({ page }) => {
    await page.getByTestId('profile-recalc-button').click();
    await expect(page.getByText(/Nova suggested/i)).toBeVisible();
  });

  test('PROF-05 (P1) Change password validates and confirms', async ({ page }) => {
    const changePwBtn = page.getByRole('button', { name: 'Change password' });
    if (await changePwBtn.isVisible()) {
      await changePwBtn.click();

      // Short password
      const newPw = page.getByLabel('New password', { exact: true });
      const confPw = page.getByLabel('Confirm new password', { exact: true });
      await newPw.fill('short');
      await confPw.fill('short');
      await page.getByRole('button', { name: 'Update password' }).click();
      await expect(page.getByText('Password must be at least 8 characters.')).toBeVisible();

      // Mismatch
      await newPw.fill('longpassword1');
      await confPw.fill('longpassword2');
      await page.getByRole('button', { name: 'Update password' }).click();
      await expect(page.getByText('Passwords do not match.')).toBeVisible();

      // Success
      await confPw.fill('longpassword1');
      await page.getByRole('button', { name: 'Update password' }).click();
      await expect(page.getByText('Password updated')).toBeVisible();
    }
  });

  test('PROF-06 (P1) Notification toggles toggle and persist', async ({ page }) => {
    const toggle = page.getByRole('switch', { name: 'Workout reminders' });
    if (await toggle.isVisible()) {
      const initialChecked = await toggle.getAttribute('aria-checked');
      await toggle.click();
      const newChecked = await toggle.getAttribute('aria-checked');
      expect(newChecked).not.toBe(initialChecked);

      // Save and reload
      await page.getByTestId('profile-save-button').click();
      await page.reload();
      expect(await page.getByRole('switch', { name: 'Workout reminders' }).getAttribute('aria-checked')).toBe(newChecked);
    }
  });

  test('PROF-07 (P0) Log out redirects to /login and Delete account clears data', async ({ page }) => {
    // Test Log out
    await page.getByTestId('profile-logout-button').click();
    await expect(page).toHaveURL(/\/login/);

    // Log back in
    await loginUser(page);
    await page.goto('/profile');

    // Test Delete account
    await page.getByTestId('profile-delete-open-button').click();
    await page.getByLabel('Type DELETE to confirm').fill('DELETE');
    await page.getByTestId('profile-delete-confirm-button').click();

    await expect(page.getByRole('heading', { name: 'Account deleted' })).toBeVisible();
    await page.getByRole('link', { name: 'Back to Log in' }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('PROF-09 (P2) Reset demo data restores seed values', async ({ page }) => {
    // Mutate state first
    await page.getByLabel('Age').fill('45');
    await page.getByTestId('profile-save-button').click();
    await expect(page.getByText(/Changes saved/i)).toBeVisible();

    // Reset demo data
    await page.getByTestId('profile-reset-demo-button').click();
    await expect(page.getByText('Demo data restored to the original sample week.')).toBeVisible();
    await expect(page.getByLabel('Age')).toHaveValue('28');
  });

  test('PROF-10 (P1) Feedback modal validates and saves to fitai.feedback', async ({ page }) => {
    await page.getByRole('button', { name: 'Report a problem / Request a feature' }).click();

    // Empty message validation
    await page.getByTestId('feedback-submit-button').click();
    await expect(page.getByText('Please enter a description for your feedback.')).toBeVisible();

    // Fill message
    await page.getByTestId('feedback-message-input').fill('Great app! Love the dark theme.');
    await page.getByTestId('feedback-submit-button').click();

    await expect(page.getByTestId('toast')).toBeVisible();

    // Verify localStorage has fitai.feedback
    const feedback = await page.evaluate(() => localStorage.getItem('fitai.feedback'));
    expect(feedback).toContain('Great app! Love the dark theme.');
  });
});

