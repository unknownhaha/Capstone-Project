# Audit: `app/allproject` (dashboard + shared route tree)

**Date:** 2026-06-01T04:30:00Z  
**Target:** `app/allproject/` (primary surface: `page.tsx` dashboard)  
**Detect:** 4 warnings in `MLAssessment.tsx` / `ml-assessment.module.css` (side-tab, layout transition); 0 on dashboard core TSX

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 3 | Strong landmarks/labels; ring + header micro-type on teal likely below AA |
| 2 | Performance | 4 | Lean client dashboard, memoized filter, fixed menus avoid reflow traps |
| 3 | Theming | 3 | Dashboard uses `--insp-*`; legacy hex in items, MLAssessment, `[projectId]` |
| 4 | Responsive Design | 4 | 420px shell, 44px search/create/kebab; sidebar close still 36px |
| 5 | Anti-Patterns | 3 | On-brand ring; mild glass list panel + loadError ghost-card |
| **Total** | | **17/20** | **Good** |

## Anti-Patterns Verdict

**Pass for dashboard.** Teal shell + mint ring + white cards match DESIGN.md; not generic SaaS cream or icon-card grids.

**Detector (route tree):** Side-tab borders in MLAssessment (not on dashboard list). Dashboard: frosted `listPanel`, `loadError` border + 18px blur shadow.

## Executive Summary

- **17/20 (Good)** — up from **16/20**; prior P1s (menu clip, search height) are fixed.
- **Issues:** P0: 0 · P1: 2 · P2: 7 · P3: 3
- **Top issues:** (1) 10px ring stat labels on teal. (2) 11px header subtitle at 76% white on teal. (3) Legacy hex outside tokenized dashboard CSS.
- **Next:** `/impeccable typeset` + `/impeccable polish` on dashboard; `/impeccable extract` for sibling modules.
