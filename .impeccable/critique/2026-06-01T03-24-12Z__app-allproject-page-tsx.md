---
target: allproject
total_score: 21
p0_count: 0
p1_count: 2
p2_count: 3
p3_count: 0
timestamp: 2026-06-01T03-24-12Z
slug: app-allproject-page-tsx
---
# Critique: All Project dashboard (`app/allproject/page.tsx`)

**Target:** allproject  
**Date:** 2026-05-31  
**Assessments:** A (source + design director), B (detect CLI + browser; overlay skipped)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Text-only loading; no surfaced API/network failure |
| 2 | Match System / Real World | 3 | English chrome vs Thai standards content elsewhere |
| 3 | User Control and Freedom | 3 | Modals/sidebar close paths are solid |
| 4 | Consistency and Standards | 3 | PhoneShell pattern holds; body gradient duplicates shell |
| 5 | Error Prevention | 2 | Fetch errors not distinguished from empty list |
| 6 | Recognition Rather Than Recall | 2 | Icon-only menu control; decorative search gear |
| 7 | Flexibility and Efficiency | 2 | Search helps; no shortcuts or batch paths |
| 8 | Aesthetic and Minimalist Design | 2 | Top row competes (add + ring + search) |
| 9 | Error Recovery | 1 | Silent failure when `/api/project` is not ok |
| 10 | Help and Documentation | 1 | No contextual guidance for first inspection |
| **Total** | | **21/40** | **Acceptable** |

## Anti-Patterns Verdict

**LLM assessment:** Not generic SaaS cream; teal field shell matches PRODUCT.md "field clipboard." Mild tells: donut progress widget with micro-stat row (hero-metric cousin), uppercase "Completed" at 10px, emoji chrome (search/empty). Card grid is appropriate for a project list, not reflex icon-cards.

**Deterministic scan:** `detect.mjs` on `page.tsx`, `PhoneShell.tsx`, `ProjectCard.tsx`, `CreateProjectModal.tsx` returned **0 findings** (exit 0).

**Browser visualization:** Navigated to `http://localhost:3000/allproject`; redirected to **login** (auth required). Script injection for `detect.js` was **not completed** (Smart Mode blocked CDP mutation). No reliable overlay on the dashboard surface.

## Overall Impression

The dashboard reads as a purposeful mobile inspection hub: teal shell, white project cards, clear empty state. The biggest gap is **trust under failure**: network/API errors look like "no projects," and the header menu is not a real button for keyboard and screen reader users.

## What's Working

1. **Empty state** centers in the grid with a single primary CTA ("Start Project") that mirrors the + affordance.
2. **Search** has a proper `aria-label` and a dedicated no-results message when filtering.
3. **Project cards** use stronger a11y patterns (menu `role="menu"`, labeled options) than the shell header.

## Priority Issues

### [P1] Header menu is not a focusable control
- **What:** `PhoneShell` renders `☰` on a `<div onClick>` with no `aria-label`, `tabIndex`, or keyboard handler.
- **Why:** Sam cannot open navigation; violates inclusive tooling principle in PRODUCT.md.
- **Fix:** Use `<button type="button" aria-label="Open navigation menu">` with visible `:focus-visible` styles.
- **Suggested command:** `/impeccable audit`

### [P1] Project load failures are invisible
- **What:** `fetch("/api/project")` only updates state when `res.ok`; failures end as empty list or stale data after loading ends.
- **Why:** Inspectors on poor connectivity lose trust; Riley sees "broken" silent behavior.
- **Fix:** Track `error` state; show inline alert with retry; distinguish from empty.
- **Suggested command:** `/impeccable harden`

### [P2] False affordance in search row
- **What:** Trailing `⚙️` is `aria-hidden` but looks tappable; no action wired.
- **Why:** Jordan assumes settings/filter exist; wastes taps.
- **Fix:** Remove ornament or wire filters with `aria-label="Filter projects"`.
- **Suggested command:** `/impeccable distill`

### [P2] Progress ring micro-copy is hard to read
- **What:** `.profileStats p` uses **8px** type on teal (`allproject.module.css`).
- **Why:** Outdoor/glare use fails WCAG AA for body-sized text; duplicates card-level progress anyway.
- **Fix:** Bump stats to ≥12px or collapse ring to one number + link to analytics later.
- **Suggested command:** `/impeccable typeset`

### [P2] Top-of-screen cognitive load
- **What:** Create (+), aggregate ring (%, All/Done/Active), and search compete before the task list.
- **Why:** Violates "field-first clarity" (what project next?); working memory >4 chunks.
- **Fix:** Demote ring to list footer or project detail; keep search + primary create.
- **Suggested command:** `/impeccable layout`

## Persona Red Flags

**Sam (accessibility):** Cannot activate sidebar from keyboard; progress ring stats likely fail contrast at 8px; loading state is unlabeled plain text outside PhoneShell semantics.

**Casey (mobile, distracted):** Primary create is top-left (thumb reach weak on large phones); interruption during load may show wrong empty state if API failed.

**Maya (Field Inspector, project-specific):** English "My Project / Inspection Dashboard" while audit content is Thai; aggregate % does not name which site to open next; no offline/retry messaging.

## Minor Observations

- Duplicate page gradient (`globals.css` body + `.phone` gradient).
- Title grammar: "My Project" with plural list.
- Loading uses inline styles on auth gate vs shared components.
- `prefers-reduced-motion` not applied to `.addBox` hover transforms.

## Questions to Consider

- Should the dashboard default sort surface the **most incomplete** project first?
- Is portfolio-level completion % needed on every visit, or only inside a project?
- Would Thai labels for shell chrome reduce cognitive switching for primary users?
