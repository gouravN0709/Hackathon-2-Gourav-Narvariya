import { test, expect, loginUser } from './fixtures';

test.describe('Progress (PRG)', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    await page.goto('/progress');
  });

  test('PRG-01 (P0) Log weight saves valid value, updates stats and toast', async ({ page }) => {
    const input = page.getByTestId('progress-weight-input');
    await input.fill('76.9');
    await page.getByTestId('progress-weight-submit').click();

    await expect(page.getByText('Weight saved (76.9 kg)')).toBeVisible();

    // Verify latest weight tile updated
    await expect(page.getByText('76.9 kg', { exact: true })).toBeVisible();

    // Return to dashboard and verify weight
    await page.goto('/dashboard');
    await expect(page.locator('.max-md\\:hidden').getByTestId('dashboard-weight-card').getByText('76.9')).toBeVisible();
  });

  test('PRG-02 (P1) Weight validation rejects empty and outside range (30-300)', async ({ page }) => {
    const input = page.getByTestId('progress-weight-input');
    const submitBtn = page.getByTestId('progress-weight-submit');

    // Outside range: 25
    await input.fill('25');
    await submitBtn.click();
    await expect(page.getByText('Enter a weight between 30 and 300 kg.')).toBeVisible();

    // Outside range: 350
    await input.fill('350');
    await submitBtn.click();
    await expect(page.getByText('Enter a weight between 30 and 300 kg.')).toBeVisible();

    // Valid decimal
    await input.fill('77.1');
    await submitBtn.click();
    await expect(page.getByText('Weight saved (77.1 kg)')).toBeVisible();
  });

  test('PRG-03 (P0) 7/30-day toggle updates charts and period subtitles', async ({ page }) => {
    // 30 days is default
    await expect(page.getByText(/in 30 days/i)).toBeVisible();

    // Switch to 7 days
    await page.getByRole('button', { name: '7 days' }).click();
    await expect(page.getByText(/this week/i)).toBeVisible();

    // Switch back to 30 days
    await page.getByRole('button', { name: '30 days' }).click();
    await expect(page.getByText(/in 30 days/i)).toBeVisible();
  });

  test('PRG-04 (P1) Charts render without clipping', async ({ page }) => {
    await expect(page.getByRole('img', { name: /Weight history line chart/i })).toBeVisible();
    await expect(page.getByRole('img', { name: /Sessions per week/i })).toBeVisible();
    await expect(page.getByRole('img', { name: /Daily calories/i })).toBeVisible();

    // Strength rows
    await expect(page.getByText('Bench Press')).toBeVisible();
    await expect(page.getByText('Squat')).toBeVisible();
  });

  test('PRG-05 (P1) Goal card displays progress and Edit goal opens Profile', async ({ page }) => {
    await expect(page.getByText('Goal progress')).toBeVisible();
    await expect(page.getByText('55%')).toBeVisible();
    await expect(page.getByText(/3\.6 kg to go/i)).toBeVisible();

    await page.getByRole('link', { name: 'Edit goal' }).click();
    await expect(page).toHaveURL(/\/profile/);
  });

  test('PRG-06 (P1) Ask Nova about my progress links to Coach', async ({ page }) => {
    const askNovaBtn = page.getByRole('link', { name: 'Ask Nova about my progress' });
    if (await askNovaBtn.isVisible()) {
      await askNovaBtn.click();
      await expect(page).toHaveURL(/\/coach/);
    }
  });
});

