import { test as base, expect } from '@playwright/test';

export const DEMO_EMAIL = 'alex@fitai.app';
export const DEMO_PASSWORD = 'password123';

/** Frozen demo clock: every e2e assertion is written around this date. */
export const FROZEN_NOW = new Date('2026-10-15T12:00:00Z');

export const test = base.extend({
  page: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Fresh browser state per test: the demo account lives on the shared local
    // Supabase, so clearing cookies + storage guarantees a signed-out start.
    await page.clock.install({ time: FROZEN_NOW });
    await page.context().clearCookies();
    await page.addInitScript(() => {
      try {
        const usage = sessionStorage.getItem('__fitai_cleared__');
        if (!usage) {
          localStorage.clear();
          sessionStorage.setItem('__fitai_cleared__', '1');
        }
      } catch {}
    });

    await use(page);
    await context.close();
  },
});

export { expect };

/** Signs in as the demo user through the real Supabase auth flow. */
export async function loginDemoUser(page: any, email = DEMO_EMAIL, password = DEMO_PASSWORD) {
  await page.goto('/login');
  await page.getByTestId('auth-submit').waitFor({ state: 'visible' });
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByTestId('auth-submit').click();
  await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('link', { name: 'Go to dashboard' }).click();
  await page.waitForURL('/dashboard');
}

/** Completes a fresh sign-up including the 5-step onboarding, landing on /dashboard. */
export async function signupNewUser(page: any, name: string, email: string, password = DEMO_PASSWORD) {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Sign up' }).click();
  await page.getByLabel('Full name').fill(name);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('checkbox').check();
  await page.getByTestId('auth-submit').click();
  await expect(page.getByRole('heading', { name: 'Account created' })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('link', { name: 'Set up my profile' }).click();
  await page.waitForURL('/onboarding');
}

// Back-compat for the existing specs: same behaviour as loginDemoUser.
export async function loginUser(page: any, email = DEMO_EMAIL, password = DEMO_PASSWORD) {
  return loginDemoUser(page, email, password);
}
