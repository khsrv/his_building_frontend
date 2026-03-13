---
name: query_cache_playbook
description: Use this skill when designing or fixing TanStack Query usage: key factories, cache invalidation, pagination, optimistic updates, and error/loading handling.
---

# Query Cache Playbook

## Goal
Make server-state predictable, cache-safe, and easy to scale.

## Checklist
1. Query keys are centralized and deterministic.
2. Filters/pagination/user scope are part of the key.
3. Mutations use targeted invalidation.
4. Optimistic updates include rollback strategy.
5. Loading/error/empty states are explicit.

## Patterns
- Key factory per module (`all`, `list(filters)`, `detail(id)`).
- Mutation success updates either:
  - `setQueryData` for precise local update, or
  - scoped invalidation for broader consistency.
- Cursor pagination for large datasets.
- Cancel stale requests when inputs change rapidly.

## Anti-Patterns
- `invalidateQueries()` globally without scope
- ad-hoc string keys in components
- copying query result to global store by default
- silent failure with no user feedback
