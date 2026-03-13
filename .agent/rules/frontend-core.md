---
trigger: always_on
---

FRONTEND RULES v1.0
Status: FINAL
Scope: Always-on
Goal: Enforce architecture, safety, and consistency for Next.js + TypeScript projects.
Details and recipes live in `skills/` and `workflows/`.

## 0. Global Priority
- RULES override skills.
- Skills are selected minimally (1 primary, optional 1 secondary).
- Prefer the simplest valid solution; no over-architecture without pain.

## 1. Architecture (MANDATORY)
Use modular clean boundaries:

`App (routing/composition) -> Module Presentation -> Module Application -> Module Domain`

`Infrastructure` implements ports defined by `Application`.

Hard rules:
- `domain` is pure TypeScript (no React, no Next.js, no browser APIs).
- `presentation` cannot call `fetch`/Axios directly.
- `app` layer composes modules, providers, layouts, and route-level guards only.
- `infrastructure` never leaks DTO/raw transport errors upward.

## 2. Fixed Project Shape (RECOMMENDED DEFAULT)
```txt
src/
  app/
    (public)/
    (admin)/
    api/
    layout.tsx
  modules/
    <feature>/
      domain/
      application/
      infrastructure/
      presentation/
  shared/
    ui/
    lib/
    hooks/
    config/
    constants/
    types/
tests/
```

## 3. Layer Contracts
- `domain/`: entities, value objects, policies, business errors.
- `application/`: use-cases, orchestration, repository/service ports.
- `infrastructure/`: API client adapters, DTOs, mappers, repository implementations.
- `presentation/`: page-level UI, feature widgets, UI hooks, event handlers.

Forbidden:
- business policy in JSX or route files
- DTO type usage inside domain
- mutable shared state outside controlled stores

## 4. Data Model Separation (STRICT)
Always separate:
- Transport DTO
- Domain model
- UI view-model/form model

Mapping direction:
`DTO -> Domain -> ViewModel`

Never expose DTO directly to UI.

## 5. Naming
- Folders/files: `kebab-case`
- React components: `PascalCase.tsx`
- Hooks: `use-*.ts` or `use-*.tsx`
- Zod schemas: `*.schema.ts`
- Query keys: centralized key factory per module (`query-keys.ts`)
- Tests: `*.test.ts(x)` or `*.spec.ts(x)`

## 6. Imports and Dependencies
- Use path aliases (for example `@/modules/...`, `@/shared/...`).
- No deep relative imports (`../../../..`) unless temporary.
- Domain must not import infrastructure/presentation.
- Cross-module imports go through explicit public entry files.

## 7. Error and Loading Contract
- Every async UI has `idle/loading/success/error` states.
- User-facing errors are normalized (friendly + actionable).
- No raw stack traces or backend internals in UI text.
- Empty states are mandatory for list/detail pages.

## 8. Security Baseline
- Never store refresh tokens in `localStorage`.
- Never trust client-only role checks for authorization.
- Sanitize/escape user content before rendering rich text.
- Never expose secrets in client bundles.

## 9. Responsive Baseline
- Mobile-first layout is mandatory.
- Each core route must be verified for mobile/tablet/desktop behavior.
- No horizontal overflow or hidden primary actions on small screens.

## 10. Reuse-First UI Policy (MANDATORY)
- Principle: "Do not reinvent the wheel" / "Велосипед не изобретай".
- Before creating any new UI primitive, audit `src/shared/ui` and starter showcase examples first.
- If matching or near-matching component exists, compose/extend it instead of cloning or rewriting.
- New primitive is allowed only when:
  - no existing component covers the behavior, and
  - extension would create brittle API or visual inconsistency.
- Any new primitive must include:
  - explicit gap note (why existing component is insufficient),
  - mobile/desktop behavior plan,
  - usage example in showcase or module demo.

## 11. Decision Rule
- New project/bootstrap -> `frontend_project_bootstrap` skill + `project_bootstrap_workflow`.
- New feature -> `next_feature_scaffold` skill + `feature_delivery_workflow`.
- Admin dense module -> `admin_module_scaffold` + `admin_module_workflow`.
- Query/cache issue -> `query_cache_playbook`.
- Form-heavy flow -> `forms_rhf_zod`.
- Auth/session change -> `auth_session_and_guard`.
- Responsive/adaptive task -> `responsive_mobile_first` + `responsive_adaptation_workflow`.
- Component reuse, starter alignment, or "do not build from zero" requests -> `starter_component_reuse` + `starter_reuse_workflow`.

## 12. Final Law
Rules define what is allowed.
Skills define how to implement.
Workflows define execution order.
