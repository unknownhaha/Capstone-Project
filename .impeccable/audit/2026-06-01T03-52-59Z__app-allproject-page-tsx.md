# Audit: app/allproject/page.tsx (dashboard)

**Date:** 2026-06-01T03:52:59Z  
**Target:** `app/allproject/page.tsx` and co-located shell styles/components  
**Detect:** 0 automated slop hits on core files

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 3 | Kebab menus can clip inside scrollable grid; search row under 44px |
| 2 | Performance | 4 | Lean client page, memoized filter, no layout-thrash patterns |
| 3 | Theming | 3 | Dashboard uses `--insp-*`; legacy hex/rgba remain in shared CSS |
| 4 | Responsive Design | 3 | Phone shell works; search touch and bottom-row menus need polish |
| 5 | Anti-Patterns | 3 | Progress ring is on-brand (not generic SaaS); minor ghost-card on empty CTA |
| **Total** | | **16/20** | **Good** |

**Rating band:** Good (14–17). Address P1 items before release; P2 in next polish pass.

## Anti-Patterns Verdict

**Pass (intentional product chrome).** The dashboard reads as a field inspection tool, not a generic SaaS landing page. The conic progress ring matches DESIGN.md (“Field Clipboard”) and is not interchangeable with a hero-metric marketing block.

**Minor tells (P2/P3):**
- `emptyIconWrap` and `startProjectBtn` pair inset border with 8–24px blur shadows (codex ghost-card pattern).
- Frosted glass on search/add controls is environmental, not decorative glassmorphism-by-default.
- Decorative emoji in empty state (`🏗️`) is acceptable but not ideal for a11y consistency.

## Executive Summary

- **16/20 (Good)** — up from layout polish: semantic sections, scrollable project grid, tokenized spacing.
- **Issues:** P0: 0 · P1: 2 · P2: 6 · P3: 4
- **Top issues:** (1) Project kebab menu uses `position: absolute` inside `.grid` with `overflow-y: auto`, so menus on lower cards can clip. (2) Search pill lacks 44px minimum touch height. (3) Residual hard-coded colors in `allproject.module.css` / `project-card.module.css`.
- **Next:** `/impeccable polish allproject page` for P1 fixes, then `/impeccable extract` for remaining hex.

## Detailed Findings

### P1 — Major

**[P1] Kebab menu clipped by scroll container**
- **Location:** `project-card.module.css` `.cardMenu`; parent `.grid` in `allproject.module.css`
- **Category:** Accessibility / Interaction
- **Impact:** Share/upload/delete actions may be partially hidden for projects in the bottom row or while scrolling.
- **WCAG:** 2.1.1 Keyboard, 1.4.10 Reflow (content not fully available)
- **Recommendation:** Render menu in a `position: fixed` panel (measure anchor rect) or use popover API / portal.
- **Suggested command:** `/impeccable polish allproject page`

**[P1] Search field touch target below 44px**
- **Location:** `allproject.module.css` `.search`, `.search input` (~10px vertical padding, 15px font)
- **Category:** Responsive / Accessibility
- **Impact:** Harder tap target on site for gloved or motor-impaired users; below PRODUCT.md ≥44px goal.
- **WCAG:** 2.5.5 Target Size (AAA aspiration; AA best practice for mobile tools)
- **Recommendation:** `min-height: var(--insp-touch-min)` on `.search` or input; keep icon offset.
- **Suggested command:** `/impeccable adapt allproject page`

### P2 — Minor

**[P2] `role="img"` combined with `aria-live` on progress ring**
- **Location:** `page.tsx` ~151–164
- **Category:** Accessibility
- **Impact:** Assistive tech may not announce completion updates as expected.
- **Recommendation:** Use `role="group"` with `aria-live="polite"` or expose stats in visually hidden live region.
- **Suggested command:** `/impeccable polish allproject page`

**[P2] Card menu items shorter than 44px**
- **Location:** `project-card.module.css` `.menuItem` (12px padding)
- **Category:** Accessibility
- **Impact:** Menu rows ~37px tall.
- **Recommendation:** `min-height: var(--insp-touch-min)` on `.menuItem`.
- **Suggested command:** `/impeccable polish allproject page`

**[P2] Hard-coded colors outside token system**
- **Location:** `allproject.module.css` (shadows, `#f8fffe`, legacy blocks); `project-card.module.css` (`#f3f5f5`, `#c62828`)
- **Category:** Theming
- **Impact:** Drift from DESIGN.md; harder global theme updates.
- **Recommendation:** Map to `--insp-color-*` or add semantic tokens.
- **Suggested command:** `/impeccable extract allproject page`

**[P2] Ghost-card pattern on empty-state CTA**
- **Location:** `allproject.module.css` `.emptyIconWrap`, `.startProjectBtn`
- **Category:** Anti-Pattern
- **Impact:** Subtle AI/codex tell (border + wide shadow stack).
- **Recommendation:** Pick border OR shadow per DESIGN elevation rules.
- **Suggested command:** `/impeccable quieter allproject page`

**[P2] Auth-loading skeleton not in `projectsSection`**
- **Location:** `page.tsx` lines 77–95
- **Category:** Responsive / Layout
- **Impact:** Loading gate grid does not share scroll flex contract with authenticated view.
- **Recommendation:** Mirror `projectsSection` + `phoneMain` structure for consistency.
- **Suggested command:** `/impeccable layout allproject page`

**[P2] Status chip 10px type on cards**
- **Location:** `project-card.module.css` `.status`
- **Category:** Accessibility
- **Impact:** Small text; verify contrast on `#ffd166` (likely OK for bold, borderline for 10px).
- **Recommendation:** Bump to 11–12px or use label token size.
- **Suggested command:** `/impeccable typeset allproject page`

### P3 — Polish

**[P3] Hidden scrollbars on project grid**
- **Location:** `allproject.module.css` `.grid::-webkit-scrollbar`
- **Category:** Accessibility
- **Impact:** Low vision users may not see scroll affordance.
- **Recommendation:** Thin visible scrollbar or scroll hint when overflow.

**[P3] Decorative emoji empty icon**
- **Location:** `page.tsx` empty state
- **Category:** Anti-Pattern / A11y
- **Impact:** Voice varies; not described for screen readers (wrap is `aria-hidden`).
- **Recommendation:** SVG icon with `aria-hidden` or short text label.

**[P3] `gridMessage` uses raw `color: white`**
- **Location:** `allproject.module.css`
- **Recommendation:** `var(--insp-color-on-shell)`.

**[P3] Large legacy CSS block in `allproject.module.css`**
- **Location:** Lines ~640+ (inspection/login legacy)
- **Impact:** Bundle/CSS noise; audit scope confusion.
- **Recommendation:** Split modules by route in a later refactor.

## Patterns & Systemic Issues

- **Overflow + absolute menus:** Any dropdown inside `.grid` will share the clipping risk until menus portal out.
- **Touch targets:** Primary chrome (menu, retry, add) meets 44px; secondary rows (search, menu items, badges) lag.
- **Token migration:** Dashboard shell migrated; card menus and legacy monolith CSS still use hex.

## Positive Findings

- **Bilingual labels** on shell, errors, search, and CTAs (EN · TH).
- **Modal stack:** Create, share, delete, sidebar use `useModalA11y`, dialog roles, backdrop buttons, z-index scale.
- **Load errors:** Typed kinds, retry, sign-in link on 401, `role="alert"`.
- **Layout:** `phoneMain` + `projectsSection` + scrollable grid with `min-height: 0` flex contract.
- **Reduced motion** on primary shell buttons and empty-state CTA.
- **Detect:** No gradient-text, eyebrow, or numbered-section slop on audited files.

## Recommended Actions

1. **[P1] `/impeccable polish allproject page`:** Portal/fixed kebab menus; fix progress ring live region; 44px menu rows.
2. **[P1] `/impeccable adapt allproject page`:** `min-height: 44px` on search pill.
3. **[P2] `/impeccable extract allproject page`:** Remaining hex in card + monolith CSS.
4. **[P2] `/impeccable quieter allproject page`:** Simplify empty-state elevation (optional).
5. **`/impeccable polish allproject page`:** Final pass after fixes.
