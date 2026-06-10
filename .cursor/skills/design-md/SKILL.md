---
name: design-md
description: >-
  Apply and maintain this template's DESIGN.md design system (Google Stitch /
  awesome-design-md format). Use when building UI, restyling pages, adding components,
  defining colors or typography, matching product look-and-feel, or when the user
  mentions DESIGN.md, design tokens, or design system docs.
---

# DESIGN.md

This project uses a [DESIGN.md](https://github.com/VoltAgent/awesome-design-md) spec at the project root — the same concept as [awesome-design-md](https://github.com/VoltAgent/awesome-design-md): a plain-text design system agents read to generate consistent UI without Figma exports.

## When to load this skill

- Building or restyling any product UI (pages, sheets, dialogs, sidebar)
- Adding or changing colors, typography, spacing, radius, motion
- User asks to "follow the design system" or update DESIGN.md
- Creating new status badges or chrome patterns

## Workflow

### 1. Read before writing UI

1. Read **`DESIGN.md`** (project root) — theme, token roles, component patterns, do's/don'ts
2. Read **`src/styles/colors.css`** — exact primitive + semantic values, light/dark
3. Skim **`.cursor/rules/colors.mdc`** and **`.cursor/rules/motion.mdc`** — hard guardrails (always apply)

Do not invent colors or motion from memory. Implementation wins over DESIGN.md if they diverge — fix DESIGN.md after confirming `colors.css` is correct.

### 2. Implement with existing primitives

| Need                                         | Use                                        |
| -------------------------------------------- | ------------------------------------------ |
| App backdrop (shell, sidebar, panel pad)     | `bg-background`                            |
| Primary working surface (workspace, cards)   | `bg-surface-1`                             |
| Subtle bands (table headers, section chrome) | `bg-surface-2`                             |
| Inset wells (inputs, metric cards)           | `bg-surface-3`                             |
| Floating menus                               | `bg-popover` + shadow                      |
| Default edge                                 | `inset-edge-ring inset-edge-ring-full`     |
| Edge hover                                   | `inset-edge-hover`                         |
| Row hover fill                               | `bg-fill-hover`                            |
| Standard text                                | `text-foreground`, `text-muted-foreground` |

**Never** in feature code: raw hex, `--palette-*`, `text-white`, scattered `dark:` color pairs.

### 3. Token change workflow

When adding or changing design tokens:

```
primitive (colors.css) → semantic (--app-*) → @theme alias (index.css) → Tailwind / component class → DESIGN.md tables + YAML
```

Also update `index.html` boot skeleton if base surfaces (`background`, `surface-1`) change.

### 4. Keep DESIGN.md in sync

After token or layout changes, update **`DESIGN.md`**:

- YAML frontmatter `colors`, `typography`, `spacing`, `components` blocks
- Section tables if semantic roles shifted
- File map and sync checklist (section 10)

Keep DESIGN.md **descriptive of the product**, not a dump of every CSS line. Match the [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) section shape:

1. Visual Theme & Atmosphere
2. Color Palette & Roles
3. Typography Rules
4. Component Stylings
5. Layout Principles
6. Depth & Elevation
7. Motion & Interaction
8. Do's and Don'ts
9. Responsive Behavior
10. Agent Prompt Guide

Optional YAML frontmatter at top (Stitch-compatible) — see Notion/Linear examples in awesome-design-md.

## Product-specific rules

- **Only six palette families:** neutral, red, yellow, blue, green, purple
- **Neutral-first:** structural UI uses neutral semantics; color = status/signal
- **Surface stack:** `bg` (50) → `surface-1` (0) → `surface-2` (50) → `surface-3` (100) in light mode
- **Density:** Linear-feel — `text-sm` nav, `h-8` rows, compact controls
- **Theme:** light default; dark via `.dark` on `<html>` (`ThemeSync`)

## Anti-patterns

- Duplicating feature colors in TS files — extend `colors.css`
- New `transition-all` or custom cubic-bezier without theme justification
- Marketing-scale typography in product surfaces
- Creating one-off components when shadcn/ui primitives suffice

## Verification

After UI changes:

1. `npm run build` — no type errors
2. Mentally check light + dark for new surfaces (semantic tokens, not `dark:` pairs)
3. Confirm no new hex literals in `src/features/` or `src/components/`

## Reference links

- [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) — DESIGN.md format inspiration
- Project spec: `/DESIGN.md`
- Color implementation: `/src/styles/colors.css`
- Tailwind wiring: `/src/index.css`
