---
version: 1.0
name: Dance-design-system
description: >-
  Dance is a plan timeline workspace for event producers — Linear-feel density,
  warm stone neutrals, keyboard-first chrome, and a Gantt canvas as the hero surface.
  Semantic tokens in src/styles/colors.css; Tailwind utilities in src/index.css @theme.

colors:
  # ─── Primitives (never use directly in components) ───
  neutral-0: "#ffffff"
  neutral-50: "#fafaf9"
  neutral-100: "#f5f5f4"
  neutral-200: "#e7e5e4"
  neutral-300: "#d6d3d1"
  neutral-400: "#a8a29e"
  neutral-500: "#78716c"
  neutral-600: "#57534e"
  neutral-700: "#44403c"
  neutral-800: "#292524"
  neutral-900: "#1c1917"
  neutral-950: "#0c0a09"
  white: "{colors.neutral-0}"
  black: "{colors.neutral-950}"
  red-500: "#ff2323"
  red-600: "#ff1a1a"
  yellow-400: "#ffe10d"
  yellow-500: "#ffd500"
  blue-400: "#3babf5"
  blue-600: "#057cd6"
  green-400: "#32d58e"
  green-600: "#03a064"
  purple-400: "#a79eea"
  purple-600: "#7255d2"
  purple-700: "#6242bf"

  # ─── UI foundations (light) — prefer these Tailwind utilities ───
  bg: "{colors.neutral-50}"
  surface-1: "{colors.neutral-0}"
  surface-2: "{colors.neutral-100}"
  surface-3: "{colors.neutral-0}"
  border-subtle: "{colors.neutral-100}"
  border: "{colors.neutral-200}"
  border-hover: "{colors.neutral-300}"
  border-strong: "{colors.neutral-300}"
  foreground: "{colors.neutral-900}"
  foreground-secondary: "{colors.neutral-500}"
  foreground-tertiary: "{colors.neutral-400}"
  fill-hover: "rgb(from neutral-900 / 4%)"
  fill-selected: "rgb(from neutral-900 / 6%)"
  primary: "{colors.neutral-900}"
  primary-foreground: "{colors.neutral-0}"
  destructive: "{colors.red-600}"
  status-progress: "{colors.yellow-500}"
  status-review: "{colors.purple-600}"
  status-blocked: "{colors.red-500}"
  status-done: "{colors.green-600}"
  status-assignee: "{colors.blue-600}"

typography:
  font-sans: "Inter, ui-sans-serif, system-ui, sans-serif"
  page-title:
    fontFamily: "{typography.font-sans}"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.01em
  body-md:
    fontFamily: "{typography.font-sans}"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "{typography.font-sans}"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
  nav-row:
    fontFamily: "{typography.font-sans}"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.5
  button-md:
    fontFamily: "{typography.font-sans}"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.3
  badge-xs:
    fontFamily: "{typography.font-sans}"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4

rounded:
  sm: "calc(1rem - 0.5rem)"
  md: "calc(1rem - 0.25rem)"
  lg: "1rem"
  xl: "0.75rem"
  workspace: "0.75rem"

spacing:
  unit: 4px
  sidebar-expanded: 260px
  sidebar-collapsed: 56px
  content-padding: 12px
  page-header-x: 16px
  page-header-y: 12px
  dense-row-h: 24px
  control-h: 36px
  control-h-sm: 32px

motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  ease-in-out: "cubic-bezier(0.86, 0, 0.07, 1)"
  duration-micro: 150ms
  duration-surface: 180ms
  duration-panel: 250ms

components:
  app-shell:
    backgroundColor: "{colors.bg}"
  content-panel:
    backgroundColor: "{colors.bg}"
    padding: "{spacing.content-padding}"
  workspace-card:
    backgroundColor: "{colors.surface-1}"
    rounded: "{rounded.workspace}"
    border: "1px solid {colors.border}"
  button-default:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    height: "{spacing.control-h}"
  button-page-chrome:
    backgroundColor: "transparent"
    textColor: "var(--dance-chrome-fg)"
    height: 32px
    width: 32px
  sidebar-nav-row:
    typography: "{typography.nav-row}"
    height: "{spacing.dense-row-h}"
    rounded: "{rounded.md}"
  phase-badge:
    typography: "{typography.badge-xs}"
    border: "0.5px solid"
    rounded: "{rounded.md}"
  gantt-bar:
    fill: "{colors.surface-1}"
    border: "1px solid {colors.border}"
    borderHover: "{colors.border-hover}"
---

# Dance Design System

## 1. Visual Theme & Atmosphere

Dance is a **dense, keyboard-first plan workspace** for event producers. The product feel targets **Linear-style precision** — small type, tight rows, neutral chrome, and status color used sparingly as signal rather than decoration.

**Mood:** calm, professional, tool-native. Not marketing-flashy. Surfaces are warm stone neutrals; the timeline canvas is the visual anchor.

**Density:** navigation rows at 24px, sidebar labels at 12px, page titles at 16px semibold. Prefer compact controls (`h-8`, `h-9`) over spacious marketing-scale buttons.

**Key characteristics:**
- Four-tier surface stack: **bg** → **surface-1** → **surface-2** (inset) → **surface-3** (floating)
- Monochrome primary actions; color reserved for phase status, assignees, and destructive actions
- Collapsible sidebar (260px ↔ 56px) with icon-only collapsed mode
- Gantt bars: solid surface-1 fill + neutral border (default + hover)
- Light mode is default; dark mode via `.dark` on `<html>` (`ThemeSync`)

## 2. UI Color Foundations

> **Implementation:** `src/styles/colors.css` (`--dance-bg`, `--dance-surface-*`, `--dance-border-*`).
> **Tailwind:** `src/index.css` `@theme` → `bg-background`, `bg-surface-1`, `border-border`, etc.
> Only six palette families: **neutral, red, yellow, blue, green, purple**. Palette extremes are named **`white`** (`neutral-0`) and **`black`** (`neutral-950`) — use `bg-white` / `bg-black` / `text-white` / `text-black` in UI.

### Mental model

Think in **elevation layers** (surfaces) and **edge contrast** (borders). Status hues are a separate vocabulary — never use them for structural chrome.

```
┌─ bg (app backdrop) ─────────────────────────────────────┐
│  ┌─ surface-1 (primary panel / workspace) ────────────┐ │
│  │  ┌─ surface-2 (inset: inputs, muted bands) ────┐  │ │
│  │  └─────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────┘ │
│  surface-3: popovers/dropdowns (same fill as 1 + shadow) │
└──────────────────────────────────────────────────────────┘
```

### Surfaces

| Token | CSS var | Tailwind | Light | Dark | When to use |
|-------|---------|----------|-------|------|-------------|
| **bg** | `--dance-bg` | `bg-background` | neutral-50 | neutral-900 | App shell, sidebar, outer frame |
| **surface-1** | `--dance-surface-1` | `bg-surface-1` | neutral-0 | neutral-800 | Workspace card, page content, Gantt bars, cards |
| **surface-2** | `--dance-surface-2` | `bg-surface-2` | neutral-100 | neutral-700 | Input fills, muted sections, metric cards, inset panels |
| **surface-3** | `--dance-surface-3` | `bg-surface-3` | neutral-0 | neutral-800 | Popovers, dropdowns, tooltips (elevated via shadow) |

**Legacy aliases** (still work, prefer foundations above):

| Alias | Maps to |
|-------|---------|
| `bg-content`, `bg-card`, `bg-gantt-canvas` | surface-1 |
| `bg-muted`, `bg-secondary`, `bg-input` | surface-2 |
| `bg-popover` | surface-3 |

### Borders

| Token | CSS var | Tailwind | Light | Dark | When to use |
|-------|---------|----------|-------|------|-------------|
| **subtle** | `--dance-border-subtle` | `border-border-subtle` | neutral-100 | neutral-800 | Hairlines within the same surface |
| **default** | `--dance-border-default` | `border-border` | neutral-200 | neutral-700 | Standard 1px edges: cards, rows, inputs at rest |
| **hover** | `--dance-border-hover` | `border-border-hover` | neutral-300 | neutral-500 | Hover on interactive bordered controls (Gantt bars) |
| **strong** | `--dance-border-strong` | `border-border-strong` | neutral-300 | neutral-600 | Dialogs, sheets, command palette |
| **focus** | `--dance-border-focus` | `ring-ring` | neutral-900 | neutral-0 | Focus rings |

### Text

| Token | Tailwind | When to use |
|-------|----------|-------------|
| Primary | `text-foreground` | Titles, body, primary labels |
| Secondary | `text-muted-foreground` | Descriptions, metadata, nav inactive |
| Tertiary | `--dance-text-tertiary` | Placeholders, de-emphasized hints |

### Interactive fills

| Token | Tailwind | When to use |
|-------|----------|-------------|
| Hover | `bg-fill-hover` | Row hover, subtle control hover |
| Selected | `bg-fill-selected` | Selected list/table rows |
| Accent | `bg-accent/40` | Menu item focus, segment highlight |

### App shell mapping

| Region | Surface |
|--------|---------|
| Shell + sidebar | **bg** (`bg-background`) |
| Content panel (padded area right of nav) | **bg** (`bg-background`) |
| Rounded workspace card | **surface-1** (`bg-surface-1`) |

### Status & accent colors

| Semantic | Meaning |
|----------|---------|
| `text-status-progress` | In progress (yellow) |
| `text-status-review` | In review (purple) |
| `text-status-blocked` / `text-coral` | Blocked / urgent (red) |
| `text-status-done` | Done (green) |
| `bg-assignee-blue` / `bg-assignee-coral` | Assignee avatar fills |
| `bg-destructive` | Destructive actions |

Phase badges: `.phase-badge-*`. Gantt bars: status on **icons only**, not borders.

### Three-layer rule

1. **Primitives** (`--palette-*`) — never in components.
2. **UI foundations** (`--dance-bg`, `--dance-surface-*`, `--dance-border-*`, `--dance-fill-*`) — default for all UI.
3. **Feature** (`--dance-gantt-*`, `--dance-phase-*`, `--dance-chrome-*`) — timeline/phase only.

### Adding a new token

```
palette (if needed) → --dance-* in colors.css → @theme alias → Tailwind utility → DESIGN.md table
```

## 3. Typography Rules

**Font:** Inter (loaded via `@fontsource-variable/inter`), stack: `Inter, ui-sans-serif, system-ui, sans-serif`.

| Token | Tailwind pattern | Use |
|-------|------------------|-----|
| Page title | `text-base font-semibold tracking-tight` | `PageHeader` h1 |
| Body | `text-sm` | Descriptions, form labels, table cells |
| Nav / dense | `text-xs font-medium` | Sidebar rows, metadata |
| Button | `text-sm font-medium` | `Button` default |
| Muted | `text-sm text-muted-foreground` | Secondary copy, dates |
| Canvas chrome | `text-chrome-fg` | Toolbar icons on tinted headers |

**Principles:**
- Semibold (600) only for page titles and active nav emphasis
- Medium (500) for buttons and nav rows
- Regular (400) for body and badges
- No display/marketing type scales in product UI

## 4. Component Stylings

### Buttons (`src/components/ui/button.tsx`)

| Variant | Classes / behavior |
|---------|-------------------|
| `default` | `bg-primary text-primary-foreground` — monochrome CTA |
| `secondary` | bordered, `bg-secondary` |
| `ghost` | transparent, `hover:bg-accent/30` |
| `outline` | transparent + border |
| `destructive` | `bg-destructive` |
| `pageChrome` | 32×32 icon control on canvas headers — `text-chrome-fg`, no fill |
| `pageChromeLg` | 40×40 variant for primary toolbar action |

All buttons: `transition-surface pressable dance-focus-ring`.

### Inputs (`Input`)

`h-9 rounded-md border border-input bg-card text-sm` + `transition-surface duration-150`.

### Badges

- **Shadcn `Badge`:** default/secondary/outline/destructive/muted variants
- **Phase badges:** `.phase-badge-todo | -in-progress | -in-review | -blocked | -done` from `index.css`

### Navigation (`SidebarNav`)

- Row height: `h-6` (24px), `text-xs`, `rounded-md`
- Active: `text-foreground`; inactive: `text-muted-foreground`
- Hover: `hover:text-nav-hover` (never `hover:text-white`)
- Icons: `size-3`, muted → nav-hover on group hover

### Timeline view toggle

Segment control: `rounded-md` track, sliding `bg-card shadow-sm` thumb, `duration-200 ease-out` transform.

### Gantt bars (`GanttBar`, `ganttBarPhaseTokens.ts`)

- Fill: **surface-1** (`--dance-gantt-bar-fill`)
- Edge: **inset shadow** via `.inset-edge` + `.inset-edge-full` + `.inset-edge-hover` (overlay on fill)
- Status: icon color only (`PhaseStatusIcon`)
- Scrubber pill: `.gantt-resize-pill`

### Sheets / dialogs

Radix sheet animations: `250ms var(--ease-out)` — paired overlay + panel (`dance-sheet-*` keyframes in `index.css`).

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
- Workspace card: `rounded-xl border border-border bg-surface-1 flex-1`

### Page structure

- `PageShell` → flex column fill
- `PageHeader` → `border-b border-border px-4 py-3`, title + optional inline description + actions
- `PageScrollArea` → `overflow-auto p-4`

### Spacing scale

Use Tailwind spacing (4px base). Prefer standard steps (`p-3`, `p-4`, `gap-2`, `gap-3`) over arbitrary values.

| Context | Spacing |
|---------|---------|
| App content gutter | `p-3` (12px) |
| Page header | `px-4 py-3` |
| Card / scroll padding | `p-4` |
| Dense list gap | `gap-1` – `gap-2` |
| Toolbar actions | `gap-3` |

### Radius scale (`index.css` @theme)

| Token | Value | Use |
|-------|-------|-----|
| `--radius-lg` | 1rem | Workspace card outer |
| `--radius-md` | 0.75rem | Buttons, inputs, badges |
| `--radius-sm` | 0.5rem | Nested controls |
| `--radius-nested-md-p1` | derived | Segment thumb inside padded track |

## 6. Depth & Elevation

Dance avoids heavy drop shadows. Depth comes from **surface stepping** and **borders**.

| Level | Treatment | Use |
|-------|-----------|-----|
| 0 | Flat, border only | Page headers, tables, sidebar |
| 1 | `shadow-sm` | Segment toggle thumb, subtle lift |
| 2 | Sheet overlay `bg-black/…` + panel slide | Phase sheet, dialogs |
| Gantt scrubber | `shadow-md` + chrome border ring | Resize handles |

Translucent fills use `rgb(from var(...) r g b / alpha)` in `colors.css` — keep alpha in tokens, not scattered in components.

## 7. Motion & Interaction

> Source: `src/index.css` + `.cursor/rules/motion.mdc`

| Intent | Easing | Duration |
|--------|--------|----------|
| User-driven appear/settle | `ease-out` (`--ease-out`) | 180ms default |
| On-screen morph / slide | `ease-in-out` | 200ms |
| Hover color/border only | `ease-hover` | 150ms |
| Sheets / drawers | `ease-out` | 250ms |

**Interactive controls:** combine `transition-surface` + `pressable`.

**Performance:** animate `transform` and `opacity` only for continuous motion.

**Accessibility:** global `prefers-reduced-motion` shortens transitions; use `motion-reduce:transition-none` on Radix overlays where established.

## 8. Do's and Don'ts

### Do

- Use UI foundation tokens: `bg-background`, `bg-surface-1`, `bg-surface-2`, `border-border`, `hover:border-border-hover`
- Use `bg-fill-hover` for row/list hover fills
- Use `text-chrome-fg` / `pageChrome` buttons on canvas page headers
- Use `.phase-badge-*` and `ganttBarPhaseTokens` for status presentation
- Reuse shadcn primitives in `src/components/ui/` before building new controls
- Add new colors via primitive → semantic in `colors.css` → `@theme` alias → component class
- Match existing sidebar density (`text-xs`, `h-6` rows) for new nav items

### Don't

- Raw hex, `text-white`, `bg-white/5`, or `--palette-*` in feature components
- One-off `dark:` color pairs when a semantic token should cover both modes
- `transition-all` without reason
- New random easing/duration constants — use theme tokens
- Marketing-style motion over 300ms in product UI
- Introduce colors outside the six palette families

## 9. Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| `< md` | Sidebar hidden; mobile top links bar; full-width content |
| `≥ md` | Sidebar visible; collapsible via ⌘. ; content `md:pl-0` |

**Touch targets:** minimum `h-8` (32px) for icon buttons; default controls `h-9` (36px).

**Collapsing:** sidebar width animates `300ms ease-out`; phase sheet open auto-collapses sidebar.

## 10. Agent Prompt Guide

When building or restyling Dance UI, agents should:

1. **Read this file** (`DESIGN.md`) for intent and token names
2. **Read implementation** in `src/styles/colors.css` and `src/index.css` for exact values
3. **Reuse components** from `src/components/ui/` and `src/layouts/`
4. **Follow cursor rules** `.cursor/rules/colors.mdc` and `.cursor/rules/motion.mdc`

### Quick copy patterns

```tsx
// Surfaces
className="bg-background"                    // bg — shell, sidebar, panel pad
className="bg-surface-1 border-border"       // workspace card, Gantt bars
className="bg-surface-2"                     // inset / muted band

// Borders
className="border-border hover:border-border-hover transition-surface duration-150 ease-hover"
```

### Example prompts

- *"Add a settings section using surface-2 inset cards on a surface-1 panel — semantic borders only."*
- *"Build a plan overview header on bg-surface-1 with pageChrome toolbar buttons."*
- *"Add a new phase status badge — extend colors.css semantics and .phase-badge-* in index.css, don't hardcode hex in TSX."*

### Sync checklist (when changing design tokens)

- [ ] Update `src/styles/colors.css` (primitives + semantics + dark overrides)
- [ ] Update `src/index.css` `@theme` if new Tailwind utility needed
- [ ] Update this `DESIGN.md` YAML + tables
- [ ] Update `index.html` boot skeleton colors if base surfaces changed
- [ ] Verify light + dark in Settings theme toggle

## File map

| File | Role |
|------|------|
| `DESIGN.md` | Agent-readable design spec (this file) |
| `src/styles/colors.css` | Token source of truth |
| `src/index.css` | Tailwind @theme, motion, phase/gantt component classes |
| `.cursor/rules/colors.mdc` | Agent color guardrails (always applied) |
| `.cursor/rules/motion.mdc` | Agent motion guardrails (always applied) |
| `.cursor/skills/design-md/SKILL.md` | Skill for maintaining and applying DESIGN.md |
