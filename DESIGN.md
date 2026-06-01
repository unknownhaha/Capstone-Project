---
name: Capstone Accessibility Inspection
description: Mobile-first inspection workspace for มยผ. 6301 — calm teal shell, white work surfaces.
colors:
  shell-outer: "#111111"
  shell-teal-light: "#7fb3b6"
  shell-teal: "#5f9ea0"
  shell-teal-deep: "#4a8588"
  surface-white: "#ffffff"
  surface-muted: "#f8fafa"
  ink-primary: "#1a2e30"
  ink-secondary: "#4a6062"
  ink-muted: "#9ab0b2"
  accent-teal: "#2d6a6a"
  accent-teal-bright: "#5f9ea0"
  progress-complete: "#57cc99"
  score-warning: "#ffd166"
  score-fail: "#ef476f"
  border-subtle: "#e2ecec"
  error-surface: "#fff0f3"
  error-ink: "#c41e3a"
typography:
  display:
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  sm: "8px"
  md: "12px"
  lg: "18px"
  xl: "20px"
  pill: "999px"
  phone: "28px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "18px"
  xl: "28px"
components:
  button-primary:
    backgroundColor: "{colors.shell-teal}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.md}"
    padding: "14px 28px"
  button-primary-hover:
    backgroundColor: "{colors.shell-teal-deep}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.md}"
    padding: "14px 28px"
  button-surface:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.accent-teal}"
    rounded: "{rounded.pill}"
    padding: "14px 28px"
  input-default:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "48px"
---

# Design System: Capstone Accessibility Inspection

## 1. Overview

**Creative North Star: "The Field Clipboard"**

The interface behaves like a rugged clipboard you carry on site: a calm **teal shell** frames every task, and **white panels** hold the real work (projects, criteria, scores, photos). Decoration stays minimal; hierarchy comes from size, weight, and the green progress ring, not from marketing chrome.

This system rejects generic SaaS dashboards, cream “AI default” app backgrounds, nested card stacks, and promotional landing-page patterns listed in PRODUCT.md. Density is tuned for thumbs on a ~420px phone column, with occasional scrollable profile-style pages.

**Key Characteristics:**

- Vertical **phone shell** (~420px max-width) on a dark outer stage (`#111`)
- **Committed teal gradient** shell (`#7fb3b6` → `#5f9ea0` → `#4a8588`, dashboard uses 3-stop via `--insp-gradient-shell`)
- **White cards** (18px radius) for project and inspection content
- **Semantic score chips**: amber in-progress (`#ffd166`), green complete (`#57cc99`), red fail (`#ef476f`)
- **Geist** (Next.js font) for UI; Thai standard text preserved in content areas
- Soft elevation via shadow + tonal contrast, not glassmorphism

## 2. Implementation tokens

Runtime CSS variables live in [`app/inspection-tokens.css`](app/inspection-tokens.css) (imported from `app/layout.tsx`). Use `var(--insp-*)` in CSS modules under `app/allproject/`.

| Token | Value | Use |
|-------|-------|-----|
| `--insp-gradient-shell` | light → mid → deep teal | Phone environment |
| `--insp-color-shell-inner` | `#5f9ea0` | Progress ring hole (matches gradient) |
| `--insp-glass-1` … `--insp-glass-4` | white alpha ladder | Search, add box, frosted chrome |
| `--insp-color-progress` | `#57cc99` | Mint completion ring (unchanged) |
| `--insp-shadow-card-teal` | teal-tinted rgba | Project cards on shell |
| `--insp-color-surface` | `#ffffff` | Cards, modals, error panels |
| `--insp-color-accent` | `#2d6a6a` | Primary actions on white |
| `--insp-phone-max-width` | `420px` | Shell column |
| `--insp-z-modal` | `60` | Create project sheet |
| `--insp-z-alert` | `70` | Delete confirm |

Add new tokens here and in `inspection-tokens.css` together; avoid one-off hex in `allproject` styles.

## 3. Colors

A restrained product palette: teal carries the environment; white carries tasks; green carries completion.

### Primary

- **Cadet Teal Shell** (`#5f9ea0` / gradient to `#7fb3b6`, `#4a8588`): Phone background, login hero, search pill tint, focus rings, primary buttons. This is the field environment color, not a decorative accent stripe.
- **Deep Teal Ink** (`#2d6a6a`): Primary actions on white surfaces (Start Project label, share actions). Used sparingly on white, never as body text on teal.

### Secondary

- **Progress Mint** (`#57cc99`): Completion ring, conic progress on dashboard, “pass” score state. Signals done work, not brand decoration.

### Tertiary

- **Score Amber** (`#f0d78c`, ink `#3a4530`): In-progress badges on cards; slightly cooled toward shell hue.

### Neutral

- **Stage Black** (`#111111`): Outer `container` backdrop behind the phone mockup.
- **Work Surface White** (`#ffffff`): Project cards, login form sheet, inspection panels, modals.
- **Cool Paper** (`#f8fafa`): Input backgrounds, inspection sheet bases.
- **Ink Primary** (`#1a2e30`): Headings, criterion titles, primary labels.
- **Ink Secondary** (`#4a6062`, `#6a8082`): Metadata, kebab menus, secondary lines.
- **Ink Muted** (`#9ab0b2`): Placeholders, hints (verify ≥4.5:1 on `#f8fafa`; bump toward `#4a6062` if borderline).
- **Divider Mist** (`#e2ecec`): Input borders, section separators.
- **Alert Rose** (`#fff0f3` / `#c41e3a`): Form errors, destructive affordances.

### Named Rules

**The Shell vs. Sheet Rule.** Teal gradients belong to the phone shell and auth hero only. Inspection checklists and forms sit on white or `#f8fafa` sheets. Never place long gray body copy directly on the teal gradient.

**The One Accent Rule.** Teal is environmental; green is progress; amber is status. Do not add a fourth accent family for decoration.

## 4. Typography

**Display Font:** Geist Sans (`var(--font-geist-sans)`) via `app/layout.tsx`  
**Body Font:** Geist Sans with Arial/Helvetica fallback (`app/globals.css` legacy)  
**Mono Font:** Geist Mono (`var(--font-geist-mono)`) for code or IDs if needed

**Character:** Clear, slightly tight headings (`letter-spacing: -0.02em` on heroes); practical sizes for outdoor glare. Avoid display-scale marketing type inside the app shell.

### Hierarchy

- **Display** (700, 28–32px, line-height ~1.1): Screen titles (“My Project”), login hero title. Max practical size inside phone shell.
- **Headline** (700, 20–22px): Section titles, empty state headings, progress percentage in ring.
- **Title** (600–700, 15–17px): Project names on cards, dialog titles, form section labels.
- **Body** (400, 13–15px, line-height 1.45): Criterion text, subtitles, helper copy. Keep Thai labels at comfortable line-height; do not squeeze multi-line Thai for layout.
- **Label** (600, 10–13px, occasional uppercase with `letter-spacing: 0.5px`): Stats in progress ring, compact metadata. Reserve uppercase for ≤4 words.

### Named Rules

**The Task Type Rule.** UI chrome in English; standard catalog content in Thai. Do not reduce Thai body size below 13px for “density.”

## 5. Elevation

Depth is conveyed through **soft shadows on white surfaces** and **tonal separation from the teal shell**, not through heavy Material elevation stacks.

### Shadow Vocabulary

- **Card lift** (`box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1)`): Project cards on the dashboard grid.
- **Sheet rise** (`0 -8px 32px rgba(0, 0, 0, 0.08)`): Login white card overlapping teal hero.
- **Phone frame** (`0 24px 64px rgba(0, 0, 0, 0.35)`): Device shadow on auth shell.
- **Button depth** (`0 8px 20px rgba(74, 133, 136, 0.35)`): Primary login CTA.
- **Focus ring** (`0 0 0 3px rgba(95, 158, 160, 0.15–0.18)`): Inputs and fields, not box-shadow stacks.

### Named Rules

**The Flat Card Interior Rule.** Cards do not nest cards. Inspection rows use borders and background tints (`#f8f9fa` sheets), not stacked white-on-white shadows.

**The No Glass Default Rule.** `backdrop-filter` appears only on login logo mark (light frosted plate). Do not extend glassmorphism to dashboard cards or modals.

## 6. Components

### Buttons

- **Shape:** Pill for primary CTAs on teal (`border-radius: 999px`); rounded rectangles (12–14px) on white forms.
- **Primary on teal:** White fill, `#2d6a6a` text (Start Project); hover lifts with shadow, slight `translateY(-2px)`.
- **Primary on white:** Teal gradient or solid `#5f9ea0` → `#4a8588` (login); white text; active scale `0.97`.
- **Ghost / icon:** Kebab `28×28px`, transparent hover `#f0f3f3`; add box `rgba(255,255,255,0.3)` with scale on press.
- **Hover / Focus:** `transform` and shadow on CTAs; `outline: 2px solid #fff` or teal focus ring on shell controls; `outline: 2px solid #2d4a4c` on inspection controls.

### Chips

- **Status badge** (`% Done`): `width: fit-content`, `#ffd166` background, 10px type, pill radius on cards.
- **Score states** (inspection): Red `#ef476f`, amber `#ffd166`, green `#57cc99` circular or pill indicators in `items.module.css`.

### Cards / Containers

- **Corner Style:** 18px on project cards; 28px top radius on login sheet; 22px on inspection bottom sheets.
- **Background:** `#ffffff` on grid cards; semi-transparent white on search bar (`rgba(255,255,255,0.35)`).
- **Shadow Strategy:** Card lift shadow only; no side accent borders.
- **Border:** 1px `#e2ecec` on inputs and rows; avoid `border-left` accent stripes.
- **Internal Padding:** 10px card padding; 28px empty state vertical padding; 14px grid gap.

### Inputs / Fields

- **Style:** 48px height, `#f8fafa` fill, 1.5px `#e2ecec` border, 12px radius (login and inspection).
- **Focus:** Border `#5f9ea0`, white background, 3px teal glow.
- **Error:** `#fff0f3` surface, `#ffc9d4` border, `#c41e3a` text, 12px radius.
- **Search (dashboard):** Borderless inside frosted pill; transparent input on `rgba(255,255,255,0.35)` track.

### Navigation

- **Phone header:** White text on teal, 32px title, 12px subtitle, hamburger `☰` (24px).
- **Sidebar overlay:** App sidebar pattern in `sidebar.module.css` (slide-in; z-index 30+).
- **No persistent tab bar;** task flow is dashboard → project → criteria group.

### PhoneShell (signature)

- **Outer:** `#111` full viewport, centers `max-width: 420px` column.
- **Inner:** Teal vertical gradient, 16px padding, flex column; scrollable variant for profile pages.
- **Progress ring:** Conic `#57cc99` on `rgba(255,255,255,0.2)` track; donut cutout; white stat labels inside.

## 7. Do's and Don'ts

### Do:

- **Do** keep the phone column at **max-width 420px** for inspection flows; expand to scrollable full-height only where content requires (profile).
- **Do** use **white cards on teal** for scannable project lists; keep grid `align-items: start` so cards stay content-height.
- **Do** use **verb + object** button labels (“Start Project”, “Save changes”, “Delete project”).
- **Do** maintain **WCAG AA contrast** on white surfaces; darken muted placeholder grays if contrast fails on `#f8fafa`.
- **Do** honor **`prefers-reduced-motion: reduce`** on any new transitions (scale, translateY, conic animations).

### Don't:

- **Don't** use **generic SaaS landing pages** (hero metrics, gradient headlines, identical icon card grids) inside the app shell.
- **Don't** use **cream / sand / warm-neutral AI default** backgrounds on app screens.
- **Don't** build **dense admin dashboards with nested cards** or **side-stripe accent borders** (`border-left` > 1px colored).
- **Don't** hide inspection data behind **playful consumer animations** or promotional empty states.
- **Don't** treat the product like a **dorm-finder or events marketplace** (search-first hero, promotional tone).
- **Don't** add **gradient text**, **glassmorphism-by-default**, or **numbered section eyebrows** (01 / 02 / 03) across screens.
- **Don't** stretch project cards to fill the grid row; cards must stay **content-sized** (`height: fit-content`, `grid-auto-rows: max-content`).
