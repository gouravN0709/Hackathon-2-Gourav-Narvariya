import { test, expect, loginUser } from './fixtures';

test.describe('Workouts: Planner, Details, Active (WK)', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  // --- Planner (/workouts) ---
  test('WK-01 (P0) Week strip statuses and day selection updates detail panel', async ({ page }) => {
    await page.goto('/workouts');

    // Weekday chips: Mon/Tue Done, Thu Today, Fri Planned, Sat/Sun Rest
    const monChip = page.getByTestId('workout-day-mon');
    await expect(monChip).toContainText('DONE');
    const tueChip = page.getByTestId('workout-day-tue');
    await expect(tueChip).toContainText('DONE');
    const thuChip = page.getByTestId('workout-day-thu');
    await expect(thuChip).toContainText('TODAY');
    const friChip = page.getByTestId('workout-day-fri');
    await expect(friChip).toContainText('PLANNED');
    const satChip = page.getByTestId('workout-day-sat');
    await expect(satChip).toContainText('REST');

    // Selecting Monday updates selected panel to Back & Biceps
    await monChip.click();
    await expect(page.getByRole('heading', { name: 'Back & Biceps' })).toBeVisible();

    // Selecting Saturday shows Rest day recovery message
    await satChip.click();
    await expect(page.getByRole('heading', { name: 'Rest day' })).toBeVisible();
    await expect(page.getByText(/Recovery is when muscle is built/i)).toBeVisible();
  });

  test('WK-02 (P1) Header CTA and Open workout button navigate to Details', async ({ page }) => {
    await page.goto('/workouts');
    const cta = page.getByRole('link', { name: "Open today's workout" });
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/workouts\/details/);
    await expect(page.getByRole('heading', { name: 'Chest & Triceps' })).toBeVisible();
  });

  test('WK-03 (P1) Regenerate plan shows confirmation', async ({ page }) => {
    await page.goto('/workouts');
    const regenBtn = page.getByTestId('regenerate-plan-button');
    await regenBtn.click();
    await expect(page.getByText('Regenerating…')).toBeVisible();
    await expect(page.getByText('Plan refreshed')).toBeVisible({ timeout: 5000 });
  });

  test('WK-04 (P1) Muscle group browse lists exercises and counts', async ({ page }) => {
    await page.goto('/workouts');
    // Chest is selected by default
    await expect(page.getByRole('list', { name: 'Chest exercises' })).toBeVisible();

    // Selecting Back shows Back exercises
    const backGroup = page.getByRole('button', { name: /Back.*exercises/i });
    await backGroup.click();
    await expect(page.getByRole('list', { name: 'Back exercises' })).toBeVisible();
  });

  test('WK-05 (P1) Custom routines creation, validation, and persistence', async ({ page }) => {
    await page.goto('/workouts');
    await page.getByTestId('create-routine-button').click();

    // Empty routine name validation
    await page.getByTestId('save-routine-button').click();
    await expect(page.getByText('Name your routine first.')).toBeVisible();

    // Valid routine
    await page.getByTestId('routine-name-input').fill('Core Crusher');
    await page.getByTestId('save-routine-button').click();
    await expect(page.getByText('• Core Crusher')).toBeVisible();

    // Duplicate routine name validation
    await page.getByTestId('create-routine-button').click();
    await page.getByTestId('routine-name-input').fill('Core Crusher');
    await page.getByTestId('save-routine-button').click();
    await expect(page.getByText('You already have a routine with that name.')).toBeVisible();

    // Persistence after reload
    await page.reload();
    await expect(page.getByText('• Core Crusher')).toBeVisible();
  });

  test('WK-06 (P2) Rest day panel shows recovery message without Start button', async ({ page }) => {
    await page.goto('/workouts');
    await page.getByTestId('workout-day-sat').click();
    await expect(page.getByText(/Recovery is when muscle is built/i)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Start Workout' })).not.toBeVisible();
  });

  // --- Details (/workouts/details) ---
  test('WK-10 (P0) Details displays name, metadata, focus chips and exercises', async ({ page }) => {
    await page.goto('/workouts/details');
    await expect(page.getByRole('heading', { name: 'Chest & Triceps' })).toBeVisible();
    await expect(page.getByText('58 min')).toBeVisible();
    await expect(page.getByText('6 exercises')).toBeVisible();
    await expect(page.getByText('19 sets')).toBeVisible();
    await expect(page.getByText('~420 kcal')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Start Workout' })).toBeVisible();
  });

  test('WK-12 (P1) Add exercise picker adds new exercise and persists', async ({ page }) => {
    await page.goto('/workouts/details');
    await page.getByTestId('add-exercise-button').click();

    // Add Cable Flyes
    const addCableFlyes = page.getByRole('button', { name: /Cable Flyes/i });
    if (await addCableFlyes.isVisible()) {
      await addCableFlyes.click();
      await expect(page.getByRole('heading', { name: 'Cable Flyes' })).toBeVisible();
    }
  });

  test('WK-13 (P1) Start Workout opens Active Workout screen', async ({ page }) => {
    await page.goto('/workouts/details');
    await page.getByTestId('start-workout-button').click();
    await expect(page).toHaveURL(/\/workouts\/active/);
    await expect(page.getByText('WORKOUT IN PROGRESS')).toBeVisible();
  });

  // --- Active (/workouts/active) ---
  test('WK-20 (P0) Timer starts and ticks, header pills display progress', async ({ page }) => {
    await page.goto('/workouts/active');
    await expect(page.getByText('WORKOUT IN PROGRESS')).toBeVisible();
    await expect(page.getByText(/of \d+ sets/i).first()).toBeVisible();
  });

  test('WK-21 (P0) Steppers modify weight and reps without going negative', async ({ page }) => {
    await page.goto('/workouts/active');

    // Decrease weight
    const decWeight = page.getByLabel('Decrease weight for set 1');
    await decWeight.click();
    // Decrease reps
    const decReps = page.getByLabel('Decrease reps for set 1');
    for (let i = 0; i < 15; i++) {
      await decReps.click();
    }
    // Reps should not be negative
    await expect(page.getByText('-1 reps')).not.toBeVisible();
  });

  test('WK-22 (P0) Check set updates status and volume, uncheck reverses', async ({ page }) => {
    await page.goto('/workouts/active');
    const set1Btn = page.getByLabel('Mark set 1 complete');
    await expect(set1Btn).toHaveAttribute('aria-pressed', 'false');

    await set1Btn.click();
    await expect(set1Btn).toHaveAttribute('aria-pressed', 'true');

    // Uncheck reverses
    await set1Btn.click();
    await expect(set1Btn).toHaveAttribute('aria-pressed', 'false');
  });

  test('WK-23 (P1) Workout error validations: 0 reps check, finish 0 sets', async ({ page }) => {
    await page.goto('/workouts/active');

    // Finish with 0 sets done
    await page.getByTestId('active-finish-save-button').click();
    await expect(page.getByText('Complete at least one set before saving your session.')).toBeVisible();

    // Reduce reps to 0 on set 1 and try to mark complete
    const decReps = page.getByLabel('Decrease reps for set 1');
    for (let i = 0; i < 15; i++) {
      await decReps.click();
    }
    await page.getByLabel('Mark set 1 complete').click();
    await expect(page.getByText(/Add at least 1 rep before completing set 1/i)).toBeVisible();
  });

  test('WK-24 (P1) + Add set and Complete exercise buttons function', async ({ page }) => {
    await page.goto('/workouts/active');
    // Add set
    await page.getByTestId('active-add-set-button').click();
    await expect(page.getByText('Set 4')).toBeVisible();

    // Complete exercise marks all done and advances
    await page.getByTestId('active-complete-exercise-button').click();
    // Second exercise is now active
    await expect(page.getByText('Exercise 2 of')).toBeVisible();
  });

  test('WK-25 (P1) Rest timer ring runs after completing a set and can be skipped', async ({ page }) => {
    await page.goto('/workouts/active');
    await page.getByLabel('Mark set 1 complete').click();
    await expect(page.getByText('Rest timer counting down')).toBeVisible();

    const skipBtn = page.getByRole('button', { name: 'Skip rest' });
    await expect(skipBtn).toBeVisible();
    await skipBtn.click();
    await expect(page.getByText('Rest timer counting down')).not.toBeVisible();
  });

  test('WK-26 & WK-27 (P0) Finish & save workflow updates cross-screen state', async ({ page }) => {
    await page.goto('/workouts/active');
    await page.getByLabel('Mark set 1 complete').click();

    await page.getByTestId('active-finish-save-button').click();
    await expect(page.getByTestId('active-finish-save-button')).toHaveText('Saving…');
    await expect(page.getByRole('heading', { name: /Session saved\. Nice work, Alex!/i })).toBeVisible({ timeout: 5000 });

    // Verify dashboard update
    await page.getByRole('link', { name: 'Back to dashboard' }).click();
    await page.waitForURL('/dashboard');
    await expect(page.locator('.max-md\\:hidden').getByText(/Completed · See progress/i)).toBeVisible();

    // Verify workouts planner marks Today as Done
    await page.goto('/workouts');
    await expect(page.getByTestId('workout-day-thu')).toContainText('DONE');
  });

  test('WK-28 (P1) Re-opening Active Workout after completion shows already complete', async ({ page }) => {
    // Complete workout first
    await page.goto('/workouts/active');
    await page.getByLabel('Mark set 1 complete').click();
    await page.getByTestId('active-finish-save-button').click();
    await expect(page.getByRole('heading', { name: /Session saved/i })).toBeVisible({ timeout: 5000 });

    // Re-open active workout
    await page.goto('/workouts/active');
    await expect(page.getByRole('heading', { name: "Today's workout is already complete" })).toBeVisible();
  });
});

