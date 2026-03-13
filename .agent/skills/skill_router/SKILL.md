---
name: skill_router
description: Use this meta-skill to choose the minimal relevant frontend skills (1-3) for tasks involving project bootstrap, Next.js architecture, feature delivery, admin modules, data fetching, forms, auth/session, tables, responsive adaptation, starter component reuse, performance, or pre-commit review.
---

# Meta Skill: Frontend Skill Router

## Goal
Select the smallest skill set that fully solves the task.
Default: 1 skill. Use 2 if necessary. Use 3 only for complex deliveries.

## Operating Rules
1. Follow `rules/frontend-core.md` first.
2. For UI-related tasks, run `starter_component_reuse` first (or pair it with primary skill).
3. Do not scaffold full modules for tiny fixes.
4. For admin tasks use MUI-first and do not introduce a second heavy UI system.
5. Keep output focused on requested scope.

## Selection Map

### A0) Starter component reuse / "do not build from zero"
Use: `starter_component_reuse`
Triggers:
- "reuse components", "starter", "не с нуля", "используй готовые компоненты", "универсальный компонент"

### A) New project bootstrap
Use: `frontend_project_bootstrap`
Triggers:
- "start project", "new project", "bootstrap", "инициализируй проект", "создай каркас"

### B) New feature/page/flow
Use: `next_feature_scaffold` + `starter_component_reuse` (secondary if UI changes)
Triggers:
- "add feature", "new page", "new flow", "сделай экран", "новая фича"

### C) Admin module (dense tables/filters/actions)
Use: `admin_module_scaffold` + `starter_component_reuse`
Triggers:
- "admin", "crm", "cabinet", "таблица", "фильтр", "bulk actions"

### D) Query/cache/loading issues
Use: `query_cache_playbook`
Triggers:
- "tanstack query", "cache", "invalidate", "loading", "refetch"

### E) Forms and validation
Use: `forms_rhf_zod`
Triggers:
- "form", "validation", "zod", "react hook form", "submit"

### F) Auth/session/guards/permissions
Use: `auth_session_and_guard`
Triggers:
- "auth", "jwt", "refresh", "cookie", "middleware", "role", "guard"

### G) Table/filter/sort/pagination/bulk
Use: `table_filter_and_bulk_actions` + `starter_component_reuse`
Triggers:
- "table", "filters", "sort", "pagination", "bulk", "grid"

### H) Pre-commit/PR quality gate
Use: `precommit_frontend_checklist`
Triggers:
- "review", "before commit", "before pr", "перед коммитом", "проверь"

### I) Responsive/mobile adaptation
Use: `responsive_mobile_first` + `starter_component_reuse`
Triggers:
- "responsive", "adaptive", "mobile layout", "breakpoint", "адаптив", "мобильная версия"

## Output Discipline
- 1 line: task restatement.
- List selected skills.
- Apply constraints and produce result.
- No unrelated architecture expansion.
