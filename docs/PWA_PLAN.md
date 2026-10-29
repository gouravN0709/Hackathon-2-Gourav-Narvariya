# FitAI PWA Implementation Plan & Guide

This document details the architecture, design tokens, components, caching strategies, and verification workflows for adding Progressive Web App (PWA) support to FitAI.

## 1. Objectives & Principles

- **Zero visual regression**: Strictly preserve FitAI Brand OS tokens, colors (`#0B0B0D` canvas, `#C6FF3D` lime hero accent, `#A78BFA` violet AI/tip accents), typography (Sora + DM Sans), and iconography.
- **Frontend only**: No backend, no push notifications, no background sync. All state persists in `localStorage`.
- **First-class offline experience**: Every core screen (Dashboard, Workouts, Nutrition, Progress, Coach chat, Profile) operates seamlessly without a network connection.
- **Robust Service Worker**: A lean, reliable, hand-written Service Worker built with native Cache Storage API, fully compatible with Next.js 16.4 Turbopack.
- **Unobtrusive install UX**: Never prompt on first visit; show on-brand banners only after user engagement (2nd visit or after 1st action); respect 14-day dismissal.
- **Workout safety**: Never reload or interrupt an in-progress workout for service worker updates; persist active workout state across reloads.

---

## 2. What Was Built

### 2.1 Web App Manifest (`src/app/manifest.ts`)
Next.js App Router route handler providing dynamic metadata manifest at `/manifest.webmanifest`.
- **Name**: `FitAI`
- **Short Name**: `FitAI`
- **Description**: `Your Fitness. Your Data. Your AI Coach.`
- **Display**: `standalone`
- **Start URL**: `/dashboard`
- **Scope**: `/`
- **Orientation**: `portrait-primary`
- **Colors**:
  - `background_color`: `#0B0B0D`
  - `theme_color`: `#0B0B0D`
- **Categories**: `["health", "fitness"]`
- **Shortcuts**:
  1. `Log food` → `/nutrition/add`
  2. `Start workout` → `/workouts/details`
  3. `Log weight` → `/progress`
  4. `Ask Nova` → `/coach`
- **Icons**:
  - `192x192` PNG (`/icons/icon-192x192.png`, purpose: `any`)
  - `512x512` PNG (`/icons/icon-512x512.png`, purpose: `any`)
  - `512x512` PNG maskable (`/icons/icon-maskable-512x512.png`, purpose: `maskable`, lime `#C6FF3D` bolt inside 80% safe zone over `#0B0B0D`)
  - `180x180` Apple Touch Icon (`/icons/apple-touch-icon.png`)
  - Favicons: `/favicon.ico` and `/icons/favicon.svg`
- **Icon Generation**:
  - Built generator script `scripts/generate-icons.js` using Playwright headless Chromium to render pixel-crisp PNG assets directly into `public/icons/`.

### 2.2 Metadata & Mobile Polish (`src/app/layout.tsx`, `src/app/globals.css`)
- **Viewport**: `width=device-width, initial-scale=1, viewport-fit=cover, themeColor #0B0B0D, colorScheme dark`.
- **Apple Metadata**: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style black-translucent`, `apple-mobile-web-app-title FitAI`, and iOS splash images.
- **Safe Area Insets**: Handled via `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` in `safe-bottom`, `safe-top`, and `safe-top-nav`.
- **Overscroll & Selection**: Disabled pull-to-refresh rubber-banding on standalone mode via `overscroll-behavior-y: none; user-select: none;` on controls, while preserving full selectable text on `.chat-bubble`, `role="log"`, and form inputs.

### 2.3 Service Worker (`public/sw.js`, `src/lib/pwa/pwaManager.ts`)
- **App Shell Precache**: Automatically precaches `/dashboard`, `/workouts`, `/workouts/details`, `/workouts/active`, `/nutrition`, `/nutrition/add`, `/coach`, `/progress`, `/profile`, `/login`, `/onboarding`, `/offline`, icons, and extracted `_next/static` bundles.
- **Caching Strategies**:
  1. Static assets & fonts (`/_next/static/*`, `/fonts/*`, `/icons/*`): Cache-First.
  2. Navigation / HTML pages (`request.mode === 'navigate'`): Network-First with cache fallback, defaulting to `/offline` for uncached routes.
  3. Images (`.png`, `.svg`, `.webp`, `.jpg`): Stale-While-Revalidate.
  4. API calls (`/api/*`): Network-only (no caching).
- **Development Guard**: Service worker registration is disabled in `NODE_ENV === 'development'`.
- **Skip Waiting**: Listens for `{ type: 'SKIP_WAITING' }` and triggers `self.skipWaiting()`.

### 2.4 Offline Fallback Screen (`src/app/offline/page.tsx`)
- On-brand offline screen using Brand OS tokens (`#0B0B0D` surface, `#151518` card, `#C6FF3D` bolt logo).
- Clear copy: "You're offline. Your data is saved on this device."
- Actions: "Retry" button (checks connectivity and reloads) + "Go to dashboard" ghost link.

### 2.5 Install UX (`src/components/pwa/InstallBanner.tsx`)
- Appears only when:
  - Not running in standalone mode.
  - Visited at least 2 times OR completed at least 1 user action (never on first load).
  - Not dismissed within 14 days (`fitai.installDismissedUntil`).
- On Chrome/Android/Desktop: Shows "Install FitAI" + "Not now" button.
- On iOS Safari: Shows custom instructions banner: "Tap Share, then Add to Home Screen" with share icon.
- Profile & Settings: Dedicated "Install app" card in `ProfileSettings.tsx` (hidden in standalone mode or once installed).

### 2.6 Offline Indicators & Safe Workout Update Flow
- **Connectivity Changes**: Dispatches toast on offline ("You're offline. Changes are saved on this device.") and online ("Back online.").
- **Header Pill**: Displays subtle `Offline` pill in the mobile and desktop headers while offline.
- **Update Flow**: Shows "Update available" toast with "Update" action button.
- **Mid-Workout Protection**: Defer update prompt while workout is in progress; never reload mid-workout.
- **Active Workout Persistence**: Active workout state in `ActiveWorkout.tsx` persists to `localStorage` under `fitai.activeWorkout`, allowing the app to be closed/reopened without losing sets or elapsed time.

---

## 3. How to Test Installation

### 3.1 On Android (Chrome)
1. Build and start the production app (`npm run build && npm run start`).
2. Connect your Android device via USB, or open Chrome on your Android phone pointing to the local network IP or deployed HTTPS domain.
3. Open Chrome DevTools on desktop (`chrome://inspect/#devices`) to inspect the device if desired.
4. Interact with the app (e.g. log a weight or meal, or visit twice).
5. Verify that the install banner appears: "Install FitAI". Tap "Install FitAI" to trigger the native installation prompt.
6. Alternatively, open Chrome's 3-dot menu and tap **Install app** or **Add to Home screen**.
7. Close Chrome and open FitAI from the home screen / app drawer:
   - Verify it launches in full-screen standalone mode without browser URL bars.
   - Verify splash screen displays with the electric lime bolt logo on `#0B0B0D`.
   - Toggle Airplane Mode: verify dashboard and all logged data are accessible.

### 3.2 On iOS (Safari)
1. Open Safari on an iPhone and navigate to the FitAI URL.
2. Complete an action (or visit a second time).
3. The on-brand install banner will instruct: "Tap Share, then Add to Home Screen".
4. Tap the Safari Share button (box with upward arrow) in the bottom navigation bar.
5. Scroll and tap **Add to Home Screen**.
6. Confirm the title "FitAI" and tap **Add**.
7. Open FitAI from your iOS home screen:
   - Verify standalone presentation with black-translucent status bar.
   - Verify notch and bottom home indicator safe areas are respected.
   - Test rotation to landscape.
   - Enable Airplane Mode, kill the app from multitasking, and reopen: verify the app loads instantly from cache.

### 3.3 Desktop Chrome DevTools Verification
1. Open DevTools > **Application** tab:
   - **Manifest**: Check that name, icons, start_url, and display: standalone are reported valid with no warnings.
   - **Service Workers**: Verify `/sw.js` is registered, active, and running.
   - **Cache Storage**: Inspect `fitai-static-v1`, `fitai-pages-v1`, and `fitai-images-v1`.
2. Toggle "Offline" under Application > Service Workers or Network tab:
   - Verify the `Offline` header pill appears.
   - Refresh the page: verify the dashboard loads from cache without network errors.
   - Navigate to `/unknown-route`: verify the `/offline` fallback page appears.

---

## 4. How to Bump the Cache Version on Release

When publishing a major release with updated asset structures or cache invalidation requirements:

1. Open `public/sw.js`.
2. Update the `CACHE_VERSION` constant:
   ```js
   const CACHE_VERSION = 'v2'; // Increment from v1 -> v2
   ```
3. Rebuild the application:
   ```bash
   npm run build
   ```
4. On deployment:
   - Clients will automatically detect the byte difference in `sw.js`.
   - The new Service Worker will install in the background and enter `waiting` state.
   - The app will display an "Update available" toast with an "Update" button.
   - Once activated, the new worker automatically purges all obsolete `fitai-*-v1` caches in the `activate` event.

---

## 5. Browser Limitations & Platform Quirks

1. **iOS Safari `beforeinstallprompt`**:
   - iOS Safari does not support the `beforeinstallprompt` API or programmatic install prompts.
   - **Solution**: FitAI detects iOS Safari and displays contextual instructions guiding the user to tap the Safari Share icon and select "Add to Home Screen".
2. **iOS Standalone Storage Partitioning**:
   - In iOS versions prior to 17, localStorage in Safari and in Standalone Web Apps were sometimes isolated. FitAI persists state before transition and rehydrates store state cleanly.
3. **Desktop Manifest Orientation**:
   - While `orientation: "portrait-primary"` is set in manifest for mobile devices, desktop browsers gracefully ignore orientation locking and permit flexible window resizing.
4. **Push Notifications & Background Sync**:
   - Intentionally omitted per requirements (frontend-only architecture).

---

## 6. Verification Summary

| Suite / Check | Command | Status | Notes |
|---|---|---|---|
| TypeScript Typecheck | `npx tsc --noEmit` | **PASS (0 errors)** | Full type safety across manifest, PWA store, and components |
| ESLint Rules | `npm run lint` | **PASS (0 errors)** | Zero linting errors or warnings |
| Unit Tests | `npm run test:unit` | **PASS (57/57)** | All store, selector, format, and UI component tests passing |
| PWA E2E Tests | `npx playwright test tests/e2e/pwa.spec.ts` | **PASS (11/11)** | Manifest, SW registration, offline dashboard, offline fallback, install banner, 14-day dismissal, profile install row, active workout persistence, and offline toasts |
| Core E2E Tests | `npx playwright test tests/e2e/dashboard.spec.ts tests/e2e/workouts.spec.ts tests/e2e/nutrition.spec.ts` | **PASS (34/34)** | Zero regressions across existing user journeys |
| Lighthouse CI | `npm run test:lighthouse` | **PASS (All assertions)** | PWA installability, best practices, and accessibility assertions met |
