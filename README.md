# Universal Frontend Starter (Next.js)

Production-ready skeleton for strict frontend architecture:
- Next.js App Router
- TypeScript strict mode
- Tailwind + shadcn-ready styling tokens
- TanStack Query provider
- Auth guard shell for admin routes
- Modular feature boundaries (`domain/application/infrastructure/presentation`)
- Reusable starter kit (theme, i18n, notifier, adaptive UI primitives)

## Folder intent
- `src/app`: routes, layout, minimal composition only
- `src/modules`: feature modules and business flows
- `src/shared`: cross-feature providers, UI primitives, configs, clients

## Built-in reusable kit
- Theme mode provider (`light` / `dark` / `system`) with persistence
- Locale provider (`ru` / `en` / `tg`) with persistence
- Notifier provider for global toasts
- UI primitives: button, card, input, select, tabs, confirm dialog, shimmer, text wrappers
- Responsive helpers: `ResponsiveContainer`, `useBreakpoint`, mobile-first breakpoints
- Common formatters: date and amount

## Quick start
1. Install dependencies: `npm install` (or `pnpm install` / `yarn`).
2. Create `.env` from `.env.example`.
3. Start app: `npm run dev`.
4. Replace `src/modules/_template` with real modules.
5. Replace auth placeholder flow with real backend auth/session contract.

## One-command new project init
Create a new project from this template:
- `./scripts/create-from-template.sh my-new-project /path/to/projects`

Then:
- `cd /path/to/projects/my-new-project`
- `npm install`
- `npm run check`

## Feature generator
Scaffold a feature module with strict layers:
- `npm run generate:feature -- products`

Generated structure:
- `src/modules/products/domain`
- `src/modules/products/application`
- `src/modules/products/infrastructure`
- `src/modules/products/presentation`

## Baseline dependencies
- Runtime: `next`, `react`, `react-dom`, `zod`, `@tanstack/react-query`, `@tanstack/react-query-devtools`
- Styling: `tailwindcss`, `postcss`, `autoprefixer`
- Optional: `react-hook-form`, `@hookform/resolvers`, `zustand`, `@tanstack/react-table`, `recharts` or `echarts`

## Mandatory project rules
Architecture and quality guidance is in:
- `.agent/rules`
- `.agent/skills`
- `.agent/workflows`

## CI quality gate
GitHub Actions pipeline is configured in:
- `.github/workflows/ci.yml`

Mandatory checks:
- lint
- typecheck
- unit tests
- production build
- Playwright smoke e2e

## Suggested first replacements
1. Replace auth placeholder flow with real Go backend session contract.
2. Replace `src/modules/_template` with first domain module.
3. Add CI checks: typecheck, lint, test, build.
4. Keep responsive checks mandatory for each delivered route (mobile/tablet/desktop).
