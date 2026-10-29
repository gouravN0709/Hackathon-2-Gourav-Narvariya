# FitAI Brand OS

The single source of truth for how FitAI looks, sounds, moves and is built. Any designer, developer, Cursor/Claude agent or contractor should be able to read this one file and produce something that is unmistakably FitAI.

**Tagline:** Your Fitness. Your Data. Your AI Coach.
**Product:** AI fitness web app (workouts, nutrition, progress, AI coach "Nova").
**Rule zero:** the finished FitAI designs (screenshots + `.dc.html` sources in `design/`) are canonical. This OS describes and protects them. Nothing here authorises a redesign.

---

## 1. Brand essence

| | |
|---|---|
| Personality | Focused, premium, confident, data-literate, never loud |
| Feel | Night-mode gym: charcoal surfaces, one electric lime accent, crisp numbers |
| Promise | Your numbers, explained by a coach that actually knows them |
| Pillars | **Personal** (everything uses the user's own data) · **Clear** (one number, one meaning) · **Motivating** (calm, not cheesy) |

## 2. Voice and copy

- Direct, warm, short. Second person ("Your dashboard is updated").
- Coach name: **Nova**. Nova speaks in first person, cites the user's real data ("You hit 70 kg × 8 on bench last week"), never gives medical claims.
- Numbers first, units always ("112 / 160 g", "76.4 kg", "~420 kcal", "58 min").
- Sentence case everywhere (buttons, headings). Eyebrows are the only ALL CAPS ("TODAY'S WORKOUT").
- Success = confirm what changed ("Weight saved. Your chart and goal progress are updated.").
- Errors = say what to do ("Enter a valid email address.").
- No emoji, no exclamation spam (one "Good morning, Alex!" style greeting is the limit), no hype words.
- Always give users a way to **report a problem or request a feature** (see section 11).

## 3. Color

Dark charcoal canvas, **one** hero accent (lime), violet only for AI/protein moments.

| Token | Hex | Use |
|---|---|---|
| `bg-app` | `#0B0B0D` | page |
| `bg-sidebar` | `#0F0F12` | sidebar, tab bar, inputs, toggles |
| `surface-card` | `#151518` | cards |
| `surface-raised` | `#1C1C21` | insight boxes, AI bubbles |
| `surface-chip` | `#1F1F25` | pills |
| `surface-active` | `#23232A` | active segment, avatar |
| `border-default` | `#26262C` | card border, tracks |
| `border-strong` | `#383841` | ghost button, inputs |
| `border-chip` | `#2C2C34` | pills |
| `border-active` | `#34343C` | active segment |
| `text-primary` | `#F5F5F7` | |
| `text-secondary` | `#A1A1AD` | labels, muted |
| `text-soft` | `#D4D4DC` | |
| `lime` | `#C6FF3D` | primary accent (hover `#D8FF73`, on-lime text `#0B0B0D`) |
| `lime-tint` | `#1E2410` (border `#2F3A12`, pill bg `#1A2008`/`#34410F`, success bg `#10140A`) | |
| `violet` | `#A78BFA` (soft `#C4B5FD`) | protein/carbs bars, AI tips |
| `violet-tint` | bg `#1A1626` / `#12101A`, border `#3B2F63` | AI tip banners |
| `amber` | `#FBBF24` | fats |
| `error` | `#FF7A7A` (text `#FF9B9B`, box `#2A1416`/`#5A2A2E`) | |
| `disabled` | bg `#4A5A1E`, text `#9AA67A` | disabled primary |

Rules: lime is for the primary action, active state and progress only (never body text on large areas). Violet never replaces lime as primary. Gradients are limited to the AI card border (`#C6FF3D88 → #8B5CF688`, 135°) and the exercise placeholder (`#25252C → #17171B`, 145°). Dark mode only.

## 4. Typography

- **Sora** 600/700/800: headings and all large numerics (letter-spacing −0.02em).
- **DM Sans** 400/500/600/700: everything else.
- Scale (px): 52 hero · 38 / 34 page H1 · 30 / 22 card H · 19 / 17 H3 · 28 / 22 / 20 numerics · 17 / 16 / 15 / 14 / 13 body · 12 eyebrow caps (+0.1em).
- Line-height 1.15 for headings, 1.5–1.6 for paragraphs.

## 5. Shape, spacing, elevation

- Card radius 20 (mobile 18) · fields 14 · icon tiles 12 · buttons, pills, chips, segments fully rounded.
- Card padding 22 (mobile 16–18) · grid gap 18 · section gap 24 · main padding 32/40/56.
- Heights: button 48 (hero 52, small 40) · field 54 · pill ≈ 32 · tracks 8 (mobile 7).
- Elevation is expressed by **surface colour and 1px borders**, not shadows. No drop shadows, no glassmorphism, no glow except a subtle lime focus ring.

## 6. Iconography

Inline SVG, 24-px grid, stroke 1.8–2.2, round caps/joins (Lucide-style). Lime on dark tiles (`lime-tint`), secondary grey in nav. Never emoji, never 3D or filled-colour icons in the app UI.

## 7. Layout and responsiveness

- Desktop: 248 px sidebar (collapses to 78 px) + fluid main; wrapping flex grids (4 → 2 → 1 columns).
- < ~820 px: sidebar becomes a **5-tab bottom bar** (Home, Coach, Workouts, Nutrition, Progress). Profile via header avatar.
- Mobile touch targets ≥ 44 px, safe-area padding, content never hidden behind the bar.

## 8. Components (canonical inventory)

Button (primary, ghost; sm/md/lg; icon) · Pill (default, lime, violet) · Segmented control · Card (+ AI gradient) · Stat card · Progress bar · Ring · Quick-action tile · Field + label + error · Toggle row · Tip banner · Chat bubble · Exercise tile · Set row (steppers + check) · Weight chart · Macro split bar · Consistency bars · Strength row · Toast / inline status · Sidebar · Mobile tab bar.

Every component: one implementation, token-driven, keyboard accessible, with hover / focus / active / disabled / loading / error states.

## 9. Motion and UX system (core part of the product)

FitAI must feel alive and effortless: **every state change is animated, every action gives feedback, nothing is ever a dead end.** Motion is expressive but purposeful and always stays inside the visual language above (no shadows, no new colors, no 3D, no parallax, no glass).

**Engine:** `motion` (Framer Motion) with `LazyMotion` + `domAnimation`; NumberFlow for numbers. Animate `transform` and `opacity` only (60 fps), lazy-load heavy pieces.

**Motion tokens**
| Token | Value |
|---|---|
| fast / base / slow / chart | 150 / 250 / 450 / 800 ms |
| ease-out | `cubic-bezier(.22,1,.36,1)` |
| spring (UI) | stiffness 380, damping 30 |
| spring (playful: set check, success) | stiffness 500, damping 22 |
| stagger | 40 ms per item, max 8 items |

**Required animations (all of them)**
- **Page transitions:** fade + 8 px rise (250 ms) via `AnimatePresence`; cards enter with a 40 ms stagger on every screen.
- **Navigation:** sidebar active pill slides between items (`layoutId`); tab bar icon springs on activation; sidebar collapse animates width and label fade.
- **Numbers:** every numeric value rolls (NumberFlow): calories, protein, kg, reps, sets, volume, percentages, timers, goal progress.
- **Data viz:** rings sweep from 0, bars fill, weight/calorie lines draw (`pathLength`) then the area fades in, chart range toggle morphs between datasets, tooltip follows pointer/touch, latest-point dot pulses gently.
- **Controls:** buttons press-scale 0.97 + hover brighten; segmented controls and toggles use a sliding highlight; steppers (+/−) bump the value; chips/option cards select with a soft scale + border transition; focus ring animates in.
- **Workout:** completing a set draws the checkmark (spring), tints the row and bumps the sets counter; completing an exercise slides the next one in; **live rest-timer ring** counts down after each set (skippable); Finish & save shows a saving state, then a **success celebration**: check draws in, stats count up, a single short lime particle burst (12 CSS/Motion particles, once).
- **Nutrition:** adding a food animates the row in and the ring/macro bars to their new values; removing animates height collapse; totals roll; toast slides in with **Undo**.
- **AI Coach:** typing dots, message bubbles slide in from their side, Nova replies **stream in word by word**, suggested-prompt chips stagger in, auto-scroll is smooth, online dot softly pulses.
- **Progress:** logging weight morphs the chart to the new point, goal ring animates, new-record badges pop in.
- **Feedback surfaces:** toasts slide + fade (3–4 s, pause on hover, Undo where reversible); inline banners expand with height animation; modals/popovers scale from their trigger; mobile uses **bottom sheets** with drag-to-dismiss.
- **Loading:** first load and mock-delay states use skeleton shimmer shaped like the real content (300–600 ms), never blank screens or spinners alone.
- **Empty states:** every empty list has an animated icon, one-line explanation and a primary action ("Nothing logged yet" → Add food).
- **Scroll:** below-the-fold cards reveal once on first view (opacity + 12 px).
- **Reduced motion:** with `prefers-reduced-motion`, replace movement with instant or opacity-only transitions; never lose information.

**User-friendliness rules (required)**
- **Command palette / quick actions** (⌘K / Ctrl+K and a search button in the header): go to any screen, log food, log weight, start today's workout, ask Nova. Arrow keys + Enter, Esc closes. Style per Brand OS tokens (Kokonut "Action Search Bar" pattern is a fine base).
- **Smart defaults:** meal = by time of day, last used serving, weight input pre-filled with last weight, today's workout preselected, last chat prompts remembered.
- **Undo over confirm:** reversible actions (add/remove food, uncheck set, log weight) show a toast with Undo; only destructive account actions ask for confirmation.
- **Forms:** validate on blur and on submit, focus the first invalid field, plain-language errors with the fix, disabled-while-saving buttons, Enter submits, numeric inputs use the right mobile keyboard (`inputMode`).
- **Unsaved changes:** Profile warns before leaving with an unsaved draft.
- **Mobile gestures:** swipe the week calendar, swipe-left to delete a food entry, pull-friendly bottom sheets, thumb-reachable primary actions, optional `navigator.vibrate` on set complete.
- **Orientation:** breadcrumbs/back links on every sub-page, visible current location, consistent primary action position.
- **Feedback everywhere:** every click/tap changes something visible within 100 ms (pressed state, toast, animation, or navigation).
- **Resilience:** all state in `localStorage`; storage failure falls back to in-memory with a quiet notice; no dead ends, every error has a retry or next step.
- **Accessibility:** WCAG AA contrast, visible focus, labelled controls, `aria-live` for toasts/chat/timers, 44 px touch targets, full keyboard operation, screen-reader friendly charts (text summary + table fallback).
- **Performance:** Lighthouse ≥ 90 (performance, accessibility, best-practices), code-split per route, no layout shift.

## 10. Sound and haptics (optional, user-controlled)

Off by default. One master toggle "Interface sounds" in Profile → Notifications. When on: soft ticks for set-complete, save-success, error, toast; never autoplay; respects system mute. Use Cuelume only after verifying it; otherwise tiny self-hosted audio files. Haptics (`navigator.vibrate`) follow the same toggle.

## 11. Feedback and quality loop

- A persistent, low-key **"Report a problem / Request a feature"** entry (Profile & Settings footer + a small ghost link in the sidebar footer). Frontend-only: opens a modal (type: Bug / Idea, message, optional email), validates, stores in `localStorage` (`fitai.feedback`), shows a success toast. Ready to be wired to a real endpoint later.
- Self-review rule for agents: after each screen, compare against the screenshot, run lint + typecheck, fix every deviation before moving on.
- Auto-fix rule: failing lint/type/build is fixed immediately, never left for the user.

## 12. Resource stack (what to use for what)

Verified from the sites on 2026-10-28 unless marked *unverified*.

**Use now (core build)**
| Need | Resource | Notes |
|---|---|---|
| Component source & patterns | **21st.dev** — 12k+ React + Tailwind components in shadcn-registry format; install with the shadcn CLI / `npx 21st add …`; also offers a "copy prompt" and an MCP for agents | Use as *starting code*; restyle fully with FitAI tokens. Useful categories: buttons, AI chat, cards, inputs, navigation, docks, sign-in. Good matches: Animated AI Chat (Coach), Spotlight Card (subtle only), Gradient Button (reference for the lime primary — do not add new gradients) |
| Accessible primitives & feedback UI | **Appica UI** (`@appica/ui-react`, React + Tailwind, per-component imports, RTL/container-query aware) | Matches FitAI needs: `Alert` (variants incl. success/error/info), `Toast`, `Progress`, `Meter`, `Sparkline`, `Tabs`, `Switch`, `Toggle Group`, `Number Field`, `Field`/`Form`, `Dialog`, `Drawer`, `Popover`, `Tooltip`, `Skeleton`, `Spinner`, `Data Table`, `Chip`, `Badge`. Check its Docs page for install/theme setup (not on the component page). Restyle to tokens |
| Rolling numbers | **NumberFlow** (number-flow.barvian.me) — *unverified here; npm package `@number-flow/react`* | Calories, kg, reps, percentages |
| Live/line charts | **Liveline** (benji.org/liveline) — *unverified* | Only if it can be themed to exactly match the weight-chart look; otherwise keep the hand-built SVG |
| Animated popovers/menus | **Animate UI** (animate-ui.com, Radix + motion) — *unverified* | Popover, tooltip, tabs motion |
| Motion engine | **Motion** (motion.dev) | Layout/enter/exit, number and bar transitions |

**Use selectively / inspiration (never copy the look)**
- **HorizonX** (horizonx.so): paid subscription library of UI kits, dashboards, textures, shaders, mockups, with a "Copy Prompt" feature and MCP. Commercial licence is included, but downloads are capped and it needs the user's own subscription. Use only for dashboard/section *structure* ideas or marketing assets (landing, App Store mockups). Not for in-app visuals.
- KokonutUI (Toolbar, Action Search Bar → candidate for the Food Search input), cult-ui (Morph Surface), toggles.dev (smooth toggle styling for Profile switches), motion.dev examples, kinetics.colorion.co, microkit.co (button polish) — *unverified*; adopt only if they pass the Brand OS checks in section 13.
- Design inspiration galleries: mobbin, kage.design, refero, navbar/footer/cta/404 galleries, minimal.gallery, designmd / thebrand.md (brand-file formats like this document).

**Phase 2 / marketing site only (not the app MVP)**
motionsites.ai, scrolltide (3D sites), shaders.com / shader-effects, backgrounds.supply, glass.samasante (liquid glass), 3dicons.co, jiro.build, modulify templates, prompt-motion.com, cuelume.dev (UI sounds), ssgoi.dev (PWA transitions), mapcn.dev (maps), surge.sh (share a static HTML preview of the design via a link), brandfetch / logotouse (logo assets).

**Do not use in the app:** 3D, liquid glass, shaders/backgrounds behind data, glow-heavy effects, parallax, anything that adds shadows, new accent colors, or new gradients.

## 13. Adoption checklist for any outside component

A component from any library ships only if **all** are true:
1. Rendered with FitAI tokens it is visually indistinguishable from the reference screen/component.
2. No new colors, shadows, gradients, radii, fonts or icon styles.
3. Keyboard + screen-reader accessible; focus ring visible; `prefers-reduced-motion` respected.
4. Dependency is small, maintained, and licence allows commercial use.
5. It is wrapped once in `src/components/ui/*` so the rest of the app never imports the library directly (swap-ready).

## 14. Design tokens (drop-in)

```css
:root{
  --bg-app:#0B0B0D; --bg-sidebar:#0F0F12; --surface-card:#151518; --surface-raised:#1C1C21;
  --surface-chip:#1F1F25; --surface-active:#23232A;
  --border-default:#26262C; --border-strong:#383841; --border-chip:#2C2C34; --border-active:#34343C;
  --text-primary:#F5F5F7; --text-secondary:#A1A1AD; --text-soft:#D4D4DC;
  --lime:#C6FF3D; --lime-hover:#D8FF73; --on-lime:#0B0B0D; --lime-tint:#1E2410; --lime-tint-border:#2F3A12;
  --violet:#A78BFA; --violet-soft:#C4B5FD; --violet-tint:#1A1626; --violet-border:#3B2F63;
  --amber:#FBBF24; --error:#FF7A7A;
  --radius-card:20px; --radius-card-sm:18px; --radius-field:14px; --radius-tile:12px; --radius-pill:999px;
  --font-heading:'Sora',sans-serif; --font-body:'DM Sans',system-ui,sans-serif;
}
```
```ts
// tailwind.config.ts (extend)
colors: { app:'#0B0B0D', sidebar:'#0F0F12', card:'#151518', raised:'#1C1C21', chip:'#1F1F25', active:'#23232A',
  line:{DEFAULT:'#26262C',strong:'#383841',chip:'#2C2C34',active:'#34343C'},
  ink:{DEFAULT:'#F5F5F7',muted:'#A1A1AD',soft:'#D4D4DC'},
  lime:{DEFAULT:'#C6FF3D',hover:'#D8FF73',tint:'#1E2410'}, violet:{DEFAULT:'#A78BFA',soft:'#C4B5FD',tint:'#1A1626'}, amber:'#FBBF24' },
borderRadius:{ card:'20px', field:'14px', tile:'12px' },
fontFamily:{ heading:['Sora','sans-serif'], body:['"DM Sans"','system-ui','sans-serif'] }
```

## 15. Using this OS

- **Cursor / Claude Code:** keep this file at `docs/BRAND_OS.md` and reference it in `.cursor/rules` ("Always follow docs/BRAND_OS.md; designs in design/ win on any conflict").
- **Designers:** build Figma variables/styles from sections 3–5; names map 1:1 to the tokens.
- **New feature checklist:** reuse an existing component → follow section 13 for anything new → write copy per section 2 → add motion per section 9 → add empty/loading/error states → compare to the closest existing screen.
- **Governance:** changes to this file need an explicit decision; log them in a `Changelog` section below.

### Changelog
- 2026-10-28 — v1.0, extracted from the finished FitAI designs; resource stack added.
- 2026-10-28 — v1.1, full motion + UX system (section 9), optional sound/haptics (section 10).
