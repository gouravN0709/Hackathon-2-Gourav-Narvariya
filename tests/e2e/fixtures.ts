import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Freeze date to 2026-10-15
    await page.clock.install({ time: new Date('2026-10-15T12:00:00Z') });

    // Clear localStorage once before each test
    let cleared = false;
    await page.exposeFunction('__fitai_should_clear_storage__', () => {
      if (!cleared) {
        cleared = true;
        return true;
      }
      return false;
    });

    await page.addInitScript(async () => {
      try {
        const shouldClear = await (window as any).__fitai_should_clear_storage__();
        if (shouldClear) {
          localStorage.clear();
        }
      } catch {}
    });

    await use(page);
  },
});

export { expect };

export async function loginUser(page: any, email = 'alex.morgan@email.com', password = 'password123') {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByTestId('auth-submit').click();
  try {
    await page.clock.runFor(1000);
  } catch {}
  await page.getByRole('link', { name: 'Go to dashboard' }).click();
  await page.waitForURL('/dashboard');
}
