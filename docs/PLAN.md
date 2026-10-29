# FitAI frontend — build plan

Source of truth: `FitAI-design-export/` (`project/*.dc.html`, `fitai-store.js`, `screenshots/`).
Stack: Next.js 16 App Router · React 19 · TypeScript strict · Tailwind v4 (`@theme` tokens in `globals.css`) · Zustand (persisted) · hand-built SVG charts.

## Routes

| URL | File | Shell | Source |
|---|---|---|---|
| `/` | `app/page.tsx` | – | redirect to `/dashboard` or `/login` |
| `/login` | `app/(auth)/login/page.tsx` | auth split | `Login.dc.html` |
| `/onboarding` | `app/(auth)/onboarding/page.tsx` | auth split (guarded) | `Onboarding.dc.html` |
| `/dashboard` | `app/(app)/dashboard/page.tsx` | sidebar / tab bar | `Main.dc.html`, `Mobile.dc.html` |
| `/coach` | `app/(app)/coach/page.tsx` | sidebar / tab bar | `Coach.dc.html` |
| `/workouts` | `app/(app)/workouts/page.tsx` | sidebar / tab bar | `Workouts.dc.html` |
| `/workouts/details` | `app/(app)/workouts/details/page.tsx` | sidebar / tab bar | `WorkoutDetails.dc.html` |
| `/workouts/active` | `app/(focus)/workouts/active/page.tsx` | full-screen (no sidebar, as in the design) | `ActiveWorkout.dc.html` |
| `/nutrition` | `app/(app)/nutrition/page.tsx` | sidebar / tab bar | `Nutrition.dc.html` |
| `/nutrition/add` | `app/(app)/nutrition/add/page.tsx` | sidebar / tab bar | `FoodSearch.dc.html` |
| `/progress` | `app/(app)/progress/page.tsx` | sidebar / tab bar | `Progress.dc.html` |
| `/profile` | `app/(app)/profile/page.tsx` | sidebar / tab bar | `Profile.dc.html` |

`(app)` and `(focus)` layouts both wrap children in `AuthGuard` (redirects to `/login` once the store has hydrated and the user is signed out).

## Component tree

```
RootLayout (fonts, globals, StoreHydrator)
├─ (auth) AuthSplit → BrandPanel + form column
├─ (app)  AuthGuard → AppShell → Sidebar (≥820) | MobileTopBar + MobileTabBar (<820) → page
└─ (focus) AuthGuard → page
components/ui        Button Pill Card SegmentedControl ProgressBar Ring Field Label Toggle Alert Eyebrow Placeholder Icon StatusText Modal Toast FeedbackModal NumberStat
components/charts    WeightChart ConsistencyBars CalorieTrend MacroSplitBar StrengthRow
components/layout    Sidebar MobileTabBar MobileTopBar PageHeader BackLink AuthGuard AppShell
components/features  auth/ dashboard/ coach/ workouts/ nutrition/ progress/ profile/
```

## Store (`lib/store.ts`, key `fitai.state.v2`, version 2)

```ts
{ v: 2, auth: boolean,
  user: User, weights: Record<ISODate, number>, sessions: Session[], lifts: Record<LiftId, Record<ISODate, number>>,
  meals: Record<MealKey, FoodEntry[]>, nutritionHistory: Record<ISODate, {k, p}>, chat: ChatMessage[],
  ui: { meal, flash, tab, workoutDay, extras, routines, tipDismissed, sidebarCollapsed } }
```

Actions (ported from `fitai-store.js`): `addFood removeFood setUI takeFlash logWeight pushChat saveSession saveUser reset`
plus `signIn signOut deleteAccount`.
Selectors (pure, `lib/selectors.ts`): `totals latestWeight weightSeries goalPct stats sessionsThisWeek bars lifts chart dayInfo week today calcTargets avgIntake calorieSeries`.
Mock AI: `lib/reply.ts` (same keyword rules as the source, reads live state).

Hydration: persist uses `skipHydration`; `StoreHydrator` rehydrates on mount and flips `hydrated`. Guarded pages render a skeleton until then, so server and first client render always match.
`TODAY = '2026-10-15'` lives in `lib/date.ts`.
