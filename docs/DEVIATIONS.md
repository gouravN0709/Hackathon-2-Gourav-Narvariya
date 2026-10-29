# Deviations from the design export

Where the design source (`project/*.dc.html`), the screenshots and the written brief disagreed, the source and screenshots won. Everything below is either a deliberate change or a gap that could not be matched exactly.

## Layout and navigation

| Area | Design | Implementation | Why |
| --- | --- | --- | --- |
| Tablet (820px) | Screenshots show the 248px sidebar stacked above the content, because the source sidebar is not responsive. | 820–1023px uses a 78px icon rail; 1024px and up uses the full 248px sidebar, collapsible to 78px. | Stacked navigation at 820 is an artefact of the static export. The brief asks for a usable sidebar down to 820px. |
| Mobile (under 820px) | Mobile screenshots of every screen except the dashboard show the desktop sidebar stacked on top. | Bottom tab bar (Home, Coach, Workouts, Nutrition, Progress) plus a top bar with the logo and an avatar link to Profile. | Required by the brief; matches `Mobile.dc.html`. |
| Mobile Active Workout, Coach, Progress, Nutrition | No dedicated artboards (`DESIGN-SPEC.md` §86). | Same visual language, with a sticky "Finish & save" bar (Active Workout), a sticky composer and scrollable prompt chips (Coach), a 2-up stat grid (Progress), and a horizontally scrollable exercise rail. | The brief asks for mobile layouts for these screens. |
| Active Workout route | Full-screen, no sidebar. | Lives in its own `(focus)` route group at `/workouts/active`, so it renders without the app shell. | Matches the screenshot. |

## Content and copy

- **Glyphs:** the `✓`, `⏱` and `←` text glyphs in the source were replaced with inline stroke SVG icons (check, clock, chevron), as required by the "no emoji / SVG icons" rule.
- **Session saved message:** the source says "1 sets, …". The implementation pluralises correctly ("1 set").
- **Goal ETA:** "you'll get there around early December" is static copy from the source. It is not recomputed from the weekly rate.
- **Nutrition AI suggestion:** after the Paneer tikka bowl is added, the button changes to a disabled "Added to Dinner" state. The source lets you add it repeatedly.
- **Progress averages:** the source hard-codes 2,310 kcal / 128 g (7 days) and 2,380 kcal / 141 g (30 days). These are now computed from a seeded 30-day nutrition history plus today's live log. The seed reproduces the design's numbers exactly, and they move when you log food.

## Additions not in the design

- **Feedback entry:** a low-key "Report a problem / Request a feature" link in the sidebar footer and at the bottom of Profile & Settings. Opens an accessible modal (Bug / Idea toggle, description, optional email) that validates, persists entries to `localStorage` (`fitai.feedback`), and displays a success toast.
- **Motion layer:** `NumberStat` rolling counter for numeric values (calories, kg, protein, reps, percentages), and 700ms ease-out draw/fill transitions for `Ring` and `ProgressBar`, respecting `prefers-reduced-motion`.
- **Calorie trend (Progress):** a bar chart of daily calories against the target, drawn from the seeded nutrition history. It sits below the screenshot-matched content so the designed layout is unchanged.
- **Reset demo data (Profile → Session):** a small text button that restores the seeded sample week while keeping you signed in.
- **Interactive weight charts:** hover, tap or arrow keys move the tooltip between points. The design shows a static tooltip on the latest point, and that is still the default.
- **Account deleted screen:** shown before the route guard returns you to Log in. A non-persisted `justDeleted` flag allows this, and it is cleared when the login page opens.

## Rendering differences

- **Fonts:** the reference screenshots were captured with a system fallback font. The app loads Sora (headings, numbers) and DM Sans (body) through `next/font`, as the spec requires, so glyph widths and line breaks differ slightly. For example, "Protein is averaging 19 g under target" wraps onto two lines at 1440px.
- **Chart tooltips:** the design export renders the weight-chart tooltip as an empty box (placeholder data). The app fills it with the date and value.
- **Consistency bars:** the app shows value labels above the bars, as the source logic does. The static screenshot omits them.
