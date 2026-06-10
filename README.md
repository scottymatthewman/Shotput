# Webapp Template

A clean SaaS starter with great bones: a Linear-feel app shell, a token-driven design system, shadcn-style UI primitives, and an auth-ready data layer. Clone it, rename it, and build.

## Stack

- **Vite + React 19 + TypeScript** — SPA with lazy routes (`react-router-dom` v7)
- **Tailwind CSS v4** — configured entirely in CSS (`src/index.css` `@theme`); no `tailwind.config`
- **Design system** — three-layer color tokens in `src/styles/colors.css`, spec in `DESIGN.md`, agent guardrails in `.cursor/rules/`
- **UI primitives** — Radix-based shadcn-style components in `src/components/ui/`
- **Zustand** — persisted UI chrome state (theme, sidebar) in `src/state/uiStore.ts`
- **InstantDB** — schema, perms, and magic-code auth (optional; guest mode without it)
- **Prettier + ESLint** — `npm run format`, `npm run lint`

## Getting started

```bash
npm install
npm run dev
```

That's it — with no env vars the app runs in **guest mode**: no auth, data stays in memory.

### Enable sync + auth (InstantDB)

1. Create an app at [instantdb.com/dash](https://www.instantdb.com/dash)
2. Copy `.env.example` to `.env.local` and set `VITE_INSTANT_APP_ID`
3. Push the schema and permissions:

```bash
npx instant-cli push schema
npx instant-cli push perms
```

Sign-in uses Instant's magic-code flow (email → one-time code) — see `src/features/auth/SignInPage.tsx` and `src/components/AuthGate.tsx`.

## Make it yours

| Change               | Where                                                                      |
| -------------------- | -------------------------------------------------------------------------- |
| Product name         | `src/config/app.ts`, `index.html` `<title>`, `package.json`                |
| Data model           | `src/instant.schema.ts` + `src/instant.perms.ts`                           |
| Routes / pages       | `src/App.tsx`, `src/features/`                                             |
| Sidebar nav          | `src/components/nav/SidebarNav.tsx`                                        |
| Command menu actions | `src/components/CommandMenu.tsx`                                           |
| Colors / tokens      | `src/styles/colors.css` (then `src/index.css` `@theme`)                    |
| Font                 | `src/styles/typography.css` + `public/fonts/` + `index.html` boot skeleton |
| Feature flags        | `src/config/features.ts`                                                   |

The Home page's example items list (`src/features/home/ExampleItems.tsx` + `src/lib/instant/mutations.ts`) exists only to prove the data layer end to end — delete it when you start building.

## Keyboard shortcuts

| Keys        | Action         |
| ----------- | -------------- |
| `/` or `⌘K` | Command menu   |
| `⌘.`        | Toggle sidebar |

## Scripts

| Script            | What it does                 |
| ----------------- | ---------------------------- |
| `npm run dev`     | Dev server                   |
| `npm run build`   | Typecheck + production build |
| `npm run lint`    | ESLint                       |
| `npm run format`  | Prettier write               |
| `npm run preview` | Preview the production build |

## Design system

Read `DESIGN.md` before styling anything — it documents the surface stack, inset-edge borders, typography scale, motion rules, and copy-paste class recipes. The `.cursor/rules/` guardrails are always applied for AI agents working in this repo.
