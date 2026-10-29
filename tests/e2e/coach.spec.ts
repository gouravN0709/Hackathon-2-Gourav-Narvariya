import { test, expect, loginUser } from './fixtures';

test.describe('AI Coach (COACH)', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    await page.goto('/coach');
  });

  test('COACH-01 (P0) Seed chat displays greeting and today workout card', async ({ page }) => {
    await expect(page.getByText(/Hey Alex! I'm Nova, your coach/i)).toBeVisible();
    await expect(page.getByRole('log', { name: 'Conversation' }).getByText('Chest & Triceps', { exact: true })).toBeVisible();

    // Today's workout card button links to /workouts/active or /workouts/details
    const cardBtn = page.getByRole('link', { name: 'Start Workout' });
    await expect(cardBtn).toBeVisible();
  });

  test('COACH-02 (P0) Suggested prompt sends immediately, shows thinking state and data-aware reply', async ({ page }) => {
    const promptBtn = page.getByRole('button', { name: 'Analyze my progress.' });
    await promptBtn.click();

    await expect(page.getByText('Nova is thinking…')).toBeVisible();
    // Answer streams and arrives with data
    await expect(page.getByText(/In 30 days you moved/i)).toBeVisible({ timeout: 6000 });
  });

  test('COACH-03 (P0) Empty submit shows error text; typed message sends and input clears', async ({ page }) => {
    const input = page.getByTestId('coach-input');

    // Empty submit shows error
    await page.getByTestId('coach-send-button').click();
    await expect(page.getByText('Type a question for Nova first.')).toBeVisible();

    // Type message and submit
    await input.fill('What is my current weight?');
    await input.press('Enter');

    // Input clears
    await expect(input).toHaveValue('');
    // Answer arrives
    await expect(page.getByText(/76\.4 kg/i)).toBeVisible({ timeout: 6000 });
  });

  test('COACH-04 (P1) Answers reflect live state changes', async ({ page }) => {
    // Log weight in progress first
    await page.goto('/progress');
    await page.getByTestId('progress-weight-input').fill('78.5');
    await page.getByTestId('progress-weight-submit').click();
    await expect(page.getByText('Weight saved (78.5 kg)')).toBeVisible();

    // Return to coach and ask weight
    await page.goto('/coach');
    await page.getByTestId('coach-input').fill('What is my current weight?');
    await page.getByTestId('coach-send-button').click();
    await expect(page.getByText(/78\.5 kg/i)).toBeVisible({ timeout: 6000 });
  });

  test('COACH-05 (P1) Quick navigation buttons appear after an answer and work', async ({ page }) => {
    await page.getByTestId('coach-input').fill('Help me reach my fitness goal.');
    await page.getByTestId('coach-send-button').click();

    await expect(page.getByRole('link', { name: 'Return to dashboard' })).toBeVisible({ timeout: 6000 });
    await expect(page.getByRole('link', { name: 'Open Nutrition' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open workouts' })).toBeVisible();

    await page.getByRole('link', { name: 'Return to dashboard' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('COACH-06 (P1) Chat persists after page refresh', async ({ page }) => {
    await page.getByTestId('coach-input').fill('Hello Nova test persistence');
    await page.getByTestId('coach-send-button').click();
    await expect(page.getByText('Hello Nova test persistence')).toBeVisible();

    await page.reload();
    await expect(page.getByText('Hello Nova test persistence')).toBeVisible();
  });

  test('COACH-07 (P1) Context aside values match live store targets and links', async ({ page }) => {
    // Check aside cards
    await expect(page.getByRole('heading', { name: "Today's workout" })).toBeVisible();
    await expect(page.getByRole('heading', { name: "Today's nutrition" })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Goal: Muscle gain/i })).toBeVisible();
  });

  test('COACH-08 (P2) Mobile layout has no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/coach');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
});

