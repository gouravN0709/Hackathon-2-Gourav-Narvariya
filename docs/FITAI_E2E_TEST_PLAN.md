# FitAI Frontend: End-to-End Test Plan

Scope: the Next.js frontend only (mock data, React state, localStorage). No backend, real AI or payments yet. Source of truth: `design/` screenshots, `docs/BRAND_OS.md`, and the build spec (FITAI_MASTER_PROMPT.md).

## 1. Goals and exit criteria

Release-ready means all of these are true:
- 100% of P0 and P1 test cases below pass; no open P0/P1 bugs.
- Every screen matches its reference screenshot (visual diff within tolerance) at 1440, 820 and 390 px.
- Data is consistent across all screens after any user action.
- No console errors/warnings, no hydration errors, no horizontal scroll at any tested width.
- Lighthouse >= 90 (performance, accessibility, best practices); axe: zero serious/critical violations.
- `npm run lint`, `tsc --noEmit` and `npm run build` pass.

Priority: P0 = blocks a core flow, P1 = major feature wrong, P2 = visual/minor, P3 = polish.

## 2. Test environments

| Area | Coverage |
|---|---|
| Browsers | Chrome (latest), Safari (latest, incl. iOS Safari), Firefox (latest), Edge |
| Viewports | 320, 390 (iPhone), 768/820 (tablet), 1024, 1440 (design baseline), 1920 |
| Devices (real) | 1 iPhone, 1 Android phone, 1 tablet |
| Settings | Reduced motion on/off, browser zoom 100/125/150%, slow 4G + 4x CPU throttle |
| Storage | Clean localStorage, seeded localStorage, corrupted localStorage, storage disabled |

## 3. Tooling

| Layer | Tool |
|---|---|
| Unit (store, selectors, mock AI, validators, calculations) | Vitest |
| Component | React Testing Library |
| End to end + cross-browser + mobile emulation | Playwright |
| Visual regression vs screenshots | Playwright `toHaveScreenshot` (per screen, per width) |
| Accessibility | axe-core via `@axe-core/playwright`, plus manual screen reader pass |
| Performance | Lighthouse CI |
| Manual exploratory | Checklist in section 12 |

Add `data-testid` on key controls (nav items, primary buttons, form fields, charts, toasts). Freeze time to `2026-10-15` in tests (app TODAY constant) and reset storage before each test.

## 4. Test data (seed, must hold at first load)

- User: Alex Morgan, alex.morgan@email.com, 28 y, 178 cm, goal Muscle gain, goal weight 80 kg, vegetarian, targets 2,400 kcal / 160 g protein / 280 g carbs / 72 g fats.
- Today (Thu 15 Oct 2026): Chest & Triceps, planned, 6 exercises, 58 min, ~420 kcal.
- Totals: 1,640 kcal (68%), protein 112 g (70%), carbs 168 g, fats 48 g, 760 kcal left, 48 g protein short.
- Weight: 76.4 kg, goal progress 55%, 3.6 kg to go, +1.5 kg over 30 days.
- Sessions this week: 2 of 4 done (Mon back, Tue legs). Bench top set history 65 -> 70 kg.
- Dinner empty. Valid login: any valid email + password with 8+ characters.

## 5. Test layers

1. **Unit**: store actions and selectors (addFood, removeFood, logWeight, saveSession, saveUser, pushChat, totals, goalPct, chart data, calcTargets, reply), validators, formatters.
2. **Component**: Button, Field errors, SegmentedControl, SetRow steppers, ProgressBar/Ring values, Toast with Undo, Modal focus trap.
3. **E2E**: user journeys (section 7) and screen-level cases (section 6).
4. **Cross-cutting**: consistency, persistence, responsive, a11y, motion, performance, visual (sections 8-11).

## 6. Screen-level test cases

IDs are prefixed by screen. Each case: steps -> expected result.

### 6.1 Auth: Login / Sign up (AUTH)
- AUTH-01 (P0) Load `/` signed out -> redirects to `/login`.
- AUTH-02 (P0) Log in with valid email + 8+ char password -> loading state ("Logging in…", button disabled) -> success screen "Welcome back, Alex!" -> "Go to dashboard" opens `/dashboard`.
- AUTH-03 (P0) Sign up with name, email, password, terms checked -> "Account created" -> "Set up my profile" opens `/onboarding`.
- AUTH-04 (P1) Validation messages exactly as spec: empty name (signup), invalid email, short password (different text for login vs signup), terms unchecked. Offending field gets red border; focus moves to it.
- AUTH-05 (P1) Show/Hide password toggles; Enter submits; tab order logical.
- AUTH-06 (P1) Forgot password: invalid email -> prompt text; valid email -> "Reset link sent to <email>".
- AUTH-07 (P1) Tab switch Log in/Sign up keeps email, clears errors, shows/hides name + terms.
- AUTH-08 (P1) Route guard: signed out user opening `/dashboard`, `/progress` etc. -> `/login`; signed in user opening `/login` -> `/dashboard`.
- AUTH-09 (P2) Mobile (390): brand panel stacks, no horizontal scroll, keyboard does not cover the CTA.

### 6.2 Onboarding (ONB)
- ONB-01 (P0) Five steps navigate Next/Back; "Step n of 5" and progress update; answers kept when going back.
- ONB-02 (P1) Step 1 validation: age, height, weight empty / out of range -> inline errors, cannot continue.
- ONB-03 (P1) Goal, experience, diet cards are single-select with selected style; Next disabled or errors if none.
- ONB-04 (P0) Review shows entered answers plus computed daily calories and protein; values change with goal/weight.
- ONB-05 (P0) Finish -> "Nova is building your plan…" loader -> "Your plan is ready!" -> "Go to my dashboard" -> dashboard shows the entered name, goal, weight, targets.
- ONB-06 (P2) Refresh mid-flow keeps progress (or restarts cleanly, as designed); no crash.

### 6.3 Dashboard (DASH)
- DASH-01 (P0) Seed values: greeting "Good morning, Alex!", date "THURSDAY, OCT 15", calories ring 68% and "1,640 of 2,400 · 760 left", protein 112/160 (70%), weight 76.4 -> 80 (55%, 3.6 kg to go), "+1.5 kg / 30d", workout "Planned", 2 of 4 session segments filled.
- DASH-02 (P1) Tip banner shows on first visit; "Got it" dismisses and stays dismissed after refresh.
- DASH-03 (P0) Quick actions: Log Weight -> Progress, Log Food -> Food Search, Start Workout -> Workout Details (today), Ask AI -> Coach.
- DASH-04 (P0) Each summary card links to its screen (Nutrition, Workouts, Progress); goal chip and avatar -> Profile.
- DASH-05 (P1) Weight chart: 7/30-day toggle re-renders data, y-axis labels and subtitle delta; tooltip shows date + value; last point highlighted.
- DASH-06 (P1) Nutrition card macro bar and rows match totals; "Log Food" opens Food Search.
- DASH-07 (P1) AI Coach card text and two insights are computed from data (protein gap 48 g, bench +5 kg).
- DASH-08 (P1) After saving a workout the card shows Completed state and CTA "Completed · See progress"; segments show 3 of 4.
- DASH-09 (P2) Layout reflows 4 -> 2 -> 1 columns; mobile matches the mobile dashboard reference with bottom tab bar.

### 6.4 Workouts (WK) incl. Details and Active Workout
Planner (`/workouts`)
- WK-01 (P0) Week strip shows Mon 12 to Sun 18 with statuses: Mon/Tue Done, Thu Today, Fri Planned, others Rest; selecting a day updates the detail panel.
- WK-02 (P1) "Open workout" / header CTA goes to Workout Details for the selected / today's day.
- WK-03 (P1) Regenerate plan: loading -> "Plan refreshed" confirmation; data remains valid.
- WK-04 (P1) Muscle group browse lists the correct exercises and counts.
- WK-05 (P1) Custom routines: open form, empty name error, duplicate name error, save adds to list, persists after refresh; empty state text when none.
- WK-06 (P2) Rest day panel shows recovery message and no Start button.

Details (`/workouts/details`)
- WK-10 (P0) Shows name, meta (minutes, exercises, sets, kcal), focus chips, numbered exercises with Sets/Reps/Weight/Rest and tips.
- WK-11 (P1) States: today (Start enabled), completed (Completed + See progress), future (scheduled message, no Start), missed message, rest day empty state.
- WK-12 (P1) Add exercise picker: add -> appears in list; already-added items hidden; "All suggested…" when none left; persists.
- WK-13 (P1) Start Workout opens Active Workout including added exercises.

Active (`/workouts/active`)
- WK-20 (P0) Timer starts and ticks; header pills show sets done / total and volume.
- WK-21 (P0) Steppers change kg (by exercise step, BW shows "BW") and reps; values never go negative.
- WK-22 (P0) Check a set -> row turns done, counters and volume update; uncheck reverses.
- WK-23 (P1) Errors: 0 reps on check, Complete exercise with 0-rep set, Finish with 0 sets done -> exact messages.
- WK-24 (P1) "+ Add set" copies the last set; "Complete exercise" marks all done and advances; rail shows done marks and progress.
- WK-25 (P1) Rest timer ring runs after a set and can be skipped.
- WK-26 (P0) Finish & save -> "Saving…" -> success ("Session saved. Nice work, Alex!", sets, volume, minutes) with Back to dashboard / See progress / Log post-workout meal.
- WK-27 (P0) After save: dashboard shows Completed + 3 of 4; workouts calendar marks Today Done; Progress consistency and strength update; Coach status says Completed.
- WK-28 (P1) Re-opening Active Workout after completion shows "already complete"; on a rest day shows "No workout scheduled".
- WK-29 (P2) Leaving mid-workout: warns or preserves state as designed.

### 6.5 Nutrition and Food Search (NUT)
- NUT-01 (P0) Seed totals and remaining calories/protein; four meal cards; Dinner empty state with hint.
- NUT-02 (P0) AI suggestion "Add to Dinner" adds the item, updates totals, rings, dashboard; toast appears; button changes to added state.
- NUT-03 (P1) Remove an item -> totals update; Undo toast restores it.
- NUT-04 (P0) Food Search: typing filters results live (name and category, case-insensitive); category chips filter; no-match state with "Add as custom food" (prefills name, switches tab).
- NUT-05 (P0) Select food -> detail panel; change serving and quantity -> kcal/protein/carbs/fats recalc correctly (e.g. Paneer tikka x1 = 330/24/8/22; x2 doubles).
- NUT-06 (P0) Choose meal chip, Add -> success state with correct text and buttons (Add another, Back to Nutrition, Dashboard); nutrition page toast; dashboard and Coach context updated.
- NUT-07 (P1) "After adding" preview matches the post-add totals exactly.
- NUT-08 (P1) Custom food: name required, numbers >= 0, errors inline; successful add appears in the chosen meal.
- NUT-09 (P2) Default meal follows time of day / last used; quantity min 0.5.

### 6.6 AI Coach (COACH)
- COACH-01 (P0) Seed chat (greeting, user question, Nova answer with today's workout card); card button -> Workout Details (or "See progress" if done).
- COACH-02 (P0) Each of 4 suggested prompts sends immediately, shows typing state ~1 s, then a data-aware answer; streaming text animates.
- COACH-03 (P0) Typed message sends on Enter/Send; empty submit shows the error text; input clears.
- COACH-04 (P1) Answers use live data (change weight/meal/workout, ask again, answer changes).
- COACH-05 (P1) After an answer: "Return to dashboard", "Open Nutrition", "Open workouts" appear and work.
- COACH-06 (P1) Chat persists after refresh and auto-scrolls to latest message.
- COACH-07 (P1) Context aside values match store (goal, calories, protein, workout status) and link correctly.
- COACH-08 (P2) Mobile: input stays above keyboard, chips wrap, no horizontal scroll.

### 6.7 Progress (PRG)
- PRG-01 (P0) Log weight: valid value saves, success message, chart/stat tiles/goal ring and dashboard update; replaces today's entry.
- PRG-02 (P1) Weight validation: empty, non-numeric, outside 30 to 300 -> inline error; decimals handled.
- PRG-03 (P0) 7/30-day toggle updates all charts and labels consistently.
- PRG-04 (P1) Charts: weight history, workout consistency, calorie trend (vs target line), strength rows (bench 65 -> 70, goal 80); tooltips on hover/tap; no clipping.
- PRG-05 (P1) Goal card: "55% to 80 kg", "3.6 kg to go", "Edit goal" -> Profile; after changing goal weight values recompute.
- PRG-06 (P1) Insights derived from data; "Ask Nova about my progress" -> Coach.
- PRG-07 (P2) Empty/low-data period renders a sensible state, not broken charts.

### 6.8 Profile & Settings (PROF)
- PROF-01 (P0) Editing any field shows "Unsaved changes", Discard, Save; Discard reverts.
- PROF-02 (P0) Save validates (age 14-100, height 120-230, weight 30-300, targets > 0, email format, name) then shows success banner; Dashboard, Nutrition, Progress and Coach reflect new goal, goal weight, targets, name.
- PROF-03 (P1) Changing current weight logs it for today (appears in Progress).
- PROF-04 (P1) "Recalculate with Nova" fills suggested targets and shows the note; not applied until Save.
- PROF-05 (P1) Change password: mismatch/short errors; success "Password updated".
- PROF-06 (P1) Notification toggles persist.
- PROF-07 (P0) Log out clears session -> `/login`. Delete account requires typing DELETE, then shows "Account deleted"; data cleared; "Back to Log in" works.
- PROF-08 (P1) Leaving with unsaved changes warns.
- PROF-09 (P2) Reset demo data restores the seed.
- PROF-10 (P1) Feedback modal: type, message, optional email, validation, saved to `fitai.feedback`, success toast.

### 6.9 Shell, navigation and global (NAV)
- NAV-01 (P0) Sidebar has six items; active item follows route; profile chip -> Profile; collapse/expand animates and persists.
- NAV-02 (P0) Below 820 px sidebar becomes the 5-tab bottom bar; correct active tab; content not hidden behind it.
- NAV-03 (P1) Browser back/forward works through all flows; deep links open correctly; unknown route shows a friendly 404 with a way home.
- NAV-04 (P1) Command palette (Cmd/Ctrl+K): opens, filters, arrow keys + Enter, Esc closes; each action works (navigate, log food, log weight, start workout, ask Nova).
- NAV-05 (P2) Page transitions do not flash or double-render; scroll resets on route change.

## 7. End-to-end journeys (all must pass; P0)

| ID | Journey |
|---|---|
| J1 | Sign up -> Onboarding (5 steps) -> Dashboard shows entered data and computed targets |
| J2 | Log in -> Dashboard -> Workouts -> Workout Details -> Start -> complete sets -> Finish & save -> Dashboard (Completed, 3 of 4) -> Progress (new session, strength) |
| J3 | Dashboard -> Nutrition -> Search Food -> pick Paneer tikka, 2 servings, Dinner -> Add -> Nutrition (toast, Dinner filled, totals) -> Dashboard (calories/macros updated) |
| J4 | Dashboard -> AI Coach -> ask "Analyze my progress." -> typing -> answer -> Return to dashboard |
| J5 | Dashboard -> Progress -> log 76.9 kg -> chart point added, goal % updated -> Dashboard shows 76.9 |
| J6 | Sidebar -> Profile -> change goal weight to 82 and calories target -> Save -> Dashboard, Nutrition, Progress, Coach all show new values |
| J7 | Custom food: Nutrition -> Add Custom Food -> fill -> Snacks -> totals and dashboard update; Undo removal works |
| J8 | Mobile (390): full pass of J2, J3, J4, J5 using only the tab bar and on-screen UI |
| J9 | Refresh in the middle of each journey -> state intact; "Reset demo data" returns to seed |
| J10 | Log out -> guarded routes redirect -> log in again -> data from before logout still there |

## 8. Cross-screen data consistency matrix

After each action, verify these values on **every** screen that shows them (Dashboard, Nutrition, Progress, Coach aside, Profile):

| Action | Must change consistently |
|---|---|
| Add/remove food | kcal, kcal left, protein, macros split, calorie ring %, Coach context, Progress calorie trend |
| Log weight | current weight, +/- delta, goal %, kg to go, charts, Coach context, Profile current weight |
| Complete workout | status, sessions this week, calendar day, consistency chart, strength rows, Coach status, Dashboard CTA |
| Edit profile | name/initial, goal label, goal weight, targets, goal %, Nova text, Onboarding-derived values |
| Reset demo data | everything returns to section 4 values |

Contradiction = P0 bug.

## 9. Cross-cutting tests

**Persistence**: refresh keeps all state; corrupted JSON falls back to seed without crash; localStorage disabled -> app works in memory with a quiet notice; two tabs stay in sync (storage event) or fail gracefully; no SSR/hydration mismatch warnings.

**Responsive**: at 320/390/820/1024/1440/1920 no horizontal scroll, no overlapping elements, spacing per the spacing system (page padding 40/24/20 px, section gap 24, card gap 18), tab bar/sidebar swap at 820, touch targets >= 44 px, sticky bars do not cover content, long numbers and names do not break layout.

**Accessibility**: axe passes on every page and key states (modals, toasts, errors); full keyboard operation (tab order, Enter/Space, Esc closes overlays, focus trapped in modals and returned after); visible focus ring; labels and `aria-*` on icon buttons, toggles (`aria-pressed`), live regions for toasts/chat/timer; colour contrast AA; charts have text summaries; screen reader pass (VoiceOver + NVDA) on login, dashboard, active workout, food search.

**Animation and motion**: page transitions, number roll, ring/bar/chart draw-in, set-check, rest timer, celebration, streaming reply, toasts, bottom sheets all run once and finish; no layout jump after animation; screens at rest match screenshots; with `prefers-reduced-motion` movement is removed and information is not lost; 60 fps on throttled CPU; no animation loops except the allowed live-dot pulse.

**Performance**: Lighthouse >= 90 on each route (mobile profile); LCP < 2.5 s, CLS < 0.1, INP < 200 ms on throttled 4G; route-level code splitting; no large blocking bundles; fonts via `next/font` without flash of unstyled text.

**Error and edge cases**: very long names/food names, large numbers (10,000+ kcal), decimals, zero values, negative input, pasted text into number fields, rapid double-clicks (no duplicate adds/sessions), rapid route changes, back button during async states, empty states for every list, offline mode (app shell still loads if PWA later).

**Security basics (frontend)**: no secrets in the bundle, inputs rendered safely (no HTML injection from names, chat text, routine names, feedback), logout clears session data it should.

**Browser matrix**: smoke (J1-J5) on Chrome, Safari, Firefox, Edge; full suite on Chrome + Safari; iOS Safari and Android Chrome manual run of J8 (keyboard, safe areas, gestures).

## 10. Visual regression (design fidelity)

For each of the 11 screens plus the mobile dashboard, take a Playwright screenshot at 1440, 820 and 390 with seeded data and frozen time/animations, and diff against the reference in `design/screenshots`. Record tolerance (start at 2% pixel diff) and review each failing diff by hand: check fonts (Sora/DM Sans), colors (tokens), radii, spacing, icon style, chart proportions. Re-baseline only after a deliberate design decision. Also capture the state screenshots (signup error, coach typing/answered, set done, workout saved, dashboard after workout, food search).

## 11. Sample Playwright skeleton

```ts
// e2e/journeys.spec.ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/login');
});

test('J2: complete a workout updates dashboard and progress', async ({ page }) => {
  await page.getByLabel('Email').fill('alex@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('link', { name: 'Go to dashboard' }).click();
  await expect(page.getByText('1,640')).toBeVisible();
  await page.getByRole('link', { name: 'Start Workout' }).first().click();
  await page.getByRole('link', { name: 'Start Workout' }).click();
  await page.getByRole('button', { name: 'Mark set complete' }).first().click();
  await page.getByRole('button', { name: 'Finish & save' }).click();
  await expect(page.getByText(/Session saved/)).toBeVisible();
  await page.getByRole('link', { name: 'Back to dashboard' }).click();
  await expect(page.getByText(/Completed/)).toBeVisible();
});
```

## 12. Manual exploratory checklist (30-45 min per pass)

- Use the app as a new user with no instructions; note every moment of confusion.
- Try to break forms: spaces only, emoji, very long text, paste, autofill, browser back mid-submit.
- Fast tap every primary button twice; rotate the phone; zoom to 150%; resize the window slowly from 1920 to 320.
- Hunt for: dead buttons, links to `#`, text clipped or touching card edges, inconsistent gaps, mismatched numbers between screens, layout shift after load, scroll traps in modals.
- Check copy against Brand OS voice (sentence case, units, no emoji).

## 13. Process, schedule and reporting

| Phase | Work | When |
|---|---|---|
| 1 | Unit + component tests alongside each screen | During build |
| 2 | Screen-level E2E (section 6) after each screen is "done" | During build |
| 3 | Journeys + consistency matrix (sections 7-8) | After all screens exist |
| 4 | Visual regression, a11y, performance, cross-browser | Feature freeze |
| 5 | Manual exploratory + real-device pass, bug fixing, full re-run | Release candidate |

CI: run lint, typecheck, unit, component and Playwright (Chrome) on every pull request; full browser matrix + Lighthouse nightly.

Bug template: ID, title, priority, screen, viewport/browser, steps, expected vs actual, screenshot/video, console log, linked test case.

Sign-off: all exit criteria in section 1 met, test report attached (pass/fail per case, open bugs, known deviations from the screenshots).

