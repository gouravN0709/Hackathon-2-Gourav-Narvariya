/**
 * Capture delivery document screenshots at 1440 and 390 px.
 * Requires: production server at http://127.0.0.1:3333, local Supabase + demo seed.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('docs/delivery/screens');
const BASE = 'http://127.0.0.1:3333';
const DEMO_EMAIL = 'alex@fitai.app';
const DEMO_PASSWORD = 'password123';
const FROZEN = new Date('2026-10-15T12:00:00Z');

fs.mkdirSync(OUT, { recursive: true });

async function loginDemo(page) {
  await page.goto(`${BASE}/login`);
  await page.getByLabel('Email').fill(DEMO_EMAIL);
  await page.getByLabel('Password').fill(DEMO_PASSWORD);
  await page.getByTestId('auth-submit').click();
  await page.getByRole('heading', { name: /Welcome back/ }).waitFor({ timeout: 20_000 });
  await page.getByRole('link', { name: 'Go to dashboard' }).click();
  await page.waitForURL('**/dashboard');
}

async function snap(page, name, url, waitMs = 800) {
  if (url) await page.goto(`${BASE}${url}`);
  await page.waitForTimeout(waitMs);
  for (const [suffix, width, height] of [
    ['desktop', 1440, 900],
    ['mobile', 390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(400);
    const file = path.join(OUT, `${name}-${suffix}.jpeg`);
    await page.screenshot({ path: file, type: 'jpeg', quality: 82, fullPage: false });
    console.log('wrote', file);
  }
}

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
await page.clock.install({ time: FROZEN });

// Login (signed out)
await snap(page, 'login', '/login', 600);

// Onboarding via fresh signup
const onboardingEmail = `onboard-${Date.now()}@fitai.test`;
await page.goto(`${BASE}/login`);
await page.getByRole('button', { name: 'Sign up' }).click();
await page.getByLabel('Full name').fill('Jordan Lee');
await page.getByLabel('Email').fill(onboardingEmail);
await page.getByLabel('Password').fill(DEMO_PASSWORD);
await page.getByRole('checkbox').check();
await page.getByTestId('auth-submit').click();
await page.getByRole('link', { name: 'Set up my profile' }).click();
await page.waitForURL('**/onboarding');
await page.waitForTimeout(600);
await snap(page, 'onboarding', null, 400);

await context.close();
const ctx2 = await browser.newContext();
const page2 = await ctx2.newPage();
await page2.clock.install({ time: FROZEN });
await loginDemo(page2);

const routes = [
  ['dashboard', '/dashboard'],
  ['coach', '/coach'],
  ['workouts', '/workouts'],
  ['workouts-details', '/workouts/details'],
  ['nutrition', '/nutrition'],
  ['nutrition-add', '/nutrition/add'],
  ['progress', '/progress'],
  ['profile', '/profile'],
  ['help', '/help'],
];

for (const [name, route] of routes) {
  await snap(page2, name, route);
}

// Active workout
await page2.goto(`${BASE}/workouts/details`);
await page2.getByRole('button', { name: /Start workout/i }).click();
await page2.waitForURL('**/workouts/active');
await snap(page2, 'workouts-active', null, 1000);

// PWA offline page (public)
await snap(page2, 'offline-pwa', '/offline', 500);

await ctx2.close();
await browser.close();
console.log('Done.');
