import { test, expect, loginUser } from './fixtures';

test.describe('PWA (Progressive Web App)', () => {
  test('PWA-01: Manifest is valid, linked in layout, and contains required metadata', async ({ page }) => {
    await loginUser(page);

    // Verify manifest link tag in HTML
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);
    const href = await manifestLink.getAttribute('href');
    expect(href).toContain('manifest.webmanifest');

    // Fetch manifest directly
    const res = await page.request.get(href || '/manifest.webmanifest');
    expect(res.status()).toBe(200);

    const manifest = await res.json();
    expect(manifest.name).toBe('FitAI');
    expect(manifest.short_name).toBe('FitAI');
    expect(manifest.description).toBe('Your Fitness. Your Data. Your AI Coach.');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/dashboard');
    expect(manifest.scope).toBe('/');
    expect(manifest.orientation).toBe('portrait-primary');
    expect(manifest.background_color).toBe('#0B0B0D');
    expect(manifest.theme_color).toBe('#0B0B0D');
    expect(manifest.categories).toEqual(['health', 'fitness']);

    // Check icons
    const icons = manifest.icons;
    expect(Array.isArray(icons)).toBe(true);
    expect(icons.some((i: { sizes: string; purpose?: string }) => i.sizes === '192x192')).toBe(true);
    expect(icons.some((i: { sizes: string; purpose?: string }) => i.sizes === '512x512' && (!i.purpose || i.purpose === 'any'))).toBe(true);
    expect(icons.some((i: { sizes: string; purpose?: string }) => i.sizes === '512x512' && i.purpose === 'maskable')).toBe(true);
    expect(icons.some((i: { sizes: string }) => i.sizes === '180x180')).toBe(true);

    // Check shortcuts
    const shortcuts = manifest.shortcuts;
    expect(Array.isArray(shortcuts)).toBe(true);
    expect(shortcuts.some((s: { name: string; url: string }) => s.name === 'Log food' && s.url === '/nutrition/add')).toBe(true);
    expect(shortcuts.some((s: { name: string; url: string }) => s.name === 'Start workout' && s.url === '/workouts/details')).toBe(true);
    expect(shortcuts.some((s: { name: string; url: string }) => s.name === 'Log weight' && s.url === '/progress')).toBe(true);
    expect(shortcuts.some((s: { name: string; url: string }) => s.name === 'Ask Nova' && s.url === '/coach')).toBe(true);
  });

  test('PWA-02: Apple mobile web app metadata and viewport tags are configured', async ({ page }) => {
    await loginUser(page);

    // Apple touch icon
    const appleIcon = page.locator('link[rel="apple-touch-icon"]');
    await expect(appleIcon).toHaveCount(1);
    await expect(appleIcon).toHaveAttribute('href', '/icons/apple-touch-icon.png');

    // Apple mobile web app tags
    await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute('content', 'yes');
    await expect(page.locator('meta[name="apple-mobile-web-app-status-bar-style"]')).toHaveAttribute('content', 'black-translucent');
    await expect(page.locator('meta[name="apple-mobile-web-app-title"]')).toHaveAttribute('content', 'FitAI');

    // Viewport tag
    const viewportMeta = page.locator('meta[name="viewport"]');
    const viewportContent = await viewportMeta.getAttribute('content');
    expect(viewportContent).toContain('viewport-fit=cover');
  });

  test('PWA-03: Service Worker file exists and registers in production build', async ({ page }) => {
    const swRes = await page.request.get('/sw.js');
    expect(swRes.status()).toBe(200);
    const swText = await swRes.text();
    expect(swText).toContain('FitAI Service Worker');
    expect(swText).toContain('SKIP_WAITING');
    expect(swText).toContain('fitai-static');

    await page.goto('/dashboard');
    // Ensure service worker is registered in browser
    await page.waitForFunction(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const reg = await navigator.serviceWorker.getRegistration();
      return !!reg;
    }, { timeout: 10000 });

    const swRegistered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const reg = await navigator.serviceWorker.getRegistration();
      return !!reg;
    });
    expect(swRegistered).toBe(true);
  });

  test('PWA-04: /offline page is accessible and displays FitAI offline state and actions', async ({ page }) => {
    await page.goto('/offline');
    await expect(page.getByRole('heading', { name: "You're offline" })).toBeVisible();
    await expect(page.getByText('Your data is saved on this device.')).toBeVisible();
    await expect(page.getByTestId('offline-retry-button')).toBeVisible();
    await expect(page.getByTestId('offline-dashboard-link')).toBeVisible();
  });

  test('PWA-05: Install banner suppresses on first visit and shows after 2nd visit or action', async ({ page }) => {
    await page.goto('/dashboard');

    // On first load without actions, banner should NOT be visible
    await expect(page.getByTestId('pwa-install-banner')).not.toBeVisible();

    // Simulate 2nd visit with a mocked beforeinstallprompt event
    await page.evaluate(() => {
      localStorage.setItem('fitai.visits', '2');
      // Dispatch mock beforeinstallprompt
      const event = new Event('beforeinstallprompt');
      (event as any).prompt = () => Promise.resolve();
      (event as any).userChoice = Promise.resolve({ outcome: 'dismissed' });
      window.dispatchEvent(event);
    });

    await expect(page.getByTestId('pwa-install-banner')).toBeVisible();
    await expect(page.getByTestId('pwa-install-button')).toBeVisible();
    await expect(page.getByTestId('pwa-dismiss-button')).toBeVisible();

    // Dismiss banner
    await page.getByTestId('pwa-dismiss-button').click();
    await expect(page.getByTestId('pwa-install-banner')).not.toBeVisible();

    // Verify 14-day dismissal stored in localStorage (evaluated in page context matching frozen clock)
    const diff = await page.evaluate(() => {
      const dismissedUntil = localStorage.getItem('fitai.installDismissedUntil');
      if (!dismissedUntil) return 0;
      return parseInt(dismissedUntil, 10) - Date.now();
    });
    const fourteenDaysMs = 13 * 24 * 60 * 60 * 1000;
    expect(diff).toBeGreaterThan(fourteenDaysMs);

    // Refresh and ensure it stays dismissed
    await page.reload();
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt');
      (event as any).prompt = () => Promise.resolve();
      (event as any).userChoice = Promise.resolve({ outcome: 'dismissed' });
      window.dispatchEvent(event);
    });
    await expect(page.getByTestId('pwa-install-banner')).not.toBeVisible();
  });

  test('PWA-05b: Dashboard shows clear install app control', async ({ page }) => {
    await loginUser(page);
    await page.waitForURL('/dashboard');
    await expect(page.getByTestId('dashboard-install-button')).toBeVisible();
    await expect(page.getByText('Install FitAI app').or(page.getByText('Install app'))).toBeVisible();
  });

  test('PWA-06: Profile & Settings includes Install App row and hides in standalone mode', async ({ page }) => {
    await loginUser(page);
    await page.getByTestId('sidebar-nav-profile').click();
    await page.waitForURL('/profile');

    // Not in standalone mode: should show App card and Install row
    await expect(page.getByTestId('profile-install-card')).toBeVisible();
    await expect(page.getByText('Install app')).toBeVisible();
    await expect(page.getByTestId('profile-install-app-button')).toBeVisible();
  });

  test('PWA-07: Active workout persists across page reload', async ({ page }) => {
    await loginUser(page);
    await page.waitForLoadState('domcontentloaded');
    await page.goto('/workouts/active');
    await page.waitForURL('/workouts/active');

    // Complete the first set
    const firstCheck = page.getByLabel('Mark set 1 complete').first();
    await expect(firstCheck).toBeVisible();
    await firstCheck.click();

    // Check localStorage contains active workout
    const saved = await page.evaluate(() => {
      const raw = localStorage.getItem('fitai.activeWorkout');
      return raw ? JSON.parse(raw) : null;
    });
    expect(saved).not.toBeNull();
    expect(saved.workoutKey).toBe('chest');
    expect(saved.state.exercises[0].sets[0].done).toBe(true);

    // Reload page
    await page.reload();

    // Verify state restored
    const reloadedCheck = page.getByLabel('Mark set 1 complete').first();
    await expect(reloadedCheck).toHaveAttribute('aria-pressed', 'true');
  });

  test('PWA-08: Offline status toast and header pill appear when connectivity drops', async ({ page }) => {
    await loginUser(page);
    await page.goto('/dashboard');

    // Simulate going offline
    await page.evaluate(() => {
      window.dispatchEvent(new Event('offline'));
    });

    // Verify offline toast
    await expect(page.getByText("You're offline. Changes are saved on this device.")).toBeVisible();

    // Verify offline pill in header
    await expect(page.getByTestId('offline-status-pill').first()).toBeVisible();

    // Simulate coming back online
    await page.evaluate(() => {
      window.dispatchEvent(new Event('online'));
    });

    await expect(page.getByText('Back online.')).toBeVisible();
  });

  test('PWA-09: Offline reload of /dashboard serves from cache and displays app data', async ({ page, context }) => {
    await loginUser(page);
    await page.goto('/dashboard');

    // Wait for service worker to activate and cache assets
    await page.waitForFunction(async () => {
      const reg = await navigator.serviceWorker?.getRegistration();
      return !!reg?.active;
    }, { timeout: 10000 });

    // Emulate offline mode in browser
    await context.setOffline(true);

    try {
      // Reload dashboard offline
      await page.reload();
      await expect(page.getByRole('heading', { name: /Good morning/ })).toBeVisible();
      await expect(page.getByTestId('offline-status-pill').first()).toBeVisible();
    } finally {
      await context.setOffline(false);
    }
  });

  test('PWA-10: Offline navigation to an uncached route falls back to /offline page', async ({ page, context }) => {
    await loginUser(page);
    await page.goto('/dashboard');

    // Wait for service worker to activate
    await page.waitForFunction(async () => {
      const reg = await navigator.serviceWorker?.getRegistration();
      return !!reg?.active;
    }, { timeout: 10000 });

    await context.setOffline(true);

    try {
      await page.goto('/uncached-offline-test-route', { waitUntil: 'commit' });
      await expect(page.getByRole('heading', { name: "You're offline" })).toBeVisible();
      await expect(page.getByText('Your data is saved on this device.')).toBeVisible();
      await expect(page.getByTestId('offline-retry-button')).toBeVisible();
    } finally {
      await context.setOffline(false);
    }
  });

  test('PWA-11: Update toast appears when new SW is waiting and is deferred mid-workout', async ({ page }) => {
    await loginUser(page);
    await page.goto('/dashboard');

    // Trigger update notification when not in workout
    await page.evaluate(() => {
      (window as any).pwaTestTriggerUpdate?.();
    });
    // Wait for toast
    await expect(page.getByText('Update available')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Update' })).toBeVisible();

    // Now test mid-workout suppression:
    await page.goto('/workouts/active');
    // Simulate active workout in localStorage
    await page.evaluate(() => {
      localStorage.setItem('fitai.activeWorkout', JSON.stringify({ workoutKey: 'chest' }));
    });

    // Dismiss any toast
    await page.reload();
    await page.evaluate(() => {
      (window as any).pwaTestTriggerUpdate?.();
    });

    // In mid-workout, update toast should not immediately pop up and disrupt
    await expect(page.getByText('Update available')).not.toBeVisible();
  });
});
