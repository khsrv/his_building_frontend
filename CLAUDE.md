# CLAUDE.md — Project Rules for Claude Code

> Universal CRM/Admin starter on Next.js 16 + TypeScript strict + MUI + TanStack Query.
> These rules are mandatory. Follow them in every task.

## Quick Reference

- **Stack:** Next.js 16 (App Router), React 19, TypeScript 5.8 (strict), MUI 7, TanStack Query 5, Zod, Tailwind CSS 3
- **Package manager:** npm
- **Path alias:** `@/*` → `src/*`
- **Languages:** EN, RU, TG, UZ (i18n via `src/shared/i18n`)
- **Quality commands:**
  - `npm run lint` — ESLint
  - `npm run typecheck` — TypeScript check
  - `npm run test` — Vitest unit tests
  - `npm run build` — production build
  - `npm run check` — all checks at once (lint + typecheck + test + build)
  - `npm run e2e` — Playwright E2E tests
  - `npm run generate:feature` — scaffold a new feature module

---

## 1. Architecture (MANDATORY)

Modular clean-architecture boundaries:

```
App (routing/composition) → Module Presentation → Module Application → Module Domain
                                                    ↑
                                          Infrastructure (implements ports)
```

### Hard Rules
- **`domain/`** — pure TypeScript only. No React, no Next.js, no browser APIs.
- **`presentation/`** — never calls `fetch`/Axios directly; uses hooks from application layer.
- **`app/`** — composes modules, providers, layouts, and route-level guards only. No business logic in `page.tsx`.
- **`infrastructure/`** — never leaks DTO or raw transport errors upward.

### Data Model Separation (STRICT)
Always separate: **Transport DTO → Domain Model → UI ViewModel/FormModel**.
Never expose DTOs directly to UI components.

---

## 2. Project Structure

```
src/
  app/
    (public)/          # Public routes
    (admin)/           # Admin/CRM routes (auth-guarded)
    api/               # Route handlers (BFF)
    layout.tsx         # Root layout
  modules/
    <feature>/
      domain/          # Entities, value objects, business errors
      application/     # Use-cases, ports (repository/service interfaces)
      infrastructure/  # API adapters, DTOs, mappers, repository impls
      presentation/    # Components, hooks, query-keys
    _template/         # Reference module — use as scaffold example
    auth/              # Authentication module
  shared/
    ui/                # Reusable UI components (App* wrappers)
      primitives/      # Button, Input, Select, DataTable, etc. (45+ components)
      layout/          # AppShell, AppSidebar, AppTopBar
      feedback/        # ErrorBoundary, PageState
      overlays/        # ConfirmDialog
      responsive/      # ResponsiveContainer
      theme/           # ThemeSwitcher, LocaleSwitcher
    providers/         # AppProviders, QueryProvider, ThemeProvider, etc.
    lib/               # HTTP client, query-client, RBAC, formatters, errors
    hooks/             # useBreakpoint, useUrlFilters, useUnsavedChangesGuard
    i18n/              # Dictionaries (en, ru, tg, uz)
    config/            # Environment validation
    constants/         # Routes, breakpoints, locales, theme tokens
    types/             # Shared types (Result<T>)
tests/
  unit/                # Vitest unit tests
  e2e/                 # Playwright E2E tests
```

---

## 3. Reuse-First Policy (MANDATORY)

**"Do not reinvent the wheel"** — before creating ANY new UI component:

1. Check existing components in `src/shared/ui/primitives/` and `src/shared/ui/layout/`.
2. Check the starter showcase: `src/modules/_template/presentation/components/starter-showcase.tsx`.
3. Build mapping: requested behavior → existing component → extension plan.
4. Create new component ONLY if no existing one covers the need.

### Reuse Priority Order
1. Use existing component as-is
2. Extend via props/composition
3. Create reusable wrapper around existing primitive
4. Create new primitive (last resort — requires gap reason + usage example)

### Key Existing Components

All components are exported from `src/shared/ui/index.ts`. Always import from there, never from the primitive file directly.

**Forms & Input**
`AppButton`, `AppInput`, `AppSelect`, `AppSmartTextInput`, `AppDateRangePicker`, `AppMoneyInput`, `AppTagInput`, `AppSearchableSelect`

**Data Display**
`AppDataTable`, `AppStatCard`, `AppKpiGrid`, `AppStatusBadge`, `AppCurrencyDisplay`, `AppProgressBar`, `AppChartWidget`

**Layout & Navigation**
`AppSidebar`, `AppTopBar`, `AppShell`, `AppTabs`, `AppPageHeader`, `AppTreeList`

**Entity Management**
`AppEntityEditor`, `AppDrawerForm`, `AppCrudPageScaffold`, `AppBulkActionBar`, `AppActionMenu`

**Domain-Specific (BuildCRM)**
`AppColorGrid` — apartment grid visualization (шахматка: free/booked/sold/reserved)
`AppKanbanBoard` — drag-and-drop deal/task board (native HTML5 DnD)
`AppPaymentTimeline` — installment payment schedule with overdue/today/upcoming states
`AppCommentThread` — threaded notes/comments with replies and pinning
`AppCountdownBadge` — live countdown timer for booking expiry (chip/inline/block variants)
`AppNotificationCenter` — bell icon + notification dropdown with unread count

**Feedback & UX**
`AppStatePanel`, `AppAuditTimeline`, `AppStepWizard`, `AppFileUpload`, `AppWidgetKit`, `AppPermissionGate`, `ShimmerBox`, `ConfirmDialog`

### Component Lookup — Before Writing ANY UI Code

| Need | Use |
|------|-----|
| Money / price field | `AppMoneyInput` |
| Formatted price display | `AppCurrencyDisplay` |
| Multi-tag / label picker | `AppTagInput` |
| Search-and-select entity (e.g. client) | `AppSearchableSelect` |
| Apartment / unit grid (шахматка) | `AppColorGrid` |
| Deals / tasks board | `AppKanbanBoard` |
| Payment schedule | `AppPaymentTimeline` |
| Client notes / history | `AppCommentThread` |
| Booking expiry timer | `AppCountdownBadge` |
| Notifications bell | `AppNotificationCenter` |
| Construction progress bar | `AppProgressBar` |
| Bar / line / pie chart | `AppChartWidget` |
| ЖК → Block → Floor tree | `AppTreeList` |
| Multi-step form flow | `AppStepWizard` |
| Filterable data table | `AppDataTable` |
| CRUD page shell | `AppCrudPageScaffold` |
| Bulk row actions | `AppBulkActionBar` |
| Row context menu | `AppActionMenu` |
| Entity detail editor | `AppEntityEditor` |
| Slide-in form | `AppDrawerForm` |

### Forbidden
- Rebuilding button/input/table/menu/chart from scratch when starter equivalents exist
- Creating one-off color grids, kanban boards, countdown timers, or payment timelines
- Creating one-off variants that break the design token system
- Mixing MUI with Ant Design in one module
- Implementing low-level behavior (focus trap, keyboard nav, sorting engine, DnD) from scratch
- Using `recharts` directly in feature components — always use `AppChartWidget`

---

## 4. Admin UI Strategy (MUI-First)

- Admin/CRM modules use **MUI components** by default.
- Feature code imports `App*` wrappers from `src/shared/ui`, NOT raw `@mui/*`.
- Data grid: `MUI DataGrid` (Community edition).
- Date pickers: `@mui/x-date-pickers`.
- Keep consistent density, radius, and spacing across all admin views.

---

## 5. TypeScript Rules

- **All strict flags enabled** — `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `useUnknownInCatchVariables`.
- No `any` unless explicitly justified in a comment. Prefer `unknown` + narrowing.
- No `as unknown as T` casts.
- Prefer union literals over `enum` for web payloads.
- Use `as const` objects for constant sets.
- Public function boundaries must be explicitly typed.
- Domain types are immutable by default (`readonly`).
- No non-null assertions (`!`) in application logic.

---

## 6. Naming Conventions

| What | Convention | Example |
|------|-----------|---------|
| Folders/files | `kebab-case` | `user-profile/` |
| React components | `PascalCase.tsx` | `UserCard.tsx` |
| Hooks | `use-*.ts(x)` | `use-auth.ts` |
| Zod schemas | `*.schema.ts` | `login.schema.ts` |
| Query key factories | `query-keys.ts` | per module |
| Tests | `*.test.ts(x)` | `auth.test.ts` |

---

## 7. Imports and Dependencies

- Always use path alias `@/` (e.g., `@/modules/auth/...`, `@/shared/ui/...`).
- No deep relative imports (`../../../`).
- **Domain** must NOT import infrastructure or presentation.
- Cross-module imports go through explicit public entry files (`index.ts`).

---

## 8. Data Fetching (TanStack Query)

- Server state lives in **TanStack Query** — do not duplicate into Zustand/local state.
- Each module defines a key factory in `query-keys.ts`. No ad-hoc string keys in components.
- One hook per intent: `use-users-list-query`, `use-user-detail-query`.
- Mutations use **targeted invalidation** (exact keys), not global `invalidateQueries()`.
- Pagination/filter state lives in **URL params** or dedicated table state.
- No `fetch` directly in component body.

---

## 9. State Management

| State Type | Tool |
|-----------|------|
| Server state | TanStack Query |
| URL/shareable state | Search params / path segments |
| Local ephemeral state | `useState` / `useReducer` |
| Shared client UI state | Zustand (one store per concern) |

- Never use Zustand as API cache replacement.
- Persist only stable UX preferences/session flags.
- Use selectors to limit re-renders.

---

## 10. Forms and Validation (RHF + Zod)

- Every non-trivial form has a **Zod schema**. Form values inferred via `z.infer<>`.
- Submit flow: `handleSubmit` → normalize payload → call mutation → map errors.
- Disable repeated submits while pending.
- Server field errors map back to specific form fields.
- Every field has a label, helper/error text, and correct `aria` attributes.

---

## 11. Next.js App Router

- **App Router only** (`src/app/`). Route groups: `(public)`, `(admin)`.
- Default to **Server Components**. Add `"use client"` only when interaction/browser API is needed.
- Keep `page.tsx` and `layout.tsx` composition-focused — no business logic.
- Middleware: lightweight checks only (auth redirects). No heavy IO.
- Route Handlers: validate all payloads with Zod. Return typed error envelopes.
- Use `generateMetadata` for dynamic SEO.

---

## 12. Security

- Never store refresh tokens in `localStorage`.
- UI role checks are UX-only — real authorization is server-side.
- Cookie-based auth must include CSRF protection (`SameSite`, `Secure`, `HttpOnly`).
- Validate all incoming payloads with Zod on server boundaries.
- Escape/sanitize rich content before rendering.
- Never expose secrets through `NEXT_PUBLIC_*` or client bundles.
- No passwords/tokens/PII in logs.

---

## 13. Error and Loading Contract

- Every async UI has `idle / loading / success / error` states.
- User-facing errors are normalized (friendly + actionable).
- No raw stack traces or backend internals in UI.
- Empty states are mandatory for list/detail pages.

---

## 14. Responsive Design

- **Mobile-first** layout is mandatory.
- Each core route must work on mobile, tablet, and desktop.
- No horizontal overflow or hidden primary actions on small screens.
- Use `useBreakpoint` hook and `ResponsiveContainer` for adaptive layouts.

---

## 15. Testing

- **Test pyramid:** ~70% unit, ~20% integration, ~10% E2E.
- Unit tests: domain/application logic and pure utilities (Vitest).
- Integration tests: API adapters, query hooks, form submits.
- E2E tests: critical user journeys — auth, CRUD, permissions (Playwright).
- Bug fix requires a regression test.
- Refactor requires behavior-preserving checks.

---

## 16. Quality Gate (Before Every Commit/PR)

Run before marking any task complete:

1. **Scope:** Changed files respect module boundaries. No business logic in `app/` route files.
2. **Types:** `npm run typecheck` passes. No `any` in critical layers.
3. **Data:** Query keys and invalidation scoped correctly. No duplicated server state.
4. **UX:** Loading, empty, and error states handled. Form errors are actionable.
5. **Security:** No token/secret leaks. Auth checks on server boundaries.
6. **Checks:** `npm run check` passes (lint + typecheck + test + build).
7. **Summary:** Describe what changed, why, and any residual risks.

---

## 17. Feature Generation

Use `npm run generate:feature <name>` to scaffold new modules with correct structure. Reference `src/modules/_template/` for the canonical module pattern.

---

## 18. Forbidden Patterns (Summary)

- Business logic in `page.tsx` or `layout.tsx`
- DTO types used in domain layer
- `fetch` in component body
- `any` in domain/application layers
- Implicit `any` in callbacks
- Authorization based only on client state
- Secrets in client components or `NEXT_PUBLIC_*`
- Raw backend errors forwarded to users
- Snapshot-only testing strategy for logic-heavy components
- Global `invalidateQueries()` without scope
- Mixing MUI + Ant Design in one module
- Rebuilding existing starter components from scratch
- Creating custom money input / currency display when `AppMoneyInput` / `AppCurrencyDisplay` exist
- Creating custom apartment grid when `AppColorGrid` exists
- Creating custom kanban when `AppKanbanBoard` exists
- Creating custom payment schedule when `AppPaymentTimeline` exists
- Creating custom countdown timer when `AppCountdownBadge` exists
- Creating custom notification dropdown when `AppNotificationCenter` exists
- Creating custom bar/line/pie chart wrapper — use `AppChartWidget`
- Creating custom tag/label picker — use `AppTagInput`
- Creating custom entity search dialog — use `AppSearchableSelect`
- Creating custom hierarchy tree — use `AppTreeList`
- Creating custom multi-step form — use `AppStepWizard`
