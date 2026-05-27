---
name: Dance v2 Fresh Start
overview: "Greenfield rebuild: InstantDB + Zustand (UI/actions), light/dark theme, nav shell (Home, Inbox, Plans, Reports) with full Plans feature set as the only live area. No Chat, Dashboard, Find, or other page code — nav stubs only."
todos:
  - id: scaffold
    content: Vite + React + Tailwind v4 + Router; Instant init; theme toggle; Zustand uiStore
    status: pending
  - id: nav-shell
    content: AppShell + SidebarNav (Home, Inbox, Plans, Reports) — disabled stubs except Plans; no page files for stubs
    status: pending
  - id: instant-schema
    content: Full Plans schema (workspaces, users, agents, plans, phases, activityEvents); seed; perms
    status: pending
  - id: zustand-layer
    content: uiStore (selection, view mode, undo, sidebar, theme) + usePlansStore actions wired to Instant mutations
    status: pending
  - id: plans-index
    content: Plan index — list, create new plan, empty state
    status: pending
  - id: plans-workspace
    content: Gantt + table views, view toggle, drag/resize/status interactions
    status: pending
  - id: phase-sheet
    content: Phase detail drawer (sheet) — checklist, assignees, dates, activity feed
    status: pending
  - id: plan-overview
    content: Plan overview page — metadata, team, budget, delete plan
    status: pending
  - id: keyboard-command
    content: Global keyboard shortcuts + command palette
    status: pending
  - id: auth-settings
    content: Instant Auth, settings (when flagged), tighten perms
    status: pending
  - id: inbox-home-reports
    content: Build Home, Inbox, Reports only when ready — new code, no port from old placeholders
    status: pending
isProject: false
---

# Dance v2 — Fresh Start Plan

## Goal

Build a **full-featured Plans workspace** in a clean repo:

- **InstantDB** for persistence and sync
- **Zustand** for UI state and action orchestration (keep it — it's the right tool)
- **Light + dark mode** from day one
- **Nav shell** with Home, Inbox, Plans, Reports — **only Plans has routes and code**
- **No ported code** for Chat, Dashboard, Find/industry events, or other placeholder pages

---

## Zustand — yes, keep it

Zustand is good. The problem in the current repo isn't Zustand itself — it's **what got stored in it**.

### Current repo (bloated)

```
InstantDB → assemble → domainStore (full workspace clone)
                              ↓
                      useDanceStore (300+ line facade)
                              ↓
                         uiStore (selection, undo, prefs)
                              ↓
                            UI
```

Three layers, two copies of workspace data, deprecated aliases threaded through the facade. Hard to reason about what's source of truth.

### v2 (lean but still Zustand)

```
InstantDB ←── mutations ←── usePlansStore (actions + optional assembled read)
     ↓                              ↑
 db.useQuery()                  uiStore (ephemeral UI only)
     ↓                              ↓
 assemble hook ──────────────────→ UI
```

**`uiStore`** — client-only, persisted where it makes sense:

- Theme, sidebar collapsed
- Gantt vs table view mode
- Selected / hovered / focused phase
- Command palette open
- Phase quick dialogs, pending Gantt menu targets
- Undo/redo frame stack

**`usePlansStore`** (or hooks colocated in `state/plansStore.ts`) — **actions**, not a second database:

- `createPlan`, `updatePhaseDates`, `setPhaseStatus`, etc.
- Calls Instant mutations
- Optionally exposes `workspace` assembled from the live Instant query (read-through, not a divergent clone)
- Captures undo frames before mutating

**Rule:** Instant owns persisted domain data. Zustand owns **interaction state** and **orchestration**. Never let Zustand drift from Instant without an explicit optimistic patch that resolves on sync.

This gives you everything Zustand is great at — snappy Gantt interactions, keyboard-driven selection, undo, persisted view prefs — without fighting the sync layer.

---

## What we do NOT bring over

**Zero code** for these (delete, don't stub pages):

| Do not port | Files / areas |
|-------------|---------------|
| Chat | `WorkspaceChatPage.tsx`, chat nav |
| Dashboard / Home page | `HomePage.tsx` |
| Find / industry events | `FindIndustryEventsPage.tsx`, `FindIndustryEventDetailPage.tsx`, `mock/findIndustryCatalog.ts` |
| Report placeholder | `ReportPlaceholderPage.tsx` |
| Discovery backend | `packages/discovery`, `packages/shared`, `api/`, discovery plan migrations |
| Deprecated naming | `Event*` pages, `resolveEventPlannerRoute`, `@deprecated` re-exports |

**Nav stubs only** for Home, Inbox, Reports — disabled rows in `SidebarNav`, no route, no page component, no mock data. When you're ready to build Inbox, you write it fresh against real Instant data.

---

## Nav shell — Home, Inbox, Plans, Reports

```
┌─────────────────────────┐
│  [Workspace]            │
│  [Search /]             │
│  ─────────────────────  │
│  ○ Home           (soon)│  ← nav row only, no code
│  ○ Inbox          (soon)│  ← nav row only, no code
│  ● Plans           LIVE │
│      All plans          │
│      · Plan A           │
│      · Plan B           │
│  ○ Reports        (soon)│  ← nav row only, no code
│  ─────────────────────  │
│  ◐ Theme toggle         │
│  ○ Settings       (soon)│
└─────────────────────────┘
```

```ts
// src/config/features.ts
export const features = {
  home: false,    // nav stub — no HomePage.tsx
  inbox: false,   // nav stub — no InboxPage.tsx
  plans: true,    // full feature set
  reports: false, // nav stub — no ReportsPage.tsx
  settings: false,
} as const
```

### Routes (Plans only)

| Route | Screen |
|-------|--------|
| `/` | Redirect → `/plans` |
| `/plans` | Plan index (list + create) |
| `/plans/:planId` | Workspace — Gantt / table |
| `/plans/:planId/overview` | Plan overview |
| `*` | Minimal 404 |

Deep link: `?phase=:id` opens phase detail drawer on workspace.

---

## Plans — full feature set (port almost everything)

This is the product. Ship it complete, not phased down to an MVP.

### Plan index (`/plans`)

- Card/list of all plans
- **Create new plan** flow (name, dates, owner)
- Empty state
- Sidebar dynamic plan list

### Workspace (`/plans/:planId`)

- **Gantt view** — drag, resize, collision, week grid, status bars, context menus
- **Table view** — same data, dense row layout
- **View toggle** (Gantt ↔ Table), persisted in `uiStore`
- Row/bar interactions: status change, priority, assignee quick dialogs
- Keyboard: j/k navigation, Enter to open drawer, Esc to close, shortcuts help

### Phase detail drawer (`TaskSheet` → `PhaseSheet`)

- Slide-over sheet with animated open/close
- Title, description, dates, status, priority, section
- Checklist items
- Assignees (users + agents)
- Budget fields (allocated / actual)
- Activity feed with pagination

### Plan overview (`/plans/:planId/overview`)

- Plan metadata (name, dates, location, status, description)
- Team roster
- Budget tracker
- Delete plan flow
- Link back to workspace

### Cross-cutting (Plans scope)

- **Command palette** — search plans + phases, jump navigation
- **Global keyboard shortcuts** layer
- **Undo / redo** (workspace snapshots via Instant transact restore)
- **Activity log** writes on meaningful mutations
- **Agents** as assignees (Collie, Ledger from seed)

### Rename on port (no aliases)

| Current | v2 |
|---------|-----|
| `EventIndexPage` | `PlanIndexPage` |
| `TimelineWorkspacePage` | `PlanWorkspacePage` |
| `EventOverviewPage` | `PlanOverviewPage` |
| `TaskSheet` | `PhaseSheet` |
| `/plan/*` routes | `/plans/*` |

---

## Stack

```
dance-v2/
├── src/
│   ├── app/                    # routes, AppShell, ThemeProvider
│   ├── features/plans/
│   │   ├── PlanIndexPage.tsx
│   │   ├── PlanWorkspacePage.tsx
│   │   ├── PlanOverviewPage.tsx
│   │   ├── PhaseSheet.tsx
│   │   ├── gantt/
│   │   ├── table/
│   │   ├── CommandMenu.tsx
│   │   └── GlobalKeyboardShortcuts.tsx
│   ├── components/ui/
│   ├── config/features.ts
│   ├── state/
│   │   ├── uiStore.ts          # ephemeral + persisted UI
│   │   └── plansStore.ts       # actions + Instant read hook
│   ├── lib/instant/
│   └── types/domain.ts
├── instant.schema.ts
└── instant.perms.ts
```

**Deps:** Vite, React 19, TS, `@instantdb/react`, React Router 7, Tailwind v4, **Zustand** (+ persist, immer if helpful), Radix, cmdk, date-fns, lucide-react.

---

## InstantDB schema (Plans-complete)

Use the current schema shape — Plans needs all of it:

```ts
workspaces:   { name }
users:        { name, email, avatarUrl? }
agents:       { name, description }
plans:        { name, description, status, ownerUserId, start, end,
                location?, teamMemberUserIdsJson?, navIconId?, navColor?,
                sortOrder?, budgetCents?, budgetCurrency? }
phases:       { title, description, status, statusIsManual?, priority,
                section, start, end, assigneeUserIdsJson, assigneeAgentIdsJson,
                tasksJson, sortOrder?, budgetAllocatedCents?, budgetActualCents? }
activityEvents: { timestamp, actorId, actorIsAgent, verb, objectType,
                   objectId, objectLabel, planId?, payloadJson? }

// links: workspace↔plans/users/agents, plan↔phases
```

**Defer until Find ships:** `industryEventId`, workspace onboarding fields.

**Setup:** new Instant app → `instant-cli init` → `VITE_INSTANT_APP_ID` → `push schema` + `push perms`.

---

## Light + dark mode

Semantic tokens via `.dark` on `<html>`:

```css
:root { /* light */ }
.dark { /* port current dark palette */ }
```

- Toggle in sidebar; persist in `uiStore` + `localStorage`
- Define Gantt task-bar tokens for **both** modes up front

---

## Phased build

### Phase 0 — Scaffold

- Vite, Tailwind, Router, shadcn primitives
- Instant schema + seed
- Theme + `uiStore`
- AppShell + nav stubs (Home/Inbox/Reports disabled, no page files)
- `/` → `/plans`

### Phase 1 — Full Plans (the whole product)

Port and rename in one pass:

1. `uiStore` + `plansStore` (actions, Instant query hook, undo)
2. Plan index + create plan
3. Gantt + table + view toggle
4. Phase sheet (full drawer)
5. Plan overview
6. Command palette + keyboard shortcuts
7. Activity log on mutations

**Do not port:** HomePage, Chat, Find pages, findIndustryCatalog, ReportPlaceholder, Settings connectors gallery.

### Phase 2 — Auth & settings

- Instant Auth
- Settings page (workspace, members) — first non-Plans page with real code
- Tighten `instant.perms.ts`

### Phase 3 — Home, Inbox, Reports (greenfield)

Build fresh when ready — **not** ported from old placeholders:

- **Inbox** — phases assigned to you, activity needing action
- **Home** — digest across plans
- **Reports** — export / rollup when spec exists

Flip feature flags one at a time.

### Phase 4 — Discovery (optional, later)

- Separate API + Postgres catalog
- `plans.industryEventId`
- New Find UI written fresh — not ported from mock catalog

---

## Port list

| Port (rename + clean) | Do not bring |
|-----------------------|--------------|
| `GanttView.tsx` | `HomePage.tsx` |
| `TimelineTableView.tsx` | `WorkspaceChatPage.tsx` |
| `TaskSheet.tsx` → `PhaseSheet.tsx` | `FindIndustryEventsPage.tsx` |
| `EventOverviewPage.tsx` → `PlanOverviewPage.tsx` | `FindIndustryEventDetailPage.tsx` |
| `EventIndexPage.tsx` → `PlanIndexPage.tsx` | `ReportPlaceholderPage.tsx` |
| `TimelineWorkspacePage.tsx` → `PlanWorkspacePage.tsx` | `mock/findIndustryCatalog.ts` |
| `CommandMenu.tsx`, `commandIndex.ts` | `packages/*`, `api/` |
| `GlobalKeyboardShortcuts.tsx` | Deprecated event/timeline aliases |
| `uiStore.ts` (as-is, + theme) | `domainStore` full clone pattern |
| `mutations.ts`, `assembleWorkspace.ts`, `seed.ts` | 50 unused Event SVGs (Lucide for now) |
| `instant.schema.ts` (minus industryEventId) | Agentation, nav debug probes |
| `SidebarNav` (new item list) | |
| `index.css` tokens (light + dark split) | |
| shadcn `components/ui/*` | |

Refactor `useDanceStore` → `plansStore`: keep action surface, drop domain mirror, wire directly to Instant query.

---

## Repo hygiene

1. **No page files** for disabled nav items
2. **No `@deprecated` aliases** — rename once, use git history
3. Instant = persisted data; Zustand = UI + actions
4. Single package until API is real
5. Nav shows four items; only Plans has routes

---

## Success criteria

- Zustand drives interactions (selection, undo, view mode, theme) — not a redundant DB
- Full Plans: Gantt, table, overview, phase drawer, create plan, keyboard, command palette
- Zero Chat / Dashboard / Find / Report placeholder code in repo
- Home, Inbox, Reports visible in nav but inert until Phase 3
- Light + dark both polished including Gantt
