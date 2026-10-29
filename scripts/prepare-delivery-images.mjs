/** Copy visual-regression PNGs to delivery JPEG names; keep fresh login/onboarding if present. */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const OUT = path.resolve('docs/delivery/screens');
const DESIGN = path.resolve('design/screenshots');
const BASE = 'http://127.0.0.1:3333';

const map = [
  ['dashboard', 'dashboard'],
  ['coach', 'coach'],
  ['workouts', 'workouts'],
  ['workouts-details', 'workout-details'],
  ['workouts-active', 'workout-active'],
  ['nutrition', 'nutrition'],
  ['nutrition-add', 'nutrition-add'],
  ['progress', 'progress'],
  ['profile', 'profile'],
];

fs.mkdirSync(OUT, { recursive: true });

async function pngToJpeg(src, dest, quality = 82) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const buf = fs.readFileSync(src);
  const b64 = buf.toString('base64');
  await page.setContent(`<img id="i" src="data:image/png;base64,${b64}">`);
  const img = page.locator('#i');
  await img.waitFor();
  await page.screenshot({ path: dest, type: 'jpeg', quality, clip: await img.boundingBox() });
  await browser.close();
}

for (const [outName, designPrefix] of map) {
  for (const suffix of ['desktop', 'mobile']) {
    const w = suffix === 'desktop' ? '1440' : '390';
    const src = path.join(DESIGN, `${designPrefix}-${w}.png`);
    const dest = path.join(OUT, `${outName}-${suffix}.jpeg`);
    if (!fs.existsSync(src)) {
      console.warn('missing', src);
      continue;
    }
    await pngToJpeg(src, dest);
    console.log('wrote', dest);
  }
}

// Help + offline via browser (public offline; help needs quick signup)
const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
await page.clock.install({ time: new Date('2026-10-15T12:00:00Z') });

await page.goto(`${BASE}/offline`);
for (const [suffix, width, height] of [
  ['desktop', 1440, 900],
  ['mobile', 390, 844],
]) {
  await page.setViewportSize({ width, height });
  await page.screenshot({
    path: path.join(OUT, `offline-pwa-${suffix}.jpeg`),
    type: 'jpeg',
    quality: 82,
  });
}

const email = `help-${Date.now()}@fitai.test`;
await page.goto(`${BASE}/login`);
await page.getByRole('button', { name: 'Sign up' }).click();
await page.getByLabel('Full name').fill('Sam Rivera');
await page.getByLabel('Email').fill(email);
await page.getByLabel('Password').fill('password123');
await page.getByRole('checkbox').check();
await page.getByTestId('auth-submit').click();
await page.getByRole('link', { name: 'Set up my profile' }).click();
await page.waitForURL('**/onboarding');
const continueBtn = () => page.getByRole('button', { name: 'Continue' });
await continueBtn().click();
await page.getByRole('button', { name: 'Muscle gain' }).click();
await continueBtn().click();
await page.getByRole('button', { name: 'Intermediate' }).click();
await continueBtn().click();
await page.getByRole('button', { name: 'Vegetarian' }).click();
await page.getByRole('button', { name: 'Build my plan' }).click();
await page.getByRole('button', { name: 'Go to my dashboard' }).click({ timeout: 30_000 });
await page.waitForURL('**/dashboard', { timeout: 60_000 });
await page.goto(`${BASE}/help`);
await page.waitForTimeout(800);
for (const [suffix, width, height] of [
  ['desktop', 1440, 900],
  ['mobile', 390, 844],
]) {
  await page.setViewportSize({ width, height });
  await page.screenshot({
    path: path.join(OUT, `help-${suffix}.jpeg`),
    type: 'jpeg',
    quality: 82,
  });
}

await browser.close();
console.log('Images ready in', OUT);
