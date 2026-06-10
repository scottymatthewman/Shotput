---
version: 1.0
name: webapp-template-design-system
description: >-
  Design system for the webapp template — Linear-feel density, warm stone
  neutrals, keyboard-first chrome, and a rounded workspace card as the hero surface.
  Semantic tokens in src/styles/colors.css; Tailwind utilities in src/index.css @theme.

colors:
  # ─── Primitives (never use directly in components) ───
  neutral-0: '#ffffff'
  neutral-50: '#fafaf9'
  neutral-100: '#f5f5f4'
  neutral-200: '#e7e5e4'
  neutral-300: '#d6d3d1'
  neutral-400: '#a8a29e'
  neutral-500: '#78716c'
  neutral-600: '#57534e'
  neutral-700: '#44403c'
  neutral-800: '#292524'
  neutral-900: '#1c1917'
  neutral-950: '#0c0a09'
  white: '{colors.neutral-0}'
  black: '{colors.neutral-950}'
  red-500: '#ff2323'
  red-600: '#ff1a1a'
  yellow-400: '#ffe10d'
  yellow-500: '#ffd500'
  blue-400: '#3babf5'
  blue-600: '#057cd6'
  green-400: '#32d58e'
  green-600: '#03a064'
  purple-400: '#a79eea'
  purple-600: '#7255d2'
  purple-700: '#6242bf'

  # ─── UI foundations (light) — prefer these Tailwind utilities ───
  bg: '{colors.neutral-50}'
  surface-1: '{colors.neutral-0}'
  surface-2: '{colors.neutral-50}'
  surface-3: '{colors.neutral-100}'
  border-subtle: '{colors.neutral-100}'
  border: '{colors.neutral-200}'
  border-hover: '{colors.neutral-300}'
  border-strong: '{colors.neutral-300}'
  foreground: '{colors.neutral-900}'
  foreground-secondary: '{colors.neutral-500}'
  foreground-tertiary: '{colors.neutral-400}'
  fill-hover: 'rgb(from neutral-900 / 4%)'
  fill-selected: 'rgb(from neutral-900 / 6%)'
  primary: '{colors.neutral-900}'
  primary-foreground: '{colors.neutral-0}'
  destructive: '{colors.red-600}'
  status-progress: '{colors.blue-600}'
  status-review: '{colors.purple-600}'
  status-blocked: '{colors.red-500}'
  status-done: '{colors.green-600}'

typography:
  font-sans: 'Gen Interface JP, ui-sans-serif, system-ui, sans-serif'
  page-title:
    fontFamily: '{typography.font-sans}'
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.01em
  body-md:
    fontFamily: '{typography.font-sans}'
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: '{typography.font-sans}'
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
  nav-row:
    fontFamily: '{typography.font-sans}'
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.5
  button-md:
    fontFamily: '{typography.font-sans}'
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.3
  badge-xs:
    fontFamily: '{typography.font-sans}'
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4

rounded:
  sm: 'calc(1rem - 0.5rem)'
  md: 'calc(1rem - 0.25rem)'
  lg: '1rem'
  xl: '0.75rem'
  workspace: '0.75rem'

spacing:
  unit: 4px
  sidebar-expanded: 260px
  sidebar-collapsed: 56px
  content-padding: 12px
  page-header-x: 16px
  page-header-y: 12px
  control-h: 36px
  control-h-sm: 32px

motion:
  ease-out: 'cubic-bezier(0.23, 1, 0.32, 1)'
  ease-in-out: 'cubic-bezier(0.86, 0, 0.07, 1)'
  duration-micro: 150ms
  duration-surface: 180ms
  duration-panel: 250ms

components:
  app-shell:
    backgroundColor: '{colors.bg}'
  content-panel:
    backgroundColor: '{colors.bg}'
    padding: '{spacing.content-padding}'
  workspace-card:
    backgroundColor: '{colors.surface-1}'
    rounded: '{rounded.workspace}'
    border: '1px solid {colors.border}'
  button-default:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.primary-foreground}'
    typography: '{typography.button-md}'
    rounded: '{rounded.md}'
    height: '{spacing.control-h}'
  button-page-chrome:
    backgroundColor: 'transparent'
    textColor: 'var(--app-chrome-fg)'
    height: 32px
    width: 32px
  sidebar-nav-row:
    typography: '{typography.nav-row}'
    height: 32px
    rounded: '{rounded.sm}'
---

# Design System

## 1. Visual Theme & Atmosphere

This template targets a **dense, keyboard-first product workspace** with **Linear-style precision** — small type, tight rows, neutral chrome, and status color used sparingly as signal rather than decoration.

**Mood:** calm, professional, tool-native. Not marketing-flashy. Surfaces are warm stone neutrals; the rounded workspace card is the visual anchor.

**Density:** navigation rows at 32px, page titles at 16px semibold. Prefer compact controls (`h-8`, `h-9`) over spacious marketing-scale buttons.

**Key characteristics:**

- Four-tier surface stack: **bg** → **surface-1** → **surface-2** (subtle band) → **surface-3** (inset well)
- Monochrome primary actions; color reserved for status accents and destructive actions
- Collapsible sidebar (260px ↔ 56px) with icon-only collapsed mode
- Light mode is default; dark mode via `.dark` on `<html>` (`ThemeSync`)

## 2. UI Color Foundations

> **Implementation:** `src/styles/colors.css` (`--app-bg`, `--app-surface-*`, `--app-border-*`).
> **Tailwind:** `src/index.css` `@theme` → `bg-background`, `bg-surface-1`, `border-border`, etc.
> Only six palette families: **neutral, red, yellow, blue, green, purple**. Palette extremes are named **`white`** (`neutral-0`) and **`black`** (`neutral-950`) — use `bg-white` / `bg-black` / `text-white` / `text-black` in UI.

### Mental model

Think in **elevation layers** (surfaces) and **edge contrast** (borders). Status hues are a separate vocabulary — never use them for structural chrome.

```
┌─ bg (app backdrop) ─────────────────────────────────────┐
│  ┌─ surface-1 (primary panel / workspace) ────────────┐ │
│  │  ┌─ surface-2 / surface-3 (bands, inset wells) ─┐  │ │
│  │  └───────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────┘ │
│  popovers: surface-1 + shadow                            │
└──────────────────────────────────────────────────────────┘
```

### Surfaces

| Token         | CSS var           | Tailwind        | Light       | Dark        | When to use                                      |
| ------------- | ----------------- | --------------- | ----------- | ----------- | ------------------------------------------------ |
| **bg**        | `--app-bg`        | `bg-background` | neutral-50  | neutral-950 | App shell, sidebar, outer frame                  |
| **surface-1** | `--app-surface-1` | `bg-surface-1`  | neutral-0   | neutral-900 | Workspace card, page content, cards              |
| **surface-2** | `--app-surface-2` | `bg-surface-2`  | neutral-50  | neutral-800 | Subtle bands — table headers, section chrome     |
| **surface-3** | `--app-surface-3` | `bg-surface-3`  | neutral-100 | neutral-700 | Inset wells — inputs, metric cards, muted panels |

**Legacy aliases** (still work, prefer foundations above):

| Alias                                  | Maps to                         |
| -------------------------------------- | ------------------------------- |
| `bg-content`, `bg-card`                | surface-1                       |
| `bg-muted`, `bg-secondary`, `bg-input` | surface-3                       |
| `bg-popover`                           | surface-1 (elevated via shadow) |

### Borders → inset edges

Structural edges use **inset shadows** (`inset-edge-ring*` / `inset-edge*` utilities in `index.css`), not `border`.

| Token       | CSS var                | Light       | Dark        | When to use                                     |
| ----------- | ---------------------- | ----------- | ----------- | ----------------------------------------------- |
| **subtle**  | `--app-border-subtle`  | neutral-100 | neutral-800 | Hairlines within the same surface               |
| **default** | `--app-border-default` | neutral-200 | neutral-700 | Standard 1px edges: cards, rows, inputs at rest |
| **hover**   | `--app-border-hover`   | neutral-300 | neutral-500 | Hover on interactive bordered controls          |
| **strong**  | `--app-border-strong`  | neutral-300 | neutral-600 | Dialogs, sheets, command palette                |
| **focus**   | `--app-border-focus`   | neutral-900 | neutral-0   | Focus rings (`app-focus-ring`)                  |

### Text

| Token     | Tailwind                | When to use                          |
| --------- | ----------------------- | ------------------------------------ |
| Primary   | `text-foreground`       | Titles, body, primary labels         |
| Secondary | `text-muted-foreground` | Descriptions, metadata, nav inactive |
| Tertiary  | `text-tertiary`         | Placeholders, de-emphasized hints    |

### Interactive fills

| Token    | Tailwind           | When to use                        |
| -------- | ------------------ | ---------------------------------- |
| Hover    | `bg-fill-hover`    | Row hover, subtle control hover    |
| Selected | `bg-fill-selected` | Selected list/table rows           |
| Accent   | `bg-accent/40`     | Menu item focus, segment highlight |

### App shell mapping

| Region                                   | Surface                        |
| ---------------------------------------- | ------------------------------ |
| Shell + sidebar                          | **bg** (`bg-background`)       |
| Content panel (padded area right of nav) | **bg** (`bg-background`)       |
| Rounded workspace card                   | **surface-1** (`bg-surface-1`) |

### Status & accent colors

| Semantic               | Meaning                |
| ---------------------- | ---------------------- |
| `text-status-progress` | In progress (blue)     |
| `text-status-review`   | In review (purple)     |
| `text-status-blocked`  | Blocked / urgent (red) |
| `text-status-done`     | Done (green)           |
| `bg-destructive`       | Destructive actions    |

Status colors go on **icons and labels only** — never structural borders or app chrome.

### Three-layer rule

1. **Primitives** (`--palette-*`) — never in components.
2. **UI foundations** (`--app-bg`, `--app-surface-*`, `--app-border-*`, `--app-fill-*`) — default for all UI.
3. **Feature** — add product-specific tokens (e.g. `--app-chart-*`) referencing Layer 2.

### Adding a new token

```
palette (if needed) → --app-* in colors.css → @theme alias → Tailwind utility → DESIGN.md table
```

## 3. Typography Rules

**Font:** Gen Interface JP (self-hosted in `public/fonts/`, declared in `src/styles/typography.css`), stack: `Gen Interface JP, ui-sans-serif, system-ui, sans-serif`. Swap fonts by following the checklist at the top of `typography.css`.

| Token         | Tailwind pattern                         | Use                                    |
| ------------- | ---------------------------------------- | -------------------------------------- |
| Page title    | `text-base font-semibold tracking-tight` | `PageHeader` h1                        |
| Body          | `text-sm`                                | Descriptions, form labels, table cells |
| Nav / dense   | `text-sm font-medium`                    | Sidebar rows, metadata                 |
| Button        | `text-sm font-medium`                    | `Button` default                       |
| Muted         | `text-sm text-muted-foreground`          | Secondary copy, dates                  |
| Canvas chrome | `text-chrome-fg`                         | Toolbar icons on page headers          |

**Principles:**

- Semibold (600) only for page titles and active nav emphasis
- Medium (500) for buttons and nav rows
- Regular (400) for body and badges
- No display/marketing type scales in product UI

## 4. Component Stylings

### Buttons (`src/components/ui/button.tsx`)

| Variant        | Classes / behavior                                             |
| -------------- | -------------------------------------------------------------- |
| `default`      | `bg-primary text-primary-foreground` — monochrome CTA          |
| `secondary`    | bordered, `bg-secondary`                                       |
| `ghost`        | transparent, `hover:bg-accent/30`                              |
| `outline`      | transparent + inset edge                                       |
| `destructive`  | `bg-destructive`                                               |
| `pageChrome`   | 32×32 icon control on page headers — `text-chrome-fg`, no fill |
| `pageChromeLg` | 40×40 variant for primary toolbar action                       |

All buttons: `transition-surface pressable app-focus-ring`.

### Inputs (`Input`)

`h-9 rounded-md inset-edge-ring inset-edge-ring-full bg-card text-sm` + `transition-surface duration-150`.

### Badges

Shadcn `Badge`: default/secondary/outline/destructive/muted variants. For colored semantic badges, use `variant="status"` with the `.semantic-badge` recipe in `index.css` and set `--badge-edge-color` per family.

### Navigation (`SidebarNav`, `SidebarNavItem`)

- Row height: `h-8` (32px), `text-sm font-medium`, `rounded-sm`
- Idle rows: `opacity-70` → `opacity-100` on hover; route-active stays full opacity
- Icons: 18px (`size-[18px]`), inherit `currentColor`
- Density tokens in `src/components/nav/sidebarNavStyles.ts`

### Sheets / dialogs

Radix sheet animations: `250ms var(--ease-out)` — paired overlay + panel (`app-sheet-*` keyframes in `index.css`). Modal panels use `.app-modal-panel` (inset edge + drop shadow).

## 5. Layout Principles

### App shell (`AppShell`)

```
┌─────────────────────────────────────────────────┐
│ bg (neutral-50) — shell + sidebar + panel pad   │
│ ┌──────────┬──────────────────────────────────┐│
│ │ Sidebar  │ bg (neutral-50)                  ││
│ │          │ ┌──────────────────────────────┐ ││
│ │          │ │ surface-1 — workspace card   │ ││
│ │          │ └──────────────────────────────┘ ││
│ └──────────┴──────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

- Shell: `h-dvh overflow-hidden bg-background`
- Content panel: `flex-1 bg-background p-3 md:pl-0`
- Workspace card: `rounded-xl inset-edge inset-edge-full bg-surface-1 flex-1`

### Page structure

- `PageShell` → flex column fill
- `PageHeader` → `inset-edge-ring inset-edge-ring-b px-4 py-3`, title + optional inline description + actions
- `PageScrollArea` / `CenteredPageScroll` → `overflow-auto p-4`

### Spacing scale

Use Tailwind spacing (4px base). Prefer standard steps (`p-3`, `p-4`, `gap-2`, `gap-3`) over arbitrary values.

| Context               | Spacing           |
| --------------------- | ----------------- |
| App content gutter    | `p-3` (12px)      |
| Page header           | `px-4 py-3`       |
| Card / scroll padding | `p-4`             |
| Dense list gap        | `gap-1` – `gap-2` |
| Toolbar actions       | `gap-3`           |

### Radius scale (`index.css` @theme)

| Token                   | Value   | Use                               |
| ----------------------- | ------- | --------------------------------- |
| `--radius-lg`           | 1rem    | Workspace card outer              |
| `--radius-md`           | 0.75rem | Buttons, inputs, badges           |
| `--radius-sm`           | 0.5rem  | Nested controls                   |
| `--radius-nested-md-p1` | derived | Segment thumb inside padded track |

## 6. Depth & Elevation

The system avoids heavy drop shadows. Depth comes from **surface stepping** and **inset edges**.

| Level | Treatment                                | Use                                  |
| ----- | ---------------------------------------- | ------------------------------------ |
| 0     | Flat, inset edge only                    | Page headers, tables, sidebar        |
| 1     | `shadow-sm`                              | Segment toggle thumb, subtle lift    |
| 2     | Sheet overlay `bg-black/…` + panel slide | Sheets, dialogs (`.app-modal-panel`) |

Translucent fills use `rgb(from var(...) r g b / alpha)` in `colors.css` — keep alpha in tokens, not scattered in components.

## 7. Motion & Interaction

> Source: `src/index.css` + `.cursor/rules/motion.mdc`

| Intent                    | Easing                    | Duration      |
| ------------------------- | ------------------------- | ------------- |
| User-driven appear/settle | `ease-out` (`--ease-out`) | 180ms default |
| On-screen morph / slide   | `ease-in-out`             | 200–300ms     |
| Hover color/border only   | `ease-hover`              | 150ms         |
| Sheets / drawers          | `ease-out`                | 250ms         |

**Interactive controls:** combine `transition-surface` + `pressable`.

**Performance:** animate `transform` and `opacity` only for continuous motion.

**Accessibility:** global `prefers-reduced-motion` shortens transitions; use `motion-reduce:transition-none` on Radix overlays where established.

## 8. Do's and Don'ts

### Do

- Use UI foundation tokens: `bg-background`, `bg-surface-1`, `bg-surface-3`, `inset-edge-ring`, `inset-edge-hover`
- Use `bg-fill-hover` for row/list hover fills
- Use `text-chrome-fg` / `pageChrome` buttons on page headers
- Reuse shadcn primitives in `src/components/ui/` before building new controls
- Add new colors via primitive → semantic in `colors.css` → `@theme` alias → component class
- Match existing sidebar density (`text-sm`, `h-8` rows) for new nav items

### Don't

- Raw hex, `text-white`, `bg-white/5`, or `--palette-*` in feature components
- One-off `dark:` color pairs when a semantic token should cover both modes
- `transition-all` without reason
- New random easing/duration constants — use theme tokens
- Marketing-style motion over 300ms in product UI
- Introduce colors outside the six palette families
- `shadow-none` on elements using `inset-edge-ring*` (clears the inset "border")

## 9. Responsive Behavior

| Breakpoint | Behavior                                                 |
| ---------- | -------------------------------------------------------- |
| `< md`     | Sidebar hidden; mobile top links bar; full-width content |
| `≥ md`     | Sidebar visible; collapsible via ⌘. ; content `md:pl-0`  |

**Touch targets:** minimum `h-8` (32px) for icon buttons; default controls `h-9` (36px).

**Collapsing:** sidebar width animates `300ms ease-in-out` via `grid-template-columns` on `.shell-main-grid`.

## 10. Agent Prompt Guide

When building or restyling UI in this template, agents should:

1. **Read this file** (`DESIGN.md`) for intent and token names
2. **Read implementation** in `src/styles/colors.css` and `src/index.css` for exact values
3. **Reuse components** from `src/components/ui/` and `src/layouts/`
4. **Follow cursor rules** `.cursor/rules/colors.mdc` and `.cursor/rules/motion.mdc`

### Quick copy patterns

```tsx
// Surfaces
className = 'bg-background' // bg — shell, sidebar, panel pad
className = 'bg-surface-1 inset-edge-ring inset-edge-ring-full' // workspace card, panels
className = 'bg-surface-3' // inset well / muted band

// Interactive edge
className =
  'inset-edge-ring inset-edge-ring-full inset-edge-hover transition-surface duration-150 ease-hover'

// Row hover
className = 'hover:bg-fill-hover'
```

### Example prompts

- _"Add a settings section using surface-3 inset cards on a surface-1 panel — semantic tokens only."_
- _"Build a page header with pageChrome toolbar buttons."_
- _"Add a new status accent — extend colors.css semantics and the @theme block in index.css, don't hardcode hex in TSX."_

### Sync checklist (when changing design tokens)

- [ ] Update `src/styles/colors.css` (primitives + semantics + dark overrides)
- [ ] Update `src/index.css` `@theme` if new Tailwind utility needed
- [ ] Update this `DESIGN.md` YAML + tables
- [ ] Update `index.html` boot skeleton colors if base surfaces changed
- [ ] Verify light + dark in Settings theme toggle

## File map

| File                                | Role                                                  |
| ----------------------------------- | ----------------------------------------------------- |
| `DESIGN.md`                         | Agent-readable design spec (this file)                |
| `src/styles/colors.css`             | Token source of truth                                 |
| `src/index.css`                     | Tailwind @theme, motion, inset-edge component classes |
| `.cursor/rules/colors.mdc`          | Agent color guardrails (always applied)               |
| `.cursor/rules/motion.mdc`          | Agent motion guardrails (always applied)              |
| `.cursor/skills/design-md/SKILL.md` | Skill for maintaining and applying DESIGN.md          |
