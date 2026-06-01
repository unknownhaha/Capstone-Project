---
target: project page (allproject dashboard)
total_score: 29
p0_count: 0
p1_count: 0
p2_count: 4
p3_count: 1
timestamp: 2026-06-01T04-19-18Z
slug: app-allproject-page-tsx
---
# Critique: My Projects dashboard (`app/allproject/page.tsx`)

**Target:** project page (My Projects /allproject dashboard)  
**Date:** 2026-05-31  
**Assessments:** A (source + design director + browser snapshot), B (detect CLI clean; overlay not run on Next dev surface)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Skeletons, `aria-live` summary, load-error alert with retry |
| 2 | Match System / Real World | 3 | Bilingual EN/TH fits inspectors; ring stats are abstract vs "next checkpoint" |
| 3 | User Control and Freedom | 3 | Sidebar, modals, retry/sign-in on errors |
| 4 | Consistency and Standards | 3 | Tokenized shell/cards; document title still default Next.js |
| 5 | Error Prevention | 3 | Delete confirm on cards; create flow in modal |
| 6 | Recognition Rather Than Recall | 3 | Labeled search + menu; ring detail is `aria-hidden` (summary in sr-only) |
| 7 | Flexibility and Efficiency | 2 | Search only; no keyboard shortcuts or batch actions |
| 8 | Aesthetic and Minimalist Design | 3 | Clear white cards; toolbar still dense (create + ring + frosted list) |
| 9 | Error Recovery | 3 | Typed load errors with retry and sign-in link |
| 10 | Help and Documentation | 2 | No first-run hint tying projects to มยผ. sections |
| **Total** | | **29/40** | **Good** |

## Anti-Patterns Verdict

**LLM assessment:** Does not read as generic SaaS AI. Teal phone shell, mint ring, and white inspection cards match PRODUCT.md field-tool positioning. Residual tells: donut summary with three micro-stat columns (hero-metric cousin, intentional per product choice), frosted `listPanel` glass on an already-gradient shell, and four-line bilingual header before the task list. No gradient text, section eyebrows, numbered markers, or identical icon-card grids.

**Deterministic scan:** `detect.mjs` on `page.tsx`, `PhoneShell.tsx`, `ProjectCard.tsx` returned **0 findings** (exit 0).

**Browser visualization:** Live page at `http://localhost:3000/allproject` (authenticated). CDP preflight mutation succeeded; bundled `detect.js` overlay path not applied on the Next dev app (no separate live-server inject). Assessment relied on accessibility snapshot + screenshot.

## Overall Impression

The dashboard now feels like a shippable inspection hub: trustworthy load/error paths, a real menu button, and cards that lead with project identity. The main tension is **information hierarchy vs. the kept progress ring**: the top third still answers "how am I doing overall?" before "which site do I open next?", which fights field-first clarity even though the layout no longer breaks.

## What's Working

1. **Failure transparency:** `loadError` banner with bilingual titles, retry, and sign-in when unauthorized replaces silent empty states.
2. **Create affordance:** White 96px "New" tile is unmistakable, 44px+ touch target, paired with empty-state CTA.
3. **Card list a11y:** Project entries expose meaningful button names in the accessibility tree; kebab menus use fixed positioning to avoid scroll clipping.

## Priority Issues

### [P2] Toolbar competes with the project list for attention
- **What:** Grid row pairs a large create tile with a capped progress ring (%, Completed, All/Done/Active) above search and cards.
- **Why:** Inspectors opening the app outdoors need the next project in under 3 seconds; aggregate stats duplicate per-card progress pills.
- **Fix:** Keep the ring if required, but shrink it to a single mint % + one line, or move summary below the first row of cards; let search + list headline dominate vertical rhythm.
- **Suggested command:** `/impeccable layout`

### [P2] Ring interior type is still stressfully small
- **What:** `.profileStats p` remains 10px with bilingual sublabels inside the donut.
- **Why:** Glare and arm's-length phone use fail PRODUCT.md inclusive tooling; Jordan misreads counts.
- **Fix:** Minimum 12px for stat labels, or drop in-ring Thai duplicates and rely on the sr-only summary + card list.
- **Suggested command:** `/impeccable typeset`

### [P2] Frosted list panel adds decorative layer on decorative shell
- **What:** `listPanel` uses `--insp-glass-1` behind white cards on a teal gradient.
- **Why:** Reads as glassmorphism-by-default; cards already provide separation.
- **Fix:** Use transparent panel with spacing only, or a flat `--insp-color-surface-panel` tint without blur connotation.
- **Suggested command:** `/impeccable quieter`

### [P2] Load-error card uses border plus soft shadow
- **What:** `.loadError` sets `border: 1px solid` and `box-shadow: var(--insp-shadow-card-teal)`.
- **Why:** Matches codex ghost-card pattern; competes with danger messaging.
- **Fix:** Pick border OR short shadow (≤8px blur), not both.
- **Suggested command:** `/impeccable polish`

### [P3] Page metadata still generic
- **What:** Browser tab title remains "Create Next App".
- **Why:** Breaks trust/consistency when multitasking on site.
- **Fix:** Set route metadata to "My Projects · โครงการของฉัน".
- **Suggested command:** `/impeccable clarify`

## Persona Red Flags

**Alex (Power User):** No keyboard shortcut to create or focus search; must tap each project card individually; ring stats are not actionable.

**Jordan (First-Timer):** Header stacks four lines before any project; ring labels mix English and Thai in 10px type; no hint that cards open the inspection hub.

**Sam (Accessibility):** Menu and create are proper buttons with `aria-label`; progress group has `aria-live` summary (strong). Decorative ring numbers are `aria-hidden`, which is correct only if the sr-only summary stays in sync.

**Casey (Mobile):** Primary actions (create, menu) sit high (reachable); search is mid-screen; scrollable grid works one-handed once past the tall toolbar.

**Field Inspector (project-specific):** Wants "next incomplete criterion" but sees portfolio averages first; search helps only after remembering project names.

## Minor Observations

- Search uses CSS-drawn magnifier (good: no emoji gear).
- `listMeta` ("N of M shown") appears only when filtering (appropriate).
- Yellow progress pills on cards may need contrast check against white in a future `/impeccable audit`.
- Legacy CSS blocks below line ~640 in `allproject.module.css` increase maintenance risk.

## Questions to Consider

- If the ring stays, what is the one number inspectors actually need before they tap a card?
- Would collapsing header subtitle lines free vertical space without losing bilingual compliance?
- What would "open the next unfinished project" look like as a single primary action?
