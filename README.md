# Dance — UI/UX V1 prototype

Backend-free **clickable prototype** for Dance with **InstantDB** local-first sync: projects, timelines, tasks (including **AI agent** assignees), activity history, a draggable **Gantt**, **Table** view, and a **Linear-style** shell (dense chrome, borders, **`/`** command menu, task **sheet**).

## Run

```bash
npm install
cp .env.example .env.local   # add VITE_INSTANT_APP_ID from instantdb.com/dash or getadb.com/provision/<uuid>
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

Push schema after edits:

```bash
npx instant-cli push schema
npx instant-cli push perms
```

## Shortcuts & behaviors

- **`/`** — command palette: navigation, actions, tasks (live index from InstantDB).
- **j / k** — move task focus on timeline; **Enter** opens sheet; **C** creates task.
- **⌘Z / ⌘⇧Z** — undo / redo (session snapshots synced back to Instant).
- **V** — cycle Gantt ↔ Table; **S / P / A / ⌘⌫** on focused or hovered task.
- **⌘.** — toggle sidebar; closes task sheet when open.
- **Esc** — close command menu → quick dialogs → task sheet.
- **Gantt**: drag a task bar to shift dates (writes via Instant `db.transact`, no spinner).
- Demo data seeds automatically on first load when the Instant workspace is empty.

## Stack

Vite, React 19, TypeScript, Tailwind CSS v4, React Router v7, **InstantDB** (`@instantdb/react`), Zustand (UI-only state), date-fns, Radix + shadcn-style UI.

## Scripts

| Command      | Purpose        |
| ------------ | -------------- |
| `npm run dev`    | Vite dev server |
| `npm run build`  | Typecheck + production build |
| `npm run preview`| Preview production build |
| `npm run lint`   | ESLint |
