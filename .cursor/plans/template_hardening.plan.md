---
name: Template hardening
overview: 'Targeted improvements from a June 2026 audit of the fresh-start template: deny-by-default Instant perms, an owner-less item edge case, overlay scrim tokens, checkbox inset-edge migration, a vitest harness with smoke tests, and keyboard-shortcut docs/consolidation. Each item is independent and executable in a single session.'
todos:
  - id: perms-default-deny
    content: 'instant.perms.ts: add $default deny rules so future entities/attrs are blocked until rules are written; push with instant-cli'
    status: pending
  - id: ownerless-item-edge
    content: 'ExampleItems/mutations: prevent owner-less createItem when Instant is configured; surface transact failures instead of silent optimistic revert'
    status: pending
  - id: overlay-tokens
    content: 'Tokenize dialog/sheet overlay scrims (bg-black/50, bg-black/[0.07]) as --app-overlay-* in colors.css with :root + .dark values'
    status: pending
  - id: checkbox-inset-edge
    content: 'checkbox.tsx: migrate border border-border to inset-edge-ring pattern per colors rule'
    status: pending
  - id: vitest-harness
    content: 'Add vitest + @testing-library/react; smoke tests for AuthGate, CommandMenu keybindings, ExampleItems guest mode; add npm test script'
    status: pending
  - id: keyboard-docs
    content: 'Document ⌘/ (agent chat) in README shortcuts table; optionally consolidate AppShell + CommandMenu keydown listeners'
    status: pending
isProject: false
---

# Template hardening

Findings from a targeted audit (auth/perms, design-token drift, shell consistency) of the post-pivot template. The codebase builds clean (`npm run build` ✓), has zero hardcoded hex values in components, no `dark:` pairs, and no `transition-all` drift. These are the only items worth fixing.

Stale Dance-era plans were archived to `.cursor/plans/archive/` — do not consult them; they reference deleted code.

## 1. Deny-by-default perms (`perms-default-deny`)

`src/instant.perms.ts` covers only `items`. Any entity added to `src/instant.schema.ts` later ships **allow-all** until someone remembers to write rules.

Add a catch-all:

```ts
const rules = {
  $default: {
    allow: { $default: 'false' },
  },
  attrs: {
    allow: { $default: 'false' }, // blocks arbitrary new attrs from clients
  },
  items: {
    // ...existing owner-scoped rules unchanged
  },
} as const
```

Verify against current InstantDB perms docs (`$default` semantics) before pushing with `npx instant-cli push perms`. Update the comment block at the top of the file to explain the deny-by-default posture.

## 2. Owner-less item edge case (`ownerless-item-edge`)

`createItem(title, ownerId: string | null)` in `src/lib/instant/mutations.ts` accepts `null` and skips the owner link. When Instant **is** configured:

- `ExampleItems.tsx` passes `user?.id ?? null` — if auth hasn't resolved, an item is created with no owner
- Server perms (`create: 'isOwner'`) reject it → the optimistic insert silently reverts

Fix: in the `hasInstantConfig` branch of `useExampleItems`, don't allow `addItem` without `user.id` (disable the form or throw). `null` owner stays valid only for guest mode. Optionally attach a `.catch` to `db.transact` calls to surface failures.

## 3. Overlay scrim tokens (`overlay-tokens`)

Per `.cursor/rules/colors.mdc`, themed surfaces must not hardcode `bg-black`. Two violations, both overlay scrims:

- `src/components/ui/sheet.tsx` line ~25: `bg-black/50`
- `src/components/ui/dialog.tsx` line ~30: `bg-black/[0.07]`

Add `--app-overlay-strong` and `--app-overlay-soft` to `src/styles/colors.css` (`:root` + `.dark` — dark mode likely wants higher opacity for the soft scrim), expose via `@theme` in `src/index.css`, use in both components, and document in the DESIGN.md token table. Decide deliberately whether dialog (soft) vs sheet (strong) scrim strengths should stay different.

## 4. Checkbox inset-edge migration (`checkbox-inset-edge`)

`src/components/ui/checkbox.tsx` still uses the legacy `border border-border` + `shadow-none` pattern. Every other primitive uses `inset-edge-ring inset-edge-ring-full`. Migrate it; remember the colors rule: **never `shadow-none` together with `inset-edge-ring`** (it clears the inset border). Check both unchecked and checked + focus-visible states in light and dark.

## 5. Vitest harness (`vitest-harness`)

No test runner exists. Add `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom` as devDependencies and a `"test": "vitest"` script. Smoke tests only:

- `AuthGate` — renders children in guest mode; redirects to `/sign-in` when configured + signed out (mock `@/lib/instant/db`)
- `CommandMenu` — opens on `/` and ⌘K, not while typing in an input
- `ExampleItems` — guest-mode add/remove round-trip

Keep the mock surface tiny — `db` is already a single import boundary, which makes this easy.

## 6. Keyboard docs + listener consolidation (`keyboard-docs`)

README's shortcut table lists `/`/⌘K and ⌘. but not **⌘/** (agent chat toggle, bound in `AppShell.tsx`). Add it. Optionally merge the two document-level keydown listeners (`AppShell` and `CommandMenu`) into one registry so future shortcuts have a single home — only do this if it stays simpler than two small listeners.

## Explicitly out of scope

- `AgentChatPanel` / `ShellAgentControls` are intentional disabled stubs — leave them
- `db.ts` guest-mode `as unknown as` cast — acceptable template trade-off
- Minor arbitrary values (`text-[13px]`, `size-[18px]`, `max-h-[27rem]`) — intentional density choices
- Any feature work — that belongs in a separate product plan once v1 scope is set
