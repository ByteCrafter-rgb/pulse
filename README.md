# Pulse

Live dashboard for watching HTTP services. Point it at a Prometheus `/metrics` endpoint and it polls, probes and plots latency, error rate and throughput as they happen.

The first thing it watches is a Redis-compatible key-value store I wrote in Go. I wanted to see what it was doing under load, and I wanted an excuse to build a frontend properly.

## Status

Work in progress. The component library is coming together. The API and dashboard come next.

## What's interesting about it

- **The UI library doesn't know the app exists.** Components take props and callbacks, nothing else. Lint rules block `fetch`, stores and routers inside `packages/ui`.
- **Keyboard first.** Every component follows its WAI-ARIA pattern and has axe and keyboard tests. The chart will be keyboard-operable too.
- **Slow on purpose.** The first dashboard is built naively and tagged `v0-naive`, then profiled and fixed one change at a time. The perf notes contain measured numbers only.
- **One data path.** Prometheus endpoint → poller → Postgres → GraphQL/SSE → TanStack Query/Zustand → DOM.
- **Decisions are written down.** ADRs for choices, and a debt log for shortcuts.

## Features

- Design tokens with light and dark themes
- Components: `Button`, `StatCard`, `Tabs`, `Toast`, with `DataTable<T>`, `Modal` and `Combobox<T>` on the way
- Storybook with an a11y addon and a theme toggle
- Planned: service polling and health probes, live streaming, alert rules, and SSG, SSR or CSR per route

## Stack

TypeScript (strict), React 19, Tailwind v4, Storybook, Next.js, TanStack Query, Zustand, GraphQL (graphql-yoga), Postgres, Vitest, jest-axe, Playwright. It's a pnpm + Turborepo monorepo.

## Running it

Node 24 and pnpm.

```bash
pnpm install
pnpm test
pnpm --filter @pulse/ui storybook
```
