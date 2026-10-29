# FitAI PWA Implementation Plan

This document details the architecture, design tokens, components, caching strategies, and verification workflows for adding Progressive Web App (PWA) support to FitAI.

## 1. Objectives & Principles

- **Zero visual regression**: Strictly preserve FitAI Brand OS tokens, colors (`#0B0B0D` canvas, `#C6FF3D` lime hero accent, `#A78BFA` violet AI/tip accents), typography (Sora + DM Sans), and iconography.
- **Frontend only**: No backend, no push notifications, no background sync. All state persists in `localStorage`.
- **First-class offline experience**: Every core screen (Dashboard, Workouts, Nutrition, Progress, Coach chat, Profile) operates seamlessly without a network connection.
- **Robust Service Worker**: A lean, reliable, hand-written Service Worker built with native Cache Storage API, fully compatible with Next.js 16.4 Turbopack.
- **Unobtrusive install UX**: Never prompt on first visit; show on-brand banners only after user engagement (2nd visit or after 1st action); respect 14-day dismissal.
- **Workout safety**: Never reload or interrupt an in-progress workout for service worker updates; persist active workout state across reloads.

---

## 2. Web App Manifest (`src/app/manifest.ts`)

Next.js App Router route handler providing dynamic metadata manifest.

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
  - Single SVG master source: FitAI bolt path `M13 2L4 14h7l-1 8 9-12h-7z` on dark `#0B0B0D` tile.
  - Script using Playwright headless Chromium to render pixel-crisp PNG assets directly into `public/icons/`.

---

## 3. Metadata & Mobile Polish (`src/app/layout.tsx`, `src/app/globals.css`)

### Layout Metadata & Viewport
- `viewport`:
  - `width`: `device-width`
  - `initialScale`: `1`
  - `viewportFit`: `cover`
  - `themeColor`: `#0B0B0D`
  - `colorScheme`: `dark`
- `appleWebApp`:
  - `capable`: `true`
  - `statusBarStyle`: `black-translucent`
  - `title`: `FitAI`
- Splash Screens:
  - Documented fallbacks and startup links with standard iOS device dimensions.

### Safe Areas & Standalone Polish
- Ensure `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` are respected in `MobileTabBar`, `MobileTopBar`, headers, and focus layouts.
- Standalone CSS behavior:
  - Prevent pull-to-refresh overscroll bounce on mobile standalone mode: `overscroll-behavior-y: none` on `body`.
  - Prevent accidental text selection on controls/buttons in standalone mode while preserving selectable text in chat messages (`.chat-bubble`) and form inputs.

---

## 4. Service Worker Architecture (`public/sw.js`, `src/lib/pwa/*`)

Built as a lightweight, robust, native Service Worker with zero runtime bundle dependencies.

### Cache Versioning
- Version identifier: `fitai-v1`
- Caches:
  - `fitai-static-v1`: JS bundles, CSS, fonts, SVG icons, app shell assets
  - `fitai-pages-v1`: HTML navigation routes
  - `fitai-images-v1`: Icons and static media assets

### Caching Strategies
1. **Static Assets & Fonts** (`/_next/static/*`, `/fonts/*`, `/icons/*`):
   - **Cache-First**: Serve from cache if available; otherwise fetch from network and store in `fitai-static-v1`.
2. **Navigation / Pages** (`request.mode === 'navigate'`):
   - **Network-First with Cache Fallback**: Attempt network fetch with a 3-second timeout; if successful, update `fitai-pages-v1`; if offline or failed, return cached page; if the page was never visited, return cached `/offline` page.
3. **Images** (`request.destination === 'image'`):
   - **Stale-While-Revalidate**: Return cached image immediately while fetching an update in the background.
4. **API / External Calls**:
   - Network-only (no caching).
5. **Lifecycle Management**:
   - `install`: Precache shell routes (`/dashboard`, `/workouts`, `/workouts/details`, `/workouts/active`, `/nutrition`, `/nutrition/add`, `/coach`, `/progress`, `/profile`, `/login`, `/offline`), core icons, and fonts.
   - `activate`: Delete old caches not matching current version (`fitai-*-v1`).
   - `message`: Handle `{ type: 'SKIP_WAITING' }` to trigger `self.skipWaiting()`.

### Development Mode
- Service worker registration is disabled in `NODE_ENV === 'development'` to prevent stale code caching during development.

---

## 5. Offline Fallback Page (`src/app/offline/page.tsx`)

A dedicated offline fallback page styled strictly with FitAI Brand OS tokens:
- Headline: "You're offline"
- Copy: "Your data is saved on this device."
- Actions:
  - Primary button: "Retry" (checks connectivity and reloads)
  - Secondary ghost button: "Go to dashboard" (routes to cached `/dashboard`)
- Background: `#0B0B0D`, card surface `#151518`, lime accent.

---

## 6. Install Experience (`src/components/pwa/InstallBanner.tsx`)

### Trigger Rules
- **Never on first load**: Requires user engagement before displaying.
- Conditions to display:
  - App is not running in standalone mode (`(display-mode: standalone)` is false).
  - User has visited at least 2 times (`fitai.visits >= 2`) OR completed at least 1 action (logged food, logged weight, completed set, or sent chat message).
  - User has not dismissed the banner within the last 14 days (`fitai.installDismissedUntil`).
- **Dismissal**:
  - Clicking "Not now" stores a timestamp 14 days in the future in `localStorage`.

### UI Design (per BRAND_OS)
- Matches violet tip banner tokens (`border border-violet-line bg-violet-tint p-4 rounded-[14px]`).
- Desktop / Android (supports `beforeinstallprompt`):
  - "Install FitAI" lime button calls `prompt()`.
  - "Not now" ghost button dismisses for 14 days.
- iOS Safari (no `beforeinstallprompt`):
  - Shows instructions: "Tap Share, then Add to Home Screen" with a share icon.
- Profile & Settings:
  - "Install app" row in Profile & Settings (hidden in standalone mode or once installed).

---

## 7. Offline Indicators & Update Flow

### Online / Offline Indicator
- Subscribed to `online` and `offline` browser events.
- Toast notifications:
  - On offline: `"You're offline. Changes are saved on this device."`
  - On online: `"Back online."`
- Header pill:
  - A subtle `Offline` status badge appears in the mobile and desktop headers while offline.

### Update Flow
- Service worker updates are tracked via `registration.onupdatefound` and `registration.waiting`.
- When an update is ready:
  - Check whether an Active Workout is currently running.
  - If mid-workout: defer prompt until workout is saved or exited.
  - Otherwise: show an on-brand toast `"Update available"` with an `"Update"` action button.
  - Clicking `"Update"` posts `{ type: 'SKIP_WAITING' }` to the waiting worker and reloads once the new worker takes control.

### Active Workout Persistence
- Active workout state in `ActiveWorkout.tsx` is automatically synchronized to `localStorage` under key `fitai.activeWorkout`:
  - `{ workoutKey, state, elapsed, restTimeLeft, timestamp }`
  - On page reload / app relaunch, if an active session exists for today, the state is seamlessly restored.
  - On workout save or exit, `fitai.activeWorkout` is cleared.

---

## 8. Verification & Test Plan

1. **Unit & Component Tests**:
   - `InstallBanner` rendering, dismissal persistence in `localStorage`, 14-day calculation.
   - PWA state hooks (`usePWA`, `useOnlineStatus`).
   - Active workout persistence and restore logic.
2. **Playwright E2E Tests** (`tests/e2e/pwa.spec.ts`):
   - Manifest endpoint returns 200, valid JSON, correct metadata, shortcuts, icons.
   - Service worker registers successfully in production build.
   - Offline simulation: reload cached `/dashboard` renders cleanly.
   - Uncached route while offline falls back to `/offline` page.
   - Install banner suppression on first visit and appearance on second visit.
   - 14-day dismissal persistence in `localStorage`.
   - Update toast triggers and respects active workout.
3. **Quality Gates**:
   - `npm run lint` (0 errors)
   - `npm run test:unit` (all pass)
   - `npm run test:e2e` (all pass)
   - `npm run build` (successful production build)
   - Lighthouse PWA / accessibility checks.
