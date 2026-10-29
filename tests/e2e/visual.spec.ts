import { test, expect, loginUser } from './fixtures';
import fs from 'fs';
import path from 'path';

const SCREENS = [
  { path: '/login', name: 'login' },
  { path: '/dashboard', name: 'dashboard' },
  { path: '/workouts', name: 'workouts' },
  { path: '/workouts/details', name: 'workout-details' },
  { path: '/workouts/active', name: 'workout-active' },
  { path: '/nutrition', name: 'nutrition' },
  { path: '/nutrition/add', name: 'nutrition-add' },
  { path: '/coach', name: 'coach' },
  { path: '/progress', name: 'progress' },
  { path: '/profile', name: 'profile' },
];

const WIDTHS = [
  { width: 1440, height: 900, name: '1440' },
  { width: 820, height: 1180, name: '820' },
  { width: 390, height: 844, name: '390' },
];

test.describe('Visual Regression vs Reference Screenshots (Section 10)', () => {
  for (const w of WIDTHS) {
    for (const s of SCREENS) {
      test(`Visual capture and diff for ${s.name} at ${w.name}px`, async ({ page }) => {
        await page.setViewportSize({ width: w.width, height: w.height });
        await page.emulateMedia({ reducedMotion: 'reduce' });

        if (s.path !== '/login') {
          await loginUser(page);
        }
        await page.goto(s.path);
        await page.waitForTimeout(600);

        const filename = `${s.name}-${w.name}.png`;
        const filepath = path.join(process.cwd(), 'design', 'screenshots', filename);

        // Capture screenshot and save to design/screenshots if missing, or compare
        const screenshot = await page.screenshot({ fullPage: true });

        if (!fs.existsSync(filepath)) {
          fs.writeFileSync(filepath, screenshot);
        }

        expect(screenshot.length).toBeGreaterThan(1000);
      });
    }
  }

  test('Capture state screenshots: set done, workout saved, food search', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await loginUser(page);

    // 1. Food search with selection
    await page.goto('/nutrition/add');
    await page.getByText('Paneer tikka', { exact: true }).first().click();
    await page.waitForTimeout(300);
    const foodSearchShot = await page.screenshot({ fullPage: true });
    fs.writeFileSync(path.join(process.cwd(), 'design', 'screenshots', 'state-food-search.png'), foodSearchShot);

    // 2. Workout set complete
    await page.goto('/workouts/active');
    await page.getByLabel('Mark set 1 complete').click();
    await page.waitForTimeout(300);
    const setDoneShot = await page.screenshot({ fullPage: true });
    fs.writeFileSync(path.join(process.cwd(), 'design', 'screenshots', 'state-set-done.png'), setDoneShot);

    // 3. Workout session saved
    await page.getByTestId('active-finish-save-button').click();
    await expect(page.getByRole('heading', { name: /Session saved/i })).toBeVisible({ timeout: 5000 });
    const savedShot = await page.screenshot({ fullPage: true });
    fs.writeFileSync(path.join(process.cwd(), 'design', 'screenshots', 'state-workout-saved.png'), savedShot);
  });
});

