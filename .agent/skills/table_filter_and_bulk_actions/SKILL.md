---
name: table_filter_and_bulk_actions
description: Use this skill to implement reliable table UX: server-side filters/sort/pagination, row actions, bulk actions, and role-aware operations in admin interfaces.
---

# Table, Filters, and Bulk Actions

## Goal
Build scalable and predictable admin table flows.

## Steps
1. Contract first:
- Filter model (search, status, date ranges, etc.)
- Sort model
- Pagination model
- Bulk action contract

1.1 Reuse audit:
- Check if `AppDataTable`, `AppUrlFilterBar`, `AppActionMenu`, `AppDateRangePicker` already cover requested behavior
- Prefer extending their props/state adapters over creating new table primitives

2. State placement:
- URL state for shareable filters
- Local state for temporary UI controls
- Query keys include full filter/sort/page state

3. Interaction safety:
- Bulk actions require confirmation
- Show partial success/failure summaries
- Preserve selected rows correctly across page changes (if required by product)

4. Performance:
- Debounced search
- Virtualized rows for large datasets
- Cursor pagination where backend supports it

5. UX and access:
- Empty/loading/error states
- Keyboard-accessible row menus/actions
- Hide/disable unauthorized actions based on role policy
- Preserve compact visual density consistent with starter components
