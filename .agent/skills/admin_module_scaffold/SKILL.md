---
name: admin_module_scaffold
description: Use this skill to implement admin modules with list/filter/detail/edit flows, role-aware actions, and scalable MUI-first table architecture (DataGrid default, AG Grid only by exception).
---

# Admin Module Scaffold

## Goal
Ship a dense admin module with reliable behavior and clear scaling path.

## Steps
1. Clarify admin contract:
- Columns, filters, sort rules
- Row actions and bulk actions
- Role/permission matrix
- Empty/error/loading behavior

2. Pick UI path:
- MUI-first for admin shell/forms/tables
- DataGrid Community as default grid engine
- AG Grid only when grid complexity requires it and exception is documented

3. Build module slices:
```txt
src/modules/<admin-feature>/
  domain/
  application/
  infrastructure/
  presentation/
    table/
    filters/
    forms/
```

4. Data and interactions:
- Server-driven filtering/sorting/pagination
- Stable query keys for each filter state
- Bulk actions with confirmation and rollback handling

4.1 Reuse starter kit first:
- Prioritize `AppDataTable`, `AppUrlFilterBar`, `AppActionMenu`, `AppEntityEditor`, `AppDrawerForm`
- Extend by composition/props before creating new admin primitives
- Keep table/forms sizing aligned with starter compact defaults

5. Quality requirements:
- Permission checks on server and UI
- Keyboard access for all actions
- No unbounded list rendering for large data
- No duplicate table/filter/action primitive in feature module without documented gap

## Output Format
- Module tree
- Filter/query contract
- Table state contract
- Form action flow
