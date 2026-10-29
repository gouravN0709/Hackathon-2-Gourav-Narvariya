# FitAI: project proposal and MVP scope

**Tagline:** Your Fitness. Your Data. Your AI Coach.

**Version:** 1.0 (hackathon MVP)  
**Authoring note:** This file was assembled for delivery documentation from the product vision embodied in the shipped FitAI codebase, Brand OS, and test plans. The original standalone proposal PDF was not present in the repository at handover time.

---

## 1. Vision

FitAI is a personal fitness platform where every screen, chart, and coach message is grounded in the member’s own logs—not generic advice. Members set goals once, follow an adaptive weekly plan, log workouts and meals in seconds, and get clear feedback from an AI coach (Nova) that cites their real numbers.

Long term, FitAI extends from the member app to trainer tools, gym operations, connected equipment, and a marketplace—one data layer from home gym to commercial floor.

---

## 2. Problem

### 2.1 Member problems (six)

1. **No clear plan** — Arriving at the gym without knowing which exercises, sets, or progression to run.
2. **Nutrition guesswork** — Hitting protein and calorie targets without a simple daily log tied to goals.
3. **Invisible progress** — Weight and strength trends scattered across notes, spreadsheets, or memory.
4. **Generic advice** — Fitness content that ignores the member’s actual workload, diet, and history.
5. **Tool fragmentation** — Separate apps for workouts, food, and messaging with no shared context.
6. **Motivation drop-off** — No timely, data-aware nudges when consistency slips.

### 2.2 Trainer problems

- Manual program design and copy-paste plans for every client.
- Limited visibility into whether clients actually train and eat as prescribed.
- Time spent chasing check-ins instead of coaching.
- Hard to prove outcomes when data lives in client-owned apps.

### 2.3 Gym owner / operator problems

- Member churn when engagement falls after signup.
- Front-desk and floor staff lack a single view of active members and attendance.
- Difficulty differentiating the gym with a modern digital experience.
- Revenue leakage when personal training and classes are not tied to measurable member progress.

---

## 3. Solution

FitAI gives each member one dark, focused app: onboarding that computes evidence-based targets (Mifflin–St Jeor + goal buffers), a dashboard that surfaces today’s workout and nutrition rings, structured workout logging with rest timers, food search and custom items, progress charts, and Nova—an AI coach that reads live store data and responds in plain language.

Trainers and gyms are **out of MVP scope**; the member experience is built so their data model and RLS can extend to multi-tenant roles in later phases.

---

## 4. MVP scope (Phase 1)

### 4.1 Authentication and onboarding

- Email/password sign up and log in with validation and password reset.
- Five-step onboarding: stats, goal, experience, diet, review with computed daily targets.
- Route guards: signed-out → login; incomplete onboarding → onboarding flow.
- Account sign out, change password, delete account (confirmed).

### 4.2 Dashboard and home

- Personalized greeting, date, calorie and protein rings, weight snapshot, weekly session progress.
- Quick actions: log weight, log food, start workout, ask Nova.
- Summary cards linking to workouts, nutrition, progress, coach; dismissible tip banner.
- Seven- and thirty-day weight chart on dashboard (desktop).

### 4.3 Workouts

- Weekly planner with day status (planned, done, rest, missed).
- Workout details: exercises, sets, instructions, add exercise, regenerate plan (rule-based RPC).
- Active workout: timer, set/rep/weight steppers, rest countdown, finish and save session.
- Custom routines and muscle-group filters.

### 4.4 Nutrition

- Daily overview by meal with macro split and remaining budget.
- Food search with categories, serving sizes, custom foods, undo on remove.
- AI-suggested meal shortcut (Nova recommendation on nutrition screen).

### 4.5 AI coach, progress, and profile

- Nova chat with suggested prompts, typing indicator, streaming-style replies, context panel.
- Progress: weight log, charts (weight, consistency, calories, top lifts), goal card, insights.
- Profile: targets, notifications, sounds, feedback modal, demo reset, PWA install entry.
- Command palette (Ctrl/Cmd+K), help center with InfoTips, coachmark tour, PWA offline shell.

---

## 5. Future scope

### Phase 2 — Trainer platform (S/M)

**Goals:** Let certified trainers manage rosters, assign plans, and review client adherence.

**Key features:** Trainer dashboard, client list, assign/modify splits, view client logs (read-only), in-app messaging, basic compliance alerts.

**Dependencies:** MVP member app, role-based auth, trainer–client linking table.

**Effort:** M · **Value:** High retention for training businesses.

### Phase 3 — Gym owner and admin (M)

**Goals:** Operators see engagement, manage memberships, and configure gym-wide content.

**Key features:** Admin console, member roster, check-in summaries, staff roles, branded mobile experience, export/reporting.

**Dependencies:** Phase 2 auth model, billing integration (optional).

**Effort:** M–L · **Value:** Differentiation and churn reduction.

### Phase 4 — Smart gym (L)

**Goals:** Connect floor equipment and attendance to member profiles.

**Key features:** Equipment APIs, auto log sets from compatible machines, occupancy/beacon check-in, floor displays.

**Dependencies:** Hardware partners, Phase 3 admin, secure device auth.

**Effort:** L · **Value:** Premium gyms, data-rich coaching.

### Phase 5 — Advanced AI and integrations (M–L)

**Goals:** Replace rule-based Nova with real LLM coaching, automation, and external data.

**Key features:** Google Gemini (or equivalent) via server routes, weekly AI reports, wearable sync (Apple Health, Google Fit), push reminders, meal photo assist.

**Dependencies:** Phase 1 data model, secrets management, rate limits.

**Effort:** M–L · **Value:** Core product moat.

### Phase 6 — Marketplace (L)

**Goals:** Monetize programs, meals, and trainer services inside FitAI.

**Key features:** Program store, trainer listings, subscriptions, reviews, payouts.

**Dependencies:** Phases 2–3, payments provider, moderation.

**Effort:** L · **Value:** New revenue stream.

### Near-term backlog (post-MVP)

- Real AI coach (Gemini via server)
- Push reminders
- Weekly AI reports
- Offline sync improvements
- Accessibility and performance hardening
- Analytics and feedback loop (server-side feedback ingest)

---

## 6. Proposed tech stack (proposal)

| Layer | Proposed |
|-------|----------|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind |
| State | Client store + server sync |
| Backend | Supabase (Postgres, Auth, RLS) |
| AI | Google Gemini API (server-side) |
| Charts | Chart library or custom SVG |
| Hosting | Vercel |
| Mobile | PWA (installable, offline-capable) |

---

## 7. Non-functional requirements

- WCAG 2.1 AA accessibility, responsive 320px–1920px.
- Lighthouse ≥ 90 on performance, accessibility, best practices, SEO.
- Automated unit, E2E, visual, and a11y tests in CI.
- RLS on all user data; no secrets in client bundles.
- Brand: dark charcoal UI, lime accent, Sora + DM Sans (`docs/BRAND_OS.md`).
