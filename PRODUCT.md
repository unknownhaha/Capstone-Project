# Product

## Register

product

## Users

Primary users are **building accessibility inspectors** and capstone teams who audit sites against Thai standard **มยผ. 6301** (inclusive design for people with disabilities and older adults). They work on-site or between visits: on phones or tablets, often outdoors or in buildings with uneven connectivity. Secondary users include **project owners** who create inspections and **editors** invited via share links to score criteria in parallel.

Their job: pick the right criteria groups for a building, score each item (0 / 1 / 2), capture notes and photo evidence, compare against official reference diagrams, and track completion until the inspection is done.

## Product Purpose

This product is a **mobile-first inspection workspace**, not a marketing site. It replaces scattered spreadsheets and paper checklists with one authenticated flow: projects, sections, criteria, photos, and progress percentage. Success means inspectors can finish an audit faster, with fewer mistakes, and with evidence and standard references in one place.

## Brand Personality

**Clear, field-ready, trustworthy.** The UI should feel like a focused tool in your pocket: calm teal shell, white work surfaces, direct labels. Voice is practical and bilingual (English UI chrome + Thai standards content). Confidence comes from structure and legibility, not decoration.

## Anti-references

- Generic SaaS landing pages (hero metrics, gradient headlines, identical icon cards)
- Cream / sand / warm-neutral “AI default” backgrounds on app screens
- Dense admin dashboards with nested cards and side-stripe accent borders
- Playful consumer apps that hide critical inspection data behind animations
- Treating this like a dorm-finder or events marketplace (search-first, promotional tone)

## Design Principles

1. **Field-first clarity** — Every screen answers “what do I do next on this inspection?” before “how does this look?”
2. **Standards fidelity** — Catalog text, scores, and reference figures stay aligned with มยผ. 6301; the app supports the standard, it does not rewrite it.
3. **Evidence-backed scoring** — Notes, photos, and timestamps matter as much as the 0/1/2 score; empty states and conflicts must be explicit.
4. **Calm density** — Mobile shell (~420px), readable type, enough air for thumbs; avoid filling the viewport with decorative chrome.
5. **Inclusive tooling** — The inspector UI itself should meet WCAG AA contrast and respect reduced motion; inspectors model accessibility in their own product.

## Accessibility & Inclusion

- Target **WCAG 2.1 Level AA** for UI components (contrast, focus, touch targets ≥44px where feasible).
- Support **Thai and English** content; do not break Thai labels for layout convenience.
- Honor **`prefers-reduced-motion`** for any motion added in future polish.
- Photo upload and scoring flows must remain usable with screen readers where practical (labels, button names, error text).
