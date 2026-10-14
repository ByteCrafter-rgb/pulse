# Pulse

Pulse is a live dashboard for watching the health of HTTP services. You register a service, and Pulse polls its Prometheus `/metrics` endpoint, runs health probes, and shows latency, error rate and throughput as they change, with alerts and drill-downs.

The first real data source is a Redis-compatible key-value store I wrote in Go, which already exports Prometheus metrics. A small load generator fills in traffic for demos and benchmarks.

I'm building Pulse to practise the frontend work I care most about: a design system that stays separate from the app, keyboard accessibility that actually works, and performance fixes backed by measurements instead of guesses.

## Status

Pulse is being built in three stages. This README describes the whole project, and each item is marked with what exists today.

| Stage | Focus                                                            | State           |
| ----- | ---------------------------------------------------------------- | --------------- |
| 1     | Monorepo, design tokens, accessible component library, Storybook | **In progress** |
| 2     | GraphQL API, scraper, live streaming, first dashboard            | Planned         |
| 3     | Profiling and performance fixes, accessible chart, deployment    | Planned         |

## Why it might interest you (if you're hiring)

1. **Design system discipline.** `@pulse/ui` takes data and callbacks through props only. A lint rule blocks `fetch`, stores, routers and storage from the library, so it can't happen by accident.
2. **Accessibility built in from the start.** Components follow the WAI-ARIA patterns (roving tabindex, live regions, focus return), and each one has an axe test plus keyboard interaction tests.
3. **Performance work you can check.** The dashboard will first ship in a deliberately naive form, tagged `v0-naive`, then get profiled and fixed one commit at a time. Only measured numbers go in the write-up.
4. **End-to-end ownership.** The data path runs from a Prometheus endpoint through a poller, Postgres, GraphQL/SSE and client state to the DOM, and it's documented in one diagram.
5. **TypeScript depth.** Strict mode with `exactOptionalPropertyTypes`, generic components like `DataTable<T>` and `Combobox<T>`, and types shared between API and client with no duplicates.
6. **Decisions written down.** Short ADRs explain library and architecture choices, and a tech-debt log records every shortcut with the condition for paying it back.

## Features

### Design system (`packages/ui`)

- **Design tokens** as CSS variables (colour, spacing, type, radius, shadow) with light and dark themes. _Done_
- Tailwind v4 maps only semantic colours, so `bg-surface` and `text-danger` follow the theme at runtime and raw palette colours aren't available. _Done_
- A `ThemeProvider` plus a theme switcher in the Storybook toolbar. _Done_
- **Components**, each with stories, autodocs and tests:
  - `Button`: variants, sizes, and loading and disabled states. _Done_
  - `StatCard`: value, delta and trend, with the trend direction spoken for screen readers. _Done_
  - `Tabs`: roving tabindex, arrow/Home/End keys, automatic or manual activation. _Done_
  - `Toast` + `ToastProvider`: polite and assertive live regions, pause on hover/focus, Escape to dismiss. _Done_
  - `DataTable<T>`: sortable columns with `aria-sort` and arrow-key cell navigation. _Next_
  - `Modal`: focus trap, Escape, focus return and scroll lock. _Next_
  - `Combobox<T>`: the ARIA 1.2 combobox pattern with type-ahead. _Next_
  - `LineChart`: SVG chart that you can drive with the keyboard and switch to a table view. _Stage 3_

### Dashboard and API (planned)

- Register services, then poll their Prometheus endpoints and run HTTP health probes, with timeouts and retries.
- GraphQL API (graphql-yoga) with Postgres for history, and a live stream of new samples.
- Alert rules evaluated on each sample window.
- Clear state boundaries: TanStack Query owns server data and history, and Zustand holds only the live buffer and UI state.
- A rendering strategy chosen per route: SSG for landing and docs pages, SSR for public status pages, CSR for the dashboard.
- A load generator that can push around 2,000 points/sec across 20 services for stress testing.

## Tech stack

- **Monorepo:** pnpm workspaces, Turborepo
- **Language:** TypeScript (strict) everywhere
- **UI:** React 19, Tailwind CSS v4, Storybook 10
- **Web app:** Next.js (App Router), TanStack Query, Zustand
- **API:** Node.js, GraphQL (graphql-yoga), Postgres
- **Testing:** Vitest, Testing Library, jest-axe, Playwright
- **Tooling:** ESLint (with `jsx-a11y`), Prettier, GitHub Actions

## Repository layout

```
pulse/
  packages/ui/       design system + Storybook
  packages/shared/   shared types and schemas
  apps/api/          GraphQL API, scraper, live stream     (stage 2)
  apps/web/          Next.js dashboard                      (stage 2)
  tools/loadgen/     traffic simulator                      (stage 2)
  docs/              ADRs, architecture, performance notes
```

## Running it locally

You need Node 24 (see `.nvmrc`) and pnpm.

```bash
pnpm install

pnpm lint             # ESLint across the workspace
pnpm typecheck        # tsc in every package
pnpm test             # Vitest, including axe checks

pnpm --filter @pulse/ui storybook   # Storybook on http://localhost:6006
pnpm build-storybook                # static build
```

CI runs the format check, lint, typecheck, tests and the Storybook build on every push.

## What's next

- Finish `DataTable`, `Modal` and `Combobox`, then write the first ADRs.
- Publish Storybook to GitHub Pages.
- Start stage 2: the API, the scraper and the first, deliberately unoptimised dashboard.
