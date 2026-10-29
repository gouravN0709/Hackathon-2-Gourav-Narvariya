# FitAI In-App Help & Info System Architecture Plan

This document establishes the architecture, design tokens, component hierarchy, content structure, accessibility model, and test verification suite for the comprehensive in-app Help and Info system in FitAI.

---

## 1. Objectives & Principles

- **Zero Guesswork**: Every number, chart, calculation, and feature is explained clearly in plain language so any user immediately understands their data.
- **Brand OS Fidelity**: Strictly preserve all FitAI Brand OS tokens (`#0B0B0D` canvas, `#151518` cards, `#1C1C21` raised surface, `#383841` border-strong, `#C6FF3D` lime accent, Sora + DM Sans typography). No new colors, shadows, or gradients.
- **Single Source of Truth**: All explanations, titles, how-to guides, and tips originate from a single typed content dictionary (`src/content/help.ts`). Copy is never duplicated between InfoTips and the Help Center.
- **Responsive Adaptive UX**:
  - **Desktop (>=820px)**: Fast hover, focus, and click popovers rendered via a React Portal with collision detection (auto-flip/shift) so tooltips are never clipped by `overflow-hidden` containers.
  - **Mobile (<820px or touch)**: Native bottom sheet with drag-to-dismiss gesture, 44px minimum touch targets, and focus traps.
- **Accessibility (WCAG AA)**: Native `<button>` elements with descriptive `aria-label="What is {title}?"`, proper `aria-expanded`, focus return to trigger upon dismissal, Esc key support, and `prefers-reduced-motion` compliance.
- **Performance & Code-Splitting**: Popover and Help Center subcomponents are lazy-loaded to prevent layout shifts and keep initial bundle sizes minimal.

---

## 2. Component Architecture

```
src/
├── content/
│   └── help.ts                 # Single typed repository of all help topics & categories
├── components/
│   ├── ui/
│   │   ├── InfoTip.tsx         # Reusable "i" button with adaptive Popover (desktop) & BottomSheet (mobile)
│   │   └── Icon.tsx            # Updated with 'help' (question mark circle) icon
│   ├── features/
│   │   ├── help/
│   │   │   ├── HelpCenter.tsx       # Live-searchable accordion Help Center (/help)
│   │   │   ├── CoachmarkTour.tsx    # 5-step guided coachmark onboarding tour
│   │   │   └── useTour.ts           # Tour state & localStorage persistence hook
├── app/
│   └── (app)/
│       └── help/
│           └── page.tsx        # Route /help with full layout integration
```

### 2.1 Reusable `InfoTip` (`src/components/ui/InfoTip.tsx`)
- **Visuals**: 16–18px inline SVG info icon matching the tip banner icon (`ICONS.info`). Default `text-secondary` (`text-muted`), transitioning to `text-lime` on hover/focus.
- **Trigger**: `<button type="button" aria-label={`What is ${title}?`} aria-expanded={isOpen}>` with a 44px touch container on mobile devices.
- **Desktop Popover**:
  - Rendered in a React Portal (`createPortal(..., document.body)`).
  - Positioned relative to trigger via `getBoundingClientRect()`.
  - Automatic collision avoidance: flips above or below trigger; horizontally clamped within viewport with 12px padding.
  - Styling: `bg-raised` (`#1C1C21`), `border border-line-strong` (`#383841`), `rounded-[14px]`, `p-4`, `w-[280px] sm:w-[320px]`, `z-50`.
  - Content: Title (`font-display font-bold text-[15px] text-fg`), 1–3 sentence explanation (`text-soft text-[13px] leading-relaxed`), optional dynamic live example (`text-[12px] text-muted` with highlighted value), and "Learn more" link pointing to `/help#{topicId}`.
- **Mobile Bottom Sheet**:
  - Uses existing bottom-sheet pattern with pull-handle drag-to-dismiss, backdrop, and focus trap.
  - Close button and outside tap support.
- **Singleton Pattern**: Only one InfoTip or popover open across the entire application at any time. Opening another closes the previous one.

### 2.2 Help Center (`src/app/(app)/help/page.tsx` & `src/components/features/help/HelpCenter.tsx`)
- **Route**: `/help` inside the authenticated AppShell layout.
- **Live Search**: Field input matching FitAI input style with instant debounced filtering across all topic titles, descriptions, and keywords.
- **Sections (Accordion)**:
  1. Getting started
  2. Dashboard
  3. Workouts
  4. Nutrition
  5. Progress
  6. AI Coach (Nova)
  7. Profile & Settings
  8. Glossary
  9. FAQ
  10. Privacy and your data
  11. Contact/Feedback (direct modal trigger to existing `FeedbackModal`)
- **Topic Item Layout**:
  - What it is (plain-language definition)
  - How to use it (step-by-step guidance)
  - FitAI Pro Tip (practical recommendation)
  - Deep-link anchor ID (e.g., `#calories`) with highlight & scroll animation when opened from an InfoTip.
- **Disclaimer Banner**: "FitAI gives general fitness guidance, not medical advice. Talk to a professional before big changes to your diet or training."

### 2.3 5-Step Coachmark Tour (`src/components/features/help/CoachmarkTour.tsx`)
- **Steps**:
  1. **Dashboard Summary**: Calories ring, protein, today's workout, and weight goal progress.
  2. **Quick Actions**: One-tap access to log food, log weight, start workout, or chat with Nova.
  3. **Workouts**: View AI-generated 4-day split, weekly schedule, and active workout tracking.
  4. **Log Food**: Comprehensive whole foods database, custom food entry, and macro tracking.
  5. **Ask Nova**: Interactive AI coach ready to answer workout, meal, and recovery questions.
- **Mechanics**:
  - Step counter ("Step X of 5"), step title, description, "Next", "Back", "Skip tour", and close button.
  - Anchors cleanly to viewport or target elements (`data-tour="..."`), with fallback to centered dialog.
  - LocalStorage flag: `fitai.tourSeen`.
  - Restartable from:
    - Button in Help Center ("Take a quick tour")
    - Button in Profile & Settings ("Restart app tour")
    - Command Palette ("Take quick tour")

---

## 3. Placement Inventory (Section 3 Coverage)

| Area | Element | Topic ID | Title | Live Example Dynamic Key |
|---|---|---|---|---|
| **Dashboard** | Calories ring | `calories-ring` | Calories | Remaining kcal from daily target |
| **Dashboard** | Protein stat | `protein-target` | Protein target | Current protein logged vs target |
| **Dashboard** | Today's workout status | `workout-status` | Today's workout | Status (Done / Planned / Rest) |
| **Dashboard** | Current weight & goal progress | `goal-progress` | Goal progress | % towards goal weight |
| **Dashboard** | Weight trend | `weight-trend` | 30-day weight trend | 30-day net weight change (kg) |
| **Dashboard** | Nutrition card | `nutrition-overview` | Daily nutrition | Current calories and macro split |
| **Dashboard** | AI Coach card | `nova-coach` | Nova AI coach | Daily coaching insight |
| **Workouts** | AI-generated plan | `ai-plan` | AI-generated plan | Current training split (e.g. 4-day split) |
| **Workouts** | Week calendar statuses | `calendar-statuses` | Week calendar | Done, Today, Planned, Rest explanation |
| **Workouts** | Muscle groups | `muscle-groups` | Muscle groups | Targeted muscle groups for session |
| **Workouts** | My routines | `custom-routines` | Custom routines | Routine customization info |
| **Workout Details** | Sets / Reps / Weight / Rest | `sets-reps-weight-rest` | Sets, reps & rest | Explaining reps, sets, kg, and rest |
| **Workout Details** | Session estimate | `session-estimate` | Session estimate | Estimated volume and duration |
| **Workout Details** | Notes from Nova | `nova-notes` | Nova workout notes | Form and progression instructions |
| **Active Workout** | Timer | `workout-timer` | Workout timer | Elapsed workout time |
| **Active Workout** | Volume | `volume-stat` | Total volume | Current session volume (kg lifted) |
| **Active Workout** | Set row (kg/reps/check) | `set-row-tracking` | Set logging | Logging reps and weight |
| **Active Workout** | Rest timer | `rest-timer` | Rest timer | Countdown between sets |
| **Active Workout** | Complete vs Finish & save | `finish-workout` | Completing exercises | Exercise vs full workout finish |
| **Nutrition** | Remaining calories | `remaining-calories` | Remaining calories | Calories remaining today |
| **Nutrition** | Macros | `macro-split` | Macronutrients | Protein, carbs, fats ratio |
| **Nutrition** | AI meal suggestion | `ai-meal-suggestion` | AI meal suggestion | Nova suggested dish & macros |
| **Nutrition** | Serving size & count | `serving-size` | Serving sizes | Portion calculation multiplier |
| **Nutrition** | Meal log | `meal-log` | Meal log | Breakfast, lunch, dinner, snacks |
| **Food Search** | Serving size selector | `search-serving` | Serving size | Predefined portions (e.g. 1 cup, 100g) |
| **Food Search** | Number of servings | `search-servings-count` | Number of servings | Stepper quantity multiplier |
| **Food Search** | After adding preview | `after-adding-preview` | Target impact preview | Impact on daily kcal & protein |
| **Food Search** | Custom food | `custom-food` | Custom food | Adding unlisted meals and recipes |
| **Progress** | Weight history | `weight-history` | Weight history | Weigh-in logs and chart |
| **Progress** | Goal progress | `goal-progress-calc` | Progress formula | `(current - start) / (goal - start)` |
| **Progress** | Workout consistency | `workout-consistency` | Workout consistency | Sessions completed vs planned weekly |
| **Progress** | Calorie trend | `calorie-trend` | Calorie trend | Daily calories vs target line |
| **Progress** | Strength progress | `strength-progress` | Strength progress | Heaviest set trends on key lifts |
| **Progress** | Insights | `progress-insights` | Nova progress insights | Progression analysis and adjustments |
| **AI Coach** | What Nova knows today | `nova-context` | What Nova knows | Workout, meal, and weight context |
| **AI Coach** | Your data stays private | `data-privacy` | Privacy & device storage | LocalStorage client-only storage |
| **AI Coach** | Suggested prompts | `suggested-prompts` | Prompt suggestions | Quick prompts to query your data |
| **Profile & Settings** | Fitness goal | `profile-goal` | Fitness goal | Muscle gain, fat loss, or maintenance |
| **Profile & Settings** | Daily targets & Recalculate | `daily-targets-recalc` | Daily targets | Mifflin-St Jeor + macro multipliers |
| **Profile & Settings** | Experience level | `profile-experience` | Training experience | Beginner, intermediate, advanced volume |
| **Profile & Settings** | Dietary preference | `profile-diet` | Dietary preference | Veg, non-veg, vegan, keto guidelines |
| **Profile & Settings** | Notifications | `profile-notifications` | Notifications & sounds | Workout nudges and UI ticks |
| **Profile & Settings** | Delete account | `delete-account` | Delete account | Permanent deletion of local data |
| **Onboarding** | Step 1: About you | `onboarding-step-1` | Why we ask: stats | Age, height, weight for BMR & targets |
| **Onboarding** | Step 2: Goal | `onboarding-step-2` | Why we ask: goal | Surplus, deficit, or maintenance plan |
| **Onboarding** | Step 3: Experience | `onboarding-step-3` | Why we ask: experience | Sets, rest, and progression rate |
| **Onboarding** | Step 4: Diet | `onboarding-step-4` | Why we ask: diet | Food suggestions and macro tailoring |
| **Onboarding** | Step 5: Summary | `onboarding-step-5` | Plan summary | Target calculations overview |

---

## 4. Navigation & Global Entry Points

1. **Header "?" Button**:
   - Placed in `DashboardDesktop.tsx` next to the user avatar.
   - Placed in `DashboardMobile.tsx` next to the user avatar.
   - Placed in `MobileTopBar.tsx` next to the user avatar for all subpages on mobile.
2. **Sidebar Footer**:
   - Placed in `Sidebar.tsx` directly above "Report a problem / Request a feature".
   - Links to `/help` with clean hover states and collapsed tooltip.
3. **Command Palette (`Cmd/Ctrl+K`)**:
   - Added entries:
     - "Help & Info Center" (`/help`)
     - "Take Quick Tour" (triggers coachmark tour)
4. **Profile & Settings Entry**:
   - Added "Help & Guides" card/link in `ProfileSettings.tsx`.
   - Includes "Open Help Center" and "Restart App Tour".

---

## 5. Verification & Testing Strategy

- **Unit & Component Tests**:
  - Test `help.ts`: All topics have required fields (`id`, `title`, `short`, `body`, `howTo`, `tip`), non-empty strings.
  - Test `InfoTip.tsx`:
    - Renders button with correct `aria-label`.
    - Opens popover on click and hover (desktop).
    - Closes on Esc and outside click.
    - Restores focus to trigger button upon close.
    - Mobile bottom-sheet trigger and dismiss.
    - Singleton check: opening tip B closes tip A.
  - Test `HelpCenter.tsx`:
    - Search input filters topics by title and keyword.
    - Accordions expand and collapse.
    - Deep-linking anchor scrolls to target topic.
- **E2E & Accessibility Tests**:
  - Run axe-core accessibility audit on `/help` and open `InfoTip` popover.
  - Test coachmark tour workflow: step 1 -> step 5, skip, localStorage persistence (`fitai.tourSeen`).
  - Run full test suite (`npm run test:unit`, `npm run lint`, `npm run build`).

