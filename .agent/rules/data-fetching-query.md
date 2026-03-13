# Data Fetching and TanStack Query Rules

## 1. Source of Truth
- Server state lives in TanStack Query.
- Do not duplicate query data into Zustand/local component state by default.
- All API calls go through typed infrastructure clients.

## 2. Query Key Strategy
- Each module defines a key factory (`query-keys.ts`).
- Keys must include stable filters, pagination, and tenant/user context where needed.
- No ad-hoc string keys scattered in components.

## 3. Query Hooks
- One hook per intent (`use-users-list-query`, `use-user-detail-query`).
- Use `select` for mapping transport -> view model.
- Keep `staleTime`, `gcTime`, `retry` explicit for critical queries.

## 4. Mutations
- Mutations own optimistic update/rollback logic when applicable.
- Use targeted invalidation (exact keys), not global invalidation.
- Map backend validation/business errors into typed UI-friendly shape.

## 5. Pagination and Infinite Data
- Prefer cursor-based pagination for large datasets.
- Keep pagination/filter state in URL or dedicated table state, not hidden local globals.

## 6. Cancellation and Race Safety
- Use request cancellation (`AbortSignal`) where supported.
- Prevent stale mutation responses from overriding fresh state.

## 7. Forbidden
- `fetch` directly in component body
- Query keys missing filter context
- Blind `invalidateQueries()` without scope
