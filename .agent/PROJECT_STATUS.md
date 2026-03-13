# PROJECT STATUS

## Implemented
- 2026-03-11: Initialized strict Frontend `.agent` foundation for Next.js + TypeScript + Tailwind + shadcn/ui.
- Added hard rules for architecture boundaries, App Router, typing, data flow, auth, testing, performance, and admin strategy.
- Added modular skills for routing, feature scaffolding, admin modules, forms, auth/session, query cache, tables, and pre-commit review.
- Added production workflows for feature delivery, bug fixing, admin module delivery, contract changes, refactor, performance investigation, and quality gate.
- Added reusable project bootstrap flow (`frontend_project_bootstrap` + `project_bootstrap_workflow`) for new-project initialization.
- 2026-03-11: Generated universal production-ready `src/` starter: App Router route groups (`(public)`, `(admin)`), providers, Query client, auth guard shell, shared HTTP/error/env layer, and modular `domain/application/infrastructure/presentation` template module.
- Added starter config baseline for cross-project reuse: `tsconfig` strict setup, `tailwind.config`, `postcss`, `next.config`, `.env.example`, and usage `README`.
- 2026-03-11: Initialized full Next.js project scaffold behavior (`create-next-app` parity): added standard runtime/config files (`eslint.config.mjs`, `public/*`, `favicon.ico`), installed dependencies (`package-lock.json`, `node_modules`), and verified checks (`lint`, `typecheck`, `build`).
- 2026-03-11: Added reusable web starter kit mirroring mobile `lib/src/widgets` patterns: button/card/input/select/tabs/dialog/shimmer/text components, notifier/toast provider, locale and theme providers (persisted), responsive hooks, date-range filter hook, and formatting utilities.
- 2026-03-11: Added responsive governance in `.agent` (`responsive-mobile-first` rule, responsive skill, and responsive workflow + router mapping).
- 2026-03-11: Added template acceleration layer: one-command project creator (`scripts/create-from-template.sh`), feature generator CLI (`scripts/generate-feature.mjs`), unit/e2e baseline tests, and CI pipeline (`.github/workflows/ci.yml`) with mandatory quality gates.

## In Progress
- Aligning real application code to the new architecture contracts (`app` composition-only, modular boundaries, typed API contracts).

## Pending
- Add CI quality gates: `typecheck`, `lint`, `test`, `build`, bundle budget, and Lighthouse target.
- Add e2e coverage for critical paths: auth, list/filter/detail/edit, role-based access.

## Architecture Target
- Framework: Next.js (App Router) + React + TypeScript
- UI: MUI-first for admin (`App*` wrappers) + Tailwind utility layer
- Server state: TanStack Query
- Forms: React Hook Form + Zod
- Local UI state: Zustand (only shared client state)
- Tables: MUI DataGrid Community by default, AG Grid for very heavy grids
- Auth: Go backend + session tokens (httpOnly cookie refresh is preferred)
